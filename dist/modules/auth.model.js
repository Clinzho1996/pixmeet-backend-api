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
    otp: otpSchema,
    resetPassword: resetSchema,
    lastLogin: Date,
    isSuspended: { type: Boolean, default: false },
}, { timestamps: true });
exports.User = (0, mongoose_1.model)("User", userSchema);
