import React, { useState, useRef, useEffect } from 'react'
import ReactCrop from 'react-image-crop'
import { canvasPreview } from './canvasPreview'
import { useDebounceEffect } from './useDebounceEffect';
import 'react-image-crop/dist/ReactCrop.css'
import { Button, Slider, Stack, Typography } from '@mui/material';
import { Warning } from '@mui/icons-material';
import NotificationBar from '../NotificationBar';
import { LoadingButton } from '@mui/lab';
import axios from 'axios';
import { useSelector } from 'react-redux';

export default function ImageCropper({imageIndex,data,setData,open,setOpen,selectedFiles, setSelectedFiles, upload}) {
  const imgRef = useRef(null)
  const [crop, setCrop] = useState()
  const [completedCrop, setCompletedCrop] = useState()
  const [state, setState] = useState(0)
  const [status, setStatus] = useState({msg:"",severity:"success", open:false}) 
  const [imgSrc, setImgSrc] = useState();
  const previewCanvasRef = useRef(null)
  const [scale, setScale] = useState(1)
  const [rotate, setRotate] = useState(0)
  const userData = useSelector(state => state.data);

  useDebounceEffect(
    async () => {
      if (
        completedCrop?.width &&
        completedCrop?.height &&
        imgRef.current &&
        previewCanvasRef.current
      ) {
        canvasPreview(
          imgRef.current,
          previewCanvasRef.current,
          completedCrop,
          scale,
          rotate,
        )
      }
    },
    100,
    [completedCrop, scale, rotate],
  )

  const showMsg = (msg, severity)=>{
    setStatus({msg, severity, open:true})
  }

  const handleSave = ()=>{
    if(!completedCrop){
      return;
    }

    setState(1);

    previewCanvasRef.current.toBlob((blob) => {
      
      var temp = [...data];
      const url = URL.createObjectURL(blob);
      
      if(upload){
        var tempFiles = [...selectedFiles];
        temp[imageIndex].img = url;
        temp[imageIndex].annotation = [];

        var file = new File( [ blob ], selectedFiles[imageIndex].name );
        var dT = new DataTransfer();
        dT.items.add( file );
        tempFiles[imageIndex] = dT.files[0];

        setState(0)
        setSelectedFiles(tempFiles);
        setData(temp);
        setOpen(false);

      }else{
        
        var file = new File( [ blob ], data[imageIndex].image_name);
        var dT = new DataTransfer();
        dT.items.add( file );
        var tempFile = dT.files[0];

        var form = new FormData();
        var filename = data[imageIndex].image_name;
        form.append('files', tempFile , filename);
        form.append('data', JSON.stringify({_id:data[imageIndex]._id}));
       
        
        axios.post(`${process.env.REACT_APP_BE_URL}/images/update`, form,
        { headers: {
            'Authorization': `Bearer ${userData.accessToken.token}`,
            'Content-Type': 'multipart/form-data',
            'email': userData.email,
            
        }}).then(res=>{
          showMsg("Image updated succesfully", "success")
          temp[imageIndex].annotation = [];
          setData(temp);
          setOpen(false);
          
        }).catch(err=>{
            if(err.response) showMsg(err.response.data.message, "error");
            else alert(err)
        }).finally(()=>{
            setState(0);
            
        })
      }
      
    });
  }

  const handleClose = () =>{
    setOpen(false)
  }

  useEffect(()=>{
    if(open){
      if(upload){
        setImgSrc(data[imageIndex].img);
      }else{
        setImgSrc(`${process.env.REACT_APP_IMAGE_PATH}/${data[imageIndex].image_name}`);
      }
    }
  },[open])

  return (
    <>
      <div className='page_body'>
        <div className='side_bar'>
          <div className="Crop-Controls">
                 
          <Stack direction='column' spacing={2}>
            <LoadingButton variant='contained' color='warning' onClick={handleSave}>Save</LoadingButton>
            <Button variant='contained' color='inherit' onClick={handleClose}>Close</Button>

            <div style={{width:'100%'}}>
              <Typography color='white'>Scale: </Typography>
              <Slider
                defaultValue={1}
                valueLabelDisplay="auto"
                onChange={(e, value) => setScale(Number(value))}
                step={0.2}
                min={0.2}
                max={3}
              />
            </div>
            <div style={{width:'100%'}}>
              <Typography color='white'>Rotate: </Typography>
              <Slider
                defaultValue={0}
                valueLabelDisplay="auto"
                onChange={(e, value) => setRotate(Math.min(180, Math.max(-180, Number(value))))}
                step={1}
                min={-180}
                max={180}
              />
            </div>
          </Stack>
        </div>
        </div>
        <div className='work_area'>
          <Stack direction='row' spacing={1} sx={{mb: 1}}>
            <Warning sx={{color: "orange"}}/>
            <Typography>After cropping the image current annotations will be removed.</Typography>
          </Stack>
          {!!imgSrc && (
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => {setCompletedCrop(c)}}
              minWidth={100} minHeight={100}
            >
              <img
                ref={imgRef}
                alt="Crop me"
                crossOrigin="anonymous"
                src={imgSrc}
                style={{ transform: `scale(${scale}) rotate(${rotate}deg)` }}
              />
            </ReactCrop>
          )}
        </div>
      </div>
       <div>
        {!!completedCrop && (
          <canvas
            ref={previewCanvasRef}
            style={{
              display: 'none',
              objectFit: 'contain',
              width: completedCrop.width,
              height: completedCrop.height,
            }}
          />
        )}
      </div>
      <NotificationBar status={status} setStatus={setStatus}/>
    </>
  )
}
