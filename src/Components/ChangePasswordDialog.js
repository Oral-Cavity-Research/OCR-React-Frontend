import React, {useState} from 'react';
import {Button, Stack} from '@mui/material';
import { FormControl, InputLabel, InputAdornment, IconButton, OutlinedInput, Typography } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { PasswordStrengthIndicator, passwordStrength } from './utils';
import LoadingButton from '@mui/lab/LoadingButton';
import NotificationBar from './NotificationBar';
import config from './../config.json';
import axios from 'axios';
import { useSelector} from 'react-redux';

export default function ChangePasswordDialog({setShowPassword}) {
    const [showCPassword, setShowCPassword] = useState(false);
    const [showNPassword, setShowNPassword] = useState(false);
    const [Cpassword, setCPassword] = useState("");
    const [confirm, setConfirm] = useState(false);
    const [Npassword, setNPassword] = useState("");
    const [state, setState] = useState(0);
    const [status, setStatus] = useState({msg:"",severity:"success", open:false});
    const selectorData = useSelector(state => state.data);
    const [userData, setUserData] = useState(selectorData);
   
    const handleCPasswordChange = (e)=>{
        setCPassword(e.target.value);
        handleConfirmation();
    }

    const handleNPasswordChange = (e)=>{
        setNPassword(e.target.value);
        handleConfirmation();
    }

    const handleConfirmation = ()=>{
        const ok = Cpassword!=="" && passwordStrength(Npassword) > 30;
        setConfirm(ok);
    }

    const handleClickShowCPassword = () => setShowCPassword((show) => !show);
    const handleClickShowNPassword = () => setShowNPassword((show) => !show);

    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };

    const showMsg = (msg, severity)=>{
        setStatus({msg, severity, open:true})
    }

    const handleReset = ()=>{
      
        setState(1);

        axios.post(`${config['path']}/user/self/password`,
        {
            cpassword: Cpassword,
            npassword: Npassword
        },
        { headers: {
            'Authorization': `Bearer ${userData.accessToken.token}`,
            'email': JSON.parse(sessionStorage.getItem("info")).email,
        }}
        ).then(res=>{
            showMsg("Password is updated successfully", "success");
        }).catch(err=>{
            if(err.response) showMsg(err.response.data.message, "error")
            else alert(err)
        }).finally(()=>{
            setState(0);
            setShowPassword(false);
        })

    }

  return (
    <div>
        <FormControl margin="normal" fullWidth  variant="outlined">
            <InputLabel required size='small' htmlFor="Cpassword">Current Password</InputLabel>
            <OutlinedInput required size='small' inputProps={{ maxLength: 30 }} id="Cpassword" type={showCPassword ? 'text' : 'password'} label="Current Password" name="cpassword"
                onChange={(e)=>handleCPasswordChange(e)}
                endAdornment={
                <InputAdornment position="end">
                    <IconButton aria-label="toggle password visibility" onClick={handleClickShowCPassword} onMouseDown={handleMouseDownPassword} edge="end">
                    {showCPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                </InputAdornment>
                }
            />
        </FormControl>
        <FormControl margin="normal" fullWidth  variant="outlined">
            <InputLabel required size='small' htmlFor="Npassword">New Password</InputLabel>
            <OutlinedInput required size='small' inputProps={{ maxLength: 30 }} id="Npassword" type={showNPassword ? 'text' : 'password'} label="New Password" name="npassword"
                onChange={(e)=>handleNPasswordChange(e)}
                endAdornment={
                <InputAdornment position="end">
                    <IconButton aria-label="toggle password visibility" onClick={handleClickShowNPassword} onMouseDown={handleMouseDownPassword} edge="end">
                    {showNPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                </InputAdornment>
                }
            />
        </FormControl>
        <PasswordStrengthIndicator password={Npassword}/>
        
        <Stack direction='row' spacing={2}>
        <LoadingButton onClick={handleReset} loading={state === 1} variant="contained" disabled={!confirm || state !==0}>Reset Password</LoadingButton>
        <Button onClick={()=>setShowPassword(false)} color='inherit' variant='outlined' disabled={state !==0}>Cancel</Button>  
        </Stack>
        
        <NotificationBar status={status} setStatus={setStatus}/>
    </div>
  );
}