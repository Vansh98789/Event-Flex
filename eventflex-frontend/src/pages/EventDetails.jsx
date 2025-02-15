import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { getContracts } from "../utils/contract";
import { formatEther } from "ethers";
import React from "react";

export default function EventDetails() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [isRegistered, setIsRegistered] = useState(false);
  const [earnedAmount, setEarnedAmount] = useState("0");
  const [eventBalance, setEventBalance] = useState("0");
  const [currentAddress, setCurrentAddress] = useState("");

  const checkRegistration = async (contracts, address) => {
    try {
      const registrationTime = await contracts.PayPerAttendance.attendees(id, address);
      if (registrationTime.toString() !== "0") {
        setIsRegistered(true);
        return true;
      }
      return false;
    } catch (error) {
      console.log("User not registered or error checking registration:", error);
      return false;
    }
  };

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const contracts = await getContracts();
        const eventData = await contracts.PayPerAttendance.events(id);
        
        // Get event balance from the event struct
        const balance = eventData.balance ? eventData.balance.toString() : "0";
        
        const formattedEvent = {
          eventName: eventData.eventName,
          pricePerMinute: eventData.pricePerMinute.toString(),
          startTime: eventData.startTime.toString(),
          endTime: eventData.endTime.toString(),
          organizer: eventData.organizer,
          isActive: eventData.isActive,
          balance: balance // Include balance in the formatted event
        };
        
        setEvent(formattedEvent);
        setEventBalance(balance);
        
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        const address = accounts[0];
        setCurrentAddress(address);
        setIsOwner(address.toLowerCase() === eventData.organizer.toLowerCase());
        await checkRegistration(contracts, address);
      } catch (error) {
        console.error("Error fetching event details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEventDetails();
    
    const handleAccountsChanged = async (accounts) => {
      const newAddress = accounts[0];
      setCurrentAddress(newAddress);
      const contracts = await getContracts();
      setIsOwner(newAddress.toLowerCase() === event?.organizer.toLowerCase());
      await checkRegistration(contracts, newAddress);
    };
    window.ethereum.on('accountsChanged', handleAccountsChanged);
    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
    };
  }, [id]);

  const updateEarnedAmount = async () => {
    if (!isRegistered || !event?.isActive) return;
    
    try {
      const contracts = await getContracts();
      const timeSpentSeconds = await contracts.PayPerAttendance.getTimeSpent(id, currentAddress);
      setTimeSpent(timeSpentSeconds.toNumber());
      
      // Calculate earned amount based on time spent
      const timeSpentMinutes = Math.floor(timeSpentSeconds / 60);
      const pricePerMinute = event.pricePerMinute;
      const earned = (BigInt(timeSpentMinutes) * BigInt(pricePerMinute)).toString();
      setEarnedAmount(earned);
    } catch (error) {
      console.error("Error updating earned amount:", error);
    }
  };

  useEffect(() => {
    if (!isRegistered || !event?.isActive) return;
    
    updateEarnedAmount();
    const interval = setInterval(updateEarnedAmount, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, [isRegistered, event?.isActive, currentAddress]);

  const handleRegister = async () => {
    try {
      const contracts = await getContracts();
      const tx = await contracts.PayPerAttendance.registerforEvent(id);
      await tx.wait();
      alert("Successfully registered for event!");
      setIsRegistered(true);
      
      // Reset earned amount and time spent upon registration
      setEarnedAmount("0");
      setTimeSpent(0);
    } catch (error) {
      console.error("Error registering for event:", error);
      alert("Failed to register for event");
    }
  };

  const handleStartEvent = async () => {
    try {
      const contracts = await getContracts();
      const tx = await contracts.PayPerAttendance.startEvent(id);
      await tx.wait();
      alert("Event started successfully!");
      
      // Update the local state to reflect that the event is now active
      setEvent({...event, isActive: true});
    } catch (error) {
      console.error("Error starting event:", error);
      alert("Failed to start event");
    }
  };

  const handleEndEvent = async () => {
    try {
      const contracts = await getContracts();
      const tx = await contracts.PayPerAttendance.endEvent(id);
      await tx.wait();
      alert("Event ended successfully!");
      
      // Update the local state to reflect that the event is now inactive
      setEvent({...event, isActive: false});
    } catch (error) {
      console.error("Error ending event:", error);
      alert("Failed to end event");
    }
  };

  const handleClaimPayment = async () => {
    if (earnedAmount === "0") {
      alert("No earnings to claim yet");
      return;
    }
    try {
      const contracts = await getContracts();
      const tx = await contracts.PayPerAttendance.claimPayment(id);
      await tx.wait();
      alert("Payment claimed successfully!");
      
      // Refresh the event data to get the new balance
      const eventData = await contracts.PayPerAttendance.events(id);
      const newBalance = eventData.balance ? eventData.balance.toString() : "0";
      setEventBalance(newBalance);
      setEarnedAmount("0");
    } catch (error) {
      console.error("Error claiming payment:", error);
      alert("Failed to claim payment");
    }
  };

  const formatPrice = (priceInWei) => {
    try {
      if (!priceInWei) return "0";
      return formatEther(priceInWei);
    } catch (error) {
      console.error("Error formatting price:", error);
      return "0";
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!event) return <div>Event not found</div>;

  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar />
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-3xl font-bold">{event.eventName}</h1>
            {isOwner && (
              <div className="space-x-4">
                <div className="mb-4">
                  <h3 className="font-semibold">Event Balance</h3>
                  <p>{formatPrice(eventBalance)} ETH</p>
                </div>
                {!event.isActive && (
                  <button
                    onClick={handleStartEvent}
                    className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white"
                  >
                    Start Event
                  </button>
                )}
                {event.isActive && (
                  <button
                    onClick={handleEndEvent}
                    className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white"
                  >
                    End Event
                  </button>
                )}
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold">Earnings per minute</h3>
              <p>{formatPrice(event.pricePerMinute)} ETH</p>
            </div>
            <div>
              <h3 className="font-semibold">Status</h3>
              <p className={`font-medium ${event.isActive ? 'text-green-600' : 'text-red-600'}`}>
                {event.isActive ? "Active" : "Inactive"}
              </p>
            </div>
            <div>
              <h3 className="font-semibold">Organizer</h3>
              <p className="text-sm break-all">{event.organizer}</p>
            </div>
            
            {isRegistered && (
              <>
                <div>
                  <h3 className="font-semibold">Time Spent</h3>
                  <p>{Math.floor(timeSpent / 60)} minutes</p>
                </div>
                <div>
                  <h3 className="font-semibold">Current Earnings</h3>
                  <p>{formatPrice(earnedAmount)} ETH</p>
                </div>
              </>
            )}
          </div>
          
          {!isOwner && (
            <div className="mt-6 space-x-4">
              {!isRegistered ? (
                <button 
                  onClick={handleRegister}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                  disabled={!event.isActive}
                >
                  Register for Event
                </button>
              ) : (
                <button 
                  onClick={handleClaimPayment}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
                  disabled={!event.isActive || earnedAmount === "0"}
                >
                  Claim {formatPrice(earnedAmount)} ETH
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}