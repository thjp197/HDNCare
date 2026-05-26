import React, { useContext, useState } from 'react'
import { AdminContext } from '../context/AdminContext'
import { StylistContext } from '../context/StylistContext'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'

const Navbar = ({ onMenuOpen }) => {

    const {aToken, setAToken} = useContext(AdminContext)
    const {sToken, setSToken} = useContext(StylistContext)
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

    const navigate = useNavigate()

    const logout = () => {
        setShowLogoutConfirm(false)
        navigate('/')
        aToken && setAToken('')
        aToken && localStorage.removeItem('aToken')
        sToken && setSToken('')
        sToken && localStorage.removeItem('sToken')
    }

  return (
    <>
    <div className='flex items-center justify-between gap-3 border-b bg-white px-4 py-3 sm:px-10'>
        <div className='flex min-w-0 items-center gap-2 text-xs'>
            <img className='h-14 w-28 flex-shrink-0 cursor-pointer object-contain sm:h-20 sm:w-44 lg:h-24 lg:w-56' src={assets.admin_logo} alt="" /> 
            {/* max-w-[207px] max-h-[49px] object-contain */}
            <p className='whitespace-nowrap rounded-full border border-gray-500 px-2 py-0.5 text-[11px] text-gray-600 sm:px-2.5 sm:text-xs'>{aToken ? 'Quản trị viên' : 'Chuyên viên'}</p>
        </div>
        <div className='flex items-center gap-2 sm:gap-3'>
            <button
                type='button'
                onClick={onMenuOpen}
                aria-label='Mở menu'
                className='inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm transition hover:bg-gray-50 md:hidden'
            >
                <span className='flex flex-col gap-1'>
                    <span className='block h-0.5 w-4 rounded-full bg-current'></span>
                    <span className='block h-0.5 w-4 rounded-full bg-current'></span>
                    <span className='block h-0.5 w-4 rounded-full bg-current'></span>
                </span>
            </button>
            <button className='rounded-full bg-primary px-4 py-2 text-xs font-medium text-white sm:px-10 sm:text-sm' onClick={() => setShowLogoutConfirm(true)}>
                Đăng xuất
            </button>
        </div>
    </div>

    {showLogoutConfirm && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4'>
            <div className='w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl'>
                <p className='text-lg font-semibold text-gray-900'>Xác nhận đăng xuất</p>
                <p className='mt-2 text-sm leading-6 text-gray-600'>
                    Bạn có chắc chắn muốn đăng xuất khỏi trang quản trị không?
                </p>
                <div className='mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end'>
                    <button
                        type='button'
                        onClick={() => setShowLogoutConfirm(false)}
                        className='rounded-full border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50'
                    >
                        Hủy
                    </button>
                    <button
                        type='button'
                        onClick={logout}
                        className='rounded-full bg-primary px-5 py-2 text-sm font-medium text-white transition hover:opacity-90'
                    >
                        Đăng xuất
                    </button>
                </div>
            </div>
        </div>
    )}
    </>
  )
}

export default Navbar
