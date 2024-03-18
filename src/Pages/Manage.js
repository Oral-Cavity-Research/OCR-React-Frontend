import * as React from 'react';
import {Box, Divider, List, ListItem, ListItemButton, ListItemIcon, ListItemText} from '@mui/material';
import { NavLink, Outlet } from 'react-router-dom';
import { Grading,People, ViewList } from '@mui/icons-material';
import { useSelector} from 'react-redux';

const NavButton = ({path,startIcon,name}) => (
    <ListItem disablePadding component={NavLink} to={path}
    style={({ isActive }) => ({
          background: isActive ? '#f5f5f5' : '#fff',
        })}
    >
      <ListItemButton>
        <ListItemIcon>
          {startIcon}
        </ListItemIcon>
        <ListItemText primary={name} />
      </ListItemButton>
    </ListItem>
)

const Manage = () => {
  const userData = useSelector(state => state.data);
  return (
    <Box className="content_wrapper">
      <div className='sidebar'>
        <List disablePadding>
        
        {userData?.permissions?.includes(300) &&
        <>
          <ListItem>
            <ListItemText secondary={"My Data"}/>
          </ListItem>
          <Divider/>
          <NavButton path={"/manage/my/patients"} startIcon={<People color='action'/>} name={"Patients"}/> 
          <NavButton path={"/manage/my/entries"} startIcon={<ViewList color='action'/>} name={"Entries"}/> 
          <NavButton path={"/manage/my/draft"} startIcon={<ViewList color='action'/>} name={"Drafts"}/> 
        </>
        }
        {userData?.permissions?.includes(200) &&
          <>
          <ListItem>
          <ListItemText secondary={"Shared Data"}/>
          </ListItem>
          <Divider/>
          <NavButton path={"/manage/shared/entries"} startIcon={<Grading color='action'/>} name={"Entries"}/> 
          </>
        }
        </List>
      </div>
      <Box sx={{flexGrow:1}} className='content'>
        <Outlet/>
      </Box>
    </Box>
  );
}

export default Manage;