import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

export default function WalletConnect({ onConnected }) {
  const [account, setAccount] = useState(null);

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask!");
      return;
    }

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      setAccount(accounts[0]);
      onConnected(accounts[0]); // Send back to parent if needed
    } catch (err) {
      console.error("User rejected connection or error:", err);
    }
  };

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        setAccount(accounts[0] || null);
        if (onConnected) onConnected(accounts[0] || null);
      });
    }
  }, []);

  return (
    <div>
      {account ? (
        <p>Connected as: {account.slice(0, 6)}...{account.slice(-4)}</p>
      ) : (
        <button onClick={connectWallet}>Connect MetaMask</button>
      )}
    </div>
  );
}