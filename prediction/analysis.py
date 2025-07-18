import os
import pathlib
import tensorflow as tf
import numpy as np
import keras
import random
#import investpy as iv
import yfinance as yf
import json


SAMPLE_P = 50
RSI_P = 14
EMA12_P = 12
EMA26_P = 26
SMA_P = 15
# Gets Moving average convergence divergence for list of prices
# Allows for training parameter, which also generates the correct predictions


def get_macd(prices, train=True):
    SMA12 = 0
    EMA12_prev = 0
    EMA12 = 0
    SMA26 = 0
    EMA26_prev = 0
    EMA26 = 0
    MACD = []
    n = 0
    macd = []
    m = 0
    i = 0
    if train:
        a = 50
    else:
        a = 0
    price_correct = []
    while i < len(prices) - a:
        p = prices[i]
        if len(MACD) == SAMPLE_P - EMA26_P:
            macd.append(MACD)
            if train:
                y = 100*(prices[i+30]-prices[i])/prices[i]
                price_correct.append(y)
            SMA12 = 0
            EMA12_prev = 0
            EMA12 = 0
            SMA26 = 0
            EMA26_prev = 0
            EMA26 = 0
            MACD = []
            m += 1
            n = 0
            i = i - 45
        else:
            if n < EMA12_P:
                SMA12 += p
            elif n == EMA12_P:
                SMA12 = SMA12 / EMA12_P
                EMA12 = (p * (2 / (EMA12_P - 1))) + \
                    (SMA12 * (1 - (2 / (EMA12_P - 1))))
                EMA12_prev = EMA12
            else:
                EMA12 = (p * (2 / (EMA12_P - 1))) + \
                    (EMA12_prev * (1 - (2 / (EMA12_P - 1))))
                EMA12_prev = EMA12
            if n < EMA26_P:
                SMA26 += p
            elif n == EMA26_P:
                SMA26 = SMA26 / EMA26_P
                EMA26 = (p * (2 / (EMA26_P - 1))) + \
                    (SMA26 * (1 - (2 / (EMA26_P - 1))))
                EMA26_prev = EMA26
            else:
                EMA26 = (p * (2 / (EMA26_P - 1))) + \
                    (EMA26_prev * (1 - (2 / (EMA26_P - 1))))
                EMA26_prev = EMA26
            if n >= EMA26_P:
                MACD.append(EMA12 - EMA26)
            n += 1
        i += 1
    if train:
        return macd, price_correct
    else:
        return macd

# Calculates list of Relative Strength index for given percentages


def get_rsi(percents, train=True):
    rsi_gain = 0
    rsi_loss = 0
    rsi_init_gains = 0
    rsi_init_losses = 0
    rsi_prev_gain = 0
    rsi_prev_loss = 0
    RSI = []
    i = 0
    rsi = []
    n = 0
    m = 0
    a = 0
    if train:
        a = 50
    while i < len(percents) - a:
        delta = percents[i]
        if len(RSI) == SAMPLE_P - RSI_P:
            rsi.append(RSI)
            rsi_gain = 0
            rsi_loss = 0
            rsi_init_gains = 0
            rsi_init_losses = 0
            rsi_prev_gain = 0
            rsi_prev_loss = 0
            RSI = []
            n = 0
            m += 1
            i = i - 45
        else:
            if n < RSI_P:
                if delta < 0:
                    rsi_init_losses += delta
                else:
                    rsi_init_gains += delta
            elif n == RSI_P:
                if rsi_init_losses == 0:
                    RSI.append(0)
                    rsi_prev_gain = 0
                    rsi_prev_loss = 0
                else:
                    rsi_gain = rsi_init_gains / RSI_P
                    rsi_loss = -1 * rsi_init_losses / RSI_P
                    calc = 100 - (100 / (1 + (rsi_gain/rsi_loss)))
                    RSI.append(calc)
                    rsi_prev_gain = rsi_gain
                    rsi_prev_loss = rsi_loss
            else:
                gain = 0
                loss = 0
                if delta > 0:
                    gain = delta
                else:
                    loss = -1 * delta
                rsi_gain = (rsi_prev_gain * 13 + gain) / 14
                rsi_loss = (rsi_prev_loss * 13 + loss) / 14
                if rsi_loss == 0:
                    RSI.append(0)
                else:
                    calc = 100 - (100 / (1 + (rsi_gain/rsi_loss)))
                    RSI.append(calc)
                rsi_prev_gain = rsi_gain
                rsi_prev_loss = rsi_loss
            n += 1
        i += 1
    return rsi


def get_prediction(ticker):
    # Load ticker stats
    stats_path = pathlib.Path(__file__).parent.absolute() / 'ticker_stats.json'
    with open(stats_path, 'r') as f:
        ticker_stats = json.load(f)
    tickers = list(ticker_stats.keys())
    ticker_to_idx = {t: i for i, t in enumerate(tickers)}
    if ticker not in ticker_stats:
        raise ValueError(f"Ticker {ticker} not in model training set.")
    mean = ticker_stats[ticker]['mean']
    std = ticker_stats[ticker]['std']
    idx = ticker_to_idx[ticker]
    price_map = yf.Ticker(ticker).history(period="30d")
    closes = price_map['Close'].values
    if len(closes) < 10:
        closes = np.pad(closes, (10-len(closes), 0), 'constant', constant_values=closes[0])
    window = closes[-10:]
    norm_window = (window - mean) / std
    x_price = norm_window.reshape(1, 10, 1)
    x_ticker = np.array([[idx]])
    p = pathlib.Path(__file__).parent.absolute() / 'public_stock_model.h5'
    model = keras.models.load_model(p, compile=False)
    norm_pred = model.predict([x_price, x_ticker]).squeeze()
    pred = norm_pred * std + mean
    # For demo, return pred as all three values
    return (float(pred), float(pred), float(pred))
