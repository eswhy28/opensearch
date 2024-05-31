import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import { Box } from '@mui/system';
import { signInWithGoogle, signOut } from '../firebase';

const Header = ({ user, setUser }) => {
  const handleSignIn = async () => {
    const user = await signInWithGoogle();
    setUser(user);
  };

  const handleSignOut = async () => {
    await signOut();
    setUser(null);
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: '#3f51b5', boxShadow: 'none', padding: '0 20px' }}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', letterSpacing: 1 }}>
          CV Analyzer
        </Typography>
        {user ? (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body1" sx={{ marginRight: 2, fontWeight: '500' }}>
              {user.displayName}
            </Typography>
            <Avatar alt={user.displayName} src={user.photoURL} sx={{ marginRight: 2, border: '2px solid #fff' }} />
            <Button 
              color="inherit" 
              onClick={handleSignOut} 
              sx={{ 
                backgroundColor: '#f50057', 
                color: '#fff', 
                '&:hover': { backgroundColor: '#c51162' },
                textTransform: 'none',
                padding: '6px 16px',
                fontSize: '1rem'
              }}
            >
              Sign Out
            </Button>
          </Box>
        ) : (
          <Button 
            color="inherit" 
            onClick={handleSignIn} 
            sx={{ 
              backgroundColor: '#f50057', 
              color: '#fff', 
              '&:hover': { backgroundColor: '#c51162' },
              textTransform: 'none',
              padding: '6px 16px',
              fontSize: '1rem'
            }}
          >
            Sign In with Google
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;
