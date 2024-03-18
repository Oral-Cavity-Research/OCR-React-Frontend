import React, { useEffect, useState} from "react";
import {
  Add,
  ArrowBack,
  AssignmentInd,
  Close,
  DeleteForever,
  Image,
  MoreVert,
  PictureAsPdf,
  Save,
  Send,
} from "@mui/icons-material";
import {
  Paper,
  Tooltip,
  Typography,
  Stack,
  Box,
  Divider,
  IconButton,
  Button,
  Skeleton,
  ListItem,
  ListItemText,
  List,
  Menu,
  MenuItem,
  TextField,
  InputLabel,
  FormControl,
  Select,
  Dialog,
  DialogContent,
  DialogActions,
  DialogTitle,
  ListItemIcon,
} from "@mui/material";
import { useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import dayjs from "dayjs"; 
import NotificationBar from "../NotificationBar";
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import UploadImages from "./UploadImages";
import UploadTests from "./UploadTests";
import { LoadingButton } from "@mui/lab";
const _ = require('lodash');

const habitOptions = [
  {value: "Smoking", label: "Smoking"},
  {value: "Alcohol", label: "Alcohol"},
  {value: "Betel quid", label: "Betel quid"},
  {value: "Smokeless tobacco", label: "Smokeless tobacco"}
]

const frequencyOptions = [
  {value: "Daily", label: "Daily"},
  {value: "Weekly", label: "Weekly"},
  {value: "Bi-weekly", label: "Bi-weekly"},
  {value: "Monthly", label: "Monthly"},
  {value: "Occasionally", label: "Occasionally"},
]

const NewEntry = () => {
  const [status, setStatus] = useState({msg: "", severity: "success", open: false});
  const [anchorEl, setAnchorEl] = React.useState(null);
  const selectorData = useSelector((state) => state.data);
  const [userData, setUserData] = useState(selectorData);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState({});
  const [riskHabits, setRiskHabits] = useState([]);
  const [habit, setHabit] = useState(habitOptions[0].value);
  const [frequency, setFrequency] = useState(frequencyOptions[0].value);
  const [startTime, setStartTime] = useState(dayjs(new Date()));
  const [endTime, setEndTime] = useState(dayjs(new Date()));
  const [errorStart, setErrorStart] = useState(null);
  const [errorEnd, setErrorEnd] = useState(null);
  const [findings, setFindings] = useState("");
  const [complaint, setComplaint] = useState("");
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const navigate = useNavigate();
  const { id } = useParams();

  const handleDialogClose = () => {
      setDialogOpen(false);
  };
  
  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const showMsg = (msg, severity) => {
    setStatus({ msg, severity, open: true });
  };

  const removeRisk = (item)=>{
    let newList = riskHabits.filter((habit)=> {return habit !== item})
    setRiskHabits(newList);
  }

  const handleAddRisk = ()=>{
      let newList = riskHabits.filter((newHabit)=> {return newHabit.habit !== habit});
      newList.unshift({habit,frequency});
      setRiskHabits(newList);
  }

  const saveAsDraft = ()=>{

      const current_habits = riskHabits;

      const upload = {
          start_time : new Date(startTime),
          end_time : new Date(endTime),
          complaint,findings,current_habits
      }

      setSaving(true);
      
      axios.post(`${process.env.REACT_APP_BE_URL}/user/entry/update/${id}`, upload,
      {headers: {
          'Authorization': `Bearer ${userData.accessToken.token}`,
          'email': userData.email,
      }}
      ).then(res=>{
        showMsg("saved", "success")
      }).catch(err=>{
          if(err.response) showMsg(err.response.data?.message, "error")
          else alert(err)
      }).finally(()=>{
          setSaving(false);
      })  
  }

  const handleDiscard = () =>{
    if (data.imagesCount > 0 || data.reportsCount > 0){
      setDialogOpen(true);
    }else{
      discardDraft();
    }
  }

  const discardDraft = ()=>{
      setSaving(true);
      
      axios.post(`${process.env.REACT_APP_BE_URL}/user/entry/delete/${id}`,{},
      {headers: {
          'Authorization': `Bearer ${userData.accessToken.token}`,
          'email': userData.email,
      }}
      ).then(res=>{
         navigate('/manage/my/draft')
      }).catch(err=>{
          if(err.response) showMsg(err.response.data?.message, "error")
          else alert(err)
      }).finally(()=>{
          setSaving(false);
      })  
  }

  const savePermanantly = ()=>{

      const current_habits = riskHabits;

      if(findings===""|| complaint===""){
          showMsg("Please add required feilds","error");
          return;
      }

      if(errorStart !== null || errorEnd !== null){
          showMsg("Please add proper start & end time","error");
          return;
      }          

      const upload = {
          start_time : new Date(startTime),
          end_time : new Date(endTime),
          complaint,findings,current_habits
      }

      setSaving(true);
      
      axios.post(`${process.env.REACT_APP_BE_URL}/user/entry/save/${id}`, upload,
      {headers: {
          'Authorization': `Bearer ${userData.accessToken.token}`,
          'email': userData.email,
      }}
      ).then(res=>{
        navigate(`/manage/my/entries/${id}`)    
      }).catch(err=>{
          if(err.response) showMsg(err.response.data?.message, "error")
          else alert(err)
      }).finally(()=>{
          setSaving(false);
      })  
  }

  useEffect( () => {
    setLoading(true);
    axios.get(`${process.env.REACT_APP_BE_URL}/user/entry/get/draft/${id}`,{
        headers: {
          Authorization: `Bearer ${userData.accessToken.token}`,
          email: userData.email,
        },
        withCredentials: true,
      })
      .then((res) => {
        setData({...res.data, imagesCount: res.data.images?.length, reportsCount: res.data.reports?.length});
        setRiskHabits(res.data.current_habits);
        setStartTime(dayjs(res.data.start_time));
        setEndTime(dayjs(res.data.end_time));
        setFindings(res.data.findings);
        setComplaint(res.data.complaint);
        setLoading(false);
      })
      .catch((err) => {
        if (err.response) showMsg(err.response.data?.message, "error");
        else alert(err.message);
      });
  },[]);

  return (
    <div className="inner_content">
      <div>
        <div className="sticky">
          <Typography sx={{ fontWeight: 700 }} variant="h5">
            New Entry
          </Typography>
          <Button
            onClick={() => navigate(-1)}
            size="small"
            startIcon={<ArrowBack />}
            sx={{ p: 0 }}
          >
            Go Back
          </Button>
        </div>
        {loading && !data ? (
          <Paper sx={{ p: 2, my: 3 }}>
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              sx={{ my: 3 }}
            >
              <Skeleton variant="rounded" width={60} height={60} />
              <Stack direction="column">
                <Skeleton
                  variant="text"
                  width={210}
                  sx={{ fontSize: "2rem" }}
                />
                <Skeleton variant="text" width={210} />
              </Stack>
            </Stack>
            <Stack spacing={2}>
              <Skeleton variant="rounded" height={40} width={600} />
              <Skeleton variant="rounded" height={40} width={600} />
            </Stack>
          </Paper>
        ) : (
        <>
          <Paper sx={{ p: 3, my: 3 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <AssignmentInd
                    sx={{ color: "orange", width: "60px", height: "60px" }}
                  />
                  <Stack direction="column">
                    <Tooltip
                      title="Go to patients profile"
                      arrow
                      placement="right"
                    >
                      <Typography
                        component={Link}
                        to={`/manage/my/patients/${data?.patient?._id}`}
                        variant="h5"
                        color="Highlight"
                        sx={{ cursor: "pointer" }}
                      >
                        {data?.patient?.patient_name}
                      </Typography>
                    </Tooltip>
                    <Typography color="GrayText">
                      {data?.patient?.patient_id}
                    </Typography>
                  </Stack>
                  <Box flex={1}></Box>
                  <Button endIcon={<Send/>} size='small' disabled={saving} variant="contained" onClick={savePermanantly}>Complete entry</Button>
                  <IconButton
                    id="fade-button"
                    aria-controls={Boolean(anchorEl) ? "fade-menu" : undefined}
                    aria-haspopup="true"
                    aria-expanded={Boolean(anchorEl) ? "true" : undefined}
                    onClick={handleOpen}
                  >
                    <MoreVert />
                  </IconButton>
                </Stack>

                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleCloseMenu}
                  onClick={handleCloseMenu}
                  PaperProps={{
                    elevation: 0,
                    sx: {
                      overflow: "visible",
                      filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
                      mt: 1.5,
                      "&:before": {
                        content: '""',
                        display: "block",
                        position: "absolute",
                        top: 0,
                        right: 14,
                        width: 10,
                        height: 10,
                        bgcolor: "background.paper",
                        transform: "translateY(-50%) rotate(45deg)",
                        zIndex: 0,
                      },
                    },
                  }}
                  transformOrigin={{ horizontal: "right", vertical: "top" }}
                  anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                >
                  <MenuItem disabled={saving} onClick={saveAsDraft}>
                    <ListItemIcon><Save fontSize="small" /></ListItemIcon>
                    <ListItemText>Save as draft</ListItemText>
                  </MenuItem>
                  <MenuItem disabled={saving} onClick={handleDiscard}>
                    <ListItemIcon><DeleteForever fontSize="small" /></ListItemIcon>
                    <ListItemText>Discard draft</ListItemText>
                  </MenuItem>
                  <Divider/>
                  <MenuItem disabled={saving} onClick={savePermanantly}>
                    <ListItemIcon><Send fontSize="small" /></ListItemIcon>
                    <ListItemText>Complete Entry</ListItemText>
                  </MenuItem>
                </Menu>
                <Divider sx={{my:1}}/>
                <Typography>Created At: {dayjs(data?.createdAt).format('DD/MM/YYYY')}</Typography>
                <Typography>Last Update: {dayjs(data?.updatedAt).format('DD/MM/YYYY')}</Typography>
          </Paper>
          <Paper sx={{ p: 3, my: 3 }}>
            <Stack spacing={3}>
              <Typography p={1} bgcolor={'#ececec'}>Findings</Typography>
              <Stack direction='row' spacing={2}>
                  <LocalizationProvider dateAdapter={AdapterDayjs} >
                      <DateTimePicker format='DD/MM/YYYY HH:mm:ss A' label="Start Time"  value={startTime} onChange={(newValue) => setStartTime(newValue)}
                      maxDate={dayjs()} minDate={dayjs().subtract(30, 'day')}
                      componentsProps={{ textField: { size: 'small', fullWidth:true  }}}
                      onError={(newError) => setErrorStart(newError)}
                      />
                  </LocalizationProvider>

                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DateTimePicker label="End Time" format='DD/MM/YYYY HH:mm:ss A' value={endTime} onChange={(newValue) => setEndTime(newValue)}
                      componentsProps={{ textField: { size: 'small', fullWidth:true }}}
                      maxDate={dayjs()} minDate={dayjs().subtract(30, 'day')}
                      onError={(newError) => setErrorEnd(newError)}
                      />
                  </LocalizationProvider>
              </Stack>
            <TextField value={complaint} onChange={(e)=>setComplaint(e.target.value)} fullWidth required size='small' name='complaint' multiline maxRows={4} label="Presenting complaint"/> 
            <TextField value={findings} onChange={(e)=>setFindings(e.target.value)} fullWidth required size='small' name='findings' multiline maxRows={4} label="Examination findings"/>
            <Typography p={1} bgcolor={'#ececec'}>Current Habits</Typography>
            <Typography color='GrayText'>Please select the current risk habit and its frequency, then click the + button to add</Typography>
            <Stack direction='row' spacing={2}>
            <FormControl fullWidth>
              <InputLabel id="habit-label" size='small' >Current Habits</InputLabel>
              <Select labelId='habit-label' size='small' label="Current Habits" value={habit} onChange={(e)=>setHabit(e.target.value)}>
                  {
                      habitOptions.map((item,index)=>{return(<MenuItem key={index} value={item.value}>{item.label}</MenuItem>)})
                  }
              </Select>
              </FormControl>
              <FormControl fullWidth>
              <InputLabel id="frequency-label" size='small' >Frequency</InputLabel>
              <Select labelId="frequency-label" size='small' label="Frequency" value={frequency} onChange={(e)=>setFrequency(e.target.value)}>
                  {
                      frequencyOptions.map((item,index)=>{return(<MenuItem key={index} value={item.value}>{item.label}</MenuItem>)})
                  }
              </Select>
              </FormControl>
              <Button onClick={handleAddRisk} color="inherit" variant='contained'><Add fontSize="small"/></Button>
              </Stack>
              {riskHabits.length > 0 && 
              <List sx={{border:'1px solid lightgray', borderRadius: 1, pl:2}}>
              {
                  riskHabits.map((item, index)=>{
                      return(
                          <ListItem key={index} disablePadding
                              secondaryAction={
                                  <IconButton edge="end" onClick={()=>removeRisk(item)}>
                                  <Close fontSize='small' color='error' />
                                  </IconButton>
                              }
                          >
                          <ListItemText
                              primary={item.habit}
                              secondary={item.frequency} 
                          />
                          </ListItem>
                      )
                  })
              }
              </List>}
              <Divider/>
              <Stack direction='row' justifyContent='space-between' spacing={2}>
                <Button endIcon={<Save/>} size='small' disabled={saving} variant="contained" onClick={saveAsDraft}>Save as draft</Button>
              </Stack>
          </Stack>
          </Paper>
          <Paper sx={{ p: 3, my: 3 }}>
            <Typography p={1} mb={3} bgcolor={'#ececec'}>Oral Cavity Images</Typography>
            <UploadImages updateParentData={setData}/>
          </Paper>
          <Paper sx={{ p: 3, my: 3 }}>
            <Typography p={1} mb={3} bgcolor={'#ececec'}>Test Reports</Typography>
            <UploadTests updateParentData={setData}/>
          </Paper>
        </>
        )}

        <NotificationBar status={status} setStatus={setStatus} />
        <Dialog
                open={dialogOpen}
                onClose={handleDialogClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                fullWidth
            >

              <DialogTitle>Are you sure you want to discard?</DialogTitle>
              <DialogContent>
                  <Typography>Entry has:</Typography>
                  {data.imagesCount > 0 && <Typography sx={{ display: "flex", alignItems: "center" }}><Image color='primary'/> {data.imagesCount} image{data.imagesCount > 1 ? "s":""}</Typography>}
                  {data.reportsCount > 0 && <Typography sx={{ display: "flex", alignItems: "center" }}><PictureAsPdf color='error'/> {data.reportsCount} report{data.reportsCount > 1 ? "s":""}</Typography>}
              </DialogContent>
                <DialogActions>
                <LoadingButton loading={saving} size='small' onClick={discardDraft} variant='contained' color='error' autoFocus>Discard</LoadingButton>
                <Button size='small' onClick={handleDialogClose} variant='contained' color='inherit' autoFocus>Cancle</Button>
                </DialogActions>
            </Dialog>
      </div>
    </div>
  );
};

export default NewEntry;
