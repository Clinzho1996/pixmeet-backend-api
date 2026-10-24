"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNotification = void 0;
const notification_model_1 = require("../modules/notification.model");
const createNotification = async (userId, title, message, type) => {
    return notification_model_1.Notification.create({
        user: userId,
        title,
        message,
        type,
    });
};
exports.createNotification = createNotification;
