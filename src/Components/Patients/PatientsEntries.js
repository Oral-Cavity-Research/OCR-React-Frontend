import React, {useEffect, useState } from 'react';
import { Avatar, AvatarGroup, Box, LinearProgress, Menu, MenuItem, Stack, 
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography} from '@mui/material';
import {IconButton} from '@mui/material';
import {Circle, FilterList, Image, Message} from '@mui/icons-material';
import {useNavigate, useParams } from 'react-router-dom';
import NotificationBar from '../NotificationBar';
import axios from 'axios';
import { useSelector} from 'react-redux';
import dayjs from 'dayjs';
import { LoadingButton } from '@mui/lab';

const filtOptions = ["Created Date","Updated Date"]

const PatientEntries = () => {
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [filt, setFilt] = React.useState("Created Date");
    const open = Boolean(anchorEl);
    const [loading, setLoading] = useState(false);
    const [creatingNew, setCreatingNew] = useState(false);
    const [data, setData] = useState([]);
    const [status, setStatus] = useState({msg:"",severity:"success", open:false});
    const userData = useSelector(state => state.data);
    const [page, setPage] = useState(1);
    const [noMore, setNoMore] = useState(false);
    const {id} = useParams();
    const navigate = useNavigate();

    
    const handleOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleFilter = (name)=>{
        setPage(1);
        setFilt(name);
        handleClose();
        getData();
    }

    const handleClick = (id) => {
        navigate(`/manage/my/entries/${id}`)
    };

    const showMsg = (msg, severity)=>{
        setStatus({msg, severity, open:true})
    }

    useEffect(() => {
        getData();
    }, []);

    const loadMore = () => {
        setLoading(true);
        setNoMore(false);
        axios.get(`${process.env.REACT_APP_BE_URL}/user/entry/get/patient/${id}`,{
            params: { page: page + 1, filter: filt},
            headers: {
                'Authorization': `Bearer ${userData.accessToken.token}`,
                'email': userData.email,
            },
            withCredentials: true
        }).then(res=>{
            if(res.data?.length < 20) setNoMore(true);
            setData([...data, ...res.data]);
            setPage(page+1);
        }).catch(err=>{
            if(err.response) showMsg(err.response.data.message, "error")
            else alert(err)
        }).finally(()=>{
            setLoading(false);
        })
    };

    const getData = ()=>{
        setLoading(true);
        setNoMore(false);
        axios.get(`${process.env.REACT_APP_BE_URL}/user/entry/get/patient/${id}`,{
            params: { page: 1, filter: filt},
            headers: {
                'Authorization': `Bearer ${userData.accessToken.token}`,
                'email': userData.email,
            },
            withCredentials: true
        }).then(res=>{
            if(res.data?.length < 20) setNoMore(true);
            setData(res.data);
        }).catch(err=>{
            if(err.response) showMsg(err.response.data.message, "error")
            else alert(err)
        }).finally(()=>{
            setLoading(false);
        })
    } 
    
    const createNewEntry = () => {
        setCreatingNew(true);
        axios.post(`${process.env.REACT_APP_BE_URL}/user/entry/new/${id}`,{},
        {
            headers: {
                'Authorization': `Bearer ${userData.accessToken.token}`,
                'email': userData.email,
            },
            withCredentials: true
        }).then(res=>{
            navigate(`/manage/my/draft/${res.data._id}`) 
        }).catch(err=>{
            if(err.response) showMsg(err.response?.data?.message, "error")
            else alert(err)
        }).finally(()=>{
            setCreatingNew(false);
        })
    }

    return (                    
            <>
            <Stack direction='row' justifyContent='space-between' alignItems='center' mb={1}>
                <IconButton
                    id="fade-button"
                    aria-controls={open ? 'fade-menu' : undefined}
                    aria-haspopup="true"
                    aria-expanded={open ? 'true' : undefined}
                    onClick={handleOpen}
                    size='small'
                ><FilterList/></IconButton>
                <Typography variant='body2' color='GrayText'>{filt}</Typography>
                <Box flex={1}></Box>
                <LoadingButton loading={creatingNew} onClick={createNewEntry} variant='contained'>Create New</LoadingButton>
            </Stack>

                <Menu id="fade-menu" MenuListProps={{ 'aria-labelledby': 'fade-button'}} anchorEl={anchorEl} open={open} onClose={handleClose}>
                {filtOptions.map((item,index)=>{ return(<MenuItem key={index} onClick={()=>handleFilter(item)}>{item}</MenuItem>)})}
                </Menu>
                
                
                <TableContainer sx={{border: '1px solid lightgray', borderRadius: 1}}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell></TableCell>
                            <TableCell>Patient ID</TableCell>
                            <TableCell>Patient Name</TableCell>
                            <TableCell>Images/Reviews</TableCell>
                            <TableCell sx={{ display: { xs: 'none', md: 'table-cell' }}}>Reviewers</TableCell>
                            {filt === "Updated Date" ?<TableCell>Updated Date</TableCell>
                            :<TableCell>Created Date</TableCell>}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                    {
                        loading && 
                        <TableRow >
                            <TableCell sx={{p:0}} colSpan={6}><LinearProgress/></TableCell>
                        </TableRow>
                    }
                    {data.map((item,index)=>{ 
                        return(
                        <TableRow key={index} sx={{cursor:'pointer', '&:hover':{background: '#f8f8f8'}}} onClick={()=>handleClick(item._id)}>
                            <TableCell>{item.updated? <Circle fontSize='small' className="text-danger-glow blink" color='success'/>:""}</TableCell>
                            <TableCell>{item.patient?.patient_id}</TableCell>
                            <TableCell>{item.patient?.patient_name}</TableCell>
                            <TableCell>
                                <Stack direction='row' spacing={1} alignItems='center'>
                                    <Image color={item.images?.length > 0? "primary":"disabled"} fontSize='small'/>
                                    <Typography variant='body2'>{item.images?.length}</Typography>
                                    <Message color={item.reviews?.length > 0? "primary":"disabled"} fontSize='small'/>
                                    <Typography variant='body2'>{item.reviews?.length ? item.reviews.length: 0}</Typography>
                                </Stack>
                            </TableCell>
                            <TableCell sx={{ display: { xs: 'none', md: 'table-cell' }}}>
                            <AvatarGroup max={3}  sx={{width:'fit-content'}}>
                                {
                                    item.reviewers?.map((reviewer, index)=>{
                                        return(
                                            <Tooltip arrow placement='bottom-end' key={index} title={reviewer.username}><Avatar sx={{width: '30px', height:'30px'}}  alt={reviewer.username} src="/"/></Tooltip>
                                        )
                                    })
                                }
                            </AvatarGroup>
                            </TableCell>
                            {filt === "Updated Date" ? <TableCell>{dayjs(item.updateddAt).format('DD/MM/YYYY')}</TableCell>
                            : <TableCell>{dayjs(item.createdAt).format('DD/MM/YYYY')}</TableCell>}
                        </TableRow>
                    )})}
                    </TableBody>
                </Table>
                </TableContainer>
                <Stack direction='row' justifyContent='center'>
                    {
                        data.length > 0 ?
                        <LoadingButton disabled={noMore} loading={loading} sx={{mt:2}} onClick={loadMore}>Load More</LoadingButton>
                        :
                        <Typography sx={{m:3}} variant='body2' color='GrayText'>{loading? "":"No Entries"}</Typography>
                    }
                </Stack>
               
                <NotificationBar status={status} setStatus={setStatus}/>  
            </>
    );
};

export default PatientEntries;