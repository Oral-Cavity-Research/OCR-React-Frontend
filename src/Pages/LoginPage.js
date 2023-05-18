import React, {useState, useEffect} from 'react';
import {Paper,Avatar,CssBaseline, Stack, Divider} from '@mui/material';
import {Grid,Typography} from '@mui/material';
import background_img from '../Assets/background.jpeg';
import logo from '../Assets/logo.svg'
import axios from 'axios';
import { useNavigate, Link } from "react-router-dom";
import NotificationBar from '../Components/NotificationBar';
import { useDispatch } from 'react-redux';
import { setUserData } from '../Reducers/userDataSlice';
import jwt_decode from 'jwt-decode';

const LoginPage =()=>{

    const [status, setStatus] = useState({msg:"",severity:"success", open:false});

    const navigate = useNavigate();

    const showMsg = (msg, severity)=>{
        setStatus({msg, severity, open:true})
    }

    const dispatch = useDispatch();

    useEffect(()=>{
        const google = window.google;

        google.accounts.id.initialize({
            client_id: process.env.REACT_APP_CLIENT_ID,
            callback: handleCallBackResponse
        });

        google.accounts.id.renderButton(
            document.getElementById("signinDiv"),
            {theme:"filled_black", size:"large", type: "standard"}
        );

        google.accounts.id.prompt();

    },[])

    function handleCallBackResponse(response){
        var userObject = jwt_decode(response.credential);

        axios.post(`${process.env.REACT_APP_BE_URL}/auth/verify`, {
            email: userObject.email
        }, { withCredentials: true })
        .then(function (response) {
            var data = response.data
            
            dispatch(setUserData({
                _id: data.others._id,
                username: data.others.username? data.others.username: userObject.name? userObject.name:userObject.email,
                email: data.others.email,
                role: data.others.role,
                permissions: data.others.permissions,
                accessToken: data.accessToken,
                reg_no: data.others.reg_no,
                picture: userObject.picture,
                availability: data.others.availability
            }))
    
            if(response.data?.others?.permissions?.includes(200)){
                navigate("/manage/shared/entries");
            }else if(response.data?.others?.permissions?.includes(300)){
                navigate("/manage/my/patients");
            }else{
                navigate("/adminportal");
            }
            
        })
        .catch(function (error) {
            if(error.response){
                showMsg(error.response.data?.message, "error")
            }else{
                alert(error)
            }
        })
    }

    return (
        <Grid container component="main" sx={{ height: '100vh' }}>
            <CssBaseline />
            <Grid item xs={false} sm={4} md={7} sx={{ background: `url(${background_img}) left center`, backgroundRepeat: 'no-repeat',backgroundSize: 'cover'}}/>
                <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square container justify="flex-end" alignItems="center" justifyContent='center'>
                    <Stack direction='column' alignItems='center' spacing={2} sx={{mx: 4, p:2}}>
                        <Avatar sx={{ m: 1, bgcolor: 'primary.main' }} alt="Oral" src={logo}/>
                        <Typography variant="h5" align='center' className='App-title'> Oral Assessment & Screening Interactive System </Typography>
                        <Divider sx={{width:'100%', "&::before, &::after": {borderColor: "black",},}}>Login As</Divider>
                        <div id='signinDiv'></div>
                       
                        <Typography variant="body2">
                        <Link to={'/signup'}>Don't have an account? Sign Up</Link>
                        </Typography>
                    </Stack>
                </Grid>
            <NotificationBar status={status} setStatus={setStatus}/>
        </Grid>
    );
}


export default LoginPage;