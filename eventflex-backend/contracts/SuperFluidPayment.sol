// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Superfluid imports
import "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperToken.sol";
import "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperfluid.sol";
import "@superfluid-finance/ethereum-contracts/contracts/interfaces/agreements/IConstantFlowAgreementV1.sol";

// OpenZeppelin import
import "@openzeppelin/contracts/access/Ownable.sol";

contract SuperFluidPayment is Ownable {
    ISuperfluid private host; // Superfluid host that manages agreements
    IConstantFlowAgreementV1 private cfa; // CFA for real-time payment streams
    ISuperToken private superToken; // SuperToken used for payments
    address public eventOrganizer; // Address of the event organizer

    struct Event {
        uint256 startTime;
        uint256 endTime;
    }

    mapping(uint256 => Event) public events; // Mapping of event ID to event details

    event PaymentStreamCreated(address indexed attendee, uint256 eventId, int96 amountPerSecond);
    event PaymentStreamStopped(address indexed attendee, uint256 eventId);

    constructor(
        address _host,
        address _cfa,
        address _superToken,
        address _eventOrganizer
    ) {
        host = ISuperfluid(_host);
        cfa = IConstantFlowAgreementV1(_cfa);
        superToken = ISuperToken(_superToken);
        eventOrganizer = _eventOrganizer;
    }

    // Create an event (only owner can call)
    function createEvent(uint256 eventId, uint256 startTime, uint256 endTime) public onlyOwner {
        require(endTime > startTime, "Invalid event time");
        events[eventId] = Event(startTime, endTime);
    }

    // Start a payment stream for an attendee
    function createPaymentStream(uint256 eventId, address attendee, int96 amountPerSecond) public {
        require(attendee != address(0), "Invalid attendee address");
        require(amountPerSecond > 0, "Amount per second must be greater than zero");
        require(events[eventId].startTime > 0, "Event not found");

        host.callAgreement(
            cfa,
            abi.encodeWithSelector(
                cfa.createFlow.selector,
                superToken,
                eventOrganizer,
                amountPerSecond,
                new bytes(0)
            ),
            "0x"
        );

        emit PaymentStreamCreated(attendee, eventId, amountPerSecond);
    }

    // Stop a payment stream for an attendee
    function stopPaymentStream(uint256 eventId, address attendee) public {
        (, int96 flowRate, , ) = cfa.getFlow(superToken, attendee, eventOrganizer);
        require(flowRate > 0, "No active payment stream");

        host.callAgreement(
            cfa,
            abi.encodeWithSelector(
                cfa.deleteFlow.selector,
                superToken,
                attendee,
                eventOrganizer,
                new bytes(0)
            ),
            "0x"
        );

        emit PaymentStreamStopped(attendee, eventId);
    }
}
