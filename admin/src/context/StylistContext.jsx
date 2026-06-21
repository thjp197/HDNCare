import { createContext, useCallback, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const StylistContext = createContext();

const getStoredStylistToken = () => {
    try {
        return localStorage.getItem('sToken') || ''
    } catch {
        return ''
    }
}

const clearStylistAuthStorage = () => {
    try {
        localStorage.removeItem('sToken')
    } catch (error) {
        console.warn('Unable to clear stylist auth storage', error)
    }
}

const StylistContextProvider = (props) => {

    const backendUrl =
        import.meta.env.VITE_API_URL ||
        import.meta.env.VITE_BACKEND_URL ||
        'http://localhost:4000'

    const [sToken, setSToken] = useState(() => getStoredStylistToken())
    const [appointments, setAppointments] = useState([])
    const [dashData, setDashData] = useState(false)
    const [profileData, setProfileData] = useState(false)
    const [isBranchManager, setIsBranchManager] = useState(false)
    const [branchInfo, setBranchInfo] = useState(null)

    const resetStylistSession = useCallback(() => {
        setSToken('')
        setAppointments([])
        setDashData(false)
        setProfileData(false)
        setIsBranchManager(false)
        setBranchInfo(null)
        clearStylistAuthStorage()
    }, [])

    // Getting Stylist appointment data from Database using API
    const getAppointments = async () => {
        try {

            const { data } = await axios.get(backendUrl + '/api/stylist/appointments', { headers: { stoken: sToken } })

            if (data.success) {
                setAppointments(data.appointments)
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

            }
            if (data.success) {
                toast.success(data.message)
                setAppointments((prev) =>
                    prev.map((item) =>
                        item._id === appointmentId
                            ? {
                                ...item,
                                isCompleted: true
                              }
                            : item
                    )
                )
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }

    }

    const cancelAppointment = async (appointmentId, options = {}) => {
        const { penalizeUser = false } = options

        try {
            
            const {data} = await axios.post(
                backendUrl + '/api/stylist/cancel-appointment',
                {appointmentId, penalizeUser},
                {headers: { stoken: sToken }}
            )
            if (import.meta.env.DEV) {

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
                // Check if user is branch manager
                setIsBranchManager(data.profileData.isBranchManager || false)
            }

        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    // Branch Manager APIs
    const getBranchManagerDashboard = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/stylist/branch-manager-dashboard', { headers: { stoken: sToken } })
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

    const getBranchManagerAppointments = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/stylist/branch-manager-appointments', { headers: { stoken: sToken } })
            if (data.success) {
                setAppointments(data.appointments)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    const getBranchManagerStylists = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/stylist/branch-manager-stylists', { headers: { stoken: sToken } })
            if (data.success) {
                return data.stylists
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
            return []
        }
    }

    const getBranchManagerInfo = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/stylist/branch-manager-info', { headers: { stoken: sToken } })
            if (data.success) {
                setBranchInfo(data.branchInfo)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    const updateStylistBranch = async (stylistId, branch) => {
        try {
            const { data } = await axios.post(
                backendUrl + '/api/admin/update-stylist-branch',
                { stylistId, branch },
                { headers: { stoken: sToken } }
            )
            if (data.success) {
                toast.success(data.message)
                return true
            } else {
                toast.error(data.message)
                return false
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
            return false
        }
    }

    useEffect(() => {
        const syncStylistSession = () => {
            if (!sToken) return

            const storedToken = getStoredStylistToken()
            if (!storedToken || storedToken !== sToken) {
                resetStylistSession()
            }
        }

        syncStylistSession()

        window.addEventListener('storage', syncStylistSession)
        window.addEventListener('focus', syncStylistSession)
        window.addEventListener('pageshow', syncStylistSession)
        document.addEventListener('visibilitychange', syncStylistSession)

        const intervalId = window.setInterval(syncStylistSession, 1000)

        return () => {
            window.removeEventListener('storage', syncStylistSession)
            window.removeEventListener('focus', syncStylistSession)
            window.removeEventListener('pageshow', syncStylistSession)
            document.removeEventListener('visibilitychange', syncStylistSession)
            window.clearInterval(intervalId)
        }
    }, [resetStylistSession, sToken])

    const value = {
        sToken, setSToken, resetStylistSession, backendUrl, 
        appointments, getAppointments, 
        setAppointments, completeAppointment,
        cancelAppointment, 
        dashData, setDashData, getDashData,
        profileData, setProfileData, getProfileData,
        isBranchManager, branchInfo,
        getBranchManagerDashboard, getBranchManagerAppointments, getBranchManagerStylists, getBranchManagerInfo,
        updateStylistBranch
    }

    return (
        <StylistContext.Provider value={value}>
            {props.children}
        </StylistContext.Provider>
    )
}

export default StylistContextProvider
