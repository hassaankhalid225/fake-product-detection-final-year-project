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
            console.warn(`[Blockchain] ContractData.json NOT FOUND.`);
            return null;
        }

        const contractData = JSON.parse(fs.readFileSync(contractDataPath, 'utf8'));
        const rpcUrl = process.env.RPC_URL || 'http://127.0.0.1:8545';
        
        provider = new ethers.JsonRpcProvider(rpcUrl);
        
        try {
            await provider.getNetwork();
        } catch (nodeErr) {
            console.warn(`[Blockchain] Could not connect to Ethereum node at ${rpcUrl}`);
            return null;
        }

        // Use Private Key if provided, otherwise fallback to local signer
        if (process.env.PRIVATE_KEY) {
            signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
        } else {
            signer = await provider.getSigner(0);
        }

        contractInstance = new ethers.Contract(contractData.address, contractData.abi, signer);

        console.log(`[Blockchain] Connected to network: ${rpcUrl}`);
        console.log(`[Blockchain] Contract Address: ${contractData.address}`);
        return { contract: contractInstance, provider, signer };
    } catch (error) {
        console.error(`[Blockchain] Initialization failed: ${error.message}`);
        return null;
    }
}

module.exports = { getContractInstance };
