"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.forgotPassword = exports.login = exports.verifyEmail = exports.register = void 0;
const user_model_1 = require("../modules/user.model");
const auth_service_1 = require("../services/auth.service");
const email_service_1 = require("../services/email.service");
/**
 * REGISTER
 */
const register = async (req, res) => {
    const { email, password } = req.body;
    const existing = await user_model_1.User.findOne({ email });
    if (existing)
        throw new Error("User already exists");
    const otp = (0, auth_service_1.generateOTPCode)();
    await user_model_1.User.create({
        email,
        password: await (0, auth_service_1.hashPassword)(password),
        isVerified: false,
        profileCompleted: false,
        otp: {
            code: otp,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        },
    });
    // 📧 SEND OTP EMAIL (REAL)
    await (0, email_service_1.sendEmail)({
        to: email,
        subject: "Verify your PIXMEET account",
        html: `
			<h2>Welcome to PIXMEET</h2>
			<p>Your verification code is:</p>
			<h1>${otp}</h1>
			<p>This code expires in 10 minutes.</p>
		`,
    });
    res.json({
        message: "Account created. Verify OTP sent to email.",
    });
};
exports.register = register;
/**
 * VERIFY EMAIL
 */
const verifyEmail = async (req, res) => {
    const { email, otp } = req.body;
    const user = await user_model_1.User.findOne({ email });
    if (!user)
        throw new Error("User not found");
    if (user.isVerified) {
        return res.json({ message: "Already verified" });
    }
    if (!user.otp?.code) {
        throw new Error("OTP not found");
    }
    if (user.otp.code !== otp) {
        throw new Error("Invalid OTP");
    }
    if (new Date() > user.otp.expiresAt) {
        throw new Error("OTP expired");
    }
    user.isVerified = true;
    user.otp = undefined;
    await user.save();
    res.json({ message: "Email verified successfully" });
};
exports.verifyEmail = verifyEmail;
/**
 * LOGIN
 */
const login = async (req, res) => {
    const { email, password } = req.body;
    const user = await user_model_1.User.findOne({ email }).select("+password");
    if (!user)
        throw new Error("User not found");
    if (user.isSuspended) {
        throw new Error("Account suspended");
    }
    if (!user.isVerified) {
        throw new Error("Email not verified");
    }
    const isMatch = await (0, auth_service_1.verifyPassword)(password, user.password);
    if (!isMatch)
        throw new Error("Invalid credentials");
    const isFirstLogin = !user.lastLogin;
    user.lastLogin = new Date();
    await user.save();
    const token = (0, auth_service_1.createToken)(user);
    res.json({
        token,
        user: {
            id: user._id,
            email: user.email,
            role: user.role,
            profileCompleted: user.profileCompleted,
        },
        isFirstLogin,
    });
};
exports.login = login;
/**
 * FORGOT PASSWORD
 */
const forgotPassword = async (req, res) => {
    const { email } = req.body;
    const user = await user_model_1.User.findOne({ email });
    if (!user)
        throw new Error("User not found");
    const code = (0, auth_service_1.generateOTPCode)();
    user.resetPassword = {
        code,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    };
    await user.save();
    // 📧 SEND RESET EMAIL
    await (0, email_service_1.sendEmail)({
        to: email,
        subject: "PIXMEET Password Reset Code",
        html: `
			<h2>Password Reset Request</h2>
			<p>Your reset code is:</p>
			<h1>${code}</h1>
			<p>This code expires in 10 minutes.</p>
		`,
    });
    res.json({ message: "Reset OTP sent" });
};
exports.forgotPassword = forgotPassword;
/**
 * RESET PASSWORD
 */
const resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;
    const user = await user_model_1.User.findOne({ email }).select("+password");
    if (!user)
        throw new Error("User not found");
    if (!user.resetPassword?.code) {
        throw new Error("Reset OTP not found");
    }
    if (user.resetPassword.code !== otp) {
        throw new Error("Invalid reset OTP");
    }
    if (new Date() > user.resetPassword.expiresAt) {
        throw new Error("OTP expired");
    }
    user.password = await (0, auth_service_1.hashPassword)(newPassword);
    user.resetPassword = undefined;
    await user.save();
    res.json({ message: "Password reset successful" });
};
exports.resetPassword = resetPassword;
