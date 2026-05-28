import { useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AdminContext } from '../../context/AdminContext'

const StylistsList = () => {
  const { stylists, aToken, getAllStylists, changeAvailability } = useContext(AdminContext)
  const navigate = useNavigate()

  useEffect(() => {
    if (aToken) getAllStylists()
  }, [aToken])

  return (
   <div className='max-h-[90vh] overflow-y-auto p-4 font-sans sm:p-5'>
      <h1 className='text-lg font-medium font-sans'>Tất cả chuyên viên</h1>
      <div className='grid w-full grid-cols-1 gap-4 gap-y-6 pt-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'>
        {stylists.map((item, index) => (
          <div
            onClick={() => navigate(`/edit-stylist/${item._id}`)}
            className='group w-full overflow-hidden rounded-xl border border-[#C9D8FF] cursor-pointer'
            key={index}
          >
            <img className='h-auto w-full bg-[#EAEFFF] transition-all duration-500 group-hover:bg-primary' src={item.image} alt="" />
            <div className='p-4'>
              <p className='text-[#262626] text-lg font-medium font-sans'>{item.name}</p>
              <p className='text-[#5C5C5C] text-sm font-sans'>{item.speciality}</p>
              <div className='mt-2 flex items-center gap-1 text-sm' onClick={e => e.stopPropagation()}>
                <input onChange={() => changeAvailability(item._id)} type="checkbox" checked={item.available} />
                <p className='font-sans'>Hoạt động</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default StylistsList
