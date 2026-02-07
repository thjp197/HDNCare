import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../context/AppContext";

const Stylists = () => {
  const { speciality } = useParams();
  const [filteredStylists, setFilteredStylists] = useState([]);
  const [showFilter, setShowFilter] = useState(false);
  const navigate = useNavigate();

  const { stylists } = useContext(AppContext);

  const applyFilter = () => {
    if (speciality) {
      setFilteredStylists(
        stylists.filter((stylist) => stylist.speciality === speciality),
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
        <button onClick={() => setShowFilter(!showFilter)} className={`py-1 px-3 border rounded text-sm  transition-all sm:hidden ${showFilter ? 'bg-primary text-white' : ''}`}>Bộ lọc</button>
        <div className={`flex-col gap-4 text-sm text-gray-600 ${showFilter ? 'flex' : 'hidden sm:flex'}`}>
          <p onClick={()=> speciality === 'Trang điểm' ? navigate('/stylists') : navigate('/stylists/Trang điểm')} className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 whitespace-nowrap rounded transition-all cursor-pointer ${speciality === 'Trang điểm' ? 'bg-indigo-100 text-black' : ''}`}>Trang điểm</p>
          <p onClick={()=> speciality === 'Cắt tóc' ? navigate('/stylists') : navigate('/stylists/Cắt tóc')} className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 whitespace-nowrap rounded transition-all cursor-pointer ${speciality === 'Cắt tóc' ? 'bg-indigo-100 text-black' : ''}`}>Cắt tóc</p>
          <p onClick={()=> speciality === 'Gội đầu thư giãn' ? navigate('/stylists') : navigate('/stylists/Gội đầu thư giãn')} className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 whitespace-nowrap rounded transition-all cursor-pointer ${speciality === 'Gội đầu thư giãn' ? 'bg-indigo-100 text-black' : ''}`}>Gội đầu thư giãn</p>
          <p onClick={()=> speciality === 'Chăm sóc cơ thể' ? navigate('/stylists') : navigate('/stylists/Chăm sóc cơ thể')} className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 whitespace-nowrap rounded transition-all cursor-pointer ${speciality === 'Chăm sóc cơ thể' ? 'bg-indigo-100 text-black' : ''}`}>Chăm sóc cơ thể</p>
          <p onClick={()=> speciality === 'Chăm sóc da' ? navigate('/stylists') : navigate('/stylists/Chăm sóc da')} className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 whitespace-nowrap rounded transition-all cursor-pointer ${speciality === 'Chăm sóc da' ? 'bg-indigo-100 text-black' : ''}`}>Chăm sóc da</p>
          <p onClick={()=> speciality === 'Uốn & Duỗi tóc' ? navigate('/stylists') : navigate('/stylists/Uốn & Duỗi tóc')} className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 whitespace-nowrap rounded transition-all cursor-pointer ${speciality === 'Uốn & Duỗi tóc' ? 'bg-indigo-100 text-black' : ''}`}>Uốn & Duỗi tóc</p>
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
                  <p>Available</p>
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
