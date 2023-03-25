import React, { useEffect, useRef, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import { ArrowBack} from '@mui/icons-material';
import { Box, Stack, Avatar, Typography, Skeleton,Tab, Button, Paper} from '@mui/material';
import {TabContext,TabList,TabPanel} from '@mui/lab';
import { stringAvatar } from '../utils';
import config from '../../config.json'
import axios from 'axios';
import { useSelector} from 'react-redux';
import PatientProfile from './PatientProfile';
import NotificationBar from '../NotificationBar';
import PatientsEntries from './PatientsEntries';
import LinearStepper from './LinearStepper';


const PatientDetails = () => {

  
    const [data, setData] = useState({});
    const [loading, setLoading] = useState(true);
    const [value, setValue] = React.useState('1');
    const [status, setStatus] = useState({msg:"",severity:"success", open:false});
    const { id } = useParams();
    const navigate = useNavigate();
    const userData = useSelector(state => state.data);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const showMsg = (msg, severity)=>{
        setStatus({msg, severity, open:true})
    };

    useEffect(()=>{

        setLoading(true);
        axios.get(`${config['path']}/user/patient/${id}`,
        { headers: {
            'Authorization': `Bearer ${userData.accessToken.token}`,
            'email': JSON.parse(sessionStorage.getItem("info")).email,
        }}
        ).then(res=>{
            setData(res.data);
            setLoading(false);
        }).catch(err=>{
            if(err.response) showMsg(err.response.data.message, "error")
            else alert(err)
        })

    },[])

   
    return (
        <div className="inner_content">
        <div>
        <div className="sticky">
            <Typography sx={{ fontWeight: 700}} variant="h5">Patients</Typography> 
            <Button onClick={() => navigate(-1)} size='small' startIcon={<ArrowBack/>} sx={{p:0}}>Go Back</Button>
        </div>
                
            {loading?
            <Paper sx={{p:2, my:3}}>
            <Stack direction='row' spacing={2} alignItems='center' sx={{my:3}}>
                <Skeleton variant="rounded" width={60} height={60} />
                <Stack direction='column'>
                    <Skeleton variant="text" width={210} sx={{ fontSize: '2rem' }} />
                    <Skeleton variant="text" width={210} />
                </Stack>
            </Stack>
            <Stack spacing={2}>
                <Skeleton variant="rounded" height={40} width={600}/>
                <Skeleton variant="rounded" height={40} width={600}/>
            </Stack>
            </Paper>
            :
            <>
            <Paper sx={{p:2, my:3}}>  
            <Stack direction='row' spacing={2} alignItems='center' sx={{my:3}}>
                <Avatar {...stringAvatar("P", 60)} variant='rounded'/>
                <Stack direction='column'>
                    <Typography variant='h6'>{data.patient_name}</Typography>
                    <Typography color='GrayText'>{data.patient_id}</Typography>
                </Stack>
            </Stack>
            <Box sx={{ width: '100%', typography: 'body1' }}>
            <TabContext value={value}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider'}}>
                <TabList onChange={handleChange} aria-label="lab API tabs example" variant='standard'>
                    <Tab disableRipple label="Profile" value="1"/>
                    <Tab disableRipple label="All Entries" value="2" />
                    <Tab disableRipple label="Add New Entry" value="3" />
                </TabList>
                </Box>
                <TabPanel value="1" sx={{px:0}}><PatientProfile data={data}/></TabPanel>
                <TabPanel value="2" sx={{px:0}}><PatientsEntries/></TabPanel>
                <TabPanel value="3" sx={{px:0}}><LinearStepper data={data}/></TabPanel>
            </TabContext>
            </Box>
            </Paper>
            </>
}
            <NotificationBar status={status} setStatus={setStatus}/>
        </div>
    </div>
    );
};

export default PatientDetails;