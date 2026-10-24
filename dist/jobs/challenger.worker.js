"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bullmq_1 = require("bullmq");
const mongoose_1 = __importDefault(require("mongoose"));
const redis_1 = require("../config/redis");
const challenge_model_1 = require("../modules/challenge.model");
const notification_model_1 = require("../modules/notification.model");
const wallet_service_1 = require("../services/wallet.service");
new bullmq_1.Worker("challenge", async (job) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const challenge = await challenge_model_1.Challenge.findById(job.data.id).session(session);
        if (!challenge)
            return;
        // 🚨 IDENTITY GUARD (prevent double execution)
        if (challenge.status === "completed")
            return;
        // 🚨 MUST HAVE BOTH PLAYERS
        if (!challenge.challengerA || !challenge.challengerB) {
            challenge.status = "cancelled";
            await challenge.save({ session });
            await session.commitTransaction();
            return;
        }
        // 🧠 WINNER LOGIC
        let winner;
        if (challenge.votesA === challenge.votesB) {
            // tie rule → creator wins (or you can randomize)
            winner = challenge.challengerA;
        }
        else {
            winner =
                challenge.votesA > challenge.votesB
                    ? challenge.challengerA
                    : challenge.challengerB;
        }
        // 💰 PAYOUT CALCULATION
        const totalPool = challenge.entryFee * 2;
        const commission = totalPool * 0.1;
        const payout = totalPool - commission;
        // 🔐 CREDIT WINNER WALLET
        await (0, wallet_service_1.creditCoins)(winner.toString(), payout, "challenge_win");
        // 📊 UPDATE STATS
        challenge.status = "completed";
        challenge.winner = winner;
        await challenge.save({ session });
        // 🔔 NOTIFY WINNER
        await notification_model_1.Notification.create({
            user: winner,
            title: "You won the challenge 🎉",
            message: `You earned ${payout} coins from meet ${challenge.meetId}`,
            type: "challenge",
        });
        await session.commitTransaction();
    }
    catch (err) {
        await session.abortTransaction();
        console.error("Challenge worker error:", err);
    }
    finally {
        session.endSession();
    }
}, {
    connection: redis_1.redis,
    concurrency: 5,
});
