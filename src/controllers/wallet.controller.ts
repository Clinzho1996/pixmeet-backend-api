// src/controllers/wallet.controller.ts
import { Response } from "express";
import { User } from "../modules/user.model";
import { Wallet } from "../modules/wallet.model";
import {
	createSubaccount,
	createTransferRecipient,
	initializeTopup,
	initiateTransfer,
	verifyWebhookSignature,
} from "../services/paystack.service";
import {
	creditBalance,
	debitBalance,
	ensureWallet,
} from "../services/wallet.service";

export const getWallet = async (req: any, res: Response) => {
	const wallet = await ensureWallet(req.user.userId);
	res.json(wallet);
};

export const getTransactions = async (req: any, res: Response) => {
	const { Transaction } = await import("../modules/transaction.model");
	const tx = await Transaction.find({ user: req.user.userId }).sort({
		createdAt: -1,
	});
	res.json(tx);
};

/* POST /wallet/topup  { amount: number } */
export const topup = async (req: any, res: Response) => {
	try {
		const { amount } = req.body;
		if (typeof amount !== "number" || amount < 100) {
			return res.status(400).json({ message: "Minimum top-up is ₦100" });
		}
		const user = await User.findById(req.user.userId);
		const wallet = await ensureWallet(req.user.userId);

		const payment = await initializeTopup(
			user.email,
			amount,
			req.user.userId,
			wallet.subaccountCode ?? undefined,
		);
		res.json(payment);
	} catch (err: any) {
		console.error("[wallet.topup]", err?.response?.data ?? err);
		res.status(500).json({ message: "Could not initialize payment" });
	}
};

/* POST /wallet/subaccount  { bankCode, accountNumber, bankName } */
export const setupSubaccount = async (req: any, res: Response) => {
	try {
		const { bankCode, accountNumber, bankName } = req.body;
		if (!bankCode || !accountNumber) {
			return res
				.status(400)
				.json({ message: "bankCode and accountNumber are required" });
		}
		const user = await User.findById(req.user.userId);
		const wallet = await ensureWallet(req.user.userId);

		if (wallet.subaccountCode) {
			return res.status(409).json({ message: "Subaccount already exists" });
		}

		const sub = await createSubaccount({
			businessName: user.profile?.fullName || user.email,
			bankCode,
			accountNumber,
			email: user.email,
			phone: user.profile?.whatsapp,
		});

		wallet.subaccountCode = sub.subaccount_code;
		wallet.bankAccountNumber = accountNumber;
		wallet.bankCode = bankCode;
		wallet.bankName = bankName;
		await wallet.save();

		res.json({ subaccountCode: sub.subaccount_code });
	} catch (err: any) {
		console.error("[wallet.subaccount]", err?.response?.data ?? err);
		res.status(500).json({ message: "Could not create subaccount" });
	}
};

/* POST /wallet/withdraw  { amount: number } */
export const withdraw = async (req: any, res: Response) => {
	try {
		const { amount } = req.body;
		if (typeof amount !== "number" || amount < 100) {
			return res.status(400).json({ message: "Minimum withdrawal is ₦100" });
		}

		const wallet = await Wallet.findOne({ user: req.user.userId });
		if (!wallet) return res.status(404).json({ message: "Wallet not found" });
		if (
			!wallet.subaccountCode ||
			!wallet.bankAccountNumber ||
			!wallet.bankCode
		) {
			return res
				.status(400)
				.json({ message: "Set up your bank account first" });
		}
		if (wallet.balance < amount) {
			return res.status(400).json({ message: "Insufficient balance" });
		}

		const user = await User.findById(req.user.userId);
		const reference = `wd_${Date.now()}_${req.user.userId.slice(-6)}`;

		// 1. Reserve funds
		await debitBalance(req.user.userId, amount, reference);

		// 2. Create recipient + initiate transfer
		const recipient = await createTransferRecipient({
			name: user.profile?.fullName || user.email,
			accountNumber: wallet.bankAccountNumber,
			bankCode: wallet.bankCode,
		});
		const transfer = await initiateTransfer({
			amountNaira: amount,
			recipientCode: recipient.recipient_code,
			reason: "PixMeet withdrawal",
			reference,
		});

		res.json({
			reference,
			transferCode: transfer.transfer_code,
			status: transfer.status,
		});
	} catch (err: any) {
		console.error("[wallet.withdraw]", err?.response?.data ?? err);
		res.status(500).json({ message: err.message || "Withdrawal failed" });
	}
};

/* POST /wallet/webhook  (no auth — Paystack calls this) */
export const paystackWebhook = async (req: any, res: Response) => {
	const signature = req.headers["x-paystack-signature"] as string;
	if (!verifyWebhookSignature(req.rawBody, signature)) {
		return res.sendStatus(401);
	}

	// Respond immediately so Paystack doesn't retry
	res.sendStatus(200);

	const event = req.body;

	try {
		if (event.event === "charge.success") {
			const { reference, amount, metadata } = event.data;
			const userId = metadata?.userId;
			if (userId && metadata?.purpose === "wallet_topup") {
				await creditBalance(userId, amount / 100, reference);
			}
		}

		if (event.event === "transfer.success") {
			// funds already debited at initiation — just log success
			console.log("[paystack] transfer success:", event.data.reference);
		}

		if (
			event.event === "transfer.failed" ||
			event.event === "transfer.reversed"
		) {
			// refund the reserved balance
			const { reference, amount } = event.data;
			const { Transaction } = await import("../modules/transaction.model");
			const tx = await Transaction.findOne({ reference, reason: "withdrawal" });
			if (tx?.user != null) {
				await creditBalance(
					tx.user.toString(),
					amount / 100,
					`refund_${reference}`,
				);
			}
		}
	} catch (err) {
		console.error("[paystack.webhook]", err);
	}
};
