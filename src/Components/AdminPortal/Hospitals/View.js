import React, { useState } from 'react';
import { Box, Button, CircularProgress, Stack, TextField, Table, TableBody, TableRow, TableCell} from '@mui/material';
import {Delete, Edit} from '@mui/icons-material';
import { MuiTelInput } from 'mui-tel-input';
import axios from 'axios';
import LoadingButton from '@mui/lab/LoadingButton';
import NotificationBar from '../../NotificationBar';
import DeleteHospitalDialog from './DeleteHospitalDialog';
import { useParams } from 'react-router-dom';

const EditableText = ({disabled,defaultValue,name}) => (
    <TextField disabled={disabled} defaultValue={defaultValue} name={name} variant='standard' fullWidth
    sx={{
        "& .MuiInputBase-input.Mui-disabled": {
        WebkitTextFillColor: "#000000"}, 
        "& .MuiInput-input": {
            paddingY: 2,
            fontFamily: 'Segoe UI',
            fontSize: 15
        }
    }}
    InputProps={{
        disableUnderline: disabled
    }}
    />
)

const View = ({data}) => {
    const [ editEnable, setEditEnable] = useState(true);
    const [number, setNumber] = useState(data.contact_no);
    const [status, setStatus] = useState({msg:"",severity:"success", open:false}) ;
    const [loading, setLoading] = useState(false);
    const [isDelete, setIsDelete] = useState(false);
    const { id } = useParams();

    const handleChange = (newValue) => {
        setNumber(newValue)
    }

    const onCancel = ()=>{
        setEditEnable(!editEnable)
    }

    const showMsg = (msg, severity)=>{
        setStatus({msg, severity, open:true})
    }


    const handleSignInSubmit = (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const tobesend = {
            name: data.get('name'),
            city: data.get('city'),
            category: data.get('category'),
            address: data.get('address'),
            contact_no: data.get('contactNo')
        }

        setLoading(true);
        axios.post(`${process.env.REACT_APP_BE_URL}/admin/hospitals/update/${id}`, tobesend,
        { headers: {
            'Authorization': 'BEARER '+ JSON.parse(sessionStorage.getItem("info")).atoken,
            'email': JSON.parse(sessionStorage.getItem("info")).email,
        }}
        ).then(res=>{
            setLoading(false);
            setEditEnable(!editEnable);
            showMsg("Sucessfully Updated the entry", "success")
        }).catch(err=>{
            if(err.response) showMsg(err.response.data.message, "error")
            else alert(err)
        }).finally(
            setLoading(false)
        )
        
    }

    return (
            <Box>
                <Stack direction='row' spacing={2} py={1} justifyContent='flex-end'>
                    <Button variant='contained' endIcon={<Edit/>} onClick={() => setEditEnable(!editEnable)}
                    style={{ display: !(editEnable && !isDelete) ? 'none' : undefined }}>Edit</Button>
                    <Button variant='contained' endIcon={<Delete/>}
                    color="error"
                    onClick={() => setIsDelete(!isDelete)}
                    style={{ display: !(editEnable && !isDelete) ? 'none' : undefined }}>Delete</Button>
                    <Button style={{ display: editEnable ? 'none' : undefined }} variant='outlined' onClick={onCancel}>Cancel</Button>
                </Stack>
                
                {
                    isDelete &&
                    <Box sx={{border: '1px solid red', borderRadius:'5px', my:5}}>
                    <Stack sx={{p:3}} justifyContent='center' direction='row'>
                        <DeleteHospitalDialog hospital={data} setIsDelete={setIsDelete}/>
                    </Stack>
                    </Box>
                    
                }
            <Box component="form" noValidate onSubmit={handleSignInSubmit} sx={{ mt: 1 }}>
            <Table  sx={{border: '1px solid lightgray'}}>
                <TableBody>
                    <TableRow>
                        <TableCell>Name:</TableCell>
                        <TableCell sx={{py:0}}>
                            <EditableText disabled={editEnable} defaultValue={data.name} name={'name'}/>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Category:</TableCell>
                        <TableCell sx={{py:0}}>
                        <EditableText disabled={editEnable} defaultValue={data.category} name={'category'}/>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>City:</TableCell>
                        <TableCell sx={{py:0}}>
                        <EditableText disabled={editEnable} defaultValue={data.city} name={'city'}/>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Address:</TableCell>
                        <TableCell sx={{py:0}}>
                        <EditableText disabled={editEnable} defaultValue={data.address} name={'address'}/>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Contact No:</TableCell>
                        <TableCell sx={{py:0}}>
                        <MuiTelInput disabled={editEnable} value={number} onChange={handleChange} size='small' name='contactNo' placeholder='Phone Number' variant='standard' fullWidth
                        sx={{
                            "& .MuiInputBase-input.Mui-disabled": {
                            WebkitTextFillColor: "#000000",
                        },"& .MuiInput-input": {
                            paddingY: 2,
                            fontFamily: 'Segoe UI',
                            fontSize: 15
                        }
                        }}
                        InputProps={{
                            disableUnderline: editEnable
                        }}
                        /> 
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Created At</TableCell>
                        <TableCell sx={{py:0}}>
                        <EditableText disabled={true} defaultValue={(data.createdAt?.split("T"))[0]} name={'Created At'}/>
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
            
            { !editEnable && <LoadingButton sx={{my:2}}
            loadingIndicator={<CircularProgress color="inherit" size={16}/>}
            loading={loading} variant='contained' type="submit">Save</LoadingButton>}
           
            </Box>
            
            <NotificationBar status={status} setStatus={setStatus}/>
            </Box>
            
    );
};

export default View;