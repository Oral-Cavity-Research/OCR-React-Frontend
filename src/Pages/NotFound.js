import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';

const NotFound = () => {

    const navigate = useNavigate();

    return (
        <div className='notfound'>
            <div className="circles">
            <p>404<br/>
            <small>PAGE NOT FOUND</small>
            </p>
            <Button onClick={() => navigate(-1)}>Go Back</Button>
            <span className="circle big"></span>
            <span className="circle med"></span>
            <span className="circle small"></span>
        </div>
        </div>
    );
};

export default NotFound;