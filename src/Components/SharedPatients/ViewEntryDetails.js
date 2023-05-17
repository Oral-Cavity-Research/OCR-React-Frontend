import React, { useEffect, useState } from 'react';
import {ArrowBack, ArrowLeft, AssignmentInd, Edit, PictureAsPdf} from '@mui/icons-material';
import { Avatar, AvatarGroup, Paper, Tooltip, Typography , Stack, Box, Divider, Grid, Slide, Dialog, 
    IconButton, Button, Table, TableRow, TableBody, Skeleton, ListItem, ListItemText, List, Chip, TableContainer} from '@mui/material';
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import { stringAvatar } from '../utils';
import { useSelector} from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Canvas from '../Annotation/Canvas';
import axios from 'axios';
import dayjs from 'dayjs';
import NotificationBar from '../NotificationBar';
import duration from 'dayjs/plugin/duration';
dayjs.extend(duration);

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

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

const ViewEntryDetails = () => {
    
    const [status, setStatus] = useState({msg:"",severity:"success", open:false});
    const selectorData = useSelector(state => state.data);
    const [userData, setUserData] = useState(selectorData);
    const [loading, setLoading] = useState(true);
    const [loadingReviews, setLoadingReviews] = useState(true);
    const [openAnnotation, setOpenAnnotation] = useState(false)
    const [imageIndex, setImageIndex] = useState({});
    const [reviews, setReviews] = useState([]);
    const [data, setData] = useState(null);
    const { id } = useParams();
    const navigate = useNavigate();

    const handleDoubleClick = (index)=>{
        setImageIndex(index);
        setOpenAnnotation(true);
    }

    const handleClose = () => {
        setOpenAnnotation(false);
    };

    const getReviews = ()=>{
        setLoadingReviews(true);
        axios.get(`${process.env.REACT_APP_BE_URL}/user/entry/reviews/${id}`,{
            headers: {
                'Authorization': `Bearer ${userData.accessToken.token}`,
                'email': JSON.parse(sessionStorage.getItem("info")).email,
            },
            withCredentials: true
        }).then(res=>{
            setReviews(res.data);
            setLoadingReviews(false);
        }).catch(err=>{
            if(err.response) showMsg(err.response.data?.message, "error")
            else alert(err.message)
        })
    }

    const loadData = ()=>{
        axios.get(`${process.env.REACT_APP_BE_URL}/user/entry/shared/${id}`,{
            headers: {
                'Authorization': `Bearer ${userData.accessToken.token}`,
                'email': JSON.parse(sessionStorage.getItem("info")).email,
            },
            withCredentials: true
        }).then(res=>{
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
        getReviews();
    },[])

    const showMsg = (msg, severity)=>{
        setStatus({msg, severity, open:true})
    }

    return (
            <div className="inner_content">
                <div>  
                    <div className="sticky">
                    <Typography sx={{ fontWeight: 700}} variant="h5">Previous Records</Typography>                  
                    <Button onClick={() => navigate(-1)} size='small' startIcon={<ArrowBack/>} sx={{p:0}}>Go Back</Button>
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
                    <Stack direction='row' spacing={2} alignItems='flex-start'>
                        <AssignmentInd sx={{color:'orange', width:'60px',height:'60px'}}/>
                        <Stack direction='column'>
                            <Tooltip title='Go to patients profile' arrow placement="right"><Typography component={Link} to={`/manage/shared/patients/${data.patient._id}`} variant='h5' color='Highlight' sx={{cursor:'pointer'}}>
                                {data.patient?.patient_name}
                            </Typography></Tooltip>
                            <Typography color='GrayText'>{data.patient?.patient_id}</Typography>
                        </Stack>
                        <Box flex={1}></Box>
                        <Chip label="View Only" color='primary' size='small'/>
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
                                    <img src={`${process.env.REACT_APP_IMAGE_PATH}/${item.image_name}`} alt="Failed to Load"/>
                                    <Stack direction='row' sx={{position:'absolute', bottom:10, right:0}}>
                                        <IconButton onClick={()=>handleDoubleClick(index)} size='small' sx={{ color:'transparent'}} className='iconBackground'><Edit fontSize='small'/></IconButton>
                                    </Stack>
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
                        <Typography color='GrayText' variant='body2'>No Test Reports were Added</Typography>
                    }
                    
                    {data.reports?.map((item, index) => {
                        return(
                        <Stack direction='row' sx={{my:2}} alignItems='center' spacing={2} key={index}>
                            <PictureAsPdf color='error'/>
                            <Typography sx={{ "&:hover" :{color:'var(--primary-color)'} }} variant='body2'><a href={`${process.env.REACT_APP_REPORT_PATH}/`+item.report_name} target="_blank">{realReportName(item.report_name)}</a></Typography>
                        </Stack>
                        
                    )})}
                   
                    </Paper>
                    <Paper sx={{p:2, my:3}}>
                    {
                        loadingReviews?
                        <Typography variant='body2'>Loading Reviews...</Typography>
                        :
                        reviews.length > 0 ?
                        <Typography sx={{mb:2}} variant='body2'>Reviews:</Typography>
                        :
                        <Typography color='GrayText' variant='body2'>No Reviews Yet</Typography>
                    }
                    <Stack direction='column' spacing={1}>
                    {
                        reviews.map((item,index)=>{
                            return(
                                <Stack direction='row' key={index} sx={{background:'white', p:1}}>
                                    <Avatar {...stringAvatar(item.reviewer_id?.username)}/>
                                    <ArrowLeft/>
                                    <Box>
                                        <Typography variant='body2'><strong>{item.reviewer_id?.username}</strong> | {item.reviewer_id?.reg_no}</Typography>
                                        <TableContainer>
                                        <Table
                                        sx={{
                                            [`& .${tableCellClasses.root}`]: {
                                              borderBottom: "none"
                                            }
                                          }}
                                        >
                                            <TableBody>
                                                {item.provisional_diagnosis !== "" && <TableRow>
                                                    <TableCell sx={{py:0}}>Provisional Diagnosis</TableCell>
                                                    <TableCell sx={{py:0}}>{item.provisional_diagnosis}</TableCell>
                                                </TableRow>}
                                                {item.management_suggestions !== "" && <TableRow>
                                                    <TableCell sx={{py:0}}>Management Suggestions</TableCell>
                                                    <TableCell sx={{py:0}}>{item.management_suggestions}</TableCell>
                                                </TableRow>}
                                                {item.referral_suggestions !== "" && <TableRow>
                                                    <TableCell sx={{py:0}}>Referral Suggestions</TableCell>
                                                    <TableCell sx={{py:0}}>{item.referral_suggestions}</TableCell>
                                                </TableRow>}
                                                {item.other_comments !== "" && <TableRow>
                                                    <TableCell sx={{py:0}}>Comments</TableCell>
                                                    <TableCell sx={{py:0}}>{item.other_comments}</TableCell>
                                                </TableRow>}
                                            </TableBody>
                                        </Table>
                                        </TableContainer>
                                    </Box>
                                </Stack>
                            )
                        })
                    }
                    </Stack>
                    </Paper>
                    <Dialog fullScreen open={openAnnotation} onClose={handleClose} TransitionComponent={Transition}>
                        <Canvas imageIndex={imageIndex} open={openAnnotation} setOpen={setOpenAnnotation} data={data} setData={setData} upload={false}/>
                    </Dialog>
                    </>
                    }

                    <NotificationBar status={status} setStatus={setStatus}/> 
                </div>
                </div>
        
    );
};

export default ViewEntryDetails;