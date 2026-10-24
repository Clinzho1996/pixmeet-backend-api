"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePasswordService = exports.updateProfileService = exports.getMeService = void 0;
const user_model_1 = require("../modules/user.model");
const wallet_model_1 = require("../modules/wallet.model");
const getMeService = async (userId) => {
    const user = await user_model_1.User.findById(userId).lean();
    if (!user)
        throw new Error("User not found");
    const wallet = await wallet_model_1.Wallet.findOne({ user: userId });
    return {
        ...user,
        wallet,
    };
};
exports.getMeService = getMeService;
/**
 * UPDATE PROFILE (ONBOARDING + EDIT)
 */
const updateProfileService = async (userId, payload) => {
    const user = await user_model_1.User.findById(userId);
    if (!user)
        throw new Error("User not found");
    user.profile = {
        ...user.profile,
        ...payload,
    };
    user.profileCompleted = true;
    await user.save();
    return user;
};
exports.updateProfileService = updateProfileService;
/**
 * CHANGE PASSWORD
 */
const changePasswordService = async (userId, oldPassword, newPassword) => {
    const user = await user_model_1.User.findById(userId).select("+password");
    if (!user)
        throw new Error("User not found");
    const bcrypt = await Promise.resolve().then(() => __importStar(require("bcryptjs")));
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch)
        throw new Error("Old password incorrect");
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    return true;
};
exports.changePasswordService = changePasswordService;
