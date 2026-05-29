import React from 'react'
import SpecialityMenu from '../components/SpecialityMenu'
import QuickBookingBar from '../components/QuickBookingBar'
import TopStylist from '../components/TopStylist'
import Banner from '../components/Banner'

const Home = () => {
  return (
    <div>
        <div className='-mx-4 sm:-mx-[10%]'>
          <Banner/>
        </div>
        <SpecialityMenu/>
        <QuickBookingBar/>
        <TopStylist/>
    </div>
  )
}

export default Home