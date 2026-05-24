import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../context/AppContext";

const Stylists = () => {
  const { speciality } = useParams();
  const [filteredStylists, setFilteredStylists] = useState([]);
  const [showFilter, setShowFilter] = useState(false);
  const [searchName, setSearchName] = useState("");
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
    let result = stylists;

    // Filter by speciality
    if (speciality) {
      const normalizedSpeciality = normalizeSpeciality(speciality);
      result = result.filter(
        (stylist) =>
          normalizeSpeciality(stylist.speciality) === normalizedSpeciality,
      );
    }

    // Filter by name
    if (searchName.trim()) {
      const lowerSearchName = searchName.toLowerCase();
      result = result.filter((stylist) =>
        stylist.name.toLowerCase().includes(lowerSearchName),
      );
    }

    setFilteredStylists(result);
  };

  useEffect(() => {
    applyFilter();
  }, [speciality, stylists, searchName]);

  return (
    <div>
      <p className="text-gray-600">Tất cả chuyên viên</p>
      
      {/* Search Bar */}
      <div className="mt-6 mb-8">
        <div className="relative">
          <svg
            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Tìm kiếm theo tên chuyên viên..."
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg text-sm bg-blue-50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-20 shadow-md transition-all"
          />
        </div>
      </div>

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
            "Nhuộm tóc",
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
                <div className="flex items-center gap-2 text-sm font-sans ${item.available ? 'text-green-500' : 'text-gray-500'}">
                  <p
                    className={
                      "w-2 h-2 " +
                      (item.available ? "bg-green-500" : "bg-gray-500") +
                      " rounded-full"
                    }
                  ></p>
                  <p>{item.available ? "Hoạt động" : "Không hoạt động"}</p>
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
