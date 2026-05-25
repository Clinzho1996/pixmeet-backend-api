import { Response } from "express";
import { Notification } from "../modules/notification.model";

export const getNotifications = async (req: any, res: Response) => {
	const data = await Notification.find({ user: req.user.userId });
	res.json(data);
};

export const markAsRead = async (req: any, res: Response) => {
	await Notification.findByIdAndUpdate(req.params.id, {
		isRead: true,
	});

	res.json({ success: true });
};

export const clearNotifications = async (req: any, res: Response) => {
	await Notification.deleteMany({ user: req.user.userId });
	res.json({ success: true });
};
