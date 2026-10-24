"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Sound = void 0;
const mongoose_1 = require("mongoose");
const soundSchema = new mongoose_1.Schema({
    title: String,
    by: String,
    url: String,
    downloads: { type: Number, default: 0 },
}, { timestamps: true });
exports.Sound = (0, mongoose_1.model)("Sound", soundSchema);
