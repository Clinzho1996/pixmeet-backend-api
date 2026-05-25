import { Router } from "express";

import {
	createChallenge,
	joinWaitlist,
	uploadVideo,
	vote,
} from "../controllers/challenge.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

/**
 * CREATE CHALLENGE
 */
router.post("/", authMiddleware, createChallenge);

/**
 * JOIN WAITLIST CHALLENGE
 */
router.post("/join-waitlist", authMiddleware, joinWaitlist);

/**
 * UPLOAD VIDEO (both challengers)
 */
router.post("/upload-video", authMiddleware, uploadVideo);

/**
 * VOTE
 */
router.post("/vote", authMiddleware, vote);

export default router;
