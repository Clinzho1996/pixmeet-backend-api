import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";

import {
	getCreatorProfile,
	registerCreator,
} from "../controllers/creator.controller";

const router = Router();

router.post("/register", authMiddleware, registerCreator);
router.get("/me", authMiddleware, getCreatorProfile);

export default router;
