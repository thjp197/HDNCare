import React, { useContext, useEffect } from "react";
import { assets } from "../../assets/assets";
import { AdminContext } from "../../context/AdminContext";
import { AppContext } from "../../context/AppContext";

const Dashboard = () => {
  const { aToken, getDashData, cancelAppointment, dashData } =
    useContext(AdminContext);
  const { slotDateFormat } = useContext(AppContext);

  useEffect(() => {
    if (aToken) {
      getDashData();
    }
  }, [aToken]);

  return (
    dashData && (
      <div className="m-5 space-y-6 font-sans">
        <div className="rounded-2xl border border-rose-100 bg-gradient-to-r from-rose-50 via-pink-50 to-amber-50 p-5 shadow-sm">
          <p className="text-sm text-rose-600/80 font-sans">
            Bảng kiểm soát quản trị viên
          </p>
          <h2 className="mt-1 text-2xl font-bold font-sans text-gray-800">
            Tổng Quan Hoạt Động HDNCare
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <div className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <span className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-rose-100/70 transition-transform duration-300 group-hover:scale-125"></span>
            <div className="relative flex items-center gap-4">
              <div className="rounded-xl bg-rose-50 p-2">
                <img
                  className="w-12 font-sans"
                  src={assets.stylist_icon}
                  alt="Chuyen vien"
                />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Chuyên Viên</p>
                <p className="text-2xl font-bold text-gray-800">
                  {dashData.stylists}
                </p>
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <span className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-cyan-100/70 transition-transform duration-300 group-hover:scale-125"></span>
            <div className="relative flex items-center gap-4">
              <div className="rounded-xl bg-cyan-50 p-2">
                <img
                  className="w-12 font-sans"
                  src={assets.appointments_icon}
                  alt="Lich hen"
                />
              </div>
              <div>
                <p className="text-sm font-sans font-medium text-gray-500">
                  Lịch Hẹn
                </p>
                <p className="text-2xl  font-bold text-gray-800">
                  {dashData.appointments}
                </p>
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <span className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-amber-100/70 transition-transform duration-300 group-hover:scale-125"></span>
            <div className="relative flex items-center gap-4">
              <div className="rounded-xl bg-amber-50 p-2">
                <img
                  className="w-12 font-sans"
                  src={assets.customers_icon}
                  alt="Khach hang"
                />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Khách Hàng</p>
                <p className="text-2xl font-bold text-gray-800">
                  {dashData.users}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="flex items-center gap-2.5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white px-4 py-4">
            <img src={assets.list_icon} alt="Danh sach lich hen" />
            <p className="text-base font-semibold text-gray-800">
              Lịch Hẹn Mới Nhất
            </p>
          </div>

          <div className="divide-y font-sans divide-gray-100">
            {dashData.latestAppointments.slice(0, 5).map((item, index) => (
              <div
                className="flex items-center gap-3 px-6 py-3 transition-colors hover:bg-rose-50/40"
                key={index}
              >
                <img
                  className="w-10 rounded-full ring-2 ring-white"
                  src={item.styData.image}
                  alt="Anh chuyen vien"
                />
                <div className="flex-1 text-sm">
                  <p className="font-medium font-sans text-gray-800">
                    {item.styData.name}
                  </p>
                  <p className="text-gray-600 font-sans">
                    Đặt Lịch: {slotDateFormat(item.slotDate)}
                  </p>
                </div>
                {item.cancelled ? (
                  <p className="text-red-400 text-sm font-sans font-medium ">
                    Đã Hủy
                  </p>
                ) : item.isCompleted ? (
                  <p className="text-green-500 text-sm font-sans font-medium ">
                    Hoàn thành
                  </p>
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
        </div>
      </div>
    )
  );
};

export default Dashboard;
