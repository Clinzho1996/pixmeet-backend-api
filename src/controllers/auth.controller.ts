import { Request, Response } from "express";
import { User } from "../modules/user.model";
import {
	createToken,
	generateOTPCode,
	hashPassword,
	verifyPassword,
} from "../services/auth.service";
import { sendEmail } from "../services/email.service";

/* -------------------------------------------------------------------------- */
/*                                   Helpers                                  */
/* -------------------------------------------------------------------------- */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Normalize emails so "User@X.com" and "user@x.com" map to the same account */
const normalizeEmail = (email: unknown): string => {
	if (typeof email !== "string") return "";
	return email.trim().toLowerCase();
};

/** Small helper — sends a 500 and logs the underlying error, without leaking it */
const serverError = (res: Response, err: unknown, context: string) => {
	console.error(`[auth.${context}]`, err);
	return res.status(500).json({ message: "Something went wrong" });
};

/* -------------------------------------------------------------------------- */
/*                                  REGISTER                                  */
/* -------------------------------------------------------------------------- */

export const register = async (req: Request, res: Response) => {
	try {
		const email = normalizeEmail(req.body?.email);
		const password = req.body?.password;

		if (!email || !EMAIL_REGEX.test(email)) {
			return res.status(400).json({ message: "Please provide a valid email" });
		}
		if (typeof password !== "string" || password.length < 8) {
			return res
				.status(400)
				.json({ message: "Password must be at least 8 characters" });
		}

		const existing = await User.findOne({ email });
		if (existing) {
			return res.status(409).json({ message: "User already exists" });
		}

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

		// Fire-and-forget: SMTP failures shouldn't kill the request
		sendEmail({
			to: email,
			subject: "Verify your PIXMEET account",
			html: `
        <h2>Welcome to PIXMEET</h2>
        <p>Your verification code is:</p>
        <h1>${otp}</h1>
        <p>This code expires in 10 minutes.</p>
      `,
		}).catch((err) => console.error("[auth.register] email send failed:", err));

		return res.status(201).json({
			message: "Account created. Verify OTP sent to email.",
		});
	} catch (err) {
		return serverError(res, err, "register");
	}
};

/* -------------------------------------------------------------------------- */
/*                                VERIFY EMAIL                                */
/* -------------------------------------------------------------------------- */

export const verifyEmail = async (req: Request, res: Response) => {
	try {
		const email = normalizeEmail(req.body?.email);
		const otp = req.body?.otp;

		if (!email || !EMAIL_REGEX.test(email)) {
			return res.status(400).json({ message: "Please provide a valid email" });
		}
		if (typeof otp !== "string" || otp.length !== 6) {
			return res
				.status(400)
				.json({ message: "Please provide the 6-digit OTP" });
		}

		const user: any = await User.findOne({ email });
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		if (user.isVerified) {
			return res.status(200).json({ message: "Already verified" });
		}

		if (!user.otp?.code) {
			return res.status(400).json({ message: "No OTP on file" });
		}

		if (user.otp.code !== otp) {
			return res.status(400).json({ message: "Invalid OTP" });
		}

		if (new Date() > user.otp.expiresAt) {
			return res.status(410).json({ message: "OTP expired" });
		}

		user.isVerified = true;
		user.otp = undefined;
		await user.save();

		return res.status(200).json({ message: "Email verified successfully" });
	} catch (err) {
		return serverError(res, err, "verifyEmail");
	}
};

/* -------------------------------------------------------------------------- */
/*                                   LOGIN                                    */
/* -------------------------------------------------------------------------- */

export const login = async (req: Request, res: Response) => {
	try {
		const email = normalizeEmail(req.body?.email);
		const password = req.body?.password;

		if (!email || !password) {
			return res
				.status(400)
				.json({ message: "Email and password are required" });
		}

		const user: any = await User.findOne({ email }).select("+password");
		if (!user) {
			// Same message as wrong-password — prevents user enumeration
			return res.status(401).json({ message: "Invalid email or password" });
		}

		if (user.isSuspended) {
			return res.status(403).json({ message: "Account suspended" });
		}

		if (!user.isVerified) {
			return res.status(403).json({ message: "Email not verified" });
		}

		const isMatch = await verifyPassword(password, user.password);
		if (!isMatch) {
			return res.status(401).json({ message: "Invalid email or password" });
		}

		const isFirstLogin = !user.lastLogin;
		user.lastLogin = new Date();
		await user.save();

		const token = createToken(user);

		return res.status(200).json({
			token,
			user: {
				id: user._id,
				email: user.email,
				role: user.role,
				profileCompleted: user.profileCompleted,
			},
			isFirstLogin,
		});
	} catch (err) {
		return serverError(res, err, "login");
	}
};

/* -------------------------------------------------------------------------- */
/*                              FORGOT PASSWORD                               */
/* -------------------------------------------------------------------------- */

export const forgotPassword = async (req: Request, res: Response) => {
	try {
		const email = normalizeEmail(req.body?.email);

		if (!email || !EMAIL_REGEX.test(email)) {
			return res.status(400).json({ message: "Please provide a valid email" });
		}

		// Always return success for this endpoint so attackers can't
		// enumerate emails by hitting /forgot-password
		const user: any = await User.findOne({ email });
		if (!user) {
			return res.status(200).json({ message: "Reset OTP sent" });
		}

		// 10-minute cooldown between reset requests
		if (
			user.resetPassword?.expiresAt &&
			user.resetPassword.expiresAt.getTime() - Date.now() > 9 * 60 * 1000
		) {
			return res
				.status(429)
				.json({ message: "Please wait before requesting another code" });
		}

		const code = generateOTPCode();
		user.resetPassword = {
			code,
			expiresAt: new Date(Date.now() + 10 * 60 * 1000),
		};
		await user.save();

		sendEmail({
			to: email,
			subject: "PIXMEET Password Reset Code",
			html: `
        <h2>Password Reset Request</h2>
        <p>Your reset code is:</p>
        <h1>${code}</h1>
        <p>This code expires in 10 minutes.</p>
      `,
		}).catch((err) =>
			console.error("[auth.forgotPassword] email send failed:", err),
		);

		return res.status(200).json({ message: "Reset OTP sent" });
	} catch (err) {
		return serverError(res, err, "forgotPassword");
	}
};

/* -------------------------------------------------------------------------- */
/*                               RESET PASSWORD                               */
/* -------------------------------------------------------------------------- */

export const resetPassword = async (req: Request, res: Response) => {
	try {
		const email = normalizeEmail(req.body?.email);
		const otp = req.body?.otp;
		const newPassword = req.body?.newPassword;

		if (!email || !EMAIL_REGEX.test(email)) {
			return res.status(400).json({ message: "Please provide a valid email" });
		}
		if (typeof otp !== "string" || otp.length !== 6) {
			return res
				.status(400)
				.json({ message: "Please provide the 6-digit OTP" });
		}
		if (typeof newPassword !== "string" || newPassword.length < 8) {
			return res
				.status(400)
				.json({ message: "Password must be at least 8 characters" });
		}

		const user: any = await User.findOne({ email }).select("+password");
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		if (!user.resetPassword?.code) {
			return res.status(400).json({ message: "No reset request on file" });
		}

		if (user.resetPassword.code !== otp) {
			return res.status(400).json({ message: "Invalid reset OTP" });
		}

		if (new Date() > user.resetPassword.expiresAt) {
			return res.status(410).json({ message: "OTP expired" });
		}

		user.password = await hashPassword(newPassword);
		user.resetPassword = undefined;
		await user.save();

		return res.status(200).json({ message: "Password reset successful" });
	} catch (err) {
		return serverError(res, err, "resetPassword");
	}
};
