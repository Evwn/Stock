import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, MenuItem, Select, FormControl, InputLabel, CircularProgress, Box, Paper } from '@mui/material';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LineController,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  LineElement,
  PointElement,
  LineController,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
);

const API_BASE = process.env.REACT_APP_API_BASE || '';

export default function Charts() {
  const [tickers, setTickers] = useState([]);
  const [selected, setSelected] = useState('');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${API_BASE}/api/prediction/tickers/`)
      .then(res => res.json())
      .then(data => {
        setTickers(data);
        if (data.length > 0) setSelected(data[0]);
      })
      .catch(() => setError('Failed to load tickers'));
  }, []);

  useEffect(() => {
    if (!selected) return;
    setLoading(true);
    setError('');
    fetch(`${API_BASE}/api/yahoo/chart/${selected}/`)
      .then(res => res.json())
      .then(histData => {
        setHistory(histData.chart || []);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load chart data');
        setLoading(false);
      });
  }, [selected]);

  return (
    <Box>
      <Paper elevation={3} sx={{ p: 3, background: '#f8f8f8' }}>
        <Typography variant="h4" sx={{ color: '#2ecc40', fontWeight: 700, mb: 3 }}>
          Charts
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
                {selected} - Last 6 Months
              </Typography>
              <Line
                data={{
                  labels: history.map(d => d.date),
                  datasets: [
                    {
                      label: 'Close Price',
                      data: history.map(d => d.close),
                      borderColor: '#2ecc40',
                      backgroundColor: 'rgba(46,204,64,0.1)',
                      fill: true,
                      tension: 0.2,
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
      </Paper>
    </Box>
  );
} 