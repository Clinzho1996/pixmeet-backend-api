"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = require("mongoose");
const otpSchema = new mongoose_1.Schema({
    code: String,
    expiresAt: Date,
}, { _id: false });
const resetSchema = new mongoose_1.Schema({
    code: String,
    expiresAt: Date,
}, { _id: false });
const userSchema = new mongoose_1.Schema({
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
        type: mongoose_1.Schema.Types.ObjectId,
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
}, { timestamps: true });
/**
 * ✅ IMPORTANT FIX
 * Prevents OverwriteModelError during hot reload
 */
exports.User = mongoose_1.models.User || (0, mongoose_1.model)("User", userSchema);
