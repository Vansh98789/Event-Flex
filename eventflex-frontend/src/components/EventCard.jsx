import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';

const EventCard = ({ event }) => {
  const navigate = useNavigate();

  // Guard against missing or malformed event data
  if (!event || typeof event !== 'object') {
    return (
      <div className="bg-red-50 rounded-lg shadow-md p-6">
        <p className="text-red-500">Invalid event data</p>
      </div>
    );
  }

  // Format price with proper decimal places
  const formatPrice = (price) => {
    try {
      return parseFloat(price).toFixed(18);
    } catch (error) {
      console.error("Error formatting price:", error);
      return "Invalid price";
    }
  };

  // Safely format organizer address
  const formatAddress = (address) => {
    if (!address || typeof address !== 'string') return 'Invalid address';
    try {
      return `${address.slice(0, 6)}...${address.slice(-4)}`;
    } catch (error) {
      console.error("Error formatting address:", error);
      return 'Invalid address';
    }
  };

  // Handle navigation to event details
  const handleViewDetails = () => {
    navigate(`/event/${event.eventId}`);
  };

  // Determine status badge color
  const statusColor = event.isActive 
    ? "bg-green-100 text-green-800" 
    : "bg-red-100 text-red-800";

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold truncate">{event.eventName || 'Unnamed Event'}</h3>
        <span className={`px-2 py-1 rounded-full text-sm font-medium ${statusColor}`}>
          {event.isActive ? 'Active' : 'Inactive'}
        </span>
      </div>
      
      <div className="space-y-3">
        <div className="flex flex-col">
          <span className="text-gray-500 text-sm">Price per minute</span>
          <span className="text-lg font-medium">
            {formatPrice(event.pricePerMinute)} ETH
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-gray-500 text-sm">Organizer</span>
          <span className="font-mono text-sm break-all">
            {formatAddress(event.organizer)}
          </span>
        </div>
        {event.eventId && (
          <div className="flex flex-col">
            <span className="text-gray-500 text-sm">Event ID</span>
            <span className="text-sm">#{event.eventId}</span>
          </div>
        )}
      </div>
      <div className="mt-4 pt-4 border-t border-gray-100">
        <button 
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded transition-colors duration-200"
          onClick={handleViewDetails}
        >
          View Details
        </button>
      </div>
    </div>
  );
};

export default EventCard;