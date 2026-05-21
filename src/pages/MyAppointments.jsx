import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import { assets, stylists as localStylists } from "../assets/assets";
import { toast } from "react-toastify";
import { useSearchParams } from "react-router-dom";

const MyAppointments = () => {
  const { backendUrl, token, stylists, getStylistsData, loadUserProfileData, userData, setShowBannedAccountModal } =
    useContext(AppContext);
  const [searchParams] = useSearchParams();

  const [appointments, setAppointments] = useState([]);
  const [paymentLoading, setPaymentLoading] = useState({});
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [appointmentToPay, setAppointmentToPay] = useState(null);
  const [paymentModalType, setPaymentModalType] = useState("full");
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState(null);
  const [selectedReasons, setSelectedReasons] = useState([]);
  const [cancellationReason, setCancellationReason] = useState("");
  const [cancelLoading, setCancelLoading] = useState(false);
  const [discountCode, setDiscountCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [finalAmount, setFinalAmount] = useState(0);
  const [discountVerifying, setDiscountVerifying] = useState(false);

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

  const verifyAndApplyDiscount = async () => {
    if (!discountCode.trim()) {
      toast.error("Vui lòng nhập mã giảm giá");
      return;
    }

    if (!appointmentToPay) return;

    try {
      setDiscountVerifying(true);
      const appointment = appointments.find(a => a._id === appointmentToPay);
      const orderAmount = paymentModalType === "deposit" 
        ? Math.round((appointment?.amount || 0) * 0.2) 
        : (appointment?.amount || 0);

      const { data } = await axios.post(
        backendUrl + "/api/user/verify-discount-code",
        {
          code: discountCode,
          appointmentId: appointmentToPay,
          orderAmount: orderAmount,
        },
        { headers: { token } },
      );

      if (data.success) {
        setDiscountAmount(data.discount);
        setFinalAmount(data.finalAmount);
        toast.success(`Áp dụng mã giảm giá thành công! Tiết kiệm ${data.discount.toLocaleString("vi-VN")} VND`);
      } else {
        toast.error(data.message || "Mã giảm giá không hợp lệ");
        setDiscountAmount(0);
        setFinalAmount(0);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Lỗi khi xác minh mã giảm giá");
      setDiscountAmount(0);
      setFinalAmount(0);
    } finally {
      setDiscountVerifying(false);
    }
  };

  const handlePayment = async (appointmentId) => {
    try {
      setPaymentLoading((prev) => ({ ...prev, [appointmentId]: true }));

      // Save discount code to sessionStorage before redirecting to VNPay
      if (discountCode) {
        sessionStorage.setItem(`discount_${appointmentId}`, discountCode);
      }

      const { data } = await axios.post(
        backendUrl + "/api/user/create-payment-url",
        { 
          appointmentId,
          discountCode: discountCode || null,
          discountAmount: discountAmount,
          finalAmount: finalAmount || null,
        },
        { headers: { token } },
      );

      if (data.success && data.paymentUrl) {
        // Redirect to VNPay payment page
        window.location.href = data.paymentUrl;
      } else if (data.success) {
        toast.success(data.message || "Lịch hẹn đã được thanh toán");
        await getUserAppointments();
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

  const handleDepositPayment = async (appointmentId) => {
    try {
      setPaymentLoading((prev) => ({ ...prev, [appointmentId]: true }));

      // Save discount code to sessionStorage before redirecting to VNPay
      if (discountCode) {
        sessionStorage.setItem(`discount_dep_${appointmentId}`, discountCode);
      }

      const { data } = await axios.post(
        backendUrl + "/api/user/create-deposit-payment-url",
        { 
          appointmentId,
          discountCode: discountCode || null,
          discountAmount: discountAmount,
        },
        { headers: { token } },
      );

      if (data.success && data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else if (data.success) {
        toast.success(data.message || "Lịch hẹn đã được thanh toán cọc");
        await getUserAppointments();
      } else {
        toast.error(data.message || "Không thể tạo đường link thanh toán cọc");
      }
    } catch (error) {
      console.log(error);
      toast.error("Lỗi khi tạo đường link thanh toán cọc");
    } finally {
      setPaymentLoading((prev) => ({ ...prev, [appointmentId]: false }));
    }
  };

  const payWithWallet = async (appointmentId) => {
    try {
      setPaymentLoading((prev) => ({ ...prev, [appointmentId]: true }));

      const { data } = await axios.post(
        backendUrl + "/api/user/wallet/pay-appointment",
        { 
          appointmentId,
          discountCode: discountCode || null,
          discountAmount: discountAmount,
        },
        { headers: { token } },
      );

      if (data.success) {
        toast.success(data.message || "Thanh toán bằng ví thành công");
        await loadUserProfileData();
        await getUserAppointments();
      } else {
        toast.error(data.message || "Không thể thanh toán bằng ví");
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message || "Không thể thanh toán bằng ví");
    } finally {
      setPaymentLoading((prev) => ({ ...prev, [appointmentId]: false }));
    }
  };

  const payDepositWithWallet = async (appointmentId) => {
    try {
      setPaymentLoading((prev) => ({ ...prev, [appointmentId]: true }));

      const { data } = await axios.post(
        backendUrl + "/api/user/wallet/pay-appointment-deposit",
        { 
          appointmentId,
          discountCode: discountCode || null,
          discountAmount: discountAmount,
        },
        { headers: { token } },
      );

      if (data.success) {
        toast.success(data.message || "Thanh toán cọc bằng ví thành công");
        await loadUserProfileData();
        await getUserAppointments();
      } else {
        toast.error(data.message || "Không thể thanh toán cọc bằng ví");
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message || "Không thể thanh toán cọc bằng ví");
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
        const isDepositPayment = vnp_TxnRef.startsWith("dep_");
        const verifyEndpoint = isDepositPayment
          ? "/api/user/verify-deposit-payment"
          : "/api/user/verify-payment";

        // Get discount code from sessionStorage
        let savedDiscountCode = null;
        if (isDepositPayment) {
          const appointmentId = vnp_TxnRef.split("_")[1];
          savedDiscountCode = sessionStorage.getItem(`discount_dep_${appointmentId}`);
        } else {
          savedDiscountCode = sessionStorage.getItem(`discount_${vnp_TxnRef}`);
        }

        const payload = isDepositPayment
          ? {
              depositRef: vnp_TxnRef,
              vnp_TransactionNo,
              vnp_Amount,
              discountCode: savedDiscountCode || null,
            }
          : {
              appointmentId: vnp_TxnRef,
              vnp_TransactionNo,
              vnp_Amount,
              discountCode: savedDiscountCode || null,
            };

        const { data } = await axios.post(backendUrl + verifyEndpoint, payload, {
          headers: { token },
        });

        if (data.success) {
          toast.success(isDepositPayment ? "Thanh toán cọc thành công!" : "Thanh toán thành công!");
          // Clear discount code from sessionStorage
          if (isDepositPayment) {
            const appointmentId = vnp_TxnRef.split("_")[1];
            sessionStorage.removeItem(`discount_dep_${appointmentId}`);
          } else {
            sessionStorage.removeItem(`discount_${vnp_TxnRef}`);
          }
          getUserAppointments(); // Refresh to show updated payment status
          loadUserProfileData();
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
        
        // Kiểm tra nếu tài khoản bị khóa
        if (data.userBanned) {
          setShowBannedAccountModal(true);
        } else {
          getUserAppointments(); // Refresh the appointments list
          getStylistsData(); // Refresh stylist data to update available slots
        }
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

  const openPaymentModal = (appointmentId, type = "full") => {
    setAppointmentToPay(appointmentId);
    setPaymentModalType(type);
    setPaymentModalOpen(true);
  };

  const closePaymentModal = () => {
    setPaymentModalOpen(false);
    setAppointmentToPay(null);
    setPaymentModalType("full");
    setDiscountCode("");
    setDiscountAmount(0);
    setFinalAmount(0);
  };

  const handlePayOnlineFromModal = async () => {
    if (!appointmentToPay) return;
    if (paymentModalType === "deposit") {
      await handleDepositPayment(appointmentToPay);
    } else {
      await handlePayment(appointmentToPay);
    }
    closePaymentModal();
  };

  const handlePayWithWalletFromModal = async () => {
    if (!appointmentToPay) return;
    if (paymentModalType === "deposit") {
      await payDepositWithWallet(appointmentToPay);
    } else {
      await payWithWallet(appointmentToPay);
    }
    closePaymentModal();
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

  const selectedAppointment = appointments.find((appt) => appt._id === appointmentToPay);
  const walletBalance = Number(userData?.walletBalance || 0);
  const selectedAppointmentAmount = Number(selectedAppointment?.amount || 0);
  const selectedDepositAmount = Math.round(selectedAppointmentAmount * 0.2);
  const selectedRemainingAmount = Math.max(
    selectedAppointmentAmount - Number(selectedAppointment?.depositPaid ? selectedAppointment?.depositAmount || 0 : 0),
    0,
  );
  const paymentTargetAmount = paymentModalType === "deposit" ? selectedDepositAmount : selectedRemainingAmount;
  const modalWalletSufficient = walletBalance >= paymentTargetAmount;
  const paymentModalLoading = appointmentToPay ? paymentLoading[appointmentToPay] : false;

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
                    onClick={() => openPaymentModal(item._id, "full")}
                    disabled={paymentLoading[item._id]}
                    className="px-4 py-2 bg-primary text-white rounded hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {paymentLoading[item._id] ? "Đang xử lý..." : "Thanh toán"}
                  </button>
                )}
                {!item.cancelled && !item.payment && !item.isCompleted && !item.depositPaid && (
                  <button
                    onClick={() => openPaymentModal(item._id, "deposit")}
                    disabled={paymentLoading[item._id]}
                    className="px-4 py-2 border border-emerald-600 text-emerald-700 rounded hover:bg-emerald-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {paymentLoading[item._id]
                      ? "Đang xử lý..."
                      : `Thanh toán cọc (20%) - ${Math.round((item.amount || 0) * 0.2).toLocaleString("vi-VN")} VND`}
                  </button>
                )}
                {!item.cancelled && !item.payment && item.depositPaid && !item.isCompleted && (
                  <button className="px-4 py-2 border border-emerald-500 text-emerald-600 rounded cursor-default">
                    ✓ Đã cọc {Number(item.depositAmount || Math.round((item.amount || 0) * 0.2)).toLocaleString("vi-VN")} VND
                  </button>
                )}
                {!item.cancelled && item.payment && !item.isCompleted && (
                  <>
                    <button className="px-4 py-2 bg-green-500 text-white rounded cursor-default">
                      ✓ Đã thanh toán
                    </button>
                    <button
                      onClick={() => openCancelModal(item._id)}
                      className="px-4 py-2 border border-red-600 text-red-600 rounded hover:bg-red-50 transition"
                    >
                      Hủy lịch hẹn
                    </button>
                  </>
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

                {item.isCompleted && <button className="sm:min-w-48 py-2 border border-green-500 rounded text-green-500">Hoàn thành</button>}
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

      {paymentModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-2 text-gray-800">
              {paymentModalType === "deposit" ? "Xác nhận thanh toán cọc" : "Xác nhận thanh toán"}
            </h2>
            <p className="text-sm text-gray-600 mb-1">Vui lòng chọn phương thức thanh toán.</p>
            <p className="text-sm font-semibold text-gray-900 mb-5">
              Số tiền: {paymentTargetAmount.toLocaleString("vi-VN")} VND
            </p>

            {/* Discount Code Section */}
            <div className="mb-5 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Mã giảm giá (tuỳ chọn)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                  placeholder="Nhập mã giảm giá..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={discountVerifying}
                />
                <button
                  onClick={verifyAndApplyDiscount}
                  disabled={discountVerifying || !discountCode.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {discountVerifying ? "Kiểm tra..." : "Áp dụng"}
                </button>
              </div>
              
              {discountAmount > 0 && (
                <div className="mt-3 space-y-1">
                  <p className="text-sm text-green-700 font-medium">✓ Áp dụng thành công!</p>
                  <p className="text-sm text-gray-700">Tiết kiệm: <span className="font-semibold text-green-600">{discountAmount.toLocaleString("vi-VN")} VND</span></p>
                  <p className="text-sm text-gray-700">Tổng thanh toán: <span className="font-semibold text-lg text-primary">{finalAmount.toLocaleString("vi-VN")} VND</span></p>
                </div>
              )}
            </div>

            <p className="text-sm font-semibold text-gray-900 mb-5">
              Số tiền cần thanh toán: {(finalAmount > 0 ? finalAmount : paymentTargetAmount).toLocaleString("vi-VN")} VND
            </p>

            <div className="space-y-3">
              <button
                onClick={handlePayOnlineFromModal}
                disabled={paymentModalLoading}
                className="w-full px-4 py-2 bg-primary text-white rounded hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {paymentModalLoading ? "Đang xử lý..." : "Thanh toán trực tuyến"}
              </button>

              <button
                onClick={handlePayWithWalletFromModal}
                disabled={paymentModalLoading || !modalWalletSufficient}
                className="w-full px-4 py-2 border border-rose-500 text-rose-600 rounded hover:bg-rose-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {paymentModalLoading
                  ? "Đang xử lý..."
                  : modalWalletSufficient
                    ? "Thanh toán bằng ví"
                    : "Không đủ số dư"}
              </button>

              <p className="text-xs text-gray-500">
                Số dư ví hiện tại: {walletBalance.toLocaleString("vi-VN")} VND
              </p>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={closePaymentModal}
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

export default MyAppointments;
