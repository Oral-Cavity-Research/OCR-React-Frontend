import React, { useEffect, useRef, useState} from 'react';
import { Link, useNavigate, useParams} from 'react-router-dom';
import { ArrowBack} from '@mui/icons-material';
import { Box, Stack, Avatar, Typography, TextField,
     Skeleton, Button, Table, TableBody, TableCell, TableRow, Paper} from '@mui/material';
import { stringAvatar } from '../../utils';
import axios from 'axios';
import NotificationBar from '../../NotificationBar';
import LoadingButton from '@mui/lab/LoadingButton';
import { useSelector} from 'react-redux';
import UserRolesDropdown from '../../UserRolesDropDown';

const RequestDetails = () => {

    const [status, setStatus] = useState({msg:"",severity:"success", open:false}) 
    const [ permissions, setPermissions] = useState({});
    const [data, setData] = useState({});
    const [loading, setLoading] = useState(true);
    const [role, setRole] = useState(null);
    const [state, setState] = useState(0);
    const formRef = useRef();
    const { id } = useParams();
    const navigate = useNavigate();
    const userData = useSelector(state => state.data);    


    useEffect(()=>{

        setLoading(true);
        axios.get(`${process.env.REACT_APP_BE_URL}/admin/requests/${id}`,
        { headers: {
            'Authorization':  `Bearer ${userData.accessToken.token}`,
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

    const handleAccept = ()=>{

        const formData = new FormData(formRef.current);

        if(formData.get('role')===""){
            showMsg("Add a user role","error");
            return
        }

        setState(1);

        axios.post(`${process.env.REACT_APP_BE_URL}/admin/accept/${data._id}`,
        {
          username: data.username,
          role: formData.get('role'),
          reason: formData.get('reason')
        },
        { headers: {
            'Authorization': 'BEARER '+ JSON.parse(sessionStorage.getItem("info")).atoken,
            'email': JSON.parse(sessionStorage.getItem("info")).email,
        }}
        ).then(res=>{
            showMsg(res.data.message, "success");
            navigate("/adminportal/requests");
        }).catch(err=>{
            if(err.response) showMsg(err.response.data.message, "error")
            else alert(err)
            setState(0);
        })

    }

    const handleReject = ()=>{

        const formData = new FormData(formRef.current);
        const reason = formData.get('reason');
       
        setState(2);
        
        axios.post(`${process.env.REACT_APP_BE_URL}/admin/requests/${data._id}`,
        {
            reason: reason
        },
        { headers: {
            'Authorization': 'BEARER '+ JSON.parse(sessionStorage.getItem("info")).atoken,
            'email': JSON.parse(sessionStorage.getItem("info")).email,
        }}
        ).then(res=>{
            showMsg(res.data.message, "success")
            navigate("/adminportal/requests");
        }).catch(err=>{
            if(err.response) showMsg(err.response.data.message)
            else alert(err)
            setState(0);
        })
    }

    const showMsg = (msg, severity)=>{
        setStatus({msg, severity, open:true})
    }

    useEffect(()=>{
        axios.get(`${process.env.REACT_APP_BE_URL}/admin/option/permissions`,
        { headers: {
            'Authorization':  `Bearer ${userData.accessToken.token}`,
            'email': JSON.parse(sessionStorage.getItem("info")).email,
        }}
        ).then((res)=>{
            var parsed_json = res.data.options;
            var json_object = {};
            for (var i = 0; i < parsed_json.length; i++) {
            json_object[parsed_json[i].value] = parsed_json[i].label;
            }
            setPermissions(json_object);
            
        }).catch(err=>{
            if(err.response) showMsg(err.response.data.message, "error")
            else alert(err)
        })
    },[])

    return (
        <div className="inner_content">
        <div>
            <Box className='sticky'>    
            <Typography sx={{ fontWeight: 700}} variant="h5">Requests</Typography>    
            
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
            <>
            <Paper sx={{p:2, my:3}}>
            <Stack direction='row' spacing={2} alignItems='center' sx={{my:3}}>
                <Avatar {...stringAvatar(data.username, 60)} variant='rounded' />
                <Stack direction='column'>
                    <Typography variant='h6'>{data.username}</Typography>
                    <Typography color='GrayText'>{data.reg_no}</Typography>
                </Stack>
            </Stack>
            <Table  sx={{border: '1px solid lightgray'}}>
                <TableBody>
                    <TableRow>
                        <TableCell>Name:</TableCell>
                        <TableCell>{data.username}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>SLMC Register Number:</TableCell>
                        <TableCell>{data.reg_no}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Email:</TableCell>
                        <TableCell>{data.email}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Contact No:</TableCell>
                        <TableCell>{data.contact_no? data.contact_no.replace(/\s/g, ''):""}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Hospital</TableCell>
                        <TableCell>{data.hospital}</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        
            </Paper>
            <Paper sx={{p:2, my:3}}>
            <Box component="form" noValidate ref={formRef}>
            
            <Stack direction='column' spacing={1}  my={2} justifyContent='center' alignItems='flex-end'>
                <UserRolesDropdown setValue={setRole}/>
                <Button component={Link} to='/adminportal/permissions/new' size='small' >Add New User Role?</Button>
            </Stack>   

            {
                !(role == null) && 
                
                <Box sx={{border:'1px solid lightgray', borderRadius:1, p:2, my:2}}>
                <Typography color='GrayText'>Permissions:</Typography>
                {
                role.permissions.map((p, i)=>{
                    return(
                        <Typography marginY={1} variant='body2' key={i}>{permissions[p]}</Typography>
                    )
                })
                }
                </Box>
                
            }

            <TextField label="Reason for Approval/Rejection (optional)" fullWidth multiline maxRows={4} name='reason' size='small' inputProps={{maxLength: 200}}/>
            
            <Stack direction='row' spacing={2} sx={{mt:3}}>
                <LoadingButton onClick={handleAccept} loading={state=== 1} variant="contained" disabled={state!==0}>Accept</LoadingButton>
                <LoadingButton onClick={handleReject} loading={state === 2} variant="outlined" disabled={state!==0}>Reject</LoadingButton>
            </Stack>
            </Box>
            </Paper>
            </>
}
            <NotificationBar status={status} setStatus={setStatus}/>
            <Box sx={{padding:'100px'}}></Box>
        </div>
    </div>
    );
};

export default RequestDetails;