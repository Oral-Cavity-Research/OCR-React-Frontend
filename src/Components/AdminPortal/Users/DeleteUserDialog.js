import React, {useState} from 'react';
import Button from '@mui/material/Button';
import { TextField, Typography, Stack, Box } from '@mui/material';
import axios from 'axios';
import LoadingButton from '@mui/lab/LoadingButton';
import { useNavigate } from 'react-router-dom';
import NotificationBar from '../../NotificationBar';
import { useSelector} from 'react-redux';
export default function DeleteUserDialog({user, setIsDelete}) {

    const [state, setState] = useState(0);
    const [status, setStatus] = useState({msg:"",severity:"success", open:false}) 
    const [confirmed, setConfirmed] = useState(false);
    const navigate = useNavigate();
    const userData = useSelector(state => state.data);

    
    const handleClose = () => {
        setIsDelete(false);
    };

    const handleConfirm = (e)=>{
        setConfirmed(e.target.value === user.username)
    }

    const showMsg = (msg, severity)=>{
        setStatus({msg, severity, open:true})
    }

    const handleDelete = ()=>{
      
        setState(1);

        axios.post(`${process.env.REACT_APP_BE_URL}/admin/delete/user/${user._id}`,
        {},
        { headers: {
            'Authorization': 'BEARER '+ JSON.parse(sessionStorage.getItem("info")).atoken,
            'email': JSON.parse(sessionStorage.getItem("info")).email,
        }}).then(res=>{
            navigate("/adminportal/reviewers");
        }).catch(err=>{
            if(err.response) showMsg(err.response.data.message, "error")
            else alert(err)
        }).finally(()=>{
            setState(0);
        })

    }


  return (
    <Box sx={{width:'100%'}}>
        <Typography variant='body2'>
        Enter username: <strong>'{user.username}'</strong> to confirm the action.
        </Typography>
        <br/>
        <Stack direction='column' spacing={4} maxWidth="75ch">
            <TextField label='confirm username' color='error' variant='standard' focused onChange={(e)=>handleConfirm(e)}/>
        </Stack>
        <Stack spacing={2} direction='row' justifyContent='flex-end' sx={{mt:3}}>
            <LoadingButton size="small" onClick={handleDelete} loading={state === 1} variant="contained" disabled={!confirmed || state !==0}>Delete User</LoadingButton>
            <Button onClick={handleClose} color='inherit' variant='outlined' disabled={state!==0}>Cancel</Button>
        </Stack>
        <NotificationBar status={status} setStatus={setStatus}/>
    </Box>
  );
}