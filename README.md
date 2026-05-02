<div align="center">
  <h1>📈 QuantPulse</h1>
  <p><b>Institutional-Grade Stock Market Analytics & Machine Learning Prediction Engine</b></p>
  
  [![Deploy Status](https://img.shields.io/badge/Render-Deployed-success?style=for-the-badge&logo=render)](https://render.com/)
  [![Deploy Status](https://img.shields.io/badge/Vercel-Deployed-success?style=for-the-badge&logo=vercel)](https://vercel.com/)
  [![Tech Stack](https://img.shields.io/badge/Stack-React%20%7C%20Node%20%7C%20Python-blue?style=for-the-badge)](#)
</div>

---

**QuantPulse** is a distributed, full-stack financial dashboard designed to bridge the gap between technical trading and artificial intelligence. Built with a robust microservice architecture, it provides real-time market data, interactive volume distributions, and machine-learning-driven price forecasts in a premium "Elite Dark" user interface.

## ✨ Core Features
* **AI Prediction Engine**: Next-day closing price forecasting powered by a Python/FastAPI microservice utilizing `scikit-learn`.
* **Institutional UI/UX**: Custom-built, utility-first CSS design system featuring glassmorphism, stagger animations, and ambient radial gradients.
* **Real-time Analytics**: Interactive area charts with technical indicators (RSI, MACD, Bollinger Bands) using Recharts.
* **Distributed Architecture**: Clean separation of concerns between the React frontend, Node.js REST API, and Python ML backend.
* **Secure Authentication**: JWT-based session management and encrypted password storage via Prisma & PostgreSQL.

## 🛠️ Technology Stack
* **Frontend**: React 18, TypeScript, Vite, Framer Motion (Animations), Lucide (Icons)
* **Backend**: Node.js, Express.js, Prisma ORM, PostgreSQL, Redis (Caching)
* **ML Service**: Python 3.10, FastAPI, Scikit-Learn, Pandas, NumPy, yFinance
* **Infrastructure**: Render (Backend/ML/DB via `render.yaml`), Vercel (Frontend)

## 📦 System Architecture
The platform is deployed using a decoupled microservices approach:
1. `quantpulse-ui` (Vercel) → Client-side SPA
2. `quantpulse-backend` (Render) → Express/Node.js API Gateway & Auth Service
3. `quantpulse-ml` (Render) → Python/FastAPI Machine Learning Inference Engine
4. `quantpulse-db` (Render) → Managed PostgreSQL Database

## 🚀 Local Development Setup

### 1. ML Service (Port 8001)
```bash
cd ml-service
python -m venv venv
.\venv\Scripts\activate  # On Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
python main.py
```

### 2. Node API (Port 5000)
```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run dev
```

### 3. Frontend (Port 5173)
```bash
cd frontend
npm install
npm run dev
```

## 🧠 ML Model Overview
The inference engine utilizes a continuous-training Linear Regression model. It fetches the latest 30-day historical tick data via `yfinance`, calculates momentum vectors (Fast/Slow MAs), and projects short-term price movements overlaid directly onto the frontend React charts.
