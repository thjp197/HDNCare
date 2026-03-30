import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import { useNavigate } from 'react-router-dom';
import 'swiper/css';
import 'swiper/css/pagination';

import './stylesbanner.css';

const slides = [
  '/bannerslide/banner1.png',
  '/bannerslide/banner3.png',
  '/bannerslide/banner2.png',
  '/bannerslide/banner4.png',
  '/bannerslide/banner5.png',
]

const Banner = () => {
  const navigate = useNavigate()
  return (
    <div style={{ width: '83%', margin: '0 auto' }}>
      <div style={{ position: 'relative', paddingTop: '42.857%', width: '100%' }}>
        <Swiper
          modules={[Pagination, Autoplay]}
          pagination={{ clickable: true }}
          autoplay={{ delay: 3500, disableOnInteraction: false }}
          loop={true}
          style={{ position: 'absolute', top: 5, left: 0, width: '100%', height: '100%' }}
        >
          {slides.map((src, i) => (
            <SwiperSlide key={i} onClick={() => navigate('/login')} style={{ cursor: 'pointer' }}>
              <img src={src} alt={`Banner ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  )
}

export default Banner
