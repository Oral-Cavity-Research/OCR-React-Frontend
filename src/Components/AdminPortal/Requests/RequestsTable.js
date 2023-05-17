import React, { useState, useEffect} from 'react';
import {Box, FormControl, IconButton, LinearProgress, OutlinedInput, Paper} from '@mui/material';
import {InputAdornment} from '@mui/material';
import {Avatar, Typography, Stack} from '@mui/material';
import axios from 'axios';
import NotificationBar from '../../NotificationBar';
import { stringAvatar} from '../../utils';
import { DataGrid } from '@mui/x-data-grid';
import { Search } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSelector} from 'react-redux';

const RequestsTable = () => {

    const [request, setRequests] = useState([]);
    const [status, setStatus] = useState({msg:"",severity:"success", open:false}) 
    const [loading, setLoading] = useState(true);
    const [filt, setFilt] = useState('');
    const selectorData = useSelector(state => state.data);
    const [userData, setUserData] = useState(selectorData);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFilt(e.target.value);
    };

    const columns = [
        {
          field: "_id",
          headerName: "Avatar",
          sortable: false,
          disableColumnMenu: true,
          renderCell: ({ row }) =>
            <Avatar {...stringAvatar(row.username)} variant='rounded'/>
        },
        {
          field: "username",
          headerName: "Name",
          flex: 1,
          disableColumnMenu: true,
        },
        {
          field: 'reg_no',
          headerName: 'SLMC Reg No',
          flex: 1,
          disableColumnMenu: true
        },
        {
          field: 'hospital',
          headerName: 'Hospital',
          flex: 1,
          disableColumnMenu: true
        },
    ];

    const showMsg = (msg, severity)=>{
        setStatus({msg, severity, open:true})
    }

    const handleClick = (params) => {
        navigate(`/adminportal/requests/${params.row._id}`)
      };

    useEffect(()=>{
        setLoading(true);
        setUserData(selectorData);
        axios.get(`${process.env.REACT_APP_BE_URL}/admin/requests`,
        { headers: {
            'Authorization': `Bearer ${userData.accessToken.token}`,
            'email': JSON.parse(sessionStorage.getItem("info")).email,
        }}
        ).then(res=>{
            setRequests(res.data);
            setLoading(false);
        }).catch(err=>{
            if(err.response) showMsg(err.response.data.message, "error")
            else alert(err)
            
        })
    },[])
  

    return (  
        <div className="inner_content">
        <div>

        <Box className='sticky'>    
        <Typography sx={{ fontWeight: 700}} variant="h5">Requests</Typography> 
        </Box>   
        <Paper sx={{p:2, my:3}}> 
        <Stack direction='row' justifyContent='flex-end' sx={{mb:2}} >
        <FormControl sx={{width: '30ch' }} variant="outlined">
          <OutlinedInput
            id="outlined-adornment-password"
            placeholder='Search by name'
            size='small'
            inputProps={{ maxLength: 20}}
            onChange={(e)=>handleChange(e)}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  edge="end"
                >
                  <Search/>
                </IconButton>
              </InputAdornment>
            }
          />
        </FormControl>
        </Stack>
        <DataGrid
                rows={request}
                columns={columns}
                autoHeight={true}
                disableSelectionOnClick
                onRowClick={handleClick}
                experimentalFeatures={{ newEditingApi: true }}
                getRowId={(row) =>  row._id}
                hideFooter={request.length < 100}
                loading={loading}   // you need to set your boolean loading
                filterModel={{
                    items: [{ columnField: 'username', operatorValue: 'contains', value: filt }]
                }}

                sx={{
                    cursor:'pointer',
                    "&.MuiDataGrid-root .MuiDataGrid-cell:focus-within": {outline: "none !important"},
                    ".MuiDataGrid-columnSeparator": {display: "none !important"},
                    '& .RaDatagrid-clickableRow': { cursor: 'default' },
                }}
                components={{
                    NoRowsOverlay: () => (
                      <Stack height="100%" alignItems="center" justifyContent="center">
                        No new requests
                      </Stack>
                    ),
                    NoResultsOverlay: () => (
                      <Stack height="100%" alignItems="center" justifyContent="center">
                        filter returns no result
                      </Stack>
                    ),
                    LoadingOverlay: () => (
                        <LinearProgress/>
                    )
                  }}
            />
             </Paper>
            <NotificationBar status={status} setStatus={setStatus}/>
            </div>
        </div>
    );
};;

export default RequestsTable;