import React, { useState, useRef, useEffect} from 'react';
import { Button, Grid, Box, Stack, IconButton, Paper, Typography, Drawer} from '@mui/material';
import { AddAPhoto, Close, Crop, Delete, Edit, Upload} from '@mui/icons-material';
import NotificationBar from '../NotificationBar';
import ImageCropper from '../Crop/ImageCropper';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useSelector} from 'react-redux';
import { LoadingButton } from '@mui/lab';
import Canvas from '../Annotation/Canvas';

const UploadImages = ({updateParentData}) => {

    const [selectedFiles, setSelectedFiles] = useState([]);
    const [status, setStatus] = useState({msg:"",severity:"success", open:false}) 
    const selectorData = useSelector(state => state.data);
    const [userData, setUserData] = useState(selectorData);
    const [loading, setLoading] = useState(false);
    const [openCrop, setOpenCrop] = useState(false);
    const [openCanvas, setOpenCanvas] = useState(false);
    const [imageIndex, setImageIndex] = useState({});
    const [data, setData] = useState([]);
    const [imageData, setImageData] = useState([]);
    const [deleting, setDeleting] = useState(false);
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
                    croppedImg: URL.createObjectURL(event.target.files[i]),
                }
                files.unshift(event.target.files[i]);
                images.unshift(jsonData);
            }
        }

        setSelectedFiles(files);       
        setData(images);

        hidenInput.current.value = null;
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

    const handleDeleteUploaded = (index,img_id)=>{

        setDeleting(true);
        
        axios.post(`${process.env.REACT_APP_BE_URL}/image/delete/draft/${id}`,
        {
            image_id: img_id
        },
        {headers: {
            'Authorization': `Bearer ${userData.accessToken.token}`,
            'email': userData.email,
        }}
        ).then(res=>{
            let image_data = [...imageData];
            image_data.splice(index,1);
            setImageData(image_data);
            updateParentData((prevState) => ({
                ...prevState,
                imagesCount: prevState.imagesCount - 1
            }))
        }).catch(err=>{
            if(err.response) showMsg(err.response.data.message, "error")
            else alert(err)
        }).finally(()=>{
            setDeleting(false);
        })

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
            delete item.croppedImg;
            item.telecon_entry_id = id;
            item.status = "draft";
        });

        

        var form = new FormData();
        selectedFiles.forEach((pic, index) => {
            var filename = id+"_"+ Date.now() + "_"+ index + "_" + pic.name;
            form.append('files', pic, filename);
            temp[index].image_name = filename;
        });

        form.append('data',JSON.stringify(temp))
       
        axios.post(`${process.env.REACT_APP_BE_URL}/user/upload/images/${id}`, form,
        {headers: {
            'Authorization': `Bearer ${userData.accessToken.token}`,
            'Content-Type': 'multipart/form-data',
            'email': userData.email,
        }}
        ).then(res=>{
            setSelectedFiles([]);
            setImageIndex(0);
            setData([]);
        }).catch(err=>{
            if(err.response) showMsg(err.response.data.message, "error")
            else alert(err)
        }).finally(()=>{
            setLoading(false);
        })
    }

    const handleEdit = (index)=>{
        setImageIndex(index);
        setOpenCrop(true);
    }

    const handleAnnotation = (index)=>{
        setImageIndex(index);
        setOpenCanvas(true);
    }
    
    const handleClose = () => {
        setOpenCrop(false);
        setOpenCanvas(false);
    };

    const showMsg = (msg, severity)=>{
        setStatus({msg, severity, open:true})
    }

    useEffect(()=>{
        if(loading) return;
        
        axios.get(`${process.env.REACT_APP_BE_URL}/image/get/draft/${id}`,
        {headers: {
            'Authorization': `Bearer ${userData.accessToken.token}`,
            'email': userData.email,
        }}
        ).then(res=>{
            setImageData(res.data?.images);
            updateParentData((prevState) => ({
                ...prevState,
                imagesCount: res.data.images?.length
            }))
        }).catch(err=>{
            if(err.response) showMsg(err.response.data.message, "error")
            else alert(err)
        })
        
    },[loading])

    return (
        <div> 
        <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
            <Box sx={{borderRadius:1, background:'#fbfbfb', border:'2px dashed #ececec', minHeight:'100%'}}>
            <Box p={1}>
            <input hidden accept="image/png, image/jpeg" ref={hidenInput} multiple type="file" onChange={selectFiles}/>
            <Stack spacing={2} direction='row' sx={{mb:3}}>
                <Button size='small' variant='contained' color="inherit" onClick={handleSelection}><AddAPhoto fontSize='small'/></Button> 
                {selectedFiles.length > 0 && <LoadingButton loading={loading} size='small' variant='contained' color="success"  onClick={handleSubmit}><Upload fontSize='small'/></LoadingButton>} 
            </Stack>
            <Grid container spacing={2} >
            {[...data].map((item, index) => (
                <Grid item key={index} xs={4}>
                    <Paper key={index}>
                        <div className='grid_image'>
                            <img src={item.croppedImg} alt="Failed to Load"/> 
                            <Stack direction='row' className='icons'>
                                <IconButton sx={{color:'white'}} className='iconBackground' onClick={()=>handleEdit(index)} size='small'><Crop fontSize='small'/></IconButton>
                                <IconButton sx={{color:'white'}} className='iconBackground' onClick={()=>handleDelete(index)} size='small'><Close fontSize='small'/></IconButton>
                            </Stack>
                        </div>
                    </Paper>
                </Grid>
            ))}
            </Grid>  
            </Box>   
            </Box>
            </Grid>
            <Grid item xs={12} md={6}>
            <Box>
                <Typography sx={{mb:1}}>Uploaded Images:</Typography>
                {
                    imageData.length === 0?
                    <Typography color='GrayText'>No image has been uploaded</Typography>
                    :
                    <Stack direction='column' spacing={1}>
                        <Typography color='red'>Click on the image to annotate</Typography>
                        <Box display='grid' gridTemplateColumns="repeat(12, 1fr)" gap={2}>
                        {[...imageData].map((imageItem, index) => (
                            <Box key={index} gridColumn="span 6">
                                <Paper>
                                    <Box display='grid' gridTemplateColumns="repeat(12, 1fr)">
                                        <Box gridColumn="span 3" onClick={()=>handleAnnotation(index)} className='grid_image' sx={{cursor: 'pointer'}}>
                                            <img src={`${process.env.REACT_APP_IMAGE_PATH}/${imageItem.image_name}`} alt="Failed to Load"/> 
                                        </Box>
                                        <Box gridColumn="span 9" position='relative'p={1}>
                                            <Typography color='GrayText' fontSize={12} sx ={{wordWrap:'break-word'}}>{imageItem.clinical_diagnosis}</Typography>
                                            <Typography color='GrayText' fontSize={12} sx ={{wordWrap:'break-word'}}>{imageItem.location}</Typography>
                                            <Stack position='absolute' bottom={0} right={0} direction='row'>
                                                <IconButton disabled={deleting} onClick={()=>handleDeleteUploaded(index,imageItem._id)} size='small'><Delete fontSize='small'/></IconButton>
                                                {/* <IconButton disabled={deleting} onClick={()=>handleEdit(index)} size='small'><Edit fontSize='small'/></IconButton> */}
                                            </Stack>
                                        </Box>
                                    </Box>
                                </Paper>
                            </Box>
                        ))}
                        </Box>
                    </Stack>
                }
            </Box>
            </Grid>
        </Grid>

            <Drawer anchor={"bottom"} open={openCrop} onClose={handleClose}>
                <Box sx={{height:'100vh'}} >
                    <ImageCropper imageIndex={imageIndex}
                    data={data} setData={setData} 
                    open={openCrop} setOpen={setOpenCrop} 
                    selectedFiles={selectedFiles} setSelectedFiles={setSelectedFiles}/>
                </Box>
            </Drawer>

            <Drawer anchor={"bottom"} open={openCanvas} onClose={handleClose}>
                <Box sx={{height:'100vh'}} >
                    <Canvas handleClose={handleClose} imageIndex={imageIndex} imagedata={imageData} setImagedata={setImageData} regionNames={[{label:'lesion',value:'lesion'}]} diagnosis={[]} locations={[]}/>
                </Box>
            </Drawer>

            <NotificationBar status={status} setStatus={setStatus}/> 
        </div>
    );
};
export default UploadImages;