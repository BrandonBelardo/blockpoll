import React, { createContext, useContext, useState } from 'react';

const Context = createContext();

export const StateContext = ({ children }) => {

    const [walletAddress, setWalletAddress] = useState(undefined)
    const [blacklistedPolls, setBlacklistedPolls] = useState([]);


    return (
        <Context.Provider
            value={{
                walletAddress,
                setWalletAddress,
                blacklistedPolls,
                setBlacklistedPolls
            }}
        >
            {children}
        </Context.Provider>
    )
}

export const useStateContext = () => useContext(Context);