import React, { useState } from 'react';
import axios from 'axios';

const DistributorDashboard = () => {
    const [productID, setProductID] = useState('');
    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');

    const transferProduct = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:5000/transferProduct', { productID, from, to });
            alert(res.data.message);
        } catch (err) {
            alert(err.response?.data?.msg || err.message);
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2>Distributor Dashboard</h2>
            <hr />
            <div style={{ marginTop: '20px', maxWidth: '400px' }}>
                <h3>Transfer Product</h3>
                <p>Record a change of ownership in the supply chain.</p>
                <form onSubmit={transferProduct} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <input placeholder="Product ID" value={productID} onChange={(e) => setProductID(e.target.value)} required />
                    <input placeholder="Current Owner (From)" value={from} onChange={(e) => setFrom(e.target.value)} required />
                    <input placeholder="New Owner (To)" value={to} onChange={(e) => setTo(e.target.value)} required />
                    <button type="submit">Transfer Product</button>
                </form>
            </div>
        </div>
    );
};

export default DistributorDashboard;
