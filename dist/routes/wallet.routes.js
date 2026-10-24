"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const wallet_controller_1 = require("../controllers/wallet.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.get("/", auth_middleware_1.authMiddleware, wallet_controller_1.getWallet);
router.get("/transactions", auth_middleware_1.authMiddleware, wallet_controller_1.getTransactions);
exports.default = router;
