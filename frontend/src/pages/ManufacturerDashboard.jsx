import React, { useState } from 'react';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';
import BlockchainStatus from '../components/BlockchainStatus';

const ManufacturerDashboard = () => {
    const [formData, setFormData] = useState({
        productID: '',
        name: '',
        manufacturer: '',
        batch: '',
        manufactureDate: '',
        description: ''
    });
    const [createdProduct, setCreatedProduct] = useState(null);
    const [history, setHistory] = useState([]);
    const [queryID, setQueryID] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const registerProduct = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:5000/registerProduct', formData);
            alert(res.data.message);
            setCreatedProduct(formData.productID);
        } catch (err) {
            alert(err.response?.data?.msg || err.message);
        }
    };

    const fetchHistory = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/productHistory/${queryID}`);
            setHistory(res.data.history || []);
        } catch (err) {
            alert(err.response?.data?.msg || err.message);
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2>Manufacturer Dashboard</h2>
            <BlockchainStatus />
            <hr />
            <div style={{ display: 'flex', gap: '40px', marginTop: '20px' }}>
                <div style={{ flex: 1 }}>
                    <h3>Register New Product</h3>
                    <form onSubmit={registerProduct} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <input name="productID" placeholder="Product ID" onChange={handleChange} required />
                        <input name="name" placeholder="Product Name" onChange={handleChange} required />
                        <input name="manufacturer" placeholder="Manufacturer Name" onChange={handleChange} required />
                        <input name="batch" placeholder="Batch Number" onChange={handleChange} required />
                        <input type="date" name="manufactureDate" placeholder="Manufacture Date" onChange={handleChange} required />
                        <input name="description" placeholder="Description" onChange={handleChange} required />
                        <button type="submit">Register Product</button>
                    </form>

                    {createdProduct && (
                        <div style={{ marginTop: '20px', padding: '20px', border: '1px solid #ccc' }}>
                            <h4>Product QR Code Generated</h4>
                            <QRCodeSVG value={`http://localhost:5173/verify/${createdProduct}`} size={128} />
                            <p>Product ID: {createdProduct}</p>
                        </div>
                    )}
                </div>

                <div style={{ flex: 1 }}>
                    <h3>Track Product History</h3>
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                        <input placeholder="Enter Product ID to track" value={queryID} onChange={(e) => setQueryID(e.target.value)} />
                        <button onClick={fetchHistory}>View History</button>
                    </div>
                    {history.length > 0 && (
                        <ul>
                            {history.map((h, i) => (
                                <li key={i} style={{ marginBottom: '10px' }}>
                                    <strong>Time:</strong> {h.timestamp} <br />
                                    <strong>From:</strong> {h.previousOwner} | <strong>To:</strong> {h.newOwner} <br />
                                    <strong>Status:</strong> {h.status}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManufacturerDashboard;
