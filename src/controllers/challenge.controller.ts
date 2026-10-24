// src/controllers/challenge.controller.ts
import { Response } from "express";
import {
	ChallengeError,
	createChallengeService,
	getChallengeByIdService,
	getChallengeByMeetIdService,
	getMyChallengesService,
	joinWaitlistService,
	listChallengesService,
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

export const createChallenge = async (req: any, res: Response) => {
	return handle(
		res,
		() => createChallengeService(req.user.userId, req.body),
		201,
		"create",
	);
};

export const joinWaitlist = async (req: any, res: Response) => {
	return handle(
		res,
		() => joinWaitlistService(req.user.userId, req.body?.challengeId),
		200,
		"joinWaitlist",
	);
};

export const uploadVideo = async (req: any, res: Response) => {
	return handle(
		res,
		() =>
			uploadVideoService(req.user.userId, req.body?.meetId, req.body?.videoUrl),
		200,
		"uploadVideo",
	);
};

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

export const getMyChallenges = async (req: any, res: Response) => {
	return handle(
		res,
		() => getMyChallengesService(req.user.userId),
		200,
		"getMyChallenges",
	);
};

export const getChallengeById = async (req: any, res: Response) => {
	return handle(
		res,
		() => getChallengeByIdService(req.params.id),
		200,
		"getChallengeById",
	);
};

export const getChallengeByMeetId = async (req: any, res: Response) => {
	return handle(
		res,
		() => getChallengeByMeetIdService(req.params.meetId),
		200,
		"getChallengeByMeetId",
	);
};

export const listChallenges = async (req: any, res: Response) => {
	return handle(
		res,
		() => listChallengesService(req.query.status as string | undefined),
		200,
		"listChallenges",
	);
};
