"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const challenge_controller_1 = require("../controllers/challenge.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
/**
 * CREATE CHALLENGE
 */
router.post("/", auth_middleware_1.authMiddleware, challenge_controller_1.createChallenge);
/**
 * JOIN WAITLIST CHALLENGE
 */
router.post("/join-waitlist", auth_middleware_1.authMiddleware, challenge_controller_1.joinWaitlist);
/**
 * UPLOAD VIDEO (both challengers)
 */
router.post("/upload-video", auth_middleware_1.authMiddleware, challenge_controller_1.uploadVideo);
/**
 * VOTE
 */
router.post("/vote", auth_middleware_1.authMiddleware, challenge_controller_1.vote);
exports.default = router;
