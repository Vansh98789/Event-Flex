const hre = require("hardhat");
const { ethers } = require("hardhat");
const { Framework } = require("@superfluid-finance/sdk-core");

// Updated Sepolia network addresses with correct checksums
const networks = {
    sepolia: {
        // Correct checksum addresses for Sepolia network
        host: "0xb90b9efab6632af6071fe1a4c7653b4acbf0e3c1",
        cfa: "0x204c5cd0c0092a31eb80ef99f4272267843e4e84",
        superTokens: {
            fDAIx: "0x36b862bd36b9e6c955a3c3d0103ac2a90c5f8642"
        }
    },
    localhost: {
        host: "",
        cfa: "",
        superTokens: {
            fDAIx: ""
        }
    }
};

async function deployTestToken() {
    const TestToken = await ethers.getContractFactory("TestToken");
    const fDAI = await TestToken.deploy("Test DAI", "fDAI", 18);
    await fDAI.deployed();
    console.log("Test fDAI deployed to:", fDAI.address);
    return fDAI;
}

async function validateAddress(address) {
    try {
        return ethers.utils.getAddress(address);
    } catch (error) {
        throw new Error(`Invalid address format for ${address}: ${error.message}`);
    }
}

async function main() {
    try {
        const [deployer] = await ethers.getSigners();
        console.log("Deploying contracts with the account:", deployer.address);
        console.log("Account balance:", (await deployer.getBalance()).toString());

        const networkName = hre.network.name;
        console.log("Deploying to network:", networkName);

        let networkAddresses;
        if (networkName === "localhost" || networkName === "hardhat") {
            console.log("Setting up local test environment...");
            const fDAI = await deployTestToken();
            networkAddresses = {
                host: networks.sepolia.host,
                cfa: networks.sepolia.cfa,
                superTokens: {
                    fDAIx: fDAI.address
                }
            };
            networks.localhost = networkAddresses;
        } else {
            networkAddresses = networks[networkName];
        }

        // Deploy PayPerAttendance contract
        const PayPerAttendance = await ethers.getContractFactory("PayPerAttendance");
        const payPerAttendance = await PayPerAttendance.deploy();
        await payPerAttendance.deployed();
        console.log("PayPerAttendance contract deployed to:", payPerAttendance.address);

        // Validate addresses before deployment
        const host = await validateAddress(networkAddresses.host);
        const cfa = await validateAddress(networkAddresses.cfa);
        const superToken = await validateAddress(networkAddresses.superTokens.fDAIx);
        const eventOrganizer = await validateAddress(deployer.address);

        console.log("\nDeploying SuperFluidPayment with parameters:");
        console.log("Host:", host);
        console.log("CFA:", cfa);
        console.log("SuperToken:", superToken);
        console.log("Event Organizer:", eventOrganizer);

        // Deploy SuperFluidPayment contract
        const SuperFluidPayment = await ethers.getContractFactory("SuperFluidPayment");
        const superFluidPayment = await SuperFluidPayment.deploy(
            host,
            cfa,
            superToken,
            eventOrganizer
        );
        await superFluidPayment.deployed();

        console.log("\nDeployment Summary:");
        console.log("-------------------");
        console.log("Network:", networkName);
        console.log("PayPerAttendance:", payPerAttendance.address);
        console.log("SuperFluidPayment:", superFluidPayment.address);

        // Optional: Verify contracts on Etherscan
        if (process.env.ETHERSCAN_API_KEY) {
            console.log("\nVerifying contracts on Etherscan...");
            await hre.run("verify:verify", {
                address: payPerAttendance.address,
                constructorArguments: []
            });

            await hre.run("verify:verify", {
                address: superFluidPayment.address,
                constructorArguments: [host, cfa, superToken, eventOrganizer]
            });
        }
    } catch (error) {
        console.error("\nDeployment failed:");
        console.error(error);
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });