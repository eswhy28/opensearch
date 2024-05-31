import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Grid, CircularProgress, Paper, MenuItem, Select, FormControl, InputLabel, Snackbar, Alert, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import ResultList from './ResultList';

const UploadForm = ({ user }) => {
  const [jobDescriptions, setJobDescriptions] = useState([]);
  const [selectedJob, setSelectedJob] = useState('');
  const [files, setFiles] = useState([]);
  const [results, setResults] = useState([]);
  const [skippedCVs, setSkippedCVs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  useEffect(() => {
    const fetchJobDescriptions = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/cvs/job-descriptions', {
          headers: {
            Authorization: `Bearer ${user.stsTokenManager.accessToken}`
          }
        });
        setJobDescriptions(response.data);
      } catch (error) {
        console.error("Error fetching job descriptions", error);
      }
    };

    fetchJobDescriptions();
  }, [user]);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const validFiles = selectedFiles.filter(file => file.type === 'application/pdf' && file.size <= 5 * 1024 * 1024);

    if (validFiles.length > 10) {
      window.alert('You can upload a maximum of 10 files.');
      return;
    }

    if (validFiles.length !== selectedFiles.length) {
      window.alert('Some files were not valid PDFs or exceeded 5 MB.');
    }

    setFiles(validFiles);
  };

  const handleRemoveFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (files.length === 0) {
      window.alert('Please upload at least one PDF file.');
      return;
    }
    if (!selectedJob) {
      window.alert('Please select a job description.');
      return;
    }

    const formData = new FormData();
    formData.append('job_description', selectedJob);
    files.forEach(file => {
      formData.append('files', file);
    });

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:8000/api/cvs/analyze', formData, {
        headers: {
          Authorization: `Bearer ${user.stsTokenManager.accessToken}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      const { results, skipped_cvs } = response.data;
      setResults(results); // Store all results
      setSkippedCVs(skipped_cvs);
      setSnackbarMessage('CV analysis completed successfully.');
      setSnackbarSeverity('success');
      setFiles([]); // Clear attached files after processing
    } catch (error) {
      setSnackbarMessage(`Error uploading files: ${error.message}`);
      setSnackbarSeverity('error');
    } finally {
      setLoading(false);
      setSnackbarOpen(true);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <Paper elevation={3} sx={{ padding: 4, borderRadius: 2 }}>
      <Typography variant="h5" sx={{ fontWeight: 'bold', marginBottom: 2 }}>
        Upload your resumes for analysis
      </Typography>
      <Typography variant="body2" color="textSecondary" sx={{ marginBottom: 4 }}>
        Select a job description and upload your resumes (PDF files, maximum 5 MB each, up to 10 files).
      </Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ marginBottom: 3 }}>
        <FormControl fullWidth sx={{ marginBottom: 3 }}>
          <InputLabel id="job-select-label">Job Description</InputLabel>
          <Select
            labelId="job-select-label"
            value={selectedJob}
            onChange={(e) => setSelectedJob(e.target.value)}
            label="Job Description"
          >
            {jobDescriptions.map((job) => (
              <MenuItem key={job.job_id} value={job.job_name}>
                {job.job_name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Typography variant="body2" color="textSecondary" sx={{ marginBottom: 2 }}>
          Please upload PDF files. Maximum size: 5 MB each. Maximum 10 files.
        </Typography>
        <Grid container spacing={2} sx={{ marginBottom: 3 }}>
          <Grid item>
            <Button variant="contained" component="label" sx={{ textTransform: 'none' }}>
              Upload CVs
              <input type="file" multiple hidden onChange={handleFileChange} />
            </Button>
          </Grid>
        </Grid>
        {files.length > 0 && (
          <Box sx={{ marginBottom: 2 }}>
            {files.map((file, index) => (
              <Box key={index} display="flex" alignItems="center">
                <Typography variant="body2" sx={{ flexGrow: 1 }}>
                  {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </Typography>
                <IconButton onClick={() => handleRemoveFile(index)}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}
          </Box>
        )}
        {results.length > 0 && (
          <Box sx={{ maxHeight: '300px', overflowY: 'auto' }}>
            <ResultList results={results} />
          </Box>
        )}
        {skippedCVs.length > 0 && (
          <Box sx={{ marginTop: 2 }}>
            <Typography variant="body2" color="error">
              Skipped CVs (missing email or name):
            </Typography>
            {skippedCVs.map((fileName, index) => (
              <Typography key={index} variant="body2" color="error">
                {fileName}
              </Typography>
            ))}
          </Box>
        )}
      </Box>
      <Grid container justifyContent="flex-end">
        <Button
          variant="contained"
          color="secondary"
          sx={{ textTransform: 'none' }}
          onClick={handleSubmit}
          disabled={loading || !selectedJob || files.length === 0}
        >
          {loading ? <CircularProgress size={24} /> : 'Next'}
        </Button>
      </Grid>
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default UploadForm;
