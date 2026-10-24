// src/routes/wallet.route.ts
import { Router } from "express";
import {
	getTransactions,
	getWallet,
	paystackWebhook,
	setupSubaccount,
	topup,
	withdraw,
} from "../controllers/wallet.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

// Public webhook — MUST be registered before express.json() in app.ts (see below)
router.post("/webhook", paystackWebhook);

router.use(authMiddleware);
router.get("/", getWallet);
router.get("/transactions", getTransactions);
router.post("/topup", topup);
router.post("/subaccount", setupSubaccount);
router.post("/withdraw", withdraw);

export default router;
