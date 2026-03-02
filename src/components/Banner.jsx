import { useNavigate } from 'react-router-dom';
import { assets } from '../assets/assets';

const Banner = () => {
    const navigate = useNavigate();
    
  return (
    <div className='flex px-6 my-20 rounded-lg bg-primary sm:px-10 md:px-14 lg:px-12 md:mx-10'>
        {/* Left side */}
        <div className='flex-1 py-8 sm:py-10 md:py-16 lg:py-24 lg:pl-5'>
            <div className='text-xl font-semibold text-white sm:text-2xl md:text-3xl lg:text-5xl'>
                <p>Đặt lịch hẹn</p>
                <p className='mt-4'>Với hơn 100+ chuyên gia </p>
                <p className='mt-4'>đáng tin cậy </p>
                
            </div>
            <button onClick={() => { navigate('/login'); scrollTo(0,0); }} className='px-8 py-3 mt-6 text-sm text-gray-600 transition-all bg-white rounded-full sm:text-base hover:scale-105'>Tạo tài khoản</button>
        </div>
        {/* Right side */}
        <div className='hidden md:block md:w-1/2 lg:w-[720px] relative'>
            <img className='absolute bottom-0 right-0 w-full h-full max-w-md' src={assets.appointment_img} alt="" />
        </div>
    </div>
  )
}

export default Banner