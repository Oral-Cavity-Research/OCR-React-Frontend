import React, {useState, useEffect} from 'react';
import { Box, Button, FormControl, FormControlLabel, FormGroup, FormLabel, Paper, TextField, 
    Typography, Checkbox, Stack } from '@mui/material';
import axios from 'axios';
import NotificationBar from '../../NotificationBar';
import {useNavigate } from 'react-router-dom';
import { ArrowBack, LockPerson} from '@mui/icons-material';
import { useSelector} from 'react-redux';
import { LoadingButton } from '@mui/lab';

const NewUserPermission = () => {

    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({msg:"",severity:"success", open:false});
    const [permissions, setPermissions] = useState([]);
    const userData = useSelector(state => state.data);
    const navigate = useNavigate();

    const handleAdd = (event)=>{
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        setLoading(true);

        const upload = {
            role: name,
            permissions: []
        }

        for(var i=0; i< permissions.length; i++){
            if(formData.get(`p${permissions[i].value}`)!==null){
                upload.permissions.push(permissions[i].value)
            }
        }

        if(name===""){
            showMsg("Add valid name for the role", "error");
            setLoading(false);
            return;
        }

        if(upload.permissions.length==0){
            showMsg("Atleast add one permission", "error");
            setLoading(false);
            return;
        }

        axios.post(`${process.env.REACT_APP_BE_URL}/admin/roles`, upload,
        { headers: {
            'Authorization': `Bearer ${userData.accessToken.token}`,
            'email': userData.email,
        }}
        ).then(res=>{
            showMsg(res.data.message,"success");
            navigate("/adminportal/permissions")
            
        }).catch(err=>{
            if(err.response) showMsg(err.response.data.message, "error")
            else alert(err)  
        }).finally(()=>{
            setLoading(false);
        })
    }

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
            
            <Paper  sx={{p:2, my:3}}>
                <Stack direction='row' spacing={2} alignItems='center' sx={{mt:3}}>
                    <LockPerson sx={{width:'60px',height:'60px'}} color='error'/>
                    <Stack direction='column'>
                        <Typography variant='h6'>{name}</Typography>
                    </Stack>
                </Stack>
                <Box component='form' onSubmit={handleAdd}>
                <TextField sx={{my:3}} name="role" fullWidth size='small' label="Role Name" onChange={(e)=>setName(e.target.value)}
                
                />
                <Stack direction='column' spacing={2}>

                <FormControl component="fieldset">
                <FormLabel component="legend" color='info'>Administrative Permissions</FormLabel>
                <FormGroup aria-label="position" sx={{ml:2}}>
                    {
                        permissions.map((p,index)=>{
                            if(100 <= p.value && p.value < 200){
                                return(
                                    <FormControlLabel
                                    key={index}
                                    value={p.value}
                                    control={<Checkbox size='small' name={`p${p.value}`}/>}
                                    label={p.label}
                                    />
                                )
                            }
                        })
                    }
                </FormGroup>
                </FormControl>
                <FormControl component="fieldset">
                <FormLabel component="legend" color='info'>Reviewing Permissions</FormLabel>
                <FormGroup aria-label="position" sx={{ml:2}}>
                    {
                        permissions.map((p,index)=>{
                            if(200 <= p.value && p.value < 300){
                                return(
                                    <FormControlLabel
                                    key={index}
                                    value={p.value}
                                    control={<Checkbox size='small' name={`p${p.value}`}/>}
                                    label={p.label}
                                    />
                                )
                            }
                        })
                    }
                </FormGroup>
                </FormControl>
                <FormControl component="fieldset">
                <FormLabel component="legend" color='info'>Data Handling Permissions</FormLabel>
                <FormGroup aria-label="position" sx={{ml:2}}>
                    {
                        permissions.map((p,index)=>{
                            if(300 <= p.value && p.value < 400){
                                return(
                                    <FormControlLabel
                                    key={index}
                                    value={p.value}
                                    control={<Checkbox size='small' name={`p${p.value}`}/>}
                                    label={p.label}
                                    />
                                )
                            }
                        })
                    }
                </FormGroup>
                </FormControl>
                </Stack>

                <Stack sx={{my:3}} direction='row'>
                    <LoadingButton loading={loading} variant='contained' type='submit'>Add</LoadingButton>
                </Stack>
                </Box>
            </Paper>
            <NotificationBar status={status} setStatus={setStatus}/>
        </div>
        </div>
    );
};

export default NewUserPermission;