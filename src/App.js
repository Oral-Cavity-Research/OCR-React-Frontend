import React, { useEffect } from 'react';
import {createBrowserRouter, createRoutesFromElements, Route, RouterProvider , Outlet} from 'react-router-dom';
import './App.css';
import LoginPage from './Pages/LoginPage';
import NotFound from './Pages/NotFound';
import ProtectedRoute from './Components/ProtectedRoute';
import AdminPage from './Pages/AdminPage';
import Manage from './Pages/Manage';
import PatientsTable from './Components/Patients/PatientsTable';
import PatientDetails from './Components/Patients/PatientDetails';
import RequestsTable from './Components/AdminPortal/Requests/RequestsTable';
import RequestDetails from './Components/AdminPortal/Requests/RequestDetails';
import UsersTable from './Components/AdminPortal/Users/UsersTable';
import UserDetails from './Components/AdminPortal/Users/UserDetails';
import UserProfile from './Components/UserProfile';
import { useSelector, useDispatch } from 'react-redux';
import { trySilentRefresh } from './utils/authUtils';
import {setUserData } from './Reducers/userDataSlice';
import EntryDetails from './Components/Entry/EntryDetails';
import HospitalTable from './Components/AdminPortal/Hospitals/HospitalTabel';
import Entries from './Components/Entry/Entries';
import HospitalDetails from './Components/AdminPortal/Hospitals/HospitalDetails';
import UserPermissions from './Components/AdminPortal/Permissions/UserPermissions';
import HospiatalNew from './Components/AdminPortal/Hospitals/HospitalNew';
import NewUserPermission from './Components/AdminPortal/Permissions/NewUserPermission';
import EditUserPermission from './Components/AdminPortal/Permissions/EditUserPermission';
import PatientNew from './Components/Patients/PatientNew';
import SharedPatientDetails from './Components/SharedPatients/SharedPatientDetails';
import SharedEntries from './Components/SharedEntry/SharedEntries';
import SharedEntryDetails from './Components/SharedEntry/SharedEntryDetails';
import ViewEntryDetails from './Components/SharedPatients/ViewEntryDetails';
import Dashboard from './Components/AdminPortal/Dashboard/Dashboard';


function App() {
  const userData = useSelector(state => state.data);
  const dispatch = useDispatch();

  const silentRefresh = () => {
    trySilentRefresh().then(data => {
      if(data){
        dispatch(setUserData({
          _id: data.ref._id,
          username: data.ref.username,
          email: data.ref.email,
          roles: data.ref.role,
          accessToken: data.accessToken,
          reg_no: data.ref.reg_no
        }));
      }
    })
  }
  // useEffect(() => {
  //   if (userData.accessToken.token == null){
  //     silentRefresh();
  //   }
  // }, [])
  useEffect(() => {
      setTimeout(() => {
        silentRefresh();
      }, 1000*60*2);

  });
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path='/' element={<Outlet/>}>

        <Route index element={<LoginPage/>}/>
        <Route path='/login' element={<LoginPage/>}/>

        <Route path='/adminportal' element={<ProtectedRoute allowed={[100]}><AdminPage/></ProtectedRoute>}>

            <Route path='/adminportal/requests' element={<Outlet/>}>
              <Route index element={<RequestsTable/>}/>
              <Route path='/adminportal/requests/:id' element={<RequestDetails/>}/>
            </Route>

            <Route path='/adminportal/permissions' element={<Outlet/>}>
              <Route index element={<UserPermissions/>}/>
              <Route path='/adminportal/permissions/new' element={<NewUserPermission/>}/>
              <Route path='/adminportal/permissions/:id' element={<EditUserPermission/>}/>
            </Route>

            <Route path='/adminportal/users' element={<Outlet/>}>
              <Route index element={<UsersTable/>}/>
              <Route path='/adminportal/users/:id' element={<UserDetails/>}/>
            </Route>

            <Route path='/adminportal/hospitals' element={<HospitalTable/>} ></Route>
            <Route path='/adminportal/hospitals/new' element={<HospiatalNew/>} ></Route>
            <Route path='/adminportal/hospitals/:id' element={<HospitalDetails/>} ></Route>
            <Route path='/adminportal/hospitals/:id/edit' element={<HospitalTable/>} ></Route>

            <Route path='/adminportal/dashboard' element={<Dashboard/>} ></Route>
        </Route>

        <Route path='/manage' element={<ProtectedRoute allowed={[100,200]}><Manage/></ProtectedRoute>}>
            <Route index element={<Entries/>}/>
            <Route path='/manage/my/entries' element={<Entries/>}/>
            <Route path='/manage/my/entries/:id' element={<EntryDetails/>}/>
            <Route path ='/manage/my/patients' element={<Outlet/>}>
                <Route  index element={<PatientsTable/>}></Route>
                <Route  index path="/manage/my/patients/all" element={<PatientsTable/>}></Route>
                <Route  index path="/manage/my/patients/new" element={<PatientNew/>}></Route>
                <Route path="/manage/my/patients/:id" element={<PatientDetails/>}></Route>
            </Route>
            <Route path ='/manage/shared' element={<Outlet/>}>
              <Route index path='/manage/shared/entries' element={<SharedEntries/>}/>
              <Route path='/manage/shared/entries/view/:id' element={<ViewEntryDetails/>}/>
              <Route path='/manage/shared/entries/:id' element={<SharedEntryDetails/>}/>
              <Route path="/manage/shared/patients/:id" element={<SharedPatientDetails/>}></Route> 
            </Route>          
        </Route>

        <Route path='/profile' element={<ProtectedRoute allowed={[100,200,300]}><UserProfile/></ProtectedRoute> }/>         
        <Route path='/*' element={<NotFound/>}/>

      </Route>
    )
  )

  return (
      <RouterProvider router={router}/>
  );
}

export default App;