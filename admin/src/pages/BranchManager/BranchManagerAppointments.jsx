import { useContext, useEffect, useState } from 'react'
import { StylistContext } from '../../context/StylistContext'
import { toast } from 'react-toastify'
import { isAppointmentExpired } from '../../utils/appointmentUtils'

const BranchManagerAppointments = () => {
  const { sToken, getBranchManagerAppointments, appointments, cancelAppointment } = useContext(StylistContext)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState(null)

  useEffect(() => {
    if (sToken) {
      getBranchManagerAppointments()
    }
  }, [sToken])

  const handleCancelAppointment = async (appointmentId) => {
    const confirmed = window.confirm('Bạn có chắc muốn hủy lịch hẹn này?')
    if (confirmed) {
      await cancelAppointment(appointmentId)
      getBranchManagerAppointments()
    }
  }

  const openDetailsModal = (appointment) => {
    setSelectedAppointment(appointment)
    setShowDetailsModal(true)
  }

  return (
    <div className='m-5 max-h-[90vh] overflow-y-scroll font-sans'>
      <h1 className='text-2xl font-bold mb-6'>Lịch Hẹn Chi Nhánh</h1>

      <div className='bg-white rounded-lg shadow-md overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead className='bg-gray-100 border-b border-gray-300'>
              <tr>
                <th className='px-4 py-3 text-left text-sm font-semibold text-gray-700'>Khách Hàng</th>
                <th className='px-4 py-3 text-left text-sm font-semibold text-gray-700'>Nhân Viên</th>
                <th className='px-4 py-3 text-left text-sm font-semibold text-gray-700'>Ngày</th>
                <th className='px-4 py-3 text-left text-sm font-semibold text-gray-700'>Giờ</th>
                <th className='px-4 py-3 text-left text-sm font-semibold text-gray-700'>Giá</th>
                <th className='px-4 py-3 text-left text-sm font-semibold text-gray-700'>Trạng Thái</th>
                <th className='px-4 py-3 text-left text-sm font-semibold text-gray-700'>Hành Động</th>
              </tr>
            </thead>
            <tbody>
              {appointments && appointments.length > 0 ? (
                appointments.map((item, index) => (
                  <tr key={index} className='border-b border-gray-200 hover:bg-gray-50 transition'>
                    <td className='px-4 py-4'>
                      <p className='font-medium text-gray-800'>{item.userData?.name || 'N/A'}</p>
                      <p className='text-xs text-gray-500'>{item.userData?.email || ''}</p>
                    </td>
                    <td className='px-4 py-4'>
                      <p className='text-sm font-medium text-gray-800'>{item.styData?.name || 'N/A'}</p>
                      <p className='text-xs text-gray-500'>{item.styData?.speciality || ''}</p>
                    </td>
                    <td className='px-4 py-4 text-sm text-gray-700'>{item.slotDate || 'N/A'}</td>
                    <td className='px-4 py-4 text-sm text-gray-700'>{item.slotTime || 'N/A'}</td>
                    <td className='px-4 py-4 text-sm font-semibold text-gray-800'>{item.amount?.toLocaleString('vi-VN') || 0} đ</td>
                    <td className='px-4 py-4 text-sm'>
                      {item.cancelled ? (
                        <span className='inline-block px-3 py-1 bg-red-100 text-red-800 rounded text-xs font-medium'>Đã Hủy</span>
                      ) : item.isCompleted ? (
                        <span className='inline-block px-3 py-1 bg-green-100 text-green-800 rounded text-xs font-medium'>Hoàn Thành</span>
                      ) : isAppointmentExpired(item) ? (
                        <span className='inline-block px-3 py-1 bg-gray-100 text-gray-800 rounded text-xs font-medium'>Hết Hạn</span>
                      ) : (
                        <span className='inline-block px-3 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium'>Chưa Xong</span>
                      )}
                    </td>
                    <td className='px-4 py-4 text-sm'>
                      <div className='flex gap-2'>
                        <button
                          onClick={() => openDetailsModal(item)}
                          className='px-3 py-1 text-blue-600 hover:text-blue-800 font-medium text-xs'
                        >
                          Chi Tiết
                        </button>
                        {!item.cancelled && !isAppointmentExpired(item) && (
                          <button
                            onClick={() => handleCancelAppointment(item._id)}
                            className='px-3 py-1 text-red-600 hover:text-red-800 font-medium text-xs'
                          >
                            Hủy
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className='px-4 py-8 text-center text-gray-500'>
                    Không có lịch hẹn nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedAppointment && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg p-6 max-w-md w-full mx-4'>
            <h2 className='text-xl font-bold mb-4'>Chi Tiết Lịch Hẹn</h2>
            <div className='space-y-3 text-sm'>
              <div>
                <p className='text-gray-600'>Khách Hàng</p>
                <p className='font-semibold'>{selectedAppointment.userData?.name || 'N/A'}</p>
                <p className='text-gray-500'>{selectedAppointment.userData?.email || ''}</p>
              </div>
              <div>
                <p className='text-gray-600'>Nhân Viên</p>
                <p className='font-semibold'>{selectedAppointment.styData?.name || 'N/A'}</p>
              </div>
              <div>
                <p className='text-gray-600'>Ngày</p>
                <p className='font-semibold'>{selectedAppointment.slotDate || 'N/A'}</p>
              </div>
              <div>
                <p className='text-gray-600'>Giờ</p>
                <p className='font-semibold'>{selectedAppointment.slotTime || 'N/A'}</p>
              </div>
              <div>
                <p className='text-gray-600'>Giá</p>
                <p className='font-semibold text-lg'>{selectedAppointment.amount?.toLocaleString('vi-VN') || 0} đ</p>
              </div>
            </div>
            <button
              onClick={() => setShowDetailsModal(false)}
              className='w-full mt-6 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition'
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default BranchManagerAppointments
