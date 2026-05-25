import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";

import { downloadSound, getSounds } from "../controllers/sound.controller";

const router = Router();

router.get("/", authMiddleware, getSounds);
router.get("/download/:id", authMiddleware, downloadSound);

export default router;
