"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializePayment = void 0;
const axios_1 = __importDefault(require("axios"));
const initializePayment = async (email, amount) => {
    const res = await axios_1.default.post("https://api.paystack.co/transaction/initialize", { email, amount: amount * 100 }, {
        headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET}`,
        },
    });
    return res.data;
};
exports.initializePayment = initializePayment;
