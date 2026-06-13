import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import { assets, stylists as localStylists } from "../assets/assets";
import { toast } from "react-toastify";
import { socket } from "../App";

const MyAppointments = () => {
  const navigate = useNavigate();
  const { backendUrl, token, stylists, getStylistsData, loadUserProfileData, userData, setShowBannedAccountModal } =
    useContext(AppContext);
  const [searchParams] = useSearchParams();

  // Helper function to check if appointment is expired
  const isAppointmentExpired = (appointment) => {
    // If already cancelled or completed, it's not expired
    if (appointment.cancelled || appointment.isCompleted) {
      return false;
    }
    
    // Parse date and time
    const [dayStr, monthStr, yearStr] = appointment.slotDate.split("_");
    const day = parseInt(dayStr);
    const month = parseInt(monthStr);
    const year = parseInt(yearStr);
    
    // Extract hour and minute from slotTime
    const timeMatch = appointment.slotTime.match(/(\d{1,2}):(\d{2})/);
    if (!timeMatch) return false;
    
    const hour = parseInt(timeMatch[1]);
    const minute = parseInt(timeMatch[2]);
    const appointmentDateTime = new Date(year, month - 1, day, hour, minute);
    const now = new Date();
    
    // If appointment time is in the past, it's expired
    return appointmentDateTime < now;
  };

  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  const [appointments, setAppointments] = useState([]);
  const [paymentLoading, setPaymentLoading] = useState({});
  const [paymentTypeModalOpen, setPaymentTypeModalOpen] = useState(false);
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
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [appointmentToReschedule, setAppointmentToReschedule] = useState(null);
  const [availableRescheduleSlots, setAvailableRescheduleSlots] = useState([]);
  const [selectedRescheduleSlot, setSelectedRescheduleSlot] = useState(null);
  const [rescheduleLoading, setRescheduleLoading] = useState(false);

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

  useEffect(() => {
    if (userData && userData._id) {
      const handleAppointmentsUpdate = (data) => {
        if (data.userId === userData._id.toString()) {
          getUserAppointments();
        }
      };
      
      socket.on("user-appointments-updated", handleAppointmentsUpdate);
      return () => {
        socket.off("user-appointments-updated", handleAppointmentsUpdate);
      };
    }
  }, [userData, token]);

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

  const openRescheduleModal = (appointmentId) => {
    const appointment = appointments.find(a => a._id === appointmentId);
    if (!appointment) return;

    if (appointment.rescheduleCount >= 1) {
      toast.error("Bạn chỉ được đổi lịch 1 lần duy nhất");
      return;
    }

    // Check if appointment is at least 2 hours away
    const [dayStr, monthStr, yearStr] = appointment.slotDate.split("_");
    const day = parseInt(dayStr);
    const month = parseInt(monthStr);
    const year = parseInt(yearStr);
    
    // Extract just HH:MM from slotTime (handles formats like "09:30", "09:30 AM", etc.)
    const timeMatch = appointment.slotTime.match(/(\d{1,2}):(\d{2})/);
    if (!timeMatch) {
      toast.error("Lỗi định dạng giờ hẹn");
      return;
    }
    const hour = parseInt(timeMatch[1]);
    const minute = parseInt(timeMatch[2]);
    const appointmentDateTime = new Date(year, month - 1, day, hour, minute);
    const now = new Date();
    const timeDifference = (appointmentDateTime - now) / (1000 * 60); // in minutes

    if (timeDifference < 120) {
      toast.error("Đổi lịch không được phép trong 2 tiếng trước giờ đặt lịch");
      return;
    }

    // Get available slots for the same day
    const stylist = stylists.find(s => s._id === appointment.styId);
    if (!stylist) {
      toast.error("Không tìm thấy thông tin nhân viên");
      return;
    }

    // Generate available slots for the same day
    const slots = generateRescheduleSlots(appointment, stylist);
    setAvailableRescheduleSlots(slots);
    setAppointmentToReschedule(appointmentId);
    setSelectedRescheduleSlot(null);
    setRescheduleModalOpen(true);
  };

  const generateRescheduleSlots = (appointment, stylist) => {
    const slots = [];
    const [day, month, year] = appointment.slotDate.split("_");
    
    const bookedSlots = stylist.slots_booked || {};
    const slotDate = day + "_" + month + "_" + year;
    
    let currentDate = new Date(year, month - 1, day, 9, 0, 0, 0); // Start at 9 AM
    const endTime = new Date(year, month - 1, day, 21, 0, 0, 0); // End at 9 PM
    const now = new Date();

    while (currentDate < endTime) {
      const formattedTime = currentDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      // Check if slot is available and not the current appointment time
      const isBooked = bookedSlots[slotDate]?.includes(formattedTime);
      const isCurrentTime = formattedTime === appointment.slotTime;
      const isPastTime = currentDate <= now; // Skip if time already passed

      if (!isBooked && !isCurrentTime && !isPastTime) {
        slots.push({
          time: formattedTime,
          datetime: new Date(currentDate),
        });
      }

      currentDate.setMinutes(currentDate.getMinutes() + 60);
    }

    return slots;
  };

  const handleReschedule = async () => {
    if (!selectedRescheduleSlot || !appointmentToReschedule) {
      toast.error("Vui lòng chọn giờ hẹn mới");
      return;
    }

    setRescheduleLoading(true);
    try {
      const appointment = appointments.find(a => a._id === appointmentToReschedule);
      const [day, month, year] = appointment.slotDate.split("_");
      const newSlotDate = day + "_" + month + "_" + year;

      const response = await axios.post(
        `${backendUrl}/api/user/reschedule-appointment`,
        {
          appointmentId: appointmentToReschedule,
          newSlotDate,
          newSlotTime: selectedRescheduleSlot,
        },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success("Đổi lịch hẹn thành công");
        setRescheduleModalOpen(false);
        setAppointmentToReschedule(null);
        setSelectedRescheduleSlot(null);
        getUserAppointments();
        getStylistsData();
      } else {
        toast.error(response.data.message || "Không thể đổi lịch hẹn");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setRescheduleLoading(false);
    }
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

  const openPaymentTypeModal = (appointmentId) => {
    setAppointmentToPay(appointmentId);
    setPaymentTypeModalOpen(true);
  };

  const selectPaymentType = (type) => {
    setPaymentModalType(type);
    setPaymentTypeModalOpen(false);
    setDiscountCode("");
    setDiscountAmount(0);
    setFinalAmount(0);
    setPaymentModalOpen(true);
  };

  const closePaymentTypeModal = () => {
    setPaymentTypeModalOpen(false);
    setAppointmentToPay(null);
  };;

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
  // Use finalAmount if discount is applied, otherwise use paymentTargetAmount
  const amountToCheck = finalAmount > 0 ? finalAmount : paymentTargetAmount;
  const modalWalletSufficient = walletBalance >= amountToCheck;
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
              className={`grid grid-cols-1 md:grid-cols-4 gap-4 border rounded-lg p-4 mb-4 shadow-sm hover:shadow-md transition ${
                isAppointmentExpired(item)
                  ? "border-gray-300 bg-gray-100 opacity-60"
                  : "border-gray-200 bg-white"
              }`}
            >
              <div>
                <img
                  src={stylistImage}
                  alt={stylistName}
                  className={`w-32 h-32 object-cover rounded ${
                    isAppointmentExpired(item) ? "opacity-50" : ""
                  }`}
                />
              </div>
              <div className="md:col-span-2">
                <div className="flex items-center gap-2 mb-2">
                  <p className={`font-bold text-lg ${
                    isAppointmentExpired(item) ? "text-gray-500" : ""
                  }`}>{stylistName}</p>
                  {isAppointmentExpired(item) && (
                    <span className="px-2 py-1 bg-gray-400 text-white text-xs font-semibold rounded">
                      Hết hạn
                    </span>
                  )}
                </div>
                <p className={`text-sm ${
                  isAppointmentExpired(item) ? "text-gray-500" : "text-gray-600"
                }`}>
                  {item.styData?.speciality || stylist?.speciality}
                </p>
                <p className={`text-sm mt-2 ${
                  isAppointmentExpired(item) ? "text-gray-500" : ""
                }`}>
                  <span className="font-semibold">Địa chỉ:</span>
                </p>
                <p className={`text-sm ${
                  isAppointmentExpired(item) ? "text-gray-500" : "text-gray-700"
                }`}>
                  {item.styData?.address?.line1 || stylist?.address?.line1}
                </p>
                <p className={`text-sm ${
                  isAppointmentExpired(item) ? "text-gray-500" : "text-gray-700"
                }`}>
                  {item.styData?.address?.line2 || stylist?.address?.line2}
                </p>
                <p className={`text-sm mt-2 ${
                  isAppointmentExpired(item) ? "text-gray-500" : ""
                }`}>
                  <span className="font-semibold">Thời gian:</span>{" "}
                  {slotDateFormat(item.slotDate)} | {item.slotTime}
                </p>
                <p className={`text-sm mt-2 ${
                  isAppointmentExpired(item) ? "text-gray-500" : ""
                }`}>
                  <span className="font-semibold">Chi phí:</span>{" "}
                  {item.amount?.toLocaleString("vi-VN")} VND
                </p>
              </div>
              <div className="flex flex-col gap-2 justify-center">
                {isAppointmentExpired(item) ? (
                  <button className="px-4 py-2 bg-gray-400 text-white rounded cursor-default font-semibold">
                    Hết hạn
                  </button>
                ) : (
                  <>
                    {!item.cancelled && !item.payment && !item.isCompleted && (
                      <button
                        onClick={() => openPaymentTypeModal(item._id)}
                        disabled={paymentLoading[item._id]}
                        className="px-4 py-2 bg-primary text-white rounded hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {paymentLoading[item._id] ? "Đang xử lý..." : "Thanh toán"}
                      </button>
                    )}
                    {!item.cancelled && !item.payment && item.depositPaid && !item.isCompleted && (
                      <>
                        <button className="px-4 py-2 border border-emerald-500 text-emerald-600 rounded cursor-default">
                          ✓ Đã cọc {Number(item.depositAmount || Math.round((item.amount || 0) * 0.2)).toLocaleString("vi-VN")} VND
                        </button>
                        <button
                          onClick={() => { setPaymentModalType("full"); setAppointmentToPay(item._id); setDiscountCode(""); setDiscountAmount(0); setFinalAmount(0); setPaymentModalOpen(true); }}
                          disabled={paymentLoading[item._id]}
                          className="px-4 py-2 bg-primary text-white rounded hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {paymentLoading[item._id] ? "Đang xử lý..." : "Thanh toán phần còn lại"}
                        </button>
                      </>
                    )}
                    {!item.cancelled && item.payment && !item.isCompleted && (
                      <>
                        <button className="px-4 py-2 bg-green-500 text-white rounded cursor-default">
                          ✓ Đã thanh toán
                        </button>
                        <button
                          onClick={() => openRescheduleModal(item._id)}
                          disabled={item.rescheduleCount >= 1}
                          className="px-4 py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-50 transition disabled:opacity-50 disabled:cursor-not-allowed disabled:text-gray-400 disabled:border-gray-400"
                          title={item.rescheduleCount >= 1 ? "Đã đổi lịch" : ""}
                        >
                          Đổi lịch hẹn
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
                      <>
                        <button
                          onClick={() => openRescheduleModal(item._id)}
                          disabled={item.rescheduleCount >= 1}
                          className="px-4 py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-50 transition disabled:opacity-50 disabled:cursor-not-allowed disabled:text-gray-400 disabled:border-gray-400"
                          title={item.rescheduleCount >= 1 ? "Đã đổi lịch" : ""}
                        >
                          Đổi lịch hẹn
                        </button>
                        <button
                          onClick={() => openCancelModal(item._id)}
                          className="px-4 py-2 border border-red-600 text-red-600 rounded hover:bg-red-50 transition"
                        >
                          Hủy lịch hẹn
                        </button>
                      </>
                    )}
                    {item.cancelled && !item.isCompleted &&(
                      <button className="sm:min-w-48 py-2 border border-red-500 rounded text-red-500 cursor-default">
                        ✕ Đã hủy
                      </button>
                    )}

                    {item.isCompleted && <button className="sm:min-w-48 py-2 border border-green-500 rounded text-green-500">Hoàn thành</button>}
                  </>
                )}
              </div>
            </div>
          );
        })}
        {!appointments.length && (
          <p className="text-gray-500">Bạn chưa có lịch hẹn nào.</p>
        )}
      </div>

      {/* Modal Hủy Lịch Hẹn */}
      {paymentTypeModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-6">
            <h2 className="text-xl font-bold mb-2 text-gray-800">Chọn phương thức thanh toán</h2>
            <p className="text-sm text-gray-600 mb-5">Vui lòng chọn loại thanh toán mà bạn muốn thực hiện.</p>
            
            <div className="space-y-3">
              {appointmentToPay && appointments.find(a => a._id === appointmentToPay) && (
                <>
                  <button
                    onClick={() => selectPaymentType("full")}
                    className="w-full p-4 border-2 border-rose-500 rounded-lg hover:bg-rose-50 transition text-left"
                  >
                    <p className="font-semibold text-gray-800">Thanh toán đầy đủ</p>
                    <p className="text-sm text-gray-600">Số tiền: {(appointments.find(a => a._id === appointmentToPay)?.amount || 0).toLocaleString("vi-VN")} VND</p>
                  </button>
                  
                  {!appointments.find(a => a._id === appointmentToPay)?.depositPaid && (
                    <button
                      onClick={() => selectPaymentType("deposit")}
                      className="w-full p-4 border-2 border-emerald-500 rounded-lg hover:bg-emerald-50 transition text-left"
                    >
                      <p className="font-semibold text-gray-800">Thanh toán cọc (20%)</p>
                      <p className="text-sm text-gray-600">Số tiền: {Math.round((appointments.find(a => a._id === appointmentToPay)?.amount || 0) * 0.2).toLocaleString("vi-VN")} VND</p>
                    </button>
                  )}
                </>
              )}
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={closePaymentTypeModal}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

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

      {/* Modal Đổi Lịch Hẹn */}
      {rescheduleModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 max-h-96 overflow-y-auto">
            <h2 className="text-xl font-bold mb-2 text-gray-800">Đổi lịch hẹn</h2>
            <p className="text-sm text-red-600 font-medium mb-4">(⚠ Chỉ được đổi lịch 1 lần duy nhất)</p>
            
            {appointmentToReschedule && appointments.find(a => a._id === appointmentToReschedule) && (
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-3">
                  Chọn giờ mới cho lịch hẹn ngày {slotDateFormat(appointments.find(a => a._id === appointmentToReschedule)?.slotDate)}
                </p>
                
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {availableRescheduleSlots.map((slot, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedRescheduleSlot(slot.time)}
                      className={`p-2 rounded border text-sm font-medium transition ${
                        selectedRescheduleSlot === slot.time
                          ? "border-blue-600 bg-blue-50 text-blue-600"
                          : "border-gray-300 text-gray-700 hover:border-blue-400"
                      }`}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>
                
                {availableRescheduleSlots.length === 0 && (
                  <p className="text-sm text-red-600 mb-4">Không có giờ khả dụng trong ngày này</p>
                )}
              </div>
            )}
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setRescheduleModalOpen(false);
                  setAppointmentToReschedule(null);
                  setSelectedRescheduleSlot(null);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
              >
                Đóng
              </button>
              <button
                onClick={handleReschedule}
                disabled={rescheduleLoading || !selectedRescheduleSlot}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {rescheduleLoading ? "Đang xử lý..." : "Xác nhận đổi lịch"}
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    );
};

export default MyAppointments;
