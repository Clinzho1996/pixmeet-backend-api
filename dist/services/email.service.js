"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendOtpEmail = exports.sendEmail = void 0;
const resend_1 = require("resend");
let resendInstance = null;
/**
 * Initialize Resend lazily (singleton pattern)
 */
const getResendInstance = () => {
    if (!resendInstance) {
        if (!process.env.RESEND_API_KEY) {
            throw new Error("Missing RESEND_API_KEY environment variable");
        }
        resendInstance = new resend_1.Resend(process.env.RESEND_API_KEY);
    }
    return resendInstance;
};
/**
 * Generic email sender
 */
const sendEmail = async ({ to, subject, html, }) => {
    try {
        const resend = getResendInstance();
        console.log("Attempting to send email:", { to, subject });
        const response = await resend.emails.send({
            from: process.env.EMAIL_FROM || "noreply@kuditrak.com",
            to,
            subject,
            html,
        });
        console.log("Resend response:", response);
        return response;
    }
    catch (error) {
        console.error("Error sending email with Resend:", error);
        throw error;
    }
};
exports.sendEmail = sendEmail;
/**
 * OTP email helper (backward compatible)
 */
const sendOtpEmail = async (email, code) => {
    return (0, exports.sendEmail)({
        to: email,
        subject: "Your PixMeet OTP Code",
        html: `
			<h2>PixMeet Verification</h2>
			<p>Your OTP code is:</p>
			<h1>${code}</h1>
			<p>This code expires in 10 minutes.</p>
		`,
    });
};
exports.sendOtpEmail = sendOtpEmail;
