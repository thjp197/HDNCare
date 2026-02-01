import React from "react";
import { assets } from "../assets/assets";

const Footer = () => {
  return (
    <div className="md:mx-10">
      <div className="flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-sm">
        {/* Left Section */}
        <div>
          <img src={assets.logo} alt="HDNCare logo" className="w-40 mb-5" />
          <p className="w-full leading-6 text-gray-600 md:w-2/3">
            HDNCare là nền tảng chăm sóc sắc đẹp hiện đại, kết nối khách hàng với stylist chuyên nghiệp,
            đặt lịch nhanh chóng, dịch vụ đa dạng, trải nghiệm tiện lợi và đáng tin cậy.
          </p>
        </div>

        {/* Center Section */}
        <div>
          <p className="mb-5 text-xl font-medium">HDN CARE</p>
          <ul className="flex flex-col gap-2 text-gray-600">
            <li>Trang chủ</li>
            <li>Về HDNCare</li>
            <li>Liên hệ chúng tôi</li>
            <li>Chính sách bảo mật</li>
          </ul>
        </div>

        {/* Right Section */}
        <div>
          <p className="mb-5 text-xl font-medium">Liên hệ</p>
          <ul className="flex flex-col gap-2 text-gray-600">
            <li>0567 276 276</li>
            <li>hdncare@gmail.com</li>
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
