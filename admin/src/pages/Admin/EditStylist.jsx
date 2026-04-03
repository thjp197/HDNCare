import { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AdminContext } from '../../context/AdminContext'
import { assets } from '../../assets/assets'
import { toast } from 'react-toastify'
import axios from 'axios'

const EditStylist = () => {
  const { stylistId } = useParams()
  const { aToken, backendUrl, stylists, getAllStylists } = useContext(AdminContext)
  const navigate = useNavigate()

  const [image, setImage] = useState(null)
  const [name, setName] = useState('')
  const [speciality, setSpeciality] = useState('')
  const [degree, setDegree] = useState('')
  const [experience, setExperience] = useState('')
  const [about, setAbout] = useState('')
  const [fees, setFees] = useState('')
  const [available, setAvailable] = useState(true)
  const [address1, setAddress1] = useState('')
  const [address2, setAddress2] = useState('')
  const [currentImage, setCurrentImage] = useState('')

  useEffect(() => {
    if (stylists.length === 0) getAllStylists()
  }, [aToken])

  useEffect(() => {
    const sty = stylists.find(s => s._id === stylistId)
    if (sty) {
      setName(sty.name)
      setSpeciality(sty.speciality)
      setDegree(sty.degree)
      setExperience(sty.experience)
      setAbout(sty.about)
      setFees(sty.fees)
      setAvailable(sty.available)
      setAddress1(sty.address?.line1 || '')
      setAddress2(sty.address?.line2 || '')
      setCurrentImage(sty.image)
    }
  }, [stylists, stylistId])

  const onSubmit = async (e) => {
    e.preventDefault()
    try {
      const formData = new FormData()
      formData.append('stylistId', stylistId)
      formData.append('name', name)
      formData.append('speciality', speciality)
      formData.append('degree', degree)
      formData.append('experience', experience)
      formData.append('about', about)
      formData.append('fees', fees)
      formData.append('available', available)
      formData.append('address', JSON.stringify({ line1: address1, line2: address2 }))
      if (image) formData.append('image', image)

      const { data } = await axios.post(backendUrl + '/api/admin/update-stylist', formData, { headers: { aToken } })
      if (data.success) {
        toast.success(data.message)
        getAllStylists()
        navigate('/stylists-list')
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <form onSubmit={onSubmit} className='m-5 w-full'>
      <p className='mb-4 text-lg font-medium'>Chỉnh sửa thông tin nhân viên</p>
      <div className='bg-white px-8 py-8 border rounded w-full max-h-[80vh] overflow-y-scroll'>

        {/* Image */}
        <div className='flex items-center gap-4 mb-8'>
          <label htmlFor='sty-img' className='cursor-pointer'>
            <img className='w-16 h-16 rounded-full object-cover border'
              src={image ? URL.createObjectURL(image) : currentImage || assets.upload_area}
              alt=""
            />
          </label>
          <input onChange={e => setImage(e.target.files[0])} type='file' id='sty-img' hidden />
          <p className='text-sm text-gray-500'>Nhấn để thay ảnh</p>
        </div>

        <div className='flex flex-col lg:flex-row gap-10'>
          <div className='w-full lg:flex-1 flex flex-col gap-4'>
            <div className='flex flex-col gap-1'>
              <p>Tên nhân viên</p>
              <input value={name} onChange={e => setName(e.target.value)} className='border rounded px-3 py-2' type='text' required />
            </div>
            <div className='flex flex-col gap-1'>
              <p>Chuyên môn</p>
              <select value={speciality} onChange={e => setSpeciality(e.target.value)} className='border rounded px-3 py-2'>
                <option value='Gội đầu thư giãn'>Gội đầu thư giãn</option>
                <option value='Trang điểm'>Trang điểm</option>
                <option value='Cắt tóc'>Cắt tóc</option>
                <option value='Uốn và Duỗi tóc'>Uốn và Duỗi tóc</option>
                <option value='Chăm sóc da'>Chăm sóc da</option>
                <option value='Chăm sóc cơ thể'>Chăm sóc cơ thể</option>
              </select>
            </div>
            <div className='flex flex-col gap-1'>
              <p>Bằng cấp</p>
              <input value={degree} onChange={e => setDegree(e.target.value)} className='border rounded px-3 py-2' type='text' required />
            </div>
            <div className='flex flex-col gap-1'>
              <p>Kinh nghiệm</p>
              <select value={experience} onChange={e => setExperience(e.target.value)} className='border rounded px-3 py-2'>
                {['1 Year', '2 Year', '3 Year', '4 Year', '5 Year', '6 Year', '7 Year', '8 Year', '9 Year', '10 Year'].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          <div className='w-full lg:flex-1 flex flex-col gap-4'>
            <div className='flex flex-col gap-1'>
              <p>Phí dịch vụ (VNĐ)</p>
              <input value={fees} onChange={e => setFees(e.target.value)} className='border rounded px-3 py-2' type='number' required />
            </div>
            <div className='flex flex-col gap-1'>
              <p>Địa chỉ</p>
              <input value={address1} onChange={e => setAddress1(e.target.value)} className='border rounded px-3 py-2' type='text' placeholder='Dòng 1' />
              <input value={address2} onChange={e => setAddress2(e.target.value)} className='border rounded px-3 py-2' type='text' placeholder='Dòng 2' />
            </div>
            <div className='flex items-center gap-2 mt-2'>
              <input checked={available} onChange={e => setAvailable(e.target.checked)} type='checkbox' id='available' />
              <label htmlFor='available'>Hoạt động</label>
            </div>
          </div>
        </div>

        <div className='flex flex-col gap-1 mt-4'>
          <p>Giới thiệu</p>
          <textarea value={about} onChange={e => setAbout(e.target.value)} className='border rounded px-3 py-2' rows={4} />
        </div>

        <div className='flex gap-3 mt-6'>
          <button type='submit' className='bg-primary text-white px-10 py-3 rounded-full'>Lưu thay đổi</button>
          <button type='button' onClick={() => navigate('/stylists-list')} className='border px-10 py-3 rounded-full'>Hủy</button>
        </div>
      </div>
    </form>
  )
}

export default EditStylist
