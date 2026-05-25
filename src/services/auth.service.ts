import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const generateOTP = () =>
	Math.floor(100000 + Math.random() * 900000).toString();

export const createToken = (user: any) => {
	return jwt.sign(
		{
			userId: user._id,
			email: user.email,
			role: user.role,
		},
		process.env.JWT_SECRET!,
		{ expiresIn: "7d" },
	);
};

export const hashPassword = async (password: string) => {
	return bcrypt.hash(password, 10);
};

export const verifyPassword = async (password: string, hash: string) => {
	return bcrypt.compare(password, hash);
};

export const generateOTPCode = () => generateOTP();
