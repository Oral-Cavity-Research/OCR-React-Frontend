import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import MenuBar from './MenuBar';
import { useDispatch } from 'react-redux';
import { trySilentRefresh } from '../utils/authUtils';
import {setUserData } from '../Reducers/userDataSlice';
import ClipLoader from 'react-spinners/ClipLoader';

const ProtectedRoute = ({allowed, children}) => {
    
    const info = JSON.parse(sessionStorage.getItem("info"))
    const permissions = info? info["permissions"]: []
    const user = info? info["username"]: null

    if(!user) return <Navigate to="/login" replace />;
    else if(! permissions.find(p => allowed.includes(p))) return <Navigate to="/notfound" replace />;
 
    return (
        <div className='main'>
        <div className='main_menu'>
            <MenuBar permissions={permissions} username={user} roleName={info?.role} availability={info?.availability}/>
        </div>
        <div className='main_content'>
            {children}
        </div>
        </div>
    );
    
};

export default ProtectedRoute;