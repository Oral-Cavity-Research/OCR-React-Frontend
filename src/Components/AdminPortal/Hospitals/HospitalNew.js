import React, { useState} from 'react';
import {useNavigate} from 'react-router-dom';
import { ArrowBack, LocalHospital } from '@mui/icons-material';
import { Box, Stack, Typography,Button, Paper, TextField} from '@mui/material';
import { useSelector} from 'react-redux';
import axios from 'axios';
import NotificationBar from '../../NotificationBar';
import { MuiTelInput } from 'mui-tel-input';

const HospiatalNew = () => {

    const [status, setStatus] = useState({msg:"",severity:"success", open:false}) 
    const [data, setData] = useState({});
    const selectorData = useSelector(state => state.data);
    const [userData, setUserData] = useState(selectorData);
    const [loading, setLoading] = useState(false);
    const [value, setValue] = useState('+94');
    const [name, setName] = useState("");
    const navigate = useNavigate();

    const showMsg = (msg, severity)=>{
        setStatus({msg, severity, open:true})
    }

    const handleCancle = ()=>{
        navigate("/adminportal/hospitals")
    }

    const handleSubmit = (event)=>{
        event.preventDefault();
        const form = new FormData(event.currentTarget);

        const name = form.get("name");
        const category = form.get("category");
        const city = form.get("city");
        const address = form.get("address");

        const upload = {name,category,city,address, contact_no:value}

        setLoading(true);
        axios.post(`${process.env.REACT_APP_BE_URL}/admin/hospital`, upload,
        { headers: {
            'Authorization': `Bearer ${userData.accessToken.token}`,
            'email': JSON.parse(sessionStorage.getItem("info")).email,
        }}
        ).then(res=>{
            showMsg("Hospital added successfuly", "success");
        }).catch(err=>{
            if(err.response) showMsg(err.response.data.message, "error")
            else alert(err)
        }).finally(()=>{
            setLoading(false);
        })
    }

    return (
        <div className="inner_content">
        <div>
            <Box className="sticky">    
            <Typography sx={{ fontWeight: 700}} variant="h5">Hospital</Typography>    
            
            <Button onClick={() => navigate(-1)} size='small' startIcon={<ArrowBack/>} sx={{p:0}}>Go Back</Button>
            </Box>  

            <Paper sx={{p:2, my:3}}>  
            <Stack direction='row' spacing={2} alignItems='center' sx={{mt:3}}>
                <LocalHospital sx={{width:'60px',height:'60px'}} color='error'/>
                <Stack direction='column'>
                    <Typography variant='h6'>{name}</Typography>
                </Stack>
            </Stack>
           
            <Box component='form' onSubmit={handleSubmit} autoComplete='false' >
                <Stack direction='column' spacing={3} sx={{my:3}}>
                    <TextField size='small' fullWidth name="name" label="Name" onChange={(e)=>setName(e.target.value)}/>
                    <TextField size='small' fullWidth  name="category" label="Category"/>
                    <TextField size='small' fullWidth  name="city" label='City'/>
                    <TextField size='small' fullWidth  name="address" label='Address'/>

                    <MuiTelInput value={value} onChange={(newValue)=>setValue(newValue)} size='small' name='contact_no' placeholder='Phone Number' fullWidth/> 
                </Stack>
                <Stack direction='row' spacing={2}>
                    <Button type='submit' variant='contained'>Save</Button>
                    <Button variant='outlined' onClick={{handleCancle}}>Cancle</Button>
                </Stack>
            </Box>
            </Paper>
            <NotificationBar status={status} setStatus={setStatus}/>
        </div>
    </div>
    );
};

export default HospiatalNew;