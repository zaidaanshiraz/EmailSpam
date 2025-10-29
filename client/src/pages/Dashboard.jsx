import React, { useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  CardActions,
  Typography,
  TextField,
  Button,
  Tabs,
  Tab,
  Grid,
  CircularProgress,
  Alert,
  Chip,
  Divider,
} from '@mui/material';
import SmartToy from '@mui/icons-material/SmartToy';
import Lock from '@mui/icons-material/Lock';
import Warning from '@mui/icons-material/Warning';
import RiskScoreIndicator from '../components/RiskScoreIndicator';
import { mockEmails } from '../utils/mockEmails';

const TabPanel = ({ children, value, index }) => {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
};

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [emailResult, setEmailResult] = useState(null);
  const [urlResult, setUrlResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { openDrawer } = useOutletContext() || { openDrawer: true };

  const [emailForm, setEmailForm] = useState({
    emailSubject: '',
    senderDomain: '',
    senderIp: '',
    emailBody: '',
  });
  const [urlForm, setUrlForm] = useState({ url: '' });

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setEmailResult(null);
    setUrlResult(null);
    setError(null);
    setEmailForm({ emailSubject: '', senderDomain: '', senderIp: '', emailBody: '' });
    setUrlForm({ url: '' });
  };

  const onEmailSubmit = async (e) => {
    e.preventDefault();
    if (!emailForm.emailSubject || !emailForm.senderDomain || !emailForm.emailBody) {
      setError('Please fill in all required fields.');
      return;
    }
    const data = emailForm;
    setLoading(true);
    setError(null);
    setEmailResult(null);
    try {
      // Create email body from form data
      const emailData = {
        subject: data.emailSubject,
        from: `${data.senderDomain} <noreply@${data.senderDomain}>`,
        to: 'user@example.com',
        body: data.emailBody,
        date: new Date(),
        name: data.senderDomain,
        type: 'inbox',
      };

      // Use existing save endpoint which includes spam detection
      const response = await fetch('http://localhost:3001/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
      });

      const result = await response.json();

      // Calculate phishing score based on backend and local heuristics
      let backendScore = result.isSpam ? 0.85 : 0.15;
      const riskFactors = [];
      if (result.isSpam) {
        riskFactors.push('Server flagged content as spam');
      }
      if (result.ipInfo && !result.ipInfo.safe) {
        riskFactors.push('Suspicious IP address');
        backendScore += 0.1;
      }

      // Local heuristic analysis for better accuracy on common phishing patterns
      let heuristicScore = 0;
      const loweredSubject = (emailData.subject || '').toLowerCase();
      const loweredBody = (emailData.body || '').toLowerCase();
      const loweredDomain = (data.senderDomain || '').toLowerCase();

      const keywordIndicators = [
        'urgent',
        'verify',
        'suspended',
        'click here',
        'confirm',
        'password',
        'account',
        'winner',
        'congratulations',
        'limited time',
      ];
      const hasKeywordHit = keywordIndicators.some(
        (kw) => loweredSubject.includes(kw) || loweredBody.includes(kw)
      );
      if (hasKeywordHit) {
        heuristicScore += 0.35;
        riskFactors.push('Suspicious keywords detected');
      }

      const linkRegex = /(https?:\/\/[^\s)]+)/gi;
      const hasSuspiciousLink = linkRegex.test(emailData.body || '');
      if (hasSuspiciousLink) {
        heuristicScore += 0.25;
        riskFactors.push('Contains external link');
      }

      const suspiciousTlds = ['.ru', '.zip', '.xyz', '.top', '.click'];
      const hasOddDomain =
        loweredDomain.includes('-') ||
        suspiciousTlds.some((tld) => loweredDomain.endsWith(tld));
      if (hasOddDomain) {
        heuristicScore += 0.2;
        riskFactors.push('Suspicious sender domain');
      }

      const manyExclamations = (emailData.body || '').split('!').length - 1 >= 3;
      if (manyExclamations) {
        heuristicScore += 0.1;
        riskFactors.push('Excessive punctuation');
      }

      // Combine signals; prefer higher risk
      const finalScore = Math.min(Math.max(backendScore, heuristicScore), 1.0);
      const isPhishing = finalScore >= 0.5 || result.isSpam || (result.ipInfo && !result.ipInfo.safe);

      setEmailResult({
        isPhishing,
        phishingScore: finalScore,
        riskFactors: Array.from(new Set(riskFactors)),
        justification: isPhishing
          ? 'Indicators suggest this email may be a phishing attempt. Proceed with caution.'
          : 'Low risk detected, but always verify the sender before taking any action.',
      });
    } catch (err) {
      setError('Failed to analyze email. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const onUrlSubmit = async (e) => {
    e.preventDefault();
    if (!urlForm.url) {
      setError('Please enter a URL.');
      return;
    }
    setLoading(true);
    setError(null);
    setUrlResult(null);
    try {
      const response = await fetch('http://localhost:3001/check-url-spam', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: urlForm.url }),
      });

      const result = await response.json();
      
      setUrlResult({
        riskScore: result.isSpam ? 0.85 : 0.15,
        isSpam: result.isSpam,
        justification: result.message,
      });
    } catch (err) {
      setError('Failed to analyze URL. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadMockEmail = (index) => {
    const email = mockEmails[index];
    setEmailForm({
      emailSubject: email.subject,
      senderDomain: email.senderDomain,
      senderIp: email.senderIp,
      emailBody: email.body,
    });
    setEmailResult(null);
    setError(null);
  };

  return (
    <Box sx={{ padding: 4, backgroundColor: '#f6f7fb', minHeight: 'calc(100vh - 64px)', marginLeft: openDrawer ? '250px' : 0 }}>
      <Box sx={{ maxWidth: 1200, margin: '0 auto' }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: '#273469' }}>
            Analysis Dashboard
          </Typography>
          <Typography variant="body1" sx={{ color: '#64748b' }}>
            Leverage our Transformer-driven NLP framework to identify phishing attempts with high precision.
          </Typography>
        </Box>

        <Card sx={{ mb: 3, borderRadius: 3, overflow: 'hidden', border: '1px solid #e5e7eb', background: '#ffffff' }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange} 
            sx={{ 
              borderBottom: 1, 
              borderColor: 'divider',
              '& .MuiTab-root': {
                textTransform: 'none',
                minHeight: 48,
                fontWeight: 500,
              },
              '& .Mui-selected': {
                fontWeight: 700,
              }
            }}
          >
            <Tab 
              label="Email Analysis" 
              sx={{ 
                backgroundColor: activeTab === 0 ? '#eef2ff' : 'transparent',
              }} 
            />
            <Tab 
              label="URL Analysis" 
              sx={{ 
                backgroundColor: activeTab === 1 ? '#eef2ff' : 'transparent',
              }} 
            />
          </Tabs>
        </Card>

        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 3, border: '1px solid #e5e7eb', background: '#ffffff' }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <SmartToy sx={{ color: '#6C63FF' }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Email Details
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: '#64748b', mb: 3 }}>
                    Enter the email information below or load an example.
                  </Typography>

                  <form onSubmit={onEmailSubmit}>
                    <TextField
                      fullWidth
                      label="Subject"
                      placeholder="e.g., Urgent Action Required"
                      value={emailForm.emailSubject}
                      onChange={(e) => setEmailForm({ ...emailForm, emailSubject: e.target.value })}
                      required
                      sx={{ mb: 2 }}
                    />

                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Sender Domain"
                          placeholder="e.g., example.com"
                          value={emailForm.senderDomain}
                          onChange={(e) => setEmailForm({ ...emailForm, senderDomain: e.target.value })}
                          required
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Sender IP"
                          placeholder="e.g., 192.168.1.1"
                          value={emailForm.senderIp}
                          onChange={(e) => setEmailForm({ ...emailForm, senderIp: e.target.value })}
                        />
                      </Grid>
                    </Grid>

                    <TextField
                      fullWidth
                      label="Body"
                      placeholder="Paste the full email body here..."
                      multiline
                      rows={8}
                      value={emailForm.emailBody}
                      onChange={(e) => setEmailForm({ ...emailForm, emailBody: e.target.value })}
                      required
                      sx={{ mb: 3 }}
                    />

                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      disabled={loading}
                      sx={{
                        background: 'linear-gradient(90deg, #6C63FF 0%, #A3A1FB 100%)',
                        '&:hover': { opacity: 0.9 },
                        py: 1.5,
                        textTransform: 'none',
                        fontWeight: 600,
                      }}
                    >
                      {loading ? <CircularProgress size={24} color="inherit" /> : 'Analyze Email'}
                    </Button>
                  </form>
                </CardContent>
                <Divider />
                <CardActions sx={{ p: 2, justifyContent: 'space-between', flexWrap: 'wrap' }}>
                  <Typography variant="body2" sx={{ color: '#64748b' }}>
                    Or load examples:
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {(() => {
                      const firstIndexByType = {};
                      mockEmails.forEach((email, idx) => {
                        const key = (email.label || '').split(' ')[0];
                        if (!firstIndexByType[key]) firstIndexByType[key] = idx;
                      });
                      const order = ['Suspicious', 'Safe'];
                      return order
                        .filter((k) => firstIndexByType[k] !== undefined)
                        .map((k) => (
                          <Button
                            key={k}
                            variant="outlined"
                            size="small"
                            onClick={() => loadMockEmail(firstIndexByType[k])}
                            startIcon={<Lock fontSize="small" />}
                            sx={{
                              textTransform: 'none',
                              borderColor: '#a5b4fc',
                              color: '#273469',
                              backgroundColor: '#eef2ff',
                              '&:hover': { backgroundColor: '#e0e7ff', borderColor: '#818cf8' },
                            }}
                          >
                            {k}
                          </Button>
                        ));
                    })()}
                  </Box>
                </CardActions>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              {loading && (
                <Card sx={{ borderRadius: 3, p: 4, textAlign: 'center', border: '1px solid #e5e7eb', background: '#ffffff' }}>
                  <CircularProgress />
                  <Typography variant="body2" sx={{ mt: 2, color: '#64748b' }}>
                    Analyzing email...
                  </Typography>
                </Card>
              )}

              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              {emailResult && (
                <Card sx={{ borderRadius: 3, border: '1px solid #e5e7eb', background: '#ffffff' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                      Analysis Result
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#64748b', mb: 3 }}>
                      {emailResult.isPhishing
                        ? 'This email shows strong indicators of a phishing attempt.'
                        : 'This email appears to be safe.'}
                    </Typography>

                    <RiskScoreIndicator score={emailResult.phishingScore} />

                    {emailResult.riskFactors.length > 0 && (
                      <Box sx={{ mt: 4 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, textAlign: 'center' }}>
                          Key Risk Factors
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
                          {emailResult.riskFactors.map((factor, i) => (
                            <Chip
                              key={i}
                              label={factor}
                              color="error"
                              size="small"
                              icon={<Warning />}
                            />
                          ))}
                        </Box>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              )}
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 3, border: '1px solid #e5e7eb', background: '#ffffff' }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <SmartToy sx={{ color: '#6C63FF' }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      URL Details
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: '#64748b', mb: 3 }}>
                    Enter a URL to assess its risk level.
                  </Typography>

                  <form onSubmit={onUrlSubmit}>
                    <TextField
                      fullWidth
                      label="URL"
                      placeholder="https://example.com"
                      value={urlForm.url}
                      onChange={(e) => setUrlForm({ url: e.target.value })}
                      required
                      type="url"
                      sx={{ mb: 3 }}
                    />

                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      disabled={loading}
                      sx={{
                        background: 'linear-gradient(90deg, #6C63FF 0%, #A3A1FB 100%)',
                        '&:hover': { opacity: 0.9 },
                        py: 1.5,
                        textTransform: 'none',
                        fontWeight: 600,
                      }}
                    >
                      {loading ? <CircularProgress size={24} color="inherit" /> : 'Analyze URL'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              {loading && (
                <Card sx={{ borderRadius: 3, p: 4, textAlign: 'center', border: '1px solid #e5e7eb', background: '#ffffff' }}>
                  <CircularProgress />
                  <Typography variant="body2" sx={{ mt: 2, color: '#64748b' }}>
                    Analyzing URL...
                  </Typography>
                </Card>
              )}

              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              {urlResult && (
                <Card sx={{ borderRadius: 3, border: '1px solid #e5e7eb', background: '#ffffff' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                      URL Analysis Result
                    </Typography>

                    <RiskScoreIndicator score={urlResult.riskScore} />

                    <Alert
                      severity={urlResult.isSpam ? 'error' : 'success'}
                      sx={{ mt: 3 }}
                      icon={<Warning />}
                    >
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                        Justification
                      </Typography>
                      <Typography variant="body2">{urlResult.justification}</Typography>
                    </Alert>
                  </CardContent>
                </Card>
              )}
            </Grid>
          </Grid>
        </TabPanel>
      </Box>
    </Box>
  );
};

export default Dashboard;
