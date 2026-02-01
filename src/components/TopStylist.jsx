import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'

const TopStylist = () => {
  const navigate = useNavigate()
  const { stylists } = useContext(AppContext)

  return (
    <div className="flex flex-col items-center gap-4 my-16 text-gray-900 md:mx-10">
      <h1 className="text-3xl font-semibold">Top Stylists to Book</h1>
      <p className="text-sm text-center text-gray-500 sm:w-1/3">
        Simply browse through our extensive list of trusted stylists.
      </p>

      <div className="grid w-full grid-cols-1 gap-6 px-3 pt-8 sm:grid-cols-2 lg:grid-cols-3 sm:px-0">
        {stylists.slice(0, 9).map((item) => (
          <div
            key={item._id}
            onClick={() => {
              navigate(`/appointment/${item._id}`)
              window.scrollTo(0, 0)
            }}
            className="overflow-hidden transition-all duration-300 bg-white border border-gray-200 cursor-pointer group rounded-2xl hover:-translate-y-2 hover:shadow-xl"
          >
            {/* IMAGE */}
            <div className="relative w-full overflow-hidden h-100 bg-blue-50">
              <img
                src={item.image}
                alt={item.name}
                className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
              />
            </div>

            {/* CONTENT */}
            <div className="flex flex-col gap-2 p-4">
              <div className="flex items-center gap-2 text-sm text-green-600">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Available
              </div>

              <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                {item.name}
              </h3>

              <p className="text-sm text-gray-500 line-clamp-1">
                {item.speciality}
              </p>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => {
          navigate('/stylists')
          window.scrollTo(0, 0)
        }}
        className="px-12 py-3 mt-12 text-sm font-medium text-gray-600 transition rounded-full bg-blue-50 hover:bg-blue-100"
      >
        More
      </button>
    </div>
  )
}

export default TopStylist
