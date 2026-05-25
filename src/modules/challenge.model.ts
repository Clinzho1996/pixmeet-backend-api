import { model, Schema } from "mongoose";

const challengeSchema = new Schema(
	{
		meetId: { type: String, unique: true },

		creator: { type: Schema.Types.ObjectId, ref: "User" },

		challengerA: { type: Schema.Types.ObjectId, ref: "User" },
		challengerB: { type: Schema.Types.ObjectId, ref: "User" },

		status: {
			type: String,
			enum: ["pending", "waitlist", "live", "completed", "cancelled"],
			default: "pending",
		},

		category: {
			type: String,
			enum: ["auto", "waitlist"],
			required: true,
		},

		entryFee: { type: Number, required: true },

		title: String,
		description: String,

		sound: {
			name: String,
			by: String,
			url: String,
		},

		videoA: String,
		videoB: String,

		votesA: { type: Number, default: 0 },
		votesB: { type: Number, default: 0 },

		timeLeftEndsAt: Date,

		isLocked: { type: Boolean, default: false },

		winner: { type: Schema.Types.ObjectId, ref: "User" },
	},
	{ timestamps: true },
);

export const Challenge = model("Challenge", challengeSchema);
