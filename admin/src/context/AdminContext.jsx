import { createContext, useState } from "react";
import axios from "axios";
import {toast} from 'react-toastify'
export const AdminContext = createContext()

const AdminContextProvider = (props) => {

    const [aToken, setAToken] = useState(localStorage.getItem('aToken')?localStorage.getItem('aToken'):'')
    const [stylists, setStylists] = useState([])
    const [appointments, setAppointments] = useState([])
    const [penalizedUsers, setPenalizedUsers] = useState([])
    const [discountCodes, setDiscountCodes] = useState([])
    const [dashData, setDashData] = useState(false)


    const backendUrl =
        import.meta.env.VITE_API_URL ||
        import.meta.env.VITE_BACKEND_URL ||
        'http://localhost:4000'

     // Getting all stylist data from Database using API
    const getAllStylists = async () => {

        try {

            const { data } = await axios.post(backendUrl + '/api/admin/all-stylists', {}, { headers: { aToken } })
            if (data.success) {
                setStylists(data.stylists)
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
    const cancelAppointment = async (appointmentId, options = {}) => {

        const { penalizeUser = false } = options

        try {

            const { data } = await axios.post(
                backendUrl + '/api/admin/cancel-appointment',
                { appointmentId, penalizeUser },
                { headers: { aToken } }
            )

            if (data.success) {
                toast.success(data.message)
                setAppointments((prev) =>
                    prev.map((item) =>
                        item._id === appointmentId
                            ? {
                                ...item,
                                cancelled: true,
                                cancellationReasons: item.cancellationReasons?.length
                                    ? item.cancellationReasons
                                    : ['Hủy bởi quản trị viên/chuyên viên'],
                                cancellationDetails: item.cancellationDetails || 'Đơn đã bị hủy và được giữ lại để theo dõi.',
                              }
                            : item
                    )
                )
                if (penalizeUser) {
                    getPenalizedUsers()
                }
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            toast.error(error.message)
            console.log(error)
        }

    }

    const getPenalizedUsers = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/admin/penalized-users', { headers: { aToken } })

            if (data.success) {
                setPenalizedUsers(data.users || [])
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    const resetUserPenalty = async (userId) => {
        try {
            const { data } = await axios.post(
                backendUrl + '/api/admin/reset-user-penalty',
                { userId },
                { headers: { aToken } }
            )

            if (data.success) {
                toast.success(data.message)
                setPenalizedUsers((prev) => prev.filter((item) => item._id !== userId))
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    const updateUserPenalty = async (userId, penaltyCount) => {
        try {
            const { data } = await axios.post(
                backendUrl + '/api/admin/update-user-penalty',
                { userId, penaltyCount },
                { headers: { aToken } }
            )

            if (data.success) {
                toast.success(data.message)
                const normalizedPenaltyCount = Number(data.penaltyCount)

                if (normalizedPenaltyCount <= 0) {
                    setPenalizedUsers((prev) => prev.filter((item) => item._id !== userId))
                    return { success: true }
                }

                setPenalizedUsers((prev) =>
                    prev
                        .map((item) =>
                            item._id === userId
                                ? {
                                      ...item,
                                      penaltyCount: normalizedPenaltyCount,
                                      isBanned: Boolean(data.isBanned),
                                      lastPenaltyAt: new Date().toISOString(),
                                  }
                                : item
                        )
                        .sort((a, b) => Number(b.penaltyCount || 0) - Number(a.penaltyCount || 0))
                )

                return { success: true }
            }

            toast.error(data.message)
            return { success: false }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
            return { success: false }
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

    const addDiscountCode = async (discountData) => {
        try {
            const { data } = await axios.post(backendUrl + '/api/admin/add-discount-code', discountData, { headers: { aToken } })

            if (data.success) {
                toast.success(data.message)
                getAllDiscountCodes()
                return { success: true }
            } else {
                toast.error(data.message)
                return { success: false }
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
            return { success: false }
        }
    }

    const getAllDiscountCodes = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/admin/discount-codes', { headers: { aToken } })

            if (data.success) {
                setDiscountCodes(data.discountCodes)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    const updateDiscountCode = async (discountData) => {
        try {
            const { data } = await axios.post(backendUrl + '/api/admin/update-discount-code', discountData, { headers: { aToken } })

            if (data.success) {
                toast.success(data.message)
                getAllDiscountCodes()
                return { success: true }
            } else {
                toast.error(data.message)
                return { success: false }
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
            return { success: false }
        }
    }

    const deleteDiscountCode = async (discountCodeId) => {
        try {
            const { data } = await axios.post(backendUrl + '/api/admin/delete-discount-code', { discountCodeId }, { headers: { aToken } })

            if (data.success) {
                toast.success(data.message)
                getAllDiscountCodes()
                return { success: true }
            } else {
                toast.error(data.message)
                return { success: false }
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
            return { success: false }
        }
    }

    const value = {
        aToken, setAToken,
        backendUrl,
        getAllStylists,
        stylists,
        changeAvailability,
        appointments, getAllAppointments, setAppointments, cancelAppointment,
        penalizedUsers, getPenalizedUsers, resetUserPenalty, updateUserPenalty,
        dashData, getDashData,
        discountCodes, addDiscountCode, getAllDiscountCodes, updateDiscountCode, deleteDiscountCode
    }

    return (
        <AdminContext.Provider value={value}>
            {props.children}
        </AdminContext.Provider>
    )
}

export default AdminContextProvider
