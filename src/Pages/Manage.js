import * as React from 'react';
import {Box, Divider, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography} from '@mui/material';
import { NavLink, Outlet } from 'react-router-dom';
import { FactCheck, Grading, HowToReg, People, ViewList } from '@mui/icons-material';

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
  
  return (
    <Box className="content_wrapper">
      <div className='sidebar'>
        <List disablePadding>
        
          <ListItem>
            <ListItemText secondary={"My Data"}/>
          </ListItem>
          <Divider/>
          <NavButton path={"/manage/my/patients"} startIcon={<People color='action'/>} name={"Patients"}/> 
          <NavButton path={"/manage/my/entries"} startIcon={<ViewList color='action'/>} name={"Entries"}/> 
          
          <ListItem>
          <ListItemText secondary={"Shared Data"}/>
          </ListItem>
          <Divider/>
          <NavButton path={"/manage/shared/entries"} startIcon={<Grading color='action'/>} name={"Entries"}/> 
        </List>
      </div>
      <Box sx={{flexGrow:1}} className='content'>
        <Outlet/>
      </Box>
    </Box>
  );
}

export default Manage;