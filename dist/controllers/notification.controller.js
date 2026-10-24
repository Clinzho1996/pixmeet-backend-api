"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearNotifications = exports.markAsRead = exports.getNotifications = void 0;
const notification_model_1 = require("../modules/notification.model");
const getNotifications = async (req, res) => {
    const data = await notification_model_1.Notification.find({ user: req.user.userId });
    res.json(data);
};
exports.getNotifications = getNotifications;
const markAsRead = async (req, res) => {
    await notification_model_1.Notification.findByIdAndUpdate(req.params.id, {
        isRead: true,
    });
    res.json({ success: true });
};
exports.markAsRead = markAsRead;
const clearNotifications = async (req, res) => {
    await notification_model_1.Notification.deleteMany({ user: req.user.userId });
    res.json({ success: true });
};
exports.clearNotifications = clearNotifications;
