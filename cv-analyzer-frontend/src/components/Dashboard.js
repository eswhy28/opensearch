import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Grid, Button, CircularProgress } from '@mui/material';
import axios from 'axios';

const Dashboard = ({ user, handleTabChange }) => {
  const [jobCounts, setJobCounts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobCounts = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/job-application-count', {
          headers: {
            Authorization: `Bearer ${user.stsTokenManager.accessToken}`
          }
        });
        setJobCounts(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching job counts:', error);
        setLoading(false);
      }
    };

    fetchJobCounts();
  }, [user]);

  return (
    <Paper elevation={3} sx={{ padding: 4, borderRadius: '10px' }}>
      <Typography variant="h4" sx={{ fontWeight: 'bold', marginBottom: 3 }}>
        Welcome, {user.displayName}
      </Typography>
      <Typography variant="h6" sx={{ marginBottom: 2 }}>
        Here are your options:
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <Paper elevation={3} sx={{ padding: 3, borderRadius: '10px', textAlign: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', marginBottom: 2 }}>
              Jobs
            </Typography>
            <Typography variant="body1" sx={{ marginBottom: 2 }}>
              View and manage the jobs you have advertised.
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              sx={{ textTransform: 'none' }}
              onClick={() => handleTabChange(null, 'jobs')}
            >
              View Jobs
            </Button>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Paper elevation={3} sx={{ padding: 3, borderRadius: '10px', textAlign: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', marginBottom: 2 }}>
              Candidates
            </Typography>
            <Typography variant="body1" sx={{ marginBottom: 2 }}>
              View all candidates and their CVs analyzed for the jobs.
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              sx={{ textTransform: 'none' }}
              onClick={() => handleTabChange(null, 'previous')}
            >
              View Candidates
            </Button>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ padding: 3, borderRadius: '10px', textAlign: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', marginBottom: 2 }}>
              Job Application Counts
            </Typography>
            {loading ? (
              <CircularProgress />
            ) : (
              jobCounts.map((job, index) => (
                <Box key={index} sx={{ marginBottom: 2 }}>
                  <Typography variant="body1">
                    {job.job_name}: {job.count} applications
                  </Typography>
                </Box>
              ))
            )}
          </Paper>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default Dashboard;
