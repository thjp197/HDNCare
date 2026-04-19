import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import RelatedStylist from "../components/RelatedStylists";
import { toast } from "react-toastify";
import axios from "axios";

const Appointment = () => {
  const { styId } = useParams();
  const {
    stylists,
    currencySymbol,
    backendUrl,
    token,
    getStylistsData,
    userData,
  } =
    useContext(AppContext);
  const dayOfWeek = [
    "Chủ nhật",
    "Thứ hai",
    "Thứ ba",
    "Thứ tư",
    "Thứ năm",
    "Thứ sáu",
    "Thứ bảy",
  ];

  const navigate = useNavigate();

  const [styInfo, setStyInfo] = useState(null);
  const [stySlots, setStySlots] = useState([]);
  const [slotIndex, setSlotIndex] = useState(0);
  const [slotTime, setSlotTime] = useState("");
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedStyleImage, setSelectedStyleImage] = useState(null);

  const fetchStyInfo = () => {
    const styInfo = stylists.find((sty) => sty._id === styId);
    setStyInfo(styInfo || null);
  };

  const getAvailabelSlots = async () => {
    if (!styInfo) {
      return;
    }

    setStySlots([]);
    const bookedSlots = styInfo.slots_booked || {};

    // Lấy ngày hiện tại
    let today = new Date();

    for (let i = 0; i < 7; i++) {
      // getting date
      let currentDate = new Date(today);
      currentDate.setDate(today.getDate() + i);

      // setting end time date
      let endTime = new Date();
      endTime.setDate(today.getDate() + i);
      endTime.setHours(21, 0, 0, 0); // 21 PM

      // setting hours
      if (today.getDate() === currentDate.getDate()) {
        currentDate.setHours(
          currentDate.getHours() > 9 ? currentDate.getHours() + 1 : 9,
        ); // from 9 AM
        currentDate.setMinutes(currentDate.getMinutes() > 30 ? 0 : 0);
      } else {
        currentDate.setHours(9); // from 9 AM
        currentDate.setMinutes(0);
      }

      let timeSlots = [];

      while (currentDate < endTime) {
        let formattedTime = currentDate.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });

        let day = currentDate.getDate();
        let month = currentDate.getMonth() + 1; // Tháng bắt đầu từ 0
        let year = currentDate.getFullYear();

        const slotDate = day + "_" + month + "_" + year;
        const slotTime = formattedTime;

        const isSlotAvailable =
          bookedSlots[slotDate] && bookedSlots[slotDate].includes(slotTime)
            ? false
            : true;

        if (isSlotAvailable) {
          // add slot to array
          timeSlots.push({
            datetime: new Date(currentDate),
            time: formattedTime,
          });
        }

        // Increment by 60 minutes
        currentDate.setMinutes(currentDate.getMinutes() + 60);
      }

      setStySlots((prev) => [...prev, timeSlots]);
    }
  };

  const bookAppointment = async () => {
    if (!token) {
      toast.warn("Login to book appointment");
      return navigate("/login");
    }

    try {
      const date = stySlots[slotIndex][0].datetime;

      let day = date.getDate();
      let month = date.getMonth() + 1; // Tháng bắt đầu từ 0
      let year = date.getFullYear();

      const slotDate = day + "_" + month + "_" + year;

      const { data } = await axios.post(
        backendUrl + "/api/user/book-appointment",
        { styId, slotDate, slotTime, selectedStyleImage },
        { headers: { token } },
      );
      if (data.success) {
        toast.success(data.message);
        getStylistsData();
        navigate("/my-appointments");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const formatVndSpace = (price) => {
    return price.toLocaleString("vi-VN").replace(/\./g, ".");
  };

  useEffect(() => {
    fetchStyInfo();
  }, [stylists, styId]);

  useEffect(() => {
    if (styInfo) {
      getAvailabelSlots();
    }
  }, [styInfo]);

  useEffect(() => {
    console.log(stySlots);
  }, [stySlots]);

  return (
    styInfo && (
      <div>
        {/* Stylist Details */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div>
            <img
              className="bg-primary w-full sm:max-w-72 rounded-lg"
              src={styInfo.image}
              alt=""
            />
          </div>

          <div className="flex-1 border border-gray-400 rounded-lg p-8 py-7 bg-white mx-2 sm:mx-0 mt-[-80px] sm:mt-0">
            {/* Sty Info : tên, bằng cấp, kinh nghiệm */}
            <p className="flex items-center gap-2 text-2xl font-medium text-gray-900">
              {styInfo.name}
              <img className="w-5" src={assets.verified_icon} alt="" />
            </p>

            <div className="flex items-center gap-2 tex-sm mt-1 text-gray-600">
              <p>
                {styInfo.degree} - {styInfo.speciality}
              </p>
              <button className="py-0.5 px-2 border text-xs rounded-full">
                {styInfo.experience}
              </button>
            </div>

            {/* Thông tin Stylist */}
            <div>
              <p className="flex items-center gap-1 text-sm font-medium text-gray-900 mt-3">
                Thông tin nhà tạo mẫu <img src={assets.info_icon} alt="" />
              </p>
              <p className="text-sm text-gray-500 max-w-[700px] mt-1">
                {styInfo.about}
              </p>
            </div>
            <p className="text-gray-500 font-medium mt-4">
              Phí đặt lịch hẹn:{" "}
              <span className="text-gray-600">
                {formatVndSpace(styInfo.fees)} {currencySymbol}
              </span>
            </p>
          </div>
        </div>

        {/* Booking Slots */}
        <div className="sm:ml-72 sm:pl-4 mt-8 font-medium text-[#565656]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p>Chọn thời gian</p>

            <button
              onClick={() => setShowImageModal(true)}
              className="rounded-xl border border-[#d7b3be] bg-[#fff6f9] px-4 py-2 text-sm text-[#7b1e3a] hover:bg-[#feeef4] transition-all"
            >
              Chia sẻ hình ảnh của bạn
            </button>
          </div>
          <div className="flex gap-3 items-center w-full mt-4 overflow-x-auto">
  {stySlots.length &&
    stySlots.map((item, index) => (
      <div
        onClick={() => setSlotIndex(index)}
        key={index}
        /* - Thay đổi: w-20 h-20 (hoặc w-16 h-16) để tạo hình vuông cân đối.
           - flex-shrink-0: Đảm bảo ô không bị méo khi hàng quá dài.
           - flex flex-col justify-center: Để căn chữ vào đúng tâm hình tròn.
        */
        className={`flex flex-col items-center justify-center w-20 h-20 flex-shrink-0 rounded-full cursor-pointer transition-all ${
          slotIndex === index 
            ? "bg-primary text-white border-primary shadow-lg" 
            : "border border-[#DDDDDD] text-[#565656]"
        }`}
      >
        <p className="text-sm font-medium">
          {item[0] && dayOfWeek[item[0].datetime.getDay()]}
        </p>
        <p className="text-lg font-bold">
          {item[0] && item[0].datetime.getDate()}
        </p>
      </div>
    ))}
</div>

          <div className="flex items-center gap-3 w-full overflow-x-auto mt-4 pb-2 border-b-0 shadow-none">
            {stySlots.length &&
              stySlots[slotIndex].map((item, index) => (
                <p
                  onClick={() => setSlotTime(item.time)}
                  key={index}
                  className={`text-sm font-light  flex-shrink-0 px-5 py-2 rounded-full cursor-pointer ${item.time === slotTime ? "bg-primary text-white" : "text-[#949494] border border-[#B4B4B4]"}`}
                >
                  {item.time.toLowerCase()}
                </p>
              ))}
          </div>

          <button
            onClick={bookAppointment}
            className="bg-primary text-white text-sm font-light px-20 py-3 rounded-full my-6"
          >
            Đặt lịch
          </button>

          {selectedStyleImage && (
            <div className="mb-4 flex items-center gap-2 text-sm text-[#7b1e3a]">
              <span>Ảnh đã chọn:</span>
              <img
                src={selectedStyleImage}
                alt="Ảnh phong cách đã chọn"
                className="h-10 w-10 rounded-lg object-cover border border-[#e6ced6]"
              />
              <button
                onClick={() => setSelectedStyleImage(null)}
                className="text-xs underline"
              >
                Bỏ chọn
              </button>
            </div>
          )}
        </div>

        {showImageModal && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-4">
            <div className="w-full max-w-4xl rounded-2xl border border-[#ecd5dc] bg-white p-6 shadow-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xl font-semibold text-[#2f211c]">
                    Chọn ảnh chia sẻ với stylist
                  </p>
                  <p className="text-sm text-[#8a6960] mt-1">
                    Chọn tối đa 1 ảnh để stylist tham khảo phong cách makeup bạn muốn.
                  </p>
                </div>
                <button
                  onClick={() => setShowImageModal(false)}
                  className="rounded-lg border border-[#e6ced6] px-3 py-1.5 text-sm text-[#7b1e3a]"
                >
                  Đóng
                </button>
              </div>

              {Array.isArray(userData?.personalImages) &&
              userData.personalImages.length > 0 ? (
                <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[55vh] overflow-y-auto pr-1">
                  {userData.personalImages.map((imgUrl) => {
                    const isSelected = selectedStyleImage === imgUrl;
                    return (
                      <button
                        key={imgUrl}
                        onClick={() => setSelectedStyleImage(imgUrl)}
                        className={`relative overflow-hidden rounded-xl border-2 transition-all ${isSelected ? "border-primary ring-2 ring-primary/20" : "border-[#ead5dd]"}`}
                      >
                        <img
                          src={imgUrl}
                          alt="Ảnh makeup cá nhân"
                          className="h-36 w-full object-cover"
                        />
                        {isSelected && (
                          <span className="absolute top-2 right-2 h-6 w-6 rounded-full bg-primary text-white text-xs flex items-center justify-center">
                            ✓
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="mt-5 rounded-xl border border-dashed border-[#ead5dd] bg-[#fff8fb] p-8 text-center text-[#8a6960]">
                  Bạn chưa có ảnh trong thư viện. Vui lòng vào trang AI Makeup để lưu ảnh trước.
                </div>
              )}

              <div className="mt-5 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setSelectedStyleImage(null);
                    setShowImageModal(false);
                  }}
                  className="rounded-xl border border-[#e6ced6] px-4 py-2 text-sm text-[#7b1e3a]"
                >
                  Không chia sẻ ảnh
                </button>
                <button
                  onClick={() => setShowImageModal(false)}
                  className="rounded-xl bg-primary px-4 py-2 text-sm text-white"
                >
                  Xác nhận chọn
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Listing related stylists */}
        <RelatedStylist speciality={styInfo.speciality} docId={styId} />
      </div>
    )
  );
};

export default Appointment;
