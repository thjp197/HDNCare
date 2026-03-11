import { createContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const AppContext = createContext();

const AppContextProvider = (props) => {

    const currencySymbol = 'VND'
    const backendUrl = import.meta.env.VITE_BACKEND_URL
    const [stylists, setStylists] = useState([])

    //const value = {stylists, currencySymbol};

    const getStylistsData = async () => {

        try {

            const { data } = await axios.get(backendUrl + '/api/stylist/list')
            if (data.success) {
                setStylists(data.stylists)
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    useEffect(() => {
        getStylistsData()
    }, [])

    const value = { stylists, currencySymbol, getStylistsData };

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}

export default AppContextProvider