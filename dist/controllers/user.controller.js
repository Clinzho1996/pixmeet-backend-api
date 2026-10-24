"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePassword = exports.updateProfileController = exports.updateProfile = exports.getMe = void 0;
const user_service_1 = require("../services/user.service");
/**
 * GET PROFILE (ME)
 */
const getMe = async (req, res) => {
    const user = await (0, user_service_1.getMeService)(req.user.userId);
    res.json(user);
};
exports.getMe = getMe;
/**
 * UPDATE PROFILE / ONBOARDING
 */
const updateProfile = async (req, res) => {
    const user = await (0, user_service_1.updateProfileService)(req.user.userId, req.body);
    res.json(user);
};
exports.updateProfile = updateProfile;
const updateProfileController = async (req, res) => {
    const file = req.file;
    const payload = {
        ...req.body,
        profileImage: file ? `/uploads/${file.filename}` : undefined,
    };
    const user = await (0, user_service_1.updateProfileService)(req.user.userId, payload);
    res.json(user);
};
exports.updateProfileController = updateProfileController;
/**
 * CHANGE PASSWORD
 */
const changePassword = async (req, res) => {
    await (0, user_service_1.changePasswordService)(req.user.userId, req.body.oldPassword, req.body.newPassword);
    res.json({ message: "Password updated" });
};
exports.changePassword = changePassword;
