export type Gender = "male" | "female" | "other";

export type UserRole = "user" | "creator" | "admin";

export interface UpdateProfileDTO {
	fullName?: string;
	nickname?: string;
	gender?: Gender;
	dateOfBirth?: Date;
	whatsapp?: string;
	bio?: string;
	profileImage?: string;
}

export interface JwtPayload {
	userId: string;
	email: string;
	role: UserRole;
}
