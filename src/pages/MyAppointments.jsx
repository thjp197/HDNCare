import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import { assets, stylists as localStylists } from "../assets/assets";
import { toast } from "react-toastify";

const MyAppointments = () => {
  const { backendUrl, token, stylists, getStylistsData } = useContext(AppContext);

  const [appointments, setAppointments] = useState([]);

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
  // Mock data - thay sau với dữ liệu thực
  // const mockAppointments = [
  //   { stylistId: 'stylist1', date: '19/02/2026', time: '10:00 AM' },
  //   { stylistId: 'stylist2', date: '20/02/2026', time: '02:00 PM' },
  //   { stylistId: 'stylist3', date: '21/02/2026', time: '09:30 AM' },
  // ]

  // const handleCancel = (index) => {
  //   alert('Hủy lịch hẹn thành công!')
  // }

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

  const cancelAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/user/cancel-appointment",
        { appointmentId },
        { headers: { token } },
      );
      if (data.success) {
        toast.success(data.message);
        getUserAppointments(); // Refresh the appointments list
        getStylistsData(); // Refresh stylist data to update available slots
      } else {
        toast.error(data.message || "Không thể hủy lịch hẹn");
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  // const handleCancel = (appointmentId) => {
  //   setAppointments((prev) =>
  //     prev.filter((item) => item._id !== appointmentId),
  //   );
  //   toast.info("Tính năng hủy lịch đang được cập nhật");
  // };

  useEffect(() => {
    if (token) {
      getUserAppointments();
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
              </div>
              <div className="flex flex-col gap-2 justify-center">
                {!item.cancelled && <button className="px-4 py-2 bg-primary text-white rounded hover:bg-green-700 transition">
                  Thanh toán trực tuyến
                </button> }
                {!item.cancelled && (
                  <button
                    onClick={() => cancelAppointment(item._id)}
                    className="px-4 py-2 border border-red-600 text-red-600 rounded hover:bg-red-50 transition"
                  >
                    Hủy lịch hẹn
                  </button>
                )}
                {item.cancelled && <button className="sm:min-w-48 py-2 border border-red-500 rounded text-red-500">Appointment cancelled</button>}
              </div>
            </div>
          );
        })}
        {!appointments.length && (
          <p className="text-gray-500">Bạn chưa có lịch hẹn nào.</p>
        )}
      </div>
    </div>
  );
};

export default MyAppointments;
