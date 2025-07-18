import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import { NavLink, useLocation } from 'react-router-dom';

const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'Charts', path: '/charts' },
  { label: 'Prediction', path: '/prediction' },
  { label: 'Login', path: '/login' },
  { label: 'Register', path: '/register' },
];

export default function AppLayout({ children }) {
  const location = useLocation();
  const isAuthenticated = !!localStorage.getItem('authToken');
  return (
    <>
      <AppBar position="static" sx={{ background: 'linear-gradient(90deg, #2ecc40 0%, #e0e0e0 100%)', color: '#222', mb: 4 }} elevation={2}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700, color: '#2ecc40', letterSpacing: 1, textDecoration: 'none' }} component={NavLink} to="/">
            Stock Prediction
          </Typography>
          {navLinks
            .filter(link => {
              if (isAuthenticated && (link.label === 'Login' || link.label === 'Register')) return false;
              return true;
            })
            .map((link) => (
              <Button
                key={link.path}
                component={NavLink}
                to={link.path}
                sx={{ ml: 2, color: '#222', fontWeight: 600, textTransform: 'none', borderBottom: location.pathname === link.path ? '2px solid #2ecc40' : 'none' }}
              >
                {link.label}
              </Button>
            ))}
        </Toolbar>
      </AppBar>
      <Container maxWidth="md" sx={{ mt: 4 }}>
        {children}
      </Container>
    </>
  );
} 