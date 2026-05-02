"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const stockController_1 = require("../controllers/stockController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.get('/quote/:symbol', stockController_1.getStockData);
router.get('/predict/:symbol', stockController_1.getPrediction);
router.post('/watchlist', authMiddleware_1.authenticateToken, stockController_1.addToWatchlist);
router.get('/watchlist', authMiddleware_1.authenticateToken, stockController_1.getWatchlist);
exports.default = router;
//# sourceMappingURL=stockRoutes.js.map