"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.debitCoins = exports.creditCoins = exports.ensureWallet = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const transaction_model_1 = require("../modules/transaction.model");
const wallet_model_1 = require("../modules/wallet.model");
/**
 * ENSURE WALLET EXISTS (ATOMIC SAFE)
 */
const ensureWallet = async (userId) => {
    let wallet = await wallet_model_1.Wallet.findOne({ user: userId });
    if (!wallet) {
        wallet = await wallet_model_1.Wallet.create({
            user: userId,
            coins: 0,
            balance: 0,
        });
    }
    return wallet;
};
exports.ensureWallet = ensureWallet;
/**
 * ATOMIC CREDIT
 */
const creditCoins = async (userId, amount, reason, reference) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const wallet = await wallet_model_1.Wallet.findOneAndUpdate({ user: userId }, { $inc: { coins: amount } }, { new: true, session, upsert: true });
        await transaction_model_1.Transaction.create([
            {
                user: userId,
                type: "credit",
                amount,
                reason,
                reference,
            },
        ], { session });
        await session.commitTransaction();
        return wallet;
    }
    catch (err) {
        await session.abortTransaction();
        throw err;
    }
    finally {
        session.endSession();
    }
};
exports.creditCoins = creditCoins;
/**
 * ATOMIC DEBIT (NO RACE CONDITIONS)
 */
const debitCoins = async (userId, amount, reason, reference) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const wallet = await wallet_model_1.Wallet.findOne({ user: userId }).session(session);
        if (!wallet || wallet.coins < amount) {
            throw new Error("Insufficient balance");
        }
        wallet.coins -= amount;
        await wallet.save({ session });
        await transaction_model_1.Transaction.create([
            {
                user: userId,
                type: "debit",
                amount,
                reason,
                reference,
            },
        ], { session });
        await session.commitTransaction();
        return wallet;
    }
    catch (err) {
        await session.abortTransaction();
        throw err;
    }
    finally {
        session.endSession();
    }
};
exports.debitCoins = debitCoins;
