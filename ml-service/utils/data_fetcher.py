import yfinance as yf
import pandas as pd
from ta import add_all_ta_features
from ta.utils import dropna
import numpy as np

def fetch_stock_data(symbol: str, period: str = "2y") -> pd.DataFrame:
    """Fetch historical stock data from Yahoo Finance, with fallback to mock data."""
    try:
        stock = yf.Ticker(symbol)
        df = stock.history(period=period)
        if df.empty:
            raise ValueError(f"No data found for symbol: {symbol}")
        df.index = df.index.tz_localize(None)
        return df
    except Exception as e:
        print(f"Yahoo Finance fetch failed for {symbol}: {e}. Falling back to mock data.")
        # Generate 2 years of mock data (roughly 500 trading days)
        dates = pd.date_range(end=pd.Timestamp.today(), periods=500, freq='B')
        
        # Random walk for prices
        np.random.seed(42)
        returns = np.random.normal(0.001, 0.02, 500)
        close_prices = 150.0 * np.exp(np.cumsum(returns))
        
        df = pd.DataFrame(index=dates)
        df['Close'] = close_prices
        df['Open'] = df['Close'] * np.random.normal(1, 0.005, 500)
        df['High'] = df[['Open', 'Close']].max(axis=1) * np.random.normal(1.005, 0.002, 500)
        df['Low'] = df[['Open', 'Close']].min(axis=1) * np.random.normal(0.995, 0.002, 500)
        df['Volume'] = np.random.randint(1000000, 10000000, 500)
        
        return df

def add_technical_indicators(df: pd.DataFrame) -> pd.DataFrame:
    """Add technical indicators using the 'ta' library."""
    # Ensure dataset has required columns
    required_cols = ['Open', 'High', 'Low', 'Close', 'Volume']
    if not all(col in df.columns for col in required_cols):
        raise ValueError("Missing required columns for technical indicators")
        
    df_clean = dropna(df)
    
    # Add all ta features
    df_ta = add_all_ta_features(
        df_clean, open="Open", high="High", low="Low", close="Close", volume="Volume", fillna=True
    )
    
    # We select a subset of important features to avoid dimensionality curse
    important_features = [
        'Close', 'Volume', 
        'trend_macd', 'trend_macd_signal', 'trend_macd_diff',
        'momentum_rsi', 'momentum_stoch',
        'volatility_bbm', 'volatility_bbh', 'volatility_bbl',
        'trend_sma_fast', 'trend_sma_slow'
    ]
    
    # Only keep important features that exist
    features_to_keep = [f for f in important_features if f in df_ta.columns]
    
    # We will also add basic moving averages if they are missing
    if 'trend_sma_fast' not in df_ta.columns:
         df_ta['SMA_20'] = df_ta['Close'].rolling(window=20).mean()
    if 'trend_sma_slow' not in df_ta.columns:
         df_ta['SMA_50'] = df_ta['Close'].rolling(window=50).mean()

    # Create target variable: Next day's close price
    df_ta['Target'] = df_ta['Close'].shift(-1)
    
    # Drop the last row since it doesn't have a target
    df_ta = df_ta.iloc[:-1]
    
    return df_ta.fillna(method='bfill')
