import React, { useContext } from 'react'
import { AdminContext } from '../context/AdminContext'
import { StylistContext } from '../context/StylistContext'
import { NavLink } from 'react-router-dom'
import { assets } from '../assets/assets'

const Sidebar = () => {

  const {aToken} = useContext(AdminContext)
  const {sToken} = useContext(StylistContext)

  return (
    <div className='min-h-screen bg-white border-r'>
      {
        aToken && <ul className='text-[#515151] mt-5 '>
            <NavLink className={({isActive})=> `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#f2f3ff] border-r-4 border-primary' : ''}`} to={'/admin-dashboard'}>
              <img src={assets.home_icon} alt="" />
              <p>Dashboard</p>
            </NavLink>

            <NavLink className={({isActive})=> `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#f2f3ff] border-r-4 border-primary' : ''}`} to={'/all-appointments'}>
              <img src={assets.appointment_icon} alt="" />
              <p>Appointments</p>
            </NavLink>

            <NavLink className={({isActive})=> `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#f2f3ff] border-r-4 border-primary' : ''}`} to={'/add-stylist'}>
              <img src={assets.add_icon} alt="" />
              <p>Add Stylist</p>
            </NavLink>

            <NavLink className={({isActive})=> `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#f2f3ff] border-r-4 border-primary' : ''}`} to={'/stylists-list'}>
              <img src={assets.people_icon} alt="" />
              <p>Stylists List</p>
            </NavLink>
          </ul>
      }
      {
        sToken && <ul className='text-[#515151] mt-5 '>
            <NavLink className={({isActive})=> `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#f2f3ff] border-r-4 border-primary' : ''}`} to={'/stylist-dashboard'}>
              <img src={assets.home_icon} alt="" />
              <p>Dashboard</p>
            </NavLink>

            <NavLink className={({isActive})=> `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#f2f3ff] border-r-4 border-primary' : ''}`} to={'/stylist-appointments'}>
              <img src={assets.appointment_icon} alt="" />
              <p>Appointments</p>
            </NavLink>

            <NavLink className={({isActive})=> `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#f2f3ff] border-r-4 border-primary' : ''}`} to={'/stylist-profile'}>
              <img src={assets.people_icon} alt="" />
              <p>Stylist Profile</p>
            </NavLink>
          </ul>
      }
          
    </div>
  )
}

export default Sidebar