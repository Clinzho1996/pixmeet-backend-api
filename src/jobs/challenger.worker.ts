import { Worker } from "bullmq";
import mongoose from "mongoose";
import { redis } from "../config/redis";
import { Challenge } from "../modules/challenge.model";
import { Notification } from "../modules/notification.model";
import { creditCoins } from "../services/wallet.service";

new Worker(
	"challenge",
	async (job) => {
		const session = await mongoose.startSession();
		session.startTransaction();

		try {
			const challenge = await Challenge.findById(job.data.id).session(session);

			if (!challenge) return;

			// 🚨 IDENTITY GUARD (prevent double execution)
			if (challenge.status === "completed") return;

			// 🚨 MUST HAVE BOTH PLAYERS
			if (!challenge.challengerA || !challenge.challengerB) {
				challenge.status = "cancelled";
				await challenge.save({ session });
				await session.commitTransaction();
				return;
			}

			// 🧠 WINNER LOGIC
			let winner: any;

			if (challenge.votesA === challenge.votesB) {
				// tie rule → creator wins (or you can randomize)
				winner = challenge.challengerA;
			} else {
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
			await creditCoins(winner.toString(), payout, "challenge_win");

			// 📊 UPDATE STATS
			challenge.status = "completed";
			challenge.winner = winner;
			await challenge.save({ session });

			// 🔔 NOTIFY WINNER
			await Notification.create({
				user: winner,
				title: "You won the challenge 🎉",
				message: `You earned ${payout} coins from meet ${challenge.meetId}`,
				type: "challenge",
			});

			await session.commitTransaction();
		} catch (err) {
			await session.abortTransaction();
			console.error("Challenge worker error:", err);
		} finally {
			session.endSession();
		}
	},
	{
		connection: redis,
		concurrency: 5,
	},
);
