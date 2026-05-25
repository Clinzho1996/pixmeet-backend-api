import { Schema, model } from "mongoose";

const transactionSchema = new Schema(
	{
		user: { type: Schema.Types.ObjectId, ref: "User" },

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
	},
	{ timestamps: true },
);

export const Transaction = model("Transaction", transactionSchema);
