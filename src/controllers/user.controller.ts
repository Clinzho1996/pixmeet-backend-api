import { Response } from "express";
import {
	changePasswordService,
	getMeService,
	updateProfileService,
} from "../services/user.service";

/**
 * GET PROFILE (ME)
 */
export const getMe = async (req: any, res: Response) => {
	const user = await getMeService(req.user.userId);
	res.json(user);
};

/**
 * UPDATE PROFILE / ONBOARDING
 */
export const updateProfile = async (req: any, res: Response) => {
	const user = await updateProfileService(req.user.userId, req.body);

	res.json(user);
};

/**
 * CHANGE PASSWORD
 */
export const changePassword = async (req: any, res: Response) => {
	await changePasswordService(
		req.user.userId,
		req.body.oldPassword,
		req.body.newPassword,
	);

	res.json({ message: "Password updated" });
};
