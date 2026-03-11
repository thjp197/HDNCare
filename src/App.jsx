import { Route, Routes } from 'react-router-dom'
import Chatbot from './components/Chatbot'
import Footer from './components/Footer'
import Navbar from './components/Navbar'
import './index.css'
import About from './pages/About'
import Appointments from './pages/Appointment'
import Contact from './pages/Contact'
import Home from './pages/Home'
import Login from './pages/Login'
import MyAppointments from './pages/MyAppointments'
import MyProfile from './pages/MyProfile'
import Stylists from './pages/Stylists'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const App = () => {
  
  return (
    <div className='mx-4 sm:mx-[10%]'>
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
        <Route path='/appointment/:styId' element={<Appointments />}/>
      </Routes>
      <Footer />
      <Chatbot />
    </div>
  )
}

export default App
