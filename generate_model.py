import yfinance as yf
import numpy as np
from keras.models import Sequential
from keras.layers import LSTM, Dense
import os
import csv

# Ensure the prediction directory exists
os.makedirs('prediction', exist_ok=True)

# Read first 100 tickers from companylist.csv
TICKER_CSV = 'companylist.csv'
tickers = []
with open(TICKER_CSV, newline='', encoding='utf-8') as csvfile:
    reader = csv.DictReader(csvfile)
    for i, row in enumerate(reader):
        if i >= 100:
            break
        symbol = row['Symbol'].strip()
        if symbol and symbol.isalnum():
            tickers.append(symbol)

print(f"Training on {len(tickers)} tickers: {tickers[:5]} ...")

X, y = [], []
window = 10
for ticker in tickers:
    try:
        closes = yf.Ticker(ticker).history(period='2y')['Close'].dropna().values
        if len(closes) <= window:
            print(f"Skipping {ticker}: not enough data.")
            continue
        for i in range(len(closes)-window):
            X.append(closes[i:i+window])
            y.append(closes[i+window])
        print(f"Added {ticker}: {len(closes)} days, {len(closes)-window} samples.")
    except Exception as e:
        print(f"Error with {ticker}: {e}")

X, y = np.array(X), np.array(y)
X = X.reshape((X.shape[0], X.shape[1], 1))
print(f"Total training samples: {X.shape[0]}")

model = Sequential([
    LSTM(32, input_shape=(window,1)),
    Dense(1)
])
model.compile(optimizer='adam', loss='mse')
model.fit(X, y, epochs=10, batch_size=32, verbose=1)
model.save('prediction/public_stock_model.h5')
print("Model saved to prediction/public_stock_model.h5") 