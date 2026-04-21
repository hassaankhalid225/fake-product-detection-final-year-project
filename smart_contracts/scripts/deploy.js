import hre from "hardhat";
const ethers = hre.ethers;
import fs from "fs";

async function main() {
    const ProductVerification = await ethers.getContractFactory("ProductVerification");
    const pm = await ProductVerification.deploy();

    await pm.waitForDeployment();

    const address = await pm.getAddress();
    console.log(`ProductVerification deployed to ${address}`);

    // Create an env or json file for backend to consume
    const data = {
        address: address,
        abi: JSON.parse(
            fs.readFileSync(
                "./artifacts/contracts/ProductVerification.sol/ProductVerification.json",
                "utf8"
            )
        ).abi
    };

    fs.writeFileSync("../Backend/utils/ContractData.json", JSON.stringify(data, null, 2));
    console.log("Contract deployed and Data saved to Backend/utils/ContractData.json");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
