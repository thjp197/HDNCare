import { createContext, useState } from "react";
import axios from "axios";
import {toast} from 'react-toastify'
export const AdminContext = createContext()

const AdminContextProvider = (props) => {

    const [aToken, setAToken] = useState(localStorage.getItem('aToken')?localStorage.getItem('aToken'):'')
    const [stylists, setStylists] = useState([])

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

    const value = {
        aToken, setAToken,
        backendUrl,
        getAllStylists,
        stylists,
        changeAvailability
    }

    return (
        <AdminContext.Provider value={value}>
            {props.children}
        </AdminContext.Provider>
    )
}

export default AdminContextProvider
