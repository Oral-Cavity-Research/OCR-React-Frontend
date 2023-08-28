import React, { useState, useRef, useEffect } from 'react'
import ReactCrop from 'react-image-crop'
import { canvasPreview } from './canvasPreview'
import { useDebounceEffect } from './useDebounceEffect';
import 'react-image-crop/dist/ReactCrop.css'
import { Box, Button, Slider, Stack, Typography } from '@mui/material';
import NotificationBar from '../NotificationBar';
import { LoadingButton } from '@mui/lab';

export default function ImageCropper({imageIndex,data,setData,open,setOpen,selectedFiles, setSelectedFiles}) {
  const imgRef = useRef(null)
  const [crop, setCrop] = useState()
  const [completedCrop, setCompletedCrop] = useState()
  const [status, setStatus] = useState({msg:"",severity:"success", open:false}) 
  const [imgSrc, setImgSrc] = useState();
  const previewCanvasRef = useRef(null)
  const [scale, setScale] = useState(1)
  const [rotate, setRotate] = useState(0)

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

  const handleSave = ()=>{
    if(!completedCrop){
      return;
    }


    previewCanvasRef.current.toBlob((blob) => {
      
      var temp = [...data];
      const url = URL.createObjectURL(blob);
      
      
      var tempFiles = [...selectedFiles];
      temp[imageIndex].croppedImg = url;
      temp[imageIndex].annotation = [];

      var file = new File( [ blob ], selectedFiles[imageIndex].name );
      var dT = new DataTransfer();
      dT.items.add( file );
      tempFiles[imageIndex] = dT.files[0];

      setSelectedFiles(tempFiles);
      setData(temp);
      setOpen(false);

      
      
    });
  }

  const handleClose = () =>{
    setOpen(false)
  }

  useEffect(()=>{
    if(open){
      setImgSrc(data[imageIndex].img);
    }
  },[open])

  return (
    <>
      <div className='page_body'>
        {/********************* side bar **********************/}
        <div className='top_bar'>
          <Stack direction='row' sx={{width:'100%'}} alignItems='center' style={{paddingInline:'10px'}} spacing={1}>
          <div style={{flex: 1}}></div>
          <Box >
            <Stack direction='row' spacing={1}>
              <LoadingButton variant='contained' color='warning' onClick={handleSave}>Save</LoadingButton>
              <Button variant='contained' color='inherit' onClick={handleClose}>Close</Button>
            </Stack>
          </Box>
          </Stack>
        </div>
        {/********************** working area **********************/}
        <div className="work_area">
        <div className='drawing'>{!!imgSrc && (
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
        <Box className='right_bar' sx={{display: { xs: 'none', sm: 'block' } }}>
        <div style={{padding:'10px'}}>
                
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
          </div>
        </Box>
        </div>
        {/********************** info panel **********************/}
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
