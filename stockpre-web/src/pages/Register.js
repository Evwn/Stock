import React, { useState } from 'react';
import { Card, CardContent, Typography, TextField, Button, Box, CircularProgress } from '@mui/material';

const API_BASE = process.env.REACT_APP_API_BASE || '';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!username || !password) {
      setError('Username and password are required.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.detail || 'Registration failed. Please try again.');
        setLoading(false);
        return;
      }
      if (data.token) {
        localStorage.setItem('authToken', data.token);
        window.location.href = '/profile';
      } else {
        window.location.href = '/login';
      }
      setLoading(false);
    } catch (err) {
      setError('Registration failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
      <Card sx={{ minWidth: 350, p: 3 }} elevation={3}>
        <CardContent>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
            Register
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              label="Username"
              variant="outlined"
              fullWidth
              margin="normal"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />
            <TextField
              label="Email"
              type="email"
              variant="outlined"
              fullWidth
              margin="normal"
              value={email}
              onChange={e => setEmail(e.target.value)}
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
            <TextField
              label="Confirm Password"
              type="password"
              variant="outlined"
              fullWidth
              margin="normal"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              required
            />
            {error && <Typography color="error" sx={{ mt: 1 }}>{error}</Typography>}
            <Box mt={2} display="flex" justifyContent="center">
              <Button type="submit" variant="contained" color="primary" disabled={loading} fullWidth>
                {loading ? <CircularProgress size={24} /> : 'Register'}
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
} 