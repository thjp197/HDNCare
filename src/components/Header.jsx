import { assets } from "../assets/assets"

const Header = ()  => {
    return (
        <div className='flex flex-col flex-wrap px-6 rounded-lg md:flex-row bg-primary md:px-10 lg:px-20'>
            {/* left side */}
            <div className='md:w-1/2 flex flex-col items-start justify-center gap-4 py-10 m-auto md:py-[10vw] md:mb-[-30px]'>
                <p className='text-4xl font-semibold leading-tight text-white md:text-4xl lg:text-5xl md:leading-tight lg:leading-tight'>
                    Đặt lịch hẹn <br />Với nhà tạo mẫu hàng đầu
                </p>
                <div className='flex flex-col items-center gap-3 text-sm font-light text-white md:flex-row'>
                    <img src={assets.group_profiles} alt="" />
                    <p>100+ Stylists <br className='hidden md:block' /></p>
                </div>
                <a href="#speciality" className='flex items-center gap-2 px-8 py-3 m-auto text-sm font-medium text-gray-600 transition-all duration-300 bg-white rounded-full md:m-0 hover:scale-105'>
                    Đặt lịch hẹn <img className='w-3' src={assets.arrow_icon} alt=""/>
                </a>
            </div>
            {/* right side */}
            <div className='relative md:w-1/2'>
                <img className='bottom-0 w-full h-auto rounded-lg md:absolute' src={assets.header_img} alt="" />
            </div>
        </div>
    )
}
export default Header   