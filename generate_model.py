import yfinance as yf
import numpy as np
from keras.models import Model
from keras.layers import LSTM, Dense, Input, Embedding, Concatenate, Flatten
import os
import csv
import json
import pandas as pd

# Ensure the prediction directory exists
os.makedirs('prediction', exist_ok=True)

# Must-have tickers (as before)
must_have_tickers = [
    "MSFT", "TSLA", "AAPL", "GOOGL", "AMZN", "META", "NVDA", "BRK-B", "JPM", "V", "UNH", "HD",
    "PG", "MA", "DIS", "BAC", "XOM", "PFE", "KO", "PEP", "CSCO", "NFLX", "T", "VZ", "WMT", "INTC",
    "ADBE", "CRM", "CMCSA", "ABT", "CVX", "MCD", "NKE", "MRK", "TMO", "LLY", "COST", "WFC", "MDT",
    "DHR", "BMY", "NEE", "TXN", "LIN", "HON", "UNP", "PM", "ORCL", "IBM", "QCOM", "SBUX", "GS",
    "LOW", "AMGN", "CAT", "BLK", "AXP", "GE", "SPGI", "PLD", "ISRG", "NOW", "BKNG", "LMT", "DE",
    "ZTS", "SYK", "CB", "GILD", "MO", "MMC", "TGT", "ADP", "CI", "USB", "C", "DUK", "SO", "PNC",
    "SCHW", "CL", "FIS", "APD", "BDX", "ICE", "GM", "FDX", "AON", "ITW", "SHW", "ECL", "PSA", "NSC",
    "ETN", "EMR", "AIG", "AEP", "D", "EXC", "ALL", "HUM", "SRE", "PEG", "AFL", "DOW", "STZ"
]

# S&P 500 tickers from Wikipedia
sp500_url = 'https://en.wikipedia.org/wiki/List_of_S%26P_500_companies'
sp500_table = pd.read_html(sp500_url, header=0)[0]
sp500_tickers = sp500_table['Symbol'].tolist()

# NASDAQ-100 tickers from Wikipedia
nasdaq100_url = 'https://en.wikipedia.org/wiki/NASDAQ-100'
nasdaq100_table = pd.read_html(nasdaq100_url, header=0)[4]
nasdaq100_tickers = nasdaq100_table['Ticker'].tolist()

# Combine all tickers, remove duplicates
all_tickers = set(must_have_tickers) | set(sp500_tickers) | set(nasdaq100_tickers)

# Fill up to 500 from CSV, skipping duplicates
TICKER_CSV = 'companylist.csv'
with open(TICKER_CSV, newline='', encoding='utf-8') as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
        symbol = row['Symbol'].strip()
        if symbol and symbol.isalnum():
            all_tickers.add(symbol)
        if len(all_tickers) >= 500:
            break

tickers = list(all_tickers)
print(f"Training on {len(tickers)} tickers: {tickers[:10]} ...")

ticker_to_idx = {ticker: idx for idx, ticker in enumerate(tickers)}
ticker_stats = {}
X_prices, X_tickers, y = [], [], []
window = 10

for ticker in tickers:
    try:
        closes = yf.Ticker(ticker).history(period='2y')['Close'].dropna().values
        if len(closes) <= window:
            print(f"Skipping {ticker}: not enough data.")
            continue
        mean = closes.mean()
        std = closes.std() if closes.std() > 0 else 1.0
        ticker_stats[ticker] = {'mean': float(mean), 'std': float(std)}
        norm_closes = (closes - mean) / std
        for i in range(len(norm_closes)-window):
            X_prices.append(norm_closes[i:i+window])
            X_tickers.append(ticker_to_idx[ticker])
            y.append(norm_closes[i+window])
        print(f"Added {ticker}: {len(closes)} days, {len(closes)-window} samples.")
    except Exception as e:
        print(f"Error with {ticker}: {e}")

X_prices = np.array(X_prices)
X_tickers = np.array(X_tickers)
y = np.array(y)
X_prices = X_prices.reshape((X_prices.shape[0], X_prices.shape[1], 1))
print(f"Total training samples: {X_prices.shape[0]}")

# Model definition
price_input = Input(shape=(window,1), name='price_input')
ticker_input = Input(shape=(1,), name='ticker_input')
ticker_emb = Embedding(input_dim=len(tickers), output_dim=8, input_length=1)(ticker_input)
ticker_emb_flat = Flatten()(ticker_emb)
lstm_out = LSTM(32)(price_input)
merged = Concatenate()([lstm_out, ticker_emb_flat])
dense_out = Dense(16, activation='relu')(merged)
output = Dense(1)(dense_out)
model = Model(inputs=[price_input, ticker_input], outputs=output)
model.compile(optimizer='adam', loss='mse')
model.fit([X_prices, X_tickers], y, epochs=10, batch_size=32, verbose=1)
model.save('prediction/public_stock_model.h5')

with open('prediction/ticker_stats.json', 'w') as f:
    json.dump(ticker_stats, f)

print("Model and ticker stats saved to prediction/public_stock_model.h5 and prediction/ticker_stats.json") 