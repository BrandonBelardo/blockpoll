// This component is the wallet connect button that allows users to connect their wallet to the app
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useStateContext } from '@/context/StateContext';


export default function WalletConnect() {
    const [account, setAccount] = useState(null);
    const { setWalletAddress } = useStateContext();

    const connectWallet = async () => {
        if (!window.ethereum) {
            alert("Please install MetaMask!");
            return;
        }

        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const accounts = await provider.send("eth_requestAccounts", []);
            setAccount(accounts[0]);
            setWalletAddress(accounts[0])
        } catch (err) {
            console.error("User rejected connection or error:", err);
        }
    };

    useEffect(() => {
        if (window.ethereum) {
            window.ethereum.on("accountsChanged", (accounts) => {
                setAccount(accounts[0] || null);
            });
        }
    }, []);

    return (
        <div>
            {account ? (
                <p>Connected as: {account.slice(0, 10)}...{account.slice(-4)}</p>
            ) : (
                <button onClick={connectWallet}>Connect MetaMask</button>
            )}
        </div>
    );
}