import React, { useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import { ArrowBack, CheckBox, CheckBoxOutlineBlank, Edit, LockPerson } from '@mui/icons-material';
import { Box, Stack, Typography, Skeleton, Button, Paper, FormLabel, FormGroup, FormControl, FormControlLabel, Checkbox, Divider, CircularProgress} from '@mui/material';
import { useSelector} from 'react-redux';
import axios from 'axios';
import NotificationBar from '../../NotificationBar';
import { LoadingButton } from '@mui/lab';

const EditUserPermission = () => {

    const [status, setStatus] = useState({msg:"",severity:"success", open:false}) 
    const [data, setData] = useState({});
    const [ editEnable, setEditEnable] = useState(true);
    const [ updating, setUpdating] = useState(false);
    const [permissions, setPermissions] = useState([]);
    const selectorData = useSelector(state => state.data);
    const [userData, setUserData] = useState(selectorData);
    const [loading, setLoading] = useState(true);
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(()=>{
        setLoading(true);
        axios.get(`${process.env.REACT_APP_BE_URL}/admin/roles/${id}`,
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

    useEffect(()=>{
        axios.get(`${process.env.REACT_APP_BE_URL}/admin/option/permissions`,
        { headers: {
            'Authorization':  `Bearer ${userData.accessToken.token}`,
            'email': userData.email,
        }}
        ).then((res)=>{
            setPermissions(res.data.options);
            
        }).catch(err=>{
            if(err.response) showMsg(err.response.data.message, "error")
            else alert(err)
        })
    },[])

    const handleUpdate = (event)=>{
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        setUpdating(true);

        const upload = {
            role: data.role,
            permissions: []
        }

        for(var i=0; i< permissions.length; i++){
            if(formData.get(`p${permissions[i].value}`)!==null){
                upload.permissions.push(permissions[i].value)
            }
        }

        if(upload.permissions.length==0){
            showMsg("Atleast add one permission", "error");
            setUpdating(false);
            return;
        }

        axios.post(`${process.env.REACT_APP_BE_URL}/admin/roles/${data._id}`, upload,
        { headers: {
            'Authorization': `Bearer ${userData.accessToken.token}`,
            'email': userData.email,
        }}
        ).then(res=>{
            showMsg(res.data.message,"success");
            setEditEnable(!editEnable);
        }).catch(err=>{
            if(err.response) showMsg(err.response.data.message, "error")
            else alert(err)  
        }).finally(()=>{
            setUpdating(false);
        })

    }

    const showMsg = (msg, severity)=>{
        setStatus({msg, severity, open:true})
    }

    return (
        <div className="inner_content">
        <div>
            <Box className="sticky">    
            <Typography sx={{ fontWeight: 700}} variant="h5">User Permissions</Typography>    
            
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
                <LockPerson sx={{width:'60px',height:'60px'}} color='error'/>
                <Stack direction='column'>
                    <Typography variant='h6'>{data.role}</Typography>
                </Stack>
            </Stack>
            <Stack direction='row' spacing={2} py={2} justifyContent='flex-end'>
                <Button variant='contained' endIcon={<Edit/>} onClick={() => setEditEnable(!editEnable)}
                style={{ display: !(editEnable) ? 'none' : undefined }}>Edit</Button>
                <Button style={{ display: editEnable ? 'none' : undefined }} variant='outlined' onClick={()=>{setEditEnable(!editEnable)}}>Cancel</Button>
            </Stack>
           
           <Box component='form' onSubmit={handleUpdate}>
            <Stack direction='column' spacing={2} sx={{border:"1px solid lightgray", borderRadius:1, py:2}}>
                <FormControl component="fieldset" sx={{p:2}}>
                <FormLabel component="legend" color='info'>Administrative Permissions</FormLabel>
                <FormGroup aria-label="position" sx={{ml:2}}>
                    {
                        permissions.map((p,index)=>{
                            if(100 <= p.value && p.value < 200){
                                return(
                                    editEnable?
                                    <Stack key={index} direction='row' spacing={1} marginY={1} alignItems='center'>
                                        {
                                            data.permissions && data.permissions.includes(p.value)?
                                            <CheckBox fontSize='small' color='success'/>
                                            :
                                            <CheckBoxOutlineBlank fontSize='small'/>
                                        }
                                        <Typography>{p.label}</Typography>
                                    </Stack>
                                    :
                                    <FormControlLabel
                                    key={index}
                                    value={p.value}
                                    control={
                                    <Checkbox size='small' defaultChecked={data.permissions.includes(p.value)} name={`p${p.value}`}/>}
                                    label={p.label}
                                    />
                                )
                            }
                        })
                    }
                </FormGroup>
                </FormControl>
                <Divider/>
                <FormControl component="fieldset" sx={{p:2}}>
                <FormLabel component="legend" color='info'>Reviewing Permissions</FormLabel>
                <FormGroup aria-label="position" sx={{ml:2}}>
                    {
                        permissions.map((p,index)=>{
                            if(200 <= p.value && p.value < 300){
                                return(
                                    editEnable?
                                    <Stack key={index} direction='row' spacing={1} marginY={1} alignItems='center'>
                                        {
                                            data.permissions && data.permissions.includes(p.value)?
                                            <CheckBox fontSize='small' color='success'/>
                                            :
                                            <CheckBoxOutlineBlank fontSize='small'/>
                                        }
                                        <Typography>{p.label}</Typography>
                                    </Stack>
                                    :
                                    <FormControlLabel
                                    key={index}
                                    value={p.value}
                                    control={
                                    <Checkbox size='small' defaultChecked={data.permissions.includes(p.value)} name={`p${p.value}`}/>}
                                    label={p.label}
                                    />
                                )
                            }
                        })
                    }
                </FormGroup>
                </FormControl>
                <Divider/>
                <FormControl component="fieldset" sx={{p:2}}>
                <FormLabel component="legend" color='info'>Data Handling Permissions</FormLabel>
                <FormGroup aria-label="position" sx={{ml:2}}>
                    {
                        permissions.map((p,index)=>{
                            if(300 <= p.value && p.value < 400){
                                return(
                                    editEnable?
                                    <Stack key={index} direction='row' spacing={1} marginY={1} alignItems='center'>
                                        {
                                            data.permissions && data.permissions.includes(p.value)?
                                            <CheckBox fontSize='small' color='success'/>
                                            :
                                            <CheckBoxOutlineBlank fontSize='small'/>
                                        }
                                        <Typography>{p.label}</Typography>
                                    </Stack>
                                    :
                                    <FormControlLabel
                                    key={index}
                                    value={p.value}
                                    control={
                                    <Checkbox size='small' defaultChecked={data.permissions.includes(p.value)} name={`p${p.value}`}/>}
                                    label={p.label}
                                    />
                                )
                            }
                        })
                    }
                </FormGroup>
                </FormControl>
                </Stack>
                { !editEnable && <LoadingButton sx={{my:2}}
                loadingIndicator={<CircularProgress color="inherit" size={16}/>}
                loading={updating} variant='contained' type="submit">Save</LoadingButton>}
                </Box>
            </Paper>
            }
            <NotificationBar status={status} setStatus={setStatus}/>
        </div>
    </div>
    );
};

export default EditUserPermission;