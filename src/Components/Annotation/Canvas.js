import React, { useRef, useEffect, useState } from 'react';
import {Box, Button, ButtonGroup, Select, MenuItem, Stack, Typography, FormControl, InputLabel} from '@mui/material';
import ButtonPanel from './ButtonPanel';
import axios from 'axios';
import { useSelector} from 'react-redux';
import { LoadingButton } from '@mui/lab';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import NotificationBar from '../NotificationBar';

const diagnosis =["Normal","OLP / LR", "OSMF/OSF","VBD", "RAU","MRG","FEP","PVL","SLE","OFG","OCA"]
const locations = ["Lips","Upper labial mucosa","Lower labial mucosa","L/S Buccal mucosa","R/S Buccal mucosa",
"Palate","Tongue-dorsum","Tongue-ventral","Alveolar ridge","Gingiva","Flour of the mouth"]
// global variables 
// todo: check whether we could use useStates instead

const mouse = {x : 0, y : 0, button : 0, cursor: 'default'};
var regions = []
var isDragging = false;
var isSelected = false;
var isDrawing = true ;
var polygon
var canvas
var ctx = null
var selectedRegion
const defaultSettings = {type:"Lesion", color: 'rgb(0,255,0)'};
// return points as Json
const point = (x,y) => ({x,y});

// draw circle around given point
function drawCircle(ctx, pos,zoomLevel,size=4){
  ctx.strokeStyle = "red";
  ctx.fillStyle = "red";
  ctx.beginPath();
  ctx.arc((pos.x)*zoomLevel,(pos.y)*zoomLevel,size,0,Math.PI *2);
  ctx.fill();
  ctx.stroke();
}

// polygon class
class Polygon{
  constructor(ctx, color, type){
    this.ctx = ctx;
    this.isSelected = false;
    this.points = [];
    this.mouse = {lx: 0, ly: 0}
    this.activePoint = undefined;
    this.dragging = false;
    this.completed = false;
    this.markedForDeletion = false;
    this.color = color;
    this.transcolor =  color.replace(')', ', 0.6)').replace('rgb', 'rgba')
    this.type = type;
    this.scale = 1;
  }
  addPoint(p){ 
    this.points.push(point((p.x)/this.scale,(p.y)/this.scale)) 
  }
  isPointInPoly(pt){
    for(var c = false, i = -1, l = this.points.length, j = l - 1; ++i < l; j = i)
        ((this.points[i].y <= (pt.y)/this.scale && (pt.y)/this.scale < this.points[j].y) || (this.points[j].y <= (pt.y)/this.scale && (pt.y)/this.scale <this.points[i].y))
        && ((pt.x)/this.scale < (this.points[j].x - this.points[i].x) * ((pt.y)/this.scale - this.points[i].y) / (this.points[j].y - this.points[i].y) + this.points[i].x)
        && (c = !c);
    return c;
  }
  draw() {
      this.ctx.beginPath();
      this.ctx.lineWidth = 2;
      this.ctx.strokeStyle = this.color;
      this.ctx.fillStyle = this.transcolor
      for (const p of this.points) { this.ctx.lineTo((p.x)*this.scale,(p.y)*this.scale) }
      if(this.completed) this.ctx.closePath();
      this.ctx.stroke();
  }
  closest(pos, dist = 8) {
    var i = 0, index = -1;
    dist *= dist;
    for (const p of this.points) {
        var x = pos.x - (p.x)*this.scale;
        var y = pos.y - (p.y)*this.scale;
        var d2 =  x * x + y * y;
        if (d2 < dist) {
            dist = d2;
            index = i;
        }
        i++;
    }
    if (index > -1) { return this.points[index] }
  }
  update( drawingMode, defaultColor, defaultType){
      // line following the cursor
      if(!this.completed && this.points.length !== 0){
        isDrawing = true
        this.ctx.strokeStyle = this.color;
        this.ctx.beginPath();
        this.ctx.moveTo(mouse.x,mouse.y)
        this.ctx.lineTo((this.points[this.points.length-1].x)*this.scale,(this.points[this.points.length-1].y)*this.scale)
        this.ctx.stroke();
      }else{
        isDrawing = false;
      }

      // if not dragging get the closest point to mouse
      if (!this.dragging) {  this.activePoint = this.closest(mouse) }

      // check if connecting to the first point
      if (!this.completed && this.points?.length> 2 && this.activePoint === this.points[0]) { drawCircle(this.ctx, this.points[0], this.scale, 4) }

      // if not ccompleted and mouse button clicked on first point complete the region
      if(!this.completed && this.points?.length> 2 && this.activePoint === this.points[0] && mouse.button){
        this.completed = true

        polygon = new Polygon(ctx, defaultColor, defaultType)
        polygon.scale = this.scale;
        regions.push(polygon)

      // if not dragging and mouse button clicked and when other regions are not selected add a point
      }else if (!isDragging && !isSelected && mouse.button && !this.completed && drawingMode) {
          this.addPoint(mouse);
          mouse.button = false;
      // if completed and dragging update the points
      } else if(this.activePoint && this.completed && this.isSelected ) {
          if (mouse.button) {
              isDragging = true;
              if(this.dragging) {
                this.activePoint.x += (mouse.x)/this.scale - this.mouse.lx;
                this.activePoint.y += (mouse.y)/this.scale - this.mouse.ly;
              } else {this.dragging = true}
          } else {
            this.dragging = false
            isDragging = false;
          }
      }
      this.draw();

      // indicate selection
      if(this.isSelected){
        for (const p of this.points) { drawCircle(this.ctx, p, this.scale) }
        //var inside = this.isPointInPoly(mouse)
        if(this.activePoint ) mouse.cursor = "move"
      }

      this.mouse.lx = (mouse.x)/this.scale;
      this.mouse.ly = (mouse.y)/this.scale;
  }
  show(){
    this.ctx.beginPath();
    this.ctx.lineWidth = 2;
    this.ctx.strokeStyle = this.color;
    this.ctx.fillStyle = this.color.replace(')', ', 0.6)').replace('rgb', 'rgba');
    for (const p of this.points) { this.ctx.lineTo((p.x)*this.scale,(p.y)*this.scale) }
    if(this.completed) this.ctx.closePath();
    this.ctx.stroke();
  }
}

const Canvas = ({imageIndex, imagedata, setImagedata, handleClose}) => {  
  
  const [size, setSize] = useState({width: 1, height:1})
  const [data, setData] = useState(imagedata[imageIndex]);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [coordinates, setCoordinates] = useState([]);
  const [drawingMode, setDrawingMode] = useState(false);
  const [location, setLocation] = useState(imagedata[imageIndex].location);
  const [clinicalDiagnosis, setClinicalDiagnosis] = useState(imagedata[imageIndex].clinical_diagnosis);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState({msg:"",severity:"success", open:false});
  const userData = useSelector(state => state.data);

  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.up('sm'));

  const handleSave = ()=>{

    const coor = getCoordinates();
    setCoordinates(coor);

    setSaving(true);

    axios.post(`${process.env.REACT_APP_BE_URL}/image/update/${data._id}`,
    {
        location: location,
        clinical_diagnosis: clinicalDiagnosis,
        annotation: coor
    },
    { headers: {
        'Authorization': `Bearer ${userData.accessToken.token}`,
        'email': userData.email,
    }}).then(res=>{
        showMsg("Successful!",'success')
        var temp = [...imagedata]
        temp[imageIndex].annotation = coor
        temp[imageIndex].location= location
        temp[imageIndex].clinical_diagnosis = clinicalDiagnosis
        setImagedata(temp);
        handleClose();
    }).catch(err=>{
        alert(err)
    }).finally(()=>{
      setSaving(false)
    })
  }

  const getCoordinates = ()=>{
    var updated = [];

    [...regions].forEach((region, index) =>{
      if(region.completed){
        var pointArray = []
        var all_x = region.points.map((p) => p["x"]);
        var all_y = region.points.map((p) => p["y"]);
        var bbox_arr = [Math.round(Math.min(...all_x)), Math.round(Math.min(...all_y)), 
        Math.round(Math.max(...all_x)), Math.round(Math.max(...all_y))]
        for (const p of region.points) {
          pointArray.push(Math.round(p.x),Math.round(p.y))
        }
        updated.push(
          {
            "id":index,
            "name": region.type,
            "annotations": pointArray,
            "bbox": bbox_arr
          }
        )
      }
    })

   return updated;
  }

  const canvaRef = useRef(null)

  const delete_selected = () =>{
    if(selectedRegion){
      selectedRegion.markedForDeletion = true;
      isSelected = false;
    }
    redraw_canvas();
    redraw_ids();
  }

  const finish_drawing = () =>{
    [...regions].forEach(region => {
      if(region.points.length < 3) region.markedForDeletion = true;
      region.completed = true
      region.isSelected = false
    });

    polygon = new Polygon(ctx, defaultSettings.color, defaultSettings.type)
    polygon.scale = zoomLevel;
    regions.push(polygon)
    redraw_canvas()
    redraw_ids()
  }

  const handle_keyup = (e) =>{
  
    e.preventDefault()
    
    if(e.key === "Enter") {
      finish_drawing()
    }

    if(e.key === "Escape") {
      
      [...regions].forEach(region => {
        if(!region.completed) region.markedForDeletion = true;
      });
  
      polygon = new Polygon(ctx, defaultSettings.color, defaultSettings.type)
      polygon.scale = zoomLevel;
      regions.push(polygon)
      redraw_canvas()
      redraw_ids()

    }
  
    if(e.key === "Delete") {
      delete_selected()
      redraw_canvas()
      redraw_ids()
    }
  }

  const deselect_all = (e) =>{
    if (e.target.className !== 'drawing_area')  return;

    if(selectedRegion){
      selectedRegion.isSelected = false;
      isSelected = false;
    }

    selectedRegion = null;
    redraw_canvas()
    redraw_ids()
  }

  const handleSelect = () =>{

    isSelected = false;
    selectedRegion = null;

  
    //if drawing don't select
    if(isDrawing || drawingMode) return

    var selectedIndex = -1;
    var i;
    for(i=0; i< regions.length; i++){
      // if closest to a point select that region
      if((regions[i].closest(mouse)) && regions[i].completed){
        // set all are unselected
        [...regions].forEach(region => region.isSelected = false)
        // select only the closest region
        isSelected = true;
        regions[i].isSelected = true;
        selectedRegion = regions[i]
        return
      // if a region is already selected that means
      // user needs to select another region or create a new region
      }else if(regions[i].isSelected){
        if(regions[i].isPointInPoly(mouse)) selectedIndex = i;
        regions[i].isSelected = false;
        selectedRegion = null;
        break
      }
    }

    // select the next unselected region
    for(i=selectedIndex+1;i<regions.length;i++){
      if((regions[i].isPointInPoly(mouse)) && regions[i].completed){
        regions[i].isSelected = true;
        isSelected = true;
        selectedRegion = regions[i]
        break
      }
    }
  }

  const handle_mouse = (e)=>{

    if(ctx == null) return;
  
    var rect = canvas.getBoundingClientRect();

    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;

    if(e.type === "mousedown"){
        handleSelect()  
    }

    mouse.button = e.type === "mousedown" ? true : e.type === "mouseup" ? false : mouse.button;
    redraw_canvas()
    redraw_ids()
  }


  // event listner for keypress
  useEffect(() => {
    window.addEventListener("keyup", handle_keyup);
    return () => {
      window.removeEventListener("keyup", handle_keyup);
    };
  }, [handle_keyup]);

  // change drawing mode
  useEffect(() => {
    mouse.cursor = "default"
    finish_drawing();
  }, [drawingMode]);

  useEffect(() => {
    setData(imagedata[imageIndex]);
  }, [imagedata, imageIndex]);

  // redraw the canvas
  const redraw_canvas = () =>{
    
    if(ctx === null) return;
    
    ctx.clearRect(0,0, canvas.width, canvas.height);
    
    if(!drawingMode) {mouse.cursor = "default"}
    else {mouse.cursor = "crosshair"}

    regions = regions.filter(region => !region.markedForDeletion);

    [...regions].forEach(region => {region.update( drawingMode, defaultSettings.color, defaultSettings.type)})

    canvas.style.cursor = mouse.cursor;

  }

  // redraw the region ids
  const redraw_ids = () =>{

    if(ctx === null) return;
    

    var text, text_info, height, width;

    for(var i=0; i< regions.length; i++){
      if(regions[i].completed){
        text = regions[i].type
        text_info = ctx.measureText(text);
        height = ctx.font.match(/\d+/).pop() || 10;
        width = text_info.width;
        ctx.fillStyle = "black";
        ctx.fillRect((regions[i].points[0].x)*regions[i].scale -1 , (regions[i].points[0].y)*regions[i].scale - height-2, width+2, height-(-2));
        ctx.fillStyle = "yellow";
        ctx.textBaseline = "bottom";
        ctx.fillText(text,(regions[i].points[0].x)*regions[i].scale, (regions[i].points[0].y)*regions[i].scale);
      }
    }
  }


  // initial run
  const init_run = (initZoomLevel) => {
   
    canvas = canvaRef.current;
    ctx = canvas.getContext('2d');

    regions = [];

    if(data){
      [...data.annotation].forEach(region=>{
        var type = region.name
        polygon = new Polygon(ctx, defaultSettings.color, type)
        polygon.scale = initZoomLevel;
        var points = []
        var oldAnnotations = region.annotations
        for(var i=0; i< oldAnnotations.length; i+=2){
          points.push(point(region.annotations[i], region.annotations[i+1]))
        }
        polygon.points = points
        polygon.completed = true;
        regions.push(polygon)    
      })
    }

    polygon = new Polygon(ctx, defaultSettings.color, defaultSettings.type)
    polygon.scale = initZoomLevel;
    regions.push(polygon)

    redraw_canvas()
    redraw_ids()

  };

  // redraw if canvas size changed
  useEffect(()=>{
    if(size.height > 1  && size.width> 1){
      redraw_canvas()
      redraw_ids()
    }
  },[size])
 
  // zoom in
  const zoom_in = ()=>{
    if(size.width > 2 * window.innerWidth) return

    setSize({
      width: size.width * 1.25 ,
      height: size.height * 1.25 
    });
    
    [...regions].forEach(region =>{
      region.scale = region.scale * 1.25;
    })

    setZoomLevel(zoomLevel * 1.25)
  }

  // zoom out
  const zoom_out = ()=>{
    if(size.width < window.innerWidth/4) return

    setSize({
      width: size.width / 1.25 ,
      height: size.height / 1.25 
    });
    
    [...regions].forEach(region =>{
      region.scale = region.scale / 1.25;
    })

    setZoomLevel(zoomLevel/1.25)
  }

  // get the size of the image
  const get_dimensions = (img)=>{
   
    const drawingboard_width = matches? window.innerWidth - (300+20) : window.innerWidth - 20 ;
    const image_width = img.nativeEvent.srcElement.naturalWidth;


    var initZoomLevel = image_width > drawingboard_width ? (drawingboard_width / image_width): 1;

    setSize({
      width: img.nativeEvent.srcElement.naturalWidth * initZoomLevel,
      height: img.nativeEvent.srcElement.naturalHeight * initZoomLevel,
    });

    setZoomLevel(initZoomLevel);
    init_run(initZoomLevel);
  }

  const goBack = ()=>{
    handleClose();
  }

  const showMsg = (msg, severity)=>{
    setStatus({msg, severity, open:true})
  }

  return (
    <>
    <div className='page_body' onMouseDown={(e)=>{deselect_all(e)}}>

        {/********************* side bar **********************/}
        <div className='top_bar'>
          <Stack direction='row' sx={{width:'100%'}} alignItems='center' style={{paddingInline:'10px'}} spacing={1}>

          {/******************* button pannel *************************/}
          <ButtonPanel func={{finish_drawing,setDrawingMode, zoom_in, zoom_out, 
          delete_selected}} drawingMode={drawingMode} status={data.status}/>

          <div style={{flex: 1}}></div>
          <Box >
            <Stack direction='row' spacing={1}>
              <ButtonGroup color='success' variant="contained">
                <LoadingButton loading={saving} variant='contained' onClick={handleSave}>Save</LoadingButton>
              </ButtonGroup>
              <Button size='small' variant='outlined' color='inherit' onClick={goBack}>Close</Button>
            </Stack>
          </Box>
          </Stack>
        </div>
        {/********************** working area **********************/}
        <div className="work_area">
        <div className='drawing'>
          <div className='drawing_area'>
          <canvas className='main_canvas' onDoubleClick={(e)=>handle_mouse(e)} onMouseMove={(e)=>{handle_mouse(e)}} onMouseDown={(e)=>{handle_mouse(e)}} onMouseUp={(e)=>{handle_mouse(e)}} ref={canvaRef} width={size.width} height={size.height}>Sorry, Canvas functionality is not supported.</canvas>
  
          <img className="main_img" onLoad={(e)=>{get_dimensions(e)}}  width={size.width} height={size.height} src={`${process.env.REACT_APP_IMAGE_PATH}/${data.image_name}`} alt="failed to load"/> 
          </div>
        </div>
        {/******************** image annotation ************************/} 
        <Box className='right_bar' sx={{display: { xs: 'none', sm: 'block' } }}>
        <div style={{padding:'10px'}}>
                
          <Stack direction='column' spacing={2} sx={{bgcolor:'white', borderRadius:1, p:1}}>
          <Typography variant='body2'><b>Image Data</b></Typography>
          <FormControl fullWidth>
            <InputLabel size='small'>Location</InputLabel>
            <Select label="Location" fullWidth size='small' value={location} onChange={(e)=>setLocation(e.target.value)} sx={{backgroundColor: "white", mb:1}}>
            {locations.map((name, index) =>{
              return (<MenuItem key={index} value={name}>{name}</MenuItem>)
            })}
          </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel size='small'>Clinical Diagnosis</InputLabel>
          <Select label="Clinical Diagnosis" fullWidth size='small' value={clinicalDiagnosis} onChange={(e)=>setClinicalDiagnosis(e.target.value)} sx={{backgroundColor: "white", mb:1}}>
            {diagnosis.map((name, index) =>{
              return (<MenuItem key={index} value={name}>{name}</MenuItem>)
            })}
          </Select>
          </FormControl>
          </Stack>
          </div>
        </Box>
        </div>
        {/********************** info panel **********************/}
    </div>
    <NotificationBar status={status} setStatus={setStatus}/>
    </>
  )
}

export default Canvas;
