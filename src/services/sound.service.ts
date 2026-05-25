import { Sound } from "../modules/sound.model";

export const incrementDownload = async (id: string) => {
	const sound = await Sound.findById(id);

	if (!sound) throw new Error("Sound not found");

	sound.downloads += 1;
	await sound.save();

	return sound;
};
