import { Response } from "express";
import { Challenge } from "../modules/challenge.model";
import {
	ChallengeError,
	createChallengeService,
	getChallengeByIdService,
	getChallengeByMeetIdService,
	getMyChallengesService,
	joinWaitlistService,
	uploadVideoService,
	voteService,
} from "../services/challenge.service";

const handle = async (
	res: Response,
	fn: () => Promise<unknown>,
	successStatus = 200,
	context = "challenge",
) => {
	try {
		const result = await fn();
		return res.status(successStatus).json(result);
	} catch (err) {
		if (err instanceof ChallengeError) {
			return res.status(err.status).json({ message: err.message });
		}
		console.error(`[challenge.${context}]`, err);
		return res.status(500).json({ message: "Something went wrong" });
	}
};

/* ----------------------- CREATE ----------------------- */
export const createChallenge = async (req: any, res: Response) => {
	return handle(
		res,
		() => createChallengeService(req.user.userId, req.body),
		201,
		"create",
	);
};

/* ----------------------- JOIN WAITLIST ----------------------- */
export const joinWaitlist = async (req: any, res: Response) => {
	return handle(
		res,
		() => joinWaitlistService(req.user.userId, req.body?.challengeId),
		200,
		"joinWaitlist",
	);
};

/* ----------------------- UPLOAD VIDEO ----------------------- */
export const uploadVideo = async (req: any, res: Response) => {
	return handle(
		res,
		() =>
			uploadVideoService(req.user.userId, req.body?.meetId, req.body?.videoUrl),
		200,
		"uploadVideo",
	);
};

export const listChallenges = async (req: any, res: Response) => {
	return handle(
		res,
		async () => {
			const { status } = req.query;
			const filter: Record<string, any> = {};
			if (typeof status === "string") filter.status = status;
			return Challenge.find(filter)
				.sort({ createdAt: -1 })
				.limit(50)
				.populate("creator", "profile.fullName email")
				.populate("challengerA", "profile.fullName email")
				.populate("challengerB", "profile.fullName email")
				.lean();
		},
		200,
		"listChallenges",
	);
};
/* ----------------------- VOTE ----------------------- */
export const vote = async (req: any, res: Response) => {
	return handle(
		res,
		async () => {
			const challenge = await voteService(
				req.user.userId,
				req.body?.challengeId,
				req.body?.side,
			);
			return { success: true, challenge };
		},
		200,
		"vote",
	);
};

/* ----------------------- GET MINE (NEW) ----------------------- */
export const getMyChallenges = async (req: any, res: Response) => {
	return handle(
		res,
		() => getMyChallengesService(req.user.userId),
		200,
		"getMyChallenges",
	);
};

/* ----------------------- GET BY ID (NEW) ----------------------- */
export const getChallengeById = async (req: any, res: Response) => {
	return handle(
		res,
		() => getChallengeByIdService(req.params.id),
		200,
		"getChallengeById",
	);
};

/* ----------------------- GET BY MEET ID (NEW) ----------------------- */
export const getChallengeByMeetId = async (req: any, res: Response) => {
	return handle(
		res,
		() => getChallengeByMeetIdService(req.params.meetId),
		200,
		"getChallengeByMeetId",
	);
};
