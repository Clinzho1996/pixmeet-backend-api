import mongoose from "mongoose";
import { Transaction } from "../modules/transaction.model";
import { Wallet } from "../modules/wallet.model";
// src/services/wallet.service.ts — add these alongside existing creditCoins/debitCoins

/* CREDIT FIAT BALANCE (from top-up webhook) */
export const creditBalance = async (
	userId: string,
	amountNaira: number,
	reference: string,
) => {
	const wallet = await Wallet.findOneAndUpdate(
		{ user: userId },
		{ $inc: { balance: amountNaira } },
		{ new: true, upsert: true },
	);
	await Transaction.create({
		user: userId,
		type: "credit",
		amount: amountNaira,
		reason: "topup",
		reference,
	});
	return wallet;
};

/* DEBIT FIAT BALANCE (before initiating withdrawal) */
export const debitBalance = async (
	userId: string,
	amountNaira: number,
	reference: string,
) => {
	const wallet = await Wallet.findOne({ user: userId });
	if (!wallet || wallet.balance < amountNaira) {
		throw new Error("Insufficient balance");
	}
	wallet.balance -= amountNaira;
	await wallet.save();
	await Transaction.create({
		user: userId,
		type: "debit",
		amount: amountNaira,
		reason: "withdrawal",
		reference,
	});
	return wallet;
};

/**
 * ENSURE WALLET EXISTS (ATOMIC SAFE)
 */
export const ensureWallet = async (userId: string) => {
	let wallet = await Wallet.findOne({ user: userId });

	if (!wallet) {
		wallet = await Wallet.create({
			user: userId,
			coins: 0,
			balance: 0,
		});
	}

	return wallet;
};

/**
 * ATOMIC CREDIT
 */
export const creditCoins = async (
	userId: string,
	amount: number,
	reason: string,
	reference?: string,
) => {
	const session = await mongoose.startSession();
	session.startTransaction();

	try {
		const wallet = await Wallet.findOneAndUpdate(
			{ user: userId },
			{ $inc: { coins: amount } },
			{ new: true, session, upsert: true },
		);

		await Transaction.create(
			[
				{
					user: userId,
					type: "credit",
					amount,
					reason,
					reference,
				},
			],
			{ session },
		);

		await session.commitTransaction();
		return wallet;
	} catch (err) {
		await session.abortTransaction();
		throw err;
	} finally {
		session.endSession();
	}
};

/**
 * ATOMIC DEBIT (NO RACE CONDITIONS)
 */
export const debitCoins = async (
	userId: string,
	amount: number,
	reason: string,
	reference?: string,
) => {
	const session = await mongoose.startSession();
	session.startTransaction();

	try {
		const wallet = await Wallet.findOne({ user: userId }).session(session);

		if (!wallet || wallet.coins < amount) {
			throw new Error("Insufficient balance");
		}

		wallet.coins -= amount;
		await wallet.save({ session });

		await Transaction.create(
			[
				{
					user: userId,
					type: "debit",
					amount,
					reason,
					reference,
				},
			],
			{ session },
		);

		await session.commitTransaction();
		return wallet;
	} catch (err) {
		await session.abortTransaction();
		throw err;
	} finally {
		session.endSession();
	}
};
