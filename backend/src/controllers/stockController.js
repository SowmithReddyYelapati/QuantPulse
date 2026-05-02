"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWatchlist = exports.addToWatchlist = exports.getPrediction = exports.getStockData = void 0;
const express_1 = require("express");
const axios_1 = __importDefault(require("axios"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8001';
const getStockData = async (req, res) => {
    const { symbol } = req.params;
    try {
        // In a real app, you'd call Finnhub/Alpha Vantage here
        // For this demo, we use the ML service to get current data too
        const response = await axios_1.default.get(`${ML_SERVICE_URL}/predict?symbol=${symbol}`);
        res.json(response.data);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch stock data' });
    }
};
exports.getStockData = getStockData;
const getPrediction = async (req, res) => {
    const { symbol } = req.params;
    try {
        const response = await axios_1.default.get(`${ML_SERVICE_URL}/predict?symbol=${symbol}`);
        res.json(response.data);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch prediction' });
    }
};
exports.getPrediction = getPrediction;
const addToWatchlist = async (req, res) => {
    const { symbol } = req.body;
    const userId = req.user.userId;
    try {
        const item = await prisma.watchlist.create({
            data: { symbol, userId },
        });
        res.status(201).json(item);
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to add to watchlist' });
    }
};
exports.addToWatchlist = addToWatchlist;
const getWatchlist = async (req, res) => {
    const userId = req.user.userId;
    try {
        const watchlist = await prisma.watchlist.findMany({ where: { userId } });
        res.json(watchlist);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch watchlist' });
    }
};
exports.getWatchlist = getWatchlist;
//# sourceMappingURL=stockController.js.map