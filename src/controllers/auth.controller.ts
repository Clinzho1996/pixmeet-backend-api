import { Request, Response } from "express";
import { User } from "../modules/user.model";
import {
	createToken,
	generateOTPCode,
	hashPassword,
	verifyPassword,
} from "../services/auth.service";
import { sendEmail } from "../services/email.service";

/**
 * REGISTER
 */
export const register = async (req: Request, res: Response) => {
	const { email, password } = req.body;

	const existing = await User.findOne({ email });
	if (existing) throw new Error("User already exists");

	const otp = generateOTPCode();

	await User.create({
		email,
		password: await hashPassword(password),
		isVerified: false,
		profileCompleted: false,
		otp: {
			code: otp,
			expiresAt: new Date(Date.now() + 10 * 60 * 1000),
		},
	});

	// 📧 SEND OTP EMAIL (REAL)
	await sendEmail({
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

/**
 * VERIFY EMAIL
 */
export const verifyEmail = async (req: Request, res: Response) => {
	const { email, otp } = req.body;

	const user: any = await User.findOne({ email });
	if (!user) throw new Error("User not found");

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

/**
 * LOGIN
 */
export const login = async (req: Request, res: Response) => {
	const { email, password } = req.body;

	const user: any = await User.findOne({ email }).select("+password");

	if (!user) throw new Error("User not found");

	if (user.isSuspended) {
		throw new Error("Account suspended");
	}

	if (!user.isVerified) {
		throw new Error("Email not verified");
	}

	const isMatch = await verifyPassword(password, user.password);
	if (!isMatch) throw new Error("Invalid credentials");

	const isFirstLogin = !user.lastLogin;

	user.lastLogin = new Date();
	await user.save();

	const token = createToken(user);

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

/**
 * FORGOT PASSWORD
 */
export const forgotPassword = async (req: Request, res: Response) => {
	const { email } = req.body;

	const user: any = await User.findOne({ email });
	if (!user) throw new Error("User not found");

	const code = generateOTPCode();

	user.resetPassword = {
		code,
		expiresAt: new Date(Date.now() + 10 * 60 * 1000),
	};

	await user.save();

	// 📧 SEND RESET EMAIL
	await sendEmail({
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

/**
 * RESET PASSWORD
 */
export const resetPassword = async (req: Request, res: Response) => {
	const { email, otp, newPassword } = req.body;

	const user: any = await User.findOne({ email }).select("+password");
	if (!user) throw new Error("User not found");

	if (!user.resetPassword?.code) {
		throw new Error("Reset OTP not found");
	}

	if (user.resetPassword.code !== otp) {
		throw new Error("Invalid reset OTP");
	}

	if (new Date() > user.resetPassword.expiresAt) {
		throw new Error("OTP expired");
	}

	user.password = await hashPassword(newPassword);
	user.resetPassword = undefined;

	await user.save();

	res.json({ message: "Password reset successful" });
};
