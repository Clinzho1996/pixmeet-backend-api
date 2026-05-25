import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";

import {
	clearNotifications,
	getNotifications,
	markAsRead,
} from "../controllers/notification.controller";

const router = Router();

router.get("/", authMiddleware, getNotifications);
router.put("/read/:id", authMiddleware, markAsRead);
router.delete("/clear", authMiddleware, clearNotifications);

export default router;
