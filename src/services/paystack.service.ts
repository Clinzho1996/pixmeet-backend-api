// src/services/paystack.service.ts
import axios from "axios";
import crypto from "crypto";

const PAYSTACK_BASE = "https://api.paystack.co";
const SECRET = process.env.PAYSTACK_SECRET_KEY!;

const paystackAxios = axios.create({
	baseURL: PAYSTACK_BASE,
	headers: { Authorization: `Bearer ${SECRET}` },
});

/* ============ TOP-UP (BUY COINS / FUND WALLET) ============ */
export const initializeTopup = async (
	email: string,
	amountNaira: number,
	userId: string,
	subaccountCode?: string,
) => {
	const body: Record<string, any> = {
		email,
		amount: Math.round(amountNaira * 100), // kobo
		callback_url: `${process.env.FRONTEND_URL}/wallet/callback`,
		metadata: { userId, purpose: "wallet_topup" },
	};

	// If the user has a subaccount, Paystack splits the payment automatically
	if (subaccountCode) {
		body.subaccount = subaccountCode;
		body.bearer = "subaccount"; // subaccount bears Paystack fees
	}

	const { data } = await paystackAxios.post("/transaction/initialize", body);
	return data.data as {
		authorization_url: string;
		access_code: string;
		reference: string;
	};
};

/* ============ CREATE SUBACCOUNT (per user, one-time) ============ */
export const createSubaccount = async (input: {
	businessName: string;
	bankCode: string;
	accountNumber: string;
	email: string;
	phone?: string;
}) => {
	const { data } = await paystackAxios.post("/subaccount", {
		business_name: input.businessName,
		settlement_bank: input.bankCode,
		account_number: input.accountNumber,
		primary_contact_email: input.email,
		primary_contact_name: input.businessName,
		primary_contact_phone: input.phone,
		percentage_charge: 0, // 0 = subaccount keeps everything (platform takes via transaction_charge if needed)
	});
	return data.data as { subaccount_code: string };
};

/* ============ WITHDRAWAL (transfer to user's bank) ============ */
export const createTransferRecipient = async (input: {
	name: string;
	accountNumber: string;
	bankCode: string;
}) => {
	const { data } = await paystackAxios.post("/transferrecipient", {
		type: "nuban",
		name: input.name,
		account_number: input.accountNumber,
		bank_code: input.bankCode,
		currency: "NGN",
	});
	return data.data as { recipient_code: string };
};

export const initiateTransfer = async (input: {
	amountNaira: number;
	recipientCode: string;
	reason: string;
	reference: string;
}) => {
	const { data } = await paystackAxios.post("/transfer", {
		source: "balance",
		amount: Math.round(input.amountNaira * 100),
		recipient: input.recipientCode,
		reason: input.reason,
		reference: input.reference,
	});
	return data.data as { transfer_code: string; status: string };
};

/* ============ WEBHOOK SIGNATURE ============ */
export const verifyWebhookSignature = (
	rawBody: Buffer | string,
	signature: string | undefined,
): boolean => {
	if (!signature) return false;
	const expected = crypto
		.createHmac("sha512", SECRET)
		.update(rawBody)
		.digest("hex");
	try {
		return crypto.timingSafeEqual(
			Buffer.from(signature),
			Buffer.from(expected),
		);
	} catch {
		return false;
	}
};
