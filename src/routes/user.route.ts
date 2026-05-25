import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";

import {
	changePassword,
	getMe,
	updateProfile,
} from "../controllers/user.controller";

const router = Router();

/**
 * GET CURRENT USER PROFILE
 */
router.get("/me", authMiddleware, getMe);

/**
 * UPDATE PROFILE / ONBOARDING
 */
router.put("/me", authMiddleware, updateProfile);

/**
 * CHANGE PASSWORD
 */
router.put("/change-password", authMiddleware, changePassword);

export default router;
