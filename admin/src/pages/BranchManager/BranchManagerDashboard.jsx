import { useContext, useEffect, useState } from 'react'
import { StylistContext } from '../../context/StylistContext'
import { assets } from '../../assets/assets'
import { isAppointmentExpired } from '../../utils/appointmentUtils'

const BranchManagerDashboard = () => {
  const { sToken, getBranchManagerDashboard, dashData } = useContext(StylistContext)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (sToken) {
      loadDashboard()
    }
  }, [sToken])

  const loadDashboard = async () => {
    try {
      setLoading(true)
      setError(null)
      await getBranchManagerDashboard()
    } catch (err) {
      console.error('Error loading dashboard:', err)
      setError('Không thể tải dữ liệu bảng điều khiển')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className='max-h-[90vh] overflow-y-auto p-4 font-sans sm:p-5'>
        <div className='flex justify-center items-center py-12'>
          <p className='text-gray-600'>Đang tải...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='max-h-[90vh] overflow-y-auto p-4 font-sans sm:p-5'>
        <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
          <p className='text-red-800'>{error}</p>
          <button
            onClick={loadDashboard}
            className='mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600'
          >
            Thử lại
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className='max-h-[90vh] overflow-y-auto p-4 font-sans sm:p-5'>
      <h1 className='mb-6 text-xl font-bold sm:text-2xl'>Bảng Điều Khiển Chi Nhánh</h1>

      {dashData && (
        <>
          {/* Branch Name */}
          <div className='mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg'>
            <h2 className='text-xl font-semibold text-blue-800'>{dashData.branch}</h2>
          </div>

          {/* Stats Cards */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8'>
            <div className='bg-white border border-gray-200 rounded-lg p-6 flex items-center gap-4 shadow-sm hover:shadow-md transition'>
              <div className='bg-blue-100 p-3 rounded'>
                <img src={assets.earning_icon} className='w-6 h-6' alt="earnings" />
              </div>
              <div>
                <p className='text-gray-600 text-sm'>Doanh Thu</p>
                <p className='text-2xl font-bold text-gray-800'>{dashData.earnings.toLocaleString('vi-VN')} đ</p>
              </div>
            </div>

            <div className='bg-white border border-gray-200 rounded-lg p-6 flex items-center gap-4 shadow-sm hover:shadow-md transition'>
              <div className='bg-purple-100 p-3 rounded'>
                <img src={assets.appointment_icon} className='w-6 h-6' alt="appointments" />
              </div>
              <div>
                <p className='text-gray-600 text-sm'>Lịch Hẹn</p>
                <p className='text-2xl font-bold text-gray-800'>{dashData.appointments}</p>
              </div>
            </div>

            <div className='bg-white border border-gray-200 rounded-lg p-6 flex items-center gap-4 shadow-sm hover:shadow-md transition'>
              <div className='bg-green-100 p-3 rounded'>
                <img src={assets.people_icon} className='w-6 h-6' alt="stylists" />
              </div>
              <div>
                <p className='text-gray-600 text-sm'>Nhân Viên</p>
                <p className='text-2xl font-bold text-gray-800'>{dashData.stylists}</p>
              </div>
            </div>

            <div className='bg-white border border-gray-200 rounded-lg p-6 flex items-center gap-4 shadow-sm hover:shadow-md transition'>
              <div className='bg-orange-100 p-3 rounded'>
                <img src={assets.list_icon} className='w-6 h-6' alt="latest" />
              </div>
              <div>
                <p className='text-gray-600 text-sm'>Lịch Hẹn Gần Đây</p>
                <p className='text-2xl font-bold text-gray-800'>{dashData.latestAppointments?.length || 0}</p>
              </div>
            </div>
          </div>

          {/* Recent Appointments */}
          <div className='bg-white rounded-lg shadow-md overflow-hidden'>
            <div className='p-6 border-b border-gray-200'>
              <h2 className='text-xl font-semibold'>Lịch Hẹn Gần Đây</h2>
            </div>
            <div className='overflow-x-auto'>
              <table className='w-full min-w-[720px]'>
                <thead className='bg-gray-50 border-b border-gray-200'>
                  <tr>
                    <th className='px-6 py-3 text-left text-sm font-medium text-gray-600'>Khách Hàng</th>
                    <th className='px-6 py-3 text-left text-sm font-medium text-gray-600'>Nhân Viên</th>
                    <th className='px-6 py-3 text-left text-sm font-medium text-gray-600'>Ngày</th>
                    <th className='px-6 py-3 text-left text-sm font-medium text-gray-600'>Giá</th>
                    <th className='px-6 py-3 text-left text-sm font-medium text-gray-600'>Trạng Thái</th>
                  </tr>
                </thead>
                <tbody>
                  {dashData.latestAppointments && dashData.latestAppointments.length > 0 ? (
                    dashData.latestAppointments.map((item, index) => (
                      <tr key={index} className='border-b border-gray-200 hover:bg-gray-50'>
                        <td className='px-6 py-4 text-sm'>
                          <p className='font-medium'>{item.userData?.name || 'N/A'}</p>
                          <p className='text-gray-500'>{item.userData?.email || ''}</p>
                        </td>
                        <td className='px-6 py-4 text-sm'>
                          <p className='font-medium'>{item.styData?.name || 'N/A'}</p>
                        </td>
                        <td className='px-6 py-4 text-sm'>{item.slotDate || 'N/A'}</td>
                        <td className='px-6 py-4 text-sm font-medium'>{item.amount?.toLocaleString('vi-VN') || 0} đ</td>
                        <td className='px-6 py-4 text-sm'>
                          {item.cancelled ? (
                            <span className='px-3 py-1 bg-red-100 text-red-800 rounded'>Đã Hủy</span>
                          ) : item.isCompleted ? (
                            <span className='px-3 py-1 bg-green-100 text-green-800 rounded'>Hoàn Thành</span>
                          ) : isAppointmentExpired(item) ? (
                            <span className='px-3 py-1 bg-gray-100 text-gray-800 rounded'>Hết Hạn</span>
                          ) : (
                            <span className='px-3 py-1 bg-yellow-100 text-yellow-800 rounded'>Chưa Xong</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className='px-6 py-8 text-center text-gray-500'>
                        Không có lịch hẹn gần đây
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default BranchManagerDashboard
