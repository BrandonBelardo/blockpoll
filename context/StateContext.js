import React, { createContext, useContext, useState } from 'react';

const Context = createContext();

export const StateContext = ({ children }) => {

    // Variables to Carry Across Multiple Pages
    const [walletAddress, setWalletAddress] = useState(undefined)


    return (
        <Context.Provider
            value={{
                walletAddress,
                setWalletAddress
            }}
        >
            {children}
        </Context.Provider>
    )
}

export const useStateContext = () => useContext(Context);