import React, { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { assets } from '../assets/assets'
import RelatedStylist from '../components/RelatedStylists'

const Appointment = () => {

  const {styId} = useParams()
  const {stylists, currencySymbol} = useContext(AppContext)
  const dayOfWeek = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy' ]


  const [styInfo, setStyInfo] = useState(null)
  const [stySlots, setStySlots] = useState([])
  const [slotIndex,setSlotIndex] = useState(0)
  const [slotTime, setSlotTime] = useState('')

  const bookAppointment = async () => {
    // TODO: Implement appointment booking logic
    console.log('Booking appointment:', { styId, slotTime, slotIndex })
  }

  const fetchStyInfo = () => {
    const styInfo = stylists.find(sty => sty._id === styId)
    setStyInfo(styInfo)
  }

  const getAvailabelSlots = async () => {
    setStySlots([])

    // Lấy ngày hiện tại
    let today = new Date()

    for (let i = 0; i < 7; i++) {
      // getting date
      let currentDate = new Date(today)
      currentDate.setDate(today.getDate() + i)

      // setting end time date
      let endTime = new Date()
      endTime.setDate(today.getDate() + i)
      endTime.setHours(21, 0, 0, 0) // 21 PM

      // setting hours
      if (today.getDate() === currentDate.getDate()) {
        currentDate.setHours(currentDate.getHours() > 10 ? currentDate.getHours() + 1 : 10) // from 10 AM
        currentDate.setMinutes(currentDate.getMinutes() > 30 ? 30 : 0)
      }
      else {
        currentDate.setHours(10) // from 10 AM
        currentDate.setMinutes(0)
      }

      let timeSlots = []

      while (currentDate < endTime) {
        let formattedTime = currentDate.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})
      
        // add slot to array
        timeSlots.push({
          datetime: new Date(currentDate),
          time: formattedTime
        })

        // Increment by 30 minutes
        currentDate.setMinutes(currentDate.getMinutes() + 30);
      }

      setStySlots(prev => ([...prev, timeSlots]))
    }
  }

  const formatVndSpace = (price) => {
    return price.toLocaleString('vi-VN').replace(/\./g, '.');
  }

  useEffect(() => {
    fetchStyInfo()
  }, [stylists, styId])

  useEffect(() => {
    getAvailabelSlots()
  }, [styInfo])

  useEffect(() => {
    console.log(stySlots)
  }, [stySlots])

  return styInfo &&  (
    <div>
        {/* Stylist Details */}
        <div className='flex flex-col sm:flex-row gap-4'>
          <div>
            <img className='bg-primary w-full sm:max-w-72 rounded-lg' src={styInfo.image} alt= "" />
          </div>
    
              <div className='flex-1 border border-gray-400 rounded-lg p-8 py-7 bg-white mx-2 sm:mx-0 mt-[-80px] sm:mt-0'>
                {/* Sty Info : tên, bằng cấp, kinh nghiệm */}
                <p className='flex items-center gap-2 text-2xl font-medium text-gray-900'>
                  {styInfo.name} 
                  <img className='w-5' src={assets.verified_icon} alt="" />
                </p>
              
               <div className='flex items-center gap-2 tex-sm mt-1 text-gray-600'>
                  <p>{styInfo.degree} - {styInfo.speciality}</p>
                  <button className='py-0.5 px-2 border text-xs rounded-full'>{styInfo.experience}</button>
               </div>

               {/* Về Stylist */}
               <div>
                  <p className='flex items-center gap-1 text-sm font-medium text-gray-900 mt-3'>
                    Về <img src={assets.info_icon} alt="" />
                  </p>
                  <p className='text-sm text-gray-500 max-w-[700px] mt-1'>{styInfo.about}</p>
               </div>
               <p className='text-gray-500 font-medium mt-4'>
                  Phí đặt lịch hẹn: <span className='text-gray-600'>{formatVndSpace(styInfo.fees)} {currencySymbol}</span>
               </p>
               </div>
        </div>

        {/* Booking Slots */}
        <div className='sm:ml-72 sm:pl-4 mt-8 font-medium text-[#565656]'>
                <p >Chọn thời gian</p>
                <div className='flex gap-3 items-center w-full overflow-x-scroll mt-4'>
                    {stySlots.length && stySlots.map((item, index) => (
                        <div onClick={() => setSlotIndex(index)} key={index} className={`text-center py-6 min-w-16 rounded-full cursor-pointer ${slotIndex === index ? 'bg-primary text-white' : 'border border-[#DDDDDD]'}`}>
                            <p>{item[0] && dayOfWeek[item[0].datetime.getDay()]}</p>
                            <p>{item[0] && item[0].datetime.getDate()}</p>
                        </div>
                    ))}
                </div>

                <div className='flex items-center gap-3 w-full overflow-x-scroll mt-4'>
                    {stySlots.length && stySlots[slotIndex].map((item, index) => (
                        <p onClick={() => setSlotTime(item.time)} key={index} className={`text-sm font-light  flex-shrink-0 px-5 py-2 rounded-full cursor-pointer ${item.time === slotTime ? 'bg-primary text-white' : 'text-[#949494] border border-[#B4B4B4]'}`}>{item.time.toLowerCase()}</p>
                    ))}
                </div>

                <button onClick={bookAppointment} className='bg-primary text-white text-sm font-light px-20 py-3 rounded-full my-6'>Đặt lịch</button>
            </div>
             {/* Listing related stylists */}
             <RelatedStylist speciality={styInfo.speciality} docId={styId} />

    </div>
  )
}



export default Appointment