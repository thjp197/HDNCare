import React from 'react'
import { Link } from 'react-router-dom'
import { specialityData } from '../assets/assets'

const SpecialityMenu = () => {
    return (
        <div id='speciality' className='flex flex-col items-center gap-4 px-4 py-16 text-gray-800 sm:px-0'>
            <h1 className='text-3xl font-medium'>Tìm Theo Chuyên Môn</h1>
            <div className='grid w-full grid-cols-2 gap-5 pt-5 sm:flex sm:flex-wrap sm:justify-center sm:gap-10 lg:gap-16 xl:gap-24'>
                {specialityData.map((item, index) => (
                    <Link to={`/stylists/${item.speciality}`} onClick={() => window.scrollTo(0, 0)} className='flex flex-col items-center justify-start text-xs text-center cursor-pointer hover:translate-y-[-10px] transition-all duration-500' key={index}>
                        <img className='w-16 mb-2 sm:w-24' src={item.image} alt="" />
                        <p className='max-w-28 leading-4 sm:max-w-32'>{item.speciality}</p>
                    </Link>
                        ))}
            </div>
        </div>
    )
}

export default SpecialityMenu
