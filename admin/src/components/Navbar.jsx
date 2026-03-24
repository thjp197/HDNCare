import React, { useContext } from 'react'
import { AdminContext } from '../context/AdminContext'
import { StylistContext } from '../context/StylistContext'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'

const Navbar = () => {

    const {aToken, setAToken} = useContext(AdminContext)
    const {sToken, setSToken} = useContext(StylistContext)

    const navigate = useNavigate()

    const logout = () => {
        navigate('/')
        aToken && setAToken('')
        aToken && localStorage.removeItem('aToken')
        sToken && setSToken('')
        sToken && localStorage.removeItem('sToken')
    }

  return (
    <div className='flex justify-between items-center px-4 sm:px-10 py-3 border-b bg-white'>
        <div className='flex items-center gap-2 text-xs'>
            <img className='max-w-[250px] max-h-[120px] object-contain cursor-pointer' src={assets.admin_logo} alt="" /> 
            {/* max-w-[207px] max-h-[49px] object-contain */}
            <p className='border px-2.5 py-0.5 rounded-full border-gray-500 text-gray-600'>{aToken ? 'Admin' : 'Stylist'}</p>
        </div>
        <button className='bg-primary text-white text-sm px-10 py-2 rounded-full' onClick={logout}>
            Logout
        </button>
    </div>
  )
}

export default Navbar