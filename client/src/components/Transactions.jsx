import React, { useContext } from "react";

import { TransactionContext } from "../context/TransactionContext";

import { shortenAddress } from "../utils/shortenAddress";

import {Loader } from './';






const TransactionsCard = ({ address, id, endTimestamp, name, score}) => {

  const {  isUpdating, checkPrediction} = useContext(TransactionContext);

  const updateStatus = (e, i) => {
    e.preventDefault();
  
    checkPrediction(Number(i));
  }
  return (
    <div className="blue-glassmorphism m-2 flex flex-1 items-center w-full
      flex-col p-1 rounded-md hover:shadow-2xl"
    >
      <div className="flex items-center w-full">
        <div className="display-flex justify-start w-full m-2 p-2">
          <a href={`https://ropsten.etherscan.io/address/${address}`} target="_blank" rel="noreferrer">
            <p className="text-white text-base">Address : {shortenAddress(address)}</p>
          </a>
          <p className="text-white text-base"> Score : {~~Number(score)}</p>
          <p className="text-white text-base">ID: {Number(id)} </p>
          {name && (
            <>
              <p className="text-white text-base">Name: {name}</p>
            </>
          )}
        </div>
        <div className="bg-[#3d4f7c] p-3 px-5 mr-8 w-max rounded-3xl shadow-2xl">
          <p className="text-white font-bold">{endTimestamp}</p>
        </div>
        <div className="mr-6">
        {isUpdating ? <Loader/>
        :<button
          type="button"
          onClick={(event) => updateStatus(event, id)}
          className="text-white w-32 h-15  border-[1px] p-3 border-[#3d4f7c] hover:bg-[#3d4f7c] rounded-full cursor-pointer"
        >
          Complete Prediction
        </button>}

        </div>
      
      </div>
    </div>
  );
};

const Transactions = () => {
  const { predictions, currentAccount, txLoading} = useContext(TransactionContext);
  

  return (
    <div className="flex w-full justify-center items-center 2xl:px-20 gradient-bg-transactions">
      <div className="flex flex-col md:p-12 py-12 px-4">
        {currentAccount ? (
          <h3 className="text-cyan-800 text-3xl text-center my-2">
            Latest Predictions
          </h3>
        ) : (
          <h3 className="text-cyan-800 text-3xl text-center my-2">
            Connect your account to see the latest predictions
          </h3>
        )}

        <div className="flex flex-wrap justify-center items-center mt-10">
          {txLoading ?
          <Loader/> :
          [ ...predictions].reverse().map((prediction, i) => (
            <TransactionsCard key={i} {...prediction} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Transactions;