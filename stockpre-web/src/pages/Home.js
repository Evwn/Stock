import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, MenuItem, Select, FormControl, InputLabel, CircularProgress, Box, Paper } from '@mui/material';
import { Line } from 'react-chartjs-2';

const API_BASE = process.env.REACT_APP_API_BASE || '';

export default function Home() {
  const [tickers, setTickers] = useState([]);
  const [selected, setSelected] = useState('');
  const [history, setHistory] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [stock, setStock] = useState(null);
  const [predictionDate, setPredictionDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch tickers from backend
    fetch(`${API_BASE}/api/prediction/tickers/`)
      .then(res => res.json())
      .then(data => {
        setTickers(data);
        if (data.length > 0) setSelected(data[0]);
      })
      .catch(() => setTickers([]));
  }, []);

  useEffect(() => {
    if (!selected) return;
    setLoading(true);
    setError('');
    Promise.all([
      fetch(`${API_BASE}/api/yahoo/chart/${selected}/`).then(res => res.json()),
      fetch(`${API_BASE}/api/prediction/create/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticker: selected })
      }).then(res => res.json())
    ]).then(([histData, predData]) => {
      setHistory(histData.chart || []);
      setPrediction(predData.prediction || null);
      setStock(predData.stock || null);
      setPredictionDate(predData.prediction_date || '');
      setLoading(false);
    }).catch(() => {
      setError('Failed to load data');
      setLoading(false);
    });
  }, [selected]);

  return (
    <Box>
      <Paper elevation={3} sx={{ p: 3, background: '#f8f8f8' }}>
        <Typography variant="h4" sx={{ color: '#2ecc40', fontWeight: 700, mb: 3 }}>
          Stock Prediction Dashboard
        </Typography>
        <FormControl variant="outlined" sx={{ minWidth: 220, mb: 3 }}>
          <InputLabel>Select Ticker</InputLabel>
          <Select
            value={selected}
            onChange={e => setSelected(e.target.value)}
            label="Select Ticker"
          >
            <MenuItem value=""><em>None</em></MenuItem>
            {tickers.map(t => (
              <MenuItem key={t} value={t}>{t}</MenuItem>
            ))}
          </Select>
        </FormControl>
        {loading && <Box mt={2}><CircularProgress color="secondary" /></Box>}
        {error && <Box mt={2}><Typography color="error">{error}</Typography></Box>}
        {!loading && !error && history.length > 0 && (
          <Card sx={{ mt: 3, background: '#fff' }}>
            <CardContent>
              <Typography variant="h6" sx={{ color: '#555', mb: 1 }}>
                {selected} - Last 1 Year
              </Typography>
              <Line
                data={{
                  labels: history.map(d => d.date),
                  datasets: [
                    {
                      label: 'Close Price',
                      data: history.map(d => d.close),
                      borderColor: '#2ecc40',
                      backgroundColor: 'rgba(46,204,64,0.15)', // Light green fill (will be ignored)
                      fill: false, // No area fill
                      tension: 0.2,
                      pointRadius: 0, // Remove dots
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { display: true },
                  },
                  scales: {
                    x: { ticks: { color: '#888' } },
                    y: { ticks: { color: '#888' } },
                  },
                }}
                height={300}
              />
            </CardContent>
          </Card>
        )}
        {prediction !== null && !loading && !error && (
          <Box mt={3}>
            <Card sx={{ background: '#e0fbe0', border: '1px solid #2ecc40' }}>
              <CardContent>
                {history.length > 0 && (
                  <Typography variant="subtitle1" sx={{ color: '#2ecc40', fontWeight: 600 }}>
                    Current Price:
                  </Typography>
                )}
                {history.length > 0 && (
                  <Typography variant="h5" sx={{ color: '#222', fontWeight: 700, mb: 1 }}>
                    {Number(history[history.length - 1].close).toFixed(2)}
                  </Typography>
                )}
                <Typography variant="subtitle1" sx={{ color: '#2ecc40', fontWeight: 600 }}>
                  Predicted Next Close:
                </Typography>
                <Typography variant="h5" sx={{ color: '#222', fontWeight: 700 }}>
                  {Number(prediction.future_value).toFixed(2)}
                </Typography>
                {prediction.lower_value !== undefined && prediction.upper_value !== undefined && (
                  <Typography variant="body2" sx={{ color: '#555', mt: 1 }}>
                    Range: {Number(prediction.lower_value).toFixed(2)} - {Number(prediction.upper_value).toFixed(2)}
                  </Typography>
                )}
                {predictionDate && (
                  <Typography variant="caption" color="textSecondary" sx={{ mt: 1 }}>
                    For: {predictionDate}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Box>
        )}
      </Paper>
    </Box>
  );
} 