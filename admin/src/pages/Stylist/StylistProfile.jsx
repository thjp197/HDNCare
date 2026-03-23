import React, { useContext, useEffect } from 'react'
import { StylistContext } from '../../context/StylistContext'
import { AppContext } from '../../context/AppContext'

const StylistProfile = () => {

  const {sToken, profileData, setProfileData, getProfileData} = useContext(StylistContext)
  const {currency, backendUrl} = useContext(AppContext)

  useEffect(() => {
    
    if (sToken) {
      getProfileData()
    }
  }, [sToken])

  return profileData && (
    <div>

      <div className='flex flex-col gap-4 m-5 '>

        <div>
          <img src={profileData.image} alt="Profile" />
        </div>

        <div className='font-sans'>

          {/* Stylist info: name, degree, experience */}
          <p>{profileData.name}</p>
          <div>
            <p>{profileData.degree} - {profileData.speciality}</p>
            <button>{profileData.experience}</button>
          </div>

          {/* Stylist About */}
          <div>
            <p>Về nhà tạo mẫu: </p>
            <p>
              {profileData.about}
            </p>
          </div>

          <p>
            Giá tiền: <span> {profileData.fees} {currency}</span>
          </p>
          
          <div>
            <p>Địa chỉ: </p>
            <p>
              {profileData.address.line1}
              <br />
              {profileData.address.line2}
            </p>
          </div>

          <div>
            <input type="checkbox" />
            <label htmlFor="">Hoạt động</label>
          </div>

          <button>Chỉnh sửa</button>

        </div>
      </div>
      
    </div>
  )
}

export default StylistProfile
