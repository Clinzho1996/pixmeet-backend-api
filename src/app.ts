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
