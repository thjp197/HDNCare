import React, { useState } from "react";
import { assets } from "../../assets/assets";
import { AdminContext } from "../../context/AdminContext";
import { toast } from "react-toastify";
import { useContext } from "react";
import axios from "axios";

const AddStylist = () => {
  const [styImg, setStyImg] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [experience, setExperience] = useState("1 Year");
  const [fees, setFees] = useState("");
  const [about, setAbout] = useState("");
  const [speciality, setSpeciality] = useState("Trang điểm");
  const [degree, setDegree] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");

  const { backendUrl, aToken } = useContext(AdminContext);

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    try {
      if (!styImg) {
        return toast.error("Vui lòng tải ảnh nhà tạo mẫu");
      }

      const formData = new FormData();
      formData.append("image", styImg);
      formData.append("name", name);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("experience", experience);
      formData.append("fees", Number(fees));
      formData.append("about", about);
      formData.append("speciality", speciality);
      formData.append("degree", degree);
      formData.append(
        "address",
        JSON.stringify({ line1: address1, line2: address2 }),
      );

      //Console log formData
      formData.forEach((value, key) => {
        console.log(`${key}: ${value}`);
      });

      const { data } = await axios.post(backendUrl + "/api/admin/add-stylist",formData,{headers: { aToken }});

      if(data.success) {
        toast.success(data.message);
        setStyImg(false);
        setName("");
        setEmail("");
        setPassword("");
        setFees("");
        setAbout("");
        setDegree("");
        setAddress1("");
        setAddress2("");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
      console.log(error);
    }
  };

  return (
    <form onSubmit={onSubmitHandler} className="m-5 w-full">
      <p className="mb-3 text-lg font-medium">Add Stylist</p>

      <div className="bg-white px-8 py-8 border rounded w-full max-w-8xl max-h-[80vh] overflow-y-scroll">
        <div className="flex items-center gap-4 mb-8 text-gray-500">
          <label htmlFor="sty-img">
            <img
              className="w-16 bg-gray-100 rounded-full cursor-pointer"
              src={styImg ? URL.createObjectURL(styImg) : assets.upload_area}
              alt="Add Stylist"
            />
          </label>
          <input
            onChange={(e) => setStyImg(e.target.files[0])}
            type="file"
            id="sty-img"
            hidden
          />
          <p>
            Tải ảnh <br /> nhà tạo mẫu{" "}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row items-start gap-10 text-gray-600">
          <div className="w-full lg:flex-1 flex flex-col gap-4">
            <div className="flex-1 flex flex-col gap-1">
              <p>Tên nhà tạo mẫu</p>
              <input
                onChange={(e) => setName(e.target.value)}
                value={name}
                className="border rounded px-3 py-2"
                type="text"
                placeholder="Họ và tên"
                required
              />
            </div>

            <div className="flex-1 flex flex-col gap-1">
              <p>Email nhà tạo mẫu</p>
              <input
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                className="border rounded px-3 py-2"
                type="email"
                placeholder="Email"
                required
              />
            </div>

            <div className="flex-1 flex flex-col gap-1">
              <p>Mật khẩu nhà tạo mẫu</p>
              <input
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                className="border rounded px-3 py-2"
                type="password"
                placeholder="Mật khẩu"
                required
              />
            </div>

            <div className="flex-1 flex flex-col gap-1">
              <p>Kinh nghiệm</p>
              <select
                onChange={(e) => setExperience(e.target.value)}
                value={experience}
                className="border rounded px-3 py-2"
              >
                <option value="1 Year">1 Năm</option>
                <option value="2 Year">2 Năm</option>
                <option value="3 Year">3 Năm</option>
                <option value="4 Year">4 Năm</option>
                <option value="5 Year">5 Năm</option>
                <option value="6 Year">6 Năm</option>
                <option value="7 Year">7 Năm</option>
                <option value="8 Year">8 Năm</option>
                <option value="9 Year">9 Năm</option>
                <option value="10 Year">10 Năm</option>
              </select>
            </div>

            <div className="flex-1 flex flex-col gap-1">
              <p>Chi phí</p>
              <input
                onChange={(e) => setFees(e.target.value)}
                value={fees}
                className="border rounded px-3 py-2"
                type="number"
                placeholder="Chi phí"
                required
              />
            </div>
          </div>

          <div className="w-full lg:flex-1 flex flex-col gap-4">
            <div className="flex-1 flex flex-col gap-1">
              <p>Speciality</p>
              <select
                onChange={(e) => setSpeciality(e.target.value)}
                value={speciality}
                className="border rounded px-3 py-2"
              >
                <option value="Trang điểm">Trang điểm</option>
                <option value="Cắt tóc">Cắt tóc</option>
                <option value="Gội đầu thư giãn">Gội đầu thư giãn</option>
                <option value="Chăm sóc cơ thể">Chăm sóc cơ thể</option>
                <option value="Chăm sóc da">Chăm sóc da</option>
                <option value="Uốn và Duỗi tóc">Uốn và Duỗi tóc</option>
              </select>
            </div>

            <div className="flex-1 flex flex-col gap-1">
              <p>Bằng cấp</p>
              <input
                onChange={(e) => setDegree(e.target.value)}
                value={degree}
                className="border rounded px-3 py-2"
                type="text"
                placeholder="Bằng cấp..."
                required
              />
            </div>

            <div className="flex-1 flex flex-col gap-1">
              <p>Địa chỉ</p>
              <input
                onChange={(e) => setAddress1(e.target.value)}
                value={address1}
                className="border rounded px-3 py-2"
                type="text"
                placeholder="Địa chỉ 1"
                required
              />
              <input
                onChange={(e) => setAddress2(e.target.value)}
                value={address2}
                className="border rounded px-3 py-2"
                type="text"
                placeholder="Địa chỉ 2"
                required
              />
            </div>
          </div>
        </div>
      </div>

      <div>
        <p className="mt-4 mb-2">Thông tin nhà tạo mẫu</p>
        <textarea
          onChange={(e) => setAbout(e.target.value)}
          value={about}
          className="w-full px-4 pt-2 border rounded"
          type="text"
          placeholder="Viết thông tin về nhà tạo mẫu..."
          rows={5}
          required
        />
      </div>

      <button
        type="submit"
        className="bg-primary px-10 py-3 mt-4  text-white rounded-full"
      >
        Thêm nhà tạo mẫu
      </button>
    </form>
  );
};

export default AddStylist;
