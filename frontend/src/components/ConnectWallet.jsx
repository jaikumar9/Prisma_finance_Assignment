import React, { useState } from "react";
import { ethers } from "ethers";

const targetNetwork = {
  chainId: '0x1', 
  chainName: 'Ethereum Mainnet',
  nativeCurrency: {
    name: 'ETH',
    symbol: 'ETH',
    decimals: 18
  },
  rpcUrls: [],
  blockExplorerUrls: ['https://etherscan.io']
};

const ConnectWallet = ({ setAccount, account }) => {
  const [error, setError] = useState(null);

  const connectWallet = async () => {
    try {
      if (window.ethereum) {
        const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });

        if (currentChainId !== targetNetwork.chainId) {
          try {
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: targetNetwork.chainId }],
            });
          } catch (switchError) {
            if (switchError.code === 4902) {
              try {
                await window.ethereum.request({
                  method: 'wallet_addEthereumChain',
                  params: [targetNetwork],
                });
              } catch (addError) {
                setError(`Failed to add the network: ${addError.message}`);
                return;
              }
            } else {
              setError(`Failed to switch the network: ${switchError.message}`);
              return;
            }
          }
        }

        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });

        const account = ethers.utils.getAddress(accounts[0]);
        setAccount(account);
        console.log(account);

        window.ethereum.on("accountsChanged", async () => {
          const newAccounts = await window.ethereum.request({
            method: "eth_requestAccounts",
          });
          const newAccount = ethers.utils.getAddress(newAccounts[0]);
          setAccount(newAccount);
          console.log(newAccount);
        });
      } else {
        setError("Please install MetaMask!");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center">
      
      <button
        onClick={connectWallet}
        className="px-6 py-2 bg-blue-500 text-white rounded-md"
      >
        Connect Wallet
      </button>
      {error && <p className="mt-2 text-red-500">{error}</p>}
    </div>
  );
};

export default ConnectWallet;
