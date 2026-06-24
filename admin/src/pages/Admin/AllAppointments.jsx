import React, { useEffect, useState } from "react";
import { assets } from "../../assets/assets";
import { useContext } from "react";
import { AdminContext } from "../../context/AdminContext";
import { AppContext } from "../../context/AppContext";
import { isAppointmentExpired } from "../../utils/appointmentUtils";

const AllAppointments = () => {
  const { aToken, appointments, cancelAppointment, getAllAppointments } =
    useContext(AdminContext);
  const { slotDateFormat, calculateAge, currency } = useContext(AppContext);
  const [cancelReasonModalOpen, setCancelReasonModalOpen] = useState(false);
  const [selectedCancellationData, setSelectedCancellationData] = useState(null);
  const [cancelConfirmModalOpen, setCancelConfirmModalOpen] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState(null);
  const [appointmentToCancelIsExpired, setAppointmentToCancelIsExpired] = useState(false);

  useEffect(() => {
    if (aToken) {
      getAllAppointments();
    }
  }, [aToken]);

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

  const openCancelConfirmModal = (appointmentId, isExpired = false) => {
    setAppointmentToCancel(appointmentId);
    setAppointmentToCancelIsExpired(isExpired);
    setCancelConfirmModalOpen(true);
  };

  const closeCancelConfirmModal = () => {
    setCancelConfirmModalOpen(false);
    setAppointmentToCancel(null);
    setAppointmentToCancelIsExpired(false);
  };

  const handleConfirmCancel = async (shouldPenalize) => {
    if (!appointmentToCancel) return;
    await cancelAppointment(appointmentToCancel, {
      penalizeUser: shouldPenalize,
    });
    closeCancelConfirmModal();
  };

  return (
    <div className="w-full p-4 sm:p-5">
      <p className="mb-3 text-lg font-medium font-sans">Tất cả lịch hẹn</p>

      <div className="max-h-[80vh] overflow-y-auto rounded border bg-white text-sm">
        <div className="hidden sm:grid grid-cols-[0.5fr_2.8fr_2fr_1fr_3fr_3fr_1fr_1.5fr] gap-4 items-center py-3 px-6 border-b">
          <p>#</p>
          <p>Người dùng</p>
          <p>Thanh toán</p>
          <p>Tuổi</p>
          <p>Ngày & Giờ</p>
          <p>Chuyên viên</p>
          <p>Phí</p>
          <p>Hành động</p>
        </div>
        {appointments.map((item, index) => {
          const isExpired = isAppointmentExpired(item);
          return (
          <div
            className={`grid grid-cols-2 gap-3 border-b px-4 py-4 sm:grid-cols-[0.5fr_2.8fr_2fr_1fr_3fr_3fr_1fr_1.5fr] sm:items-center sm:gap-4 sm:px-6 sm:py-3 ${
              isExpired
                ? "bg-gray-100 text-gray-400 hover:bg-gray-150"
                : "text-gray-500 hover:bg-gray-50"
            }`}
            key={index}
          >
            <p className="max-sm:hidden">{index + 1}</p>
            <div className="flex min-w-0 items-center gap-2 max-sm:order-1">
              <img
                src={item.userData.image}
                className={`w-8 rounded-full ${
                  isExpired ? "opacity-50" : ""
                }`}
                alt=""
              />{" "}
              <p className="truncate">{item.userData.name}</p>
            </div>
            <div className="max-sm:order-3">
              <p
                className={`text-xs inline px-2 py-0.5 rounded-full border font-medium ${
                  isExpired
                    ? "bg-gray-300 text-gray-600 border-gray-400"
                    : item.cancelled
                    ? "bg-red-100 text-red-700 border-red-300"
                    : item.isCompleted
                    ? "bg-green-100 text-green-700 border-green-300"
                    : item.depositPaid && !item.payment
                    ? "bg-purple-100 text-purple-700 border-purple-300"
                    : item.payment
                    ? "bg-blue-100 text-blue-700 border-blue-300"
                    : "bg-yellow-100 text-yellow-800 border-yellow-300"
                }`}
              >
                {isExpired
                  ? "Hết hạn"
                  : item.depositPaid && !item.payment
                  ? `Đã cọc - ${(Number(item.depositAmount) || Math.round(Number(item.amount || 0) * 0.2)).toLocaleString("vi-VN")} ${currency}`
                  : item.payment
                  ? "Trực tuyến"
                  : "Tiền mặt"}
              </p>
            </div>
            <p className="max-sm:hidden">{calculateAge(item.userData.dob)}</p>
            <p className="max-sm:order-4 max-sm:col-span-2">
              {slotDateFormat(item.slotDate)}, {item.slotTime}
            </p>
            <div className="flex min-w-0 items-center gap-2 max-sm:order-2">
              <img
                src={item.styData.image}
                className={`w-8 rounded-full bg-gray-200 ${
                  isExpired ? "opacity-50" : ""
                }`}
                alt=""
              />{" "}
              <p className="truncate">{item.styData.name}</p>
            </div>
            <p className="whitespace-nowrap max-sm:order-5">
              {Number(item.amount || 0).toLocaleString('vi-VN')} {currency}
            </p>
            <div className="max-sm:order-6 sm:contents">
            {isExpired ? (
              <button
                onClick={() => openCancelConfirmModal(item._id, true)}
                className="inline-flex w-fit justify-self-start items-center rounded border border-gray-400 bg-gray-300 px-3 py-1.5 text-xs font-semibold font-sans text-gray-700 hover:bg-gray-350 transition"
              >
                Hết hạn
              </button>
            ) : item.cancelled ? (
              <p
                onClick={() =>
                  openCancellationReasonModal(
                    item.cancellationReasons,
                    item.cancellationDetails
                  )
                }
                className="inline-flex w-fit justify-self-start items-center rounded-full border border-red-300 bg-red-100 px-2 py-0.5 text-xs font-medium font-sans text-red-700 cursor-pointer hover:bg-red-200"
              >
                Xem lý do hủy
              </p>
            ) : item.isCompleted ? (
              <p className="inline-flex w-fit justify-self-start items-center rounded-full border border-green-300 bg-green-100 px-2 py-0.5 text-xs font-medium font-sans text-green-700">Hoàn thành</p>
            ) : (
              <img
                onClick={() => openCancelConfirmModal(item._id)}
                className="w-10 cursor-pointer"
                src={assets.cancel_icon}
                alt=""
              />
            )}
            </div>
          </div>
          );
        })}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <h2 className="mb-3 text-xl font-bold text-gray-800">Xác nhận hủy đơn</h2>
            
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
                      onClick={closeCancelConfirmModal}
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
  );
};

export default AllAppointments;
