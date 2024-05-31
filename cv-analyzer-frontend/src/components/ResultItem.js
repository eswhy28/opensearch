import React, { useState } from 'react';
import { Box, Typography, Paper, Grid, Modal } from '@mui/material';
import GaugeChart from 'react-gauge-chart';

const ResultItem = ({ result }) => {
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: '10px' }}>
      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
        CV Analysis Result for {result.job.job_name}
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Score: <strong>{result?.score ?? ''}</strong>
          </Typography>
          <GaugeChart
            id="gauge-chart"
            nrOfLevels={20}
            colors={['#ff9800', '#4caf50']}
            arcWidth={0.3}
            percent={result?.score ? result.score / 100 : 0}
            textColor="#000"
            formatTextValue={(value) => `${value}%`}
            style={{ width: '100%' }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Experience: <strong>{result?.features?.experience ?? ''}</strong>
          </Typography>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Skills: <strong>{result?.features?.skills ?? ''}</strong>
          </Typography>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Education: <strong>{result?.features?.education ?? ''}</strong>
          </Typography>
          <Typography variant="subtitle1" sx={{ mb: 1, cursor: 'pointer', color: 'blue' }} onClick={handleOpen}>
            View Details
          </Typography>
        </Grid>
      </Grid>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={{ 
          position: 'absolute', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)', 
          width: 400, 
          bgcolor: 'background.paper', 
          border: '2px solid #000', 
          boxShadow: 24, 
          p: 4 
        }}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Features
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            Experience: {result?.features?.experience ?? ''}<br />
            Skills: {result?.features?.skills ?? ''}<br />
            Education: {result?.features?.education ?? ''}<br />
            Overall Fit: {result?.features?.overall_fit ?? ''}<br />
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            Structured CV:<br />
            Experience: {result?.structured_cv?.experience ?? ''}<br />
            Education: {result?.structured_cv?.education ?? ''}<br />
            Skills: {result?.structured_cv?.skills ?? ''}<br />
            Projects: {result?.structured_cv?.projects ?? ''}<br />
            Achievements: {result?.structured_cv?.achievements ?? ''}<br />
            Other: {result?.structured_cv?.other ?? ''}<br />
          </Typography>
        </Box>
      </Modal>
    </Paper>
  );
};

export default ResultItem;
