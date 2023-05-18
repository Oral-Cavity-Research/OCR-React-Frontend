import React, {useState, useEffect} from 'react';
import {Box,Button,Paper,Avatar,CssBaseline, Stack, Divider, 
    FormControl, InputLabel, Select, MenuItem} from '@mui/material';
import {TextField, Grid,Typography} from '@mui/material';
import { Link } from 'react-router-dom';
import background_img from '../Assets/background.jpeg';
import logo from '../Assets/logo.svg'
import axios from 'axios';
import NotificationBar from '../Components/NotificationBar';
import { MuiTelInput } from 'mui-tel-input';
import jwt_decode from 'jwt-decode';

const SignupPage =()=>{

    const [loading, setLoading] = useState(false);
    const [details, setDetails] = useState(false);
    const [email, setEmail] = useState(null);
    const [status, setStatus] = useState({msg:"",severity:"success", open:false});
    const [value, setValue] = useState('+94');
    const [hospital, setHospital] = useState("");
    const [hospitalList, setHospitalList] = useState([]);
    
    const handleChange = (newValue) => {
        setValue(newValue)
      }

    const showMsg = (msg, severity)=>{
        setStatus({msg, severity, open:true})
    }

    useEffect(()=>{
        const google = window.google;

        google.accounts.id.initialize({
            client_id: process.env.REACT_APP_CLIENT_ID,
            callback: handleCallBackResponse
        });

        google.accounts.id.renderButton(
            document.getElementById("signupDiv"),
            {theme:"filled_black", size:"large", type: "standard"}
        );

        google.accounts.id.prompt();

    },[])

    useEffect(()=>{
        
        axios.get(`${process.env.REACT_APP_BE_URL}/user/self/hospitals`,
        {
            withCredentials: true
        }
        ).then(res=>{
            setHospitalList(res.data);
        }).catch(err=>{
            if(err.response) showMsg(err.response.data.message, "error")
            else alert(err)
        })
        

    },[])

    function handleCallBackResponse(response){
        var userObject = jwt_decode(response.credential);

        setEmail(userObject.email);
        setDetails(true);
    }

    const handleSignUpSubmit = (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);

        if(data.get('email')==="" || data.get('regNo')==="" 
        || data.get('username')==="" || data.get('contactNo').length <= 4 || hospital===""){
            showMsg("Cannot leave required fields empty","error")
            return
        }

        if(data.get("username").length < 5){
            showMsg("Username too short","error")
            return
        }

        setLoading(true)
        axios.post(`${process.env.REACT_APP_BE_URL}/auth/signup`, {
                username: data.get('username'),
                email: email,
                reg_no: data.get('regNo'),
                hospital: hospital,
                contact_no: data.get('contactNo')
            })
            .then(function (response) {
                showMsg(response.data.message, "success")
            })
            .catch(function (error) {
                if(error.response?.data?.message){
                    showMsg(error.response.data.message, "error")
                }else{
                    alert(error, "error")
                }
            }).finally(()=>{
                setLoading(false)
            });
    };

    return (
        <Grid container component="main" sx={{ height: '100vh' }}>
            <CssBaseline />
            <Grid item xs={false} sm={4} md={7} sx={{ background: `url(${background_img}) left center`, backgroundRepeat: 'no-repeat',backgroundSize: 'cover'}}/>
          
            <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square container justify="flex-end" alignItems="center">
                
                <Stack direction='column' alignItems='center' spacing={2} sx={{mx: 4, p:2}}>
                    <Avatar sx={{ m: 1, bgcolor: 'primary.main' }} alt="Oral" src={logo}/>
                    <Typography variant="h5" align='center' className='App-title'> Oral Assessment & Screening Interactive System </Typography>
                    <Divider sx={{width:'100%', "&::before, &::after": {borderColor: "black",},}}>Sign Up</Divider>
                    
                    {
                        details?
                        <Box component="form" noValidate onSubmit={handleSignUpSubmit} sx={{ mt: 1, width:'100%'}}>
                            <Stack direction='column' spacing={2}>
                            <TextField size='small' value={email} disabled inputProps={{ maxLength: 100}} required fullWidth id="email" label="Email" name="email"/>
                            <TextField size='small' inputProps={{ maxLength: 100}} required fullWidth id="username" label="Username" name="username"/>
                            <TextField size='small' inputProps={{ maxLength: 100}} required fullWidth id="regNo" label="SLMC Registration Number" name="regNo"/>
                            
                            <MuiTelInput value={value} onChange={handleChange} size='small' name='contactNo' placeholder='Phone Number' fullWidth/>
                            <FormControl size='small' required>
                                <InputLabel id="hospital">Hospital</InputLabel>
                                <Select fullWidth size='small'  value={hospital} labelId="hospital" label="Hospital" onChange={(e)=>setHospital(e.target.value)} sx={{ mb:1}}>
                                    {
                                        hospitalList.map((place, index) => {
                                            return(<MenuItem  key={index} value={place.name}>{place.name}</MenuItem>)
                                        })
                                    }
                                </Select>
                            </FormControl>
                                            
                            <Button type="submit" disabled={loading} fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} >Request to Register</Button>
                            </Stack>
                        </Box>
                        :
                        <div id='signupDiv'></div>
                    }
                    
                    <Typography variant="body2">
                    <Link to={'/login'}>Already have an account? Log In</Link>
                    </Typography>
                </Stack>
            </Grid>
                 
            <NotificationBar status={status} setStatus={setStatus}/>
        </Grid>
    );
}


export default  SignupPage;