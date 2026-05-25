import { model, models, Schema } from "mongoose";

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

		profile: {
			fullName: String,
			nickname: { type: String, unique: true, sparse: true },
			gender: { type: String, enum: ["male", "female", "other"] },
			dateOfBirth: Date,
			whatsapp: String,
			bio: { type: String, maxlength: 300 },
			profileImage: String,
		},

		wallet: {
			type: Schema.Types.ObjectId,
			ref: "Wallet",
			required: false,
		},

		stats: {
			wins: { type: Number, default: 0 },
			losses: { type: Number, default: 0 },
			challenges: { type: Number, default: 0 },
		},

		otp: otpSchema,
		resetPassword: resetSchema,

		isSuspended: { type: Boolean, default: false },

		lastLogin: Date,
		profileCompleted: { type: Boolean, default: false },
	},
	{ timestamps: true },
);

/**
 * ✅ IMPORTANT FIX
 * Prevents OverwriteModelError during hot reload
 */
export const User = models.User || model("User", userSchema);
