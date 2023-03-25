import React, {useState} from 'react';
import NotificationBar from '../NotificationBar';
import { Box, Stack, TextField, Button, FormControl, MenuItem, Select, Checkbox,
    Table, TableBody, TableRow, TableCell, CircularProgress, List, ListItem, IconButton, ListItemText, InputLabel, Typography} from '@mui/material';
import {LoadingButton } from '@mui/lab';
import config from '../../config.json'
import axios from 'axios';
import { useSelector} from 'react-redux';
import { MuiTelInput } from 'mui-tel-input';
import {Close, Done, Edit} from '@mui/icons-material';
import dayjs from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { age } from '../utils';

const familyHistoryOptions = [
    'OSCC',
    'Cancer excluding OSCC'
];

const medicalHistoryOptions = [
    'OSCC',
    'OPMD',
    'Cancer excluding OSCC',
];

const BrowserInput = function BrowserInput(props) {
    const { inputProps, InputProps, ownerState, inputRef, error, ...other } = props;
  
    return (
      <Box sx={{ display: 'flex', alignItems: 'center'}} ref={InputProps?.ref}>
        <input ref={inputRef} {...inputProps} {...other} style={{border:'none', outline:'none', width:'11ch',  fontSize:'0.875rem', padding:0}}/>
        {InputProps?.endAdornment}
      </Box>
    );
};

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

const EditableSelection = ({disabled, value, setValue, name, options}) => (
    <FormControl fullWidth>
        <Select variant='standard' disabled={disabled} value={value} name={name} onChange={(e)=>setValue(e.target.value)}
         sx={{
            "& .MuiInputBase-input.Mui-disabled": {
            WebkitTextFillColor: "#000000"}, 
            "& .MuiInput-input": {
                paddingY: 2,
                fontWeight:400,
                fontSize: "0.875rem"
            }
        }}
        disableUnderline ={disabled}
        >
            {
                options.map((item, index)=>{
                return(
                    <MenuItem key={index} value={item.value}>{item.label}</MenuItem>
                )})
            }
        </Select>
    </FormControl>
)

const EditableMultiSelection = ({disabled, value, setValue, name, options}) => (
    <Select multiple fullWidth value={value} onChange={(event)=>{setValue(typeof event.target.value === 'string' ? event.target.value.split(',') :event.target.value);}} renderValue={(selected) => selected.join(', ')}
    variant='standard' name={name}
    disabled={disabled}
    sx={{
        "& .MuiInputBase-input.Mui-disabled": {
        WebkitTextFillColor: "#000000"}, 
        "& .MuiInput-input": {
            paddingY: 2,
            fontWeight:400,
            fontSize: "0.875rem"
        }
    }}
    disableUnderline ={disabled}>
    {options.map((name) => (
        <MenuItem key={name} value={name}>
        <Checkbox checked={value.indexOf(name) > -1} />
        <ListItemText primary={name} />
        </MenuItem>
    ))}
    </Select>
)

const PatientProfile = ({data}) => {
    const [status, setStatus] = useState({msg:"",severity:"success", open:false})
    const [loading, setLoading] = useState(false);
    // const [category, setCategory] = useState(data.category);
    const [gender, setGender] = useState(data.gender);
    const userData = useSelector(state => state.data);
    const [ editEnable, setEditEnable] = useState(true);
    const [number, setNumber] = useState(data.contact_no);
    const [riskHabits, setRiskHabits] = useState(data.risk_factors);
    const [habit, setHabit] = useState(habitOptions[0].value);
    const [frequency, setFrequency] = useState(frequencyOptions[0].value);
    const [duration, setDuration] = useState(durationOptions[0].value);
    const [value, setValue] = useState(dayjs(data.DOB));
    const [familyHistory, setFamilyHistory] = React.useState(data.family_history);
    const [medicalHistory, setMedicalHistory] = React.useState(data.medical_history);

    const handleChange = (newValue) => {
        setNumber(newValue)
    }
      
    const onCancel = ()=>{
        setEditEnable(!editEnable)
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

    const handleSave = (event)=>{
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const patient_name = formData.get('patient_name');
        const gender = formData.get('gender');
        const histo_diagnosis = formData.get('histo_diagnosis');
        const systemic_disease = formData.get('systemic_disease');
        const contact_no = formData.get('contact_no');
        
        const updated = {
            patient_name,gender,DOB:new Date(value),histo_diagnosis,contact_no, systemic_disease,
            family_history: familyHistory,
            medical_history: medicalHistory,
            risk_factors: riskHabits
        }

        setLoading(true);

        axios.post(`${config['path']}/user/patient/update/${data._id}`, updated,
        { headers: {
            'Authorization': `Bearer ${userData.accessToken.token}`,
            'email': JSON.parse(sessionStorage.getItem("info")).email,
        }}
        ).then(res=>{
            showMsg("Patient details updated successfully", "success");
            setEditEnable(!editEnable)
        }).catch(err=>{
            if(err.response) showMsg(err.response.data.message, "error")
            else alert(err)
        }).finally(()=>{
            setLoading(false);
        })

    }

    const showMsg = (msg, severity)=>{
        setStatus({msg, severity, open:true})
    }


    return (
        <div>
         <Stack direction='row' spacing={2} justifyContent='flex-end'>
            <Button variant='contained' endIcon={<Edit/>} onClick={() => setEditEnable(!editEnable)}
            style={{ display: !(editEnable) ? 'none' : undefined }}>Edit</Button>
            <Button style={{ display: editEnable ? 'none' : undefined }} variant='contained' onClick={onCancel}>Cancel</Button>
        </Stack>
        <Box component="form" noValidate onSubmit={handleSave} sx={{ mt: 1 }}>
            <Table  sx={{border: '1px solid lightgray'}}>
                <TableBody>
                    <TableRow>
                        <TableCell>ID:</TableCell>
                        <TableCell sx={{py:0}}>{data.patient_id}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Name:</TableCell>
                        <TableCell sx={{py:0}}>
                            <EditableText disabled={editEnable} defaultValue={data.patient_name} name={'patient_name'}/>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>DOB:</TableCell>
                        <TableCell sx={{py:0}}>
                        <LocalizationProvider dateAdapter={AdapterDayjs} >
                            <DatePicker value={value} onChange={(newValue) => setValue(newValue)} readOnly={editEnable} disableOpenPicker={editEnable} format="DD-MM-YYYY"
                                slots={{
                                    textField: BrowserInput,
                                }} />
                        </LocalizationProvider>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Age:</TableCell>
                        <TableCell sx={{py:0}}>{age(value)}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Gender:</TableCell>
                        <TableCell sx={{py:0}}>
                        <EditableSelection disabled={editEnable} value={gender} name={'gender'} setValue={setGender} options={genderOptions}/>
                        </TableCell>
                    </TableRow>
                    {/* <TableRow>
                        <TableCell>Category:</TableCell>
                        <TableCell sx={{py:0}}>
                        <EditableSelection disabled={editEnable} value={category} name={'category'} setValue={setCategory} options={categoryOptions}/>
                        </TableCell>
                    </TableRow> */}
                    <TableRow>
                        <TableCell>Contact No:</TableCell>
                        <TableCell sx={{py:0}}>
                        <MuiTelInput disabled={editEnable} value={number} onChange={handleChange} size='small' name='contact_no' placeholder='Phone Number' variant='standard' fullWidth
                        sx={{
                            "& .MuiInputBase-input.Mui-disabled": {
                            WebkitTextFillColor: "#000000",
                        },"& .MuiInput-input": {
                            paddingY: 2,
                            fontFamily: 'Segoe UI',
                            fontSize: 15
                        }
                        }}
                        InputProps={{
                            disableUnderline: editEnable
                        }}
                        /> 
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Histo Diagnosis</TableCell>
                        <TableCell sx={{py:0}}>
                        <EditableText disabled={editEnable} defaultValue={data.histo_diagnosis} name={'histo_diagnosis'}/>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Previous history of cancer</TableCell>
                        <TableCell sx={{py:0}}>
                        <EditableMultiSelection disabled={editEnable} value={medicalHistory} name={'medical_history'} setValue={setMedicalHistory} options={medicalHistoryOptions}/>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Family history of cancer</TableCell>
                        <TableCell sx={{py:0}}>
                        <EditableMultiSelection disabled={editEnable} value={familyHistory} name={'family_history'} setValue={setFamilyHistory} options={familyHistoryOptions}/>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Systemic disease</TableCell>
                        <TableCell sx={{py:0}}>
                        <EditableText disabled={editEnable} defaultValue={data.systemic_disease} name={'systemic_disease'}/>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Risk Habits</TableCell>
                        <TableCell sx={{py:0}}>
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
                            riskHabits.map((item, index)=>{
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
                    <TableRow>
                        <TableCell>Consent Form</TableCell>
                        <TableCell sx={{py:0, "&:hover" :{color:'var(--primary-color)'}}}><a href={`${config["consentform_path"]}/`+data.consent_form} target="_blank">Consent Form</a></TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Created At</TableCell>
                        <TableCell sx={{py:0}}>{(data.createdAt?.split("T"))[0]}</TableCell>
                    </TableRow>
                </TableBody>
            </Table>

            { !editEnable && <LoadingButton sx={{my:2}}
            loadingIndicator={<CircularProgress color="inherit" size={16}/>}
            loading={loading} variant='contained' type="submit">Save</LoadingButton>}
           
            </Box>
        <NotificationBar status={status} setStatus={setStatus}/>
        </div>
    );
};

export default PatientProfile;