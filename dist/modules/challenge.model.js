"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Challenge = void 0;
const mongoose_1 = require("mongoose");
const challengeSchema = new mongoose_1.Schema({
    meetId: { type: String, unique: true },
    creator: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
    challengerA: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
    challengerB: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
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
    winner: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });
exports.Challenge = (0, mongoose_1.model)("Challenge", challengeSchema);
