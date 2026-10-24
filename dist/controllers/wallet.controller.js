"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTransactions = exports.getWallet = void 0;
const transaction_model_1 = require("../modules/transaction.model");
const wallet_service_1 = require("../services/wallet.service");
const getWallet = async (req, res) => {
    const wallet = await (0, wallet_service_1.ensureWallet)(req.user.userId);
    res.json(wallet);
};
exports.getWallet = getWallet;
const getTransactions = async (req, res) => {
    const tx = await transaction_model_1.Transaction.find({ user: req.user.userId });
    res.json(tx);
};
exports.getTransactions = getTransactions;
