import { useContext, useEffect, useState } from 'react'
import axios from 'axios'
import { StylistContext } from '../../context/StylistContext'
import { toast } from 'react-toastify'

const BranchManagerStylists = () => {
  const { sToken, getBranchManagerStylists, backendUrl } = useContext(StylistContext)
  const [stylists, setStylists] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (sToken) {
      loadStylists()
    }
  }, [sToken])

  const loadStylists = async () => {
    setLoading(true)
    const result = await getBranchManagerStylists()
    setStylists(result || [])
    setLoading(false)
  }

  const handleToggleAvailable = async (stylist) => {
    try {
      const { data } = await axios.post(
        backendUrl + '/api/stylist/toggle-availability',
        { stylistId: stylist._id },
        { headers: { stoken: sToken } }
      )

      if (data.success) {
        toast.success(data.message)
        loadStylists()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  return (
    <div className='max-h-[90vh] overflow-y-auto p-4 font-sans sm:p-5'>
      <h1 className='mb-6 text-xl font-bold sm:text-2xl'>Nhân Viên Chi Nhánh</h1>

      {loading ? (
        <div className='flex justify-center py-12'>
          <p className='text-gray-600'>Đang tải...</p>
        </div>
      ) : stylists && stylists.length > 0 ? (
        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6'>
          {stylists.map((stylist, index) => (
            <div key={index} className='bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition'>
              {/* Ảnh */}
              {stylist.image && (
                <img
                  src={stylist.image}
                  alt={stylist.name}
                  className='w-full h-56 object-cover bg-gray-100'
                />
              )}
              
              {/* Thông tin */}
              <div className='p-4'>
                {/* Tên */}
                <h3 className='text-lg font-bold text-gray-800 mb-1'>{stylist.name}</h3>
                
                {/* Chuyên ngành */}
                <p className='text-sm text-gray-600 mb-4'>{stylist.speciality}</p>
                
                {/* Checkbox Hoạt động */}
                <div className='flex items-center gap-2'>
                  <input
                    type='checkbox'
                    checked={stylist.available || false}
                    onChange={() => handleToggleAvailable(stylist)}
                    className='w-4 h-4 cursor-pointer'
                    id={`checkbox-${stylist._id}`}
                  />
                  <label htmlFor={`checkbox-${stylist._id}`} className='text-sm text-gray-700 cursor-pointer font-medium'>Hoạt động</label>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className='text-center py-12'>
          <p className='text-gray-600 text-lg'>Không có nhân viên nào trong chi nhánh này</p>
        </div>
      )}
    </div>
  )
}

export default BranchManagerStylists
