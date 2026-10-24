"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transaction = void 0;
const mongoose_1 = require("mongoose");
const transactionSchema = new mongoose_1.Schema({
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
    type: { type: String, enum: ["credit", "debit"] },
    amount: Number,
    reason: {
        type: String,
        enum: [
            "topup",
            "challenge_entry",
            "challenge_win",
            "withdrawal",
            "refund",
        ],
    },
    reference: String,
}, { timestamps: true });
exports.Transaction = (0, mongoose_1.model)("Transaction", transactionSchema);
