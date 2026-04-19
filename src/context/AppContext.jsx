import { createContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const AppContext = createContext();

const AppContextProvider = (props) => {
  const currencySymbol = "VND";
  const backendUrl =
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_BACKEND_URL ||
    "http://localhost:4000";
  const [stylists, setStylists] = useState([]);
  const [token, setToken] = useState(
    localStorage.getItem("token") ? localStorage.getItem("token") : false,
  );
  const [userData, setUserData] = useState(false);

  const patchPersonalImages = async (payload) => {
    if (!token) {
      return { success: false, message: "Vui lòng đăng nhập" };
    }

    try {
      const { data } = await axios.patch(
        backendUrl + "/api/users/personal-images",
        payload,
        { headers: { token } },
      );

      if (data.success && Array.isArray(data.personalImages)) {
        setUserData((prev) =>
          prev ? { ...prev, personalImages: data.personalImages } : prev,
        );
      }

      return data;
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const loadUserProfileData = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/user/get-profile", {
        headers: { token },
      });
      if (data.success) {
        setUserData(data.userData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const getStylistsData = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/stylist/list");
      if (data.success) {
        setStylists(data.stylists);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    getStylistsData();
  }, []);

  useEffect(() => {
    if (token) {
      loadUserProfileData();
    } else {
      setUserData(false);
    }
  }, [token]);

  const value = {
    stylists,getStylistsData,
    currencySymbol,
    backendUrl,
    token,setToken,
    userData,setUserData,
    loadUserProfileData,
    patchPersonalImages,
  };

  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
};

export default AppContextProvider;
