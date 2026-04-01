import React from 'react'
import { assets } from '../assets/assets'

const Contact = () => {
  return (
    <div>

      <div className='text-center text-2xl pt-10 text-[#707070]'>
        <p>LIÊN HỆ <span className='text-gray-700 font-semibold'>CHÚNG TÔI</span></p>
      </div>

      <div className='my-10 flex flex-col justify-center md:flex-row gap-10 mb-28 text-sm'>
        <img className='w-full md:max-w-[330px] object-contain' src={assets.logo} alt="" />
        <div className='flex flex-col justify-center items-start gap-6'>
          <p className=' font-semibold text-lg text-gray-600'>ĐỊA CHỈ CỦA CHÚNG TÔI</p>
          <p className=' text-gray-500'>01 Nơ Trang Long <br /> P.Bình Lợi Trung, TP. Hồ Chí Minh</p>
          <p className=' text-gray-500'>Số điện thoại: 0567 276 276 <br /> Email: hdncare@gmail.com</p>
          <p className=' font-semibold text-lg text-gray-600'>CƠ HỘI NGHỀ NGHIỆP TẠI HDNCARE</p>
          <p className=' text-gray-500'>Tìm hiểu thêm về đội ngũ và ví trí tuyển dụng của chúng tôi.</p>
          <button className='border border-black px-8 py-4 text-sm hover:bg-black hover:text-white transition-all duration-500'>Khám phá việc làm</button>
        </div>
      </div>

    </div>
  )
}

export default Contact