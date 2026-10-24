import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";

import path from "path";
import authRoutes from "./routes/auth.route";
import challengeRoutes from "./routes/challenge.route";
import creatorRoutes from "./routes/creator.routes";
import notificationRoutes from "./routes/notification.routes";
import soundRoutes from "./routes/sound.routes";
import userRoutes from "./routes/user.route";
import walletRoutes from "./routes/wallet.routes";

const app = express();

const allowedOrigins = [
	"http://localhost:3000",
	"http://localhost:3001",
	"https://www.pixxmeet.com",
	"https://pixxmeet.com",
	process.env.FRONTEND_URL, // pull from env so prod URL isn't hardcoded
].filter(Boolean) as string[];

app.use(
	cors({
		origin: (origin, callback) => {
			// Allow non-browser requests (curl, Postman, mobile)
			if (!origin) return callback(null, true);
			if (allowedOrigins.includes(origin)) return callback(null, true);
			return callback(new Error(`Origin ${origin} not allowed by CORS`));
		},
		credentials: true,
		methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization"],
	}),
);

// Let cors() handle preflights for every route
app.options("*", cors());

app.post(
	"/api/wallet/webhook",
	express.raw({ type: "application/json" }),
	(req: any, _res, next) => {
		req.rawBody = req.body; // Buffer
		req.body = JSON.parse(req.body.toString()); // parsed for the handler
		next();
	},
);

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// app.use(cors());  ← DELETE THIS LINE
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(morgan("dev"));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/challenge", challengeRoutes);
app.use("/api/user", userRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/notification", notificationRoutes);
app.use("/api/creator", creatorRoutes);
app.use("/api/sounds", soundRoutes);

// Health check
app.get("/health", (_req, res) => {
	res.status(200).json({ ok: true, ts: Date.now() });
});

// JSON error handler — MUST be last, after all routes
app.use((err: any, _req: any, res: any, next: any) => {
	console.error("[express.error]", err);
	if (res.headersSent) return next(err);
	res.status(500).json({ message: "Internal server error" });
});

export default app;
