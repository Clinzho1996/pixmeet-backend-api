"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Creator = void 0;
const mongoose_1 = require("mongoose");
const creatorSchema = new mongoose_1.Schema({
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", unique: true },
    isVerified: { type: Boolean, default: false },
    totalChallenges: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
}, { timestamps: true });
exports.Creator = (0, mongoose_1.model)("Creator", creatorSchema);
