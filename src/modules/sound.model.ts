import { Schema, model } from "mongoose";

const soundSchema = new Schema(
	{
		title: String,
		by: String,
		url: String,

		downloads: { type: Number, default: 0 },
	},
	{ timestamps: true },
);

export const Sound = model("Sound", soundSchema);
