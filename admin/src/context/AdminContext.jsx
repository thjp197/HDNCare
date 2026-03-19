import { createContext, useState } from "react";
import axios from "axios";
import {toast} from 'react-toastify'
export const AdminContext = createContext()

const AdminContextProvider = (props) => {

    const [aToken, setAToken] = useState(localStorage.getItem('aToken')?localStorage.getItem('aToken'):'')
    const [stylists, setStylists] = useState([])
    const [appointments, setAppointments] = useState([])
    const [dashData, setDashData] = useState(false)


    const backendUrl = import.meta.env.VITE_BACKEND_URL

     // Getting all stylist data from Database using API
    const getAllStylists = async () => {

        try {

            const { data } = await axios.post(backendUrl + '/api/admin/all-stylists', {}, { headers: { aToken } })
            if (data.success) {
                setStylists(data.stylists)
                console.log(data.stylists)
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            toast.error(error.message)
        }

    }

    // API to change stylist availablity
    const changeAvailability = async (stylistId) => {
        try {

            const { data } = await axios.post(backendUrl + '/api/admin/change-availability', { stylistId }, { headers: { aToken } })
            if (data.success) {
                toast.success(data.message)
                getAllStylists()
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    const getAllAppointments = async () => {

        try {

            const { data } = await axios.get(backendUrl + '/api/admin/appointments', { headers: { aToken } })
            if (data.success) {
                setAppointments(data.appointments.reverse())
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            toast.error(error.message)
            console.log(error)
        }

    }

     // Function to cancel appointment using API
    const cancelAppointment = async (appointmentId) => {

        try {

            const { data } = await axios.post(backendUrl + '/api/admin/cancel-appointment', { appointmentId }, { headers: { aToken } })

            if (data.success) {
                toast.success(data.message)
                getAllAppointments()
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            toast.error(error.message)
            console.log(error)
        }

    }

    const getDashData = async () => {
        try {

            const { data } = await axios.get(backendUrl + '/api/admin/dashboard', { headers: { aToken } })

            if (data.success) {
                setDashData(data.dashData)
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    const value = {
        aToken, setAToken,
        backendUrl,
        getAllStylists,
        stylists,
        changeAvailability,
        appointments, getAllAppointments, setAppointments, cancelAppointment, dashData, getDashData
    }

    return (
        <AdminContext.Provider value={value}>
            {props.children}
        </AdminContext.Provider>
    )
}

export default AdminContextProvider
