export type ChallengeStatus =
	| "pending"
	| "waitlist"
	| "live"
	| "completed"
	| "cancelled";

export type ChallengeCategory = "auto" | "waitlist";

export type ChallengeType = "video";

export interface CreateChallengeDTO {
	entryFee: number;
	category: ChallengeCategory;
	title?: string;
	description?: string;
	durationHours: number;
	sound?: {
		name: string;
		by: string;
		url: string;
	};
}
