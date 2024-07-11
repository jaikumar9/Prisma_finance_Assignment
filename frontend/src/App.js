import React, { useState } from "react";
import ConnectWallet from "./components/ConnectWallet";
import StakeETHForm from "./components/OpenTroveForm";

const App = () => {
  const [account, setAccount] = useState(null);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold mb-8 p-5">
        Submit ETHx to Get mkUSDT With Prisma Finance.
      </h1>
      <h1 className="text-3xl font-bold mb-8">ETHx Staking for Stablecoins</h1>
      {!account ? (
        <ConnectWallet setAccount={setAccount} />
      ) : (
        <div>
          <p className="mb-4">Connected Account: {account}</p>
          <StakeETHForm walletAddress={account} />
        </div>
      )}
    </div>
  );
};

export default App;
