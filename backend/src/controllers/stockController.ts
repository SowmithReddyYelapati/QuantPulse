import { Request, Response } from 'express';
import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import { createClient } from 'redis';

const prisma = new PrismaClient();
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8001';
const CACHE_TTL = 120; // 2 minutes — matches ML service prediction cache TTL

// Redis client — silently skips caching if Redis isn't running locally
const redis = createClient({ url: process.env.REDIS_URL || 'redis://127.0.0.1:6379' });
redis.on('error', () => {}); // graceful no-op
redis.connect().catch(() => {});

async function getCached(key: string): Promise<any | null> {
  try {
    const val = await redis.get(key);
    return val ? JSON.parse(val) : null;
  } catch { return null; }
}

async function setCached(key: string, data: any): Promise<void> {
  try { await redis.set(key, JSON.stringify(data), { EX: CACHE_TTL }); }
  catch { /* ignore */ }
}

export const getStockData = async (req: Request, res: Response) => {
  const symbol = req.params.symbol as string;
  const cacheKey = `stock:${symbol.toUpperCase()}`;
  try {
    const cached = await getCached(cacheKey);
    if (cached) {
      console.log(`[Redis HIT] ${symbol}`);
      return res.json({ ...cached, cached: true });
    }
    console.log(`[Redis MISS] ${symbol} — calling ML service`);
    const response = await axios.get(
      `${ML_SERVICE_URL}/predict/advanced?symbol=${symbol}`,
      { timeout: 60000 }
    );
    await setCached(cacheKey, response.data);
    return res.json(response.data);
  } catch (error: any) {
    console.error('Error calling ML service:', error.message || error);
    return res.status(500).json({ error: 'Failed to fetch stock data' });
  }
};

export const getPrediction = async (req: Request, res: Response) => {
  const symbol = req.params.symbol as string;
  const cacheKey = `pred:${symbol.toUpperCase()}`;
  try {
    const cached = await getCached(cacheKey);
    if (cached) return res.json({ ...cached, cached: true });
    const response = await axios.get(
      `${ML_SERVICE_URL}/predict/advanced?symbol=${symbol}`,
      { timeout: 60000 }
    );
    await setCached(cacheKey, response.data);
    return res.json(response.data);
  } catch (error: any) {
    console.error('Error calling ML service:', error.message || error);
    return res.status(500).json({ error: 'Failed to fetch prediction' });
  }
};

export const addToWatchlist = async (req: any, res: Response) => {
  const { symbol } = req.body;
  const userId = req.user.userId;
  try {
    const item = await prisma.watchlist.create({ data: { symbol, userId } });
    res.status(201).json(item);
  } catch (error) {
    res.status(400).json({ error: 'Failed to add to watchlist' });
  }
};

export const getWatchlist = async (req: any, res: Response) => {
  const userId = req.user.userId;
  try {
    const watchlist = await prisma.watchlist.findMany({ where: { userId } });
    res.json(watchlist);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch watchlist' });
  }
};
