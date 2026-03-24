import React, { useContext, useEffect, useState } from 'react'
import { StylistContext } from '../../context/StylistContext'
import { AppContext } from '../../context/AppContext'
import { address } from 'framer-motion/client'
import axios from 'axios'
import { toast } from 'react-toastify'

const StylistProfile = () => {

  const {sToken, profileData, setProfileData, getProfileData, backendUrl} = useContext(StylistContext)
  const {currency } = useContext(AppContext)

  const [isEdit, setIsEdit] = useState(false)

  const updateProfile = async () => {
    try {
      
      const updateData = {
        address: profileData.address,
        // fees: profileData.fees,
        available: profileData.available
      }

      const { data } = await axios.post(backendUrl + '/api/stylist/update-profile', updateData, { headers: { stoken: sToken } })

      if (data.success) {
        toast.success(data.message)
        setIsEdit(false)
        getProfileData()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
        toast.error(data.message)  
        console.log(error)
          
}
  }

  useEffect(() => {
    
    if (sToken) {
      getProfileData()
    }
  }, [sToken])

  return profileData && (
    <div>

      <div className='flex flex-col gap-4 m-5 '>

        <div>
          <img className='bg-primary/80 w-full sm:max-w-64 rounded-lg' src={profileData.image} alt="Profile" />
        </div>

        <div className='font-sans flex-1 border-stone-100 rounded-lg p-8 py-7 bg-white'>

          {/* Stylist info: name, degree, experience */}
          <p className='flex items-center gap-2 text-3xl font-medium font-sans text-gray-700'>{profileData.name}</p>
          <div className='flex items-center gap-2 mt-1 text-gray-600 font-sans'>
            <p>{profileData.degree} - {profileData.speciality}</p>
            <button className='py-0.5 px-2 border text-xs rounded-full'>{profileData.experience}</button>
          </div>

          {/* Stylist About */}
          <div>
            <p className='flex items-center gap-1 text-sm font-medium font-sans text-neutral-800 mt-3'>Về nhà tạo mẫu: </p>
            <p className='text-sm text-gray-600 max-w-[700px] mt-1 font-sans'>
              {profileData.about}
            </p>
          </div>

          <p className='text-gray-600 font-medium font-sans mt-4'>
            Giá tiền: <span className='text-gray-800 '> {profileData.fees} {currency}</span>
          </p>
          
          <div className='flex gap-4 py-4  font-sans'>
            <p className='font-sans'>Địa chỉ: </p>
            <p className='text-sm font-sans'>
              {isEdit ? <input type='text' onChange={(e)=> setProfileData(prev => ({...prev, address: {...prev.address, line1: e.target.value}}))} value={profileData.address.line1}/>: profileData.address.line1}
              <br />
              {isEdit ? <input type='text' onChange={(e)=> setProfileData(prev => ({...prev, address: {...prev.address, line2: e.target.value}}))} value={profileData.address.line2}/>: profileData.address.line2}
            </p>
          </div>

          <div className='flex gap-1 pt-2'>
            <input onChange={() => isEdit && setProfileData(prev => ({...prev, available: !prev.available}))} checked={profileData.available} type="checkbox" />
            <label htmlFor="">Hoạt động</label>
          </div>
           {
              isEdit
              ?  <button onClick={updateProfile} className='px-8 py-2 mt-5 border font-sans border-primary text-primary hover:bg-primary hover:text-white transition-all rounded-full'>Lưu</button>
              :  <button onClick={() => setIsEdit(true)} className='px-8 py-2 mt-5 border font-sans border-primary text-primary hover:bg-primary hover:text-white transition-all rounded-full'>Chỉnh sửa</button>
           }
        </div>
      </div>
      
    </div>
  )
}

export default StylistProfile
