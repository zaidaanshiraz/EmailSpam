import React from 'react'
import { ListItem, Checkbox, Typography, Box, styled } from "@mui/material"
import { StarBorder, Star, Flag } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { routes } from '../routes/route'
import useApi from '../hooks/useApi';
import { API_URLS } from '../api/api.url';

const DisplayEmail = ({ email, selectedEmails, setSelectedEmails }) => {
    const navigate = useNavigate();
    const toggleService = useApi(API_URLS.starredEmail);

    const toggleStarred = () => {
        toggleService.call({ id: email._id, value: !email.starred });
        email.starred = !email.starred;
    };

    const onSelectChange = () => {
        if (selectedEmails.includes(email._id)) {
            setSelectedEmails(prevState => prevState.filter(id => id !== email._id));
        } else {
            setSelectedEmails(prevState => [...prevState, email._id]);
        }
    }

    const onEmailClick = () => {
        navigate(routes.view.path, { state: { email: { ...email } } });
    }

    const reduceEmailBody = (body, maxLength) => {
        if (body.length <= maxLength) {
            return body;
        }
        return body.slice(0, maxLength) + "...";
    };

    const truncatedBody = email.body ? reduceEmailBody(email.body, 20) : '';

    const Wrapper = styled(Box)({
        padding: '0 0 0 10px',
        background: '#f2f6fc',
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
        '&>div': {
            display: 'flex',
            width: '100%',
            flexDirection: 'column'
        },
        '& > div > p': {
            fontSize: '14px',
        }
    })

    const Indicator = styled(Typography)({
        fontSize: '12px !important',
        background: '#ddd',
        color: '#222',
        borderRadius: '4px',
        marginRight: '6px',
        padding: '0 4px',
        display: 'inline-block'
    })

    const SpamIndicator = styled(Indicator)({
        background: '#ff4d4d',
        color: '#fff'
    })

    const SafeIndicator = styled(Indicator)({
        background: '#4caf50',
        color: '#fff'
    })

    const SuspiciousIndicator = styled(Indicator)({
        background: '#ff9800',
        color: '#fff'
    })

    const VPNIndicator = styled(Indicator)({
        background: '#2196f3',
        color: '#fff'
    })

    const Date = styled(Typography)({
        marginLeft: 'auto',
        marginRight: 20,
        fontSize: 12,
        color: '#5F6368'
    })

    return (
        <Wrapper>
            <Checkbox size="small"
                checked={selectedEmails.includes(email._id)}
                onChange={() => onSelectChange()}
            />
            {email.isSpam ? (
                <Flag color="error" style={{ marginRight: 10 }} />
            ) : (
                <Flag style={{ marginRight: 10, color: 'green' }} />
            )}

            {email.starred ? (
                <Star fontSize="small" style={{ marginRight: 10, color: '#FFF200' }} onClick={toggleStarred} />
            ) : (
                <StarBorder fontSize="small" style={{ marginRight: 10 }} onClick={toggleStarred} />
            )}

            <Box onClick={onEmailClick}>
                <Typography style={{ width: 200, overflow: 'hidden' }}>{email.name}</Typography>
                
                {/* Spam / Inbox */}
                {email.isSpam ? (
                    <SpamIndicator>Spam</SpamIndicator>
                ) : (
                    <Indicator>Inbox</Indicator>
                )}

                {/* IP Safety */}
                {email.ipInfo && (
                    email.ipInfo.safe ? (
                        <SafeIndicator>Safe</SafeIndicator>
                    ) : (
                        <SuspiciousIndicator>Suspicious</SuspiciousIndicator>
                    )
                )}

                {/* VPN Indicator */}
                {email.vpnInfo && (
                    email.vpnInfo.isVPN ? (
                        <VPNIndicator>VPN: {email.vpnInfo.org || "Unknown"}</VPNIndicator>
                    ) : (
                        <Indicator>No VPN</Indicator>
                    )
                )}

                <Typography>
                    {email.subject} {email.body && '-'}{truncatedBody}
                </Typography>

                <Date>
                    {(new window.Date(email.date).getDate())}
                    {(new window.Date(email.date).toLocaleString('default', { month: 'long' }))}
                </Date>

                {/* Extra details */}
                {email.ipInfo?.address && (
                    <Typography style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                        IP: {email.ipInfo.address} | Score: {email.ipInfo.reputationScore ?? "N/A"}
                    </Typography>
                )}
            </Box>
        </Wrapper>
    )
}

export default DisplayEmail;
