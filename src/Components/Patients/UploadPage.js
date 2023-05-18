import React, { useState, useRef} from 'react';
import { Button, Typography, Grid, Box, Stack, Dialog, Slide,IconButton} from '@mui/material';
import { Crop, Delete, Edit} from '@mui/icons-material';
import Canvas from '../Annotation/Canvas';
import NotificationBar from '../NotificationBar';
import ImageCropper from '../Crop/ImageCropper';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useSelector} from 'react-redux';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const UploadPage = ({entryID, btnRef, setDone, setLoading}) => {

    const [selectedFiles, setSelectedFiles] = useState([]);
    const [status, setStatus] = useState({msg:"",severity:"success", open:false}) 
    const selectorData = useSelector(state => state.data);
    const [userData, setUserData] = useState(selectorData);
    const [openAnnotation, setOpenAnnotation] = useState(false)
    const [openCrop, setOpenCrop] = useState(false)
    const [imageIndex, setImageIndex] = useState({});
    const [data, setData] = useState([]);
    const hidenInput = useRef();
    const { id } = useParams();

    const selectFiles = (event) => {
        
        if(data.length + event.target.files.length > 12){
            showMsg("Cannot upload more than 12 images at once","error");
            return;
        }

        let images = [...data];
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

        setSelectedFiles(files);       
        setData(images);
    };

    const handleSelection = ()=>{
        hidenInput.current.click();
    }

    const handleDelete = (index)=>{

        let images = [...data];
        let files = [...selectedFiles];

        images.splice(index,1);
        files.splice(index,1);

        setData(images);
        setSelectedFiles(files);

    }

    const handleSubmit = ()=>{

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
       
        axios.post(`${process.env.REACT_APP_BE_URL}/user/upload/images/${entryID}`, form,
        {headers: {
            'Authorization': `Bearer ${userData.accessToken.token}`,
            'Content-Type': 'multipart/form-data',
            'email': userData.email,
        }}
        ).then(res=>{
            setSelectedFiles([]);
            setImageIndex(0);
            setData([]);
            setDone(1);
        }).catch(err=>{
            if(err.response) showMsg(err.response.data.message, "error")
            else alert(err)
        }).finally(()=>{
            setLoading(false);
        })
    }

    const handleDoubleClick = (index)=>{
        setImageIndex(index);
        setOpenAnnotation(true);

    }

    const handleEdit = (index)=>{
        setImageIndex(index);
        setOpenCrop(true);
    }
    
    const handleClose = () => {
        setOpenAnnotation(false);
        setOpenCrop(false);
    };

    const showMsg = (msg, severity)=>{
        setStatus({msg, severity, open:true})
    }

    return (
        <div>       
        <Box>
            <input hidden accept="image/png, image/jpeg" ref={hidenInput} multiple type="file" onChange={selectFiles}/>
            <button hidden ref={btnRef} onClick={handleSubmit}>Save</button>
            <Stack spacing={2} direction='row' sx={{mb:5}}>
                <Button variant='contained' color="success" onClick={handleSelection}>Add images</Button>  
            </Stack>
                    
            <Grid container spacing={2}>
            {[...data].map((item, index) => (
                <Grid item key={index} xs={6} md={3} lg={2}>
                    <div className='imageDiv'>
                        
                        <div className='grid_image' onClick={()=>handleDoubleClick(index)}>
                            <img src={item.img} alt="Failed to Load"/>
                            {item.annotation.length === 0 && <div className='overlay'>
                            <svg>
                                <polygon points="0,0,70,0,70,70"/>
                            </svg>
                            </div>}
                        </div>
                                
                        <Stack direction='column' justifyContent='space-between' alignItems='start' px={1}>
                        <Stack direction='row'>
                            <IconButton onClick={()=>handleEdit(index)} size='small'><Crop fontSize='small'/></IconButton>
                            <IconButton onClick={()=>handleDoubleClick(index)} size='small'><Edit fontSize='small'/></IconButton>
                            <IconButton onClick={()=>handleDelete(index)} size='small'><Delete fontSize='small'/></IconButton>
                        </Stack>
                        <Box>
                            <Typography variant='body2'>{item.clinical_diagnosis} <b>{item.location}</b></Typography>
                            <Typography variant='body2'>Lesions appear: <b>{item.lesions_appear.toString()}</b></Typography>
                        </Box>
                        </Stack>
                    </div>
                </Grid>
            ))}
            </Grid>  

            <Dialog fullScreen open={openAnnotation} onClose={handleClose} TransitionComponent={Transition}>
                <Canvas imageIndex={imageIndex} open={openAnnotation} setOpen={setOpenAnnotation} data={data} setData={setData} upload={true}/>
            </Dialog>

            <Dialog fullScreen open={openCrop} onClose={handleClose} TransitionComponent={Transition}>
                <ImageCropper imageIndex={imageIndex} upload={true}
                data={data} setData={setData} 
                open={openCrop} setOpen={setOpenCrop} 
                selectedFiles={selectedFiles} setSelectedFiles={setSelectedFiles}/>
            </Dialog>
        </Box>   
            <NotificationBar status={status} setStatus={setStatus}/> 
        </div>
    );
};
export default UploadPage;