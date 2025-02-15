import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import React from "react";
import EventCard from "../components/EventCard";
import WalletConnect from "../components/WalletConnect";
import { getContracts } from "../utils/contract";
import { ethers } from "ethers";

export default function Home() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [error, setError] = useState(null); // Add error state
  const [newEvent, setNewEvent] = useState({
    eventName: "",
    pricePerMinute: ""
  });

  // Fetch Events with better error handling
  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const contracts = await getContracts();
      if (!contracts || !contracts.PayPerAttendance) {
        throw new Error("Contract not initialized properly");
      }

      const eventCount = await contracts.PayPerAttendance.eventCount();
      console.log("Total events:", eventCount.toString()); // Debug log
      
      const eventPromises = [];
      for (let i = 1; i <= eventCount; i++) {
        eventPromises.push(contracts.PayPerAttendance.events(i));
      }
      
      const fetchedEvents = await Promise.all(eventPromises);
      console.log("Raw fetched events:", fetchedEvents);

      const formattedEvents = fetchedEvents.map((event, index) => {
        console.log(`Processing event ${index + 1}:`, event); // Debug log
        return {
          eventId: index + 1,
          eventName: event.eventName,
          pricePerMinute: ethers.formatEther(event.pricePerMinute.toString()),
          isActive: event.isActive,
          organizer: event.organizer,
        };
      });
      
      console.log("Formatted events:", formattedEvents);
      setEvents(formattedEvents);
    } catch (error) {
      console.error("Error fetching events:", error);
      setError("Failed to fetch events: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Handle Create Event with better error handling
  const handleCreateEvent = async (e) => {
    e.preventDefault();
    setError(null);

    console.log("Create Event Triggered with:", newEvent);
    
    if (!newEvent.eventName || !newEvent.pricePerMinute) {
      setError("Please fill in both fields.");
      return;
    }

    try {
      const contracts = await getContracts();
      if (!contracts || !contracts.PayPerAttendance) {
        throw new Error("Contract not initialized properly");
      }

      console.log("Contract instance:", contracts.PayPerAttendance.address);
      
      const priceInWei = ethers.parseEther(newEvent.pricePerMinute.toString());
      console.log("Price in Wei:", priceInWei.toString());
      
      const tx = await contracts.PayPerAttendance.createEvent(
        newEvent.eventName,
        priceInWei
      );
      
      console.log("Transaction hash:", tx.hash);
      await tx.wait();

      // Reset form and refetch events
      setNewEvent({ eventName: "", pricePerMinute: "" });
      setIsCreatingEvent(false);
      await fetchEvents();  // Re-fetch events after creation
      
    } catch (error) {
      console.error("Error creating event:", error);
      setError(error.message || "Failed to create event. Please try again.");
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar />
      <WalletConnect />
      <div className="p-6">
        {/* Error Display */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Create Event Button */}
        <div className="mb-6">
          <button
            onClick={() => {
              console.log("Create button clicked"); // Debug log
              setIsCreatingEvent(!isCreatingEvent);
            }}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            {isCreatingEvent ? "Cancel" : "Create New Event"}
          </button>
        </div>

        {/* Create Event Form */}
        {isCreatingEvent && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-bold mb-4">Create New Event</h2>
            <form onSubmit={handleCreateEvent}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Event Name</label>
                <input
                  type="text"
                  value={newEvent.eventName}
                  onChange={(e) => {
                    console.log("Event name changed:", e.target.value); // Debug log
                    setNewEvent({ ...newEvent, eventName: e.target.value });
                  }}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Price Per Minute (ETH)</label>
                <input
                  type="number"
                  step="0.000000000000000001"
                  value={newEvent.pricePerMinute}
                  onChange={(e) => {
                    console.log("Price changed:", e.target.value); // Debug log
                    setNewEvent({ ...newEvent, pricePerMinute: e.target.value });
                  }}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <button
                type="submit"
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Create Event
              </button>
            </form>
          </div>
        )}

        {/* Events List */}
        {loading ? (
          <div className="text-center">Loading events...</div>
        ) : events.length === 0 ? (
          <div className="text-center text-gray-600">No events found</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard key={event.eventId} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}