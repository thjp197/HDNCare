import React, { useContext } from 'react'
import Login from './pages/Login'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AdminContext } from './context/AdminContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import { Navigate, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Admin/Dashboard';
import AllAppointments from './pages/Admin/AllAppointments';
import AddStylist from './pages/Admin/AddStylist';
import StylistsList from './pages/Admin/StylistsList';
import EditStylist from './pages/Admin/EditStylist';
import PenalizedUsers from './pages/Admin/PenalizedUsers';
import DiscountCodes from './pages/Admin/DiscountCodes';
import { StylistContext } from './context/StylistContext';
import StylistDashboard from './pages/Stylist/StylistDashboard';
import StylistAppointment from './pages/Stylist/StylistAppointment';
import StylistProfile from './pages/Stylist/StylistProfile';

const App = () => {

  const {aToken} = useContext(AdminContext)
  const {sToken} = useContext(StylistContext)
  const defaultDashboardPath = aToken ? '/admin-dashboard' : '/stylist-dashboard'

  return aToken || sToken ? (
    <div className='bg-[#F8F9FD]'>
      <ToastContainer/>
      <Navbar/>
      <div className='flex items-start w-full overflow-hidden'>
        <Sidebar/>
        <div className='flex-1 overflow-auto'>
        <Routes>
          {/* admin routes */}
          <Route path='/' element={<Navigate to={defaultDashboardPath} replace />}/>  
          <Route path='/admin-dashboard' element={<Dashboard />}/>  
          <Route path='/all-appointments' element={<AllAppointments />}/>  
          <Route path='/add-stylist' element={<AddStylist />}/>  
          <Route path='/stylists-list' element={<StylistsList />}/>  
          <Route path='/discount-codes' element={<DiscountCodes />}/>
          <Route path='/penalized-users' element={<PenalizedUsers />}/>
          <Route path='/edit-stylist/:stylistId' element={<EditStylist />}/>

          {/* stylist routes */}
          <Route path='/stylist-dashboard' element={<StylistDashboard />}/>  
          <Route path='/stylist-appointments' element={<StylistAppointment />}/>  
          <Route path='/stylist-profile' element={<StylistProfile />}/>  

          <Route path='*' element={<Navigate to={defaultDashboardPath} replace />}/>
        </Routes>
        </div>
      </div>
    </div>
  ) : (
    <>
      <Login/>
      <ToastContainer/>
    </>
  )
}

export default App