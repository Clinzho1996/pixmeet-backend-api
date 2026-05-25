import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";

import {
	changePassword,
	getMe,
	updateProfileController,
} from "../controllers/user.controller";
import { upload } from "../middlewares/upload";

const router = Router();

/**
 * GET CURRENT USER PROFILE
 */
router.get("/me", authMiddleware, getMe);

router.put(
	"/profile",
	authMiddleware,
	upload.single("profileImage"),
	updateProfileController,
);

/**
 * CHANGE PASSWORD
 */
router.put("/change-password", authMiddleware, changePassword);

export default router;
