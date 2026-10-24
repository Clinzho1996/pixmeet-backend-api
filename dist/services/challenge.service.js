"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.voteService = exports.uploadVideoService = exports.joinWaitlistService = exports.createChallengeService = void 0;
const dayjs_1 = __importDefault(require("dayjs"));
const mongoose_1 = __importDefault(require("mongoose"));
const uuid_1 = require("uuid");
const challenge_model_1 = require("../modules/challenge.model");
const wallet_service_1 = require("./wallet.service");
/**
 * CREATE CHALLENGE (SAFE ATOMIC FLOW)
 */
const createChallengeService = async (userId, payload) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        await (0, wallet_service_1.debitCoins)(userId, payload.entryFee, "challenge_entry");
        const challenge = await challenge_model_1.Challenge.create([
            {
                meetId: (0, uuid_1.v4)(),
                creator: userId,
                challengerA: userId,
                entryFee: payload.entryFee,
                category: payload.category,
                status: payload.category === "auto" ? "live" : "waitlist",
                title: payload.title,
                description: payload.description,
                sound: payload.sound,
                timeLeftEndsAt: (0, dayjs_1.default)().add(payload.durationHours, "hour").toDate(),
            },
        ], { session });
        await session.commitTransaction();
        return challenge[0];
    }
    catch (err) {
        await session.abortTransaction();
        throw err;
    }
    finally {
        session.endSession();
    }
};
exports.createChallengeService = createChallengeService;
/**
 * JOIN WAITLIST (ANTI OVERSUBSCRIBE SAFE)
 */
const joinWaitlistService = async (userId, challengeId) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const challenge = await challenge_model_1.Challenge.findById(challengeId).session(session);
        if (!challenge)
            throw new Error("Not found");
        if (challenge.status !== "waitlist") {
            throw new Error("Not available");
        }
        if (challenge.challengerB) {
            throw new Error("Already filled");
        }
        await (0, wallet_service_1.debitCoins)(userId, challenge.entryFee, "challenge_entry");
        challenge.challengerB = userId;
        challenge.status = "live";
        await challenge.save({ session });
        await session.commitTransaction();
        return challenge;
    }
    catch (err) {
        await session.abortTransaction();
        throw err;
    }
    finally {
        session.endSession();
    }
};
exports.joinWaitlistService = joinWaitlistService;
/**
 * UPLOAD VIDEO (SAFE PARTICIPATION CHECK)
 */
const uploadVideoService = async (userId, meetId, videoUrl) => {
    const challenge = await challenge_model_1.Challenge.findOne({ meetId });
    if (!challenge)
        throw new Error("Invalid meetId");
    if (challenge.status !== "live") {
        throw new Error("Challenge not active");
    }
    if (challenge.challengerA?.toString() === userId) {
        challenge.videoA = videoUrl;
    }
    else if (challenge.challengerB?.toString() === userId) {
        challenge.videoB = videoUrl;
    }
    else {
        throw new Error("Not a participant");
    }
    await challenge.save();
    return challenge;
};
exports.uploadVideoService = uploadVideoService;
/**
 * VOTE SYSTEM (LOCKED TO LIVE ONLY)
 */
const voteService = async (userId, challengeId, side) => {
    const challenge = await challenge_model_1.Challenge.findById(challengeId);
    if (!challenge)
        throw new Error("Not found");
    if (challenge.status !== "live") {
        throw new Error("Voting closed");
    }
    // OPTIONAL: prevent self-voting abuse
    if ((side === "A" && challenge.challengerA?.toString() === userId) ||
        (side === "B" && challenge.challengerB?.toString() === userId)) {
        throw new Error("Cannot vote for yourself");
    }
    if (side === "A")
        challenge.votesA += 1;
    else
        challenge.votesB += 1;
    await challenge.save();
    return challenge;
};
exports.voteService = voteService;
