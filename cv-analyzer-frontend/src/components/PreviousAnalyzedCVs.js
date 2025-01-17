import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ResultList from './ResultList';
import config from './config';

const PreviousAnalyzedCVs = ({ user }) => {
  const [previousResults, setPreviousResults] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPreviousResults = async () => {
      try {
        const response = await axios.get(`${config.apiUrl}/analysis-results/`, {
          headers: {
            Authorization: `Bearer ${user.stsTokenManager.accessToken}`
          }
        });
        setPreviousResults(response.data);
      } catch (error) {
        setError(`Error fetching previous results: ${error.message}`);
      }
    };

    fetchPreviousResults();
  }, [user]);

  return (
    <div>
      {error && window.alert(error)}
      <ResultList results={previousResults} />
    </div>
  );
};

export default PreviousAnalyzedCVs;
