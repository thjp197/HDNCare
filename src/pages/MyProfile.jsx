import axios from "axios";
import { Camera } from "lucide-react";
import { useContext, useState } from "react";
import { toast } from "react-toastify";
import { AppContext } from "../context/AppContext";

const MyProfile = () => {
  const { userData, setUserData, token, backendUrl, loadUserProfileData } =
    useContext(AppContext);

  const [isEdit, setIsEdit] = useState(false);
  const [image, setImage] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // State lưu thông báo lỗi cho validation
  const [errors, setErrors] = useState({
    phone: '',
    dob: ''
  });

  const updateUserProfileData = async () => {
    // Chặn không cho lưu nếu đang có lỗi
    if (errors.phone || errors.dob) {
      toast.error("Vui lòng sửa các lỗi nhập liệu trước khi lưu");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", userData.name);
      formData.append("phone", userData.phone);
      formData.append("address", JSON.stringify(userData.address));
      formData.append("gender", userData.gender);
      formData.append("dob", userData.dob);
      if (image) formData.append("image", image);

      const { data } = await axios.post(
        backendUrl + "/api/user/update-profile",
        formData,
        { headers: { token } },
      );

      if (data.success) {
        toast.success(data.message);
        await loadUserProfileData();
        setIsEdit(false);
        setImage(false);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const validateDifferentPassword = (currentPassword, newPassword) => {
    if (currentPassword && newPassword && currentPassword === newPassword) {
      toast.error("Mật khẩu mới phải khác mật khẩu cũ");
      return false;
    }
    return true;
  };

  const submitChangePassword = async () => {
    try {
      if (
        !passwordData.currentPassword ||
        !passwordData.newPassword ||
        !passwordData.confirmPassword
      ) {
        toast.error("Vui long nhap day du thong tin");
        return;
      }

      if (passwordData.newPassword.length < 8) {
        toast.error("Mat khau moi phai co it nhat 8 ky tu");
        return;
      }

      if (passwordData.newPassword !== passwordData.confirmPassword) {
        toast.error("Xac nhan mat khau moi khong khop");
        return;
      }

      if (
        !validateDifferentPassword(
          passwordData.currentPassword,
          passwordData.newPassword,
        )
      ) {
        return;
      }

      setIsChangingPassword(true);

      const { data } = await axios.post(
        backendUrl + "/api/user/change-password",
        passwordData,
        { headers: { token } },
      );

      if (data.success) {
        toast.success(data.message);
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setShowPasswordForm(false);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const closePasswordForm = () => {
    setShowPasswordForm(false);
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  // Hàm xử lý nhập Số điện thoại
  const handlePhoneChange = (e) => {
    // Loại bỏ tất cả ký tự không phải là số
    const value = e.target.value.replace(/\D/g, '');
    setUserData((prev) => ({ ...prev, phone: value }));

    // Kiểm tra độ dài
    if (value.length > 0 && (value.length < 10 || value.length > 11)) {
      setErrors((prev) => ({ ...prev, phone: 'Số điện thoại phải từ 10 đến 11 số' }));
    } else {
      setErrors((prev) => ({ ...prev, phone: '' }));
    }
  };

  // Hàm xử lý nhập Ngày sinh
  const handleDobChange = (e) => {
    const value = e.target.value;
    setUserData((prev) => ({ ...prev, dob: value }));

    if (!value) {
      setErrors((prev) => ({ ...prev, dob: '' }));
      return;
    }

    const selectedDate = new Date(value);
    const today = new Date();
    const minDate = new Date('1900-01-01');

    if (selectedDate > today) {
      setErrors((prev) => ({ ...prev, dob: 'Ngày sinh không thể lớn hơn ngày hiện tại' }));
    } else if (selectedDate < minDate || selectedDate.getFullYear() > 2100) {
      setErrors((prev) => ({ ...prev, dob: 'Năm sinh không hợp lệ' }));
    } else {
      setErrors((prev) => ({ ...prev, dob: '' }));
    }
  };

  return userData ? (
    <div className="mx-4 sm:mx-[10%] py-8">
      <div className="rounded-3xl border border-[#ead6dc] bg-gradient-to-br from-[#fff8fa] via-white to-[#fdf3f6] shadow-[0_20px_60px_rgba(97,21,43,0.12)] overflow-hidden">
        <div className="px-6 sm:px-10 py-8 border-b border-[#ecdde1] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="flex items-center gap-4">
            {isEdit ? (
              <label htmlFor="image" className="cursor-pointer">
                <div className="relative">
                  <img
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover ring-4 ring-white shadow-lg opacity-85"
                    src={image ? URL.createObjectURL(image) : userData.image}
                    alt="Ảnh đại diện"
                  />
                  <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1.5 shadow-md">
                    <Camera className="w-5 h-5" />
                  </div>{" "}
                </div>
                <input
                  onChange={(e) => setImage(e.target.files[0])}
                  type="file"
                  id="image"
                  hidden
                />
              </label>
            ) : (
              <img
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover ring-4 ring-white shadow-lg"
                src={userData.image}
                alt="Ảnh đại diện"
              />
            )}

            <div>
              <p className="text-xs tracking-[0.2em] text-[#7b1e3a] font-semibold uppercase">
                Tài khoản của bạn
              </p>
              {isEdit ? (
                <input
                  className="mt-2 bg-white text-2xl font-semibold w-full sm:w-64 px-3 py-1.5 border border-[#e8c9bc] rounded-xl text-[#1d1d1d] focus:outline-none focus:ring-1 focus:ring-[#7b1e3a]"
                  type="text"
                  onChange={(e) =>
                    setUserData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  value={userData.name}
                />
              ) : (
                <p className="text-2xl sm:text-3xl font-bold text-[#2b211e] mt-1">
                  {userData.name}
                </p>
              )}
              <p className="text-[#6f4d56] mt-1">{userData.email}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {isEdit ? (
              <button
                onClick={updateUserProfileData}
                className="px-5 py-2.5 rounded-xl bg-primary text-white hover:opacity-90 transition-all"
              >
                Lưu thông tin
              </button>
            ) : (
              <button
                onClick={() => setIsEdit(true)}
                className="px-5 py-2.5 rounded-xl border border-primary text-primary hover:bg-primary hover:text-white transition-all"
              >
                Chỉnh sửa hồ sơ
              </button>
            )}
            <button
              onClick={() => setShowPasswordForm(true)}
              className="px-5 py-2.5 rounded-xl border border-[#d7b3be] text-[#7b1e3a] bg-[#fff4f7] hover:bg-[#fdeaf0] transition-all"
            >
              Đổi mật khẩu
            </button>
          </div>
        </div>

        <div className="p-6 sm:p-10 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="rounded-2xl border border-[#efdee3] bg-white p-5">
            <p className="text-sm font-semibold tracking-wide text-[#8f2042] uppercase">
              Thông tin liên hệ
            </p>
            <div className="mt-4 space-y-4 text-sm">
              <div>
                <p className="text-[#8e6d62] mb-1">Số điện thoại</p>
                {isEdit ? (
                  <div className="flex flex-col gap-1">
                    <input
                      className={`w-full px-3 py-2 border rounded-lg bg-[#fffdfc] focus:outline-none focus:ring-1 ${
                        errors.phone ? "border-red-500 focus:ring-red-500" : "border-[#e6d2ca] focus:ring-[#7b1e3a]"
                      }`}
                      type="tel"
                      placeholder="Ví dụ: 0912345678"
                      onChange={handlePhoneChange}
                      value={userData.phone || ""}
                    />
                    {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
                  </div>
                ) : (
                  <p className="text-[#2f2a28] font-medium">{userData.phone}</p>
                )}
              </div>

              <div>
                <p className="text-[#8e6d62] mb-1">Địa chỉ 1</p>
                {isEdit ? (
                  <input
                    className="w-full px-3 py-2 border border-[#e6d2ca] rounded-lg bg-[#fffdfc] focus:outline-none focus:ring-1 focus:ring-[#7b1e3a]"
                    type="text"
                    placeholder="Số nhà, Tên đường..."
                    onChange={(e) =>
                      setUserData((prev) => ({
                        ...prev,
                        address: { ...prev.address, line1: e.target.value },
                      }))
                    }
                    value={userData.address?.line1 || ""}
                  />
                ) : (
                  <p className="text-[#2f2a28] font-medium">
                    {userData.address?.line1 || "-"}
                  </p>
                )}
              </div>

              <div>
                <p className="text-[#8e6d62] mb-1">Địa chỉ 2</p>
                {isEdit ? (
                  <input
                    className="w-full px-3 py-2 border border-[#e6d2ca] rounded-lg bg-[#fffdfc] focus:outline-none focus:ring-1 focus:ring-[#7b1e3a]"
                    type="text"
                    placeholder="Phường/Xã, Quận/Huyện..."
                    onChange={(e) =>
                      setUserData((prev) => ({
                        ...prev,
                        address: { ...prev.address, line2: e.target.value },
                      }))
                    }
                    value={userData.address?.line2 || ""}
                  />
                ) : (
                  <p className="text-[#2f2a28] font-medium">
                    {userData.address?.line2 || "-"}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#efdee3] bg-white p-5">
            <p className="text-sm font-semibold tracking-wide text-[#8f2042] uppercase">
              Thông tin cơ bản
            </p>
            <div className="mt-4 space-y-4 text-sm">
              <div>
                <p className="text-[#8e6d62] mb-1">Giới tính</p>
                {isEdit ? (
                  <select
                    className="w-full px-3 py-2 border border-[#e6d2ca] rounded-lg bg-[#fffdfc] focus:outline-none focus:ring-1 focus:ring-[#7b1e3a]"
                    onChange={(e) =>
                      setUserData((prev) => ({
                        ...prev,
                        gender: e.target.value,
                      }))
                    }
                    value={userData.gender}
                  >
                    <option value="Not Selected">Không chọn</option>
                    <option value="Male">Nam</option>
                    <option value="Female">Nữ</option>
                  </select>
                ) : (
                  <p className="text-[#2f2a28] font-medium">
                    {userData.gender}
                  </p>
                )}
              </div>

              <div>
                <p className="text-[#8e6d62] mb-1">Ngày sinh</p>
                {isEdit ? (
                  <div className="flex flex-col gap-1">
                    <input
                      className={`w-full px-3 py-2 border rounded-lg bg-[#fffdfc] focus:outline-none focus:ring-1 ${
                        errors.dob ? "border-red-500 focus:ring-red-500" : "border-[#e6d2ca] focus:ring-[#7b1e3a]"
                      }`}
                      type="date"
                      max={new Date().toISOString().split("T")[0]}
                      min="1900-01-01"
                      onChange={handleDobChange}
                      value={userData.dob || ""}
                    />
                    {errors.dob && <p className="text-xs text-red-500">{errors.dob}</p>}
                  </div>
                ) : (
                  <p className="text-[#2f2a28] font-medium">{userData.dob}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showPasswordForm && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl border border-[#ecd5dc] shadow-2xl p-6">
            <p className="text-2xl font-semibold text-[#2f211c]">
              Đổi mật khẩu
            </p>
            <p className="text-sm text-[#8a6960] mt-1">
              Mật khẩu mới cần có ít nhất 8 ký tự.
            </p>

            <div className="mt-5 space-y-3">
              <input
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                onBlur={() =>
                  validateDifferentPassword(
                    passwordData.currentPassword,
                    passwordData.newPassword,
                  )
                }
                type="password"
                placeholder="Mật khẩu hiện tại"
                className="w-full px-3 py-2.5 border border-[#e7d4cc] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#e6b39f]"
              />
              <input
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                onBlur={() =>
                  validateDifferentPassword(
                    passwordData.currentPassword,
                    passwordData.newPassword,
                  )
                }
                type="password"
                placeholder="Mật khẩu mới"
                className="w-full px-3 py-2.5 border border-[#e7d4cc] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#e6b39f]"
              />
              <input
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                type="password"
                placeholder="Xác nhận mật khẩu mới"
                className="w-full px-3 py-2.5 border border-[#e7d4cc] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#e6b39f]"
              />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={closePasswordForm}
                className="px-4 py-2.5 rounded-xl border border-[#dfc4bb] text-[#805f54] hover:bg-[#faf2ef]"
              >
                Hủy
              </button>
              <button
                onClick={submitChangePassword}
                disabled={isChangingPassword}
                className="px-4 py-2.5 rounded-xl bg-primary text-white hover:opacity-90 disabled:opacity-60"
              >
                {isChangingPassword ? "Đang xử lý..." : "Cập nhật mật khẩu"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  ) : null;
};

export default MyProfile;