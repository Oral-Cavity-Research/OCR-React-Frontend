import React, { useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import { ArrowBack, LocalHospital } from '@mui/icons-material';
import { Box, Stack, Typography, Skeleton, Button, Paper} from '@mui/material';
import { useSelector} from 'react-redux';
import axios from 'axios';
import NotificationBar from '../../NotificationBar';
import View from './View';

const HospiatalDetails = () => {

    const [status, setStatus] = useState({msg:"",severity:"success", open:false}) 
    const [data, setData] = useState({});
    const selectorData = useSelector(state => state.data);
    const [userData, setUserData] = useState(selectorData);
    const [loading, setLoading] = useState(true);
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(()=>{
        setLoading(true);
        axios.get(`${process.env.REACT_APP_BE_URL}/admin/hospitals/${id}`,
        { headers: {
            'Authorization': `Bearer ${userData.accessToken.token}`,
            'email': userData.email,
        }}
        ).then(res=>{
            setData(res.data);
            setLoading(false);
        }).catch(err=>{
            if(err.response) showMsg(err.response.data.message, "error")
            else alert(err)
        })
        
    },[])

    const showMsg = (msg, severity)=>{
        setStatus({msg, severity, open:true})
    }

    return (
        <div className="inner_content">
        <div>
            <Box className="sticky">    
            <Typography sx={{ fontWeight: 700}} variant="h5">Hospital</Typography>    
            
            <Button onClick={() => navigate(-1)} size='small' startIcon={<ArrowBack/>} sx={{p:0}}>Go Back</Button>
            </Box>  
            {loading?
            <Paper sx={{p:2, my:3}}>  
            <Stack direction='row' spacing={2} alignItems='center' sx={{my:1}}>
                <Skeleton variant="rounded" width={60} height={60} />
                <Stack direction='column'>
                    <Skeleton variant="text" width={210} sx={{ fontSize: '2rem' }} />
                    <Skeleton variant="text" width={210} />
                </Stack>
            </Stack>
            <Stack spacing={2}>
                <Skeleton variant="rounded" height={40} />
                <Skeleton variant="rounded" height={40} />
            </Stack>
            </Paper>
            :
            <Paper sx={{p:2, my:3}}>  
            <Stack direction='row' spacing={2} alignItems='center' sx={{mt:3}}>
                <LocalHospital sx={{width:'60px',height:'60px'}} color='error'/>
                <Stack direction='column'>
                    <Typography variant='h6'>{data.name}</Typography>
                </Stack>
            </Stack>
           
            <View data={data}/> 
            </Paper>
            }
            <NotificationBar status={status} setStatus={setStatus}/>
        </div>
    </div>
    );
};

export default HospiatalDetails;