const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

let contractInstance = null;
let provider = null;
let signer = null;

async function getContractInstance() {
    if (contractInstance) {
        return { contract: contractInstance, provider, signer };
    }

    try {
        const contractDataPath = path.join(__dirname, 'ContractData.json');

        if (!fs.existsSync(contractDataPath)) {
            console.warn(`[Blockchain] ContractData.json NOT FOUND at ${contractDataPath}.`);
            console.info(`[Blockchain] Please run 'npx hardhat run scripts/deploy.js --network localhost' in the smart_contracts directory.`);
            return null;
        }

        const contractData = JSON.parse(fs.readFileSync(contractDataPath, 'utf8'));

        // Connect to local Hardhat node
        provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
        
        // Quick check if provider is alive
        try {
            await provider.getNetwork();
        } catch (nodeErr) {
            console.warn(`[Blockchain] Could not connect to Ethereum node at http://127.0.0.1:8545. Is the node running?`);
            return null;
        }

        // For local development, grab the first signer from node
        signer = await provider.getSigner(0);
        contractInstance = new ethers.Contract(contractData.address, contractData.abi, signer);

        console.log(`[Blockchain] Connected to contract at ${contractData.address}`);
        return { contract: contractInstance, provider, signer };
    } catch (error) {
        console.error(`[Blockchain] Initialization failed: ${error.message}`);
        return null;
    }
}

module.exports = { getContractInstance };
