import React from 'react'
import { Box, Typography, styled } from '@mui/material';
import { useOutletContext,useLocation } from "react-router-dom";
import { AddBoxRounded, ArrowBack, Delete } from '@mui/icons-material';
import { emptyProfilePic } from '../assests/Assest';
import useApi from '../hooks/useApi';
import { API_URLS } from '../api/api.url';

const ViewEmails = () => {
    const moveEmailToBin=useApi(API_URLS.moveToBin)
    const deleteEmails=()=>{
        moveEmailToBin.call([email._id])
        window.history.back()
    }
    
    const IconWrapper = styled(Box)({
        padding: 15
    });
    const Subject = styled(Typography)({
        fontSize: 22,
        margin: '10px 0 20px 75px',
        display: 'flex'
    })

    // Updated Indicator to handle both "Inbox" and "Spam"
    const Indicator = styled(Box)(({ isSpam }) => ({
        fontSize: '12px !important',
        background: isSpam ? '#ff4d4d' : '#ddd',
        color: isSpam ? '#fff' : '#222',
        borderRadius: '4px',
        marginLeft: '6px',
        padding: '2px 4px',
        alignSelf: 'center',
    }));

    const Image = styled('img')({
        borderRadius: '50%',
        width: 40,
        height: 40,
        margin: '0 10px 0 10px',
        backgroundColor: '#cccccc'
    });

    const Container = styled(Box)({
        marginLeft: 15,
        width: '100%',
        '& > div': {
            display: 'flex',
            '& > p > span': {
                fontSize: 12,
                color: '#5E5E5E'
            }
        }
    });

    const Date = styled(Typography)({
        margin: '0 50px 0 auto',
        fontSize: 12,
        color: '#5E5E5E'
    })

    const { state } = useLocation();
    const { email } = state ||{};
    
    const {openDrawer}=useOutletContext();

    return (
        <Box style={openDrawer ? { marginLeft: 250, width: 'calc(100%-250px)' } : { width: 'calc(100%-250px)' } }>
            <IconWrapper>
                <ArrowBack fontSize='small' color="action" onClick={() => window.history.back() } />
                <Delete fontSize='small' color="action" style={{ marginLeft: 40 }} onClick={()=>deleteEmails()} />
            </IconWrapper>
            <Subject>
                {email && email.subject ? email.subject : 'No subject'}
                <Indicator component="span" isSpam={email && email.isSpam}>
                    {email && email.isSpam ? 'Spam' : 'Inbox'}
                </Indicator>
            </Subject>

            <Box style={{ display: 'flex' }}>
                <Image src={emptyProfilePic} alt="profile" />
                <Container>
                    <Box>
                        <Typography>
                            {email.to.split('@')[0]} 
                            <Box component="span" >&nbsp;&#60;{email.to}&#62;</Box>
                        </Typography>
                        <Date>
                            {(new window.Date(email.date)).getDate()}&nbsp;
                            {(new window.Date(email.date)).toLocaleString('default', { month: 'long' })}&nbsp;
                            {(new window.Date(email.date)).getFullYear()} 
                        </Date>
                    </Box>
                    <Typography style={{ marginTop: 20 }}>{email.body} </Typography>
                </Container>
            </Box>
        </Box>
    )
}

export default ViewEmails;