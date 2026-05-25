import { Schema, model } from "mongoose";

const walletSchema = new Schema(
	{
		user: { type: Schema.Types.ObjectId, ref: "User", unique: true },

		balance: { type: Number, default: 0 }, // fiat (naira)
		coins: { type: Number, default: 0 }, // game currency
	},
	{ timestamps: true },
);

export const Wallet = model("Wallet", walletSchema);
