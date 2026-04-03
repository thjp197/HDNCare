import { useContext, useEffect, useState } from 'react'
import { StylistContext } from '../../context/StylistContext'
import { AppContext } from '../../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const StylistProfile = () => {
  const { sToken, profileData, setProfileData, getProfileData, backendUrl } = useContext(StylistContext)
  const { currency } = useContext(AppContext)
  const [isEdit, setIsEdit] = useState(false)

  const updateProfile = async () => {
    try {
      const updateData = {
        address: profileData.address,
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
      console.log(error)
      toast.error(error.message)
    }
  }

  useEffect(() => {
    if (sToken) getProfileData()
  }, [sToken])

  return profileData && (
    <div className='m-5 w-full'>
      <div className='bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden'>

        {/* Header banner */}
        <div className='h-32 bg-gradient-to-r from-rose-100 via-pink-50 to-amber-50' />

        {/* Avatar + name row */}
        <div className='px-8 pb-6'>
          <div className='flex flex-col sm:flex-row items-start sm:items-end gap-5 -mt-16'>
            <img
              className='w-32 h-32 rounded-2xl object-cover border-4 border-white shadow-md'
              src={profileData.image} alt="Profile"
            />
            <div className='pb-1'>
              <p className='text-2xl font-bold text-gray-800'>{profileData.name}</p>
              <div className='flex items-center gap-2 mt-1 text-gray-500 text-sm'>
                <span>{profileData.degree} · {profileData.speciality}</span>
                <span className='px-2 py-0.5 bg-rose-50 text-rose-600 border border-rose-200 rounded-full text-xs'>{profileData.experience}</span>
              </div>
            </div>
          </div>

          {/* Divider */}
          <hr className='my-6 border-gray-100' />

          {/* Info grid */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>

            {/* About */}
            <div className='lg:col-span-2'>
              <p className='text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1'>Về nhà tạo mẫu</p>
              <p className='text-sm text-gray-600 leading-relaxed'>{profileData.about}</p>
            </div>

            {/* Fees */}
            <div>
              <p className='text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1'>Phí dịch vụ</p>
              <p className='text-lg font-semibold text-gray-800'>{profileData.fees?.toLocaleString('vi-VN')} {currency}</p>
            </div>

            {/* Address */}
            <div>
              <p className='text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1'>Địa chỉ</p>
              {isEdit ? (
                <div className='flex flex-col gap-2'>
                  <input
                    className='border rounded-lg px-3 py-2 text-sm w-full'
                    value={profileData.address.line1}
                    onChange={e => setProfileData(prev => ({ ...prev, address: { ...prev.address, line1: e.target.value } }))}
                  />
                  <input
                    className='border rounded-lg px-3 py-2 text-sm w-full'
                    value={profileData.address.line2}
                    onChange={e => setProfileData(prev => ({ ...prev, address: { ...prev.address, line2: e.target.value } }))}
                  />
                </div>
              ) : (
                <p className='text-sm text-gray-600'>
                  {profileData.address.line1}<br />{profileData.address.line2}
                </p>
              )}
            </div>

            {/* Available */}
            <div className='flex items-center gap-2'>
              <input
                type='checkbox'
                id='available'
                checked={profileData.available}
                onChange={() => isEdit && setProfileData(prev => ({ ...prev, available: !prev.available }))}
                className='w-4 h-4 accent-green-600'
              />
              <label htmlFor='available' className='text-sm text-gray-600'>Đang hoạt động</label>
            </div>
          </div>

          {/* Actions */}
          <div className='flex gap-3 mt-8'>
            {isEdit ? (
              <>
                <button onClick={updateProfile} className='px-8 py-2.5 bg-primary text-white rounded-full text-sm font-medium hover:opacity-90 transition-all'>Lưu thay đổi</button>
                <button onClick={() => { setIsEdit(false); getProfileData() }} className='px-8 py-2.5 border border-gray-300 rounded-full text-sm text-gray-600 hover:bg-gray-50 transition-all'>Hủy</button>
              </>
            ) : (
              <button onClick={() => setIsEdit(true)} className='px-8 py-2.5 border border-primary text-primary rounded-full text-sm font-medium hover:bg-primary hover:text-white transition-all'>Chỉnh sửa</button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default StylistProfile
