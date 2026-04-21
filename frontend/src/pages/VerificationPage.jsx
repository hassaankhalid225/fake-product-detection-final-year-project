import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { FiSearch, FiCamera, FiShield, FiAlertTriangle, FiCheckCircle, FiClock, FiArrowLeft } from 'react-icons/fi';

const VerificationPage = () => {
    const { serialNumber } = useParams();
    const navigate = useNavigate();
    const [manualId, setManualId] = useState('');
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [history, setHistory] = useState([]);
    const [isScanning, setIsScanning] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const scannerRef = useRef(null);

    useEffect(() => {
        if (serialNumber) {
            verifyProduct(serialNumber);
            fetchHistory(serialNumber);
            setIsScanning(false);
        }
    }, [serialNumber]);

    const initializeScanner = () => {
        setIsScanning(true);
        setTimeout(() => {
            const scanner = new Html5QrcodeScanner("reader", { 
                fps: 10, 
                qrbox: { width: 250, height: 250 },
                aspectRatio: 1.0
            });
            
            scanner.render(
                (decodedText) => {
                    scanner.clear().catch(err => console.error("Scanner clear error:", err));
                    setIsScanning(false);
                    // Extract ID from URL if necessary
                    const segments = decodedText.split('/');
                    const scannedId = segments[segments.length - 1];
                    navigate(`/verify/${scannedId}`);
                },
                (err) => {
                    // console.warn(err);
                }
            );
            scannerRef.current = scanner;
        }, 100);
    };

    const stopScanner = () => {
        if (scannerRef.current) {
            scannerRef.current.clear().catch(err => console.error(err));
            scannerRef.current = null;
        }
        setIsScanning(false);
    };

    const verifyProduct = async (id) => {
        setIsVerifying(true);
        try {
            const res = await axios.get(`http://localhost:5000/verifyProduct/${id}`);
            setResult(res.data);
            setError('');
        } catch (err) {
            setResult(null);
            setError(err.response?.data?.msg || "Product verification failed. It may not be registered on the blockchain.");
        } finally {
            setIsVerifying(false);
        }
    };

    const fetchHistory = async (id) => {
        try {
            const res = await axios.get(`http://localhost:5000/productHistory/${id}`);
            setHistory(res.data.history || []);
        } catch (err) {
            console.error("History fetch error:", err);
        }
    };

    const handleManualVerify = (e) => {
        e.preventDefault();
        if (manualId.trim()) {
            navigate(`/verify/${manualId.trim()}`);
        }
    };

    return (
        <div className="flex-center" style={{ minHeight: '80vh', padding: '20px' }}>
            <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '600px', padding: '40px' }}>
                
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div className="flex-center" style={{ marginBottom: '16px' }}>
                        <FiShield size={48} color="var(--primary)" />
                    </div>
                    <h1 className="heading" style={{ fontSize: '2rem', margin: 0 }}>VeriChain Scanner</h1>
                    <p className="subheading" style={{ margin: '8px 0 0' }}>
                        Verify your product's authenticity via Blockchain
                    </p>
                </div>

                {!serialNumber ? (
                    <div className="animate-fade-in">
                        {/* Manual Input Section */}
                        <form onSubmit={handleManualVerify}>
                            <label htmlFor="serialNumber">Enter Serial Number</label>
                            <div style={{ position: 'relative' }}>
                                <input 
                                    id="serialNumber"
                                    type="text" 
                                    placeholder="e.g. PRD-12345..." 
                                    value={manualId}
                                    onChange={(e) => setManualId(e.target.value)}
                                    style={{ paddingLeft: '44px' }}
                                />
                                <FiSearch 
                                    style={{ position: 'absolute', left: '16px', top: '24px', color: 'var(--text-secondary)' }} 
                                />
                            </div>
                            <button className="btn" type="submit" style={{ width: '100%', marginTop: '8px' }}>
                                Verify Product
                            </button>
                        </form>

                        <div className="flex-center" style={{ margin: '24px 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                            <div style={{ height: '1px', flex: 1, background: 'var(--surface-border)' }}></div>
                            <span style={{ margin: '0 16px' }}>OR</span>
                            <div style={{ height: '1px', flex: 1, background: 'var(--surface-border)' }}></div>
                        </div>

                        {/* QR Section */}
                        {!isScanning ? (
                            <button 
                                className="btn btn-secondary flex-center" 
                                onClick={initializeScanner}
                                style={{ width: '100%', gap: '10px' }}
                            >
                                <FiCamera size={20} />
                                Scan QR Code
                            </button>
                        ) : (
                            <div className="animate-fade-in">
                                <div id="reader" style={{ overflow: 'hidden', borderRadius: '12px', marginBottom: '16px' }}></div>
                                <button className="btn btn-secondary" onClick={stopScanner} style={{ width: '100%' }}>
                                    Cancel Scanning
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="animate-fade-in">
                        {/* Results Section */}
                        <div style={{ marginBottom: '24px' }}>
                            <button 
                                className="btn-secondary" 
                                onClick={() => navigate('/')} 
                                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', fontSize: '0.9rem', border: 'none' }}
                            >
                                <FiArrowLeft /> Back to home
                            </button>
                        </div>

                        {isVerifying ? (
                            <div style={{ textAlign: 'center', padding: '40px' }}>
                                <div className="loader"></div>
                                <p>Verifying authenticity...</p>
                            </div>
                        ) : error ? (
                            <div style={{ textAlign: 'center', padding: '24px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--error)' }}>
                                <FiAlertTriangle size={48} color="var(--error)" style={{ marginBottom: '16px' }} />
                                <h3 style={{ color: 'var(--error)', marginBottom: '8px' }}>Counterfeit Warning</h3>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>{error}</p>
                            </div>
                        ) : result && (
                            <div>
                                <div style={{ textAlign: 'center', padding: '24px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--success)', marginBottom: '24px' }}>
                                    <FiCheckCircle size={48} color="var(--success)" style={{ marginBottom: '16px' }} />
                                    <h3 style={{ color: 'var(--success)', marginBottom: '4px' }}>Authentic Product</h3>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Verified on Immutable Ledger</p>
                                </div>

                                <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
                                    <h4 style={{ marginBottom: '16px', fontSize: '1.1rem', borderBottom: '1px solid var(--surface-border)', paddingBottom: '12px' }}>Product Specifications</h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '12px', fontSize: '0.95rem' }}>
                                        <span style={{ color: 'var(--text-secondary)' }}>Name:</span>
                                        <span>{result.product.productName || result.product.name}</span>
                                        
                                        <span style={{ color: 'var(--text-secondary)' }}>Manufacturer:</span>
                                        <span>{result.product.manufacturer || result.product.company}</span>
                                        
                                        <span style={{ color: 'var(--text-secondary)' }}>Batch:</span>
                                        <span>{result.product.batchNumber || result.product.batch}</span>
                                        
                                        <span style={{ color: 'var(--text-secondary)' }}>Current Owner:</span>
                                        <span>{result.product.currentOwner || 'N/A'}</span>

                                        <span style={{ color: 'var(--text-secondary)' }}>Status:</span>
                                        <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{result.product.status}</span>
                                    </div>
                                </div>

                                {history.length > 0 && (
                                    <div>
                                        <h4 style={{ marginBottom: '16px', paddingLeft: '8px' }}>Supply Chain History</h4>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                            {history.map((h, i) => (
                                                <div key={i} className="animate-fade-in" style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--surface-border)', position: 'relative' }}>
                                                    <div className="flex-between" style={{ marginBottom: '8px' }}>
                                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                            <FiClock /> {h.timestamp}
                                                        </span>
                                                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary)' }}>{h.status}</span>
                                                    </div>
                                                    <div style={{ fontSize: '0.9rem' }}>
                                                        <p style={{ margin: 0 }}><span style={{ color: 'var(--text-secondary)' }}>From:</span> {h.previousOwner}</p>
                                                        <p style={{ margin: 0 }}><span style={{ color: 'var(--text-secondary)' }}>To:</span> {h.newOwner}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default VerificationPage;
