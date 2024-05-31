import React from 'react';
import { Box, Button, Typography, Paper } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import { signInWithGoogle } from '../firebase';

const SignIn = ({ setUser }) => {
  const handleSignIn = async () => {
    const user = await signInWithGoogle();
    setUser(user);
  };

  return (
    <Paper elevation={3} sx={{ padding: 4, borderRadius: '10px', textAlign: 'center', maxWidth: 400, margin: 'auto', mt: 8 }}>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>
        Welcome to CV Analyzer
      </Typography>
      <Typography variant="body1" color="textSecondary" sx={{ mb: 4 }}>
        Sign in to continue
      </Typography>
      <Button 
        variant="contained" 
        color="primary" 
        startIcon={<GoogleIcon />} 
        onClick={handleSignIn}
        sx={{ textTransform: 'none', padding: '10px 20px', fontSize: '16px' }}
      >
        Sign In with Google
      </Button>
    </Paper>
  );
};

export default SignIn;
