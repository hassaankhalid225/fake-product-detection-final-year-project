import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';
import { FiPlus, FiBox, FiHash, FiCalendar, FiLayers, FiInfo, FiCopy, FiShield } from 'react-icons/fi';

const ProductManagement = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        productName: '',
        serialNumber: '',
        batchNumber: '',
        manufacturingDate: '',
        quantity: '',
        description: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/products`);
            setProducts(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setMessage({ type: '', text: '' });

        try {
            const res = await axios.post(`${API_BASE_URL}/api/products`, formData);
            setMessage({ type: 'success', text: `PRODUCT SECURED ON BLOCKCHAIN | TX: ${res.data.blockchainTxId.substring(0, 15)}...` });
            setFormData({ productName: '', serialNumber: '', batchNumber: '', manufacturingDate: '', quantity: '', description: '' });
            fetchProducts();
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.msg || 'BLOCKCHAIN REGISTRATION FAILED' });
        } finally {
            setSubmitting(false);
        }
    };

    const getVerificationUrl = (serialNumber) => `${window.location.origin}/verify/${serialNumber}`;

    return (
        <div className="animate-fade-in" style={{ width: '100%' }}>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '0.1em', marginBottom: '8px' }}>PRODUCT INVENTORY</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '48px', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
                Secure Ledger Registration & QR Management
            </p>

            <div className="grid grid-2">
                {/* Form Column */}
                <div className="glass-panel" style={{ height: 'fit-content' }}>
                    <h2 style={{ marginBottom: '32px', fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <FiPlus color="var(--primary)" /> NEW REGISTRATION
                    </h2>

                    {message.text && (
                        <div style={{
                            backgroundColor: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(225, 29, 72, 0.1)',
                            border: `1px solid ${message.type === 'success' ? 'var(--success)' : 'var(--error)'}`,
                            color: message.type === 'success' ? 'var(--success)' : 'var(--error)',
                            padding: '16px', borderRadius: '8px', marginBottom: '24px', fontSize: '0.8rem', fontWeight: 700
                        }}>
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-2" style={{ gap: '20px', marginBottom: '20px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>PRODUCT NAME</label>
                                <input type="text" name="productName" value={formData.productName} onChange={handleChange} required placeholder="e.g. Rolex Submariner" />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>SERIAL NUMBER</label>
                                <input type="text" name="serialNumber" value={formData.serialNumber} onChange={handleChange} required placeholder="UNIQUE ID" />
                            </div>
                        </div>

                        <div className="grid grid-2" style={{ gap: '20px', marginBottom: '20px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>BATCH NUMBER</label>
                                <input type="text" name="batchNumber" value={formData.batchNumber} onChange={handleChange} required placeholder="BATCH-001" />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>MFG DATE</label>
                                <input type="date" name="manufacturingDate" value={formData.manufacturingDate} onChange={handleChange} required />
                            </div>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>QUANTITY</label>
                            <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} required placeholder="1000" />
                        </div>

                        <div style={{ marginBottom: '32px' }}>
                            <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>DESCRIPTION</label>
                            <textarea 
                                name="description" 
                                value={formData.description} 
                                onChange={handleChange} 
                                rows="3" 
                                required
                                style={{ width: '100%', background: '#000', border: '1px solid var(--surface-border)', color: '#fff', padding: '16px', borderRadius: '8px', fontSize: '1rem' }}
                                placeholder="Product specifications and details..."
                            ></textarea>
                        </div>

                        <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '18px' }} disabled={submitting}>
                            {submitting ? 'COMMITTING TO LEDGER...' : 'REGISTER PRODUCT'}
                        </button>
                    </form>
                </div>

                {/* List Column */}
                <div className="glass-panel" style={{ overflowY: 'auto', maxHeight: '780px' }}>
                    <h2 style={{ marginBottom: '32px', fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <FiLayers color="var(--primary)" /> REGISTERED ASSETS
                    </h2>

                    {loading ? <div className="loader"></div> : products.length === 0 ? (
                        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '40px' }}>No assets registered on this node.</p>
                    ) : (
                        products.map((product) => (
                            <div
                                key={product._id}
                                className="glass-panel"
                                style={{
                                    padding: '24px',
                                    marginBottom: '20px',
                                    display: 'flex',
                                    gap: '24px',
                                    alignItems: 'center',
                                    background: 'rgba(0,0,0,0.3)',
                                    border: '1px solid var(--surface-border)'
                                }}
                            >
                                <div style={{ backgroundColor: 'white', padding: '12px', borderRadius: '8px', flexShrink: 0 }}>
                                    <QRCodeSVG value={getVerificationUrl(product.serialNumber)} size={110} />
                                </div>

                                <div style={{ flex: 1 }}>
                                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '12px', color: 'var(--primary)', letterSpacing: '0.05em' }}>
                                        {(product.productName || 'UNNAMED PRODUCT').toUpperCase()}
                                    </h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem' }}>
                                        <div className="flex-between">
                                            <span style={{ color: 'var(--text-secondary)' }}><FiHash size={12} /> SERIAL:</span>
                                            <span style={{ fontWeight: 700 }}>{product.serialNumber || 'N/A'}</span>
                                        </div>
                                        <div className="flex-between">
                                            <span style={{ color: 'var(--text-secondary)' }}><FiBox size={12} /> BATCH:</span>
                                            <span style={{ fontWeight: 700 }}>{product.batchNumber || 'N/A'}</span>
                                        </div>
                                        <div className="flex-between">
                                            <span style={{ color: 'var(--text-secondary)' }}><FiCalendar size={12} /> MFG:</span>
                                            <span style={{ fontWeight: 700 }}>{product.manufacturingDate || 'N/A'}</span>
                                        </div>
                                        
                                        <div style={{
                                            marginTop: '12px',
                                            padding: '8px',
                                            background: 'rgba(37, 99, 235, 0.1)',
                                            color: 'var(--accent)',
                                            borderRadius: '4px',
                                            fontSize: '0.65rem',
                                            fontWeight: 700,
                                            border: '1px solid rgba(37, 99, 235, 0.2)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px'
                                        }}>
                                            <FiShield size={10} /> BLOCKCHAIN HASH: {product.hash ? `${product.hash.substring(0, 15)}...` : 'PENDING'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductManagement;

