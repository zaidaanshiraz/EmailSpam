/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';

import { Box, Dialog, InputBase, Typography, styled, TextField, Button, CircularProgress } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { API_URLS } from '../api/api.url';
import useApi from "../hooks/useApi";

const dialogStyle = {
    height: '90%',
    width: '80%',
    maxWidth: '100%',
    maxHeight: '100%',
    boxShadow: 'none',
    borderRadius: '10px 10px 0 0',
};

const Header = styled(Box)({
    display: "flex",
    justifyContent: "space-between",
    padding: "10px 15px",
    background: "#f2f6fc",
    '& > p': {
        fontSize: 14,
        fontWeight: 500
    }
});

const RecipientWrapper = styled(Box)`
    display: flex;
    flex-direction: column;
    padding: 0 15px;
    & > div {
        font-size: 14px;
        line-height:20px;
        text-decoration:none solid rgb(34,34,34)
        border-bottom: 1px solid #F5F5F5;
        margin-top: 10px;
    }
`;

const Footer = styled(Box)`
    display: flex;
    justify-content: space-between;
    padding: 36px 20px;
    align-items: center;
`;

const SendButton = styled(Button)`
    background: #0B57D0;
    color: #fff;
    font-weight: 500;
    text-transform: none;
    border-radius: 18px;
    width: 100px;
`;

const Compose = ({ openDialog, setOpenDialog }) => {
    const [data, setData] = useState({});
    const [urlToCheck, setUrlToCheck] = useState('');
    const [spamWarning, setSpamWarning] = useState('');
    const [loading, setLoading] = useState(false);

    const sendEmail = useApi(API_URLS.saveSentEmail);
    const saveDraft = useApi(API_URLS.SaveDraftEmails);

    // 👇 Fetch client IP when component mounts
    useEffect(() => {
        const fetchIP = async () => {
            try {
                const res = await fetch("https://api.ipify.org?format=json");
                const ipData = await res.json();
                setData(prev => ({ ...prev, ipAddress: ipData.ip }));
            } catch (err) {
                console.error("Failed to fetch IP:", err);
            }
        };
        fetchIP();
    }, []);

    const onValueChange = (e) => {
        setData({ ...data, [e.target.name]: e.target.value });
    };

    const closeComposeClick = (e) => {
        e.preventDefault();
        const payload = {
            to: data.to,
            from: "luckygovindrao182@gmail.com",
            subject: data.subject,
            body: data.body,
            date: new Date(),
            image: " ",
            name: "lucky",
            starred: false,
            type: 'drafts',
            ipAddress: data.ipAddress || ""   // 👈 include IP
        };
        saveDraft.call(payload);
        if (!saveDraft.error) {
            setOpenDialog(false);
            setData({});
        }
    };
    
    const sendMail = async (e) => {
        e.preventDefault();
        if (window.Email) {
            window.Email.send({
                Host: "smtp.elasticemail.com",
                Username: "noobprob23@gmail.com",
                Password: "A545ABB6027C0E2DD01DA718A4439A783BAC",
                Port: 2525,
                To: data.to,
                From: "luckygovindrao182@gmail.com",
                Subject: data.subject,
                Body: data.body
            }).then(
                message => console.log(message)
            );
        }

        const payload = {
            to: data.to,
            from: "luckygovindrao182@gmail.com",
            subject: data.subject,
            body: data.body,
            date: new Date(),
            image: " ",
            name: "lucky",
            starred: false,
            type: 'sent',
            ipAddress: data.ipAddress || "123.45.67.89"   // 👈 include IP
        };
        sendEmail.call(payload);

        if (!sendEmail) {
            setOpenDialog(false);
            setData({});
        }
        
        setOpenDialog(false);
    };

    const deleteMail = () => {
        setOpenDialog(false);
    };

    const checkURL = async () => {
        setSpamWarning('');
        if (!urlToCheck) {
            setSpamWarning('Please enter a URL to check.');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('http://localhost:3001/check-url-spam', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ url: urlToCheck })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            
            if (result && result.isSpam !== undefined) {
                setSpamWarning(result.message);
            } else {
                setSpamWarning('Invalid response from server.');
            }
        } catch (error) {
            console.error("URL check failed:", error);
            setSpamWarning('An error occurred. Could not check URL.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog
            open={openDialog}
            PaperProps={{ sx: dialogStyle }}
        >
            <Header>
                <Typography>New Message</Typography>
                <CloseIcon fontSize="small" onClick={(e) => closeComposeClick(e)} />
            </Header>
            <RecipientWrapper>
                <InputBase placeholder='Recipients' onChange={(e) => onValueChange(e)} name="to" />
                <InputBase placeholder='Subject' onChange={(e) => onValueChange(e)} name="subject" />
            </RecipientWrapper>
            <TextField 
                multiline
                rows={10}
                sx={{ '& .MuiOutlinedInput-notchedOutline': { border: 'none' } }}
                name="body"
                onChange={(e) => onValueChange(e)}
            />
            <Box sx={{ padding: '0 15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <InputBase 
                    placeholder='Check URL for spam' 
                    value={urlToCheck}
                    onChange={(e) => setUrlToCheck(e.target.value)}
                    sx={{ flex: 1, borderBottom: '1px solid #F5F5F5' }}
                />
                <Button 
                    variant="contained" 
                    onClick={checkURL} 
                    disabled={loading}
                    sx={{
                        background: '#0B57D0',
                        color: '#fff',
                        fontWeight: 500,
                        textTransform: 'none',
                        borderRadius: '18px',
                        width: '100px',
                    }}
                >
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Check URL'}
                </Button>
            </Box>
            {spamWarning && (
                <Typography 
                    color={spamWarning.includes('Warning') || spamWarning.includes('error') ? "error" : "success"}
                    style={{ padding: '0 15px', fontWeight: 600, marginTop: '8px' }}
                >
                    {spamWarning}
                </Typography>
            )}
            <Footer>
                <SendButton onClick={(e) => sendMail(e)}>Send</SendButton>
                <DeleteOutlineOutlinedIcon onClick={() => deleteMail()} />
            </Footer>
        </Dialog>
    );
};

export default Compose;
