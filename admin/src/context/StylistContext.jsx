import { createContext } from "react";

export const StylistContext = createContext()

const StylistContextProvider = (props) => {
    const value = {

    }

    return (
        <StylistContext.Provider value={value}>
            {props.children}
        </StylistContext.Provider>
    )
}

export default StylistContextProvider
