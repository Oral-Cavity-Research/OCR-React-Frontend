import React, { useState, useEffect} from 'react';
import {Box, FormControl, IconButton, LinearProgress, Menu, MenuItem, OutlinedInput, Paper} from '@mui/material';
import { InputAdornment} from '@mui/material';
import {Avatar, Typography, Stack} from '@mui/material';
import axios from 'axios';
import NotificationBar from '../../NotificationBar';
import { stringAvatar} from '../../utils';
import { DataGrid } from '@mui/x-data-grid';
import { FilterList, Search } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSelector} from 'react-redux';

const UsersTable = () => {

    const [users, setUsers] = useState([]);
    const [status, setStatus] = useState({msg:"",severity:"success", open:false}) 
    const [loading, setLoading] = useState(true);
    const [filt, setFilt] = useState('');
    const [filtOptions, setFiltOptions] = useState(["All"]);
    const [role, setRole] = useState("All");
    const userData = useSelector(state => state.data);
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);
    const navigate = useNavigate();

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleFilter = (name)=>{
        setRole(name);
        handleClose();
    }

    const handleChange = (e) => {
        setFilt(e.target.value);
    };

    const showMsg = (msg, severity)=>{
        setStatus({msg, severity, open:true})
    }

    const handleRowClick = (params) => {
        navigate(`/adminportal/users/${params.row._id}`)
    };

    const columns = [
        {
            field: "_id",
            headerName: "Avatar",
            sortable: false,
            disableColumnMenu: true,
            renderCell: ({ row }) =>
                <Avatar {...stringAvatar(row.username)} variant='rounded' />
        },
        {
          field: 'username',
          headerName: 'Name',
          flex: 1,
          disableColumnMenu: true,
        },
        {
          field: 'reg_no',
          headerName: 'SLMC Reg No',
          flex: 1,
          disableColumnMenu: true,
        },
        {
          field: 'hospital',
          headerName: 'Hospital',
          flex: 1,
          disableColumnMenu: true,
        }
    ];

    useEffect(()=>{

        setLoading(true);

        axios.get(`${process.env.REACT_APP_BE_URL}/admin/users/role/${role}`,
        { headers: {
            'Authorization': `Bearer ${userData.accessToken.token}`,
            'email': JSON.parse(sessionStorage.getItem("info")).email,
        }}
        ).then(res=>{
            setUsers(res.data)
            setLoading(false);
        }).catch(err=>{
            if(err.response) showMsg(err.response.data.message, "error")
            else alert(err)
            
        })
    },[role])

    useEffect(()=>{

        axios.get(`${process.env.REACT_APP_BE_URL}/admin/roles`,
        { headers: {
            'Authorization': `Bearer ${userData.accessToken.token}`,
            'email': JSON.parse(sessionStorage.getItem("info")).email,
        }}
        ).then(res=>{
            var options = ["All"]
            res.data.forEach(ele => {
                options.push(ele.role)
            });
            setFiltOptions(options);
        }).catch(err=>{
            if(err.response) showMsg(err.response.data.message, "error")
            else alert(err)
            
        })
    },[])
  

    return (
        <div className="inner_content">
        <div>  
        <Box className='sticky'>
        <Typography sx={{ fontWeight: 700}} variant="h5">Clinicians</Typography> 
        </Box>
        <Paper sx={{p:2, my:3}}>    
        <Stack direction='row' justifyContent='space-between' sx={{mb:2}}>
            <Stack direction='row' alignItems='center' spacing={1}>
            <IconButton
                    id="fade-button"
                    aria-controls={open ? 'fade-menu' : undefined}
                    aria-haspopup="true"
                    aria-expanded={open ? 'true' : undefined}
                    onClick={handleClick}
            ><FilterList/></IconButton>
            <Typography color='GrayText' variant='body2' >{role}</Typography>
            </Stack>
            
             <Menu id="fade-menu" MenuListProps={{ 'aria-labelledby': 'fade-button'}} anchorEl={anchorEl} open={open} onClose={handleClose}>
                {filtOptions.map((item,index)=>{ return(<MenuItem key={index} onClick={()=>handleFilter(item)}>{item}</MenuItem>)})}
            </Menu>

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
                rows={users}
                columns={columns}
                onRowClick={handleRowClick}
                hideFooter={users.length < 100}
                autoHeight={true}
                disableSelectionOnClick
                experimentalFeatures={{ newEditingApi: true }}
                getRowId={(row) =>  row._id}

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
                        No {role==="All"?"Clinicians":role}
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

export default UsersTable;