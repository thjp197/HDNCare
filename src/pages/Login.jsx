import React, { useState } from 'react'

const Login = () => {

  const [state, setState] = useState('Sign Up')

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const onSubmitHandler = (event) => {
    event.preventDefault()
    // TODO: Add login/signup logic later
    console.log({ state, name, email, password })
  }

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
        <div className='w-full '>
          <p>Mật khẩu</p>
          <input onChange={(e) => setPassword(e.target.value)} value={password} className='border border-[#DADADA] rounded w-full p-2 mt-1' type="password" required />
        </div>
        <button className='bg-primary text-white w-full py-2 my-2 rounded-md text-base'>{state === 'Sign Up' ? 'Tạo tài khoản' : 'Đăng nhập'}</button>
        {state === 'Sign Up'
          ? <p>Đã có tài khoản? <span onClick={() => setState('Login')} className='text-primary underline cursor-pointer'>Đăng nhập tại đây</span></p>
          : <p>Chưa có tài khoản? <span onClick={() => setState('Sign Up')} className='text-primary underline cursor-pointer'>Nhấn tại đây</span></p>
        }
      </div>
    </form>
  )
}

export default Login