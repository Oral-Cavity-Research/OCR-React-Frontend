import React, { useState, useRef} from 'react';
import { Button, Box, Stack, IconButton, List, ListItem, ListItemText} from '@mui/material';
import { Close} from '@mui/icons-material';
import NotificationBar from '../NotificationBar';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useSelector} from 'react-redux';

const UploadTests = ({entryID, btnRef, setDone, setLoading}) => {

    const [selectedFiles, setSelectedFiles] = useState([]);
    const [status, setStatus] = useState({msg:"",severity:"success", open:false}) 
    const selectorData = useSelector(state => state.data);
    const [userData, setUserData] = useState(selectorData);
    const hidenInput = useRef();
    const { id } = useParams();

    const selectFiles = (event) => {
        
        if(selectedFiles.length + event.target.files.length > 12){
            showMsg("Cannot upload more than 12 files at once","error");
            return;
        }

        let files = [...selectedFiles];

        for (let i = 0; i < event.target.files.length; i++) {
            if(event.target.files[i].size < 25*1000*1000){
                files.unshift(event.target.files[i]);
            }
        }

        setSelectedFiles(files);
    };

    const handleSelection = ()=>{
        hidenInput.current.click();
    }

    const handleDelete = (index)=>{
        let files = [...selectedFiles];
        files.splice(index,1);
        setSelectedFiles(files);
    }

    const handleSubmit = ()=>{

        if(selectedFiles.length===0){
            showMsg("Please Select the test reports", "error");
            return;
        }

        setLoading(true);

        const temp =  [];
        selectedFiles.forEach(item =>{ 
            temp.push({
                telecon_entry_id : entryID
            })
        });

        var form = new FormData();
        selectedFiles.forEach((report, index) => {
            var filename = id+"_"+ Date.now() + "_"+ index + "_" + report.name;
            temp[index].report_name = filename;
            form.append('files', report, filename);
        });

        form.append('data',JSON.stringify(temp))

        axios.post(`${process.env.REACT_APP_BE_URL}/user/upload/reports/${entryID}`, form,
        {headers: {
            'Authorization': `Bearer ${userData.accessToken.token}`,
            'Content-Type': 'multipart/form-data',
            'email': userData.email,
        }}
        ).then(res=>{
            setSelectedFiles([]);
            setDone(2)
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
        <Box>
            <input hidden accept="application/pdf" ref={hidenInput} multiple type="file" onChange={selectFiles}/>
            <button hidden ref={btnRef} onClick={handleSubmit}/>
            <Stack spacing={2} direction='row' sx={{mb:5}}>
                <Button variant='contained' color='success' onClick={handleSelection}>Add Reports</Button>
            </Stack>
                    
            { selectedFiles.length > 0 &&
            <Box sx={{border:'1px solid lightgray', borderRadius:1, p:2}}>
            <List disablePadding >
            {[...selectedFiles].map((item, index) => (
                    <ListItem key={index} disablePadding
                    secondaryAction={
                        <IconButton edge="end" onClick={()=>handleDelete(index)}>
                        <Close fontSize='small' color='error' />
                        </IconButton>
                    }
                >
                <ListItemText
                    primary={item.name}
                    secondary={item.size} 
                />
                </ListItem>
            ))}
            </List>
            </Box>
            } 
        </Box>   
            <NotificationBar status={status} setStatus={setStatus}/> 
        </div>
    );
};
export default UploadTests;