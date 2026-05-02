import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
from sklearn.ensemble import RandomForestRegressor
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout
from tensorflow.keras.callbacks import EarlyStopping

class StockPredictor:
    def __init__(self, sequence_length=20):  # reduced from 30→20
        self.sequence_length = sequence_length
        self.scaler_X = MinMaxScaler()
        self.scaler_y = MinMaxScaler()
        self.lstm_model = None
        self.rf_model = None

    def prepare_data(self, df: pd.DataFrame, is_training=True):
        features = [col for col in df.columns if col not in ['Target', 'index', 'Date']]
        if not features:
            raise ValueError("No features available for training.")

        X_raw = df[features].values
        y_raw = df['Target'].values.reshape(-1, 1)

        X_scaled = (self.scaler_X.fit_transform(X_raw) if is_training
                    else self.scaler_X.transform(X_raw))
        y_scaled = (self.scaler_y.fit_transform(y_raw) if is_training
                    else self.scaler_y.transform(y_raw))

        X_seq, y_seq = [], []
        for i in range(len(X_scaled) - self.sequence_length):
            X_seq.append(X_scaled[i:i + self.sequence_length])
            y_seq.append(y_scaled[i + self.sequence_length])

        X_seq = np.array(X_seq)
        y_seq = np.array(y_seq)
        X_tab = X_scaled[self.sequence_length:]
        return X_seq, X_tab, y_seq, features

    def build_lstm(self, input_shape):
        """Lean LSTM — 32 units instead of 50, single dropout."""
        model = Sequential([
            LSTM(units=32, return_sequences=True, input_shape=input_shape),
            Dropout(0.1),
            LSTM(units=32, return_sequences=False),
            Dense(units=16, activation='relu'),
            Dense(units=1)
        ])
        model.compile(optimizer='adam', loss='mean_squared_error')
        return model

    def train(self, df: pd.DataFrame):
        X_seq, X_tab, y_seq, self.feature_names = self.prepare_data(df, is_training=True)

        # LSTM: max 5 epochs, early stopping at patience=2 → often finishes in 2-3 epochs
        self.lstm_model = self.build_lstm((X_seq.shape[1], X_seq.shape[2]))
        early_stop = EarlyStopping(monitor='loss', patience=2, restore_best_weights=True)
        self.lstm_model.fit(
            X_seq, y_seq,
            batch_size=64,       # larger batch = faster GPU/CPU utilisation
            epochs=5,
            verbose=0,
            callbacks=[early_stop]
        )

        # Random Forest: 50 trees (was 100), max_depth cap avoids slow deep trees
        self.rf_model = RandomForestRegressor(
            n_estimators=50,
            max_depth=10,
            n_jobs=-1,           # use all CPU cores
            random_state=42
        )
        self.rf_model.fit(X_tab, y_seq.ravel())

    def predict_next_day(self, df: pd.DataFrame):
        if self.lstm_model is None or self.rf_model is None:
            raise ValueError("Models not trained yet.")

        recent_df = df.tail(self.sequence_length)
        features = [col for col in recent_df.columns if col not in ['Target', 'index', 'Date']]
        X_raw = recent_df[features].values
        X_scaled = self.scaler_X.transform(X_raw)

        X_seq_pred = np.array([X_scaled])
        X_tab_pred = np.array([X_scaled[-1]])

        lstm_pred_scaled = self.lstm_model.predict(X_seq_pred, verbose=0)
        rf_pred_scaled = self.rf_model.predict(X_tab_pred).reshape(-1, 1)
        ensemble_pred_scaled = (lstm_pred_scaled + rf_pred_scaled) / 2.0

        lstm_pred = self.scaler_y.inverse_transform(lstm_pred_scaled)[0][0]
        rf_pred = self.scaler_y.inverse_transform(rf_pred_scaled)[0][0]
        ensemble_pred = self.scaler_y.inverse_transform(ensemble_pred_scaled)[0][0]

        return {
            "lstm_prediction": float(lstm_pred),
            "rf_prediction": float(rf_pred),
            "ensemble_prediction": float(ensemble_pred),
            "latest_features_scaled": X_tab_pred[0]
        }
