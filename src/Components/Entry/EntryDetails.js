import React, { useEffect, useState } from 'react';
import { Add, ArrowBack, ArrowLeft, AssignmentInd, Delete, Download, Edit, MoreVert, PictureAsPdf} from '@mui/icons-material';
import { Avatar, AvatarGroup, Paper, Tooltip, Typography , Stack, Box, Divider, Grid, Slide, Dialog, IconButton, Button, Table, TableRow, TableBody, Skeleton, ListItem, ListItemText, List, ListItemAvatar, Menu, MenuItem, ListItemIcon, TableContainer} from '@mui/material';
import TableCell, {tableCellClasses} from '@mui/material/TableCell';
import { stringAvatar } from '../utils';
import { useSelector} from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Canvas from '../Annotation/Canvas';
import axios from 'axios';
import dayjs from 'dayjs';
import config from '../../config.json';
import NotificationBar from '../NotificationBar';
import AssigneeDropdown from '../AssigneeDropDown';
import { LoadingButton } from '@mui/lab';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

function within24hrs(date){
    var diff = new Date() - new Date(date);
    return diff/(3600 * 1000) < 24;
}

function timeDuration(start, end){
    try {
        const duration = (new Date(end) - new Date(start))/(1000 * 60);
        return Math.round(duration) + " minutes";
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

const EntryDetails = () => {
    
    const [status, setStatus] = useState({msg:"",severity:"success", open:false});
    const [anchorEl, setAnchorEl] = React.useState(null);
    const selectorData = useSelector(state => state.data);
    const [userData, setUserData] = useState(selectorData);
    const [loading, setLoading] = useState(true);
    const [loadingReviews, setLoadingReviews] = useState(true);
    const [saving, setSaving] = useState(false);
    const [removeReviewer, setRemoveReviewer] = useState({});
    const [deleting, setDeleting] = useState(false);
    const [deleteEntry, setDeleteEntry] = useState(false);
    const [openAnnotation, setOpenAnnotation] = useState(false)
    const [imageIndex, setImageIndex] = useState({});
    const [addReviewer, setAddReviewer] = useState(false);
    const [reviews, setReviews] = useState([]);
    const [assignee, setAssignee] = useState(null);
    const [data, setData] = useState(null);
    const { id } = useParams();
    const navigate = useNavigate();

    const handleOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleCloseMenu = () => {
        setAnchorEl(null);
    };

    const handleDoubleClick = (index)=>{
        setImageIndex(index);
        setOpenAnnotation(true);
    }

    const handleClose = () => {
        setOpenAnnotation(false);
    };


    const markAsRead = (data)=>{
        if(!data.updated) return;

        axios.post(`${config['path']}/user/entry/open/${id}`,{},
        {
            headers: {
                'Authorization': `Bearer ${userData.accessToken.token}`,
                'email': JSON.parse(sessionStorage.getItem("info")).email,
            },
            withCredentials: true
        }).then(res=>{
        }).catch(err=>{
        })
    }

    const getReviews = ()=>{
        setLoadingReviews(true);
        axios.get(`${config['path']}/user/entry/reviews/${id}`,{
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

    const removeAssignee = (item)=>{
        
        setRemoveReviewer(item);

        axios.post(`${config['path']}/user/entry/reviewer/remove/${id}`,
        { reviewer_id: item._id },
        {
            headers: {
                'Authorization': `Bearer ${userData.accessToken.token}`,
                'email': JSON.parse(sessionStorage.getItem("info")).email,
            },
            withCredentials: true
        }).then(res=>{
            setAddReviewer(false);
            loadData();
        }).catch(err=>{
            if(err.response) showMsg(err.response.data?.message, "error")
            else alert(err.message)
        }).finally(()=>{
            setRemoveReviewer({})
        })
        
    }


    const addAssignee = ()=>{

        if(!assignee){
            return;
        }

        const containsReviewer = data.reviewers?.some(obj => obj._id === assignee._id);
        if(containsReviewer){
            showMsg("Reviewer assigned successfuly!","success");
            setAddReviewer(false);
            return;
        }

        setSaving(true);

        axios.post(`${config['path']}/user/entry/reviewer/add/${id}`,
        { reviewer_id: assignee._id },
        {
            headers: {
                'Authorization': `Bearer ${userData.accessToken.token}`,
                'email': JSON.parse(sessionStorage.getItem("info")).email,
            },
            withCredentials: true
        }).then(res=>{
            showMsg("Reviewer assigned successfuly!","success");
            setAddReviewer(false);
            loadData();
        }).catch(err=>{
            if(err.response) showMsg(err.response.data?.message, "error")
            else alert(err.message)
        }).finally(()=>{
            setSaving(false);
        })

    }


    const loadData = ()=>{
        axios.get(`${config['path']}/user/entry/get/${id}`,{
            headers: {
                'Authorization': `Bearer ${userData.accessToken.token}`,
                'email': JSON.parse(sessionStorage.getItem("info")).email,
            },
            withCredentials: true
        }).then(res=>{
            setData(res.data);
            setLoading(false);
            markAsRead(res.data);
        }).catch(err=>{
            if(err.response) showMsg(err.response.data?.message, "error")
            else alert(err.message)
        })
    }

    const handleDelete = ()=>{
        setDeleting(true)
        axios.post(`${config['path']}/user/entry/delete/${id}`,
        {},
        {
            headers: {
                'Authorization': `Bearer ${userData.accessToken.token}`,
                'email': JSON.parse(sessionStorage.getItem("info")).email,
            },
            withCredentials: true
        }).then(res=>{
            showMsg("Reviewers assigned successfuly!","success");
            navigate('/manage/my/entries');
        }).catch(err=>{
            if(err.response) showMsg(err.response.data?.message, "error")
            else alert(err.message)
        }).finally(()=>{
            setDeleting(false);
        })

    }

    useEffect(()=>{
        setLoading(true);
        loadData();
        getReviews();
    },[])

    useEffect(()=>{
        if(!addReviewer) setAssignee(null);
    },[addReviewer])


    useEffect(()=>{
        if(!openAnnotation){
            loadData();
        }
    },[openAnnotation])

    const showMsg = (msg, severity)=>{
        setStatus({msg, severity, open:true})
    }

    return (
            <div className="inner_content">
                <div>  
                    <div className="sticky">
                    <Typography sx={{ fontWeight: 700}} variant="h5">Tele Consultation Entry</Typography>                  
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
                    <Stack direction='row' spacing={2} alignItems='center'>
                        <AssignmentInd sx={{color:'orange', width:'60px',height:'60px'}}/>
                        <Stack direction='column'>
                            <Tooltip title='Go to patients profile' arrow placement="right"><Typography component={Link} to={`/manage/my/patients/${data.patient._id}`} variant='h5' color='Highlight' sx={{cursor:'pointer'}}>
                                {data.patient?.patient_name}
                            </Typography></Tooltip>
                            <Typography color='GrayText'>{data.patient?.patient_id}</Typography>
                        </Stack>
                        <Box flex={1}></Box>
                        <IconButton
                            id="fade-button"
                            aria-controls={Boolean(anchorEl) ? 'fade-menu' : undefined}
                            aria-haspopup="true"
                            aria-expanded={Boolean(anchorEl) ? 'true' : undefined}
                            onClick={handleOpen}
                        ><MoreVert/></IconButton>
                    </Stack>

                    <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCloseMenu} onClick={handleCloseMenu}
                        PaperProps={{
                            elevation: 0,
                            sx: {  overflow: 'visible', filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))', mt: 1.5,
                                '&:before': { content: '""', display: 'block', position: 'absolute',
                                top: 0, right: 14, width: 10, height: 10, bgcolor: 'background.paper',
                                transform: 'translateY(-50%) rotate(45deg)',zIndex: 0,
                                },
                            },
                            }}
                            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                        >
                        <MenuItem>
                            <ListItemIcon><Download/></ListItemIcon>
                            <ListItemText>Download</ListItemText>
                        </MenuItem>
                        { within24hrs(data.createdAt) &&
                        <MenuItem onClick={()=>setDeleteEntry(!deleteEntry)}>
                            <ListItemIcon><Delete fontSize='small'/></ListItemIcon>
                            <ListItemText>Delete</ListItemText>
                        </MenuItem>
                        }
                    </Menu>

                    <Divider sx={{my:1}}/>
                    <Stack direction='column' spacing={1}>
                        <Typography variant='body2'>Start Time: {dayjs(data.start_time).format("DD/MM/YYYY HH:mm A")}</Typography>
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
                        
                        <Avatar sx={{ bgcolor: 'transparent' }}>
                            <IconButton onClick={()=>setAddReviewer(!addReviewer)}><Add/></IconButton> 
                        </Avatar>
                        
                    </AvatarGroup>
                
                    </Paper>
                    {
                        deleteEntry && 
                        <Paper sx={{p:2, my:3}}>
                        <Box sx={{border: '1px solid red', borderRadius:1, p:2}}>
                        <Typography>This action will permanently delete the consultation entry and cannot be reversed.
                        Please be certain before you proceed.</Typography>
                        <Stack direction='row' spacing={2} my={2}>
                            <LoadingButton loading={deleting} variant='contained' color='error' onClick={handleDelete}>Delete Entry</LoadingButton>
                            <Button disabled={deleting} variant='outlined' color='inherit' onClick={()=>setDeleteEntry(false)} >Cancle</Button>
                        </Stack>
                        </Box>
                        </Paper>
                    }
                    {
                    addReviewer &&
                    <Paper sx={{p:2, my:3}}>

                    <Stack direction='row' spacing={2} my={2}>
                        <AssigneeDropdown setAssignee={setAssignee}/>
                        <LoadingButton loading={saving} variant='contained' onClick={addAssignee}>Add</LoadingButton>
                        <Button disabled={saving} variant='outlined' color='inherit' onClick={()=>setAddReviewer(false)} >Close</Button>
                    </Stack>
                    {
                        assignee &&
                        <Box sx={{border:'1px solid lightgray', borderRadius: 1, p:2, my:2}}>
                        <Typography color='error'>Click ADD to add the reviewer:</Typography>
                        <Typography>{assignee.username}</Typography>
                        <Typography>{assignee.reg_no}</Typography>
                        </Box>
                    }    
                
                    {data.reviewers?.length > 0 && 
                    <List sx={{border:'1px solid lightgray', borderRadius: 1, pl:2}}>
                    {
                        data.reviewers?.map((item, index)=>{
                            return(
                                <ListItem key={index} disablePadding
                                    secondaryAction={
                                        <LoadingButton color='error' loading={removeReviewer._id === item._id} onClick={()=>removeAssignee(item)}>Remove</LoadingButton>
                                    }
                                >
                                <ListItemAvatar>
                                    <Avatar {...stringAvatar(item.username)}/>
                                </ListItemAvatar>
                                <ListItemText
                                    primary={item.username}
                                    secondary={item.reg_no} 
                                />
                                </ListItem>
                            )
                        })
                    }
                    </List>}                   
                    </Paper>
                    }

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
                                    {item.annotation.length === 0 && <div className='overlay'>
                                    <svg onClick={()=>handleDoubleClick(index)}>
                                        <polygon points="0,0,70,0,70,70"/>
                                    </svg>
                                    </div>}
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
                            <Typography sx={{ "&:hover" :{color:'var(--primary-color)'} }} variant='body2'><a href={`${config["report_path"]}/`+item.report_name} target="_blank">{realReportName(item.report_name)}</a></Typography>
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
                        <Canvas imageIndex={imageIndex} open={openAnnotation} setOpen={setOpenAnnotation} data={data.images} setData={setData} upload={false}/>
                    </Dialog>
                    </>
                    }

                    <NotificationBar status={status} setStatus={setStatus}/> 
                </div>
                </div>
        
    );
};

export default EntryDetails;