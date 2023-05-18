import React, {useState} from 'react';
import NotificationBar from '../NotificationBar';
import { Box,Table, TableBody, TableRow, TableCell,List, ListItem, ListItemText, Typography} from '@mui/material';
import dayjs from 'dayjs';
import { age } from '../utils';

const SharedPatientProfile = ({data}) => {
    const [status, setStatus] = useState({msg:"",severity:"success", open:false})
    
    return (
        <div>
        <Box sx={{ mt: 1 }}>
            <Table  sx={{border: '1px solid lightgray'}}>
                <TableBody>
                    <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell sx={{py:0}}>{data.patient_id}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell sx={{py:0}}>{data.patient_name}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>DOB</TableCell>
                        <TableCell sx={{py:0}}>
                        {data.DOB?dayjs(data.DOB).format("DD/MM/YYYY"):""}
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Age</TableCell>
                        <TableCell sx={{py:0}}>{age(data.DOB)}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Gender</TableCell>
                        <TableCell sx={{py:0}}> {data.gender}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Contact No</TableCell>
                        <TableCell sx={{py:0}}>{data.contact_no}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Histo Diagnosis</TableCell>
                        <TableCell sx={{py:0}}>{data.histo_diagnosis}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Previous history of cancer</TableCell>
                        <TableCell sx={{py:0}}>{data.medical_history}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Family history of cancer</TableCell>
                        <TableCell sx={{py:0}}>{data.family_history}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Systemic disease</TableCell>
                        <TableCell sx={{py:0}}>{data.systemic_disease}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Risk Habits</TableCell>
                        <TableCell sx={{py:0}}>
                        <List>
                        {
                           data.risk_factors?.map((item, index)=>{
                                return(
                                    <ListItem key={index} disableGutters disablePadding>
                                    <ListItemText
                                        primary={<Typography variant='body2' >{item.habit}</Typography>}
                                        secondary={item.frequency + " | " + item.duration} 
                                    />
                                    </ListItem>
                                )
                            })
                        }
                        </List>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Consent Form</TableCell>
                        <TableCell sx={{py:0, "&:hover" :{color:'var(--primary-color)'}}}><a href={`${process.env.REACT_APP_CONSENTFORM_PATH}/`+data.consent_form} target="_blank">Consent Form</a></TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Created At</TableCell>
                        <TableCell sx={{py:0}}>{dayjs(data.createdAt).format("DD/MM/YYYY")}</TableCell>
                    </TableRow>
                </TableBody>
            </Table>          
            </Box>
        <NotificationBar status={status} setStatus={setStatus}/>
        </div>
    );
};

export default SharedPatientProfile;