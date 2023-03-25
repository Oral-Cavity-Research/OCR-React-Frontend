import { Paper, Typography } from '@mui/material';
import { Box } from '@mui/system';
import React from 'react';

const Dashboard = () => {
    return ( 
        <div className="inner_content">
        <div>
        <Box className='sticky'>    
        <Typography sx={{ fontWeight: 700}} variant="h5">Dashboard</Typography>  
        </Box>  
        
        <Paper sx={{p:2, my:3}}> 

         your code comes here
         
        
        </Paper>
        </div>
        </div>
    );
};;

export default Dashboard;