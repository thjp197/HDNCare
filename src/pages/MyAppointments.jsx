import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import { assets, stylists as localStylists } from "../assets/assets";
import { toast } from "react-toastify";
import { useSearchParams } from "react-router-dom";

const MyAppointments = () => {
  const { backendUrl, token, stylists, getStylistsData } =
    useContext(AppContext);
  const [searchParams] = useSearchParams();

  const [appointments, setAppointments] = useState([]);
  const [paymentLoading, setPaymentLoading] = useState({});
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState(null);
  const [selectedReasons, setSelectedReasons] = useState([]);
  const [cancellationReason, setCancellationReason] = useState("");
  const [cancelLoading, setCancelLoading] = useState(false);

  const months = [
    " ",
    "Tháng 1",
    "Tháng 2",
    "Tháng 3",
    "Tháng 4",
    "Tháng 5",
    "Tháng 6",
    "Tháng 7",
    "Tháng 8",
    "Tháng 9",
    "Tháng 10",
    "Tháng 11",
    "Tháng 12",
  ];

  const slotDateFormat = (slotDate) => {
    const dateArray = slotDate.split("_");
    return (
      dateArray[0] + " " + months[Number(dateArray[1])] + " " + dateArray[2]
    );
  };

  const getUserAppointments = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/user/appointments", {
        headers: { token },
      });

      if (data.success) {
        const sortedAppointments = data.appointments.sort((a, b) => {
          return b._id.toString().localeCompare(a._id.toString());
        });

        setAppointments(sortedAppointments);
      } else {
        toast.error(data.message || "Không thể tải lịch hẹn của bạn");
      }
    } catch (error) {
      console.log(error);
      toast.error("Không thể tải lịch hẹn của bạn");
    }
  };

  const handlePayment = async (appointmentId) => {
    try {
      setPaymentLoading((prev) => ({ ...prev, [appointmentId]: true }));

      const { data } = await axios.post(
        backendUrl + "/api/user/create-payment-url",
        { appointmentId },
        { headers: { token } },
      );

      if (data.success) {
        // Redirect to VNPay payment page
        window.location.href = data.paymentUrl;
      } else {
        toast.error(data.message || "Không thể tạo đường link thanh toán");
      }
    } catch (error) {
      console.log(error);
      toast.error("Lỗi khi tạo đường link thanh toán");
    } finally {
      setPaymentLoading((prev) => ({ ...prev, [appointmentId]: false }));
    }
  };

  const verifyPaymentFromVNPay = async () => {
    // Get payment information from URL params
    const vnp_ResponseCode = searchParams.get("vnp_ResponseCode");
    const vnp_TxnRef = searchParams.get("vnp_TxnRef");
    const vnp_TransactionNo = searchParams.get("vnp_TransactionNo");
    const vnp_Amount = searchParams.get("vnp_Amount");

    if (vnp_ResponseCode === "00" && vnp_TxnRef) {
      try {
        const { data } = await axios.post(
          backendUrl + "/api/user/verify-payment",
          {
            appointmentId: vnp_TxnRef,
            vnp_TransactionNo,
            vnp_Amount,
          },
          { headers: { token } },
        );

        if (data.success) {
          toast.success("Thanh toán thành công!");
          getUserAppointments(); // Refresh to show updated payment status
          // Clear URL parameters
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname,
          );
        } else {
          toast.error(data.message || "Khoá thanh toán không thành công");
        }
      } catch (error) {
        console.log(error);
        toast.error("Lỗi khi xác nhận thanh toán");
      }
    }
  };

  const cancelAppointment = async (appointmentId) => {
    try {
      setCancelLoading(true);
      const { data } = await axios.post(
        backendUrl + "/api/user/cancel-appointment",
        {
          appointmentId,
          cancellationReasons: selectedReasons,
          cancellationDetails: cancellationReason,
        },
        { headers: { token } },
      );
      if (data.success) {
        toast.success(data.message);
        setCancelModalOpen(false);
        setAppointmentToCancel(null);
        setSelectedReasons([]);
        setCancellationReason("");
        getUserAppointments(); // Refresh the appointments list
        getStylistsData(); // Refresh stylist data to update available slots
      } else {
        toast.error(data.message || "Không thể hủy lịch hẹn");
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    } finally {
      setCancelLoading(false);
    }
  };

  const openCancelModal = (appointmentId) => {
    setAppointmentToCancel(appointmentId);
    setSelectedReasons([]);
    setCancellationReason("");
    setCancelModalOpen(true);
  };

  const handleReasonChange = (reason) => {
    if (selectedReasons.includes(reason)) {
      setSelectedReasons(selectedReasons.filter((r) => r !== reason));
    } else {
      setSelectedReasons([...selectedReasons, reason]);
    }
  };

  const handleCancelModal = () => {
    setCancelModalOpen(false);
    setAppointmentToCancel(null);
    setSelectedReasons([]);
    setCancellationReason("");
  };

  const handleConfirmCancel = () => {
    if (selectedReasons.length === 0 && cancellationReason.trim() === "") {
      toast.error("Vui lòng chọn lý do hoặc nhập chi tiết hủy lịch");
      return;
    }
    cancelAppointment(appointmentToCancel);
  };

  useEffect(() => {
    if (token) {
      getUserAppointments();
      verifyPaymentFromVNPay();
    }
  }, [token]);

  return (
    <div className="mx-4 sm:mx-[10%]">
      <p className="mt-12 mb-8 font-bold text-2xl">Lịch hẹn của tôi</p>
      <div>
        {appointments.map((item, index) => {
          const stylistId =
            item.styData?.stylistId || item.styData?._id || item.styId;
          const stylist =
            stylists.find((s) => s._id === stylistId) ||
            localStylists.find((s) => s._id === stylistId);

          const stylistImage =
            item.styData?.image || stylist?.image || assets.profile_pic;
          const stylistName =
            item.styData?.name || stylist?.name || "Chuyên viên";
          return (
            <div
              key={item._id || index}
              className="grid grid-cols-1 md:grid-cols-4 gap-4 border border-gray-200 rounded-lg p-4 mb-4 bg-white shadow-sm hover:shadow-md transition"
            >
              <div>
                <img
                  src={stylistImage}
                  alt={stylistName}
                  className="w-32 h-32 object-cover rounded"
                />
              </div>
              <div className="md:col-span-2">
                <p className="font-bold text-lg">{stylistName}</p>
                <p className="text-gray-600 text-sm">
                  {item.styData?.speciality || stylist?.speciality}
                </p>
                <p className="text-sm mt-2">
                  <span className="font-semibold">Địa chỉ:</span>
                </p>
                <p className="text-sm text-gray-700">
                  {item.styData?.address?.line1 || stylist?.address?.line1}
                </p>
                <p className="text-sm text-gray-700">
                  {item.styData?.address?.line2 || stylist?.address?.line2}
                </p>
                <p className="text-sm mt-2">
                  <span className="font-semibold">Thời gian:</span>{" "}
                  {slotDateFormat(item.slotDate)} | {item.slotTime}
                </p>
                <p className="text-sm mt-2">
                  <span className="font-semibold">Chi phí:</span>{" "}
                  {item.amount?.toLocaleString("vi-VN")} VND
                </p>
              </div>
              <div className="flex flex-col gap-2 justify-center">
                {!item.cancelled && !item.payment && !item.isCompleted && (
                  <button
                    onClick={() => handlePayment(item._id)}
                    disabled={paymentLoading[item._id]}
                    className="px-4 py-2 bg-primary text-white rounded hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {paymentLoading[item._id]
                      ? "Đang xử lý..."
                      : "Thanh toán trực tuyến"}
                  </button>
                )}
                {!item.cancelled && item.payment && !item.isCompleted && (
                  <button className="px-4 py-2 bg-green-500 text-white rounded cursor-default">
                    ✓ Đã thanh toán
                  </button>
                )}
                {!item.cancelled && !item.payment && !item.isCompleted &&(
                  <button
                    onClick={() => openCancelModal(item._id)}
                    className="px-4 py-2 border border-red-600 text-red-600 rounded hover:bg-red-50 transition"
                  >
                    Hủy lịch hẹn
                  </button>
                )}
                {item.cancelled && !item.isCompleted &&(
                  <button className="sm:min-w-48 py-2 border border-red-500 rounded text-red-500 cursor-default">
                    ✕ Đã hủy
                  </button>
                )}

                {item.isCompleted && <button className="sm:min-w-48 py-2 border border-green-500 rounded text-green-500">Completed</button>}
              </div>
            </div>
          );
        })}
        {!appointments.length && (
          <p className="text-gray-500">Bạn chưa có lịch hẹn nào.</p>
        )}
      </div>

      {/* Modal Hủy Lịch Hẹn */}
      {cancelModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Lý do hủy lịch hẹn</h2>

            {/* Lý do hủy */}
            <div className="space-y-3 mb-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="reason1"
                  checked={selectedReasons.includes("Muốn đổi stylist khác")}
                  onChange={() =>
                    handleReasonChange("Muốn đổi stylist khác")
                  }
                  className="w-4 h-4 accent-primary cursor-pointer"
                />
                <label htmlFor="reason1" className="ml-3 cursor-pointer text-gray-700">
                  Muốn đổi stylist khác
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="reason2"
                  checked={selectedReasons.includes("Muốn đổi lịch hẹn")}
                  onChange={() =>
                    handleReasonChange("Muốn đổi lịch hẹn")
                  }
                  className="w-4 h-4 accent-primary cursor-pointer"
                />
                <label htmlFor="reason2" className="ml-3 cursor-pointer text-gray-700">
                  Muốn đổi lịch hẹn
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="reason3"
                  checked={selectedReasons.includes("Lý do khác")}
                  onChange={() => handleReasonChange("Lý do khác")}
                  className="w-4 h-4 accent-primary cursor-pointer"
                />
                <label htmlFor="reason3" className="ml-3 cursor-pointer text-gray-700">
                  Lý do khác
                </label>
              </div>
            </div>

            {/* Text area cho lý do chi tiết */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Chi tiết lý do (tuỳ chọn)
              </label>
              <textarea
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                placeholder="Nhập lý do chi tiết của bạn...(có thể không nhập)"
                className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                rows="4"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCancelModal}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
              >
                Đóng
              </button>
              <button
                onClick={handleConfirmCancel}
                disabled={cancelLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cancelLoading ? "Đang hủy..." : "Xác nhận hủy"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAppointments;
