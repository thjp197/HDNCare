import React, { useState } from 'react'
import {assets} from '../assets/assets'
import { NavLink, useNavigate } from 'react-router-dom'

const Navbar = () => {

      const navigate = useNavigate();

      const [showMenu, setShowMenu] = useState(false);
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
              <li className='py-1'>TẤT CẢ NHÀ TẠO MẪU</li>
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
            ? <div className='relative flex items-center gap-2 cursor-pointer group'>
              <img className='w-8 rounded-full' src={assets.profile_pic} alt=""/>
              <img className='w-2.5' src={assets.dropdown_icon} alt=""/>
              <div className='absolute right-0 z-20 hidden text-base font-medium text-gray-600 top-8 pt-14 group-hover:block'>
                <div className='flex flex-col gap-4 p-4 rounded min-w-48 bg-stone-100'>
                  <p onClick={()=>navigate('my-profile')} className='cursor-pointer hover:text-black'>Hồ sơ của tôi</p>
                  <p onClick={()=>navigate('my-appointments')} className='cursor-pointer hover:text-black'>Lịch hẹn của tôi</p>
                  <p onClick={()=>setToken(false)} className='cursor-pointer hover:text-black'>Đăng xuất</p>
                </div>
              </div>
            </div>
            :<button onClick={()=>navigate('/login')} className='hidden px-8 py-3 font-light text-white rounded-full bg-primary md:block'>Create account</button>
          }
          
        </div>
    </div>
  )
}

export default Navbar