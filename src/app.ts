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
	"https://www.pixxmeet.com", // add your real deployed frontend origin
];

app.use(
	cors({
		origin: (origin, callback) => {
			// Allow requests with no origin (curl, mobile apps, server-to-server)
			if (!origin) return callback(null, true);
			if (allowedOrigins.includes(origin)) return callback(null, true);
			return callback(new Error(`Origin ${origin} not allowed by CORS`));
		},
		credentials: true, // if you're sending cookies; harmless if not
		methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization"],
	}),
);

app.options("*", cors());

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/challenge", challengeRoutes);
app.use("/api/user", userRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/notification", notificationRoutes);
app.use("/api/creator", creatorRoutes);
app.use("/api/sounds", soundRoutes);

export default app;
