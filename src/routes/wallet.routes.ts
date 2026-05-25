import { Router } from "express";
import { getTransactions, getWallet } from "../controllers/wallet.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.get("/", authMiddleware, getWallet);
router.get("/transactions", authMiddleware, getTransactions);

export default router;
