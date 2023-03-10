import React, {useState} from 'react';
import Button from '@mui/material/Button';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import { DialogContent,DialogActions, TextField, Typography, Stack } from '@mui/material';
import config from '../../../config.json';
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

        axios.post(`${config['path']}/admin/delete/user/${user._id}`,
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
    <div style={{background:'#fbfbfb'}}>
        
        <Typography color='red'>WARNING: </Typography>
        <Typography>
        This action is irreversible and will permanently delete the user. Please proceed with caution.
        Enter username: <strong>'{user.username}'</strong> to confirm the action.
        </Typography>
        <br/>
        <Stack direction='column' spacing={4} maxWidth="75ch">
            <TextField label='confirm username' color='error' variant='standard' focused onChange={(e)=>handleConfirm(e)}/>
        </Stack>
        <Stack spacing={2} direction='row' justifyContent='flex-end'>
            <LoadingButton size="small" onClick={handleDelete} loading={state === 1} variant="contained" disabled={!confirmed || state !==0}>Delete User</LoadingButton>
            <Button onClick={handleClose} color='inherit' variant='outlined' disabled={state!==0}>Cancel</Button>
        </Stack>
        <NotificationBar status={status} setStatus={setStatus}/>
    </div>
  );
}