import React, {useEffect, useState} from 'react';
import { Box, Stack, TextField, FormControl, MenuItem, Select, 
    List, ListItem, IconButton, ListItemText, InputLabel, Button, ListItemAvatar, Avatar} from '@mui/material';
import { Close} from '@mui/icons-material';
import dayjs from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import NotificationBar from '../NotificationBar';
import { useSelector} from 'react-redux';
import axios from 'axios';
import config from '../../config.json';
import { useParams } from 'react-router-dom';

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

const NewEntry = ({entryID, setEntryID, btnRef, setDone, setLoading}) => {
    const [status, setStatus] = useState({msg:"",severity:"success", open:false});
    const selectorData = useSelector(state => state.data);
    const [userData, setUserData] = useState(selectorData);
    const [riskHabits, setRiskHabits] = useState([]);
    const [habit, setHabit] = useState(habitOptions[0].value);
    const [frequency, setFrequency] = useState(frequencyOptions[0].value);
    const [startTime, setStartTime] = useState(dayjs(new Date()));
    const [endTime, setEndTime] = useState(dayjs(new Date()));
    const [errorStart, setErrorStart] = useState(null);
    const [errorEnd, setErrorEnd] = useState(null);
    const { id } = useParams();

    const removeRisk = (item)=>{
        let newList = riskHabits.filter((habit)=> {return habit !== item})
        setRiskHabits(newList);
    }

    const handleAddRisk = ()=>{
        let newList = riskHabits.filter((newHabit)=> {return newHabit.habit !== habit});
        newList.unshift({habit,frequency});
        setRiskHabits(newList);
    }

    const handleSubmit = (event)=>{
        event.preventDefault();

        setLoading(true);
        const formData = new FormData(event.currentTarget);
        const complaint = formData.get('complaint');
        const findings = formData.get('findings');
        const current_habits = riskHabits;

        if(findings===""|| complaint===""|| errorStart !== null || errorEnd !== null){
            showMsg("Please add required feilds","error");
            return;
        }

        const upload = {
            start_time : new Date(startTime),
            end_time : new Date(endTime),
            complaint,findings,current_habits
        }

        axios.post(`${config['path']}/user/entry/add/${id}`, upload,
        {headers: {
            'Authorization': `Bearer ${userData.accessToken.token}`,
            'email': JSON.parse(sessionStorage.getItem("info")).email,
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

    useEffect(()=>{
        if(entryID !== null){
            setDone(0);
        }
    },[entryID])

    const showMsg = (msg, severity)=>{
        setStatus({msg, severity, open:true})
    }

    return (
        <>
        <Box component='form' noValidate my={3} onSubmit={handleSubmit}>
        <Stack spacing={3}>
            <Stack direction='row' spacing={2}>
                <LocalizationProvider dateAdapter={AdapterDayjs} >
                    <DateTimePicker format='DD/MM/YYYY HH:MM:ss A' label="Start Time"  value={startTime} onChange={(newValue) => setStartTime(newValue)}
                     maxDate={dayjs()} minDate={dayjs().subtract(30, 'day')}
                     componentsProps={{ textField: { size: 'small', fullWidth:true  }}}
                     onError={(newError) => setErrorStart(newError)}
                    />
                </LocalizationProvider>

                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DateTimePicker label="End Time" format='DD/MM/YYYY HH:MM:ss A' value={endTime} onChange={(newValue) => setEndTime(newValue)}
                    componentsProps={{ textField: { size: 'small', fullWidth:true }}}
                    maxDate={dayjs()} minDate={dayjs().subtract(30, 'day')}
                    onError={(newError) => setErrorEnd(newError)}
                    />
                </LocalizationProvider>
            </Stack>
           <TextField fullWidth required size='small' name='complaint' multiline maxRows={4} label="Presenting complaint"/> 
           <TextField fullWidth required size='small' name='findings' multiline maxRows={4} label="Examination findings"/>

           <Stack direction='row' spacing={2}>
           <FormControl fullWidth>
            <InputLabel id="habit-label" size='small' >Habit</InputLabel>
            <Select labelId='habit-label' size='small' label="Habit" value={habit} onChange={(e)=>setHabit(e.target.value)}>
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
            <Button onClick={handleAddRisk} variant='outlined' color='inherit' >Add</Button>
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

            {/* <Box sx={{border:'1px solid lightgray', borderRadius: 1, p:2}}>
                <UploadPage entryID={entryID} hidenButton={hiddenButtonImage}/>
            </Box>
            <Box sx={{border:'1px solid lightgray', borderRadius: 1, p:2}}>
                <UploadTests entryID={entryID} hidenButton={hiddenButtonReport}/>
            </Box> */}
        </Stack>
        <button hidden ref={btnRef} type='submit' >Save Entry</button>
        </Box>
        <NotificationBar status={status} setStatus={setStatus}/>
        </>
    );
};

export default NewEntry;