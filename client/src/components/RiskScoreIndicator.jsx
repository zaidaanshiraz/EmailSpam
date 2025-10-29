import React from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';

const RiskScoreIndicator = ({ score }) => {
  const getColor = () => {
    if (score >= 0.7) return '#dc2626'; // Red for high risk
    if (score >= 0.4) return '#f59e0b'; // Orange for medium risk
    return '#10b981'; // Green for low risk
  };

  const getLabel = () => {
    if (score >= 0.7) return 'High Risk';
    if (score >= 0.4) return 'Medium Risk';
    return 'Low Risk';
  };

  const percentage = Math.round(score * 100);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        py: 3,
      }}
    >
      <Box sx={{ position: 'relative', display: 'inline-flex' }}>
        <CircularProgress
          variant="determinate"
          value={percentage}
          size={160}
          thickness={4}
          sx={{
            color: getColor(),
            transform: 'rotate(-90deg)',
          }}
        />
        <Box
          sx={{
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: 700, color: getColor() }}>
            {percentage}%
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>
            {getLabel()}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default RiskScoreIndicator;

