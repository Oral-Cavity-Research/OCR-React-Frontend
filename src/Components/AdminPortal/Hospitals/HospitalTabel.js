import React, { useState, useEffect} from 'react';
import {Box, Button, FormControl, IconButton, InputAdornment, LinearProgress, OutlinedInput, Paper} from '@mui/material';
import {Typography, Stack} from '@mui/material';
import config from '../../../config.json'
import axios from 'axios';
import NotificationBar from '../../NotificationBar';
import { DataGrid } from '@mui/x-data-grid';
import { useSelector} from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Search } from '@mui/icons-material';

const HospitalTable = () => {

    const [data, setData] = useState([]);
    const [status, setStatus] = useState({msg:"",severity:"success", open:false}) 
    const [loading, setLoading] = useState(true);
    const selectorData = useSelector(state => state.data);
    const [userData, setUserData] = useState(selectorData);
    const [filt, setFilt] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFilt(e.target.value);
    };

    const handleClick = (params) => {
        navigate(`/adminportal/hospitals/${params.row._id}`);
    };

    const handleAddNew = () => {
        navigate(`/adminportal/hospitals/new`);
    };

    const columns = [
        {
          field: 'name',
          headerName: 'Hospitals',
          flex: 1,
          disableColumnMenu: true,
        },
        {
            field: 'city',
            headerName: 'City',
            flex: 1,
            disableColumnMenu: true,
        },
        {
            field: 'category',
            headerName: 'Category',
            flex: 1,
            disableColumnMenu: true,
        }
    ];

    const showMsg = (msg, severity)=>{
        setStatus({msg, severity, open:true})
    }

    useEffect(()=>{
        setLoading(true);
        setUserData(selectorData);
        axios.get(`${config['path']}/user/self/hospitals`,
        { headers: {
            'Authorization': `Bearer ${userData.accessToken.token}`,
            'email': JSON.parse(sessionStorage.getItem("info")).email,
        }}
        ).then(res=>{
            setData(res.data);
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
        <Typography sx={{ fontWeight: 700}} variant="h5">Hospitals</Typography>    

        <Button sx={{mt:2}} variant='contained' onClick={handleAddNew}>Add New</Button>
        </Box> 
        
        <Paper sx={{p:2, my:3}}> 
        <Stack direction='row' justifyContent='flex-end' sx={{mb:2}}>
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
                rows={data}
                columns={columns}
                pageSize={100}
                autoHeight={true}
                onRowClick={handleClick}
                disableSelectionOnClick
                rowsPerPageOptions={[100]}
                experimentalFeatures={{ newEditingApi: true }}
                getRowId={(row) =>  row._id}
                hideFooter={data.length < 100}
                loading={loading}   // you need to set your boolean loading

                filterModel={{
                    items: [{ columnField: 'username', operatorValue: 'contains', value: filt }]
                }}
                sx={{
                    cursor:'pointer',
                    "&.MuiDataGrid-root .MuiDataGrid-cell:focus-within": {outline: "none !important"},
                    ".MuiDataGrid-columnSeparator": {display: "none !important"},
                }}
                components={{
                    NoRowsOverlay: () => (
                      <Stack height="100%" alignItems="center" justifyContent="center">
                        No new datas
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

export default HospitalTable;