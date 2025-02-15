// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.0;
import "./SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PayPerAttendance is Ownable {
    using SafeMath for uint256;

    struct Event {
        string eventName;
        uint256 pricePerMinute;
        uint256 startTime;
        uint256 endTime;
        address organizer;
        bool isActive;
        uint256 balance;  // Track event's balance
    }

    mapping(uint256 => Event) public events;
    mapping(uint256 => mapping(address => uint256)) public attendees;
    mapping(uint256 => mapping(address => uint256)) public lastPaidTime;
    uint256 public eventCount;

    event EventCreated(uint256 eventId, string eventName, uint256 pricePerMinute);
    event EventStarted(uint256 eventId);
    event EventEnded(uint256 eventId);
    event AttendeeRegistered(uint256 eventId, address attendee);
    event PaymentSent(uint256 eventId, address attendee, uint256 amount);

    constructor() {}

    // Create event with initial balance
    function createEvent(string memory eventName, uint256 pricePerMinute) public payable {
        eventCount++;
        events[eventCount] = Event({
            eventName: eventName,
            pricePerMinute: pricePerMinute,
            startTime: 0,
            endTime: 0,
            organizer: msg.sender,
            isActive: false,
            balance: msg.value
        });

        emit EventCreated(eventCount, eventName, pricePerMinute);
    }

    // Add funds to event
    function addFundsToEvent(uint256 eventId) public payable {
        require(msg.sender == events[eventId].organizer, "Only organizer can add funds");
        events[eventId].balance = events[eventId].balance.add(msg.value);
    }

    function startEvent(uint256 eventId) public {
        require(msg.sender == events[eventId].organizer, "Only organizer can start event");
        require(!events[eventId].isActive, "Event already started");
        events[eventId].startTime = block.timestamp;
        events[eventId].isActive = true;
        emit EventStarted(eventId);
    }

    function endEvent(uint256 eventId) public {
        require(msg.sender == events[eventId].organizer, "Only organizer can end event");
        require(events[eventId].isActive, "Event not started yet");
        events[eventId].endTime = block.timestamp;
        events[eventId].isActive = false;
        emit EventEnded(eventId);
    }

    // Free registration for attendees
    function registerforEvent(uint256 eventId) public {
        require(events[eventId].isActive, "Event is not active");
        require(attendees[eventId][msg.sender] == 0, "Already registered");
        attendees[eventId][msg.sender] = block.timestamp;
        lastPaidTime[eventId][msg.sender] = block.timestamp;
        emit AttendeeRegistered(eventId, msg.sender);
    }

    // Attendee can claim their earned amount
    function claimPayment(uint256 eventId) public {
        require(events[eventId].isActive, "Event is not active");
        require(attendees[eventId][msg.sender] != 0, "Not registered");
        
        uint256 lastPaid = lastPaidTime[eventId][msg.sender];
        uint256 timeSpent = block.timestamp.sub(lastPaid);
        uint256 minutesSpent = timeSpent.div(60);
        uint256 amount = minutesSpent.mul(events[eventId].pricePerMinute);
        
        require(amount > 0, "No payment due");
        require(events[eventId].balance >= amount, "Insufficient event balance");

        events[eventId].balance = events[eventId].balance.sub(amount);
        lastPaidTime[eventId][msg.sender] = block.timestamp;
        
        payable(msg.sender).transfer(amount);
        emit PaymentSent(eventId, msg.sender, amount);
    }

    function getTimeSpent(uint256 eventId, address attendee) public view returns (uint256) {
        if (attendees[eventId][attendee] == 0) return 0;
        return block.timestamp.sub(lastPaidTime[eventId][attendee]);
    }

    function getEventBalance(uint256 eventId) public view returns (uint256) {
        return events[eventId].balance;
    }
}