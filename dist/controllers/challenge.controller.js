"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vote = exports.uploadVideo = exports.joinWaitlist = exports.createChallenge = void 0;
const challenge_service_1 = require("../services/challenge.service");
/**
 * CREATE CHALLENGE
 */
const createChallenge = async (req, res) => {
    const challenge = await (0, challenge_service_1.createChallengeService)(req.user.userId, req.body);
    res.json(challenge);
};
exports.createChallenge = createChallenge;
/**
 * JOIN WAITLIST
 */
const joinWaitlist = async (req, res) => {
    const challenge = await (0, challenge_service_1.joinWaitlistService)(req.user.userId, req.body.challengeId);
    res.json(challenge);
};
exports.joinWaitlist = joinWaitlist;
/**
 * UPLOAD VIDEO
 */
const uploadVideo = async (req, res) => {
    const challenge = await (0, challenge_service_1.uploadVideoService)(req.user.userId, req.body.meetId, req.body.videoUrl);
    res.json(challenge);
};
exports.uploadVideo = uploadVideo;
/**
 * VOTE
 */
const vote = async (req, res) => {
    const challenge = await (0, challenge_service_1.voteService)(req.user.userId, req.body.challengeId, req.body.side);
    res.json({ success: true, challenge });
};
exports.vote = vote;
