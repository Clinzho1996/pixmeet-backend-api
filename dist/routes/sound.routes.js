"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const sound_controller_1 = require("../controllers/sound.controller");
const router = (0, express_1.Router)();
router.get("/", auth_middleware_1.authMiddleware, sound_controller_1.getSounds);
router.get("/download/:id", auth_middleware_1.authMiddleware, sound_controller_1.downloadSound);
exports.default = router;
