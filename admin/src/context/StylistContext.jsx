import { createContext, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const StylistContext = createContext();

const StylistContextProvider = (props) => {

    const backendUrl = import.meta.env.VITE_BACKEND_URL

    const [sToken, setSToken] = useState(localStorage.getItem('sToken') ? localStorage.getItem('sToken') : '')
    const [appointments, setAppointments] = useState([])

    // Getting Stylist appointment data from Database using API
    const getAppointments = async () => {
        try {

            const { data } = await axios.get(backendUrl + '/api/stylist/appointments', { headers: { stoken: sToken } })

            if (data.success) {
                setAppointments(data.appointments.reverse())
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }


    const value = {
        sToken, setSToken, backendUrl, appointments, getAppointments, setAppointments
    }

    return (
        <StylistContext.Provider value={value}>
            {props.children}
        </StylistContext.Provider>
    )
}

export default StylistContextProvider
