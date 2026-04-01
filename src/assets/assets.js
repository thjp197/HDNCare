export const assets = {
  logo: "/logo.png",
  profile_pic: "/logo.png",
  dropdown_icon: "/dropdown_icon.svg",
  group_profiles: "/group_profiles.png",
  arrow_icon: "/arrow_icon.svg",
  header_img: "/banner.png",
  appointment_img: "/appointment_img.png",
  verified_icon: "/verified_icon.svg",
  info_icon: "/info_icon.svg",
  menu_icon: "/menu_icon.svg",
};

export const specialityData = [
  {
    speciality: "Gội đầu thư giãn",
    image: "/facial-massage.png",
  },
  {
    speciality: "Trang điểm",
    image: "/makeup.png",
  },
  {
    speciality: "Cắt tóc",
    image: "/salon.png",
  },
  {
    speciality: "Uốn và Duỗi tóc",
    image: "/hair-curler.png",
  },
  {
    speciality: "Chăm sóc da",
    image: "/skincare.png",
  },
  {
    speciality: "Chăm sóc cơ thể",
    image: "/massage.png",
  },
];

export const stylists = [
  // ===== TRANG ĐIỂM =====
  {
    _id: "stylist1",
    name: "Nguyễn Thảo My",
    image: "/sty1.jpg",
    speciality: "Trang điểm",
    degree: "Certified Professional Makeup Artist",
    experience: "4 Years",
    about:
      "Nguyễn Thảo My là chuyên viên trang điểm chuyên nghiệp với kinh nghiệm làm việc cùng nhiều khách hàng nữ ở các độ tuổi khác nhau. Cô chú trọng vào việc tôn lên đường nét tự nhiên của khuôn mặt, lựa chọn phong cách trang điểm phù hợp với làn da, sự kiện và cá tính riêng của từng khách hàng, mang lại sự tự tin và vẻ đẹp hài hòa.",
    fees: 700000,
    address: {
      line1: "17th Cross, Richmond",
      line2: "Circle, Ring Road, London",
    },
  },
  {
    _id: "stylist2",
    name: "Trần Ngọc Anh",
    image: "/sty2.jpg",
    speciality: "Trang điểm",
    degree: "Certified Professional Makeup Artist",
    experience: "3 Years",
    about:
      "Trần Ngọc Anh chuyên về trang điểm cho phụ nữ từ phong cách nhẹ nhàng hằng ngày đến những layout nổi bật cho tiệc và sự kiện. Cô tin rằng trang điểm không chỉ làm đẹp mà còn giúp khách hàng thể hiện cá tính, sự tự tin và phong thái riêng thông qua từng chi tiết nhỏ trên khuôn mặt.",
    fees: 650000,
    address: {
      line1: "27th Cross, Richmond",
      line2: "Circle, Ring Road, London",
    },
  },
  {
    _id: "stylist3",
    name: "Lê Thu Hương",
    image: "/sty3.jpg",
    speciality: "Trang điểm",
    degree: "Certified Professional Makeup Artist",
    experience: "1 Year",
    about:
      "Lê Thu Hương tập trung vào phong cách trang điểm tự nhiên, trong trẻo và phù hợp với làn da châu Á. Cô luôn lắng nghe mong muốn của khách hàng, kết hợp kỹ thuật makeup hiện đại với chăm sóc da cơ bản để tạo nên vẻ ngoài tươi tắn, nhẹ nhàng nhưng vẫn cuốn hút.",
    fees: 450000,
    address: {
      line1: "37th Cross, Richmond",
      line2: "Circle, Ring Road, London",
    },
  },
  {
    _id: "stylist4",
    name: "Phạm Bảo Trân",
    image: "/sty4.jpg",
    speciality: "Trang điểm",
    degree: "Certified Professional Makeup Artist",
    experience: "1 Year",
    about:
      "Phạm Bảo Trân là chuyên viên trang điểm trẻ với phong cách hiện đại, tinh tế. Cô yêu thích việc thử nghiệm các xu hướng makeup mới nhưng vẫn đảm bảo phù hợp với gương mặt và hoàn cảnh của khách hàng, giúp họ cảm thấy thoải mái và tự tin trong mọi khoảnh khắc.",
    fees: 480000,
    address: {
      line1: "37th Cross, Richmond",
      line2: "Circle, Ring Road, London",
    },
  },

  // ===== CẮT TÓC =====
  {
    _id: "stylist5",
    name: "Võ Minh Khang",
    image: "/sty5.png",
    speciality: "Cắt tóc",
    degree: "Professional Hair Cutting & Styling Certificate",
    experience: "1 Year",
    about:
      "Võ Minh Khang là thợ cắt tóc chuyên nghiệp, chú trọng vào việc tạo kiểu phù hợp với khuôn mặt và phong cách sống của khách hàng. Anh luôn tư vấn kỹ trước khi cắt, đảm bảo mỗi kiểu tóc không chỉ đẹp mà còn dễ chăm sóc và phù hợp trong sinh hoạt hằng ngày.",
    fees: 350000,
    address: {
      line1: "37th Cross, Richmond",
      line2: "Circle, Ring Road, London",
    },
  },
  {
    _id: "stylist6",
    name: "Nguyễn Linh Đan",
    image: "/sty6.png",
    speciality: "Cắt tóc",
    degree: "Professional Hair Cutting & Styling Certificate",
    experience: "1 Year",
    about:
      "Nguyễn Linh Đan có kinh nghiệm trong việc cắt và tạo kiểu tóc nữ theo xu hướng hiện đại. Anh luôn cập nhật các phong cách mới, đồng thời lắng nghe nhu cầu của khách hàng để mang đến kiểu tóc gọn gàng, hài hòa và giúp tôn lên nét đẹp tự nhiên.",
    fees: 300000,
    address: {
      line1: "37th Cross, Richmond",
      line2: "Circle, Ring Road, London",
    },
  },
  {
    _id: "stylist7",
    name: "Hồ Bảo Ngọc",
    image: "/sty7.png",
    speciality: "Cắt tóc",
    degree: "Professional Hair Cutting & Styling Certificate",
    experience: "1 Year",
    about:
      "Hồ Bảo Ngọc chuyên cắt tóc và tạo kiểu với phong cách trẻ trung, năng động. Anh chú trọng đến độ phồng, form tóc và sự phù hợp với gương mặt, giúp khách hàng luôn cảm thấy mới mẻ, tự tin và dễ dàng tạo kiểu mỗi ngày.",
    fees: 280000,
    address: {
      line1: "37th Cross, Richmond",
      line2: "Circle, Ring Road, London",
    },
  },

  // ===== GỘI ĐẦU THƯ GIÃN =====
  {
    _id: "stylist8",
    name: "Nguyễn Hữu Trung",
    image: "/sty8.png",
    speciality: "Gội đầu thư giãn",
    degree: "Relaxing Hair Wash & Scalp Care Certificate",
    experience: "1 Year",
    about:
      "Nguyễn Hữu Trung chuyên về gội đầu thư giãn và chăm sóc da đầu. Cô kết hợp kỹ thuật massage nhẹ nhàng với các sản phẩm phù hợp nhằm giúp khách hàng giảm căng thẳng, thư giãn tinh thần và cải thiện sức khỏe da đầu sau những giờ làm việc mệt mỏi.",
    fees: 280000,
    address: {
      line1: "37th Cross, Richmond",
      line2: "Circle, Ring Road, London",
    },
  },
  {
    _id: "stylist9",
    name: "Đặng Anh Hiếu",
    image: "/sty9.png",
    speciality: "Gội đầu thư giãn",
    degree: "Relaxing Hair Wash & Scalp Care Certificate",
    experience: "1 Year",
    about:
      "Đặng Anh Hiếu mang đến dịch vụ gội đầu thư giãn với phong cách nhẹ nhàng và tỉ mỉ. Cô tập trung vào massage da đầu đúng kỹ thuật, giúp kích thích tuần hoàn máu, mang lại cảm giác dễ chịu, thư thái và hỗ trợ chăm sóc tóc hiệu quả.",
    fees: 250000,
    address: {
      line1: "37th Cross, Richmond",
      line2: "Circle, Ring Road, London",
    },
  },
  {
    _id: "stylist10",
    name: "Lý Thanh Trúc",
    image: "/sty10.png",
    speciality: "Gội đầu thư giãn",
    degree: "Relaxing Hair Wash & Scalp Care Certificate",
    experience: "1 Year",
    about:
      "Lý Thanh Trúc chuyên thực hiện các liệu trình gội đầu thư giãn kết hợp chăm sóc da đầu. Cô luôn chú trọng đến cảm giác thoải mái của khách hàng, giúp họ giải tỏa áp lực, thư giãn tinh thần và tận hưởng những phút giây nghỉ ngơi nhẹ nhàng.",
    fees: 220000,
    address: {
      line1: "37th Cross, Richmond",
      line2: "Circle, Ring Road, London",
    },
  },

  // ===== CHĂM SÓC CƠ THỂ =====
  {
    _id: "stylist11",
    name: "Phan Hoài An",
    image: "/sty11.png",
    speciality: "Chăm sóc cơ thể",
    degree: "Professional Body Care & Massage Certificate",
    experience: "1 Year",
    about:
      "Phan Hoài An chuyên về chăm sóc cơ thể và massage thư giãn. Cô áp dụng các kỹ thuật cơ bản nhằm giúp khách hàng giảm căng cơ, cải thiện tuần hoàn máu và mang lại cảm giác dễ chịu, thoải mái sau những ngày làm việc căng thẳng.",
    fees: 500000,
    address: {
      line1: "37th Cross, Richmond",
      line2: "Circle, Ring Road, London",
    },
  },
  {
    _id: "stylist12",
    name: "Nguyễn Kim Ngân",
    image: "/sty12.png",
    speciality: "Chăm sóc cơ thể",
    degree: "Professional Body Care & Massage Certificate",
    experience: "1 Year",
    about:
      "Nguyễn Kim Ngân cung cấp các dịch vụ chăm sóc cơ thể với phong cách nhẹ nhàng và tận tâm. Cô luôn lắng nghe tình trạng của khách hàng để điều chỉnh liệu trình phù hợp, giúp cơ thể thư giãn, phục hồi năng lượng và cảm thấy khỏe khoắn hơn.",
    fees: 450000,
    address: {
      line1: "37th Cross, Richmond",
      line2: "Circle, Ring Road, London",
    },
  },
  {
    _id: "stylist13",
    name: "Đỗ Mỹ Linh",
    image: "/sty13.png",
    speciality: "Chăm sóc cơ thể",
    degree: "Professional Body Care & Massage Certificate",
    experience: "1 Year",
    about:
      "Đỗ Mỹ Linh tập trung vào các liệu trình chăm sóc cơ thể giúp thư giãn và cải thiện sức khỏe tổng thể. Cô chú trọng đến sự thoải mái của khách hàng, mang đến trải nghiệm nhẹ nhàng, dễ chịu và phù hợp với nhu cầu cá nhân.",
    fees: 380000,
    address: {
      line1: "37th Cross, Richmond",
      line2: "Circle, Ring Road, London",
    },
  },

  // ===== CHĂM SÓC DA =====
  {
    _id: "stylist14",
    name: "Nguyễn Tuấn Kiệt",
    image: "/sty14.jpg",
    speciality: "Chăm sóc da",
    degree: "Advanced Skincare & Facial Treatment Certification",
    experience: "1 Year",
    about:
      "Nguyễn Tuấn Kiệt là chuyên viên chăm sóc da với định hướng cải thiện làn da khỏe mạnh từ bên trong. Cô tư vấn kỹ về tình trạng da, kết hợp các liệu trình cơ bản giúp làm sạch, cân bằng và mang lại làn da tươi sáng, mịn màng.",
    fees: 600000,
    address: {
      line1: "37th Cross, Richmond",
      line2: "Circle, Ring Road, London",
    },
  },
  {
    _id: "stylist15",
    name: "Hoàng Yến Nhi",
    image: "/sty15.jpg",
    speciality: "Chăm sóc da",
    degree: "Advanced Skincare & Facial Treatment Certification",
    experience: "1 Year",
    about:
      "Hoàng Yến Nhi chuyên chăm sóc da mặt với các phương pháp nhẹ nhàng, an toàn. Cô luôn chú trọng việc tư vấn quy trình phù hợp cho từng loại da, giúp khách hàng duy trì làn da khỏe mạnh và cải thiện vẻ ngoài một cách tự nhiên.",
    fees: 520000,
    address: {
      line1: "37th Cross, Richmond",
      line2: "Circle, Ring Road, London",
    },
  },
  {
    _id: "stylist16",
    name: "Trần Khánh Ly",
    image: "/sty16.jpg",
    speciality: "Chăm sóc da",
    degree: "Advanced Skincare & Facial Treatment Certification",
    experience: "1 Year",
    about:
      "Trần Khánh Ly tập trung vào các liệu trình chăm sóc da cơ bản và phục hồi. Cô giúp khách hàng hiểu rõ làn da của mình, xây dựng thói quen chăm sóc phù hợp và mang lại cảm giác thư giãn trong suốt quá trình điều trị.",
    fees: 450000,
    address: {
      line1: "37th Cross, Richmond",
      line2: "Circle, Ring Road, London",
    },
  },

  // ===== UỐN & DUỖI TÓC =====
  {
    _id: "stylist17",
    name: "Nguyễn Tuấn Anh",
    image: "/sty17.jpg",
    speciality: "Uốn và Duỗi tóc",
    degree: "Professional Hair Perm & Straightening Certificate",
    experience: "1 Year",
    about:
      "Nguyễn Tuấn Anh chuyên uốn và duỗi tóc với kỹ thuật cơ bản, chú trọng bảo vệ chất tóc. Anh luôn tư vấn kiểu tóc phù hợp với khuôn mặt và tình trạng tóc, giúp khách hàng có mái tóc vào nếp tự nhiên và dễ chăm sóc.",
    fees: 1200000,
    address: {
      line1: "37th Cross, Richmond",
      line2: "Circle, Ring Road, London",
    },
  },
  {
    _id: "stylist18",
    name: "Phạm Thùy Chi",
    image: "/sty18.jpg",
    speciality: "Uốn và Duỗi tóc",
    degree: "Professional Hair Perm & Straightening Certificate",
    experience: "1 Year",
    about:
      "Phạm Thùy Chi tập trung vào các dịch vụ uốn và duỗi tóc nhẹ nhàng, hạn chế hư tổn. Anh luôn chú ý đến độ bền của kiểu tóc cũng như sự thoải mái của khách hàng trong quá trình thực hiện dịch vụ.",
    fees: 1000000,
    address: {
      line1: "37th Cross, Richmond",
      line2: "Circle, Ring Road, London",
    },
  },
  {
    _id: "stylist19",
    name: "Lê Bảo Anh",
    image: "/sty19.jpg",
    speciality: "Uốn và Duỗi tóc",
    degree: "Professional Hair Perm & Straightening Certificate",
    experience: "1 Year",
    about:
      "Lê Bảo Anh chuyên tạo kiểu uốn và duỗi tóc theo phong cách hiện đại. Anh luôn cập nhật xu hướng mới, đồng thời điều chỉnh kỹ thuật phù hợp với từng loại tóc để mang lại kết quả tự nhiên và hài hòa.",
    fees: 900000,
    address: {
      line1: "37th Cross, Richmond",
      line2: "Circle, Ring Road, London",
    },
  },
  {
    _id: "stylist20",
    name: "Ngô Gia Hân",
    image: "/sty20.jpg",
    speciality: "Uốn và Duỗi tóc",
    degree: "Professional Hair Perm & Straightening Certificate",
    experience: "1 Year",
    about:
      "Ngô Gia Hân cung cấp dịch vụ uốn và duỗi tóc với phong cách nhẹ nhàng, tinh tế. Anh chú trọng tư vấn trước khi làm tóc, giúp khách hàng lựa chọn kiểu phù hợp và duy trì mái tóc khỏe mạnh sau khi tạo kiểu.",
    fees: 850000,
    address: {
      line1: "37th Cross, Richmond",
      line2: "Circle, Ring Road, London",
    },
  },
];
