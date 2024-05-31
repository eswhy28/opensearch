import React, { useState } from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import ResultItem from './ResultItem';

const ResultList = ({ results }) => {
  const [showAll, setShowAll] = useState(true);

  const handleToggleVisibility = () => {
    setShowAll(!showAll);
  };

  const filteredResults = showAll
    ? results
    : results.filter(result => result.score >= 0.8);

  return (
    <Box sx={{ mt: 4 }}>
      <Button
        variant="contained"
        color="primary"
        onClick={handleToggleVisibility}
        sx={{ mb: 2 }}
      >
        {showAll ? 'Hide Results Below 80%' : 'Show All Results'}
      </Button>
      {filteredResults.length > 0 ? (
        filteredResults.map((result, index) => (
          <ResultItem key={index} result={result} />
        ))
      ) : (
        <Paper elevation={3} sx={{ p: 3, borderRadius: '10px', textAlign: 'center' }}>
          <Typography variant="h6">No previous results found.</Typography>
        </Paper>
      )}
    </Box>
  );
};

export default ResultList;
