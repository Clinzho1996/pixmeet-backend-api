import dayjs from "dayjs";
import mongoose from "mongoose";
import { v4 as uuid } from "uuid";

import { Challenge } from "../modules/challenge.model";
import { debitCoins } from "./wallet.service";

/**
 * CREATE CHALLENGE (SAFE ATOMIC FLOW)
 */
export const createChallengeService = async (userId: string, payload: any) => {
	const session = await mongoose.startSession();
	session.startTransaction();

	try {
		await debitCoins(userId, payload.entryFee, "challenge_entry");

		const challenge = await Challenge.create(
			[
				{
					meetId: uuid(),
					creator: userId,
					challengerA: userId,
					entryFee: payload.entryFee,
					category: payload.category,
					status: payload.category === "auto" ? "live" : "waitlist",
					title: payload.title,
					description: payload.description,
					sound: payload.sound,
					timeLeftEndsAt: dayjs().add(payload.durationHours, "hour").toDate(),
				},
			],
			{ session },
		);

		await session.commitTransaction();
		return challenge[0];
	} catch (err) {
		await session.abortTransaction();
		throw err;
	} finally {
		session.endSession();
	}
};

/**
 * JOIN WAITLIST (ANTI OVERSUBSCRIBE SAFE)
 */
export const joinWaitlistService = async (
	userId: string,
	challengeId: string,
) => {
	const session = await mongoose.startSession();
	session.startTransaction();

	try {
		const challenge: any =
			await Challenge.findById(challengeId).session(session);

		if (!challenge) throw new Error("Not found");

		if (challenge.status !== "waitlist") {
			throw new Error("Not available");
		}

		if (challenge.challengerB) {
			throw new Error("Already filled");
		}

		await debitCoins(userId, challenge.entryFee, "challenge_entry");

		challenge.challengerB = userId;
		challenge.status = "live";

		await challenge.save({ session });

		await session.commitTransaction();
		return challenge;
	} catch (err) {
		await session.abortTransaction();
		throw err;
	} finally {
		session.endSession();
	}
};

/**
 * UPLOAD VIDEO (SAFE PARTICIPATION CHECK)
 */
export const uploadVideoService = async (
	userId: string,
	meetId: string,
	videoUrl: string,
) => {
	const challenge = await Challenge.findOne({ meetId });

	if (!challenge) throw new Error("Invalid meetId");

	if (challenge.status !== "live") {
		throw new Error("Challenge not active");
	}

	if (challenge.challengerA?.toString() === userId) {
		challenge.videoA = videoUrl;
	} else if (challenge.challengerB?.toString() === userId) {
		challenge.videoB = videoUrl;
	} else {
		throw new Error("Not a participant");
	}

	await challenge.save();
	return challenge;
};

/**
 * VOTE SYSTEM (LOCKED TO LIVE ONLY)
 */
export const voteService = async (
	userId: string,
	challengeId: string,
	side: "A" | "B",
) => {
	const challenge = await Challenge.findById(challengeId);

	if (!challenge) throw new Error("Not found");

	if (challenge.status !== "live") {
		throw new Error("Voting closed");
	}

	// OPTIONAL: prevent self-voting abuse
	if (
		(side === "A" && challenge.challengerA?.toString() === userId) ||
		(side === "B" && challenge.challengerB?.toString() === userId)
	) {
		throw new Error("Cannot vote for yourself");
	}

	if (side === "A") challenge.votesA += 1;
	else challenge.votesB += 1;

	await challenge.save();
	return challenge;
};
