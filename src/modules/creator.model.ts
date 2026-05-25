import { Schema, model } from "mongoose";

const creatorSchema = new Schema(
	{
		user: { type: Schema.Types.ObjectId, ref: "User", unique: true },

		isVerified: { type: Boolean, default: false },

		totalChallenges: { type: Number, default: 0 },

		totalEarnings: { type: Number, default: 0 },
	},
	{ timestamps: true },
);

export const Creator = model("Creator", creatorSchema);
