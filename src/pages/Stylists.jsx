import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../context/AppContext";

const Stylists = () => {
  const { speciality } = useParams();
  const [filteredStylists, setFilteredStylists] = useState([]);
  const [showFilter, setShowFilter] = useState(false);
  const navigate = useNavigate();

  const { stylists } = useContext(AppContext);

  const normalizeSpeciality = (value = "") =>
    value
      .normalize("NFC")
      .toLowerCase()
      .replace(/&/g, "và")
      .replace(/\s+/g, " ")
      .trim();

  const isSpecialityActive = (value) =>
    normalizeSpeciality(speciality) === normalizeSpeciality(value);

  const handleSpecialityClick = (value) => {
    navigate(isSpecialityActive(value) ? "/stylists" : `/stylists/${value}`);
  };

  const applyFilter = () => {
    if (speciality) {
      const normalizedSpeciality = normalizeSpeciality(speciality);
      setFilteredStylists(
        stylists.filter(
          (stylist) =>
            normalizeSpeciality(stylist.speciality) === normalizedSpeciality,
        ),
      );
    } else {
      setFilteredStylists(stylists);
    }
  };

  useEffect(() => {
    applyFilter();
  }, [speciality, stylists]);

  return (
    <div>
      <p className="text-gray-600">Tất cả chuyên viên</p>
      <div className="flex flex-col sm:flex-row items-start gap-5 mt-5">
        <button
          onClick={() => setShowFilter(!showFilter)}
          className={`py-1 px-3 border rounded text-sm  transition-all sm:hidden ${showFilter ? "bg-primary text-white" : ""}`}
        >
          Bộ lọc
        </button>
        {/* <div className={`flex-col gap-4 text-sm text-gray-600 ${showFilter ? 'flex' : 'hidden sm:flex'}`}>
          <p onClick={() => handleSpecialityClick('Trang điểm')} className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 whitespace-nowrap rounded transition-all cursor-pointer ${isSpecialityActive('Trang điểm') ? 'bg-indigo-100 text-black' : ''}`}>Trang điểm</p>
          <p onClick={() => handleSpecialityClick('Cắt tóc')} className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 whitespace-nowrap rounded transition-all cursor-pointer ${isSpecialityActive('Cắt tóc') ? 'bg-indigo-100 text-black' : ''}`}>Cắt tóc</p>
          <p onClick={() => handleSpecialityClick('Gội đầu thư giãn')} className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 whitespace-nowrap rounded transition-all cursor-pointer ${isSpecialityActive('Gội đầu thư giãn') ? 'bg-indigo-100 text-black' : ''}`}>Gội đầu thư giãn</p>
          <p onClick={() => handleSpecialityClick('Chăm sóc cơ thể')} className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 whitespace-nowrap rounded transition-all cursor-pointer ${isSpecialityActive('Chăm sóc cơ thể') ? 'bg-indigo-100 text-black' : ''}`}>Chăm sóc cơ thể</p>
          <p onClick={() => handleSpecialityClick('Chăm sóc da')} className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 whitespace-nowrap rounded transition-all cursor-pointer ${isSpecialityActive('Chăm sóc da') ? 'bg-indigo-100 text-black' : ''}`}>Chăm sóc da</p>
          <p onClick={() => handleSpecialityClick('Uốn và Duỗi tóc')} className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 whitespace-nowrap rounded transition-all cursor-pointer ${isSpecialityActive('Uốn và Duỗi tóc') ? 'bg-indigo-100 text-black' : ''}`}>Uốn và Duỗi tóc</p>
        </div> */}
        <div
          className={`flex-col gap-3 text-sm text-gray-700 ${showFilter ? "flex" : "hidden sm:flex"}`}
        >
          {[
            "Trang điểm",
            "Cắt tóc",
            "Gội đầu thư giãn",
            "Chăm sóc cơ thể",
            "Chăm sóc da",
            "Uốn và Duỗi tóc",
          ].map((item) => (
            <p
              key={item}
              onClick={() => handleSpecialityClick(item)}
              className={`w-[94vw] sm:w-64 pl-4 py-2.5 pr-5 border rounded-lg transition-all duration-200 cursor-pointer shadow-sm
        ${
          isSpecialityActive(item)
            ? "bg-primary text-white border-primary font-medium"
            : "bg-white border-gray-200 hover:border-primary hover:bg-indigo-50 text-gray-600"
        }`}
            >
              {item}
            </p>
          ))}
        </div>
        <div className="grid w-full gap-4 grid-cols-auto gap-y-6">
          {filteredStylists.map((item, index) => (
            <div
              onClick={() => {
                navigate(`/appointment/${item._id}`);
                window.scrollTo(0, 0);
              }}
              className="border border-blue-200 rounded-xl overflow-hidden cursor-pointer hover:translate-y-[-10px] transition-all duration-500"
              key={index}
            >
              <img
                className="object-cover object-top w-full h-73 bg-blue-50"
                src={item.image}
                alt=""
              />
              <div className="p-4">
                <div className="flex items-center gap-2 text-sm text-center text-green-500">
                  <p className="w-2 h-2 bg-green-500 rounded-full"></p>
                  <p>Hoạt động</p>
                </div>
                <p className="text-lg font-medium text-black-900">
                  {item.name}
                </p>
                <p className="text-sm text-black-200">{item.speciality}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Stylists;
