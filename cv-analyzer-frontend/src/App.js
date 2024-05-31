import React, { useState } from 'react';
import { Container, CssBaseline, Typography } from '@mui/material';
import { Box } from '@mui/system';
import Menu from './components/Menu';
import UploadForm from './components/UploadForm';
import PreviousAnalyzedCVs from './components/PreviousAnalyzedCVs';
import SignIn from './components/SignIn';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Jobs from './components/Jobs';
import { signOut } from './firebase';

function App() {
  const [user, setUser] = useState(null);
  const [currentTab, setCurrentTab] = useState('dashboard');

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const handleSignOut = async () => {
    await signOut();
    setUser(null);
  };

  return (
    <div>
      <CssBaseline />
      <Header user={user} setUser={setUser} />
      {user && <Menu currentTab={currentTab} handleTabChange={handleTabChange} />}
      <Container>
        {user ? (
          <>
            {currentTab === 'dashboard' && (
              <Box sx={{ marginTop: 4 }}>
                <Dashboard user={user} handleTabChange={handleTabChange} />
              </Box>
            )}
            {currentTab === 'analyze' && (
              <Box sx={{ marginTop: 4 }}>
                <UploadForm user={user} />
              </Box>
            )}
            {currentTab === 'previous' && (
              <Box sx={{ marginTop: 4 }}>
                <PreviousAnalyzedCVs user={user} />
              </Box>
            )}
            {currentTab === 'jobs' && (
              <Box sx={{ marginTop: 4 }}>
                <Jobs user={user} />
              </Box>
            )}
          </>
        ) : (
          <Box sx={{ marginTop: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="h5" sx={{ marginBottom: 2 }}>
              Welcome to CV Analyzer
            </Typography>
            <SignIn setUser={setUser} />
          </Box>
        )}
      </Container>
    </div>
  );
}

export default App;
