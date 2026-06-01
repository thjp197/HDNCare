import React, { useState, useContext, useEffect } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigate, useSearchParams } from 'react-router-dom'


const Login = () => {

  const { backendUrl, token, setToken, setShowBannedAccountModal } = useContext(AppContext)
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const state = searchParams.get('mode') === 'login' ? 'Login' : 'Sign Up'

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [phoneError, setPhoneError] = useState('')

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, '')
    setPhone(value)

    if (value.length > 0 && value.length !== 10) {
      setPhoneError('Số điện thoại phải có 10 số')
    } else {
      setPhoneError('')
    }
  }

  const onSubmitHandler = async (event) => {
    event.preventDefault()
    try {
      if (state === 'Sign Up') {
        if (phoneError || !phone) {
          toast.error('Vui lòng nhập số điện thoại hợp lệ')
          return
        }

        if (password !== confirmPassword) {
          toast.error('Mật khẩu nhập lại không trùng khớp')
          return
        }

        const { data } = await axios.post(backendUrl + '/api/user/register', { name, email, password, phone })

        if (data.success) {
          localStorage.setItem('token', data.token)
          setToken(data.token)
          navigate('/')
        } else {
          toast.error(data.message)
        }

      } else {

        const { data } = await axios.post(backendUrl + '/api/user/login', { email, password })

        if (data.success) {
          localStorage.setItem('token', data.token)
          setToken(data.token)
          navigate('/')
        } else {
          // Kiểm tra nếu tài khoản bị khóa
          if (data.message && data.message.toLowerCase().includes('bị khóa')) {
            setShowBannedAccountModal(true)
          } else {
            toast.error(data.message)
          }
        }

      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(() => {
    if (token) {
      navigate('/')
    }
  }, [token, navigate])

  return (
    <form onSubmit={onSubmitHandler} className='min-h-[80vh] flex items-center'>
      <div className='flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-[#5E5E5E] text-sm shadow-lg'>
        <p className='text-2xl font-semibold'>{state === 'Sign Up' ? 'Tạo Tài Khoản' : 'Đăng Nhập'}</p>
        <p>Vui lòng {state === 'Sign Up' ? 'đăng ký' : 'đăng nhập'} để đặt lịch hẹn</p>
        {state === 'Sign Up'
          ? <div className='w-full '>
            <p>Họ và Tên</p>
            <input onChange={(e) => setName(e.target.value)} value={name} className='border border-[#DADADA] rounded w-full p-2 mt-1' type="text" required />
          </div>
          : null
        }
        <div className='w-full '>
          <p>Email</p>
          <input onChange={(e) => setEmail(e.target.value)} value={email} className='border border-[#DADADA] rounded w-full p-2 mt-1' type="email" required />
        </div>
        {state === 'Sign Up'
          ? <div className='w-full '>
            <p>Số Điện Thoại</p>
            <input onChange={handlePhoneChange} value={phone} className={`border rounded w-full p-2 mt-1 ${phoneError ? 'border-red-500' : 'border-[#DADADA]'}`} type="text" required />
            {phoneError && <p className='text-red-500 text-xs mt-1'>{phoneError}</p>}
          </div>
          : null
        }
        <div className='w-full '>
          <p>Mật khẩu</p>
          <input onChange={(e) => setPassword(e.target.value)} value={password} className='border border-[#DADADA] rounded w-full p-2 mt-1' type="password" required />
        </div>
        {state === 'Sign Up'
          ? <div className='w-full '>
            <p>Nhập lại Mật khẩu</p>
            <input onChange={(e) => setConfirmPassword(e.target.value)} value={confirmPassword} className='border border-[#DADADA] rounded w-full p-2 mt-1' type="password" required />
          </div>
          : null
        }
        <button type="submit" className='bg-primary text-white w-full py-2 my-2 rounded-md text-base'>{state === 'Sign Up' ? 'Tạo tài khoản' : 'Đăng nhập'}</button>
        {state === 'Sign Up'
          ? <p>Đã có tài khoản? <span onClick={() => setSearchParams({ mode: 'login' })} className='text-primary underline cursor-pointer'>Đăng nhập tại đây</span></p>
          : <p>Chưa có tài khoản? <span onClick={() => setSearchParams({ mode: 'signup' })} className='text-primary underline cursor-pointer'>Nhấn tại đây</span></p>
        }
      </div>
    </form>
  )
}

export default Login
