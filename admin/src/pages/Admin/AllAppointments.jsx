import React, { useEffect, useState } from "react";
import { assets } from "../../assets/assets";
import { useContext } from "react";
import { AdminContext } from "../../context/AdminContext";
import { AppContext } from "../../context/AppContext";

const AllAppointments = () => {
  const { aToken, appointments, cancelAppointment, getAllAppointments } =
    useContext(AdminContext);
  const { slotDateFormat, calculateAge, currency } = useContext(AppContext);
  const [cancelReasonModalOpen, setCancelReasonModalOpen] = useState(false);
  const [selectedCancellationData, setSelectedCancellationData] = useState(null);

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

  return (
    <div className="w-full max-w-8xl m-5 ">
      <p className="mb-3 text-lg font-medium font-sans">Tất cả lịch hẹn</p>

      <div className="bg-white border rounded text-sm max-h-[80vh] overflow-y-scroll">
        <div className="hidden sm:grid grid-cols-[0.5fr_3fr_1fr_3fr_3fr_1fr_1.5fr] gap-4 items-center py-3 px-6 border-b">
          <p>#</p>
          <p>Người dùng</p>
          <p>Tuổi</p>
          <p>Ngày & Giờ</p>
          <p>Chuyên viên</p>
          <p>Phí</p>
          <p>Hành động</p>
        </div>
        {appointments.map((item, index) => (
          <div
            className="flex flex-wrap justify-between max-sm:gap-2 sm:grid sm:grid-cols-[0.5fr_3fr_1fr_3fr_3fr_1fr_1.5fr] gap-4 items-center text-gray-500 py-3 px-6 border-b hover:bg-gray-50"
            key={index}
          >
            <p className="max-sm:hidden">{index + 1}</p>
            <div className="flex items-center gap-2">
              <img
                src={item.userData.image}
                className="w-8 rounded-full"
                alt=""
              />{" "}
              <p>{item.userData.name}</p>
            </div>
            <p className="max-sm:hidden">{calculateAge(item.userData.dob)}</p>
            <p>
              {slotDateFormat(item.slotDate)}, {item.slotTime}
            </p>
            <div className="flex items-center gap-2">
              <img
                src={item.styData.image}
                className="w-8 rounded-full bg-gray-200"
                alt=""
              />{" "}
              <p>{item.styData.name}</p>
            </div>
            <p className="whitespace-nowrap">
              {item.amount} {currency}
            </p>
            {item.cancelled ? (
              <p
                onClick={() =>
                  openCancellationReasonModal(
                    item.cancellationReasons,
                    item.cancellationDetails
                  )
                }
                className="text-red-400 text-sm font-sans font-medium cursor-pointer hover:underline"
              >
                Xem lý do hủy
              </p>
            ) : item.isCompleted ? (
              <p className="text-green-500 text-sm font-sans font-medium ">Hoàn thành</p>
            ) : (
              <img
                onClick={() => cancelAppointment(item._id)}
                className="w-10 cursor-pointer"
                src={assets.cancel_icon}
                alt=""
              />
            )}
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
    </div>
  );
};

export default AllAppointments;
