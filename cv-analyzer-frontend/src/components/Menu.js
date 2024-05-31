import React from 'react';
import { AppBar, Toolbar, Button, Box } from '@mui/material';

const Menu = ({ currentTab, handleTabChange }) => {
  const buttonStyle = {
    color: 'white',
    flexGrow: 1,
    textTransform: 'none',
    backgroundColor: '#3f51b5',
    '&:hover': {
      backgroundColor: '#1f2a7a',
    },
  };

  const activeButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#1f2a7a',
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: '#3f51b5' }}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', flexGrow: 1 }}>
          <Button
            onClick={() => handleTabChange(null, 'dashboard')}
            sx={currentTab === 'dashboard' ? activeButtonStyle : buttonStyle}
          >
            Dashboard
          </Button>
          <Button
            onClick={() => handleTabChange(null, 'analyze')}
            sx={currentTab === 'analyze' ? activeButtonStyle : buttonStyle}
          >
            Analyze CV
          </Button>
          <Button
            onClick={() => handleTabChange(null, 'previous')}
            sx={currentTab === 'previous' ? activeButtonStyle : buttonStyle}
          >
            Previous Analyzed CVs
          </Button>
          <Button
            onClick={() => handleTabChange(null, 'jobs')}
            sx={currentTab === 'jobs' ? activeButtonStyle : buttonStyle}
          >
            Jobs
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Menu;
