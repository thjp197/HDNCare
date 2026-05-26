import React, { useContext } from 'react'
import { AdminContext } from '../context/AdminContext'
import { StylistContext } from '../context/StylistContext'
import { NavLink } from 'react-router-dom'
import { assets } from '../assets/assets'

const Sidebar = () => {

  const {aToken} = useContext(AdminContext)
  const {sToken, isBranchManager} = useContext(StylistContext)

  return (
    <div className='min-h-screen bg-white border-r'>
      {
        aToken && <ul className='text-[#515151] mt-5 '>
            <NavLink className={({isActive})=> `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#f2f3ff] border-r-4 border-primary' : ''}`} to={'/admin-dashboard'}>
              <img src={assets.home_icon} alt="" />
              <p>Bảng điều khiển</p>
            </NavLink>

            <NavLink className={({isActive})=> `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#f2f3ff] border-r-4 border-primary' : ''}`} to={'/all-appointments'}>
              <img src={assets.appointment_icon} alt="" />
              <p>Lịch hẹn</p>
            </NavLink>

            <NavLink className={({isActive})=> `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#f2f3ff] border-r-4 border-primary' : ''}`} to={'/add-stylist'}>
              <img src={assets.add_icon} alt="" />
              <p>Thêm chuyên viên</p>
            </NavLink>

            <NavLink className={({isActive})=> `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#f2f3ff] border-r-4 border-primary' : ''}`} to={'/stylists-list'}>
              <img src={assets.people_icon} alt="" />
              <p>Danh sách chuyên viên</p>
            </NavLink>

            <NavLink className={({isActive})=> `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#f2f3ff] border-r-4 border-primary' : ''}`} to={'/branch-management'}>
              <img src={assets.add_icon} alt="" />
              <p>Quản lý Chi nhánh</p>
            </NavLink>

            <NavLink className={({isActive})=> `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#f2f3ff] border-r-4 border-primary' : ''}`} to={'/discount-codes'}>
              <img src={assets.add_icon} alt="" />
              <p>Mã giảm giá</p>
            </NavLink>

            <NavLink className={({isActive})=> `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#f2f3ff] border-r-4 border-primary' : ''}`} to={'/penalized-users'}>
              <img src={assets.list_icon} alt="" />
              <p>Tài khoản bị phạt</p>
            </NavLink>
          </ul>
      }
      {
        sToken && <ul className='text-[#515151] mt-5 '>
            <NavLink className={({isActive})=> `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#f2f3ff] border-r-4 border-primary' : ''}`} to={'/stylist-dashboard'}>
              <img src={assets.home_icon} alt="" />
              <p>Bảng điều khiển</p>
            </NavLink>

            <NavLink className={({isActive})=> `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#f2f3ff] border-r-4 border-primary' : ''}`} to={'/stylist-appointments'}>
              <img src={assets.appointment_icon} alt="" />
              <p>Lịch hẹn</p>
            </NavLink>

            <NavLink className={({isActive})=> `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#f2f3ff] border-r-4 border-primary' : ''}`} to={'/stylist-profile'}>
              <img src={assets.people_icon} alt="" />
              <p>Hồ sơ chuyên viên</p>
            </NavLink>

            {isBranchManager && (
              <>
                <hr className='my-2 border-gray-300' />
                <p className='text-sm font-semibold text-gray-600 px-3 md:px-9 py-2'>QUẢN LÝ CHI NHÁNH</p>
                
                <NavLink className={({isActive})=> `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#f2f3ff] border-r-4 border-primary' : ''}`} to={'/branch-manager-dashboard'}>
                  <img src={assets.home_icon} alt="" />
                  <p>Bảng điều khiển Chi nhánh</p>
                </NavLink>

                <NavLink className={({isActive})=> `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#f2f3ff] border-r-4 border-primary' : ''}`} to={'/branch-manager-appointments'}>
                  <img src={assets.appointment_icon} alt="" />
                  <p>Lịch hẹn Chi nhánh</p>
                </NavLink>

                <NavLink className={({isActive})=> `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#f2f3ff] border-r-4 border-primary' : ''}`} to={'/branch-manager-stylists'}>
                  <img src={assets.people_icon} alt="" />
                  <p>Nhân viên Chi nhánh</p>
                </NavLink>
              </>
            )}
          </ul>
      }
          
    </div>
  )
}

export default Sidebar