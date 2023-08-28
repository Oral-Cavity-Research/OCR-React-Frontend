import React from 'react';
import {IconButton, Tooltip, Box, Menu, MenuItem, ListItemIcon, ListItemText, Divider, Button, ButtonGroup, Badge} from '@mui/material';
import {ZoomIn,ZoomOut,Close, Edit, Check} from '@mui/icons-material';
import MenuIcon from '@mui/icons-material/Menu';

const ButtonPanel = ({func, drawingMode}) => {

    const [anchorElNav, setAnchorElNav] = React.useState(null);

    const handleOpenNavMenu = (event) => {
        setAnchorElNav(event.currentTarget);
    };

    const handleCloseNavMenu = () => {
        setAnchorElNav(null);
    };

    return (
        <div>
        <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>     
            <Tooltip enterNextDelay={1000} title="Drawing mode on / off" placement="bottom-end" arrow><Button size='small' 
            onClick={()=>func.setDrawingMode(!drawingMode)}
            sx={{
                height: 40,
                borderRadius: 1,
                marginRight: 1,
                bgcolor: drawingMode?"var(--dark-color)":"Background",
                "&:hover": {
                    backgroundColor: drawingMode?"var(--dark-color)":"Background"
                },
              }}
            ><Edit fontSize='small' sx={{color:drawingMode?"white":'var(--dark-color)'}} /></Button></Tooltip>
            <ButtonGroup 
                sx={{
                    height: 40,
                    '& .MuiButtonGroup-grouped': {
                        borderColor: "white",
                    },
                    '&:hover .MuiButtonGroup-grouped': {
                        borderColor: "white",
                    },
                }}
            >            
                <Tooltip enterNextDelay={1000} title="Finish Drawing" placement="bottom-end" arrow><Button size='small' onClick={func.finish_drawing}><Check  fontSize='small' sx={{color:"var(--dark-color)"}}/></Button></Tooltip>
                <Tooltip enterNextDelay={1000} title="Delete Selected" placement="bottom-end" arrow><Button size='small' onClick={func.delete_selected}><Close  fontSize='small' sx={{color:"var(--dark-color)"}}/></Button></Tooltip>
            
                
                <Tooltip enterNextDelay={1000} title="Zoom In" placement="bottom-end" arrow><Button size='small' onClick={func.zoom_in}><ZoomIn  fontSize='small' sx={{color:"var(--dark-color)"}}/></Button></Tooltip>
                <Tooltip enterNextDelay={1000} title="Zoom Out" placement="bottom-end" arrow><Button size='small' onClick={func.zoom_out}><ZoomOut  fontSize='small' sx={{color:"var(--dark-color)"}}/></Button></Tooltip>
        
        </ButtonGroup>
        </Box>
        <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="small"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon/>
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              onClick={handleCloseNavMenu}
              sx={{
                display: { xs: 'block', md: 'none' },
                maxHeight:'400px'
              }}
            >
      
            <MenuItem onClick={func.delete_selected}>
                <ListItemIcon> <Close fontSize='small' sx={{color:"var(--dark-color)"}} /></ListItemIcon>
                <ListItemText>Delete Selected</ListItemText>
            </MenuItem>
            
            <Divider/>
            <MenuItem onClick={func.zoom_in}>
                <ListItemIcon> <ZoomIn fontSize='small' sx={{color:"var(--dark-color)"}} /></ListItemIcon>
                <ListItemText>Zoom In</ListItemText>
            </MenuItem>
            <MenuItem onClick={func.zoom_out}>
                <ListItemIcon> <ZoomOut fontSize='small' sx={{color:"var(--dark-color)"}} /></ListItemIcon>
                <ListItemText>Zoom Out</ListItemText>
            </MenuItem>
            <Divider/>
            </Menu>
            
            <Tooltip enterNextDelay={1000} title="Finish Drawing" placement="bottom-end" arrow><IconButton size='small' onClick={func.finish_drawing}><Check  fontSize='small' sx={{color:"var(--dark-color)"}}/></IconButton></Tooltip>
            
            <Tooltip enterNextDelay={1000} title="Drawing mode on / off" placement="bottom-end" arrow><IconButton size='small' 
            onClick={()=>func.setDrawingMode(!drawingMode)}
            ><Edit fontSize='small' sx={{color:drawingMode?'primary.main':'var(--dark-color)'}} /></IconButton></Tooltip>
            
          </Box>  
        </div>
    );
};
export default ButtonPanel;