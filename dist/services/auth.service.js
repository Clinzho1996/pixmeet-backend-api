"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOTPCode = exports.verifyPassword = exports.hashPassword = exports.createToken = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();
const createToken = (user) => {
    return jsonwebtoken_1.default.sign({
        userId: user._id,
        email: user.email,
        role: user.role,
    }, process.env.JWT_SECRET, { expiresIn: "7d" });
};
exports.createToken = createToken;
const hashPassword = async (password) => {
    return bcryptjs_1.default.hash(password, 10);
};
exports.hashPassword = hashPassword;
const verifyPassword = async (password, hash) => {
    return bcryptjs_1.default.compare(password, hash);
};
exports.verifyPassword = verifyPassword;
const generateOTPCode = () => generateOTP();
exports.generateOTPCode = generateOTPCode;
