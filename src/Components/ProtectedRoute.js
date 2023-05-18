import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import MenuBar from './MenuBar';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({allowed, children}) => {

    const userData = useSelector(state => state.data);
    const permissions = userData.permissions? userData.permissions: []
    const user = userData.email? userData.email: null

    if(!user) return <Navigate to="/login" replace />;
    else if(! permissions.find(p => allowed.includes(p))) return <Navigate to="/notfound" replace />;
 
    return (
        <div className='main'>
        <div className='main_menu'>
            <MenuBar/>
        </div>
        <div className='main_content'>
            {children}
        </div>
        </div>
    );
    
};

export default ProtectedRoute;