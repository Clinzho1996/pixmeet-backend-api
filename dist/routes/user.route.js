"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const user_controller_1 = require("../controllers/user.controller");
const upload_1 = require("../middlewares/upload");
const router = (0, express_1.Router)();
/**
 * GET CURRENT USER PROFILE
 */
router.get("/me", auth_middleware_1.authMiddleware, user_controller_1.getMe);
router.put("/profile", auth_middleware_1.authMiddleware, upload_1.upload.single("profileImage"), user_controller_1.updateProfileController);
/**
 * CHANGE PASSWORD
 */
router.put("/change-password", auth_middleware_1.authMiddleware, user_controller_1.changePassword);
exports.default = router;
