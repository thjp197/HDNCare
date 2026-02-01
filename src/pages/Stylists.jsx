import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../context/AppContext";

const Stylists = () => {
  const { speciality } = useParams();
  const [filteredStylists, setFilteredStylists] = useState([]);
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
      <p>Tất cả nhà tạo mẫu</p>
      <div>
        <div>
          <p>Make up</p>
          <p>Cắt tóc</p>
          <p>Gội đầu thư giãn</p>
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
