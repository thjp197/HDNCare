import React from 'react'
import { assets } from '../assets/assets'

const About = () => {
  return (
    <div>

      <div className='text-center text-2xl pt-10 text-[#707070]'>
        <p>Về <span className='text-gray-700 font-semibold'>HDNCARE</span></p>
      </div>

      <div className='my-10 flex flex-col md:flex-row gap-12'>
        <img className='w-full md:max-w-[360px]' src={assets.logo} alt="" />
        <div className='flex flex-col justify-center gap-6 md:w-2/4 text-sm text-gray-600'>
          <p>Chào mừng bạn đến với HDNCARE, người bạn đồng hành đáng tin cậy trong hành trình chăm sóc sắc đẹp và phong cách của phái đẹp một cách tiện lợi và hiệu quả. Tại HDNCARE, chúng tôi thấu hiểu những khó khăn của phụ nữ hiện đại khi tìm kiếm một chuyên viên makeup phù hợp, stylist chuyên nghiệp hay các dịch vụ làm đẹp cá nhân hóa.</p>
          <p>HDNCARE cam kết mang đến sự xuất sắc trong lĩnh vực công nghệ làm đẹp. Chúng tôi không ngừng cải thiện nền tảng, cập nhật những xu hướng mới nhất nhằm nâng cao trải nghiệm người dùng và cung cấp dịch vụ chất lượng vượt trội. Dù bạn đang chuẩn bị cho lần trang điểm đầu tiên, một buổi makeover đặc biệt hay chăm sóc phong cách thường ngày, HDNCARE luôn sẵn sàng đồng hành cùng bạn ở mọi bước.</p>
          <b className='text-gray-800'>Tầm nhìn của chúng tôi</b>
          <p>Tầm nhìn của HDNCARE là tạo ra một trải nghiệm làm đẹp liền mạch và dễ dàng cho mọi phụ nữ. Chúng tôi mong muốn kết nối khách hàng với những makeup artist và stylist uy tín, giúp bạn tiếp cận dịch vụ làm đẹp nhanh chóng, đúng lúc và đúng nhu cầu.</p>
        </div>
      </div>

      <div className='text-xl my-4'>
        <p>TẠI SAO <span className='text-gray-700 font-semibold'>CHỌN CHÚNG TÔI</span></p>
      </div>

      <div className='flex flex-col md:flex-row mb-20'>
        <div className='border px-10 md:px-16 py-8 sm:py-16 flex flex-col gap-5 text-[15px] hover:bg-primary hover:text-white transition-all duration-300 text-gray-600 cursor-pointer'>
          <b>HIỆU QUẢ:</b>
          <p>Streamlined appointment scheduling that fits into your busy lifestyle.</p>
        </div>
        <div className='border px-10 md:px-16 py-8 sm:py-16 flex flex-col gap-5 text-[15px] hover:bg-primary hover:text-white transition-all duration-300 text-gray-600 cursor-pointer'>
          <b>TIỆN LỢI: </b>
          <p>Tiếp cận mạng lưới chuyên viên trang điểm và stylist đáng tin cậy ngay trong khu vực của bạn.</p>
        </div>
        <div className='border px-10 md:px-16 py-8 sm:py-16 flex flex-col gap-5 text-[15px] hover:bg-primary hover:text-white transition-all duration-300 text-gray-600 cursor-pointer'>
          <b>CÁ NHÂN HÓA:</b>
          <p >Gợi ý dịch vụ, nhắc lịch và tư vấn phong cách được thiết kế riêng để bạn luôn tự tin và tỏa sáng.</p>
        </div>
      </div>

    </div>
  )
}

export default About