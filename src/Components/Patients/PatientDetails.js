import React, { useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import { ArrowBack, Download, MoreVert} from '@mui/icons-material';
import { Box, Stack, Avatar, Typography, Skeleton,Tab, Button, Paper, IconButton,
    Menu, MenuItem, ListItemIcon, ListItemText} from '@mui/material';
import {TabContext,TabList,TabPanel} from '@mui/lab';
import { stringAvatar } from '../utils';
import axios from 'axios';
import { useSelector} from 'react-redux';
import PatientProfile from './PatientProfile';
import NotificationBar from '../NotificationBar';
import PatientsEntries from './PatientsEntries';
import * as FileSaver from 'file-saver';
import XLSX from 'sheetjs-style';


const PatientDetails = () => {

  
    const [data, setData] = useState({});
    const [loading, setLoading] = useState(true);
    const [value, setValue] = React.useState('1');
    const [status, setStatus] = useState({msg:"",severity:"success", open:false});
    const { id } = useParams();
    const navigate = useNavigate();
    const userData = useSelector(state => state.data);
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [buttonLoading, setButtonLoading ] = useState(false);


    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const showMsg = (msg, severity)=>{
        setStatus({msg, severity, open:true})
    };

    const handleOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleCloseMenu = () => {
        setAnchorEl(null);
    };

    useEffect(()=>{

        setLoading(true);
        axios.get(`${process.env.REACT_APP_BE_URL}/user/patient/${id}`,
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


    const handleDownload = async (patientData) => {
        setButtonLoading(true);
        axios.get(`${process.env.REACT_APP_BE_URL}/user/entry/get/patient/${id}`,{
            params: { },
            headers: {
                'Authorization': `Bearer ${userData.accessToken.token}`,
                'email': userData.email,
            },
            withCredentials: true
        }).then(res=>{
            const da = [patientData];
            delete da._id;
            const riskFac = patientData.risk_factors;
            delete da.risk_factors;
            const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
            const fileExtension = '.xlsx';

            const ws = XLSX.utils.json_to_sheet(riskFac);
            const wp = XLSX.utils.json_to_sheet(da);
            const wq = XLSX.utils.json_to_sheet(res.data);
            const wb = { 
                Sheets: { 'data': wp, 'Risk Factors' : ws, 'Entries': wq }, SheetNames: ['data', 'Risk Factors', 'Entries']
            };
            const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
            const data = new Blob([excelBuffer], {type: fileType});
            FileSaver.saveAs(data, patientData.patient_name + fileExtension);
        }).catch(err=>{
            if(err.response) showMsg(err.response.data.message, "error")
            else alert(err)
        }).finally(()=>{
            setButtonLoading(false);
        })
    }

   
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
                <Box flex={1}></Box>
                <IconButton
                  id="fade-button"
                  aria-controls={Boolean(anchorEl) ? "fade-menu" : undefined}
                  aria-haspopup="true"
                  aria-expanded={Boolean(anchorEl) ? "true" : undefined}
                  onClick={handleOpen}
                >
                  <MoreVert />
                </IconButton>
            </Stack>
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleCloseMenu}
                onClick={handleCloseMenu}
                PaperProps={{
                  elevation: 0,
                  sx: {
                    overflow: "visible",
                    filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
                    mt: 1.5,
                    "&:before": {
                      content: '""',
                      display: "block",
                      position: "absolute",
                      top: 0,
                      right: 14,
                      width: 10,
                      height: 10,
                      bgcolor: "background.paper",
                      transform: "translateY(-50%) rotate(45deg)",
                      zIndex: 0,
                    },
                  },
                }}
                transformOrigin={{ horizontal: "right", vertical: "top" }}
                anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
              >
                <MenuItem>
                  <ListItemIcon>
                    <Download />
                  </ListItemIcon>
                  <ListItemText onClick={() => handleDownload(data)}>Download</ListItemText>
                </MenuItem>
              </Menu>
            <Box sx={{ width: '100%', typography: 'body1' }}>
            <TabContext value={value}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider'}}>
                <TabList onChange={handleChange} aria-label="lab API tabs example" variant='standard'>
                    <Tab disableRipple label="Profile" value="1"/>
                    <Tab disableRipple label="All Entries" value="2" />
                </TabList>
                </Box>
                <TabPanel value="1" sx={{px:0}}><PatientProfile data={data}/></TabPanel>
                <TabPanel value="2" sx={{px:0}}><PatientsEntries/></TabPanel>
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