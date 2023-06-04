import React, { useEffect, useState } from "react";
import {
  Add,
  ArrowBack,
  ArrowLeft,
  AssignmentInd,
  Delete,
  Download,
  Edit,
  MoreVert,
  PictureAsPdf,
} from "@mui/icons-material";
import {
  Avatar,
  AvatarGroup,
  Paper,
  Tooltip,
  Typography,
  Stack,
  Box,
  Divider,
  Grid,
  Slide,
  Dialog,
  IconButton,
  Button,
  Table,
  TableRow,
  TableBody,
  Skeleton,
  ListItem,
  ListItemText,
  List,
  TextField,
  Select,
  ListItemAvatar,
  Menu,
  MenuItem,
  InputLabel,
  FormControl,
  ListItemIcon,
  TableContainer,
} from "@mui/material";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import { stringAvatar } from "../utils";
import { useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import Canvas from "../Annotation/Canvas";
import axios from "axios";
import dayjs from "dayjs";
import NotificationBar from "../NotificationBar";
import AssigneeDropdown from "../AssigneeDropDown";
import { LoadingButton } from "@mui/lab";
import {Close} from '@mui/icons-material';

function timeDuration(start, end) {
  try {
    const duration = (new Date(end) - new Date(start)) / (1000 * 60);
    return Math.round(duration) + " minutes";
  } catch (error) {
    return "";
  }
}

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});


function realReportName(filename) {
  try {
    return filename.split("_").slice(3).join("_");
  } catch (error) {
    return "Test Report";
  }
}

const EditableText = ({disabled,defaultValue,name}) => (
  <TextField disabled={disabled} defaultValue={defaultValue} name={name} variant='standard' fullWidth
  sx={{
      "& .MuiInputBase-input.Mui-disabled": {
      WebkitTextFillColor: "#000000"}, 
      "& .MuiInput-input": {
          paddingY: 2,
          fontWeight:400,
          fontSize: "0.875rem"
      }
  }}
  InputProps={{
      disableUnderline: disabled
  }}
  />
)


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
const durationOptions = [
  {value: "Short-term", label: "Short-term"},
  {value: "Long-term", label: "Long-term"},
  {value: "Short-term Ongoing", label: "Short-term Ongoing"},
  {value: "Long-term Ongoing", label: "Long-term Ongoing"}
]



const DraftDetails = () => {

  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [data, setData] = useState(null);
  const userData = useSelector(state => state.data);
  const [status, setStatus] = useState({msg:"",severity:"success", open:false});
  const [openAnnotation, setOpenAnnotation] = useState(false);
  const [imageIndex, setImageIndex] = useState({});
  const [ editEnable, setEditEnable] = useState(true);
  const [riskHabits, setRiskHabits] = useState([]);
  const [habit, setHabit] = useState(habitOptions[0].value);
  const [frequency, setFrequency] = useState(frequencyOptions[0].value);
  const [duration, setDuration] = useState(durationOptions[0].value);


  const navigate = useNavigate();


const handleOpen = (event) => {
  setAnchorEl(event.currentTarget);
};
const handleCloseMenu = () => {
  setAnchorEl(null);
};

const handleDoubleClick = (index) => {
  setImageIndex(index);
  setOpenAnnotation(true);
};

const handleClose = () => {
  setOpenAnnotation(false);
};

const removeRisk = (item)=>{
  let newList = data.current_habits.filter((habit)=> {return habit !== item})
  // setRiskHabits(newList);
}

const onCancel = ()=>{
  setEditEnable(!editEnable)
}

const handleAddRisk = ()=>{
  let newList = data.current_habits.filter((newHabit)=> {return newHabit.habit !== habit});
  newList.unshift({habit,frequency,duration});
  setRiskHabits(newList);
}

const setcurrentHabits =()=>{
  setRiskHabits(data.current_habits);
}


const getData = ()=>{
    axios.get(`${process.env.REACT_APP_BE_URL}/user/draftentry/get/${id}`,{
        headers: {
            'Authorization': `Bearer ${userData.accessToken.token}`,
            'email': userData.email,
        },
        withCredentials: true
    }).then(res=>{
        console.log(res.data);
        //if(res.data?.length < 20) setNoMore(true);
        setData(res.data);
        
    }).catch(err=>{
        if(err.response) showMsg(err.response.data.message, "error")
        else alert(err)
    }).finally(()=>{
        setLoading(false);
        setcurrentHabits();
    })
}

const showMsg = (msg, severity)=>{
  setStatus({msg, severity, open:true})
}

useEffect(() => {
  console.log("useEffect");
  setLoading(true);
  getData();
  
}, []);


useEffect(() => {
  if (!openAnnotation) {
    getData();
  }
}, [openAnnotation]);


return(
  // <>
  //   <div>{id}</div>
  //  { loading &&  !data  ?(<div> loading</div>) : (<div> {data.patient?.patient_id} </div>)
  //  }
  // </>
  
   <div className="inner_content">
    <div>
      <div className="sticky">
        <Typography sx={{ fontWeight: 700 }} variant="h5">
          Tele Consultation Draft
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
                    to={`/manage/my/patients/${data.patient?._id}`}
                    variant="h5"
                    color="Highlight"
                    sx={{ cursor: "pointer" }}
                  >
                    {data.patient?.patient_name}
                  </Typography>
                </Tooltip>
                <Typography color="GrayText">
                  {data.patient?.patient_id}
                </Typography>
              </Stack>
              <Box flex={1}></Box>
              {/* <IconButton
                id="fade-button"
                aria-controls={Boolean(anchorEl) ? "fade-menu" : undefined}
                aria-haspopup="true"
                aria-expanded={Boolean(anchorEl) ? "true" : undefined}
                onClick={handleOpen}
              > 
                <MoreVert />
              </IconButton> */}
               <Stack direction='row' spacing={2} justifyContent='flex-end'>
                <Button variant='contained' endIcon={<Edit/>} onClick={() => setEditEnable(!editEnable)}
                style={{ display: !(editEnable) ? 'none' : undefined }}>Edit</Button>
                <Button style={{ display: editEnable ? 'none' : undefined }} variant='contained' onClick={onCancel}>Cancel</Button>
            </Stack>


            </Stack>

            <Divider sx={{ my: 1 }} />
            <Stack direction="column" spacing={1}>
              <Typography variant="body2">
                Start Time:{" "}
                {dayjs(data.start_time).format("DD/MM/YYYY HH:mm A")}
              </Typography>
              <Typography variant="body2">
                Duration: {timeDuration(data.start_time, data.end_time)}
              </Typography>
            </Stack>
            <Divider sx={{ my: 1 }} />
        
          </Paper>
  

          <Paper sx={{ p: 2, my: 3 }}>
            <Table sx={{ border: "1px solid lightgray" }}>
              <TableBody>
                <TableRow>
                  <TableCell>Complaint:</TableCell>
                  <TableCell>
                   <EditableText disabled={editEnable} defaultValue={data.complaint} name={'complaint'}/>
                  </TableCell>
                  
                </TableRow>
                <TableRow>
                  <TableCell>Findings:</TableCell>
                  <TableCell>
                    <EditableText disabled={editEnable} defaultValue={data.findings} name={'Findings'}/>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Current Habits:</TableCell>
                  <TableCell>
                  {
                            !editEnable &&
                            <Box>
                                <Stack direction='row' spacing={1} sx={{py:1}} >
                                <FormControl fullWidth>
                                <InputLabel id="habbit-label" variant='standard' >Habbit</InputLabel>
                                <Select labelId="habbit-label" variant='standard' label="Habit" value={habit} onChange={(e)=>setHabit(e.target.value)}>
                                    {
                                        habitOptions.map((item,index)=>{return(<MenuItem key={index} value={item.value}>{item.label}</MenuItem>)})
                                    }
                                </Select>
                                </FormControl>

                                <Button size='small' color='inherit' variant='outlined' onClick={handleAddRisk} >Add</Button>
                                </Stack>

                                <Stack direction='row' spacing={1}>
                                <FormControl fullWidth>
                                <InputLabel id="frequency-label" variant='standard' >Frequency</InputLabel>
                                <Select labelId="frequency-label" variant='standard' label="Frequency" value={frequency} onChange={(e)=>setFrequency(e.target.value)}>
                                    {
                                        frequencyOptions.map((item,index)=>{return(<MenuItem key={index} value={item.value}>{item.label}</MenuItem>)})
                                    }
                                </Select>
                                </FormControl>
                                <FormControl fullWidth>
                                <InputLabel id="duration-label" variant='standard' >Duration</InputLabel>
                                <Select labelId='duration-label' variant='standard' label="Duration" value={duration} onChange={(e)=>setDuration(e.target.value)}>
                                    {
                                        durationOptions.map((item,index)=>{return(<MenuItem key={index} value={item.value}>{item.label}</MenuItem>)})
                                    }
                                </Select>
                                </FormControl>
                                </Stack>
                            </Box>
                        
                        }
                    <List>
                      {/* {data.current_habits?.map((item, index) => {
                        return (
                          <ListItem key={index} disablePadding>
                            <ListItemText
                              primary={
                                <Typography variant="body2">
                                  {item.habit}
                                </Typography>
                              }
                              secondary={item.frequency}
                            />
                          </ListItem>
                        );
                      })} */}
                          {
                            data.current_habits?.map((item, index)=>{
                                return(
                                    <ListItem key={index} disableGutters disablePadding
                                        secondaryAction={
                                            !editEnable?
                                            <IconButton edge="end" onClick={()=>removeRisk(item)}>
                                            <Close fontSize='small' color='error' />
                                            </IconButton>
                                            : null
                                        }
                                    >
                                    <ListItemText
                                        primary={<Typography variant='body2' >{item.habit}</Typography>}
                                        secondary={item.frequency + " | " + item.duration} 
                                    />
                                    </ListItem>
                                )
                            })
                        }

                    </List>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Paper>
          <Paper sx={{ p: 2, my: 3 }}>
            {data.images?.length > 0 ? (
              <Typography sx={{ mb: 2 }} variant="body2">
                Images:
              </Typography>
            ) : (
              <Typography sx={{ mb: 2 }} color="GrayText" variant="body2">
                No Images were Added
              </Typography>
            )}
            <Grid container spacing={2}>
              {data.images?.map((item, index) => (
                <Grid item key={index} xs={4} md={3} lg={2}>
                  <div className="imageDiv">
                    <div className="grid_image">
                      <img
                        src={`${process.env.REACT_APP_IMAGE_PATH}/${item.image_name}`}
                        alt="Failed to Load"
                      />
                      {item.annotation.length === 0 && (
                        <div className="overlay">
                          <svg onClick={() => handleDoubleClick(index)}>
                            <polygon points="0,0,70,0,70,70" />
                          </svg>
                        </div>
                      )}
                      <Stack
                        direction="row"
                        sx={{ position: "absolute", bottom: 10, right: 0 }}
                      >
                        <IconButton
                          onClick={() => handleDoubleClick(index)}
                          size="small"
                          sx={{ color: "transparent" }}
                          className="iconBackground"
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      </Stack>
                    </div>

                    <Stack
                      direction="column"
                      justifyContent="space-between"
                      alignItems="start"
                      px={1}
                    >
                      <Box>
                        <Typography fontSize="small" color="GrayText">
                          {item.location} | {item.clinical_diagnosis}
                        </Typography>
                      </Box>
                    </Stack>
                  </div>
                </Grid>
              ))}
            </Grid>
          </Paper>
          <Paper sx={{ p: 2, my: 3 }}>
            {data.reports?.length > 0 ? (
              <Typography sx={{ mb: 2 }} variant="body2">
                Test Reports:
              </Typography>
            ) : (
              <Typography color="GrayText" variant="body2">
                No Test Reports were Added
              </Typography>
            )}

            {data.reports?.map((item, index) => {
              return (
                <Stack
                  direction="row"
                  sx={{ my: 2 }}
                  alignItems="center"
                  spacing={2}
                  key={index}
                >
                  <PictureAsPdf color="error" />
                  <Typography
                    sx={{ "&:hover": { color: "var(--primary-color)" } }}
                    variant="body2"
                  >
                    <a
                      href={`${process.env.REACT_APP_REPORT_PATH}/` + item.report_name}
                      target="_blank"
                    >
                      {realReportName(item.report_name)}
                    </a>
                  </Typography>
                </Stack>
              );
            })}
          </Paper>
          {/* <Paper sx={{ p: 2, my: 3 }}>
            {loadingReviews ? (
              <Typography variant="body2">Loading Reviews...</Typography>
            ) : reviews.length > 0 ? (
              <Typography sx={{ mb: 2 }} variant="body2">
                Reviews:
              </Typography>
            ) : (
              <Typography color="GrayText" variant="body2">
                No Reviews Yet
              </Typography>
            )}
            <Stack direction="column" spacing={1}>
              {reviews.map((item, index) => {
                return (
                  <Stack
                    direction="row"
                    key={index}
                    sx={{ background: "white", p: 1 }}
                  >
                    <Avatar {...stringAvatar(item.reviewer_id?.username)} />
                    <ArrowLeft />
                    <Box>
                      <Typography variant="body2">
                        <strong>{item.reviewer_id?.username}</strong> |{" "}
                        {item.reviewer_id?.reg_no}
                      </Typography>
                      <TableContainer>
                        <Table
                          sx={{
                            [`& .${tableCellClasses.root}`]: {
                              borderBottom: "none",
                            },
                          }}
                        >
                          <TableBody>
                            {item.provisional_diagnosis !== "" && (
                              <TableRow>
                                <TableCell sx={{ py: 0 }}>
                                  Provisional Diagnosis
                                </TableCell>
                                <TableCell sx={{ py: 0 }}>
                                  {item.provisional_diagnosis}
                                </TableCell>
                              </TableRow>
                            )}
                            {item.management_suggestions !== "" && (
                              <TableRow>
                                <TableCell sx={{ py: 0 }}>
                                  Management Suggestions
                                </TableCell>
                                <TableCell sx={{ py: 0 }}>
                                  {item.management_suggestions}
                                </TableCell>
                              </TableRow>
                            )}
                            {item.referral_suggestions !== "" && (
                              <TableRow>
                                <TableCell sx={{ py: 0 }}>
                                  Referral Suggestions
                                </TableCell>
                                <TableCell sx={{ py: 0 }}>
                                  {item.referral_suggestions}
                                </TableCell>
                              </TableRow>
                            )}
                            {item.other_comments !== "" && (
                              <TableRow>
                                <TableCell sx={{ py: 0 }}>Comments</TableCell>
                                <TableCell sx={{ py: 0 }}>
                                  {item.other_comments}
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  </Stack>
                );
              })}
            </Stack>
          </Paper> */}
          <Dialog
            fullScreen
            open={openAnnotation}
            onClose={handleClose}
            TransitionComponent={Transition}
          >
            <Canvas
              imageIndex={imageIndex}
              open={openAnnotation}
              setOpen={setOpenAnnotation}
              data={data.images}
              setData={setData}
              upload={false}
            />
          </Dialog>
        </>
      )}

      <NotificationBar status={status} setStatus={setStatus} />
    </div>
  </div>
)
}
export default DraftDetails;
