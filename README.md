EventFlex
│── eventflex-backend       # Backend (Express.js + Solidity Smart Contracts)
│   ├── contracts           # Solidity smart contracts
│   │   ├── PayPerAttendance.sol
│   │   ├── SuperFluidPayment.sol
│   ├── scripts             # Deployment scripts
│   │   ├── deploy.js
│   ├── node_modules        # Node dependencies
│   ├── .env                # Environment variables (API keys, RPC URL)
│   ├── hardhat.config.js   # Hardhat configuration
│   ├── package.json        # Backend dependencies
│   ├── index.js            # Express.js server
│   ├── routes              # API routes
│   │   ├── eventRoutes.js
│   │   ├── userRoutes.js
│   ├── controllers         # Business logic for routes
│   │   ├── eventController.js
│   │   ├── userController.js
│   ├── utils               # Helper functions
│   │   ├── blockchain.js
│   │   ├── superfluid.js
│   ├── middleware          # Middleware for authentication, logging
│   │   ├── authMiddleware.js
│
│── eventflex-frontend      # Frontend (React.js + Vite)
│   ├── public              # Static assets
│   ├── src                 # Main frontend code
│   │   ├── components      # Reusable UI components
│   │   │   ├── Navbar.jsx
│   │   │   ├── EventCard.jsx
│   │   │   ├── WalletConnect.jsx
│   │   ├── pages           # Page components
│   │   │   ├── Home.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── EventDetails.jsx
│   │   ├── utils           # Helper functions
│   │   │   ├── web3.js
│   │   │   ├── contract.js
│   │   ├── App.jsx         # Main App component
│   │   ├── main.jsx        # React entry point
│   ├── .env                # Frontend environment variables
│   ├── package.json        # Frontend dependencies
│   ├── tailwind.config.js  # Tailwind CSS configuration
│   ├── index.html          # Main HTML file
│
│── README.md               # Project documentation


const contractAddresses = {
  sepolia: {
    PayPerAttendance: "0x86ECb405bfe431c4a961Fe55C301390985B47eEd",
    SuperFluidPayment: "0x30C035788f2c8e0bE84684C8d8905BAF4B09F7C9"
  }
}