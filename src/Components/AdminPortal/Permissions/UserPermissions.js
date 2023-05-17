import React, {useState, useEffect} from 'react';
import {Box, Button, IconButton, 
    Paper, Stack, Typography, FormControl, InputAdornment, LinearProgress, OutlinedInput } from '@mui/material';
import { Search } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSelector} from 'react-redux';
import { DataGrid } from '@mui/x-data-grid';
import axios from 'axios';
import NotificationBar from '../../NotificationBar';

const UserPermissions = () => {
    const [roles, setRoles] = useState([]);
    const [status, setStatus] = useState({msg:"",severity:"success", open:false});
    const [loading, setLoading] = useState(true);
    const [ permissions, setPermissions] = useState({});
    const userData = useSelector(state => state.data);
    const [filt, setFilt] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFilt(e.target.value);
    };

    const handleClick = (params) => {
        navigate(`/adminportal/permissions/${params.row._id}`);
    };

    const handleAddNew = ()=>{
        navigate(`/adminportal/permissions/new`)
    }

    const showMsg = (msg, severity)=>{
        setStatus({msg, severity, open:true})
    }

    const columns = [
        {
          field: 'role',
          headerName: 'Role',
          flex: 1,
          sortable:true,
          disableColumnMenu: true,
        }
    ];


    useEffect(()=>{

        axios.get(`${process.env.REACT_APP_BE_URL}/admin/roles`,
        { headers: {
            'Authorization': `Bearer ${userData.accessToken.token}`,
            'email': JSON.parse(sessionStorage.getItem("info")).email,
        }}
        ).then(res=>{
            setRoles(res.data);
            setLoading(false);
        }).catch(err=>{
            if(err.response) showMsg(err.response.data.message, "error")
            else alert(err)  
        })
    },[])

    useEffect(()=>{
        axios.get(`${process.env.REACT_APP_BE_URL}/admin/option/permissions`,
        { headers: {
            'Authorization':  `Bearer ${userData.accessToken.token}`,
            'email': JSON.parse(sessionStorage.getItem("info")).email,
        }}
        ).then((res)=>{
            var parsed_json = res.data.options;
            var json_object = {};
            for (var i = 0; i < parsed_json.length; i++) {
            json_object[parsed_json[i].value] = parsed_json[i].label;
            }
            setPermissions(json_object);
            
        }).catch(err=>{
            if(err.response) showMsg(err.response.data.message, "error")
            else alert(err)
        })
    },[])

    return (
        <div className="inner_content">
        <div>
            <Box className="sticky">    
            <Typography sx={{ fontWeight: 700}} variant="h5">User Permissions</Typography>    
            </Box> 
            <Button variant='contained' sx={{mt:2}} onClick={handleAddNew}>Add New</Button>
           
            <Paper sx={{p:2, my:3}}> 
            <Stack direction='row' justifyContent='flex-end' sx={{mb:2}}>
            <FormControl sx={{width: '30ch' }} variant="outlined">
            <OutlinedInput
                placeholder='Search by name'
                size='small'
                inputProps={{ maxLength: 20}}
                onChange={(e)=>handleChange(e)}
                endAdornment={
                <InputAdornment position="end">
                    <IconButton
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
                    rows={roles}
                    columns={columns}
                    pageSize={100}
                    autoHeight={true}
                    onRowClick={handleClick}
                    disableSelectionOnClick
                    rowsPerPageOptions={[100]}
                    experimentalFeatures={{ newEditingApi: true }}
                    getRowId={(row) =>  row._id}
                    hideFooter={roles.length < 100}
                    loading={loading}   // you need to set your boolean loading

                    filterModel={{
                        items: [{ columnField: 'role', operatorValue: 'contains', value: filt }]
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
};

export default UserPermissions;