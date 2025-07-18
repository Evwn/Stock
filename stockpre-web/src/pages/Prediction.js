import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, MenuItem, Select, FormControl, InputLabel, CircularProgress, Box, Paper } from '@mui/material';

const API_BASE = process.env.REACT_APP_API_BASE || '';

export default function Prediction() {
  const [tickers, setTickers] = useState([]);
  const [selected, setSelected] = useState('');
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stock, setStock] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/prediction/tickers/`)
      .then(res => res.json())
      .then(data => setTickers(data))
      .catch(() => setError('Failed to load tickers'));
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
      setStock(histData.chart || []);
      setPrediction(predData.prediction || null);
      setLoading(false);
    }).catch(() => {
      setError('Failed to load prediction');
      setLoading(false);
    });
  }, [selected]);

  return (
    <Box>
      <Paper elevation={3} sx={{ p: 3, background: '#f8f8f8' }}>
        <Typography variant="h4" sx={{ color: '#2ecc40', fontWeight: 700, mb: 3 }}>
          Prediction
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
        {!loading && !error && prediction && (
          <Card sx={{ mt: 3, background: '#e0fbe0', border: '1px solid #2ecc40' }}>
            <CardContent>
              {stock && stock.length > 0 && (
                <>
                  <Typography variant="subtitle1" sx={{ color: '#2ecc40', fontWeight: 600 }}>
                    Current Price:
                  </Typography>
                  <Typography variant="h5" sx={{ color: '#222', fontWeight: 700, mb: 1 }}>
                    {Number(stock[stock.length - 1].close).toFixed(2)}
                  </Typography>
                </>
              )}
              <Typography variant="h6" sx={{ color: '#2ecc40', mb: 1 }}>
                {selected} Prediction
              </Typography>
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
              {prediction.prediction_date && (
                <Typography variant="caption" color="textSecondary" sx={{ mt: 1 }}>
                  For: {prediction.prediction_date}
                </Typography>
              )}
            </CardContent>
          </Card>
        )}
      </Paper>
    </Box>
  );
} 