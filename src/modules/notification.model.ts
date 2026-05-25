import { Schema, model } from "mongoose";

const notificationSchema = new Schema(
	{
		user: { type: Schema.Types.ObjectId, ref: "User" },

		title: String,
		message: String,

		type: {
			type: String,
			enum: ["challenge", "vote", "wallet", "system"],
		},

		isRead: { type: Boolean, default: false },
	},
	{ timestamps: true },
);

export const Notification = model("Notification", notificationSchema);
