import { Schema, model } from "mongoose";

const otpSchema = new Schema(
	{
		code: String,
		expiresAt: Date,
	},
	{ _id: false },
);

const resetSchema = new Schema(
	{
		code: String,
		expiresAt: Date,
	},
	{ _id: false },
);

const userSchema = new Schema(
	{
		email: { type: String, unique: true, required: true },
		password: { type: String, required: true, select: false },

		isVerified: { type: Boolean, default: false },

		role: {
			type: String,
			enum: ["user", "creator", "admin"],
			default: "user",
		},

		otp: otpSchema,
		resetPassword: resetSchema,

		lastLogin: Date,
		isSuspended: { type: Boolean, default: false },
	},
	{ timestamps: true },
);

export const User = model("User", userSchema);
