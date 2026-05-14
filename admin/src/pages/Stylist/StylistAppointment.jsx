import React, { useState } from 'react'
import { useContext, useEffect } from 'react'
import { StylistContext } from '../../context/StylistContext'
import { AppContext } from '../../context/AppContext'
import { assets } from '../../assets/assets'

const StylistAppointments = () => {

  const { sToken, appointments, getAppointments, completeAppointment, cancelAppointment } = useContext(StylistContext)
  const { slotDateFormat, calculateAge, currency } = useContext(AppContext)
  const [cancelReasonModalOpen, setCancelReasonModalOpen] = useState(false);
  const [selectedCancellationData, setSelectedCancellationData] = useState(null);
  const [cancelConfirmModalOpen, setCancelConfirmModalOpen] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState(null);
  const [hoverPreview, setHoverPreview] = useState(null);
  const [lightboxImage, setLightboxImage] = useState(null);

  useEffect(() => {
    if (sToken) {
      getAppointments()
    }
  }, [sToken])

  const openCancellationReasonModal = (cancellationReasons, cancellationDetails) => {
    setSelectedCancellationData({
      reasons: cancellationReasons || [],
      details: cancellationDetails || "",
    });
    setCancelReasonModalOpen(true);
  };

  const closeCancellationReasonModal = () => {
    setCancelReasonModalOpen(false);
    setSelectedCancellationData(null);
  };

  const openCancelConfirmModal = (appointmentId) => {
    setAppointmentToCancel(appointmentId);
    setCancelConfirmModalOpen(true);
  };

  const closeCancelConfirmModal = () => {
    setCancelConfirmModalOpen(false);
    setAppointmentToCancel(null);
  };

  const handleConfirmCancel = async () => {
    if (!appointmentToCancel) return;
    await cancelAppointment(appointmentToCancel, { penalizeUser: true });
    closeCancelConfirmModal();
  };

  const handlePreviewMouseMove = (event, imageUrl) => {
    setHoverPreview({
      url: imageUrl,
      x: event.clientX + 16,
      y: event.clientY - 24,
    });
  };

  return (
    <div className="w-full max-w-8xl m-5 ">

      <p className='mb-3 text-lg font-medium font-sans'>Tất cả lịch hẹn</p>

      <div className='bg-white border rounded text-sm max-h-[80vh] overflow-y-scroll'>
        <div className='max-sm:hidden grid grid-cols-[0.5fr_2fr_1fr_1fr_2fr_1.2fr_1fr_1fr] gap-1 py-3 px-6 border-b'>
          <p>#</p>
          <p>Người dùng</p>
          <p>Thanh toán</p>
          <p>Tuổi</p>
          <p>Ngày & Giờ</p>
          <p>Ảnh tham khảo</p>
          <p>Phí</p>
          <p>Hành động</p>
        </div>
        {[...appointments].reverse().map((item, index) => (
          <div className='relative flex flex-wrap justify-between max-sm:gap-5 max-sm:text-base sm:grid grid-cols-[0.5fr_2fr_1fr_1fr_2fr_1.2fr_1fr_1fr] gap-1 items-center text-gray-500 py-3 px-6 border-b hover:bg-gray-50' key={index}>
            <p className='max-sm:hidden'>{index}</p>
            <div className='flex items-center gap-2'>
              <img src={item.userData.image} className='w-8 rounded-full' alt="" /> <p>{item.userData.name}</p>
            </div>
            <div>
              <p
                className={`text-xs inline px-2 py-0.5 rounded-full border font-medium ${
                  item.cancelled
                    ? 'bg-red-100 text-red-700 border-red-300'
                    : item.isCompleted
                    ? 'bg-green-100 text-green-700 border-green-300'
                    : item.payment
                    ? 'bg-blue-100 text-blue-700 border-blue-300'
                    : 'bg-yellow-100 text-yellow-800 border-yellow-300'
                }`}
              >
                {item.payment ? 'Trực tuyến' : 'Tiền mặt'}
              </p>
            </div>
            <p className='max-sm:hidden'>{calculateAge(item.userData.dob)}</p>
            <p>{slotDateFormat(item.slotDate)}, {item.slotTime}</p>

            {item.selectedStyleImage ? (
              <div className='relative'>
                <img
                  src={item.selectedStyleImage}
                  className='h-10 w-10 rounded-lg object-contain border border-[#e6ced6] cursor-pointer'
                  alt='Ảnh tham khảo'
                  onMouseEnter={(event) => handlePreviewMouseMove(event, item.selectedStyleImage)}
                  onMouseMove={(event) => handlePreviewMouseMove(event, item.selectedStyleImage)}
                  onMouseLeave={() => setHoverPreview(null)}
                  onClick={() => setLightboxImage(item.selectedStyleImage)}
                />
              </div>
            ) : (
              <p className='text-xs text-gray-400'>Không có</p>
            )}

            <p>{currency}{item.amount}</p>
            {
              item.cancelled 
              ? <p 
                  onClick={() =>
                    openCancellationReasonModal(
                      item.cancellationReasons,
                      item.cancellationDetails
                    )
                  }
                  className='inline-flex w-fit justify-self-start items-center rounded-full border border-red-300 bg-red-100 px-2 py-0.5 text-xs font-medium font-sans text-red-700 cursor-pointer hover:bg-red-200'
                >
                  Xem lý do hủy
                </p>
              : item.isCompleted
                ?<p className='inline-flex w-fit justify-self-start items-center rounded-full border border-green-300 bg-green-100 px-2 py-0.5 text-xs font-medium font-sans text-green-700'>Hoàn thành</p>
                :<div className='flex gap-2'>
              <img onClick={() => openCancelConfirmModal(item._id)} className='w-10 cursor-pointer' src={assets.cancel_icon} alt="Hủy" />
              <img onClick={() => completeAppointment(item._id)} className='w-10 cursor-pointer' src={assets.tick_icon} alt="Hoàn thành" />
            </div>
            }
            
          </div>
        ))}
      </div>

      {/* Modal hiển thị lý do hủy */}
      {cancelReasonModalOpen && selectedCancellationData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Lý do hủy lịch hẹn</h2>

            {/* Các lý do được chọn */}
            {selectedCancellationData.reasons && selectedCancellationData.reasons.length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold text-gray-700 mb-2">Lý do:</h3>
                <ul className="list-disc list-inside space-y-1">
                  {selectedCancellationData.reasons.map((reason, index) => (
                    <li key={index} className="text-gray-600">{reason}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Chi tiết lý do */}
            {selectedCancellationData.details && (
              <div className="mb-4">
                <h3 className="font-semibold text-gray-700 mb-2">Chi tiết:</h3>
                <p className="text-gray-600 bg-gray-50 p-3 rounded border border-gray-200">
                  {selectedCancellationData.details}
                </p>
              </div>
            )}

            {!selectedCancellationData.reasons?.length && !selectedCancellationData.details && (
              <p className="text-gray-500 text-center">Không có lý do hủy được cung cấp</p>
            )}

            {/* Nút đóng */}
            <div className="flex justify-end">
              <button
                onClick={closeCancellationReasonModal}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {cancelConfirmModalOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'>
          <div className='w-full max-w-md rounded-lg bg-white p-6 shadow-lg'>
            <h2 className='mb-3 text-xl font-bold text-gray-800'>Xác nhận hủy đơn</h2>
            <p className='text-gray-600'>Bạn có muốn hủy đơn và phạt người dùng này 1 lần không?</p>

            <div className='mt-6 flex justify-end gap-3'>
              <button
                onClick={closeCancelConfirmModal}
                className='rounded-lg bg-gray-200 px-4 py-2 text-gray-800 transition hover:bg-gray-300'
              >
                Đóng
              </button>
              <button
                onClick={handleConfirmCancel}
                className='rounded-lg bg-red-600 px-4 py-2 text-white transition hover:bg-red-700'
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      {hoverPreview?.url && (
        <div
          className='fixed z-[9999] pointer-events-none rounded-xl border border-[#ead5dd] bg-white p-2 shadow-2xl'
          style={{ left: hoverPreview.x, top: hoverPreview.y }}
        >
          <img
            src={hoverPreview.url}
            className='h-52 w-52 rounded-lg object-contain'
            alt='Preview ảnh tham khảo'
          />
        </div>
      )}

      {lightboxImage && (
        <div
          className='fixed inset-0 z-50 bg-black/70 backdrop-blur-[2px] flex items-center justify-center p-4'
          onClick={() => setLightboxImage(null)}
        >
          <div className='max-w-3xl w-full' onClick={(e) => e.stopPropagation()}>
            <img
              src={lightboxImage}
              alt='Ảnh tham khảo full-size'
              className='w-full max-h-[85vh] object-contain rounded-2xl border border-white/20 shadow-2xl'
            />
            <div className='mt-3 flex justify-center'>
              <button
                onClick={() => setLightboxImage(null)}
                className='rounded-xl bg-white px-4 py-2 text-sm font-medium text-gray-800'
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default StylistAppointments