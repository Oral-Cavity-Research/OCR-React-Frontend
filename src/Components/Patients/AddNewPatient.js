import React , {useState, useRef} from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { PersonAdd } from '@mui/icons-material';
import axios from 'axios';
import config from '../../config.json';
import { useNavigate } from 'react-router-dom';
import NotificationBar from '../NotificationBar';
import LoadingButton from '@mui/lab/LoadingButton';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import FormLabel from '@mui/material/FormLabel';
// import { DesktopDatePicker, LocalizationProvider, AdapterDayjs } from '@mui/x-date-pickers';
// import dayjs from 'dayjs';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';


export default function AddNewPatient() {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState(0);
  const [status, setStatus] = useState({msg:"",severity:"success", open:false}) 

  const [name,setName] = useState("");
  const [regNo,setRegNo] = useState("");
  const [birthDate,setBirthDate] = useState("");
  const [gender,setGender] = useState("");
  const [smoking,setSmoking] = useState(false);
  const [alcohol,setAlcohol] = useState(false);
  const [betalQuid,setBetalquid] = useState(false);
  const [smokelessTobacco,setSmokelessTobacco] = useState(false);
  const [familyHistory,setFamilyHistory] = useState(false);
  const [medicalHistory,setMedicalHistory] = useState("");
  const [consentFile,setConsentFile] = useState("");
  const [consentFileUploaded,setConsentFileUploded] = useState(false);
  const [consentFileSelected,setConsentFileSelected] = useState(false);
  const [uploading,setUploading] = useState(false);

  const idRef = useRef()
  const navigate = useNavigate()


  ////
  // const [alignment, setAlignment] = React.useState('');
  // const [value, setValue] = React.useState(dayjs('2014-08-18T21:11:54'));

  // const handleChangegender = (event, newAlignment) => {
  //   setAlignment(newAlignment);
  // };

  const handleClickOpen = () => {
    setOpen(true);
  };
  

  const handleClose = () => {
    setOpen(false);
  };
 
  const showMsg = (msg, severity)=>{
    setStatus({msg, severity, open:true})
  };
  
  //for axios post request
  /* needs be updated*/
  const data ={name:name, regno:regNo,birthDate:birthDate,risk_factors:{gender,smoking,alcohol,betalQuid,smokelessTobacco,familyHistory},
                DOB:birthDate,gender:gender, histo_diagnosis:medicalHistory}

  const fileupload =() =>{
   
      const formData = new FormData();
      formData.append('file', consentFile);
      setUploading(true);

      axios.post('https://example.com/upload', formData, { //to be updated
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }).then((response) => {
        console.log(response);
        setConsentFileUploded(true)
      }).catch((error) => {
        console.error(error);
        setConsentFileUploded(false)
      });

  }

  const handleCreateNewPatient = () =>{

    // const patient_id = idRef.current.value ;
    // if(patient_id === "") {
    //   handleClose()
    //   return;
    // };
  

    axios.post(`${config['path']}/user/patient/add`,data,
        { headers: {
            'Authorization': 'BEARER '+ JSON.parse(sessionStorage.getItem("info")).atoken,
            'email': JSON.parse(sessionStorage.getItem("info")).email,
        }}
        ).then(res=>{
            showMsg(res.data.message, "success");
            handleClose();
            navigate(`/manage/patients/${res.data._id}`);
        }).catch(err=>{
            if(err.response) showMsg(err.response.data.message, "error")
            else alert(err)
            setState(0);
        })
  }

  return (
    <div>
    <Button variant='contained' size='small' endIcon={<PersonAdd/>} sx={{mt:2}} onClick={handleClickOpen}>Add New</Button>   
    <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Add New Patient</DialogTitle>
        <DialogContent>
          {/* <DialogContentText>
            <b>Enter the patients' Details to create new patients account.</b>
          </DialogContentText> */}
          <FormLabel component="legend"><b>Patient Name</b></FormLabel>
          <TextField
            // inputRef={idRef}
            autoFocus
            margin="dense"
            label="Name"
            type='text'
            fullWidth
            variant="standard"
            onChange={e => setName(e.target.value)}
          />
          <FormLabel component="legend"><b>Register Number</b></FormLabel>
          <TextField
            // inputRef={idRef}
            autoFocus
            margin="dense"
            label="Reg No"
            type='text'
            fullWidth
            variant="standard"
            onChange={e => setRegNo(e.target.value)}
          />
          {/* <FormLabel component="legend"><b>Date of Birth</b></FormLabel>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DesktopDatePicker
                // label="Date desktop"
                inputFormat="MM/DD/YYYY"
                value={value}
                renderInput={(params) => <TextField {...params} />}
                onChange ={e => {setBirthDate(value)
                console.log(value.$d)}}
              />
             
          </LocalizationProvider>

          <FormLabel component="legend"><b>Gender</b></FormLabel> */}
        <RadioGroup
          
          row
          aria-labelledby="demo-row-radio-buttons-group-label"
          name="row-radio-buttons-group"
          onChange={e =>setGender(e.target.value)}
        >
            <FormControlLabel value="female" control={<Radio />} label="Female" />
            <FormControlLabel value="male" control={<Radio />} label="Male" />
            <FormControlLabel value="other" control={<Radio />} label="Other" />
        </RadioGroup>

        {/*Risk habits */}
        <FormLabel component="legend"><b>Risk Habits</b></FormLabel>
        <FormGroup >
            <FormControlLabel control={<Checkbox />} label="Smoking"  value="Smoking" 
            onChange ={e =>{setSmoking(e.target.checked)
            console.log(e.target.checked)}} />
            <FormControlLabel control={<Checkbox />} label="Alcohol" value="Alcohol" 
            onChange={e =>setAlcohol(e.target.checked)} />
            <FormControlLabel control={<Checkbox />} label="Betal quid" value="Betal quid" 
            onChange={e =>setBetalquid(e.target.checked)} />
            <FormControlLabel control={<Checkbox />} label="Smokeless tobacco use"value="Smokeless tobacco use" 
            onChange={e =>setSmokelessTobacco(e.target.checked)} />
            <FormControlLabel control={<Checkbox />} label="Family history of cancer" value="Family history of cancer"
            onChange={e =>setFamilyHistory(e.target.checked)} />
          </FormGroup>
        
          <FormLabel component="legend"><b>Medical History</b></FormLabel>
          <TextField
            inputRef={idRef}
            autoFocus
            margin="dense"
            label="medical history"
            type='text'
            fullWidth
            variant="standard"
            onChange={e => setMedicalHistory(e.target.value)}
          
          />
          
          <Stack direction="row" alignItems="center" spacing={2}>
          <FormLabel component="legend"><b>Please Upload Consent form(pdf)</b></FormLabel>
            <Button variant="contained" component="label">
              Upload
              <input hidden accept=".pdf"  type="file"   onChange={e => {setConsentFile(e.target.value)
              setConsentFileSelected(true);
              console.log(e.target.files[0]);
              fileupload();}}  />
            </Button>
           
          </Stack>
          <div>
            {consentFileUploaded?  <Alert severity="success">Conset file Uploaded</Alert>: uploading ? 
            <Alert severity="info">Consent file Uplaoding </Alert> : consentFileSelected ?  <Alert severity="info">Consent file Selected</Alert> 
            : <Alert severity="error">Consent file is required</Alert>}
  
          </div>


        </DialogContent>
        <DialogActions>
            <Button onClick={() =>{handleClose();
                                  setConsentFileSelected(false);
                                  setUploading(false);
                                  }} variant='outlined'>Cancle</Button>
            <LoadingButton onClick={()=>{handleCreateNewPatient()}} loading={state ===1} variant="contained" disabled={state!==0}>Create</LoadingButton>
        </DialogActions>
    </Dialog>
    <NotificationBar status={status} setStatus={setStatus}/>
    </div>
  );
}