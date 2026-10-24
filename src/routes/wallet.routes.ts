// src/routes/wallet.route.ts
import { Router } from "express";
import {
	getBanks,
	getTransactions,
	getWallet,
	paystackWebhook,
	resolveBank,
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
router.post("/withdraw", withdraw);
router.get("/banks", getBanks);
router.get("/banks/resolve", resolveBank);
router.post("/subaccount", setupSubaccount);

export default router;
