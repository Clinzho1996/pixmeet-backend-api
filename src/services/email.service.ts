import { Resend } from "resend";

let resendInstance: Resend | null = null;

/**
 * Initialize Resend lazily (singleton pattern)
 */
const getResendInstance = (): Resend => {
	if (!resendInstance) {
		if (!process.env.RESEND_API_KEY) {
			throw new Error("Missing RESEND_API_KEY environment variable");
		}

		resendInstance = new Resend(process.env.RESEND_API_KEY);
	}

	return resendInstance;
};

/**
 * Email payload type
 */
export interface SendEmailDTO {
	to: string | string[];
	subject: string;
	html: string;
}

/**
 * Generic email sender
 */
export const sendEmail = async ({
	to,
	subject,
	html,
}: SendEmailDTO): Promise<any> => {
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
	} catch (error) {
		console.error("Error sending email with Resend:", error);
		throw error;
	}
};

/**
 * OTP email helper (backward compatible)
 */
export const sendOtpEmail = async (
	email: string,
	code: string,
): Promise<any> => {
	return sendEmail({
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
