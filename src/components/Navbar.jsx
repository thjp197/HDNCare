import { useContext, useEffect, useRef, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { assets } from '../assets/assets';
import { AppContext } from '../context/AppContext';

const Navbar = () => {

      const navigate = useNavigate();

      const { token, userData, resetUserSession } = useContext(AppContext);

      const [showMenu, setShowMenu] = useState(false);
      const [showProfile, setShowProfile] = useState(false);
      const profileMenuRef = useRef(null);

      const logout = () => {
        resetUserSession()
        navigate('/')
      }

      useEffect(() => {
        if (!showProfile) return;

        const handleClickOutside = (event) => {
          if (
            profileMenuRef.current &&
            !profileMenuRef.current.contains(event.target)
          ) {
            setShowProfile(false);
          }
        };

        const handleEscape = (event) => {
          if (event.key === 'Escape') {
            setShowProfile(false);
          }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);

        return () => {
          document.removeEventListener('mousedown', handleClickOutside);
          document.removeEventListener('keydown', handleEscape);
        };
      }, [showProfile]);

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
            <NavLink to='/ai-makeup'>
              <li className='py-1'>AI MAKEUP</li>
              <hr className='w-3/5 h-2 m-auto border-none outline-none bg-primary' hidden/>
            </NavLink>
        </ul>
        <div className='flex items-center gap-4'>
          {
            token && userData
            ? <div ref={profileMenuRef} className='relative flex items-center gap-2'>
              <button
                type='button'
                onClick={() => setShowProfile((prev) => !prev)}
                className='flex items-center gap-2'
                aria-haspopup='menu'
                aria-expanded={showProfile}
              >
                <img className='w-8 h-8 rounded-full' src={userData.image} alt="" />
                <img className='w-2.5' src={assets.dropdown_icon} alt="" />
              </button>
              {showProfile && (
                <div className='absolute right-0 z-50 text-base font-medium text-gray-600 top-8 pt-2' role='menu'>
                  <div className='flex flex-col gap-4 p-4 rounded min-w-48 bg-stone-100'>
                    <p onClick={()=>{navigate('/my-profile'); setShowProfile(false)}} className='cursor-pointer hover:text-black'>Hồ sơ của tôi</p>
                    <p onClick={()=>{navigate('/my-appointments'); setShowProfile(false)}} className='cursor-pointer hover:text-black'>Lịch hẹn của tôi</p>
                    <p onClick={()=>{navigate('/my-wallet'); setShowProfile(false)}} className='cursor-pointer hover:text-black'>Ví của tôi</p>
                    <p onClick={()=>{logout()}} className='cursor-pointer hover:text-black'>Đăng xuất</p>
                  </div>
                </div>
              )}
            </div>
            :<div className='hidden items-center rounded-full bg-primary px-5 py-3 text-sm font-medium text-white shadow-sm md:flex'>
              <button
                type='button'
                onClick={() => navigate('/login?mode=login')}
                className='transition-opacity hover:opacity-80'
              >
                Đăng nhập
              </button>
              <span className='mx-3 text-white/70'>|</span>
              <button
                type='button'
                onClick={() => navigate('/login?mode=signup')}
                className='transition-opacity hover:opacity-80'
              >
                Đăng ký
              </button>
            </div>
          }
          <img onClick={() => setShowMenu(true)} className='w-6 md:hidden' src={assets.menu_icon} alt="" />

        {/* ---- Mobile Menu ---- */}
        <div className={`md:hidden ${showMenu ? 'fixed w-full' : 'h-0 w-0'} right-0 top-0 bottom-0 z-[10000] overflow-hidden bg-white transition-all`}>
          <div className='flex items-center justify-between px-5 py-6'>
            <img src={assets.logo} className='w-36' alt="" />
            <button
              type='button'
              onClick={() => setShowMenu(false)}
              aria-label='Đóng menu'
              className='flex items-center justify-center w-10 h-10 text-3xl font-light leading-none text-gray-500 rounded-full hover:bg-gray-100'
            >
              ×
            </button>
          </div>
          
          <ul className='flex flex-col items-center gap-2 mt-5 px-5 text-lg font-medium'>
            <NavLink onClick={() => setShowMenu(false)} to='/'><p className='px-4 py-2 rounded full inline-block'>TRANG CHỦ</p></NavLink>
            <NavLink onClick={() => setShowMenu(false)} to='/stylists' ><p className='px-4 py-2 rounded full inline-block'>TẤT CẢ CHUYÊN VIÊN</p></NavLink>
            <NavLink onClick={() => setShowMenu(false)} to='/about' ><p className='px-4 py-2 rounded full inline-block'>VỀ HDNCARE</p></NavLink>
            <NavLink onClick={() => setShowMenu(false)} to='/ai-makeup' ><p className='px-4 py-2 rounded full inline-block'>AI Makeup</p></NavLink>
          </ul>
        </div>
        </div>
    </div>
  )
}

export default Navbar
