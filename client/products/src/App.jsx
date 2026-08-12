import { useState } from 'react'
import './App.css'
import Login from "../interfaces/Option"
import Usersignup from '../interfaces/usersignup';
import { Routes, Route, Navigate } from "react-router-dom";
import Userlogin from '../interfaces/userlogin';
import Hostsignup from '../interfaces/hostsignup';
import Userprotectedwrapper from '../wrappers/userprotectedwrapper';
import Userdashboard from '../interfaces/userdashboard';
import Hostlogin from "../interfaces/hostlogin";
import Hostdashboard from '../interfaces/hostdashboard';
import Viewproducts from '../interfaces/viewproducts';
import NewProduct from "../interfaces/newproducts"
import Hostprotectedwrapper from '../wrappers/hostprotectedwrapper';
import Editproduct from '../interfaces/editproduct';
import Productsforuser from '../interfaces/productsforuser';
import PlaceOrder from '../interfaces/Placeorder';
import MyOrder from '../interfaces/myorders';
import Vieworders from '../interfaces/vieworders';
import Shippersignup from '../interfaces/shippersignup';
import Shipperdashboard from "../interfaces/shipperdashboard";
import Shipperlogin from "../interfaces/shipperlogin"
import Shipperprotectedwrapper from "../wrappers/shipprotectedwrapper";
import Shipperorders from '../interfaces/shipperorders';
import HostOrderHistory from '../interfaces/hostordershistory';
import UserOrderHistory from '../interfaces/userordershistory';
import Usersettings from '../interfaces/usersettings';
import Hostsettings from '../interfaces/hostsettings';
import Shippersettings from '../interfaces/shippersettings';
import ShipperHistory from '../interfaces/shipperhistory';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login></Login>}></Route>
      <Route path="/usersignup" element={<Usersignup></Usersignup>}></Route>
      <Route path="/userlogin" element={<Userlogin></Userlogin>}></Route>
      <Route path="/hostsignup" element={<Hostsignup></Hostsignup>}></Route>
      <Route path="/userdashboard" element={<Userprotectedwrapper><Userdashboard></Userdashboard></Userprotectedwrapper>}></Route>
      {/* <Route path="/userDashboard" element={<Navigate to="/userdashboard" replace />} /> */}
      <Route path="/hostlogin" element={<Hostlogin></Hostlogin>}></Route>


      {/* use later here hostprotectedwrapper in these 3 route */}
      <Route path="/hostdashboard" element={<Hostprotectedwrapper><Hostdashboard></Hostdashboard></Hostprotectedwrapper>}></Route>
      <Route path='/viewproducts' element={<Hostprotectedwrapper><Viewproducts></Viewproducts></Hostprotectedwrapper>}></Route>
      <Route path="/newproduct" element={<Hostprotectedwrapper><NewProduct></NewProduct></Hostprotectedwrapper>}></Route>
      <Route path="/editproduct/:id" element={<Hostprotectedwrapper><Editproduct></Editproduct></Hostprotectedwrapper>}></Route>
      <Route path='/newproductsforuser' element={<Userprotectedwrapper><Productsforuser></Productsforuser></Userprotectedwrapper>}></Route>
      <Route path='/placeorder/:id'element={<Userprotectedwrapper><PlaceOrder></PlaceOrder></Userprotectedwrapper>}></Route>
      <Route path="/myorders" element={<Userprotectedwrapper><MyOrder></MyOrder></Userprotectedwrapper>}></Route>
      <Route path='/vieworders' element={<Userprotectedwrapper><Vieworders></Vieworders></Userprotectedwrapper>}></Route>
      <Route path='/shippersignup' element={<Shippersignup></Shippersignup>}></Route>
      <Route path='/shipperdashboard' element={<Shipperprotectedwrapper><Shipperdashboard></Shipperdashboard></Shipperprotectedwrapper>}></Route>
      <Route path="/shipperlogin" element={<Shipperlogin></Shipperlogin>}></Route>
      <Route path='/shipperorders' element={<Shipperorders></Shipperorders>}></Route>
      <Route path="/hostorderhistory" element={<HostOrderHistory></HostOrderHistory>}></Route>
      <Route path='/userorderhistory' element={<UserOrderHistory></UserOrderHistory>}></Route>
      <Route path="/usersettings" element={<Usersettings></Usersettings>}></Route>
      <Route path='/hostsettings'element={<Hostsettings></Hostsettings>}></Route>
      <Route path='/shippersettings' element={<Shippersettings></Shippersettings>}></Route>
      <Route path='/shipperhistory' element={<ShipperHistory></ShipperHistory>}></Route>
      

    </Routes>
  )
}

export default App
