// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ProductVerification {

    struct Product {
        string productID;
        string name;
        string manufacturer;
        string batch;
        string manufactureDate;
        address currentOwner;
        string status; // Active, Sold
        bool isRegistered;
    }

    struct History {
        address previousOwner;
        address newOwner;
        string status;
        uint256 timestamp;
    }

    mapping(string => Product) public products;
    mapping(string => History[]) public productHistory;

    event ProductRegistered(string indexed productID, string name, address manufacturer, uint256 timestamp);
    event ProductTransferred(string indexed productID, address from, address to, uint256 timestamp);
    event ProductSold(string indexed productID, address retailer, uint256 timestamp);

    function registerProduct(
        string memory _productID,
        string memory _name,
        string memory _manufacturer,
        string memory _batch,
        string memory _manufactureDate
    ) public {
        require(!products[_productID].isRegistered, "Product already registered");

        products[_productID] = Product({
            productID: _productID,
            name: _name,
            manufacturer: _manufacturer,
            batch: _batch,
            manufactureDate: _manufactureDate,
            currentOwner: msg.sender,
            status: "Active",
            isRegistered: true
        });

        // Add to history
        productHistory[_productID].push(History({
            previousOwner: address(0),
            newOwner: msg.sender,
            status: "Active - Registered",
            timestamp: block.timestamp
        }));

        emit ProductRegistered(_productID, _name, msg.sender, block.timestamp);
    }

    function transferProduct(string memory _productID, address _to) public {
        require(products[_productID].isRegistered, "Product not found");
        require(products[_productID].currentOwner == msg.sender, "Only current owner can transfer");
        require(keccak256(abi.encodePacked(products[_productID].status)) != keccak256(abi.encodePacked("Sold")), "Product already sold");

        address previousOwner = products[_productID].currentOwner;
        products[_productID].currentOwner = _to;

        // Add to history 
        productHistory[_productID].push(History({
            previousOwner: previousOwner,
            newOwner: _to,
            status: "Active - Transferred",
            timestamp: block.timestamp
        }));

        emit ProductTransferred(_productID, previousOwner, _to, block.timestamp);
    }

    function markProductSold(string memory _productID) public {
        require(products[_productID].isRegistered, "Product not found");
        require(products[_productID].currentOwner == msg.sender, "Only current owner can mark as sold");
        require(keccak256(abi.encodePacked(products[_productID].status)) != keccak256(abi.encodePacked("Sold")), "Product already sold");

        address previousOwner = products[_productID].currentOwner;
        products[_productID].currentOwner = address(0); // Consumer
        products[_productID].status = "Sold";

        // Add to history
        productHistory[_productID].push(History({
            previousOwner: previousOwner,
            newOwner: address(0),
            status: "Sold to Consumer",
            timestamp: block.timestamp
        }));

        emit ProductSold(_productID, msg.sender, block.timestamp);
    }

    function verifyProduct(string memory _productID) public view returns (Product memory) {
        require(products[_productID].isRegistered, "Product not found");
        return products[_productID];
    }

    function getProductHistory(string memory _productID) public view returns (History[] memory) {
        require(products[_productID].isRegistered, "Product not found");
        return productHistory[_productID];
    }
}
