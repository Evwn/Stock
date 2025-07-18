import React, { useState } from 'react';
import { Card, CardContent, Typography, TextField, Button, Box, CircularProgress } from '@mui/material';

const API_BASE = process.env.REACT_APP_API_BASE || '';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.detail || 'Login failed. Please check your credentials.');
        setLoading(false);
        return;
      }
      if (data.token) {
        localStorage.setItem('authToken', data.token);
        window.location.href = '/profile';
      } else {
        setError('No token received from backend.');
      }
      setLoading(false);
    } catch (err) {
      setError('Login failed. Please check your credentials.');
      setLoading(false);
    }
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
      <Card sx={{ minWidth: 350, p: 3 }} elevation={3}>
        <CardContent>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
            Login
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              label="Username or Email"
              variant="outlined"
              fullWidth
              margin="normal"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />
            <TextField
              label="Password"
              type="password"
              variant="outlined"
              fullWidth
              margin="normal"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            {error && <Typography color="error" sx={{ mt: 1 }}>{error}</Typography>}
            <Box mt={2} display="flex" justifyContent="center">
              <Button type="submit" variant="contained" color="primary" disabled={loading} fullWidth>
                {loading ? <CircularProgress size={24} /> : 'Login'}
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
} 