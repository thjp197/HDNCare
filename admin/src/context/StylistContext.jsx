import { createContext, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const StylistContext = createContext();

const StylistContextProvider = (props) => {

    const backendUrl = import.meta.env.VITE_BACKEND_URL

    const [sToken, setSToken] = useState(localStorage.getItem('sToken') ? localStorage.getItem('sToken') : '')
    const [appointments, setAppointments] = useState([])
    const [dashData, setDashData] = useState(false)
    const [profileData, setProfileData] = useState(false)

    // Getting Stylist appointment data from Database using API
    const getAppointments = async () => {
        try {

            const { data } = await axios.get(backendUrl + '/api/stylist/appointments', { headers: { stoken: sToken } })

            if (data.success) {
                setAppointments(data.appointments)
                console.log(data.appointments)
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    const completeAppointment = async (appointmentId) => {
        try {
            
            const {data} = await axios.post(backendUrl + '/api/stylist/complete-appointment', {appointmentId}, {headers: { stoken: sToken }})
            if (import.meta.env.DEV) {
                console.log('complete-appointment response:', data)
            }
            if (data.success) {
                toast.success(data.message)
                getAppointments()
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }

    }

    const cancelAppointment = async (appointmentId) => {
        try {
            
            const {data} = await axios.post(backendUrl + '/api/stylist/cancel-appointment', {appointmentId}, {headers: { stoken: sToken }})
            if (import.meta.env.DEV) {
                console.log('cancel-appointment response:', data)
            }
            if (data.success) {
                toast.success(data.message)
                getAppointments()
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }

    }

    const getDashData = async () => {
        try {
            
            const { data } = await axios.get(backendUrl + '/api/stylist/dashboard', { headers: { stoken: sToken } })
            if (data.success) {
                setDashData(data.dashData)
                console.log(data.dashData);
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    const getProfileData = async () => {
        try {
            
            const {data} = await axios.get(backendUrl + '/api/stylist/profile', { headers: { stoken: sToken } })
            if (data.success) {
                setProfileData(data.profileData)
                console.log(data.profileData)
            }

        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    const value = {
        sToken, setSToken, backendUrl, 
        appointments, getAppointments, 
        setAppointments, completeAppointment,
        cancelAppointment, 
        dashData, setDashData, getDashData,
        profileData, setProfileData, getProfileData
    }

    return (
        <StylistContext.Provider value={value}>
            {props.children}
        </StylistContext.Provider>
    )
}

export default StylistContextProvider
