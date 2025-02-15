import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { getContracts } from "../utils/contract";
import React from "react";
export default function Dashboard() {
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserEvents = async () => {
      try {
        const contracts = await getContracts();
        const eventCount = await contracts.PayPerAttendance.eventCount();
        
        // Get user's address
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        
        // Check each event for user registration
        const userEvents = [];
        for (let i = 1; i <= eventCount; i++) {
          const registrationTime = await contracts.PayPerAttendance.attendees(i, address);
          if (registrationTime.gt(0)) {
            const eventData = await contracts.PayPerAttendance.events(i);
            userEvents.push({
              ...eventData,
              eventId: i,
              registrationTime
            });
          }
        }
        
        setRegisteredEvents(userEvents);
      } catch (error) {
        console.error("Error fetching user events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserEvents();
  }, []);

  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar />
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Your Dashboard</h1>
        
        {loading ? (
          <div>Loading your events...</div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Your Registered Events</h2>
            {registeredEvents.map(event => (
              <div key={event.eventId} className="bg-white rounded-lg shadow p-4">
                <h3 className="text-lg font-semibold">{event.eventName}</h3>
                <p>Registration Time: {new Date(event.registrationTime.toNumber() * 1000).toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}