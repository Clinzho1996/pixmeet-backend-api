import { Response } from "express";
import { Creator } from "../modules/creator.model";

export const registerCreator = async (req: any, res: Response) => {
	const creator = await Creator.create({
		user: req.user.userId,
	});

	res.json(creator);
};

export const getCreatorProfile = async (req: any, res: Response) => {
	const data = await Creator.findOne({ user: req.user.userId });
	res.json(data);
};
