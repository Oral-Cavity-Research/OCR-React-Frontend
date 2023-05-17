import React, { useRef, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import { ArrowBack, Close,PersonAddAlt1 } from '@mui/icons-material';
import { Box, Stack, Typography,Button, Paper, TextField, FormControl, MenuItem, Select, Checkbox,
    ListItem, IconButton, ListItemText, InputLabel, List} from '@mui/material';
import SignaturePad from 'react-signature-canvas';
import {pdf,Document,Page,Text,Image,View, StyleSheet} from "@react-pdf/renderer";
import { useSelector} from 'react-redux';
import axios from 'axios';
import dayjs from 'dayjs';
import NotificationBar from '../NotificationBar';
import { MuiTelInput } from 'mui-tel-input';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LoadingButton } from '@mui/lab';
import { saveAs } from 'file-saver';

const styles = StyleSheet.create({
    page: {
      color: "black",
      paddingTop: 30,
      paddingLeft: 10,
      paddingRight: 10,
      lineHeight: 2
    },
    caption:{
      padding: 20,
      fontWeight: 700,
      fontSize: 16,
      textAlign: "center"
    },
    written:{
      color: 'darkblue',
    }
    ,
    section: {
      padding: 10,
      paddingLeft: 20,
      fontSize: 11
    },
    viewer: {
      width: "100%", //the pdf viewer will take up all of the width and height
      height: window.innerHeight,
    },
    hr:{
      borderBottom: "1px solide black",
      marginLeft: 20,
      marginRight: 10,
    },
    image:{
      width: "100%",
      height: 200
    }
  });
const familyHistoryOptions = [
    'OSCC',
    'Cancer excluding OSCC'
];
    
const medicalHistoryOptions = [
    'OSCC',
    'OPMD',
    'Cancer excluding OSCC',
];

const genderOptions = [
    {value: "", label: "----"},
    {value: "Female", label: "Female"},
    {value: "Male", label: "Male"}
]

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

    
const Selection = ({name, value, setValue, options, label}) => (
    <FormControl fullWidth>
        <InputLabel id={label} size='small' >{label}</InputLabel>
        <Select fullWidth id={label} label={label} size='small' value={value} name={name} onChange={(e)=>setValue(e.target.value)}        >
            {
                options.map((item, index)=>{
                return(
                    <MenuItem key={index} value={item.value}>{item.label}</MenuItem>
                )})
            }
        </Select>
    </FormControl>
)

const MultiSelection = ({value, setValue, name, options, label}) => (
    <FormControl fullWidth>
    <InputLabel size='small' id={label} >{label}</InputLabel>
    <Select size='small' label={label} multiple fullWidth value={value} onChange={(event)=>{setValue(typeof event.target.value === 'string' ? event.target.value.split(',') :event.target.value);}} renderValue={(selected) => selected.join(', ')} name={name}>
    {options.map((name) => (
        <MenuItem key={name} value={name}>
        <Checkbox checked={value.indexOf(name) > -1} />
        <ListItemText primary={name} />
        </MenuItem>
    ))}
    </Select>
    </FormControl>
)

const PatientNew = () => {

    const [status, setStatus] = useState({msg:"",severity:"success", open:false});
    const selectorData = useSelector(state => state.data);
    const [userData, setUserData] = useState(selectorData);
    const [gender, setGender] = useState("");
    const [loading, setLoading] = useState(false);
    const [contact, setContact] = useState('+94');
    const [name, setName] = useState("");
    const [pId, setPId] = useState("");
    const [riskHabits, setRiskHabits] = useState([]);
    const [habit, setHabit] = useState(habitOptions[0].value);
    const [frequency, setFrequency] = useState(frequencyOptions[0].value);
    const [duration, setDuration] = useState(durationOptions[0].value);
    const [value, setValue] = useState('');
    const [familyHistory, setFamilyHistory] = useState([]);
    const [medicalHistory, setMedicalHistory] =  useState([]);
    const [error, setError] =  useState(null);
    const [image, setImage] = useState(null);
    const signCanvas = useRef({})
    const navigate = useNavigate();
    const hidenInput = useRef();

    const clear = () =>{
        signCanvas.current.clear();
        setImage(null);
      }
  
    const save = () =>{
        setImage(signCanvas.current.toDataURL("image/png"))
    }

    const showMsg = (msg, severity)=>{
        setStatus({msg, severity, open:true})
    }

    const removeRisk = (item)=>{
        let newList = riskHabits.filter((habit)=> {return habit !== item})
        setRiskHabits(newList);
    }

    const handleAddRisk = ()=>{
        let newList = riskHabits.filter((newHabit)=> {return newHabit.habit !== habit});
        newList.unshift({habit,frequency,duration});
        setRiskHabits(newList);
    }

    const handleCancle = ()=>{
        navigate("/manage/my/patients")
    }

    const saveFile = ()=>{
        if(image === null){
            showMsg("Please add the signature","error");
            return;
        }

        pdf(<MyDocument />)
        .toBlob()
        .then((blob) => {
            saveAs(blob, "download.pdf");
            setImage(null);
        });

        
    }

    const handleSubmit = async (event)=>{
        event.preventDefault();

        const form = new FormData(event.currentTarget);

        if(form.get("patient_id")===""||form.get("patient_name")===""||
        error !== null){
            showMsg("Please add required feilds","error");
            return;
        }

        if(image===null){
            showMsg("Please add the patient consent","error");
            return;
        }

        setLoading(true);

        const filename = Math.floor(Math.random() * 101) + "_" + Date.now() + "consentform.pdf"

        const upload = {
            patient_name: form.get("patient_name"),
            patient_id: form.get("patient_id"), 
            risk_factors: riskHabits,
            DOB: new Date(value),
            gender: gender,
            histo_diagnosis: form.get("histo_diagnosis"),
            systemic_disease: form.get("systemic_disease"),
            medical_history: medicalHistory,
            family_history: familyHistory,
            contact_no: contact,
            consent_form: filename
        }

        try {
            const res = await axios.get(`${process.env.REACT_APP_BE_URL}/user/patient/check/${form.get("patient_id")}`,
            { headers: {
                'Authorization': `Bearer ${userData.accessToken.token}`,
                'email': JSON.parse(sessionStorage.getItem("info")).email,
            }}
            )

            if(res.data.exists){
                showMsg("Patient ID already exists", "error");
                setLoading(false);
            }else{
                pdf(<MyDocument />)
                .toBlob()
                .then((blob) => {
                    var data = new FormData();
                    data.append('files', blob, filename);
                    data.append('data',JSON.stringify(upload))
                    uploadData(data);
                    setImage(null);
                });
            }
        } catch (err) {
            if(err.response) showMsg(err.response.data?.message, "error")
            else alert(err)
        }

    }

    const uploadData = (upload)=>{

        axios.post(`${process.env.REACT_APP_BE_URL}/user/upload/patient`, upload,
        { headers: {
            'Authorization': `Bearer ${userData.accessToken.token}`,
            'email': JSON.parse(sessionStorage.getItem("info")).email,
        }}
        ).then(res=>{
            showMsg("Patient is successfully added", "success");
            navigate(`/manage/my/patients/${res.data._id}`);
        }).catch(err=>{
            if(err.response) showMsg(err.response.data.message, "error")
            else alert(err)
        }).finally(()=>{
            setLoading(false);
        })

    }

    const MyDocument = (props)=>{
        return(
          <Document props={props}>
            {/*render a single page*/}
            <Page size="A4" style={styles.page}>
              <View style={styles.caption}>
                <Text>Patient Data Collection Consent Form</Text>
              </View>
              <View style={[styles.section,{marginBottom:10}]}>
                <Text>I, <Text style={styles.written}>{name}</Text> [ <Text style={styles.written}>{pId}</Text> ], hereby consent to the collection of my personal health information by OCR Tool for the purpose of data collection and analysis.</Text>
              </View>
              <View style={[styles.section,{marginBottom:10}]}>
                <Text>The personal health information that will be collected includes:</Text>
                <Text style={styles.itemContent}>- Demographic information such as name, date of birth, address, phone number, and email address</Text>
                <Text style={styles.itemContent}>- Medical history and diagnosis information</Text>
                <Text style={styles.itemContent}>- Treatment and medication information</Text>
                <Text style={styles.itemContent}>- Laboratory and diagnostic test results</Text>
                <Text style={styles.itemContent}>- Intraoral and Extraoral photographs</Text>
              </View>
              <View style={[styles.section,{marginBottom:10}]}>
                <Text>I understand that this information will be used for research purposes and may be shared with other healthcare providers or researchers for the purpose of improving patient care and outcomes. I understand that my personal information will be kept confidential and will not be disclosed to any unauthorized individuals or organizations.</Text>
              </View>
              <View style={[styles.section,{marginBottom:10}]}>
                <Text>I hereby give my consent for the collection and use of my personal health information and oral images for data collection and analysis purposes.</Text>
              </View>
              <View style={styles.section}>
                {image !== null && <Image src={image} style={styles.image}></Image>}
                <Text>Signature:   <Text style={styles.written}>{name}</Text></Text>
                <Text>Date:   <Text style={styles.written}>{dayjs(new Date()).format("DD/MM/YYYY")}</Text></Text>
              </View>
            </Page>
          </Document>
        )
      }
  

    return (
        <div className="inner_content">
        <div>
            <Box className="sticky">    
            <Typography sx={{ fontWeight: 700}} variant="h5">Patient</Typography>    
            
            <Button onClick={() => navigate(-1)} size='small' startIcon={<ArrowBack/>} sx={{p:0}}>Go Back</Button>
            </Box>  

            <Paper sx={{p:2, my:3}}>  
            <Stack direction='row' spacing={2} alignItems='center' sx={{mt:3}}>
                <PersonAddAlt1 sx={{width:'60px',height:'60px'}} color='error'/>
                <Stack direction='column'>
                    <Typography variant='h6'>{name}</Typography>
                </Stack>
            </Stack>
           
            <Box component='form' noValidate onSubmit={handleSubmit} autoComplete='false' >
                <Stack direction='column' spacing={3} sx={{my:3}}>
                    <TextField required size='small' fullWidth name="patient_name" label="Patient Name" onChange={(e)=>setName(e.target.value)}/>
                    <TextField required size='small' fullWidth  name="patient_id" label="Patient NIC" onChange={(e)=>setPId(e.target.value)}/>
                    <LocalizationProvider dateAdapter={AdapterDayjs} >
                        <DatePicker label="DOB" value={value} onChange={(newValue) => setValue(newValue)} format="DD-MM-YYYY" 
                            maxDate={dayjs()} minDate={dayjs().subtract(100, 'year')}
                            componentsProps={{ textField: { size: 'small', fullWidth:true, required:true }}}
                            onError={(newError) => setError(newError)}
                         />
                    </LocalizationProvider>
                    <Selection value={gender} name={'gender'} label={"Gender"} setValue={setGender} options={genderOptions}/>

                    <MuiTelInput value={contact} onChange={(newValue)=>setContact(newValue)} size='small' name='contact_no' placeholder='Phone Number' fullWidth/> 
                    <TextField size='small' name='histo_diagnosis' fullWidth label="Histopathalogical Diagnosis"/>
                    <MultiSelection value={medicalHistory} name={'medical_history'} label={'Previous History of Cancer'} setValue={setMedicalHistory} options={medicalHistoryOptions}/>
                    
                    <MultiSelection value={familyHistory} label={'Family History of Cancer'} name={'family_history'} setValue={setFamilyHistory} options={familyHistoryOptions}/>
                    <TextField fullWidth size='small' name='systemic_disease' label='Systemic Disease'/>
                    <Stack direction='column' spacing={1}>
                        <Stack direction='row' spacing={1} sx={{py:1}} >
                            <Selection value={habit} name={'habit'} label={"Habit"} setValue={setHabit} options={habitOptions}/>
                            <Button size='small' fullWidth onClick={handleAddRisk} variant='contained' color='primary'>Add Habbit</Button>
                        </Stack>

                        <Stack direction='row' spacing={1}>
                            <Selection value={frequency} name={'frequency'} label={"Frequency"} setValue={setFrequency} options={frequencyOptions}/>
                            <Selection value={duration} name={'duration'} label={"Duration"} setValue={setDuration} options={durationOptions}/>
                        </Stack>
                    </Stack>
                   { riskHabits.length >0 &&
                   <List sx={{border:'1px solid lightgray', borderRadius: 1, px:2}}>
                        {
                            riskHabits.map((item, index)=>{
                                return(
                                    <ListItem key={index} disableGutters disablePadding
                                        secondaryAction={
                                            <IconButton edge="end" onClick={()=>removeRisk(item)}>
                                            <Close fontSize='small' color='error' />
                                            </IconButton>
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
                    </List>}
                </Stack>
                <Box sx={{border:'2px dashed lightgray', background:'#fbfbfb', borderRadius:1, p:2, mt:5}}>
                <Typography color='red' variant="h6"><b>Patient Data Collection Consent Form</b></Typography>
                <br/>
                <Typography>I, <span style={{color:'var(--primary-color)'}}>{name}</span> [ <span style={{color:'var(--primary-color)'}}>{pId}</span> ], hereby consent to the collection of my personal health information by OCR Tool for the purpose of data collection and analysis.</Typography>
                <br/>
                <Typography>The personal health information that will be collected includes:</Typography>
                <ul>
                    <li><Typography>Demographic information such as name, date of birth, address, phone number, and email address</Typography></li>
                    <li><Typography>Medical history and diagnosis information</Typography></li>
                    <li><Typography>Treatment and medication information</Typography></li>
                    <li><Typography>Laboratory and diagnostic test results</Typography></li>
                    <li><Typography>Intraoral and Extraoral photographs</Typography></li>
                </ul>
            
                <Typography>I understand that this information will be used for research purposes and may be shared with other healthcare providers or researchers for the purpose of improving patient care and outcomes. I understand that my personal information will be kept confidential and will not be disclosed to any unauthorized individuals or organizations.</Typography>
                <br/>
                <Typography>I hereby give my consent for the collection and use of my personal health information and oral images for data collection and analysis purposes.</Typography>
                <div style={{marginTop: 20}}>
                <Typography>Patient signature:</Typography>
               
                <SignaturePad ref={signCanvas} canvasProps={{className: "sigPad"}}/>  
              
                <Stack direction='row' justifyContent='space-between' >
                <Button onClick={save}>Add Signature</Button>
                <Button onClick={clear}>Clear Signature</Button>
                </Stack>
                </div>
                </Box>                
                <Stack direction='row' spacing={2} my={5}>
                    <LoadingButton loading={loading} disabled={image===null} type='submit' variant='contained'>Save</LoadingButton>
                    <Button variant='outlined' onClick={handleCancle}>Cancle</Button>
                </Stack>
            </Box>
            </Paper>
            <NotificationBar status={status} setStatus={setStatus}/>
        </div>
    </div>
    );
};

export default PatientNew;