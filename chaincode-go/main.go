package main

import (
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

// SmartContract provides functions for managing a Product
type SmartContract struct {
	contractapi.Contract
}

// Product describes basic details of what makes up a simple product
type Product struct {
	ProductID       string `json:"productID"`
	Name            string `json:"name"`
	Manufacturer    string `json:"manufacturer"`
	Batch           string `json:"batch"`
	ManufactureDate string `json:"manufactureDate"`
	CurrentOwner    string `json:"currentOwner"`
	Status          string `json:"status"` // Active, Sold, etc.
}

// HistoryQueryResult structure used for returning result of history query
type HistoryQueryResult struct {
	Record    *Product `json:"record"`
	TxId      string   `json:"txId"`
	Timestamp string   `json:"timestamp"`
	IsDelete  bool     `json:"isDelete"`
}

// InitLedger adds a base set of products to the ledger
func (s *SmartContract) InitLedger(ctx contractapi.TransactionContextInterface) error {
	products := []Product{
		{ProductID: "init1", Name: "Init Product", Manufacturer: "System", Batch: "000", ManufactureDate: "2023-01-01", CurrentOwner: "System", Status: "Active"},
	}

	for _, product := range products {
		productJSON, err := json.Marshal(product)
		if err != nil {
			return err
		}

		err = ctx.GetStub().PutState(product.ProductID, productJSON)
		if err != nil {
			return fmt.Errorf("failed to put to world state. %v", err)
		}
	}

	return nil
}

// RegisterProduct registers a new product.
func (s *SmartContract) RegisterProduct(ctx contractapi.TransactionContextInterface, productID string, name string, manufacturer string, batch string, manufactureDate string) error {
	exists, err := s.ProductExists(ctx, productID)
	if err != nil {
		return err
	}
	if exists {
		return fmt.Errorf("the product %s already exists", productID)
	}

	product := Product{
		ProductID:       productID,
		Name:            name,
		Manufacturer:    manufacturer,
		Batch:           batch,
		ManufactureDate: manufactureDate,
		CurrentOwner:    manufacturer,
		Status:          "Active",
	}
	productJSON, err := json.Marshal(product)
	if err != nil {
		return err
	}

	return ctx.GetStub().PutState(productID, productJSON)
}

// TransferProduct transfers product ownership.
func (s *SmartContract) TransferProduct(ctx contractapi.TransactionContextInterface, productID string, from string, to string) error {
	product, err := s.VerifyProduct(ctx, productID)
	if err != nil {
		return err
	}

	if product.CurrentOwner != from {
		return fmt.Errorf("product %s is not currently owned by %s", productID, from)
	}

	if product.Status == "Sold" {
		return fmt.Errorf("product %s is already marked as sold", productID)
	}

	product.CurrentOwner = to

	productJSON, err := json.Marshal(product)
	if err != nil {
		return err
	}

	return ctx.GetStub().PutState(productID, productJSON)
}

// VerifyProduct returns product details recursively
func (s *SmartContract) VerifyProduct(ctx contractapi.TransactionContextInterface, productID string) (*Product, error) {
	productJSON, err := ctx.GetStub().GetState(productID)
	if err != nil {
		return nil, fmt.Errorf("failed to read from world state: %v", err)
	}
	if productJSON == nil {
		return nil, fmt.Errorf("the product %s does not exist", productID)
	}

	var product Product
	err = json.Unmarshal(productJSON, &product)
	if err != nil {
		return nil, err
	}

	return &product, nil
}

// MarkProductSold marks product as sold by retailer.
func (s *SmartContract) MarkProductSold(ctx contractapi.TransactionContextInterface, productID string) error {
	product, err := s.VerifyProduct(ctx, productID)
	if err != nil {
		return err
	}

	if product.Status == "Sold" {
		return fmt.Errorf("product %s is already marked as sold", productID)
	}

	product.Status = "Sold"
	product.CurrentOwner = "Consumer"

	productJSON, err := json.Marshal(product)
	if err != nil {
		return err
	}

	return ctx.GetStub().PutState(productID, productJSON)
}

// GetProductHistory returns full transaction history.
func (s *SmartContract) GetProductHistory(ctx contractapi.TransactionContextInterface, productID string) ([]HistoryQueryResult, error) {
	resultsIterator, err := ctx.GetStub().GetHistoryForKey(productID)
	if err != nil {
		return nil, err
	}
	defer resultsIterator.Close()

	var records []HistoryQueryResult
	for resultsIterator.HasNext() {
		response, err := resultsIterator.Next()
		if err != nil {
			return nil, err
		}

		var product Product
		if len(response.Value) > 0 {
			err = json.Unmarshal(response.Value, &product)
			if err != nil {
				return nil, err
			}
		}

		record := HistoryQueryResult{
			TxId:      response.TxId,
			Timestamp: time.Unix(response.Timestamp.Seconds, int64(response.Timestamp.Nanos)).String(),
			Record:    &product,
			IsDelete:  response.IsDelete,
		}
		records = append(records, record)
	}

	return records, nil
}

// ProductExists returns true when product with given ID exists in world state
func (s *SmartContract) ProductExists(ctx contractapi.TransactionContextInterface, productID string) (bool, error) {
	productBytes, err := ctx.GetStub().GetState(productID)
	if err != nil {
		return false, fmt.Errorf("failed to read product %s from world state. %v", productID, err)
	}

	return productBytes != nil, nil
}

func main() {
	chaincode, err := contractapi.NewChaincode(&SmartContract{})
	if err != nil {
		log.Panicf("Error creating product chaincode: %v", err)
	}

	if err := chaincode.Start(); err != nil {
		log.Panicf("Error starting product chaincode: %v", err)
	}
}
