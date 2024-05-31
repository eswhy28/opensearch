import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const Jobs = ({ user }) => {
  const [jobs, setJobs] = useState([]);
  const [open, setOpen] = useState(false);
  const [candidatesOpen, setCandidatesOpen] = useState(false);
  const [jobName, setJobName] = useState('');
  const [dateOpen, setDateOpen] = useState('');
  const [dateClose, setDateClose] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [candidatesLoading, setCandidatesLoading] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/cvs/job-descriptions', {
          headers: {
            Authorization: `Bearer ${user.stsTokenManager.accessToken}`
          }
        });
        setJobs(response.data);
      } catch (error) {
        console.error("Error fetching jobs", error);
      }
    };

    fetchJobs();
  }, [user]);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setJobName('');
    setDateOpen('');
    setDateClose('');
    setDescription('');
  };

  const handleCreateJob = async () => {
    if (!jobName || !dateOpen || !dateClose || !description) {
      setSnackbarMessage('All fields are required.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        'http://localhost:8000/api/cvs/job-descriptions/',
        { job_name: jobName, date_open: dateOpen, date_close: dateClose, description: description },
        {
          headers: {
            Authorization: `Bearer ${user.stsTokenManager.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      setJobs([...jobs, response.data]);
      setSnackbarMessage('Job created successfully.');
      setSnackbarSeverity('success');
      handleClose();
    } catch (error) {
      setSnackbarMessage(`Error creating job: ${error.message}`);
      setSnackbarSeverity('error');
    } finally {
      setLoading(false);
      setSnackbarOpen(true);
    }
  };

  const handleViewCandidates = async (jobId) => {
    setCandidatesLoading(true);
    setSelectedJobId(jobId);
    try {
      const response = await axios.get(`http://localhost:8000/api/top-candidates/${jobId}/`, {
        headers: {
          Authorization: `Bearer ${user.stsTokenManager.accessToken}`
        }
      });
      setCandidates(response.data);
      setCandidatesOpen(true);
    } catch (error) {
      setSnackbarMessage(`Error fetching candidates: ${error.message}`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setCandidatesLoading(false);
    }
  };

  const handleCandidatesClose = () => {
    setCandidatesOpen(false);
    setCandidates([]);
    setSelectedJobId(null);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 'bold', marginBottom: 3 }}>
        Jobs
      </Typography>
      <Button variant="contained" color="primary" onClick={handleClickOpen} sx={{ marginBottom: 3 }}>
        Create New Job
      </Button>
      <Grid container spacing={3}>
        {jobs.map((job) => (
          <Grid item xs={12} sm={6} md={4} key={job.job_id}>
            <Accordion>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
              >
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {job.job_name}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" color="textSecondary" sx={{ marginBottom: 1 }}>
                  Open: {job.date_open}
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ marginBottom: 2 }}>
                  Close: {job.date_close}
                </Typography>
                <Typography variant="body2" sx={{ marginBottom: 2 }}>
                  {job.description}
                </Typography>
                <Button variant="contained" color="secondary" onClick={() => handleViewCandidates(job.job_id)}>
                  View Candidates
                </Button>
              </AccordionDetails>
            </Accordion>
          </Grid>
        ))}
      </Grid>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Create New Job</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            required
            margin="dense"
            label="Job Name"
            fullWidth
            value={jobName}
            onChange={(e) => setJobName(e.target.value)}
          />
          <TextField
            required
            margin="dense"
            label="Date Open"
            type="date"
            fullWidth
            value={dateOpen}
            onChange={(e) => setDateOpen(e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
          />
          <TextField
            required
            margin="dense"
            label="Date Close"
            type="date"
            fullWidth
            value={dateClose}
            onChange={(e) => setDateClose(e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
          />
          <TextField
            required
            margin="dense"
            label="Job Description"
            multiline
            rows={4}
            fullWidth
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleCreateJob} color="primary" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={candidatesOpen} onClose={handleCandidatesClose}>
        <DialogTitle>Top Candidates</DialogTitle>
        <DialogContent>
          {candidatesLoading ? (
            <CircularProgress />
          ) : candidates.length > 0 ? (
            candidates.map((candidate, index) => (
              <Paper key={index} elevation={3} sx={{ padding: 2, marginBottom: 2 }}>
                <Typography variant="body1">
                  {candidate.name} - {candidate.email}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Score: {candidate.score}
                </Typography>
              </Paper>
            ))
          ) : (
            <Typography>No candidates found with a score above 80.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCandidatesClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Jobs;
