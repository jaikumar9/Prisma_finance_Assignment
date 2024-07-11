import React, { useState } from "react";
import { ethers } from "ethers";
import abi from "./abis/BorrowerOperations.json";
import ETHxAbi from "./abis/ETHx.json";
import axios from 'axios';

const contractAddress = "0x72c590349535AD52e6953744cb2A36B409542719";
const troveManager = "0xA39739EF8b0231DbFA0DcdA07d7e29faAbCf4bb2";
const ETHx = "0x4C22fFd479637EA0eD61D451CBe6355627283358";
const contractABI = abi;
const maxFeePercentage = 50;
const upperHint = "0x0000000000000000000000000000000000000000";
const lowerHint = "0x07787578a668a3f10805ee51C3E8abbab82E7bBe";

const StakeETHForm = ({ walletAddress }) => {
  const [stakeAmount, setStakeAmount] = useState("");
  const [receivedStablecoins, setReceivedStablecoins] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [finalDebtAmount, setFinalDebtAmount] = useState(null);

  const fetchEthPrice = async () => {
    const apiKey = 'PJRRZZ8HWBWD91EBYBNR3GBRA1JEQXU8Y4';
    const url = `https://api.etherscan.io/api?module=stats&action=ethprice&apikey=${apiKey}`;

    try {
      const response = await axios.get(url);
      if (response.data.status === '1') {
        return response.data.result.ethusd;
      } else {
        throw new Error('Failed to fetch Ethereum price');
      }
    } catch (error) {
      setError(error.message);
      return null;
    }
  };

  const handleStakeETH = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);
      const ETHxContract = new ethers.Contract(ETHx, ETHxAbi, signer);

      // console.log("Contract instance:", contract);
      // console.log("Contract ETHx:", ETHxContract);

     
      const stakeAmountWei = ethers.utils.parseEther(stakeAmount);

     
      const approvalTx = await ETHxContract.approve(contractAddress, stakeAmountWei);
      await approvalTx.wait();

      
      const ethPrice = await fetchEthPrice();

      if (ethPrice) {
        const debtAmount = (parseFloat(ethPrice) * parseFloat(stakeAmount) / 2).toString();
        const finalDebtAmount = ethers.utils.parseUnits(debtAmount, 18);
        setFinalDebtAmount(finalDebtAmount);

       
        const tx = await contract.openTrove(
          troveManager,
          walletAddress,
          maxFeePercentage,
          stakeAmountWei,
          finalDebtAmount,
          upperHint, 
          lowerHint  
        );

        const receipt = await tx.wait();

        
        const event = receipt.events.find((e) => e.event === "StablecoinsIssued");
        if (event) {
          const stablecoinsReceived = ethers.utils.formatUnits(event.args.amount, 18);
          setReceivedStablecoins(stablecoinsReceived);
        } else {
          setError("StablecoinsIssued event not found in transaction receipt.");
        }
      }
    } catch (err) {
      console.error("Error staking ETH:", err);
      setError("Transaction failed. Please check your wallet balance and gas fees.");
    }
    setLoading(false);
  };

  const handleStakeAmountChange = async (e) => {
    const amount = e.target.value;
    setStakeAmount(amount);

    if (amount === "") {
      setFinalDebtAmount(ethers.utils.parseUnits("0", 18));
    } else {
      const ethPrice = await fetchEthPrice();
      if (ethPrice) {
        const debtAmount = parseFloat(ethPrice) * parseFloat(amount) / 2;

        if (!isNaN(debtAmount)) {
          const finalDebtAmount = ethers.utils.parseUnits(debtAmount.toString(), 18);
          setFinalDebtAmount(finalDebtAmount);
        } else {
          setFinalDebtAmount(ethers.utils.parseUnits("0", 18));
        }
      } else {
        setFinalDebtAmount(ethers.utils.parseUnits("0", 18));
      }
    }
  };

  return (
    <div>
      
    <div className="flex flex-col items-center justify-center">
     
      <form onSubmit={handleStakeETH} className="flex flex-col space-y-4">
        <input
          type="text"
          placeholder="Stake Amount (ETH)"
          value={stakeAmount}
          onChange={handleStakeAmountChange}
          className="px-4 py-2 border rounded-md"
        />
        <button
          type="submit"
          className="px-6 py-2 bg-green-500 text-white rounded-md"
          disabled={loading}
        >
          Stake ETHx
        </button>
        {finalDebtAmount && (
          <div>
            Receive mkUSDT - {ethers.utils.formatUnits(finalDebtAmount, 18)}
          </div>
        )}
      </form>
      {receivedStablecoins && (
        <p className="mt-4 text-green-500">
          Received Stablecoins: {receivedStablecoins}
        </p>
      )}
      {error && <p className="mt-4 text-red-500">{error}</p>}
      {loading && <p className="mt-4 text-blue-500">Processing...</p>}
    </div>
    </div>
  );
};

export default StakeETHForm;
