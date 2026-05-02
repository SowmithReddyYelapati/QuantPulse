import { Router } from 'express';
import { getStockData, getPrediction, addToWatchlist, getWatchlist } from '../controllers/stockController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.get('/quote/:symbol', getStockData);
router.get('/predict/:symbol', getPrediction);
router.post('/watchlist', authenticateToken, addToWatchlist);
router.get('/watchlist', authenticateToken, getWatchlist);

export default router;
