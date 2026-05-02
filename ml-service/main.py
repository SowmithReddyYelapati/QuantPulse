from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
import time
import threading

from utils.data_fetcher import fetch_stock_data, add_technical_indicators
from models.predictor import StockPredictor
from utils.explainability import explain_prediction

app = FastAPI(title="QuantPulse Advanced ML Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── In-process caches ─────────────────────────────────────────────────────────
trained_models: dict = {}       # symbol -> StockPredictor  (lives for server lifetime)
prediction_cache: dict = {}     # symbol -> {data, ts}      (TTL = 120 seconds)
PREDICTION_CACHE_TTL = 120      # 2 minutes
PREWARM_SYMBOLS = ["AAPL", "TSLA", "MSFT"]  # pre-trained at startup

def _prewarm(symbol: str):
    """Background thread: train model + cache prediction so first user request is instant."""
    try:
        print(f"[Pre-warm START] {symbol}")
        from utils.data_fetcher import fetch_stock_data, add_technical_indicators
        from models.predictor import StockPredictor
        df_raw = fetch_stock_data(symbol, period="2y")
        df = add_technical_indicators(df_raw)
        predictor = StockPredictor(sequence_length=20)
        predictor.train(df)
        trained_models[symbol] = predictor
        print(f"[Pre-warm DONE ] {symbol}")
    except Exception as ex:
        print(f"[Pre-warm FAIL ] {symbol}: {ex}")

@app.on_event("startup")
async def startup_prewarm():
    """Fire-and-forget background threads so the server starts instantly."""
    for sym in PREWARM_SYMBOLS:
        t = threading.Thread(target=_prewarm, args=(sym,), daemon=True)
        t.start()

@app.get("/")
async def root():
    return {
        "message": "QuantPulse ML Service is running",
        "status": "online",
        "cached_models": list(trained_models.keys()),
        "cached_predictions": list(prediction_cache.keys()),
    }

@app.get("/predict")
async def predict_legacy(symbol: str):
    """Legacy endpoint — forwards to /predict/advanced."""
    return await predict_advanced(symbol)

@app.get("/predict/advanced")
async def predict_advanced(symbol: str):
    symbol = symbol.upper()
    try:
        # 1. Prediction cache hit → instant return ─────────────────────────
        now = time.time()
        if symbol in prediction_cache:
            entry = prediction_cache[symbol]
            age = now - entry["ts"]
            if age < PREDICTION_CACHE_TTL:
                print(f"[Cache HIT ] {symbol}  age={age:.1f}s")
                return {**entry["data"], "cached": True, "cache_age_seconds": round(age, 1)}
            print(f"[Cache EXPIRED] {symbol}")

        # 2. Fetch & engineer features ────────────────────────────────────
        df_raw = fetch_stock_data(symbol, period="2y")
        df_features = add_technical_indicators(df_raw)

        # 3. Train model once, then reuse ─────────────────────────────────
        if symbol not in trained_models:
            print(f"[Model TRAIN ] {symbol}")
            predictor = StockPredictor(sequence_length=30)
            predictor.train(df_features)
            trained_models[symbol] = predictor
        else:
            print(f"[Model REUSE ] {symbol}")
            predictor = trained_models[symbol]

        # 4. Predict ──────────────────────────────────────────────────────
        predictions = predictor.predict_next_day(df_features)

        # 5. SHAP explainability ──────────────────────────────────────────
        _, X_tab, _, _ = predictor.prepare_data(df_features, is_training=False)
        background_data = X_tab[-100:] if len(X_tab) >= 100 else X_tab
        instance_data = predictions["latest_features_scaled"].reshape(1, -1)
        shap_explanation = explain_prediction(
            predictor.rf_model, background_data, instance_data, predictor.feature_names
        )

        # 6. Build response ────────────────────────────────────────────────
        last_price = df_features["Close"].iloc[-1]
        ensemble_pred = predictions["ensemble_prediction"]
        pct_change = ((ensemble_pred - last_price) / last_price) * 100

        if pct_change > 1.5:
            signal, confidence = "Strong Buy", min(95, 50 + abs(pct_change) * 10)
        elif pct_change > 0.5:
            signal, confidence = "Buy", min(80, 50 + abs(pct_change) * 10)
        elif pct_change < -1.5:
            signal, confidence = "Strong Sell", min(95, 50 + abs(pct_change) * 10)
        elif pct_change < -0.5:
            signal, confidence = "Sell", min(80, 50 + abs(pct_change) * 10)
        else:
            signal, confidence = "Hold", 50 + abs(pct_change) * 5

        hist_df = df_features.tail(30).copy()
        hist_df["Date"] = hist_df.index.strftime("%Y-%m-%d")
        historical_records = hist_df.reset_index(drop=True).to_dict(orient="records")

        result = {
            "symbol": symbol,
            "current_price": float(last_price),
            "predictions": {
                "lstm": predictions["lstm_prediction"],
                "random_forest": predictions["rf_prediction"],
                "ensemble": predictions["ensemble_prediction"],
            },
            "predicted_price": predictions["ensemble_prediction"],
            "trend": "Uptrend" if ensemble_pred > last_price else "Downtrend",
            "trading_signal": signal,
            "confidence_score": float(confidence),
            "explainability": shap_explanation,
            "historical": historical_records,
        }

        # 7. Store in prediction cache ─────────────────────────────────────
        prediction_cache[symbol] = {"data": result, "ts": time.time()}
        print(f"[Cache SET  ] {symbol}")
        return result

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/cache/{symbol}")
async def invalidate_cache(symbol: str):
    """Manually bust the prediction cache for a symbol."""
    symbol = symbol.upper()
    prediction_cache.pop(symbol, None)
    return {"message": f"Cache cleared for {symbol}"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8001)
