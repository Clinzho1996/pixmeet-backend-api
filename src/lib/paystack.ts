import axios from "axios";

export const initializePayment = async (email: string, amount: number) => {
	const res = await axios.post(
		"https://api.paystack.co/transaction/initialize",
		{ email, amount: amount * 100 },
		{
			headers: {
				Authorization: `Bearer ${process.env.PAYSTACK_SECRET}`,
			},
		},
	);

	return res.data;
};
