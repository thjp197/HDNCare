import { createContext } from "react";
import { stylists } from "../assets/assets";

export const AppContext = createContext();

const AppContextProvider = (props) => {
     const value = {stylists};
    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}

export default AppContextProvider