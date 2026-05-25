import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";

import authRoutes from "../src/routes/auth.route";
import challengeRoutes from "../src/routes/challenge.route";
import creatorRoutes from "../src/routes/creator.routes";
import notificationRoutes from "../src/routes/notification.routes";
import soundRoutes from "../src/routes/sound.routes";
import userRoutes from "../src/routes/user.route";
import walletRoutes from "../src/routes/wallet.routes";

const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/challenge", challengeRoutes);
app.use("/user", userRoutes);
app.use("/wallet", walletRoutes);
app.use("/notification", notificationRoutes);
app.use("/creator", creatorRoutes);
app.use("/sounds", soundRoutes);

export default app;
