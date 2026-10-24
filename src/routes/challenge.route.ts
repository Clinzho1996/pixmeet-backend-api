// src/routes/challenge.route.ts
import { Router } from "express";
import {
	createChallenge,
	getChallengeById,
	getChallengeByMeetId,
	getMyChallenges,
	joinWaitlist,
	listChallenges,
	uploadVideo,
	vote,
} from "../controllers/challenge.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.get("/", authMiddleware, listChallenges);
router.get("/me", authMiddleware, getMyChallenges);
router.get("/meet/:meetId", authMiddleware, getChallengeByMeetId);
router.get("/:id", authMiddleware, getChallengeById);
router.post("/", authMiddleware, createChallenge);
router.post("/join-waitlist", authMiddleware, joinWaitlist);
router.post("/upload-video", authMiddleware, uploadVideo);
router.post("/vote", authMiddleware, vote);

export default router;
