import * as React from 'react';
import {Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText} from '@mui/material';
import { NavLink, Outlet } from 'react-router-dom';
import { AccountBox, Dashboard, Email, LocalHospital, LockPerson} from '@mui/icons-material';
import { useSelector} from 'react-redux';

const NavButton = ({path,startIcon,name}) => (
  <ListItem disablePadding component={NavLink} to={path}
    style={({ isActive }) => ({
          color: isActive ? '#000' : '#000',
          background: isActive ? '#f5f5f5' : '#fff',
        })}
  >
    <ListItemButton>
      <ListItemIcon>
        {startIcon}
      </ListItemIcon>
      <ListItemText primary={name}/>
    </ListItemButton>
  </ListItem>
)

const AdminPage = () => {
  const userData = useSelector(state => state.data);
  return (
    <Box className="content_wrapper">
      <div className='sidebar'>
        <List disablePadding>
        {userData?.permissions?.includes(100) &&
        <NavButton path={"/adminportal/requests"} startIcon={<Email/>} name={"Requests"}/>
        } 
        {(userData?.permissions?.includes(106)||userData?.permissions?.includes(107)) &&  
        <NavButton path={"/adminportal/users"} startIcon={<AccountBox/>} name={"Clinicians"}/>
        } 
        {userData?.permissions?.includes(101) &&
        <NavButton path={"/adminportal/hospitals"} startIcon={<LocalHospital/>} name={"Hospitals"}/> 
        }
        {userData?.permissions?.includes(109) &&
        <NavButton path={"/adminportal/permissions"} startIcon={<LockPerson/>} name={"Permissions"}/> 
        }
        {userData?.permissions?.includes(110) &&
        <NavButton path={"/adminportal/dashboard"} startIcon={<Dashboard/>} name={"Dashboard"}/> 
        }
        </List>
      </div>
      <Box sx={{flexGrow:1}} className='content'>
        <Outlet/>
      </Box>
    </Box>
  );
}

export default AdminPage;