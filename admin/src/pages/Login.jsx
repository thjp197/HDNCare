import React, { useContext, useState } from "react";
import {AdminContext} from '../context/AdminContext'
import axios from "axios";
import { toast } from "react-toastify";
import { StylistContext } from "../context/StylistContext";

const Login = () => {
  const [state, setState] = useState('Admin');
  const [email, setEmail] = useState('')    
  const [password, setPassword] = useState('')

  const {setAToken, backendUrl} = useContext(AdminContext)
  const {setSToken} = useContext(StylistContext)
    const roleLabel = state === 'Admin' ? 'Quản trị viên' : 'Chuyên viên'

  const onSubmitHandler = async (event) => {
    event.preventDefault()

    try {
        if (state === 'Admin') {
            const {data} = await axios.post(backendUrl + '/api/admin/login',{email, password})
            if (data.success) {
                localStorage.setItem('aToken', data.token);
                setAToken(data.token);
            } else {
                toast.error(data.message)
            }
        } else {
             const {data} = await axios.post(backendUrl + '/api/stylist/login',{email, password})
            if (data.success) {
                localStorage.setItem('sToken', data.token);
                setSToken(data.token);
            } else {
                toast.error(data.message)
            }
        }
    } catch (error) {
                                toast.error(error?.response?.data?.message || error.message || 'Đăng nhập thất bại')
    }
  }

  return (
    <form onSubmit={onSubmitHandler} className="min-h-[80vh] flex items-center">
      <div className="flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-[#5E5E5E] text-sm shadow-lg">
            <p className='text-2xl font-semibold m-auto'><span className='text-primary'>{roleLabel} </span>đăng nhập</p>
            <div className="w-full">
                <p>Email</p>
                <input onChange={(e)=>setEmail(e.target.value)} value={email} className="border border-[#DADADA] rounded w-full p-2 mt-1" type="email" required />
            </div>
            <div className="w-full">
                <p>Mật khẩu</p>
                <input onChange={(e)=>setPassword(e.target.value)} value={password} className="border border-[#DADADA] rounded w-full p-2 mt-1" type="password" required />
            </div>

            <button className="bg-primary text-white w-full py-2 rounded-md text-base">Đăng nhập</button>
            {
                state === 'Admin' 
                ? <p>Đăng nhập với tư cách chuyên viên? <span className='text-primary underline cursor-pointer' onClick={() => setState('Stylist')} >Bấm vào đây</span></p>
                : <p>Đăng nhập với tư cách quản trị viên? <span className='text-primary underline cursor-pointer' onClick={() => setState('Admin')} >Bấm vào đây</span></p>
            }
      </div>
    </form>
  );
};

export default Login;
