import { Notification } from "../modules/notification.model";

export const createNotification = async (
	userId: string,
	title: string,
	message: string,
	type: string,
) => {
	return Notification.create({
		user: userId,
		title,
		message,
		type,
	});
};
