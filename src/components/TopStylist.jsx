import React from 'react';
import { assets } from '../assets/assets';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AppContext } from '../context/AppContext';

const TopStylist = () => {
    const navigate = useNavigate()
    const { stylists } = useContext(AppContext)
    return (
        <div className='flex flex-col items-center gap-4 my-16 text-gray-900 md:mx-10'>
            <h1 className='text-3xl font-medium'>Top Stylists to Book</h1>
            <p className='text-sm text-center sm:w-1/3'>Simply browse through our extensive list of trusted stylists.</p>
            <div className='grid w-full grid-cols-1 gap-4 px-3 pt-5 md:grid-cols-2 lg:grid-cols-3 gap-y-6 sm:px-0'>
                {stylists.slice(0, 10).map((item, index) => (
                    <div
                        onClick={() => {
                            navigate(`/appointment/${item._id}`);
                            window.scrollTo(0, 0)
                        }}
                        className='border border-blue-200 rounded-xl overflow-hidden cursor-pointer hover:translate-y-[-10px] transition-all duration-500'
                        key={index}>
                            
                        <img className='object-cover object-top w-full h-73 bg-blue-50' src={item.image} alt="" />
                        <div className='p-4'>
                            <div className='flex items-center gap-2 text-sm text-center text-green-500'>
                                <p className='w-2 h-2 bg-green-500 rounded-full'></p><p>Available</p>
                            </div>
                            <p className='text-lg font-medium text-black-900'>{item.name}</p>
                            <p className='text-sm text-black-200'>{item.speciality}</p>
                        </div>
                    </div>
                ))}
            </div>
            <button onClick={() => { navigate('/stylists'); window.scrollTo(0, 0) }} className='px-12 py-3 mt-10 text-white rounded-full bg-[#5D1735]'>More...</button>
        </div>
    )
}
export default TopStylist;