export type Role = "user" | "creator" | "admin";

export interface JwtPayload {
	userId: string;
	role: Role;
}
