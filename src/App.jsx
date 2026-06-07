import { useEffect } from 'react'; // BỔ SUNG
import { Route, Routes } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify'; // BỔ SUNG import toast
import 'react-toastify/dist/ReactToastify.css';
import { io } from 'socket.io-client'; // BỔ SUNG
import Chatbot from './components/Chatbot';
import Footer from './components/Footer';
import GlobalBannedAccountModal from './components/GlobalBannedAccountModal';
import Navbar from './components/Navbar';
import './index.css';
import About from './pages/About';
import AiMakeup from './pages/AiMakeup';
import Appointments from './pages/Appointment';
import Contact from './pages/Contact';
import Home from './pages/Home';
import Login from './pages/Login';
import MyAppointments from './pages/MyAppointments';
import MyProfile from './pages/MyProfile';
import MyWallet from './pages/MyWallet';
import Stylists from './pages/Stylists';

// Khởi tạo kết nối Socket (đặt bên ngoài Component để tránh bị render lại nhiều lần)
export const socket = io(import.meta.env.VITE_BACKEND_URL || "http://localhost:4000");

const App = () => {
  
  // BỔ SUNG: Lắng nghe sự kiện đổi chi nhánh từ Backend
  useEffect(() => {
    socket.on("stylist_branch_changed", (data) => {
      toast.warn(
        `⚠️ THÔNG BÁO QUAN TRỌNG: Chuyên viên ${data.stylistName} vừa được điều chuyển sang ${data.newBranch}. Nếu lịch hẹn của bạn bị ảnh hưởng, hệ thống đã tự động huỷ và hoàn 100% tiền vào Ví HDNCare!`, 
        {
          position: "top-right",
          autoClose: 10000, // Hiển thị 10 giây cho khách đọc kịp
        }
      );
    });

    // Cleanup khi unmount
    return () => {
      socket.off("stylist_branch_changed");
    };
  }, []);

  return (
    <div className='mx-4 sm:mx-[10%]'>
      <GlobalBannedAccountModal />
      <ToastContainer />
      <Navbar/>
      <Routes>
        <Route path='/' element={<Home />}/>
        <Route path='/stylists' element={<Stylists />}/>
        <Route path='/stylists/:speciality' element={<Stylists />}/>
        <Route path='/login' element={<Login />}/>
        <Route path='/about' element={<About />}/>
        <Route path='/contact' element={<Contact />}/>
        <Route path='/my-profile' element={<MyProfile />}/>
        <Route path='/my-appointments' element={<MyAppointments />}/>
        <Route path='/my-wallet' element={<MyWallet />}/>
        <Route path='/appointment/:styId' element={<Appointments />}/>
        <Route path='/ai-makeup' element={<AiMakeup />}/>
      </Routes>
      <Footer />
      <Chatbot />
    </div>
  )
}

export default App