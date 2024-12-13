import { ethers } from "ethers";
import { useEffect, useState } from "react";

// const expectedChainId = 1; // mainnet
const expectedChainId = 31337; // hardhat

export const useWalletReady = () => {
  const [state, setState] = useState({
    account: null,
    chainId: null,
    isConnected: false,
    isCorrectNetwork: false,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const checkWallet = async () => {
      try {
        // Check if MetaMask exists
        if (!window.ethereum) {
          throw new Error("Please install MetaMask");
        }

        // Get provider
        const provider = new ethers.providers.Web3Provider(
          window.ethereum as any
        );

        // Get accounts (this will prompt user if not connected)
        const accounts = await provider.listAccounts();
        const isConnected = accounts.length > 0;
        const account = isConnected ? accounts[0] : null;

        // Get network
        const network = await provider.getNetwork();
        const chainId = network.chainId;

        // Check if on correct network (e.g., mainnet or specific testnet)
        // Modify this based on your needs
        const isCorrectNetwork = chainId === expectedChainId;

        setState({
          account,
          chainId,
          isConnected,
          isCorrectNetwork,
          loading: false,
          error: null,
        });
      } catch (err) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: err.message,
        }));
      }
    };

    checkWallet();

    // Listen for account changes
    const handleAccountsChanged = (accounts) => {
      setState((prev) => ({
        ...prev,
        account: accounts[0] || null,
        isConnected: accounts.length > 0,
      }));
    };

    // Listen for chain changes
    const handleChainChanged = (chainId) => {
      // Convert chainId to number
      const newChainId = parseInt(chainId, 16);
      console.log("newChainId", newChainId);
      console.log("expectedChainId", expectedChainId);
      setState((prev) => ({
        ...prev,
        chainId: newChainId,
        isCorrectNetwork: newChainId === expectedChainId,
      }));
    };

    window.ethereum?.on("accountsChanged", handleAccountsChanged);
    window.ethereum?.on("chainChanged", handleChainChanged);

    return () => {
      window.ethereum?.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum?.removeListener("chainChanged", handleChainChanged);
    };
  }, []);

  const connect = async () => {
    try {
      if (!window.ethereum) {
        throw new Error("Please install MetaMask");
      }

      const provider = new ethers.providers.Web3Provider(
        window.ethereum as any
      );
      await provider.send("eth_requestAccounts", []);

      // Refresh state after connection
      const accounts = await provider.listAccounts();
      const network = await provider.getNetwork();

      setState((prev) => ({
        ...prev,
        account: accounts[0],
        chainId: network.chainId,
        isConnected: true,
      }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: err.message,
      }));
    }
  };

  return { ...state, connect };
};

export const useContractReady = (contractAddress, contractABI) => {
  const {
    account,
    chainId,
    isConnected,
    isCorrectNetwork,
    loading,
    error,
    connect,
  } = useWalletReady();

  const [contract, setContract] = useState(null);

  useEffect(() => {
    if (isConnected && isCorrectNetwork && contractAddress && contractABI) {
      const provider = new ethers.providers.Web3Provider(
        window.ethereum as any
      );
      const signer = provider.getSigner();
      const contractInstance = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );
      setContract(contractInstance);
    }
  }, [isConnected, isCorrectNetwork, contractAddress, contractABI]);

  return contract;
};
