import { User } from "../modules/user.model";

/**
 * GET CURRENT USER
 */
export const getMeService = async (userId: string) => {
	return User.findById(userId).populate("wallet");
};

/**
 * UPDATE PROFILE (ONBOARDING + EDIT)
 */
export const updateProfileService = async (userId: string, payload: any) => {
	const user = await User.findById(userId);

	if (!user) throw new Error("User not found");

	user.profile = {
		...user.profile,
		...payload,
	};

	user.profileCompleted = true;

	await user.save();

	return user;
};

/**
 * CHANGE PASSWORD
 */
export const changePasswordService = async (
	userId: string,
	oldPassword: string,
	newPassword: string,
) => {
	const user = await User.findById(userId).select("+password");

	if (!user) throw new Error("User not found");

	const bcrypt = await import("bcryptjs");

	const isMatch = await bcrypt.compare(oldPassword, user.password);

	if (!isMatch) throw new Error("Old password incorrect");

	user.password = await bcrypt.hash(newPassword, 10);

	await user.save();

	return true;
};
