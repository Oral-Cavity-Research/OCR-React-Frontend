import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Stack, Typography } from '@mui/material';
import errorImage from '../Assets/error-404.png';

const NotFound = () => {

    const navigate = useNavigate();

    return (
        <div className='notfound'>
            <Stack direction='column' spacing={2} alignItems='center'>
            <img src={errorImage} alt="404" height={200} width={200}/>
            <Typography><b>PAGE NOT FOUND</b></Typography>
            <Button variant='contained' onClick={() => navigate(-1)}>Go Back</Button>
            </Stack>
        </div>
    );
};

export default NotFound;