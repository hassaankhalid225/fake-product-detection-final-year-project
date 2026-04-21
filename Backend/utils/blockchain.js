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
            console.warn(`Contract details not found at ${contractDataPath}. Please deploy smart contract first.`);
            return null;
        }

        const contractData = JSON.parse(fs.readFileSync(contractDataPath, 'utf8'));

        // Connect to local Hardhat node
        provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');

        // For local development, grab the first signer from node
        signer = await provider.getSigner(0);

        contractInstance = new ethers.Contract(contractData.address, contractData.abi, signer);

        return { contract: contractInstance, provider, signer };
    } catch (error) {
        console.error(`Failed to connect to Ethereum: ${error}`);
        return null;
    }
}

module.exports = { getContractInstance };
