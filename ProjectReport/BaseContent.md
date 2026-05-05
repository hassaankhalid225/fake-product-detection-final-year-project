# Project Report: Fake Product Detection using Blockchain

## 1. Pre-Chapter Sections

### Abstract
This project addresses the global crisis of counterfeit products by leveraging blockchain technology to ensure transparency and authenticity. **Chapter 1** introduces the problem, objectives, and the scope of the study. **Chapter 2** provides a comprehensive literature review, comparing current anti-counterfeit measures with decentralized solutions. **Chapter 3** details the methodology, including system architecture, use cases, and data handling. **Chapter 4** focuses on the implementation details, covering smart contract development, backend integration, and frontend dashboards. **Chapter 5** presents the results, conclusions, and directions for future research. Finally, **Chapter 6** lists the references used in this study.

### Keywords
Blockchain, Fake Product Detection, Supply Chain Transparency, Ethereum, Smart Contracts, Decentralized Authentication, QR Code Verification, Product Traceability.

---

## Chapter 1: Introduction

### 1.1 Problem Statement
The proliferation of counterfeit products has become a significant global issue, affecting various industries ranging from pharmaceuticals to luxury goods. Traditional anti-counterfeiting methods, such as holographic stickers and centralized databases, are often prone to tampering, duplication, or lack of consumer access. Consumers have no reliable way to verify the entire journey of a product from the manufacturer to the retail shelf. This lack of transparency leads to economic losses for legitimate manufacturers and poses severe health and safety risks to consumers.

### 1.2 Objectives
The primary objectives of this project are:
1.  **To develop a decentralized platform** for product verification that ensures data integrity and prevents tampering.
2.  **To implement a transparent supply chain** where every transfer of ownership is recorded on a public or consortium ledger.
3.  **To provide a user-friendly interface** for consumers to verify product authenticity using simple QR code scans.

### 1.3 Technologies Used
*   **Blockchain Engine**: Ethereum (Hardhat for local development).
*   **Smart Contracts**: Solidity.
*   **Backend Framework**: Node.js with Express.js.
*   **Database**: MongoDB (for caching and metadata storage).
*   **Frontend**: React.js with Vite.
*   **Web3 Integration**: Ethers.js.

### 1.4 Techniques
The system utilizes **Smart Contracts** to enforce rules on product transfers and registration. A **Deterministic Hashing** technique is used to create unique identifiers for products. **QR Code Technology** bridges the physical product with its digital twin on the blockchain.

### 1.5 Scope
The scope of this project includes the entire lifecycle of a product within a supply chain involving:
*   **Manufacturers**: Initializing the product and recording its birth on the blockchain.
*   **Distributors**: Recording the receipt and dispatch of goods.
*   **Retailers**: Finalizing the sale to the consumer.
*   **Consumers**: Verifying the authenticity of the purchased item.

### 1.6 Contributions
This study contributes to the field by:
1.  Proposing a hybrid architecture that combines the speed of traditional databases with the security of blockchain.
2.  Developing a modular smart contract that can be adapted for various types of supply chains.
3.  Demonstrating a practical implementation of blockchain in a real-world scenario.

### 1.7 Wind up
This introduction sets the stage for a detailed exploration of the system's design and implementation. By moving from a centralized to a decentralized trust model, we can significantly reduce the impact of fake products in the global market.

---

## Chapter 2: Literature Review

### 2.1 Comparative Analysis of Existing Work
Traditional methods like RFID and NFC have been used for years but they suffer from high implementation costs and centralized control. If the central database is compromised, the entire system's integrity is lost. Blockchain offers a solution by decentralizing the database.

| Feature | Centralized DB | RFID/NFC | Blockchain (Proposed) |
|---|---|---|---|
| Transparency | Low | Medium | Very High |
| Tamper-proof | No | No | Yes |
| Consumer Access | Restricted | Requires hardware | Easy (Mobile App) |
| Cost | Medium | High | Low (per transaction) |

### 2.2 Analysis of Previous Studies
Studies by Abeyratne and Monfared (2016) highlighted the potential of blockchain in supply chains. However, early implementations lacked a user-friendly verification method for end-consumers. This project bridges that gap.

---

## Chapter 3: Methodology

### 3.1 System Architecture
The system follows a three-tier architecture:
1.  **Presentation Layer**: React.js Frontend.
2.  **Logic Layer**: Node.js Backend API.
3.  **Data/Consensus Layer**: Ethereum Blockchain and MongoDB.

### 3.2 Workflow (Khuly Dil Se)
The process starts at the **Manufacturer** level. When a product is created, its details (ID, Name, Batch, Date) are sent to the smart contract via the `registerProduct` function. This creates a permanent, timestamped record.
When the product is shipped to a **Distributor**, the manufacturer initiates a `transferProduct` transaction. The distributor then accepts it (on-chain). This continues until it reaches the **Retailer**.
The **Retailer** marks the product as `Sold` when a consumer buys it.
Finally, the **Consumer** scans the QR code, which calls the `verifyProduct` and `getProductHistory` functions to see the entire journey.

### 3.3 Visuals
*   **Use Case Diagram**: Shows interactions between Manufacturer, Distributor, Retailer, and Consumer.
*   **Flowchart**: Illustrates the product lifecycle from registration to sale.
*   **Class Diagram**: Details the `Product` and `History` structs in the smart contract.
*   **ER Diagram**: Shows the MongoDB schema for `Product` and `VerificationLog`.

### 3.4 Dataset Description
The "dataset" consists of product metadata including:
*   Serial Number (Unique Primary Key)
*   Product Name
*   Manufacturing Date
*   Batch Number
*   Current Owner Address
*   History of Owners

---

## Chapter 4: Implementation

### 4.1 Hardware and Software Requirements
*   **CPU**: Quad-core 2.5GHz+.
*   **RAM**: 8GB+.
*   **OS**: Windows 10/11 or Linux.
*   **Tools**: VS Code, Node.js, Hardhat, MetaMask (optional for production).

### 4.2 Major Implementation Details
The core logic resides in `ProductVerification.sol`. 
```solidity
function registerProduct(...) public { ... }
function transferProduct(...) public { ... }
function verifyProduct(...) public view { ... }
```
The Backend uses `ethers.js` to connect to the Hardhat node. The `getContractInstance` utility ensures a stable connection.

### 4.3 Web Pages Screenshots (SS)
*   **Manufacturer Dashboard**: Shows forms to register new products.
*   **Distributor Dashboard**: Lists products ready for transfer.
*   **Verification Page**: A clean interface with a scan button and results display.

---

## Chapter 5: Conclusion & Results

### 5.1 Results Summary
The system successfully identifies authentic vs fake products. If a serial number is not on the blockchain, the system flags it as "Fake". If it is found, it displays the full provenance.
The average transaction time on Hardhat is <1s, making it viable for high-volume supply chains.

### 5.2 Future Work
*   **IoT Integration**: Automatic recording of temperature/location during transit.
*   **AI Analytics**: Identifying patterns of fraudulent scans from specific IP addresses.

---

## Chapter 6: References
1. Nakamoto, S. (2008). Bitcoin: A Peer-to-Peer Electronic Cash System.
2. Buterin, V. (2013). A Next-Generation Smart Contract and Decentralized Application Platform.
3. Abeyratne, S. A., & Monfared, R. P. (2016). Blockchain Ready Manufacturing Supply Chain using Distributed Ledger.
