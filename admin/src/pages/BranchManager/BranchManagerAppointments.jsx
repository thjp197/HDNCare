import { useContext, useEffect, useMemo, useState } from 'react'
import { StylistContext } from '../../context/StylistContext'
import { isAppointmentExpired } from '../../utils/appointmentUtils'

const getAppointmentTimeValue = (appointment) => {
  const [day, month, year] = String(appointment?.slotDate || '').split('_').map(Number)
  const timeMatch = String(appointment?.slotTime || '').trim().match(/^(\d{1,2}):(\d{2})(?:\s*([AP]M))?$/i)

  if (!day || !month || !year || !timeMatch) {
    return Number.NEGATIVE_INFINITY
  }

  let hour = Number(timeMatch[1])
  const minute = Number(timeMatch[2])
  const period = timeMatch[3]?.toUpperCase()

  if (period === 'PM' && hour < 12) hour += 12
  if (period === 'AM' && hour === 12) hour = 0

  const date = new Date(year, month - 1, day, hour, minute)
  return Number.isNaN(date.getTime()) ? Number.NEGATIVE_INFINITY : date.getTime()
}

const BranchManagerAppointments = () => {
  const { sToken, getBranchManagerAppointments, appointments, cancelBranchManagerAppointment } = useContext(StylistContext)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [appointmentToCancel, setAppointmentToCancel] = useState(null)

  const sortedAppointments = useMemo(
    () =>
      [...(appointments || [])].sort(
        (first, second) => getAppointmentTimeValue(second) - getAppointmentTimeValue(first),
      ),
    [appointments],
  )

  useEffect(() => {
    if (sToken) {
      getBranchManagerAppointments()
    }
  }, [sToken])

  const getHoursUntilAppointment = (slotDate, slotTime) => {
    const [dayStr, monthStr, yearStr] = slotDate.split("_")
    const [hourStr, minuteStr] = slotTime.split(":")

    const appointmentDateTime = new Date(
      parseInt(yearStr),
      parseInt(monthStr) - 1,
      parseInt(dayStr),
      parseInt(hourStr),
      parseInt(minuteStr)
    )

    const now = new Date()
    return (appointmentDateTime - now) / (1000 * 60 * 60)
  }

  const openCancelModal = (appointmentId) => {
    setAppointmentToCancel(appointmentId)
    setShowCancelModal(true)
  }

  const closeCancelModal = () => {
    setShowCancelModal(false)
    setAppointmentToCancel(null)
  }

  const handleConfirmCancel = async (shouldPenalize) => {
    if (!appointmentToCancel) return
    await cancelBranchManagerAppointment(appointmentToCancel, { penalizeUser: shouldPenalize })
    closeCancelModal()
    getBranchManagerAppointments()
  }

  const openDetailsModal = (appointment) => {
    setSelectedAppointment(appointment)
    setShowDetailsModal(true)
  }

  return (
    <div className='max-h-[90vh] overflow-y-auto p-4 font-sans sm:p-5'>
      <h1 className='mb-6 text-xl font-bold sm:text-2xl'>Lịch Hẹn Chi Nhánh</h1>

      <div className='bg-white rounded-lg shadow-md overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='w-full min-w-[820px]'>
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
              {sortedAppointments.length > 0 ? (
                sortedAppointments.map((item, index) => {
                  const isExpired = isAppointmentExpired(item)
                  return (
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
                        ) : isExpired ? (
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
                          {!item.cancelled && !isExpired && (
                            <button
                              onClick={() => openCancelModal(item._id)}
                              className='px-3 py-1 text-red-600 hover:text-red-800 font-medium text-xs'
                            >
                              Hủy
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
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

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'>
          <div className='w-full max-w-md rounded-lg bg-white p-6 shadow-lg'>
            <h2 className='mb-3 text-xl font-bold text-gray-800'>Xác nhận hủy đơn</h2>

            {appointmentToCancel && appointments.find(a => a._id === appointmentToCancel) && (() => {
              const appointment = appointments.find(a => a._id === appointmentToCancel)
              const hoursUntil = getHoursUntilAppointment(appointment.slotDate, appointment.slotTime)
              const isWithin2Hours = hoursUntil < 2 && hoursUntil >= 0

              return (
                <>
                  {isWithin2Hours && (
                    <div className='mb-4 p-3 bg-red-50 border border-red-300 rounded-lg'>
                      <p className='text-sm font-semibold text-red-700'>⚠️ Cảnh báo vi phạm chính sách</p>
                      <p className='text-sm text-red-600 mt-1'>
                        Lịch hẹn này còn {Math.round(hoursUntil * 60)} phút nữa.
                        Hủy trong vòng 2 giờ trước giờ hẹn sẽ phạt người dùng 1 lần.
                      </p>
                    </div>
                  )}

                  <p className='text-gray-600 mb-6'>
                    {isWithin2Hours
                      ? 'Chỉ có thể hủy và phạt người dùng'
                      : 'Chọn cách thức hủy lịch hẹn'
                    }
                  </p>

                  <div className='mt-6 flex flex-col gap-3'>
                    <button
                      onClick={() => handleConfirmCancel(false)}
                      disabled={isWithin2Hours}
                      className={`rounded-lg border-2 border-yellow-500 px-4 py-3 text-gray-800 font-medium transition ${
                        isWithin2Hours
                          ? 'bg-gray-100 opacity-50 cursor-not-allowed text-gray-400'
                          : 'bg-yellow-50 hover:bg-yellow-100'
                      }`}
                      title={isWithin2Hours ? 'Không thể hủy không phạt trong 2 giờ trước giờ hẹn' : ''}
                    >
                      Hủy không phạt
                    </button>
                    <button
                      onClick={() => handleConfirmCancel(true)}
                      className='rounded-lg bg-red-600 px-4 py-3 text-white font-medium transition hover:bg-red-700'
                    >
                      {isWithin2Hours ? 'Hủy và phạt (bắt buộc)' : 'Hủy và phạt người dùng'}
                    </button>
                    <button
                      onClick={closeCancelModal}
                      className='rounded-lg bg-gray-200 px-4 py-2 text-gray-800 transition hover:bg-gray-300'
                    >
                      Đóng
                    </button>
                  </div>
                </>
              )
            })()}
          </div>
        </div>
      )}
    </div>
  )
}

export default BranchManagerAppointments
