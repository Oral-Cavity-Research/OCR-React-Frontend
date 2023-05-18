import React, { useEffect, useRef, useState} from 'react';
import { Box, Stack, Avatar, Typography, TextField, Skeleton,
       Grid, Paper, Badge, Select, MenuItem, FormControl, InputLabel} from '@mui/material';
import axios from 'axios';
import NotificationBar from './NotificationBar';
import LoadingButton from '@mui/lab/LoadingButton';
import { useSelector} from 'react-redux';
import { styled } from '@mui/material/styles';
import { MuiTelInput } from 'mui-tel-input';
import dayjs from 'dayjs';
import { useDispatch } from 'react-redux';
import { setUserData } from '../Reducers/userDataSlice';

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    boxShadow: `0 0 0 5px ${theme.palette.background.paper}`,
  },
  "& .MuiBadge-dot": {
    height: 10,
    minWidth: 10,
    borderRadius: 10
  }
}));

const UserProfile = () => {

    const userData = useSelector(state => state.data);

    const [status, setStatus] = useState({msg:"",severity:"success", open:false}) 
    const [data, setData] = useState({});
    const [loading, setLoading] = useState(true);
    const [hospital, setHospital] = useState(userData.hospital);
    const [hospitalList, setHospitalList] = useState([]);
    const [availability, setAvailability] = useState("");
    const [state, setState] = useState(0);
    const formRef = useRef();
    const [value, setValue] = useState(userData.contact_no);

    const dispatch = useDispatch();
       
    const handleChange = (newValue) => {
        setValue(newValue)
    }

    useEffect(()=>{
        
        setLoading(true);
        axios.get(`${process.env.REACT_APP_BE_URL}/user/self/hospitals`,
        { headers: {
            'Authorization': `Bearer ${userData.accessToken.token}`,
            'email': userData.email,
        },
            withCredentials: true
        }
        ).then(res=>{
            setHospitalList(res.data);
            fetchData();
        }).catch(err=>{
            if(err.response) showMsg(err.response.data.message, "error")
            else alert(err)
        })
        

    },[])

    const fetchData = ()=>{
        axios.get(`${process.env.REACT_APP_BE_URL}/user/self`,
        { headers: {
            'Authorization': `Bearer ${userData.accessToken.token}`,
            'email': userData.email,
        },
            withCredentials: true
        }
        ).then(res=>{
            setData(res.data);
            setAvailability(res.data.availability)
            setValue(res.data.contact_no? res.data.contact_no:'+94');
            setLoading(false);
        }).catch(err=>{
            if(err.response) showMsg(err.response.data.message, "error")
            else alert(err)
        })
    }

    const handleUpdate = ()=>{

        const formData = new FormData(formRef.current);
        const username = formData.get('username');
        const contact_no = value;
        const designation = formData.get('designation');
      
        if(username ==="" || username.length <5){
            showMsg("Username should inlclude minimum 5 characters", "error");
            return;
        }

        const toBeSend = {username, designation, hospital, contact_no, availability};

        setState(1);

        axios.post(`${process.env.REACT_APP_BE_URL}/user/self/update`,
        toBeSend,
        { headers: {
            'Authorization': `Bearer ${userData.accessToken.token}`,
            'email': userData.email,
        }}
        ).then(res=>{
            setData(res.data)
            showMsg("User details updated successfully", "success");
            dispatch(setUserData({
                ...userData,
                username: username,
                hospital: hospital,
                contact_no: contact_no,
                availability: availability
            }));
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
        <Box className="content_wrapper">
        <Box sx={{flexGrow:1}} className='content'>
        <div className="inner_content">
        <div>
            <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                {loading?
                        <Paper sx={{p:3}}>
                        <Stack direction='column' spacing={1} alignItems='center'>
                            <Skeleton variant="circular" width={60} height={60} />
                            <Skeleton variant="text" width={210} sx={{ fontSize: '2rem' }} />
                            <Skeleton variant="text" width={210} />
                        </Stack>
                        </Paper>
                    :
                        <Paper sx={{p:3}}>
                       <Stack direction='column' spacing={1} alignItems='center'>
                            
                            <StyledBadge overlap="circular" anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} variant="dot" color={data.availability?'success':'error'}>
                            <Avatar 
                            src={userData.picture} 
                            alt={userData.username?userData.username:""}
                            sx={{ width: 60, height: 60 }}
                            ></Avatar>
                            </StyledBadge>
                            <Typography variant='h6'>{data.username}</Typography>
                            <Typography color='GrayText'>{data.reg_no}</Typography>
                            <Typography color='GrayText'>{data.role}</Typography>
                        </Stack>
            
                        </Paper>
                    }
                </Grid>
                <Grid item xs={12} md={8}>
                {loading?
                    <Paper sx={{p:3}}>
                    <Stack spacing={2}>
                        <Skeleton variant="rounded" height={40}/>
                        <Skeleton variant="rounded" height={40}/>
                    </Stack>
                    </Paper>
                    :
                    <Paper sx={{p:3, mb:3}}>
                    <Box component="form" noValidate ref={formRef}>

                    <Stack direction='column' spacing={3}>
                        <TextField defaultValue={data.username} name='username' size='small' label='User name'/>
                       
                        <FormControl>
                            <InputLabel id="Status">Status</InputLabel>
                            <Select fullWidth size='small'  value={availability? true: false} labelId="Status" label="Status" onChange={(e)=>setAvailability(e.target.value)} sx={{mb:1}}>
                            <MenuItem value={true}>Available</MenuItem>
                            <MenuItem value={false}>Unavailable</MenuItem>
                        </Select>
                        </FormControl>
                        
                        <TextField defaultValue={data.designation} name='designation' size='small' label='Designation'/>
                        <FormControl size='small'>
                            <InputLabel id="hospital">Hospital</InputLabel>
                            <Select fullWidth size='small'  value={hospital} labelId="hospital" label="Hospital" onChange={(e)=>setHospital(e.target.value)} sx={{ mb:1}}>
                                {
                                    hospitalList.map((place, index) => {
                                        return(<MenuItem  key={index} value={place.name}>{place.name}</MenuItem>)
                                    })
                                }
                            </Select>
                        </FormControl>
                        <MuiTelInput value={value} onChange={handleChange} size='small' name='contactNo' placeholder='Phone Number' margin="normal" fullWidth/>
                        <TextField sx={{"& .MuiInputBase-input.Mui-disabled": {WebkitTextFillColor: "#000000"}}} value={data.email} name='email' size='small' disabled label='Email'/>
                        <TextField sx={{"& .MuiInputBase-input.Mui-disabled": {WebkitTextFillColor: "#000000"}}} value={data.reg_no} name='reg_no' size='small' disabled label='SLMC Registration Number'/>
                        <TextField sx={{"& .MuiInputBase-input.Mui-disabled": {WebkitTextFillColor: "#000000"}}} value={dayjs(data.createdAt).format("DD/MM/YYYY")} name='created_at' size='small' disabled label='Created At'/>
                        <TextField sx={{"& .MuiInputBase-input.Mui-disabled": {WebkitTextFillColor: "#000000"}}} value={dayjs(data.updatedAt).format("DD/MM/YYYY")} name='updated_at' size='small' disabled label='Updated At'/>
                    </Stack>
                    <Stack direction='row' spacing={2} sx={{my:3}}>
                        <LoadingButton onClick={handleUpdate} loading={state=== 1} variant="contained" disabled={state!==0}>Update</LoadingButton>
                    </Stack>
                    </Box>
                    </Paper>
            }
                </Grid>
            </Grid>
            
            <NotificationBar status={status} setStatus={setStatus}/>
        </div>
        </div>
        </Box>
        </Box>
    );
};

export default UserProfile;