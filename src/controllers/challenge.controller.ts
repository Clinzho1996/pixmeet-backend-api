import { Response } from "express";
import {
	createChallengeService,
	joinWaitlistService,
	uploadVideoService,
	voteService,
} from "../services/challenge.service";

/**
 * CREATE CHALLENGE
 */
export const createChallenge = async (req: any, res: Response) => {
	const challenge = await createChallengeService(req.user.userId, req.body);

	res.json(challenge);
};

/**
 * JOIN WAITLIST
 */
export const joinWaitlist = async (req: any, res: Response) => {
	const challenge = await joinWaitlistService(
		req.user.userId,
		req.body.challengeId,
	);

	res.json(challenge);
};

/**
 * UPLOAD VIDEO
 */
export const uploadVideo = async (req: any, res: Response) => {
	const challenge = await uploadVideoService(
		req.user.userId,
		req.body.meetId,
		req.body.videoUrl,
	);

	res.json(challenge);
};

/**
 * VOTE
 */
export const vote = async (req: any, res: Response) => {
	const challenge = await voteService(
		req.user.userId,
		req.body.challengeId,
		req.body.side,
	);

	res.json({ success: true, challenge });
};
