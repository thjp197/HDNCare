import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import { assets } from '../assets/assets'

const MyAppointments = () => {
  const { stylists } = useContext(AppContext)
  
  // Mock data - thay sau với dữ liệu thực
  const mockAppointments = [
    { stylistId: 'stylist1', date: '19/02/2026', time: '10:00 AM' },
    { stylistId: 'stylist2', date: '20/02/2026', time: '02:00 PM' },
    { stylistId: 'stylist3', date: '21/02/2026', time: '09:30 AM' },
  ]

  const handleCancel = (index) => {
    alert('Hủy lịch hẹn thành công!')
  }

  return (
    <div className='mx-4 sm:mx-[10%]'>
        <p className='mt-12 mb-8 font-bold text-2xl'>Lịch hẹn của tôi</p>
        <div>
          {mockAppointments.map((appointment, index) => {
            const stylist = stylists.find(s => s._id === appointment.stylistId)
            return (
              <div key={index} className='grid grid-cols-1 md:grid-cols-4 gap-4 border border-gray-200 rounded-lg p-4 mb-4 bg-white shadow-sm hover:shadow-md transition'>
                <div>
                  <img src={stylist?.image} alt={stylist?.name} className='w-32 h-32 object-cover rounded' />
                </div>
                <div className='md:col-span-2'>
                  <p className='font-bold text-lg'>{stylist?.name}</p>
                  <p className='text-gray-600 text-sm'>{stylist?.speciality}</p>
                  <p className='text-sm mt-2'><span className='font-semibold'>Địa chỉ:</span></p>
                  <p className='text-sm text-gray-700'>{stylist?.address.line1}</p>
                  <p className='text-sm text-gray-700'>{stylist?.address.line2}</p>
                  <p className='text-sm mt-2'><span className='font-semibold'>Thời gian:</span> {appointment.date} {appointment.time}</p>
                </div>
                <div className='flex flex-col gap-2 justify-center'>
                  <button className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition'>Thanh toán trực tuyến</button>
                  <button onClick={() => handleCancel(index)} className='px-4 py-2 border border-red-600 text-red-600 rounded hover:bg-red-50 transition'>Hủy lịch hẹn</button>
                </div>
              </div>
            )
          })}
        </div>
    </div>
  )
}

export default MyAppointments