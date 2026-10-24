// src/modules/wallet.model.ts
import { Schema, model } from "mongoose";

const walletSchema = new Schema(
	{
		user: { type: Schema.Types.ObjectId, ref: "User", unique: true },
		balance: { type: Number, default: 0 }, // fiat (naira) — withdrawable
		coins: { type: Number, default: 0 }, // game currency

		// Paystack
		subaccountCode: { type: String }, // ACCT_xxx from POST /subaccount
		bankAccountNumber: { type: String },
		bankCode: { type: String },
		bankName: { type: String },
		accountName: { type: String },
	},
	{ timestamps: true },
);

export const Wallet = model("Wallet", walletSchema);
