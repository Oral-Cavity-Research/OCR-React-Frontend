import React, {useState} from 'react';
import {Box,Button,Paper,Avatar,CssBaseline} from '@mui/material';
import {TextField, Grid,Typography, FormControl, IconButton, OutlinedInput, InputAdornment} from '@mui/material';
import {InputLabel} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import background_img from '../Assets/background.jpeg';
import logo from '../Assets/logo.svg'
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import NotificationBar from '../Components/NotificationBar';
import { useDispatch } from 'react-redux';
import { setUserData } from '../Reducers/userDataSlice';
import HospitalDropdown from '../Components/HospitalDropDown';
import { MuiTelInput } from 'mui-tel-input';

const LoginPage =()=>{

    const [singup, setSignup] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showSignupPassword, setShowSignupPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({msg:"",severity:"success", open:false});
    const [value, setValue] = useState('+94');

    const navigate = useNavigate();
    
    const handleChange = (newValue) => {
        setValue(newValue)
      }

    const showMsg = (msg, severity)=>{
        setStatus({msg, severity, open:true})
    }

    const dispatch = useDispatch();
    const handleClickShowPassword = () => setShowPassword((show) => !show);
    const handleClickShowConfirmPassword = () => setShowConfirmPassword((show) => !show);
    const handleClickShowSignupPassword = () => setShowSignupPassword((show) => !show);

    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };

    const toggleSignin = ()=>{
        setSignup(!singup);
    }

    const handleSignInSubmit = (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        
        if(data.get('email')==="" || data.get('password')===""){
            showMsg("Cannot leave Required fiels empty",'error')
            return
        }

        
        setLoading(true);

        axios.post(`${process.env.REACT_APP_BE_URL}/auth/login`, {
            email: data.get('email'),
            password: data.get('password')
        }, { withCredentials: true })
        .then(function (response) {
            var data = response.data
            const object = {_id: data.others._id,username: data.others.username, email: data.others.email, role: data.others.role, availability:data.others.availability, permissions: data.others.permissions, reg_no: data.others.reg_no, atoken: data.accessToken.token }
            sessionStorage.setItem("info",JSON.stringify(object))
            console.log(data)
            dispatch(setUserData({
                _id: data.others._id,
                username: data.others.username,
                email: data.others.email,
                role: data.others.role,
                permissions: data.others.permissions,
                accessToken: data.accessToken,
                reg_no: data.others.reg_no
              }))
            if(response.data.others.permissions.includes(200)){
                navigate("/manage/shared/entries");
            }else if(response.data.others.permissions.includes(300)){
                navigate("/manage/my/patients");
            }else{
                navigate("/adminportal");
            }
        })
        .catch(function (error) {
            if(error.response){
                showMsg(error.response.data.message, "error")
            }else{
                alert(error)
            }
        }).finally(()=>{
            setLoading(false);
        });

    };

    const handleSignUpSubmit = (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);

        if(data.get('signup email')==="" || data.get('regNo')==="" 
        || data.get('signup password')==="" || data.get('confirm password')===""
        || data.get('username')==="" || data.get('contactNo').length <= 4 || data.get('hospital')===""){
            showMsg("Cannot leave required fields empty","error")
            return
        }

        if(!/\S+@\S+\.\S+/.test(data.get("signup email"))){
            showMsg("Invalid email address","error")
            return
        }
       

        if(data.get("username").length < 5){
            showMsg("Username too short","error")
            return
        }

        if(data.get("signup password").length < 8){
            showMsg("Password should contain atleast 8 charactors","error")
            return
        }
        if(data.get("signup password") !== data.get("confirm password")){
            showMsg("Passwords doesn't match", 'error')
            return
        }
    
        

        setLoading(true)
        axios.post(`${process.env.REACT_APP_BE_URL}/auth/signup`, {
                username: data.get('username'),
                email: data.get('signup email'),
                reg_no: data.get('regNo'),
                password: data.get('signup password'),
                hospital: data.get('hospital'),
                contact_no: data.get('contactNo')
            })
            .then(function (response) {
                showMsg(response.data.message, "success")
                setSignup(false);
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
            {
                singup?
                <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square container justify="flex-end" alignItems="center">
                    <Box sx={{mx: 4, p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                        <Avatar sx={{ m: 1, bgcolor: 'primary.main' }} alt="Oral" src={logo}/>
                        <Typography component="h1" variant="h5"> Sign up </Typography>

                        <Box component="form" noValidate onSubmit={handleSignUpSubmit} sx={{ mt: 1 }}>

                        <TextField margin="normal" size='small' inputProps={{ maxLength: 100}} required fullWidth id="email" label="Email Address" name="signup email" autoFocus/>
                        <TextField margin="normal" size='small' inputProps={{ maxLength: 100}} required fullWidth id="username" label="Full Name" name="username"/>
                        <TextField margin="normal" size='small' inputProps={{ maxLength: 100}} required fullWidth id="regNo" label="SLMC Registration Number" name="regNo"/>
                        
                        <MuiTelInput value={value} onChange={handleChange} size='small' name='contactNo' placeholder='Phone Number' margin="normal" fullWidth/>

                        {/* <Dropdown margin="normal" size='small' options={options} name='hospital' placeholder="Select a hospital *" onChange={handleSelect} required={true} /> */}
                        <HospitalDropdown/>

                        <FormControl margin="normal" fullWidth  variant="outlined">
                        <InputLabel required size='small' htmlFor="signup password">Password</InputLabel>
                        <OutlinedInput required size='small' inputProps={{ maxLength: 100, autoComplete: 'new-password'}} id="signup password" type={showSignupPassword ? 'text' : 'password'} label="Password" name="signup password" autoComplete='false'
                            endAdornment={
                            <InputAdornment position="end">
                                <IconButton aria-label="toggle password visibility" onClick={handleClickShowSignupPassword} onMouseDown={handleMouseDownPassword} edge="end">
                                {showSignupPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>
                            }
                        />
                        </FormControl>
                        <FormControl margin="normal" fullWidth  variant="outlined">
                        <InputLabel required size='small' htmlFor="confirm password">Confirm Password</InputLabel>
                        <OutlinedInput required size='small' inputProps={{ maxLength: 100 }} id="confirm password" type={showConfirmPassword ? 'text' : 'password'} label="Confirm Password" name="confirm password"
                            endAdornment={
                            <InputAdornment position="end">
                                <IconButton aria-label="toggle password visibility" onClick={handleClickShowConfirmPassword} onMouseDown={handleMouseDownPassword} edge="end">
                                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>
                            }
                        />
                        </FormControl>                                                
                        <Button type="submit" disabled={loading} fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} >Request to Register</Button>
                        
                        <Grid container>
                            <Grid item xs></Grid>
                            <Grid item><Typography variant="body2" onClick={toggleSignin} sx={{cursor: 'pointer'}}>
                                {"Already have an account? Sign In"}
                            </Typography>
                            </Grid>
                        </Grid>
                        </Box>
                    </Box>
                </Grid>
                :
                <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square container justify="flex-end" alignItems="center">
                    <Box sx={{mx: 4, p:2, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                        <Avatar sx={{ m: 1, bgcolor: 'primary.main' }} alt="Oral" src={logo}/>
                        <Typography component="h1" variant="h5"> Sign in </Typography>
                        
                        <Box component="form" noValidate onSubmit={handleSignInSubmit} sx={{ mt: 1 }}>
                            
                        <TextField margin="normal" size='small' inputProps={{ maxLength: 100 }} required fullWidth id="email" label="Email Address" name="email" autoComplete="email" autoFocus/>
                        <FormControl margin="normal" fullWidth  variant="outlined">
                        <InputLabel required size='small' htmlFor="password">Password</InputLabel>
                        <OutlinedInput required size='small' inputProps={{ maxLength: 100 }} id="password" type={showPassword ? 'text' : 'password'} label="Password" name="password"
                            endAdornment={
                            <InputAdornment position="end">
                                <IconButton aria-label="toggle password visibility" onClick={handleClickShowPassword} onMouseDown={handleMouseDownPassword} edge="end">
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>
                            }
                        />
                        </FormControl>
                        {/* <FormControlLabel control={<Checkbox  size='small' value="remember" color="primary" />} label="Remember me" /> */}
                    
                        <Button type="submit" disabled={loading} fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} > Sign In </Button>
                        
                        <Grid container>
                            <Grid item xs> </Grid>
                            <Grid item>
                                <Typography variant="body2" onClick={toggleSignin} sx={{cursor: 'pointer'}}>
                                {"Don't have an account? Sign Up"}
                                </Typography>
                            </Grid>
                        </Grid>
                        </Box>
                    </Box>
                </Grid>
            }
            <NotificationBar status={status} setStatus={setStatus}/>
        </Grid>
    );
}


export default  LoginPage;