export interface JwtPayload {
	userId: string;
	email: string;
	role: "user" | "creator" | "admin";
}
