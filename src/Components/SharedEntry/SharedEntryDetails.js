import React, { useEffect, useState, useRef } from 'react';
import { ArrowBack, ArrowLeft, Assignment, AssignmentTurnedIn, Download, Edit, MoreVert, PictureAsPdf, RateReview, SwapHoriz} from '@mui/icons-material';
import { Avatar, Paper, Tooltip, Typography , Stack, Box, Divider, Grid, Slide, Dialog, IconButton, Button, 
    Table, TableRow, TableCell, TableBody, Skeleton, ListItem, ListItemText, List, Menu, MenuItem, ListItemIcon, TextField, FormControl, InputLabel, Select} from '@mui/material';
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
import duration from 'dayjs/plugin/duration';
dayjs.extend(duration);

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

function realReportName(filename){
    try {
        return filename.split('_').slice(3).join('_');
    } catch (error) {
        return "Test Report";
    }
}

const provisionalOptions = [
    {label: "Suspicious of OCA", value: "Suspicious of OCA"},
    {label: "Suspicious of OPMD", value: "Suspicious of OPMD"},
    {label: "Suspicious  of OLP/ OSF/ leukoplakia", value: "Suspicious  of OLP/ OSF/ leukoplakia"},
    {label: "Oral candidal infection", value: "oral candidal infection"},
    {label: "VBD", value: "VBD"},
    {label: "Benign ulcers", value: "Benign ulcers"},
    {label: "Anatomical variation", value: "Anatomical variation"},
    {label: "Benign disease condition", value: "Benign disease condition"},
    {label: "Details not enough for a provisional diagnosis", value: "Details not enough for a provisional diagnosis"},
]

const managementOptions = [
    {label: "Indicated for immediate biopsy", value: "Indicated for immediate biopsy"},
    {label: "Indicated for immediate biopsy and toludine blue test / velscope", value: "Indicated for immediate biopsy and toludine blue test / velscope"},
    {label: "Treat with antifungals and review in two weeks", value: "Treat with antifungals and review in two weeks"},
    {label: "Habit intervention and symptomatic treatment", value: "Habit intervention and symptomatic treatment"}
]


const referralOptions = [
    {label: "Immediately refer patient to a specialist center", value: "Immediately refer patient to a specialist center"},
    {label: "Keep under monthly review", value: "Keep under monthly review"},
    {label: "2 weeks review and refer if lesion persist ", value: "2 weeks review and refer if lesion persist"}
]

const SharedEntryDetails = () => {
    
    const [status, setStatus] = useState({msg:"",severity:"success", open:false});
    const [anchorEl, setAnchorEl] = React.useState(null);
    const selectorData = useSelector(state => state.data);
    const [userData, setUserData] = useState(selectorData);
    const [loading, setLoading] = useState(true);
    const [loadingReviews, setLoadingReviews] = useState(true);
    const [reviews, setReviews] = useState([]);
    const [saving, setSaving] = useState(false);
    const [openAnnotation, setOpenAnnotation] = useState(false)
    const [imageIndex, setImageIndex] = useState({});
    const [addReviewer, setAddReviewer] = useState(false);
    const [assignee, setAssignee] = useState(null);
    const [provisionalDiagnosis, setProvisionalDiagnosis] = useState("");
    const [managementSuggestion, setManagementSuggestion] = useState("");
    const [referralSuggestion, setReferralSuggestion] = useState("");
    const [data, setData] = useState({});
    const { id } = useParams();
    const navigate = useNavigate();

    const endRef = useRef(null);
    const topRef = useRef(null);

    const scrollToBottom = () => {
        endRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    const scrollToTop = () => {
        topRef.current?.scrollIntoView({ behavior: "smooth" })
    }

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
        if(data.checked) return;

        axios.post(`${config['path']}/user/entry/mark/${id}`,{},
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

    const getReviews = (id)=>{
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

    const handleSubmitReview = (event)=>{
        event.preventDefault();

        const form = new FormData(event.currentTarget);

        if(provisionalDiagnosis === "" && managementSuggestion === "" &&
        referralSuggestion === "" && form.get("other_comments")===""){
            showMsg("Please add your review", "error");
            return;
        }

        setSaving(true);

        const toBeSent = {
            provisional_diagnosis: provisionalDiagnosis,
            management_suggestions: managementSuggestion,
            referral_suggestions: referralSuggestion,
            other_comments: form.get("other_comments")
        }

        axios.post(`${config['path']}/user/entry/review/${data._id}`, toBeSent,
        {
            headers: {
                'Authorization': `Bearer ${userData.accessToken.token}`,
                'email': JSON.parse(sessionStorage.getItem("info")).email,
            },
            withCredentials: true
        }).then(res=>{
            showMsg("Review is addded!", "success");
            getReviews(data._id);
            scrollToTop();
        }).catch(err=>{
            if(err.response) showMsg(err.response.data?.message, "error")
            else alert(err.message)
        }).finally(()=>{
            setSaving(false);
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

        axios.post(`${config['path']}/user/entry/reviewer/change/${id}`,
        { reviewer_id: assignee._id },
        {
            headers: {
                'Authorization': `Bearer ${userData.accessToken.token}`,
                'email': JSON.parse(sessionStorage.getItem("info")).email,
            },
            withCredentials: true
        }).then(res=>{
            navigate('/manage/shared/entries')
        }).catch(err=>{
            if(err.response) showMsg(err.response.data?.message, "error")
            else alert(err.message)
        }).finally(()=>{
            setSaving(false);
        })

    }


    const loadData = ()=>{
        axios.get(`${config['path']}/user/entry/shared/data/${id}`,{
            headers: {
                'Authorization': `Bearer ${userData.accessToken.token}`,
                'email': JSON.parse(sessionStorage.getItem("info")).email,
            },
            withCredentials: true
        }).then(res=>{
            setData(res.data);
            setLoading(false);
            getReviews(res.data._id);
            markAsRead(res.data);
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
                    <Typography sx={{ fontWeight: 700}} variant="h5">Assigned Entry</Typography>                  
                    <Button onClick={() => navigate(-1)} size='small' startIcon={<ArrowBack/>} sx={{p:0}}>Go Back</Button>
                    </div>
                    {loading ?
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
                        {
                            data.reviewed?
                            <AssignmentTurnedIn sx={{color:'green', width:'60px',height:'60px'}}/>
                            :
                            <Assignment sx={{color:'orange', width:'60px',height:'60px'}}/>
                        }
                        <Stack direction='column'>
                            <Tooltip title='Go to patients profile' arrow placement="right"><Typography component={Link} to={`/manage/shared/patients/${data.patient?._id}`} variant='h5' color='Highlight' sx={{cursor:'pointer'}}>
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
                        <MenuItem onClick={()=>setAddReviewer(!addReviewer)}>
                            <ListItemIcon><SwapHoriz/></ListItemIcon>
                            <ListItemText>Assign Reviewer</ListItemText>
                        </MenuItem>
                        <MenuItem>
                            <ListItemIcon><Download/></ListItemIcon>
                            <ListItemText>Download</ListItemText>
                        </MenuItem>
                    </Menu>

                    <Divider sx={{my:1}}/>
                    <Stack direction='row' spacing={1} justifyContent='space-between' alignItems='flex-end'>
                        <Stack direction='column' spacing={1}>
                        <Typography variant='body2'>Created By: <b>{data.clinician_id?.username} | {data.clinician_id?.reg_no}</b></Typography>
                        <Typography variant='body2'>Created At: {dayjs(data.createdAt).format("DD/MM/YYYY HH:MM A")}</Typography>
                        <Typography variant='body2'>Assigned At: {dayjs(data.assignedAt).format("DD/MM/YYYY HH:MM A")}</Typography>
                        </Stack>
                        {
                            !data.reviewed &&
                            <Button variant='contained' color='success' startIcon={<RateReview/>} onClick={scrollToBottom}>Add review</Button>
                        }
                    </Stack>                               
                    </Paper>
                    {
                    addReviewer &&
                    <Paper sx={{p:2, my:3}}>

                    <Stack direction='row' spacing={2} my={2}>
                        <AssigneeDropdown setAssignee={setAssignee}/>
                        <LoadingButton loading={saving} variant='contained' onClick={addAssignee}>Assign</LoadingButton>
                        <Button disabled={saving} variant='outlined' color='inherit' onClick={()=>setAddReviewer(false)} >Close</Button>
                    </Stack>  
                    {
                        assignee &&
                        <Box sx={{border:'1px solid lightgray', borderRadius: 1, p:2}}>
                        <Typography>{assignee.username}</Typography>
                        <Typography>{assignee.reg_no}</Typography>
                        </Box>
                    }            
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
                    <div ref={topRef} />
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
                                        {item.provisional_diagnosis !== "" && <Typography variant='body2'>Provisional Diagnosis: {item.provisional_diagnosis}</Typography>}
                                        {item.management_suggestions !== "" && <Typography variant='body2'>Management Suggestions: {item.management_suggestions}</Typography>}
                                        {item.referral_suggestions !== "" && <Typography variant='body2'>Referral Suggestions: {item.referral_suggestions}</Typography>}
                                        {item.other_comments !== "" && <Typography variant='body2'>Comments: {item.other_comments}</Typography>}
                                    </Box>
                                </Stack>
                            )
                        })
                    }
                    </Stack>
                    </Paper>
                    <Paper sx={{p:2, my:3}}>
                    <Box component='form' noValidate onSubmit={handleSubmitReview}>

                    <Stack direction='row' alignItems='center'>
                        <Avatar {...stringAvatar(userData?.username)}/>
                        <ArrowLeft/>
                        <Typography><b>{userData?.username}</b></Typography>
                    </Stack>

                    <FormControl fullWidth margin='normal'>
                    <InputLabel id="pd-label" size='small' >Provisional Diagnosis </InputLabel>
                    <Select labelId="pd-label" size='small' label="Provisional Diagnosis " value={provisionalDiagnosis} onChange={(e)=>setProvisionalDiagnosis(e.target.value)}>
                        {
                            provisionalOptions.map((item,index)=>{return(<MenuItem key={index} value={item.value}>{item.label}</MenuItem>)})
                        }
                    </Select>
                    </FormControl>
                    <FormControl fullWidth margin='normal'>
                    <InputLabel id="ms-label" size='small' >Management Suggestions</InputLabel>
                    <Select labelId="ms-label" size='small' label="Management Suggestions" value={managementSuggestion} onChange={(e)=>setManagementSuggestion(e.target.value)}>
                        {
                            managementOptions.map((item,index)=>{return(<MenuItem key={index} value={item.value}>{item.label}</MenuItem>)})
                        }
                    </Select>
                    </FormControl>
                    <FormControl fullWidth margin='normal'>
                    <InputLabel id="rr-label" size='small' >Referral or Review Suggestions</InputLabel>
                    <Select labelId="rr-label" size='small' label="Referral or Review Suggestions" value={referralSuggestion} onChange={(e)=>setReferralSuggestion(e.target.value)}>
                        {
                            referralOptions.map((item,index)=>{return(<MenuItem key={index} value={item.value}>{item.label}</MenuItem>)})
                        }
                    </Select>
                    </FormControl>
                    <TextField size='small' margin='normal' fullWidth multiline maxRows={6} label='Other Comments' name="other_comments" />
                    
                    <LoadingButton loading={saving} type='submit' variant='contained' sx={{my:3}} >Add Review</LoadingButton>
                    </Box>
                    </Paper>
                    <div ref={endRef} />
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

export default SharedEntryDetails;