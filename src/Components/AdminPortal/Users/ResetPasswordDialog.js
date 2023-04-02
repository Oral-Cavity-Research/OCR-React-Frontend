import React, {useState} from 'react';
import {Box, Button, Stack, } from '@mui/material';
import { FormControl, InputLabel, InputAdornment, IconButton, OutlinedInput, Typography } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { PasswordStrengthIndicator, passwordStrength } from '../../utils';
import LoadingButton from '@mui/lab/LoadingButton';
import NotificationBar from '../../NotificationBar';
import config from '../../../config.json';
import axios from 'axios';
import { useSelector} from 'react-redux';

export default function ResetPasswordDialog({user, setIsReset}) {
    const [showPassword, setShowPassword] = useState(false);
    const [confirm, setConfirm] = useState(false);
    const [password, setPassword] = useState("");
    const [state, setState] = useState(0);
    const [status, setStatus] = useState({msg:"",severity:"success", open:false});
    const userData = useSelector(state => state.data);
   
    const handlePasswordChange = (e)=>{
        const ok = passwordStrength(e.target.value) > 30;
        setPassword(e.target.value);
        setConfirm(ok);
    }

    const handleClose = () => {
        setIsReset(false);
    };

    const handleClickShowPassword = () => setShowPassword((show) => !show);

    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };

    const showMsg = (msg, severity)=>{
        setStatus({msg, severity, open:true})
    }

    const handleReset = ()=>{
      
        setState(1);

        axios.post(`${config['path']}/admin/reset/user/${user._id}`,
        {
            password: password
        },
        { headers: {
            'Authorization': 'BEARER '+ JSON.parse(sessionStorage.getItem("info")).atoken,
            'email': JSON.parse(sessionStorage.getItem("info")).email,
        }}
        ).then(res=>{
            showMsg("Password is updated successfully", "success");
            handleClose();
        }).catch(err=>{
            if(err.response) showMsg(err.response.data.message, "error")
            else alert(err)
        }).finally(()=>{
            setState(0);
        })

    }

  return (
    <Box sx={{width:'100%'}}>
        <FormControl margin="normal" fullWidth  variant="outlined">
            <InputLabel required size='small' htmlFor="password">Password</InputLabel>
            <OutlinedInput required size='small' inputProps={{ maxLength: 30 }} id="password" type={showPassword ? 'text' : 'password'} label="Password" name="password"
                onChange={(e)=>handlePasswordChange(e)}
                endAdornment={
                <InputAdornment position="end">
                    <IconButton onClick={handleClickShowPassword} onMouseDown={handleMouseDownPassword} edge="end">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                </InputAdornment>
                }
            />
        </FormControl>
        <PasswordStrengthIndicator password={password}/>
        <Stack direction='row' justifyContent='flex-end' spacing={2}>
            <LoadingButton size="small" onClick={handleReset} loading={state === 1} variant="contained" disabled={!confirm || state !==0}>Reset Password</LoadingButton>
            <Button onClick={handleClose} color='inherit' variant='outlined' disabled={state !==0}>Cancel</Button>
        </Stack>
        <NotificationBar status={status} setStatus={setStatus}/>
    </Box>
  );
}