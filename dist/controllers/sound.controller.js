"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadSound = exports.getSounds = void 0;
const sound_model_1 = require("../modules/sound.model");
const sound_service_1 = require("../services/sound.service");
const getSounds = async (req, res) => {
    const sounds = await sound_model_1.Sound.find();
    res.json(sounds);
};
exports.getSounds = getSounds;
const downloadSound = async (req, res) => {
    const sound = await (0, sound_service_1.incrementDownload)(req.params.id);
    res.json({
        message: "Download tracked",
        url: sound.url,
    });
};
exports.downloadSound = downloadSound;
