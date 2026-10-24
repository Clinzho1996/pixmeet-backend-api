"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.incrementDownload = void 0;
const sound_model_1 = require("../modules/sound.model");
const incrementDownload = async (id) => {
    const sound = await sound_model_1.Sound.findById(id);
    if (!sound)
        throw new Error("Sound not found");
    sound.downloads += 1;
    await sound.save();
    return sound;
};
exports.incrementDownload = incrementDownload;
