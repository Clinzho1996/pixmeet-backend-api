import { Response } from "express";
import { Transaction } from "../modules/transaction.model";
import { ensureWallet } from "../services/wallet.service";

export const getWallet = async (req: any, res: Response) => {
	const wallet = await ensureWallet(req.user.userId);
	res.json(wallet);
};

export const getTransactions = async (req: any, res: Response) => {
	const tx = await Transaction.find({ user: req.user.userId });
	res.json(tx);
};
