import { assets } from "../assets/assets";
import Home from "../pages/Home";

const Footer = () => {
  return (
    <div className="md:mx-10">
      <div className="grid grid-cols-2 gap-x-8 gap-y-10 my-10 mt-40 text-sm sm:grid-cols-[3fr_1fr_1fr] sm:gap-14">
        {/* Left Section */}
        <div className="col-span-2 sm:col-span-1">
          <img src={assets.logo} alt="HDNCare logo" className="w-40 mb-5" />
          <p className="w-full leading-6 text-justify text-gray-600 md:w-2/3 md:text-left">
            HDNCare là nền tảng chăm sóc sắc đẹp hiện đại, kết nối khách hàng với stylist chuyên nghiệp,
            đặt lịch nhanh chóng, dịch vụ đa dạng, trải nghiệm tiện lợi và đáng tin cậy.
          </p>
        </div>

        {/* Center Section */}
        <div>
          <p className="mb-5 text-xl font-medium">HDN CARE</p>
          <ul className="flex flex-col gap-2 text-gray-600">
            <li><a href="/">Trang chủ</a></li>
            <li><a href="/stylists">Tất cả chuyên viên</a></li>
            <li><a href="/about">Về HDNCare</a></li>
            <li><a href="/contact">Liên hệ chúng tôi</a></li>
          </ul>
        </div>

        {/* Right Section */}
        <div className="min-w-0">
          <p className="mb-5 text-xl font-medium">Liên hệ</p>
          <ul className="flex flex-col gap-2 text-gray-600">
            <li><a href="tel:0567276276">0567 276 276</a></li>
            <li><a href="mailto:hdncare@gmail.com">hdncare@gmail.com</a></li>
          </ul>
        </div>
      </div>

      {/* Copyright Section */}
      <div>
        <hr />
        <p className="py-5 text-sm text-center">© 2026 HDNCare. All rights reserved.</p>
      </div>
    </div>
  );
};

export default Footer;
