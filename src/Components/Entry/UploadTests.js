import React, { useState, useRef, useEffect} from 'react';
import { Button, Box, Stack, IconButton, List, ListItem, ListItemText, Grid, Typography, Paper} from '@mui/material';
import { Close, Delete, NoteAdd, PictureAsPdf, Upload} from '@mui/icons-material';
import NotificationBar from '../NotificationBar';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useSelector} from 'react-redux';
import { LoadingButton } from '@mui/lab';

function realReportName(filename) {
    try {
      return filename.split("_").slice(3).join("_");
    } catch (error) {
      return "Test Report";
    }
}

const UploadTests = ({updateParentData}) => {

    const [selectedFiles, setSelectedFiles] = useState([]);
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [deleting, setDeleting] = useState(false);
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
        hidenInput.current.value = null;
    };

    const handleSelection = ()=>{
        hidenInput.current.click();
    }

    const handleDelete = (index)=>{
        let files = [...selectedFiles];
        files.splice(index,1);
        setSelectedFiles(files);
    }

    const handleDeleteUploaded = (index,report_id)=>{

        setDeleting(true);
        
        axios.post(`${process.env.REACT_APP_BE_URL}/report/delete/draft/${id}`,
        {
            report_id: report_id
        },
        {headers: {
            'Authorization': `Bearer ${userData.accessToken.token}`,
            'email': userData.email,
        }}
        ).then(res=>{
            let report_data = [...reportData];
            report_data.splice(index,1);
            setReportData(report_data);
            updateParentData((prevState) => ({
                ...prevState,
                reportsCount: prevState.reportsCount - 1
            }))
        }).catch(err=>{
            if(err.response) showMsg(err.response.data.message, "error")
            else alert(err)
        }).finally(()=>{
            setDeleting(false);
        })

    }

    const handleSubmit = ()=>{

        if(selectedFiles.length === 0){
            showMsg("Please Select the test reports", "error");
            return;
        }

        setLoading(true);

        const temp =  [];
        selectedFiles.forEach(item =>{ 
            temp.push({
                telecon_entry_id : id
            })
        });

        var form = new FormData();
        selectedFiles.forEach((report, index) => {
            var filename = id+"_"+ Date.now() + "_"+ index + "_" + report.name;
            temp[index].report_name = filename;
            form.append('files', report, filename);
        });

        form.append('data',JSON.stringify(temp))

        axios.post(`${process.env.REACT_APP_BE_URL}/user/upload/reports/${id}`, form,
        {headers: {
            'Authorization': `Bearer ${userData.accessToken.token}`,
            'Content-Type': 'multipart/form-data',
            'email': userData.email,
        }}
        ).then(res=>{
            setSelectedFiles([]);
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

    useEffect(()=>{
        if(loading) return;
        
        axios.get(`${process.env.REACT_APP_BE_URL}/report/get/draft/${id}`,
        {headers: {
            'Authorization': `Bearer ${userData.accessToken.token}`,
            'email': userData.email,
        }}
        ).then(res=>{
            setReportData(res.data.reports);
            updateParentData((prevState) => ({
                ...prevState,
                reportsCount: res.data.reports?.length
            }))
        }).catch(err=>{
            if(err.response) showMsg(err.response?.data?.message, "error")
            else alert(err)
        })
        
    },[loading])

    return (
        <div>   
        <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
            <Box sx={{borderRadius:1, background:'#fbfbfb', border:'2px dashed #ececec', minHeight:'100%'}}>
            <Box p={1}>
                <input hidden accept="application/pdf" ref={hidenInput} multiple type="file" onChange={selectFiles}/>
                <Stack spacing={2} direction='row'>
                    <Button size='small' variant='contained' color='inherit' onClick={handleSelection}><NoteAdd fontSize='small'/></Button>
                    {selectedFiles.length>0 && <LoadingButton loading={loading} size='small' variant='contained' color='success' onClick={handleSubmit}><Upload fontSize='small'/></LoadingButton> }
                </Stack>
                        
                { selectedFiles.length > 0 &&
                <Box sx={{p:2}}>
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
                        secondary={Math.round(item.size/1000)+" KB"} 
                    />
                    </ListItem>
                ))}
                </List>
                </Box>
                } 
            </Box>    
            </Box>
            </Grid>
            <Grid item xs={12} md={6}>
            <Box>
                <Typography sx={{mb:1}}>Uploaded Test Reports:</Typography>
                {
                    reportData.length === 0?
                    <Typography color='GrayText'>No report has been uploaded</Typography>
                    :
                    <Box display='grid' gridTemplateColumns="repeat(12, 1fr)" gap={2}>
                    {[...reportData].map((reportItem, index) => (
                        <Box key={index} gridColumn="span 6">
                            <Paper>
                                <Box display='grid' gridTemplateColumns="repeat(12, 1fr)">
                                    <Box gridColumn="span 3" className='grid_image'>
                                        <PictureAsPdf fontSize='large' color='error'/>
                                    </Box>
                                    <Box gridColumn="span 9" position='relative' p={1}>
                                        <Typography fontSize={12} sx={{"&:hover" :{color:'var(--primary-color)'}, wordWrap:'break-word'}}><a href={`${process.env.REACT_APP_REPORT_PATH}/`+ reportItem.report_name} target="_blank">{realReportName(reportItem.report_name)}</a></Typography>
                                        <Stack position='absolute' bottom={0} right={0} direction='row'>
                                            <IconButton disabled={deleting} onClick={()=>handleDeleteUploaded(index,reportItem._id)} size='small'><Delete fontSize='small'/></IconButton>
                                            {/* <IconButton disabled={deleting} onClick={()=>handleEdit(index)} size='small'><Edit fontSize='small'/></IconButton> */}
                                        </Stack>
                                    </Box>
                                </Box> 
                            </Paper>
                        </Box>
                    ))}
                    </Box>
                }
            </Box>
            </Grid>
        </Grid>
            <NotificationBar status={status} setStatus={setStatus}/> 
        </div>
    );
};
export default UploadTests;