import React, { useEffect, useState } from "react";
import { ethers } from "ethers";

import { contractABI, contractAddress } from "../utils/constants";

import { initFhevm, createInstance } from 'fhevmjs';



const etherum = {window}
export const TransactionContext = React.createContext();

const createContractProvider = async () => {

  const provider = new ethers.BrowserProvider(ethereum);
  const signer = await provider.getSigner();
  const signerAddress = await signer.getAddress();

  const contract = new ethers.Contract(contractAddress, contractABI, signer);

  return {contract, signerAddress, signer};

};



const createFhevmInstance = async () => {
  let newInstance;
  const provider = new ethers.BrowserProvider(ethereum);
  const network = await provider.getNetwork();
  const chainId = +network.chainId.toString();
  const publicKey = await provider.call({
    from: null,
    to: '0x0000000000000000000000000000000000000044',
  });
  newInstance = await createInstance({ chainId, publicKey });
  return newInstance;
};


export const TransactionsProvider = ({ children }) => {
  const [formData, setformData] = useState({ address: "", value: "", duration: 0, symbol: "" });
  const [currentAccount, setCurrentAccount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [txLoading, setTxLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const [predictionCount, setPredictionCount] = useState(0);
  const [predictions, setPredictions] = useState([]);
  const [instance, setInstance] = useState([]);

  const handleChange = (e, name) => {
    setformData((prevState) => ({ ...prevState, [name]: e.target.value }));
  };

  const {ethereum} = window 

  const getAllPredictions = async () => {
    try {
      if (ethereum) {
        setTxLoading(true);

        const {contract, signerAddress } = await createContractProvider();

        const availablePredictions = await contract.getPredictionsOfAddress(signerAddress);

        const structuredPredictions = availablePredictions.map((pred) => ({
          address: pred.user,
          id: pred.Id,
          //startTimestamp: new Date(pred.timestamp.toNumber() * 1000).toLocaleString(),
          endTimestamp: new Date(Number(pred.timeStamp)*1000).toLocaleString(),
          name: pred.name,
        }
        ));
        let i = 0
        while( i < structuredPredictions.length){
          getScore(structuredPredictions[i]);
          ++i;
        }
        //structuredPredictions.forEach(getScore)
        setPredictions(structuredPredictions);
        setTxLoading(false);
        

      } else {
        console.log("Ethereum is not present");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const checkIfWalletIsConnect = async () => {
    try {
      if (!ethereum) return alert("Please install MetaMask.");

      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length) {
        setCurrentAccount(accounts[0]);

        getAllPredictions();
      } else {
        console.log("No accounts found");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const setupInstance = async () => {
    setInstance(await createFhevmInstance());
  }

  const selectZamaNetwork = async () => {
    try {
      if (!ethereum) return alert("Please install MetaMask.");

      const chainId = await ethereum.request({ method: "eth_chainId" });

      if (chainId != "0x1F49") {
        await ethereum.request({
          "method": "wallet_switchEthereumChain",
          "params": [
            {
              "chainId": "0x1F49"
            }
          ]
        });
      } else {
        console.log("Connected to network");
      }
    } catch (error) {
      console.log(error);
      await ethereum.request({
        "method": "wallet_addEthereumChain",
        "params": [
          {
            

              "chainId": "0x1F49",
              "blockExplorerUrls": ["https://main.explorer.zama.ai/"],
              "chainName" : "Zama Devnet",
              "rpcUrls" : ["https://devnet.zama.ai" ],
              "nativeCurrency" : {"decimals": 18, "name" :"zama" ,"symbol" : "ZAMA"}

          }
        ]
      });
    }
  };

  const getPKAndSignature = async (userAddress, contractAddress) => {
    let publicKey;
    let signature;
    if (!instance.hasKeypair(contractAddress)) {
      const generatedToken = instance.generateToken({ verifyingContract: contractAddress })
      const params = [userAddress, JSON.stringify(generatedToken.token)];
      signature = await ethereum.request({
        method: 'eth_signTypedData_v4',
        params,
      });
      publicKey = generatedToken.publicKey;
    } else {
      const token = instance.getTokenSignature(contractAddress);
      publicKey = token.publicKey;
      signature = token.signature;
    }
    return { publicKey, signature };
  };


        //window.localStorage.setItem("transactionCount", availablePredictions);


  const connectWallet = async () => {
    try {
      if (!ethereum) return alert("Please install MetaMask.");

      const accounts = await ethereum.request({ method: "eth_requestAccounts", });

      setCurrentAccount(accounts[0]);
      window.location.reload();
    } catch (error) {
      console.log(error);

      throw new Error("No ethereum object");
    }
  };

  const getScore = async (user) => {

    const {contract, signer, signerAddress} = await createContractProvider();
    await contract.getScore(user.address).then((res) => {
      user.score = (res);
      console.log(user)
    }) ;
  }

  const createTransaction = async (
    method,
    ...params 
  ) => {
    const gasLimit = await method.estimateGas(...params);
    const updatedParams = [...params, { gasLimit: Math.round(+gasLimit.toString() * 1.2) }];
    return method(...updatedParams);
  };

  const sendPrediction = async () => {
    try {
      if (ethereum) {
        const { address, value, duration, symbol } = formData;
        const evalue = await instance.encrypt32(+value);
        const {contract, signer, signerAddress} = await createContractProvider();
        const prediction = await createTransaction(contract.addSimplePred, evalue, symbol);


        setIsLoading(true);
        console.log(`Loading - ${prediction.hash}`);
        await prediction.wait();
        console.log(`Success - ${prediction.hash}`);
        setIsLoading(false);

        const availablePredictions = await contract.getPredictionsOfAddress(signerAddress)
                    
          const structuredPredictions = availablePredictions.map((pred) => ({
            address: pred.user,
            id: pred.Id,
            //startTimestamp: new Date(pred.timestamp.toNumber() * 1000).toLocaleString(),
            endTimestamp: new Date(Number(pred.timeStamp) * 1000).toLocaleString(),
            name: pred.name,
          }));


          setPredictions(structuredPredictions);
          setPredictionCount(structuredPredictions.length)
        window.location.reload();
      } else {
        console.log("No ethereum object");
      }
    } catch (error) {
      console.log("Found error" + error);

      throw new Error("Failed transaction attempt");
    }

    
  };

  const checkPrediction = async (id) => {
    try {
      if (ethereum) {
        setIsUpdating(true);
        const {contract} = await createContractProvider();
        const prediction = await createTransaction(contract.checkPredictionReward, +id);
        const address = await contract.getAddressFromId(id);
        await contract.getScore(address);

        console.log(`Loading - ${prediction.hash}`);
        await prediction.wait();
        console.log(`Success - ${prediction.hash}`);
        setIsUpdating(false);

      } else {
        console.log("No ethereum object");
      }
    } catch (error) {
      console.log("Found error" + error);

      throw new Error("Failed transaction attempt");
    }

    
  };



  useEffect(() => {
    initFhevm().then(async () => {
      await selectZamaNetwork();
      await setupInstance();
    });
  }, []);
  useEffect(() => {
    checkIfWalletIsConnect();
    getAllPredictions();
  }, [predictionCount]);

  return (
    <TransactionContext.Provider
      value={{
        connectWallet,
        predictions,
        currentAccount,
        txLoading,
        isLoading,
        isUpdating,
        checkPrediction,
        getScore,
        sendPrediction,
        handleChange,
        createFhevmInstance,
        getPKAndSignature,
        formData,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};