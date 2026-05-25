import { model, models, Schema, Types } from "mongoose";

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
			type: Types.ObjectId,
			ref: "Wallet",
		},

		stats: {
			wins: { type: Number, default: 0 },
			losses: { type: Number, default: 0 },
			challenges: { type: Number, default: 0 },
		},

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
