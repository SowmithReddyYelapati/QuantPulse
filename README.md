# QuantPulse: Stock & Market Analytics Dashboard

QuantPulse is a production-ready financial dashboard that provides real-time stock market data, interactive visualizations, and machine learning-based price predictions.

## 🚀 Features
- **Real-time Data**: Live stock price updates and market trends.
- **Advanced Visualization**: Interactive Area charts using Recharts with Technical Indicators (MA, RSI).
- **ML Predictions**: Next-day price forecasting using Linear Regression (Python/FastAPI).
- **User Watchlist**: Personalized stock tracking.
- **Premium UI**: Modern dark-themed dashboard with smooth animations.
- **JWT Authentication**: Secure login and signup.

## 🛠️ Tech Stack
- **Frontend**: React.js, TypeScript, Recharts, Framer Motion, Lucide React.
- **Backend**: Node.js (Express), TypeScript, Prisma ORM, SQLite.
- **ML Service**: Python, FastAPI, Scikit-learn, YFinance.

## 📦 Project Structure
- `/frontend`: React client.
- `/backend`: Express API server.
- `/ml-service`: Python prediction engine.

## 🛠️ Setup Instructions

### 1. ML Service
```bash
cd ml-service
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt (fastapi, uvicorn, pandas, numpy, scikit-learn, yfinance)
python main.py
```

### 2. Backend
```bash
cd backend
npm install
npx prisma db push
npm run dev
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```

## 📊 ML Model Details
The prediction engine uses a **Linear Regression** model trained on the last 30 days of closing prices. It identifies trends and projects the next likely closing value, overlaying this on the dashboard charts for quick decision-making.
