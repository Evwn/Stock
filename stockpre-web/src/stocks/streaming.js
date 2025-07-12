// Remove Finnhub WebSocket dependency
// import { authToken } from '../App.js' 
// const socket = new WebSocket(`wss://ws.finnhub.io?token=${authToken}`);
// document.cookie = `X-Authorization=${authToken}; path=/` 

function getNextDailyBarTime(barTime) {
    const date = new Date(barTime);
    date.setDate(date.getDate() + 1);
    return date.getTime();
}

export function subscribeOnStream(
    symbolInfo,
    resolution,
    onRealtimeCallback,
    subscriberUID,
    onResetCacheNeededCallback,
    lastDailyBar
) {
    // Since we're using Yahoo Finance API, we'll implement a simple polling mechanism
    // instead of WebSocket streaming
    console.log('Subscribing to symbol:', symbolInfo.ticker);
    
    // For now, we'll just acknowledge the subscription
    // In a real implementation, you might want to set up polling here
}

export function unsubscribeFromStream(subscriberUID) {
    console.log('Unsubscribing from stream:', subscriberUID);
    // Clean up any polling intervals if needed
}