
import PayPerAttendanceArtifact from "./PayPerAttendance.json";
import SuperFluidPaymentArtifact from "./SuperFluidPayment.json";

// Extract the ABI directly from the artifact
const PayPerAttendanceABI = PayPerAttendanceArtifact.abi;
const SuperFluidPaymentABI = SuperFluidPaymentArtifact.abi;

export const contractAddresses = {
  PayPerAttendance: "0x86ECb405bfe431c4a961Fe55C301390985B47eEd",
  SuperFluidPayment: "0x30C035788f2c8e0bE84684C8d8905BAF4B09F7C9"
};

export const contractABIs = {
  PayPerAttendance: PayPerAttendanceABI,
  SuperFluidPayment: SuperFluidPaymentABI
};
