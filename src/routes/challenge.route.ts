import { Router } from "express";
import {
	createChallenge,
	getChallengeById,
	getChallengeByMeetId,
	getMyChallenges,
	joinWaitlist,
	uploadVideo,
	vote,
} from "../controllers/challenge.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

/** POST /api/challenge — create */
router.post("/", authMiddleware, createChallenge);

/** GET /api/challenge/me — list my challenges */
router.get("/me", authMiddleware, getMyChallenges);

/** GET /api/challenge/meet/:meetId — resolve meetId → challenge */
router.get("/meet/:meetId", authMiddleware, getChallengeByMeetId);

/** GET /api/challenge/:id — fetch one */
router.get("/:id", authMiddleware, getChallengeById);

/** POST /api/challenge/join-waitlist */
router.post("/join-waitlist", authMiddleware, joinWaitlist);

/** POST /api/challenge/upload-video */
router.post("/upload-video", authMiddleware, uploadVideo);

/** POST /api/challenge/vote */
router.post("/vote", authMiddleware, vote);

export default router;
