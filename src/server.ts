// src/server.ts
import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import { connectDB } from "./config/db";

const PORT = Number(process.env.PORT) || 5000;

// Backstops — keep the process alive on stray errors
process.on("uncaughtException", (err) => {
	console.error("[process] uncaughtException:", err);
});

process.on("unhandledRejection", (reason) => {
	console.error("[process] unhandledRejection:", reason);
});

// Fail fast if required env vars are missing
const REQUIRED_ENV = ["MONGODB_URI", "JWT_SECRET"];
const missing = REQUIRED_ENV.filter((k) => !process.env[k]);
if (missing.length) {
	console.error(`[startup] Missing env vars: ${missing.join(", ")}`);
	process.exit(1);
}

(async () => {
	try {
		await connectDB();
		app.listen(PORT, "0.0.0.0", () => {
			console.log(`Server running on port ${PORT}`);
		});
	} catch (err) {
		console.error("[startup] Fatal error:", err);
		process.exit(1);
	}
})();
