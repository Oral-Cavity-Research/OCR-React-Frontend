import React, { useEffect, useRef, useState} from 'react';
import { useNavigate, useParams} from 'react-router-dom';
import { ArrowBack } from '@mui/icons-material';
import { Box, Stack, Avatar, Typography, Skeleton, Button, Divider, 
         Table, TableBody, TableCell, TableRow, Paper} from '@mui/material';
import { stringAvatar } from '../../utils';
import axios from 'axios';
import NotificationBar from '../../NotificationBar';
import ResetPasswordDialog from './ResetPasswordDialog';
import DeleteUserDialog from './DeleteUserDialog';
import { useSelector} from 'react-redux';
import { LoadingButton } from '@mui/lab';
import UserRolesDropdown from '../../UserRolesDropDown';

const UserDetails = () => {

    const [role, setRole] = useState(null);
    const [status, setStatus] = useState({msg:"",severity:"success", open:false}) 
    const [data, setData] = useState({});
    const [loading, setLoading] = useState(true);
    const [isReset, setIsReset] = useState(false);
    const [isDelete, setIsDelete] = useState(false);
    const [state, setState] = useState(0);
    const [permissions, setPermissions] = useState({});
    const formRef = useRef();
    const { id } = useParams();
    const navigate = useNavigate();
    const userData = useSelector(state => state.data);

    useEffect(()=>{

        setLoading(true);
        axios.get(`${process.env.REACT_APP_BE_URL}/admin/users/${id}`,
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

    const handleUpdate = ()=>{

        const formData = new FormData(formRef.current);
        const role = parseInt(formData.get('role'));
        const username = formData.get('username');
      
        setState(1);

        axios.post(`${process.env.REACT_APP_BE_URL}/admin/update/user/${data._id}`,
        {
          username: username,
          role: [role]
        },
        { headers: {
            'Authorization': `Bearer ${userData.accessToken.token}`,
            'email': JSON.parse(sessionStorage.getItem("info")).email,
        }}
        ).then(res=>{
            setData(res.data)
            showMsg("User details updated successfully", "success");
        }).catch(err=>{
            if(err.response) showMsg(err.response.data.message, "error")
            else alert(err)
        }).finally(()=>{
            setState(0);
        })

    }

    
    const showMsg = (msg, severity)=>{
        setStatus({msg, severity, open:true})
    }

    return (
        <div className="inner_content">
        <div> 
        <Box className='sticky'>    
            <Typography sx={{ fontWeight: 700}} variant="h5">Clinicians</Typography>    
        
        <Button onClick={() => navigate(-1)} size='small' startIcon={<ArrowBack/>} sx={{p:0}}>Go Back</Button>
        </Box>
        <Box sx={{my:3}}>            
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
                <Avatar {...stringAvatar(data.username, 60)} variant='rounded' />
                <Stack direction='column'>
                    <Typography variant='h6'>{data.username}</Typography>
                    <Typography color='GrayText'>{data.reg_no}</Typography>
                </Stack>
            </Stack>

            <Box component="form" noValidate ref={formRef} sx={{ mt: 5 }}>

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
                        <TableCell>Hospital:</TableCell>
                        <TableCell>{data.hospital}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Role</TableCell>
                        <TableCell>{data.role}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Created at:</TableCell>
                        <TableCell>{(data.createdAt?.split("T"))[0]}</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
            </Box>
            </Paper>
            {
            userData.permissions?.includes(107) &&
            <Paper sx={{p:2, my:3}}>
            <Box sx={{border: '1px solid red', borderRadius:'5px'}}>
                <Stack direction='row' spacing={1} sx={{p:3}} alignItems='end'>
                    <div style={{flexGrow: 1}}>
                    <Typography color='error' mb={1}>Change User Role</Typography>
                    <UserRolesDropdown setValue={setRole}/>
                    </div>
                    <LoadingButton onClick={handleUpdate} loading={state=== 1} variant="contained" color='error' disabled={state!==0}>Change Role</LoadingButton>
                </Stack>
                {
                    !(role == null) && 
                    
                    <Box sx={{border:'1px solid lightgray', borderRadius:1, p:2, mx:3, mb:3}}>
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
                <Divider sx={{bgcolor: 'red'}}/>
                <Stack direction='row' sx={{p:3}} alignItems='end'>
                    <div style={{flexGrow: 1}}>
                    <Typography color='error'>Reset Password</Typography>
                    <Typography color='GrayText'>Once you change the password, the user will no longer be able to log in to the application using the current password.</Typography>
                    </div>
                    <Button variant='contained' color='error' onClick={()=>setIsReset(!isReset)}>Reset Password</Button>
                </Stack>
                {
                    isReset &&
                    <Stack sx={{p:3}} justifyContent='center' direction='row'>
                        <ResetPasswordDialog user={data} setIsReset={setIsReset}/>
                    </Stack>
                    
                }
                <Divider sx={{bgcolor: 'red'}}/>
                <Stack direction='row' sx={{p:3}} alignItems='end'>
                    <div style={{flexGrow: 1}}>
                    <Typography color='error'>Delete user</Typography>
                    <Typography color='GrayText'>This action will permanently delete the user from the organization. Please be certain before you proceed.</Typography>
                    </div>
                    <Button variant='contained' color='error' onClick={()=>setIsDelete(!isDelete)}>Delete User</Button>
                </Stack>
                {
                    isDelete &&
                    <Stack sx={{p:3}} direction='row'>
                        <DeleteUserDialog user={data} setIsDelete={setIsDelete}/>
                    </Stack>
                    
                }
            </Box>
            </Paper>
            }
            </>
}
            <NotificationBar status={status} setStatus={setStatus}/>
        </Box>
        </div>
        </div>
    );
};

export default UserDetails;