// src/modules/challenge.model.ts
import mongoose, { Document, Schema } from "mongoose";

export interface IChallenge extends Document {
	meetId: string;
	creator: mongoose.Types.ObjectId;
	challengerA: mongoose.Types.ObjectId;
	challengerB?: mongoose.Types.ObjectId;
	status: "live" | "completed" | "pending" | "cancelled" | "waitlist";
	category: "auto" | "dance" | "music" | "comedy" | "other";
	entryFee: number;
	title: string;
	description: string;
	image?: string;
	sound: { name: string; by: string; url: string };
	videoA?: string;
	videoB?: string;
	votesA: number;
	votesB: number;
	timeLeftEndsAt: Date;
	isLocked: boolean;
}

const challengeSchema = new Schema<IChallenge>(
	{
		meetId: { type: String, required: true, unique: true },
		creator: { type: Schema.Types.ObjectId, ref: "User", required: true },
		challengerA: { type: Schema.Types.ObjectId, ref: "User", required: true },
		challengerB: { type: Schema.Types.ObjectId, ref: "User" },
		status: {
			type: String,
			enum: ["live", "completed", "pending", "cancelled", "waitlist"],
			default: "waitlist",
		},
		category: {
			type: String,
			enum: ["auto", "dance", "music", "comedy", "other"],
			default: "auto",
		},
		entryFee: { type: Number, required: true, min: 0 },
		title: { type: String, required: true },
		description: { type: String, required: true },
		image: { type: String }, // ← NEW
		sound: {
			name: { type: String, required: true },
			by: { type: String, required: true },
			url: { type: String, required: true },
		},
		videoA: String,
		videoB: String,
		votesA: { type: Number, default: 0 },
		votesB: { type: Number, default: 0 },
		timeLeftEndsAt: { type: Date, required: true },
		isLocked: { type: Boolean, default: false },
	},
	{ timestamps: true },
);

export const Challenge = mongoose.model<IChallenge>(
	"Challenge",
	challengeSchema,
);
