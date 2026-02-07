import React, { useState } from 'react'
import {assets} from '../assets/assets'
import { NavLink, useNavigate } from 'react-router-dom'

const Navbar = () => {

      const navigate = useNavigate();

      const [showMenu, setShowMenu] = useState(false);
      const [showProfile, setShowProfile] = useState(false);
      const [token, setToken] = useState(true);

  return (
    <div className='flex items-center justify-between p-4 mb-5 text-sm border-b border-b-gray-400'>
        <div className='flex items-center gap-2'>
          <img onClick={() => navigate('/')} src={assets.logo} alt="logo" className='cursor-pointer w-44' />
        </div>
        <ul className='items-start hidden gap-10 font-medium md:flex'>
            <NavLink to='/'>
              <li className='py-1'>TRANG CHỦ</li>
              <hr className='w-3/5 h-2 m-auto border-none outline-none bg-primary' hidden/>
            </NavLink>
            <NavLink to='/stylists'>
              <li className='py-1'>TẤT CẢ CHUYÊN VIÊN</li>
              <hr className='w-3/5 h-2 m-auto border-none outline-none bg-primary' hidden/>
            </NavLink>
            <NavLink to='/about'>
              <li className='py-1'>VỀ HDNCARE</li>
              <hr className='w-3/5 h-2 m-auto border-none outline-none bg-primary' hidden/>
            </NavLink>
            <NavLink to='/contact'>
              <li className='py-1'>LIÊN HỆ</li>
              <hr className='w-3/5 h-2 m-auto border-none outline-none bg-primary' hidden/>
            </NavLink>
        </ul>
        <div className='flex items-center gap-4'>
          {
            token 
            ? <div className='relative flex items-center gap-2 cursor-pointer'>
              <img className='w-8 rounded-full' src={assets.profile_pic} alt="" onClick={() => setShowProfile(!showProfile)}/>
              <img className='w-2.5' src={assets.dropdown_icon} alt="" onClick={() => setShowProfile(!showProfile)}/>
              {showProfile && (
                <div className='absolute right-0 z-50 text-base font-medium text-gray-600 top-8 pt-14'>
                  <div className='flex flex-col gap-4 p-4 rounded min-w-48 bg-stone-100'>
                    <p onClick={()=>{navigate('my-profile'); setShowProfile(false)}} className='cursor-pointer hover:text-black'>Hồ sơ của tôi</p>
                    <p onClick={()=>{navigate('my-appointments'); setShowProfile(false)}} className='cursor-pointer hover:text-black'>Lịch hẹn của tôi</p>
                    <p onClick={()=>{setToken(false); setShowProfile(false)}} className='cursor-pointer hover:text-black'>Đăng xuất</p>
                  </div>
                </div>
              )}
            </div>
            :<button onClick={()=>navigate('/login')} className='hidden px-8 py-3 font-light text-white rounded-full bg-primary md:block'>Create account</button>
          }
          <img onClick={() => setShowMenu(true)} className='w-6 md:hidden' src={assets.menu_icon} alt="" />

        {/* ---- Mobile Menu ---- */}
        <div className={`md:hidden ${showMenu ? 'fixed w-full' : 'h-0 w-0'} right-0 top-0 bottom-0 z-20 overflow-hidden bg-white transition-all`}>
          <div className='flex items-center justify-between px-5 py-6'>
            <img src={assets.logo} className='w-36' alt="" />
            <img onClick={() => setShowMenu(false)} src={assets.cross_icon} className='w-7' alt="" />
          </div>
          <ul className='flex flex-col items-center gap-2 mt-5 px-5 text-lg font-medium'>
            <NavLink onClick={() => setShowMenu(false)} to='/'><p className='px-4 py-2 rounded full inline-block'>TRANG CHỦ</p></NavLink>
            <NavLink onClick={() => setShowMenu(false)} to='/stylists' ><p className='px-4 py-2 rounded full inline-block'>TẤT CẢ CHUYÊN VIÊN</p></NavLink>
            <NavLink onClick={() => setShowMenu(false)} to='/about' ><p className='px-4 py-2 rounded full inline-block'>VỀ HDNCARE</p></NavLink>
            <NavLink onClick={() => setShowMenu(false)} to='/contact' ><p className='px-4 py-2 rounded full inline-block'>LIÊN HỆ</p></NavLink>
          </ul>
        </div>
        </div>
    </div>
  )
}

export default Navbar