import React, { useContext, useState } from 'react'
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
import BranchManagement from './pages/Admin/BranchManagement';
import BranchManagerDashboard from './pages/BranchManager/BranchManagerDashboard';
import BranchManagerAppointments from './pages/BranchManager/BranchManagerAppointments';
import BranchManagerStylists from './pages/BranchManager/BranchManagerStylists';
import { StylistContext } from './context/StylistContext';
import StylistDashboard from './pages/Stylist/StylistDashboard';
import StylistAppointment from './pages/Stylist/StylistAppointment';
import StylistProfile from './pages/Stylist/StylistProfile';

const App = () => {

  const {aToken} = useContext(AdminContext)
  const {sToken} = useContext(StylistContext)
  const [showMobileSidebar, setShowMobileSidebar] = useState(false)
  const defaultDashboardPath = aToken ? '/admin-dashboard' : '/stylist-dashboard'

  return aToken || sToken ? (
    <div className='min-h-screen bg-[#F8F9FD]'>
      <ToastContainer/>
      <Navbar onMenuOpen={() => setShowMobileSidebar(true)} />
      <div className='flex w-full flex-col overflow-hidden md:flex-row md:items-start'>
        <Sidebar
          isMobileOpen={showMobileSidebar}
          onClose={() => setShowMobileSidebar(false)}
        />
        <div className='min-w-0 flex-1 overflow-x-hidden'>
        <Routes>
          {/* admin routes */}
          <Route path='/' element={<Navigate to={defaultDashboardPath} replace />}/>  
          <Route path='/admin-dashboard' element={<Dashboard />}/>  
          <Route path='/all-appointments' element={<AllAppointments />}/>  
          <Route path='/add-stylist' element={<AddStylist />}/>  
          <Route path='/stylists-list' element={<StylistsList />}/>  
          <Route path='/branch-management' element={<BranchManagement />}/>
          <Route path='/discount-codes' element={<DiscountCodes />}/>
          <Route path='/penalized-users' element={<PenalizedUsers />}/>
          <Route path='/edit-stylist/:stylistId' element={<EditStylist />}/>

          {/* branch manager routes */}
          <Route path='/branch-manager-dashboard' element={<BranchManagerDashboard />}/>  
          <Route path='/branch-manager-appointments' element={<BranchManagerAppointments />}/>  
          <Route path='/branch-manager-stylists' element={<BranchManagerStylists />}/>  

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
