import { subscribeOnStream, unsubscribeFromStream } from './streaming.js'
// Remove Finnhub import and API key setup
// const finnhub = require('finnhub');
// const api_key = finnhub.ApiClient.instance.authentications['api_key'];
// api_key.apiKey = authToken;

const lastBarsCache = new Map();

const configurationData = {
    supported_resolutions: ['1D', '1W', '1M'], // Will need to check if these resolutions are valid
    exchanges: [
        {
            value: 'NYSE',
            name: 'NYSE',
            desc: 'New York Stock Exchange'
        }
    ],
    symbol_types: [
        {
            name: 'Common Stock',
            value: 'stock'
        }
    ]
};

export default {
    onReady: (
        callback
    ) => {
        setTimeout(() => callback(configurationData));
    },
    resolveSymbol: async (
        symbolName,
        onSymbolResolvedCallback,
        onResolveErrorCallback
    ) => {
        // Use Yahoo Finance API instead of Finnhub
        try {
            const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${symbolName}?interval=1d&range=1d`);
            const data = await response.json();
            
            if (data.chart.result && data.chart.result.length > 0) {
                const symbolInfo = {
                    ticker: symbolName,
                    name: symbolName,
                    description: symbolName,
                    type: 'stock',
                    session: '24x7',
                    timezone: 'Etc/UTC',
                    exchange: "NYSE",
                    minmov: 1,
                    pricescale: 100,
                    has_intraday: false,
                    has_no_volume: true,
                    has_weekly_and_monthly: false,
                    supported_resolutions: configurationData.supported_resolutions,
                    volume_precision: 2,
                    data_status: 'streaming',
                };
                onSymbolResolvedCallback(symbolInfo);
            } else {
                onResolveErrorCallback(`Cannot resolve symbol: ${symbolName}`);
            }
        } catch (error) {
            onResolveErrorCallback(`Cannot resolve symbol: ${symbolName}`);
        }
    },
    getBars: async (
        symbolInfo,
        resolution,
        from,
        to,
        onHistoryCallback,
        onErrorCallback,
        firstDataRequest
    ) => {
        const TV2YahooResolutions = {"1D":"1d", "1W":"5d", "1M":"1mo"};
        
        try {
            const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${symbolInfo.ticker}?interval=${TV2YahooResolutions[resolution]}&period1=${from}&period2=${to}`);
            const data = await response.json();
            
            if (data.chart.result && data.chart.result.length > 0) {
                const result = data.chart.result[0];
                const timestamps = result.timestamp;
                const quotes = result.indicators.quote[0];
                
                let bars = [];
                for (let i = 0; i < timestamps.length; i++) {
                    if (quotes.open[i] && quotes.high[i] && quotes.low[i] && quotes.close[i]) {
                        bars.push({
                            time: timestamps[i] * 1000,
                            low: quotes.low[i],
                            high: quotes.high[i],
                            open: quotes.open[i],
                            close: quotes.close[i]
                        });
                    }
                }
                
                if (firstDataRequest && bars.length > 0) {
                    lastBarsCache.set(symbolInfo.ticker, { ...bars[bars.length - 1] });
                }
                
                onHistoryCallback(bars, {noData: bars.length === 0});
            } else {
                onHistoryCallback([], {noData: true});
            }
        } catch (error) {
            onErrorCallback(error);
        }
    },
    searchSymbols: async (
        userInput,
        exchange,
        symbolType,
        onResultReadyCallback
    ) => {
        console.log("SEARCHED");
        // Implement symbol search if needed
        onResultReadyCallback([]);
    },
    subscribeBars: (
        symbolInfo,
        resolution,
        onRealtimeCallback,
        subscribeUID,
        onResetCacheNeededCallback
    ) => {
        subscribeOnStream(
            symbolInfo.ticker,
            resolution,
            onRealtimeCallback,
            subscribeUID,
            onResetCacheNeededCallback,
            lastBarsCache.get(symbolInfo.ticker)
        );
    },
    unsubscribeBars: (
        subscriberUID
    ) => {
        unsubscribeFromStream(subscriberUID);
    }
};
