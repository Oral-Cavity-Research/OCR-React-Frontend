import React, {useState, useEffect} from 'react';
import { Box, Dialog, Grid, IconButton, Slide, Stack, Typography } from '@mui/material';
import { Crop, Delete, Edit } from '@mui/icons-material';
import ImageCropper from './Crop/ImageCropper';
import Canvas from './Annotation/Canvas';
import DeleteImage from './Patients/DeleteImage';
import NotificationBar from './NotificationBar';
import axios from 'axios';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const ImagesSearch = () => {

    const [status, setStatus] = useState({msg:"",severity:"success", open:false}) 
    const [loading, setLoading] = useState(false);
    const [openAnnotation, setOpenAnnotation] = useState(false)
    const [openCrop, setOpenCrop] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);
    const [imageIndex, setImageIndex] = useState({});
    const [data, setData] = useState([]);

    const handleDelete = (index)=>{

        let images = [...data];
        images.splice(index,1);
        setData(images);

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

    useEffect(()=>{

        setLoading(true)
        axios.get(`${process.env.REACT_APP_BE_URL}/image/all`,
        { headers: {
            'Authorization': `Bearer ${userData.accessToken.token}`,
            'email': userData.email,
        }}
        ).then(res=>{
            setData(res.data.images);
        }).catch(err=>{
            if(err.response) showMsg(err.response.data.message, "error")
            else alert(err)
        }).finally(()=>{
            setLoading(false);
        })

    },[])

    return (
        <>
        <Box>
            <Typography sx={{ fontWeight: 700}} variant="h5">Images</Typography>   
        </Box>
        <Box sx={{my:3}}>                   
            <Grid container spacing={2}>
            {[...data].map((item, index) => (
                <Grid item key={index} xs={4} md={3} lg={2}>
                    <div className='imageDiv'>
                        <div className='grid_image'>
                            <img src={`${process.env.REACT_APP_IMAGE_PATH}/${item.image_name}`} alt="Failed to Load"/>
                            {item.annotation.length === 0 && <div className='overlay'>
                            <svg onClick={()=>handleDoubleClick(index)}>
                                <polygon points="0,0,70,0,70,70"/>
                            </svg>
                            </div>}
                            <Stack direction='row' sx={{position:'absolute', bottom:10, right:0}}>
                                <IconButton onClick={()=>handleEdit(index)} size='small' sx={{ color:'transparent'}} className='iconBackground'><Crop fontSize='small'/></IconButton>
                                <IconButton onClick={()=>handleDoubleClick(index)} size='small' sx={{ color:'transparent'}} className='iconBackground'><Edit fontSize='small'/></IconButton>
                                <IconButton onClick={()=>handleDelete(index)} size='small' sx={{ color:'transparent'}} className='iconBackground'><Delete fontSize='small'/></IconButton>
                            </Stack>
                        </div>
                                
                        <Stack direction='column' justifyContent='space-between' alignItems='start' px={1}>
                        <Box>
                            <Typography fontSize='small' color='GrayText'>{item.location} | {item.clinical_diagnosis}</Typography>
                        </Box>
                        </Stack>
                    </div>
                </Grid>
            ))}
            </Grid>  
            <Box sx={{my: 3}}>
                {loading?
                <Typography color='GrayText'>Loading ...</Typography>
                :
                data.length === 0 &&
                <Typography color='GrayText'>No uploaded images</Typography>
                }
            </Box>

            <Dialog fullScreen open={openAnnotation} onClose={handleClose} TransitionComponent={Transition}>
                <Canvas imageIndex={imageIndex} open={openAnnotation} setOpen={setOpenAnnotation} data={data} setData={setData} upload={false}/>
            </Dialog>

            <Dialog fullScreen open={openCrop} onClose={handleClose} TransitionComponent={Transition}>
                <ImageCropper imageIndex={imageIndex} upload={false}
                data={data} setData={setData} 
                open={openCrop} setOpen={setOpenCrop} />
            </Dialog>
        </Box>   
            <DeleteImage open={openDelete} setOpen={setOpenDelete} />
            <NotificationBar status={status} setStatus={setStatus}/> 
        </>
    );
};

export default ImagesSearch;