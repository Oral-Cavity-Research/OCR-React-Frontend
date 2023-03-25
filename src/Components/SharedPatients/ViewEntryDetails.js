import React, { useEffect, useState } from 'react';
import {ArrowBack, ArrowLeft, AssignmentInd, PictureAsPdf} from '@mui/icons-material';
import { Avatar, AvatarGroup, Paper, Tooltip, Typography , Stack, Box, Divider, Grid, 
    Button, Table, TableRow, TableCell, TableBody, Skeleton, ListItem, ListItemText, List} from '@mui/material';
import { stringAvatar } from '../utils';
import { useSelector} from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import dayjs from 'dayjs';
import config from '../../config.json';
import NotificationBar from '../NotificationBar';
import duration from 'dayjs/plugin/duration';
dayjs.extend(duration);

function timeDuration(start, end){
    try {
        const duration = dayjs.duration(new Date(end) - new Date(start), 'minutes');
        return duration.minutes() + " minutes";
    } catch (error) {
        return ""
    }
}

function realReportName(filename){
    try {
        return filename.split('_').slice(3).join('_');
    } catch (error) {
        return "Test Report";
    }
}

const details = {
    "_id":"id",
    "patient": {
        "name":"patient name",
        "patient_id":"patient_id",
    },
    "assignees": [{"name":"P Silva", "availability":false},{"name":"M Perera", "availability":true}],
    "images":["1","2","3"],
    "Complaint":"",
    "startTime":"",
    "endTime":"",
    "findings":"findings findings findings new findings are shown here findings findings findings new findings are shown here findings findings findings new findings are shown here findings findings findings new findings are shown here",
    "currentHabits":"",
    "reports":"",
    "reviews": ["1","2","3","4","5"],
    "createdAt": "2023-05-06 5.00 am",
    "updatedAt": "2023-05-10 10.14 pm"

}

const SharedEntryDetails = () => {
    
    const [status, setStatus] = useState({msg:"",severity:"success", open:false});
    const selectorData = useSelector(state => state.data);
    const [userData, setUserData] = useState(selectorData);
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const { id } = useParams();

    const loadData = ()=>{
        axios.get(`${config['path']}/user/entry/get/${id}`,{
            headers: {
                'Authorization': `Bearer ${userData.accessToken.token}`,
                'email': JSON.parse(sessionStorage.getItem("info")).email,
            },
            withCredentials: true
        }).then(res=>{
            console.log(res.data)
            setData(res.data);
            setLoading(false);
        }).catch(err=>{
            if(err.response) showMsg(err.response.data?.message, "error")
            else alert(err.message)
        })
    }

    useEffect(()=>{
        setLoading(true);
        loadData();
    },[])

    const showMsg = (msg, severity)=>{
        setStatus({msg, severity, open:true})
    }

    return (
            <div className="inner_content">
                <div>  
                    <div className="sticky">
                    <Typography sx={{ fontWeight: 700}} variant="h5">Tele Consultation Entry</Typography>                  
                    <Button component={Link} to='/manage/shared/entries' size='small' startIcon={<ArrowBack/>} sx={{p:0}}>Go Back To Entries</Button>
                    </div>
                    {loading && !data?
                    <Paper sx={{p:2, my:3}}>
                    <Stack direction='row' spacing={2} alignItems='center' sx={{my:3}}>
                        <Skeleton variant="rounded" width={60} height={60} />
                        <Stack direction='column'>
                            <Skeleton variant="text" width={210} sx={{ fontSize: '2rem' }} />
                            <Skeleton variant="text" width={210} />
                        </Stack>
                    </Stack>
                    <Stack spacing={2}>
                        <Skeleton variant="rounded" height={40} width={600}/>
                        <Skeleton variant="rounded" height={40} width={600}/>
                    </Stack>
                    </Paper>
                    :
                    <>
                    <Paper sx={{p:3, my:3}}>
                    <Stack direction='row' spacing={2} alignItems='center'>
                        <AssignmentInd sx={{color:'orange', width:'60px',height:'60px'}}/>
                        <Stack direction='column'>
                            <Tooltip title='Go to patients profile' arrow placement="right"><Typography component={Link} to={`/manage/patients/${data.patient._id}`} variant='h5' color='Highlight' sx={{cursor:'pointer'}}>
                                {data.patient?.patient_name}
                            </Typography></Tooltip>
                            <Typography color='GrayText'>{data.patient?.patient_id}</Typography>
                        </Stack>
                    </Stack>
                    <Divider sx={{my:1}}/>
                    <Stack direction='column' spacing={1}>
                        <Typography variant='body2'>Start Time: {dayjs(data.start_time).format("DD/MM/YYYY HH:MM A")}</Typography>
                        <Typography variant='body2'>Duration: {timeDuration(data.start_time, data.end_time)}</Typography>
                    </Stack>
                    <Divider sx={{my:1}}/>
                    <Typography variant='body2'>Reviewers:</Typography>
                    <AvatarGroup sx={{width:'fit-content'}}>
                        {
                            data.reviewers?.map((reviewer, index)=>{
                                return(<Tooltip title={reviewer.username} placement="bottom-start" arrow  key={index}><Avatar {...stringAvatar(reviewer.username)}/></Tooltip>)
                            })
                        }                        
                    </AvatarGroup>
                
                    </Paper>
                    <Paper sx={{p:2, my:3}}>
                    <Table  sx={{border: '1px solid lightgray'}}>
                        <TableBody>
                            <TableRow>
                                <TableCell>Complaint:</TableCell>
                                <TableCell>{data.complaint}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Findings:</TableCell>
                                <TableCell>{data.findings}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Current Habits:</TableCell>
                                <TableCell>
                                    <List>
                                    { data.current_habits?.map((item,index)=>{
                                        return(
                                        <ListItem key={index} disablePadding>
                                        <ListItemText
                                            primary={<Typography variant='body2' >{item.habit}</Typography>}
                                            secondary={item.frequency} 
                                        />
                                        </ListItem>
                                        )
                                    })}
                                    </List>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table> 
                    </Paper>
                    <Paper sx={{p:2, my:3}}>
                    {
                        data.images?.length > 0 ? 
                        <Typography sx={{mb:2}} variant='body2'>Images:</Typography>
                        :
                        <Typography sx={{mb:2}} color='GrayText' variant='body2'>No Images were Added</Typography>
                    }
                    <Grid container spacing={2}>
                    {data.images?.map((item, index) => (
                        <Grid item key={index} xs={4} md={3} lg={2}>
                            <div className='imageDiv'>
                                <div className='grid_image'>
                                    <img src={`${config["image_path"]}/${item.image_name}`} alt="Failed to Load"/>
                                </div>
                                <Stack direction='column' justifyContent='space-between' alignItems='start' px={1}>
                                <Box>
                                    <Typography fontSize='small' color='GrayText'>{item.location} | {item.clinical_diagnosis}</Typography>
                                </Box>
                                </Stack>
                            </div>
                        </Grid>
                    ))}
                    </Grid>
                    </Paper>
                    <Paper sx={{p:2, my:3}}>
                    {
                        data.reports?.length > 0 ?
                        <Typography sx={{mb:2}} variant='body2'>Test Reports:</Typography>
                        :
                        <Typography sx={{mb:2}} color='GrayText' variant='body2'>No Test Reports were Added</Typography>
                    }
                    
                    {data.reports?.map((item, index) => {
                        return(
                        <Stack direction='row' sx={{my:2}} alignItems='center' spacing={2} key={index}>
                            <PictureAsPdf color='error'/>
                            <Typography sx={{ "&:hover" :{color:'var(--primary-color)'} }} variant='body2'><a href={`${config["report_path"]}/`+item.report_name} target="_blank">{realReportName(item.report_name)}</a></Typography>
                        </Stack>
                        
                    )})}
                   
                    </Paper>
                    <Paper sx={{p:2, my:3}}>
                    {
                        data.reviews?.length > 0 ?
                        <Typography sx={{mb:2}} variant='body2'>Reviews:</Typography>
                        :
                        <Typography sx={{mb:2}} color='GrayText' variant='body2'>No Reviews</Typography>
                    }
                    <Stack direction='column' spacing={1}>
                    {
                        details.reviews?.map((item,index)=>{
                            return(
                                <Stack direction='row' key={index} sx={{background:'white', p:1}}>
                                    <Avatar {...stringAvatar("name")}/>
                                    <ArrowLeft/>
                                    <Box>
                                        <Typography variant='body2'><strong>Reviewers name</strong></Typography>
                                        <Typography variant='body2'>provisional_diagnosis:</Typography>
                                        <Typography variant='body2'>management_suggestions:</Typography>
                                        <Typography variant='body2'>management_suggestions:</Typography>
                                        <Typography variant='body2'>review_comment:</Typography>
                                        <Typography variant='body2'>other_comments:</Typography>
                                    </Box>
                                </Stack>
                            )
                        })
                    }
                    </Stack>
                    </Paper>
                    </>
                    }

                    <NotificationBar status={status} setStatus={setStatus}/> 
                </div>
                </div>
        
    );
};

export default SharedEntryDetails;