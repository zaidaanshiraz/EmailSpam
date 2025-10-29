import React, { useState, useEffect } from 'react'
import {AppBar,Box,InputBase,Toolbar,styled,Menu,MenuItem,Avatar} from "@mui/material"
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import TuneIcon from '@mui/icons-material/Tune';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import SettingsIcon from '@mui/icons-material/Settings';
import AppsIcon from '@mui/icons-material/Apps';
import LogoutIcon from '@mui/icons-material/Logout';
import { gmailLogo } from '../assests/Assest';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { me } from '../api/auth';
import { useNavigate } from 'react-router-dom';


const StyleAppBar=styled(AppBar)({
    background:"#f5f5f5",
    boxShadow:"none"

})
const SearchWrapper = styled(Box)`
    background: #EAF1FB;
    margin-left: 80px;
    border-radius: 18px;
    min-width: 600px;
    max-width: 720px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
    & > div {
        width: 100%
    }
`
const OptionsWrapper = styled(Box)`
    width: 100%;
    display: flex;
    justify-content: end;
    align-items: center;
    & > svg {
        margin-left: 20px;
    }
`

const UserAvatar = styled(Avatar)({
    marginLeft: '20px',
    cursor: 'pointer',
    backgroundColor: '#6366f1',
    width: 32,
    height: 32,
    fontSize: '14px',
    fontWeight: 500
})

const UserMenu = styled(Menu)({
    '& .MuiPaper-root': {
        marginTop: '8px',
        minWidth: '200px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
    }
})

const UserEmail = styled(Box)({
    padding: '12px 16px',
    borderBottom: '1px solid #e5e7eb',
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
    cursor: 'default'
})

const EmailAvatar = styled(Avatar)({
    position: 'absolute',
    left: '16px',
    width: 32,
    height: 32,
    backgroundColor: '#4b5563',
    fontSize: '14px',
    fontWeight: 600,
    color: '#ffffff',
    zIndex: 1
})

const EmailText = styled(Box)({
    fontSize: '14px',
    color: '#6366f1',
    fontWeight: 500,
    wordBreak: 'break-word',
    marginLeft: '28px'
})

const LogoutMenuItem = styled(MenuItem)({
    padding: '12px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '14px',
    '&:hover': {
        backgroundColor: '#f3f4f6'
    }
})


const Header = ({toggleDrawer}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const open = Boolean(anchorEl);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await me();
        setUser(userData);
      } catch (error) {
        console.error('Failed to fetch user:', error);
      }
    };
    fetchUser();
  }, []);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
    handleClose();
  };

  const getInitials = (email) => {
    if (!email) return '?';
    const parts = email.split('@')[0];
    if (parts && parts.length > 0) {
      const firstChar = parts.charAt(0);
      // Check if it starts with underscore or special char
      if (firstChar === '_' && parts.length > 1) {
        return parts.charAt(1).toUpperCase();
      }
      return firstChar.toUpperCase();
    }
    return '?';
  };

  return (
    <StyleAppBar position="static">
        <Toolbar>
        <MenuIcon color="action" onClick={toggleDrawer}/>
        <img src={gmailLogo} alt="logo" style={{ width: 110, marginLeft: 15 }}/>
        <SearchWrapper>
            <SearchIcon color="action"/>
                 <InputBase />
            <TuneIcon color="action"/>
        </SearchWrapper>
        <OptionsWrapper>
                    <HelpOutlineIcon color="action" />
                    <SettingsIcon  color="action" />
                    <AppsIcon color="action"/>
                    {user ? (
                      <UserAvatar onClick={handleClick}>
                        {getInitials(user.email)}
                      </UserAvatar>
                    ) : (
                      <AccountCircleIcon color="action" onClick={handleClick} style={{ marginLeft: 20, cursor: 'pointer' }} />
                    )}
               </OptionsWrapper>

        <UserMenu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          {user && (
            <UserEmail>
              <EmailAvatar>
                {getInitials(user.email)}
              </EmailAvatar>
              <EmailText>{user.email}</EmailText>
            </UserEmail>
          )}
          <LogoutMenuItem onClick={handleLogout}>
            <LogoutIcon fontSize="small" />
            Logout
          </LogoutMenuItem>
        </UserMenu>

        </Toolbar>
    </StyleAppBar>
  )
}

export default Header