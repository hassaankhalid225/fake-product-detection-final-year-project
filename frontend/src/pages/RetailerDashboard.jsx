import React, { useState } from 'react';
import axios from 'axios';

const RetailerDashboard = () => {
    const [productID, setProductID] = useState('');

    const markSold = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:5000/markProductSold', { productID });
            alert(res.data.message);
        } catch (err) {
            alert(err.response?.data?.msg || err.message);
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2>Retailer Dashboard</h2>
            <hr />
            <div style={{ marginTop: '20px', maxWidth: '400px' }}>
                <h3>Mark Product as Sold</h3>
                <p>This prevents the product from being transferred again.</p>
                <form onSubmit={markSold} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <input placeholder="Product ID" value={productID} onChange={(e) => setProductID(e.target.value)} required />
                    <button type="submit">Mark as Sold (Consumer purchase)</button>
                </form>
            </div>
        </div>
    );
};

export default RetailerDashboard;
