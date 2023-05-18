import React, {useState} from 'react';
import{ AppBar, Menu,Container,Avatar,MenuItem, Divider} from '@mui/material';
import{ Box,Toolbar,IconButton,Typography, Button,Badge} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Link } from 'react-router-dom';
import logo from '../Assets/logo.svg';
import { useNavigate, NavLink } from 'react-router-dom';
import axios from "axios";
import { useSelector} from 'react-redux';
import { AccountBox, LogoutOutlined} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import colors from './ColorPalete';
import MenuOptions from '../MenuItems.json';

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    boxShadow: `0 0 0 2px ${colors.primary.main}`,
  },
  "& .MuiBadge-dot": {
    height: 8,
    minWidth: 8,
    borderRadius: 10
  }
}));

function stringToColor(string) {
  let i, hash = 0;
  let color = '#';

  for (i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }

  for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }

  return color;
}

function MenuBar() {

  const [anchorElNav, setAnchorElNav] = useState(null);
  const [anchorElUser, setAnchorElUser] = useState(null);
  const userData = useSelector(state => state.data);
  const open = Boolean(anchorElUser);
  const open2 = Boolean(anchorElNav);

  const navigate = useNavigate();
  
  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const GoToProfile = ()=>{
    navigate('/profile');
  }

  const Logout = ()=>{
    
    axios.post(`${process.env.REACT_APP_BE_URL}/auth/revokeToken`, {},
    { headers: {
      'Authorization': `Bearer ${userData.accessToken.token}`,
      'email': userData.email,
  },
      withCredentials: true}
    )
    .then(()=>{
      navigate("/login");
    });
  }

  return (
    <AppBar position="fixed">
      <Container maxWidth="xl" >
        <Toolbar disableGutters>
            <Typography variant="h5" noWrap component="div" sx={{ mr: 2, display: { xs: 'none', sm: 'flex' } }}>
                <img src={logo} alt="logo" style={{width: '100%', height : "30px"}} />
            </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: 'flex', sm: 'none' } }}>
            <IconButton onClick={handleOpenNavMenu} size="large" aria-controls={open2 ? 'nav-menu' : undefined} aria-haspopup="true" aria-expanded={open2 ? 'true' : undefined} color="inherit">
                <MenuIcon />
            </IconButton>
          </Box>
        
          <Menu
            anchorEl={anchorElNav}
            id="nav-menu"
            open={open2}
            onClose={handleCloseNavMenu}
            onClick={handleCloseNavMenu}
            PaperProps={{
              elevation: 0,
              sx: {
                overflow: 'visible',
                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                minWidth: '200px',
                mt: 1.5,
                '& .MuiAvatar-root': {
                  width: 32,
                  height: 32,
                  ml: -0.5,
                  mr: 1,
                },
                '&:before': {
                  content: '""',
                  display: 'block',
                  position: 'absolute',
                  top: 0,
                  left: 14,
                  width: 10,
                  height: 10,
                  bgcolor: 'background.paper',
                  transform: 'translateY(-50%) rotate(45deg)',
                  zIndex: 0,
                },
              },
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
              {
                MenuOptions.menu.map((item,index)=>{
                  if(userData.permissions?.some(p => item.allowed?.includes(p)))
                  return(<MenuItem key={index}>
                    <Typography textAlign="center"><Link to={item.path} replace>{item.name}</Link></Typography>
                  </MenuItem>)
                })
              }
                                          
          </Menu>
            <Box sx={{ flexGrow: 0, display: { xs: 'none', sm: 'flex'}}}>
                <Button sx={{ my: 2, color: 'white', display: 'block', m:0}} component={NavLink} to="/manage"> 
                    Manage
                </Button>
                { userData.permissions?.some(p => MenuOptions.adminPermissions?.includes(p)) &&
                  <Button sx={{ my: 2, color: 'white', display: 'block', m:0}} component={NavLink} to="/adminportal">
                    Admin
                </Button>}
            </Box>

      <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'flex-end' }}>
          
          <Button
            onClick={handleOpenUserMenu}
            size="small"
            sx={{ m:0, borderRadius: 100, p:0}}
            aria-controls={open ? 'account-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
            color="inherit"
          >
              <StyledBadge overlap="circular" anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} variant="dot" color={userData.availability?'success':'error'}>
                <Avatar src={userData.picture} alt={userData.username?userData.username:""}></Avatar>
              </StyledBadge>
          </Button>
      </Box>
      <Menu
        anchorEl={anchorElUser}
        id="account-menu"
        open={open}
        onClose={handleCloseUserMenu}
        onClick={handleCloseUserMenu}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{mx:3, my:1}}>
          <Typography><strong>{userData.username}</strong></Typography>
          <Typography color='GrayText'>{userData.role}</Typography>
        </Box>
        <Divider sx={{my:1}}/>
        <MenuItem sx={{width:'200px'}} onClick={GoToProfile}>
          <AccountBox color='action' sx={{mx:1}}/><Typography> Profile</Typography>
        </MenuItem>
        <Divider/>
        <MenuItem sx={{width:'200px'}} onClick={Logout}>
          <LogoutOutlined color='action' sx={{mx:1}}/><Typography> Logout</Typography>
        </MenuItem>
      </Menu>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
export default MenuBar;