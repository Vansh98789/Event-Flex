import { ethers } from "ethers";
import { contractAddresses, contractABIs } from "../config/contracts";

export const getContracts = async () => {
  if (!window.ethereum) throw new Error("No Web3 Provider found");
  
  // Updated to ethers v6 syntax
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner(); // Note: getSigner is now async in v6
  
  return {
    PayPerAttendance: new ethers.Contract(
      contractAddresses.PayPerAttendance,
      contractABIs.PayPerAttendance,
      signer
    ),
    SuperFluidPayment: new ethers.Contract(
      contractAddresses.SuperFluidPayment,
      contractABIs.SuperFluidPayment,
      signer
    )
  };
};