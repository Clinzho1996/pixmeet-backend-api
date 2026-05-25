import { Response } from "express";
import { Sound } from "../modules/sound.model";
import { incrementDownload } from "../services/sound.service";

export const getSounds = async (req: any, res: Response) => {
	const sounds = await Sound.find();
	res.json(sounds);
};

export const downloadSound = async (req: any, res: Response) => {
	const sound = await incrementDownload(req.params.id);

	res.json({
		message: "Download tracked",
		url: sound.url,
	});
};
