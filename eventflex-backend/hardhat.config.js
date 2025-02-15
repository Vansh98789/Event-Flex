require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");
require("hardhat-gas-reporter");
require("solidity-coverage");
require("@nomiclabs/hardhat-etherscan");
require("@typechain/hardhat");
require("dotenv").config();

// Ensure the necessary environment variables are set
const SEPOLIA_URL = process.env.SEPOLIA_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;

// Add environment variable validation
function validateConfig() {
  const requiredEnvVars = {
    'SEPOLIA_URL': SEPOLIA_URL,
    'PRIVATE_KEY': PRIVATE_KEY,
    'ETHERSCAN_API_KEY': ETHERSCAN_API_KEY
  };

  for (const [name, value] of Object.entries(requiredEnvVars)) {
    if (!value) {
      throw new Error(`Missing required environment variable: ${name}`);
    }
  }
}

validateConfig();

module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  defaultNetwork: "hardhat",
  networks: {
    sepolia: {
      url: SEPOLIA_URL,
      accounts: [`0x${PRIVATE_KEY}`], // Ensure private key is properly formatted
      chainId: 11155111,
      gasPrice: "auto",
      timeout: 60000 // 1 minute timeout
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
      gas: "auto",
      gasPrice: "auto",
      accounts: {
        mnemonic: "test test test test test test test test test test test junk"
      }
    }
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS === "true",
    currency: "USD",
    coinmarketcap: process.env.COINMARKETCAP_API_KEY
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};