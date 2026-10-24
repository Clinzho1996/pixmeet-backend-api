// src/services/challenge.service.ts
import dayjs from "dayjs";
import mongoose from "mongoose";
import { v4 as uuid } from "uuid";
import { Challenge } from "../modules/challenge.model";
import { debitCoins } from "./wallet.service";

export class ChallengeError extends Error {
	constructor(
		message: string,
		public status: number = 400,
	) {
		super(message);
		this.name = "ChallengeError";
	}
}

interface CreateChallengeInput {
	entryFee: number;
	category: "auto" | "dance" | "music" | "comedy" | "other";
	title: string;
	description: string;
	durationHours: number;
	sound: { name: string; by: string; url: string };
	image?: string; // ← NEW
}

export const createChallengeService = async (
	userId: string,
	payload: CreateChallengeInput,
) => {
	const {
		entryFee,
		category,
		title,
		description,
		sound,
		durationHours,
		image,
	} = payload ?? {};

	if (typeof entryFee !== "number" || entryFee < 0) {
		throw new ChallengeError("entryFee must be a non-negative number", 400);
	}
	if (!["auto", "dance", "music", "comedy", "other"].includes(category)) {
		throw new ChallengeError("Invalid category", 400);
	}
	if (!title || typeof title !== "string") {
		throw new ChallengeError("Title is required", 400);
	}
	if (!description || typeof description !== "string") {
		throw new ChallengeError("Description is required", 400);
	}
	if (typeof durationHours !== "number" || durationHours <= 0) {
		throw new ChallengeError("durationHours must be a positive number", 400);
	}
	if (
		!sound ||
		typeof sound.name !== "string" ||
		typeof sound.by !== "string" ||
		typeof sound.url !== "string"
	) {
		throw new ChallengeError("Sound { name, by, url } is required", 400);
	}

	const session = await mongoose.startSession();
	session.startTransaction();
	try {
		await debitCoins(userId, entryFee, "challenge_entry");

		const [challenge] = await Challenge.create(
			[
				{
					meetId: uuid(),
					creator: userId,
					challengerA: userId,
					entryFee,
					category,
					status: category === "auto" ? "live" : "waitlist",
					title,
					description,
					image, // ← NEW
					sound,
					timeLeftEndsAt: dayjs().add(durationHours, "hour").toDate(),
				},
			],
			{ session },
		);

		await session.commitTransaction();
		return challenge;
	} catch (err) {
		await session.abortTransaction();
		throw err;
	} finally {
		session.endSession();
	}
};

/* ---- Existing services unchanged ---- */
export const joinWaitlistService = async (
	userId: string,
	challengeId: string,
) => {
	if (!challengeId || !mongoose.isValidObjectId(challengeId)) {
		throw new ChallengeError("Invalid challengeId", 400);
	}
	const session = await mongoose.startSession();
	session.startTransaction();
	try {
		const challenge: any =
			await Challenge.findById(challengeId).session(session);
		if (!challenge) throw new ChallengeError("Challenge not found", 404);
		if (challenge.status !== "waitlist")
			throw new ChallengeError("Challenge is no longer open", 409);
		if (challenge.challengerB)
			throw new ChallengeError("Challenge slot already taken", 409);
		if (challenge.challengerA?.toString() === userId) {
			throw new ChallengeError("You cannot join your own challenge", 400);
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

export const uploadVideoService = async (
	userId: string,
	meetId: string,
	videoUrl: string,
) => {
	if (!meetId || typeof meetId !== "string")
		throw new ChallengeError("meetId is required", 400);
	if (!videoUrl || typeof videoUrl !== "string")
		throw new ChallengeError("videoUrl is required", 400);
	const challenge = await Challenge.findOne({ meetId });
	if (!challenge) throw new ChallengeError("Challenge not found", 404);
	if (challenge.status !== "live")
		throw new ChallengeError("Challenge is not live", 409);
	if (challenge.challengerA?.toString() === userId) challenge.videoA = videoUrl;
	else if (challenge.challengerB?.toString() === userId)
		challenge.videoB = videoUrl;
	else throw new ChallengeError("You are not a participant", 403);
	await challenge.save();
	return challenge;
};

export const voteService = async (
	userId: string,
	challengeId: string,
	side: "A" | "B",
) => {
	if (!challengeId || !mongoose.isValidObjectId(challengeId))
		throw new ChallengeError("Invalid challengeId", 400);
	if (side !== "A" && side !== "B")
		throw new ChallengeError("side must be 'A' or 'B'", 400);
	const challenge = await Challenge.findById(challengeId);
	if (!challenge) throw new ChallengeError("Challenge not found", 404);
	if (challenge.status !== "live")
		throw new ChallengeError("Voting is closed", 409);
	if (
		(side === "A" && challenge.challengerA?.toString() === userId) ||
		(side === "B" && challenge.challengerB?.toString() === userId)
	) {
		throw new ChallengeError("You cannot vote for yourself", 403);
	}
	if (side === "A") challenge.votesA += 1;
	else challenge.votesB += 1;
	await challenge.save();
	return challenge;
};

export const getMyChallengesService = async (userId: string) => {
	return Challenge.find({
		$or: [
			{ creator: userId },
			{ challengerA: userId },
			{ challengerB: userId },
		],
	})
		.sort({ createdAt: -1 })
		.populate("creator", "profile.fullName email")
		.populate("challengerA", "profile.fullName email")
		.populate("challengerB", "profile.fullName email")
		.lean();
};

export const getChallengeByMeetIdService = async (meetId: string) => {
	if (!meetId) throw new ChallengeError("meetId is required", 400);
	const challenge = await Challenge.findOne({ meetId })
		.populate("creator", "profile.fullName email")
		.populate("challengerA", "profile.fullName email")
		.populate("challengerB", "profile.fullName email")
		.lean();
	if (!challenge) throw new ChallengeError("Challenge not found", 404);
	return challenge;
};

export const getChallengeByIdService = async (challengeId: string) => {
	if (!challengeId || !mongoose.isValidObjectId(challengeId)) {
		throw new ChallengeError("Invalid challengeId", 400);
	}
	const challenge = await Challenge.findById(challengeId)
		.populate("creator", "profile.fullName email")
		.populate("challengerA", "profile.fullName email")
		.populate("challengerB", "profile.fullName email")
		.lean();
	if (!challenge) throw new ChallengeError("Challenge not found", 404);
	return challenge;
};

export const listChallengesService = async (status?: string) => {
	const filter: Record<string, any> = {};
	if (typeof status === "string") filter.status = status;
	return Challenge.find(filter)
		.sort({ createdAt: -1 })
		.limit(50)
		.populate("creator", "profile.fullName email")
		.populate("challengerA", "profile.fullName email")
		.populate("challengerB", "profile.fullName email")
		.lean();
};
