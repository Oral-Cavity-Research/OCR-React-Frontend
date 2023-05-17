import React from 'react';
import {IconButton, Divider, Tooltip} from '@mui/material';
import {Preview,ZoomIn,CropFree,ZoomOut,Close, CancelOutlined, HelpOutline, Style} from '@mui/icons-material';
import {ArrowUpward, ArrowDownward, ArrowBack, ArrowForward, Opacity, Check} from '@mui/icons-material';
import {Label, LabelOff} from '@mui/icons-material';

const ButtonPanel = ({func, labelVisibility}) => {

    return (
        <>
        <div style={{display: 'flex', flexDirection: "column", color: 'white'}}>
            <div>  
                <Tooltip title="Show Regions" placement="bottom-end" arrow><IconButton onClick={func.show_regions}><Preview fontSize='small' sx={{color:"white"}}/></IconButton></Tooltip>
                <Tooltip title="Finish Drawing" placement="bottom-end" arrow><IconButton onClick={func.finish_drawing}><Check fontSize='small' sx={{color:"white"}}/></IconButton></Tooltip>
                <Tooltip title="Clear Selected" placement="bottom-end" arrow><IconButton onClick={func.delete_selected}><Close fontSize='small' sx={{color:"white"}}/></IconButton></Tooltip>
            </div>
            <div>
                <Divider/>  
                <Tooltip title="Zoom In" placement="bottom-end" arrow><IconButton onClick={func.zoom_in}><ZoomIn fontSize='small' sx={{color:"white"}}/></IconButton></Tooltip>
                <Tooltip title="Zoom Out" placement="bottom-end" arrow><IconButton onClick={func.zoom_out}><ZoomOut fontSize='small' sx={{color:"white"}}/></IconButton></Tooltip>
                <Tooltip title="Zoom Reset" placement="bottom-end" arrow><IconButton onClick={func.zoom_reset}><CropFree fontSize='small' sx={{color:"white"}}/></IconButton></Tooltip>
            </div>
            <div>
                <Divider/>
                <Tooltip title="Move Up" placement="bottom-end" arrow><IconButton onClick={()=>func.move_selected("ArrowUp", 10)}><ArrowUpward fontSize='small' sx={{color:"white"}}/></IconButton></Tooltip>
                <Tooltip title="Move Down" placement="bottom-end" arrow><IconButton onClick={()=>func.move_selected("ArrowDown", 10)}><ArrowDownward fontSize='small' sx={{color:"white"}}/></IconButton></Tooltip>
                <Tooltip title="Move Left" placement="bottom-end" arrow><IconButton onClick={()=>func.move_selected("ArrowLeft", 10)}><ArrowBack fontSize='small' sx={{color:"white"}}/></IconButton></Tooltip>
                <Tooltip title="Clear Right" placement="bottom-end" arrow><IconButton onClick={()=>func.move_selected("ArrowRight", 10)}><ArrowForward fontSize='small' sx={{color:"white"}}/></IconButton></Tooltip>
            </div>
            <div>
                <Divider/>
                <Tooltip title="Toggle Label Visibility" placement="bottom-end" arrow><IconButton onClick={func.show_label}>{labelVisibility?<LabelOff fontSize='small' sx={{color:"white"}}/>:<Label  fontSize='small' sx={{color:"white"}}/>}</IconButton></Tooltip>
                <Tooltip title="Toggle label type" placement="bottom-end" arrow><IconButton onClick={func.label_type}><Style fontSize='small' sx={{color:"white"}}/></IconButton></Tooltip>
                <Tooltip title="Clear All" placement="bottom-end" arrow><IconButton onClick={func.opacity_change}><Opacity fontSize='small' sx={{color:"white"}}/></IconButton></Tooltip>
            </div>
            <div>
                <Divider/>
                <Tooltip title="Clear All" placement="bottom-end" arrow><IconButton onClick={func.clear_all}><CancelOutlined fontSize='small' sx={{color:"white"}}/></IconButton></Tooltip>
                <Tooltip title="Help" placement="bottom-end" arrow><IconButton onClick={func.show_help}><HelpOutline fontSize='small' sx={{color:"white"}}/></IconButton></Tooltip>
            </div>
        </div>
        </>
    );
};
export default ButtonPanel;