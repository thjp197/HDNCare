import { useContext, useEffect, useState } from 'react'
import { StylistContext } from '../../context/StylistContext'

const BranchManagerStylists = () => {
  const { sToken, getBranchManagerStylists } = useContext(StylistContext)
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

  return (
    <div className='max-h-[90vh] overflow-y-auto p-4 font-sans sm:p-5'>
      <h1 className='mb-6 text-xl font-bold sm:text-2xl'>Nhân Viên Chi Nhánh</h1>

      {loading ? (
        <div className='flex justify-center py-12'>
          <p className='text-gray-600'>Đang tải...</p>
        </div>
      ) : stylists && stylists.length > 0 ? (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {stylists.map((stylist, index) => (
            <div
              key={index}
              className='bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition border border-gray-200'
            >
              {stylist.image && (
                <img
                  src={stylist.image}
                  alt={stylist.name}
                  className='w-full h-48 object-cover bg-gray-100'
                />
              )}
              <div className='p-4'>
                <h3 className='text-lg font-semibold text-gray-800'>{stylist.name}</h3>
                <p className='text-sm text-gray-600 mb-2'>{stylist.speciality}</p>
                
                <div className='space-y-2 text-sm text-gray-700 mb-4'>
                  <div>
                    <span className='font-medium'>Kinh nghiệm:</span> {stylist.experience}
                  </div>
                  <div>
                    <span className='font-medium'>Học vấn:</span> {stylist.degree}
                  </div>
                  <div>
                    <span className='font-medium'>Giá:</span> {stylist.fees?.toLocaleString('vi-VN')} đ
                  </div>
                  <div>
                    <span className='font-medium'>Trạng thái:</span>{' '}
                    <span className={stylist.available ? 'text-green-600' : 'text-red-600'}>
                      {stylist.available ? 'Hoạt động' : 'Không hoạt động'}
                    </span>
                  </div>
                </div>

                {stylist.isBranchManager && (
                  <div className='mb-4 p-2 bg-blue-100 border border-blue-300 rounded'>
                    <p className='text-sm font-semibold text-blue-800'>👑 Trưởng Chi Nhánh</p>
                  </div>
                )}

                {stylist.about && (
                  <p className='text-sm text-gray-600 italic'>"{stylist.about}"</p>
                )}
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
