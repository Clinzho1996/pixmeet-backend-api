"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCreatorProfile = exports.registerCreator = void 0;
const creator_model_1 = require("../modules/creator.model");
const registerCreator = async (req, res) => {
    const creator = await creator_model_1.Creator.create({
        user: req.user.userId,
    });
    res.json(creator);
};
exports.registerCreator = registerCreator;
const getCreatorProfile = async (req, res) => {
    const data = await creator_model_1.Creator.findOne({ user: req.user.userId });
    res.json(data);
};
exports.getCreatorProfile = getCreatorProfile;
