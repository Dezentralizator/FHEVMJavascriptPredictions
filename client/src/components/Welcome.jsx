import React, {useContext} from 'react';
import { AiFillPlayCircle } from "react-icons/ai";


import { TransactionContext } from '../context/TransactionContext';
import {Loader } from './';

const Input = ({ placeholder, name, type, value, handleChange }) => (
    <input
      placeholder={placeholder}
      type={type}
      value={value}
      onChange={(e) => handleChange(e, name)}
      className="my-2 w-full rounded-sm p-2 outline-none bg-transparent text-white border-none text-sm white-glassmorphism"
    />
);
  
const Welcome = () => {

    const {value, isLoading, currentAccount, connectWallet, formData, handleChange, sendPrediction} = useContext(TransactionContext);

    const handleSubmit = (e) => {
      const { address, value, duration, symbol } = formData;
  
      e.preventDefault();
  
      if (!address || !value || !duration || !symbol ) return;
  
      sendPrediction();
    };

    return (
    <div className="flex w-full justify-center items-center">
        <div className="flex md:flex-row flex-col items-start justify-betwen md:p-14 py-8 px-4">
            <div className="flex flex-1 justify-start items-center flex-col ">
                <h1 className="text-2xl text-center sm:text-5xl text-cyan-800 py-1">
                    Upload your  <br /> prediction
                </h1>
                <p className="text-center my-5 text-cyan-900 font-light md:w-9/12 w-11/12 text-base">
                    Gain rewards by predicting prices. <br /> Upload your predictions beneath to score points.
                </p>
                {!currentAccount && (
                <button
                    type="button"
                    onClick={connectWallet}
                    className="flex flex-row justify-center items-center my-5 bg-[#2952e3] p-3 rounded-full cursor-pointer hover:bg-[#2546bd]">
                    <AiFillPlayCircle className="text-white mr-2" />
                    <p className="text-white text-base font-semibold">
                        Connect Wallet
                    </p>
                </button>
                )}

              <div className="p-5 sm:w-96 w-full flex flex-col justify-start items-center blue-glassmorphism">
                <Input placeholder="Oracle Address" name="address" type="text" handleChange={handleChange}/>
                <Input placeholder="Predicted Price Ratio" name="value" type="text" handleChange={handleChange}/>
                <Input step="1" placeholder="Predicted Duration in seconds" name="duration" type="number" handleChange={handleChange}/>
                <Input placeholder="Enter Message" name="symbol" type="text" handleChange={handleChange} />

                <div className="h-[1px] w-full bg-gray-400 my-2" />

                {isLoading
                  ? <Loader />
                  : (
                    <button
                      type="button"
                      onClick={handleSubmit}
                      className="text-white w-full mt-2 border-[1px] p-2 border-[#3d4f7c] hover:bg-[#3d4f7c] rounded-full cursor-pointer"
                    >
                      Send now
                    </button>
                  )}
              </div>

            </div>
        </div>
    </div>
    );
}

export default Welcome;