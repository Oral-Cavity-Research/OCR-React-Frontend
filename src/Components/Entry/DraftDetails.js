import React, { useEffect, useState,useRef } from "react";
import {
  ArrowBack,
  AssignmentInd,
  Delete,
  Edit,
  Crop,
  PictureAsPdf,
} from "@mui/icons-material";
import {
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
  MenuItem,
  InputLabel,
  FormControl,
} from "@mui/material";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import { useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import Canvas from "../Annotation/Canvas";
import axios from "axios";
import dayjs from "dayjs";
import NotificationBar from "../NotificationBar";
import ImageCropper from '../Crop/ImageCropper';
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
  const [data, setData] = useState(null);
  const userData = useSelector(state => state.data);
  const [status, setStatus] = useState({msg:"",severity:"success", open:false});
  const [openAnnotation, setOpenAnnotation] = useState(false);
  const [imageIndex, setImageIndex] = useState({});
  const [openCrop, setOpenCrop] = useState(false)
  const [imageArray,setImageArray] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [fileArray,setFileArray] = useState([]);
  const [ editEnable, setEditEnable] = useState(true);
  const [riskHabits, setRiskHabits] = useState([]);
  const [complaint,setComplaint]= useState();
  const [findings,setFindings] = useState();
  const [startTime, setStartTime] = useState(dayjs(new Date()));
  const [endTime, setEndTime] = useState(dayjs(new Date()));
  const [habit, setHabit] = useState(habitOptions[0].value);
  const [frequency, setFrequency] = useState(frequencyOptions[0].value);
  const [duration, setDuration] = useState(durationOptions[0].value);
  const [entryID, setEntryID] = React.useState(null);
  const hidenInput1 = useRef();
  const hidenInput2= useRef();


const navigate = useNavigate();



const removeRisk = (item)=>{
  let newList = riskHabits.filter((habit)=> {return habit !== item})
  setRiskHabits(newList)
}

const onCancel = ()=>{
  setEditEnable(!editEnable)
  setRiskHabits(data?.current_habits)
  setImageArray(data?.images)
  setFileArray(data?.reports)
  setComplaint(data?.complaint)
  setFindings(data?.findings)

}

const handleAddRisk = ()=>{
  let newList = riskHabits.filter((newHabit)=> {return newHabit.habit !== habit});
  newList.unshift({habit,frequency,duration});
  setRiskHabits(newList);
}

// select images

const handleSelection1 = ()=>{
  hidenInput1.current.click();
}

const handleSelection2 = ()=>{
  hidenInput2.current.click();
}

const selectImages = (event) => {
  console.log("images")
        
  if(imageArray.length + event.target.files.length > 12){
      showMsg("Cannot upload more than 12 images at once","error");
      return;
  }

  let images = [...imageArray];
  let files = [...selectedFiles];

  for (let i = 0; i < event.target.files.length; i++) {
      if(event.target.files[i].size < 25*1000*1000){
          let jsonData ={
              img: URL.createObjectURL(event.target.files[i]),
              location: "Upper labial mucosa",
              clinical_diagnosis: "Normal",
              lesions_appear: true,
              annotation: []
          }
          files.unshift(event.target.files[i]);
          images.unshift(jsonData);
      }
  }


  // setSelectedFiles(files);       
  setImageArray(images);
};


const handleEdit = (index)=>{
  setImageIndex(index);
  setOpenCrop(true);
}

const handleClose = () => {
  setOpenAnnotation(false);
  setOpenCrop(false);
};

const handleDoubleClick = (index)=>{
  setImageIndex(index);
  setOpenAnnotation(true);

}

const handleDeleteImage = (item) => {
  let newList = imageArray.filter((image)=> {return image !== item})
  setImageArray(newList)

};

//select files

const selectFiles = (event) => {
  console.log("Files")
  if(fileArray.length + event.target.files.length > 12){
      showMsg("Cannot upload more than 12 files at once","error");
      return;
  }

  let files = [...fileArray];

  for (let i = 0; i < event.target.files.length; i++) {
      if(event.target.files[i].size < 25*1000*1000){
          files.unshift(event.target.files[i]);
      }
  }

  setFileArray(files);
};

const handleDeleteFiles = (item)=>{
  let newList = fileArray.filter((file)=> {return file !== item})
  setFileArray(newList)
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
        setData(res.data);
        return res.data;
    }).then(data=>{
      setRiskHabits(data.current_habits);
      setImageArray(data.images);
      setFileArray(data.reports);
      setComplaint(data.complaint);
      setFindings(data.findings);
   }).catch(err=>{
        if(err.response) showMsg(err.response.data.message, "error")
        else alert(err)
    }).finally(()=>{
        setLoading(false);
    })
}

/*need to be changed */
    const dataSubmit = (event)=>{
        event.preventDefault();

        const complaint = complaint;
        const findings = findings;
        const current_habits = riskHabits;

        if(findings===""|| complaint===""){
            showMsg("Please add required feilds","error");
            return;
        }

        const upload = {
            start_time : new Date(startTime),
            end_time : new Date(endTime),
            complaint,findings,current_habits
        }

        setLoading(true);
        
        axios.post(`${process.env.REACT_APP_BE_URL}/user/draftentry/add/${id}`, upload, //should change
        {headers: {
            'Authorization': `Bearer ${userData.accessToken.token}`,
            'email': userData.email,
        }}
        ).then(res=>{
            setEntryID(res.data._id);
        }).catch(err=>{
            if(err.response) showMsg(err.response.data?.message, "error")
            else alert(err)
        }).finally(()=>{
            setLoading(false);
        })  
    }



/*need to be changed */
const imageSubmit = ()=>{

      if(selectedFiles.length===0){
          showMsg("Please Select the images", "error");
          return;
      }

      setLoading(true);

      const temp =  data.map(item => ({...item}));
      temp.forEach(item =>{ 
          delete item.img;
          item.telecon_entry_id = entryID;
      });

      var form = new FormData();
      selectedFiles.forEach((pic, index) => {
          var filename = id+"_"+ Date.now() + "_"+ index + "_" + pic.name;
          form.append('files', pic, filename);
          temp[index].image_name = filename;
      });

      form.append('data',JSON.stringify(temp))
     
      axios.post(`${process.env.REACT_APP_BE_URL}/user/draftupload/images/${entryID}`, form,
      {headers: {
          'Authorization': `Bearer ${userData.accessToken.token}`,
          'Content-Type': 'multipart/form-data',
          'email': userData.email,
      }}
      ).then(res=>{
          setSelectedFiles([]);
          setImageIndex(0);
          imageArray([]);
          // setDone(1);
      }).catch(err=>{
          if(err.response) showMsg(err.response.data.message, "error")
          else alert(err)
      }).finally(()=>{
          setLoading(false);
      })

  }


 
/*need to be changed */

const reportSubmit = ()=>{


    if(fileArray.length===0){
        showMsg("Please Select the test reports", "error");
        return;
    }

    setLoading(true);

    const temp =  [];
    fileArray.forEach(item =>{ 
        temp.push({
            telecon_entry_id : entryID
        })
    });

    var form = new FormData();
    fileArray.forEach((report, index) => {
        var filename = id+"_"+ Date.now() + "_"+ index + "_" + report.name;
        temp[index].report_name = filename;
        form.append('files', report, filename);
    });

    form.append('data',JSON.stringify(temp))

    axios.post(`${process.env.REACT_APP_BE_URL}/user/draftupload/reports/${entryID}`, form,
    {headers: {
        'Authorization': `Bearer ${userData.accessToken.token}`,
        'Content-Type': 'multipart/form-data',
        'email': userData.email,
    }}
    ).then(res=>{
        setFileArray([]);
        // setDone(2)
    }).catch(err=>{
        if(err.response) showMsg(err.response.data.message, "error")
        else alert(err)
    }).finally(()=>{
        setLoading(false);
    })

}

/* this need to be changed */
const handlesSubmit = () =>{
  //datasubmit()
  //imageSubmit()
  //reportSubmit()
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
            <Table sx={{ border: "1px solid lightgray", p:2,  my: 3 }}>
              <TableBody>
                <TableRow>
                  <TableCell>Complaint:</TableCell>
                  <TableCell>
                   <TextField disabled={editEnable} defaultValue={complaint} name={'complaint'}  variant='standard' fullWidth
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
                            disableUnderline: {editEnable}
                        }}
                        onChange={(e)=>{setComplaint(e.target.value)}}
                        />


                  </TableCell>
                  
                </TableRow>
                <TableRow>
                  <TableCell>Findings:</TableCell>
                  <TableCell>
                     <TextField disabled={editEnable} defaultValue={findings} name={'findings'}  variant='standard' fullWidth
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
                            disableUnderline: {editEnable}
                        }}
                        onChange={(e)=>{setFindings(e.target.value)}}
                        />


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
                          {
                            riskHabits?.map((item, index)=>{
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
          <Paper sx={{ p: 2, my:3 }}>
            {imageArray?.length > 0 ? (
              <Typography sx={{ mb: 2 }} variant="body2">
                Images:
              </Typography>
            ) : (
              <Typography sx={{ mb: 2 }} color="GrayText" variant="body2">
                No Images were Added
              </Typography>
            )}
            
            <Box flex={1}></Box>
            <input hidden accept="image/png, image/jpeg" ref={hidenInput1} multiple type="file" onChange={selectImages}/>
            {!editEnable &&
            <Stack direction='row' spacing={2} justifyContent='flex-end'>
                <Button variant='contained' onClick={handleSelection1}>Add images</Button>  
            </Stack>
            }

            <Grid container  spacing={2}  >  
              {imageArray?.map((item, index) => (
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

                      {!editEnable &&
                      <Stack
                        direction="row"
                        sx={{ position: "absolute", bottom: 10, right: 0 }}
                      >
                       

                        <Stack direction='column' justifyContent='space-between' alignItems='start' px={1}>
                          <Stack direction='row'>
                              <IconButton  
                              onClick={()=>handleEdit(index)} aria-label="delete"
                              size="small"
                              sx={{ color: "transparent" }}
                              className="iconBackground">
                              <Crop fontSize='small'/></IconButton>

                              <IconButton 
                              onClick={()=>handleDoubleClick(index)}
                              aria-label="delete"
                              size="small"
                              sx={{ color: "transparent" }}
                              className="iconBackground">
                                <Edit fontSize='small'/></IconButton>

                              <IconButton onClick={()=>handleDeleteImage(item)}
                              aria-label="delete"
                              size="small"
                              sx={{ color: "transparent" }}
                              className="iconBackground">
                                <Delete fontSize='small'/></IconButton>
                          </Stack>
                        </Stack>
                        
                      </Stack>
                        }

                     
                      
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

            <Dialog fullScreen open={openAnnotation} onClose={handleClose} TransitionComponent={Transition}>
                <Canvas imageIndex={imageIndex} open={openAnnotation} setOpen={setOpenAnnotation} data={imageArray} setData={setImageArray} upload={true}/>
            </Dialog>

            <Dialog fullScreen open={openCrop} onClose={handleClose} TransitionComponent={Transition}>
                <ImageCropper imageIndex={imageIndex} upload={true}
                data={imageArray} setData={setImageArray} 
                open={openCrop} setOpen={setOpenCrop} 
                selectedFiles={fileArray} setSelectedFiles={setFileArray}/>
            </Dialog>
            



          </Paper>
          <Paper sx={{ p: 2, my: 3 }}>
            {fileArray?.length > 0 ? (
              <Typography sx={{ mb: 2 }} variant="body2">
                Test Reports:
              </Typography>
            ) : (
              <Typography color="GrayText" variant="body2">
                No Test Reports were Added
              </Typography>
            )}
            <Box flex={1}></Box>
            <input hidden accept="application/pdf" ref={hidenInput2} multiple type="file" onChange={selectFiles}/>

            {!editEnable &&
            <Stack direction='row' spacing={2} justifyContent='flex-end'>
                <Button variant='contained' onClick={handleSelection2}>Add Reports</Button>
            </Stack>
            }

           

            {fileArray?.map((item, index) => {
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
                  
                  {!editEnable &&
                  <IconButton onClick={()=>handleDeleteFiles(item)}
                              aria-label="delete"
                              size="small"
                              justifyContent="flex-end">
                              <Delete fontSize='small'/>
                  </IconButton>
                  }

                  
                </Stack>
              );
            })}

          </Paper>
          <Paper sx={{ p: 2, my: 3 }}>
  
          <Stack direction='row' spacing={2} justifyContent='flex-start'>
                <Button variant='contained' onClick={() => handlesSubmit}
                style={{ display: !(editEnable) ? 'none' : undefined }}>Save as Entry</Button>
                {/* <Button style={{ display: editEnable ? 'none' : undefined }} variant='contained' onClick={onCancel}>Cancel</Button> */}
            </Stack>
                  

           
          </Paper>
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
