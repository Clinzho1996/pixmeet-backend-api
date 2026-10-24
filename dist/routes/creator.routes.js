"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const creator_controller_1 = require("../controllers/creator.controller");
const router = (0, express_1.Router)();
router.post("/register", auth_middleware_1.authMiddleware, creator_controller_1.registerCreator);
router.get("/me", auth_middleware_1.authMiddleware, creator_controller_1.getCreatorProfile);
exports.default = router;
