export type TransactionType = "credit" | "debit";

export type TransactionReason =
	| "topup"
	| "challenge_entry"
	| "challenge_win"
	| "withdrawal"
	| "refund";
