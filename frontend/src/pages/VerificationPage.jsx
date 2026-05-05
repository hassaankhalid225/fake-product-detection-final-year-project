import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { 
  FiSearch, FiCamera, FiShield, FiAlertTriangle, 
  FiCheckCircle, FiClock, FiArrowLeft, FiMapPin, 
  FiUser, FiActivity, FiFlag, FiInfo 
} from 'react-icons/fi';

const VerificationPage = () => {
    const { serialNumber } = useParams();
    const navigate = useNavigate();
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
    const [manualId, setManualId] = useState('');
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [history, setHistory] = useState([]);
    const [isScanning, setIsScanning] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportDetails, setReportDetails] = useState('');
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
                    const segments = decodedText.split('/');
                    const scannedId = segments[segments.length - 1];
                    navigate(`/verify/${scannedId}`);
                },
                (err) => {}
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
            const res = await axios.post(`${API_BASE_URL}/api/verify/${id}`);
            setResult(res.data);
            setError('');
        } catch (err) {
            setResult(null);
            setError(err.response?.data?.msg || "Unregistered Product Found. This item was not found on the VeriChain Blockchain.");
        } finally {
            setIsVerifying(false);
        }
    };

    const fetchHistory = async (id) => {
        try {
            const res = await axios.get(`${API_BASE_URL}/productHistory/${id}`);
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

    // --- FYP SPECIAL: Fraud Detection Logic ---
    const handleReportSubmit = async (e) => {
        e.preventDefault();
        if (!reportDetails.trim()) return;
        
        try {
            await axios.post(`${API_BASE_URL}/api/reports`, {
                serialNumber: result?.product?.serialNumber || serialNumber,
                productName: result?.product?.productName || 'Unknown Product',
                details: reportDetails
            });
            setShowReportModal(false);
            setReportDetails('');
            alert('REPORT SUBMITTED: Our security team will investigate this asset.');
        } catch (err) {
            console.error('Report submission failed:', err);
            alert('SYSTEM ERROR: Could not submit report. Please try again.');
        }
    };

    const calculateRisk = () => {
        if (!result) return { score: 100, level: 'HIGH', color: 'var(--error)' };
        
        let riskScore = 0;
        const scanCount = history.length;
        
        // 1. Scan Frequency Check
        if (scanCount > 5) riskScore += 40;
        else if (scanCount > 2) riskScore += 20;

        // 2. Ownership Continuity
        if (result.product.status === 'In Transit') riskScore += 10;

        if (riskScore >= 40) return { score: riskScore, level: 'CRITICAL', color: 'var(--error)' };
        if (riskScore >= 20) return { score: riskScore, level: 'MEDIUM', color: 'var(--warning)' };
        return { score: riskScore, level: 'LOW', color: 'var(--success)' };
    };

    const risk = calculateRisk();

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
            
            {/* Navigation */}
            <div style={{ marginBottom: '32px' }}>
                <button onClick={() => navigate('/')} className="btn-secondary" style={{ padding: '8px 16px', border: 'none' }}>
                    <FiArrowLeft /> BACK
                </button>
            </div>

            {!serialNumber ? (
                <div className="glass-panel" style={{ textAlign: 'center', padding: '60px 40px' }}>
                    <FiShield size={80} color="var(--primary)" style={{ marginBottom: '24px' }} className="pulse" />
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '16px' }}>VERICHAIN SCANNER</h1>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '40px', fontSize: '1.1rem' }}>
                        Ensure product authenticity using Immutable Ledger Technology.
                    </p>

                    <form onSubmit={handleManualVerify} style={{ maxWidth: '500px', margin: '0 auto 32px' }}>
                        <div style={{ position: 'relative' }}>
                            <FiSearch style={{ position: 'absolute', left: '16px', top: '20px', color: 'var(--text-secondary)' }} />
                            <input 
                                type="text" 
                                placeholder="ENTER PRODUCT SERIAL NUMBER..." 
                                value={manualId}
                                onChange={(e) => setManualId(e.target.value)}
                                style={{ paddingLeft: '48px', marginBottom: '12px' }}
                            />
                        </div>
                        <button className="btn btn-primary" type="submit" style={{ width: '100%' }}>
                            VERIFY AUTHENTICITY
                        </button>
                    </form>

                    <div style={{ margin: '24px 0', color: 'var(--surface-border)' }}>──────── OR ────────</div>

                    {!isScanning ? (
                        <button className="btn btn-accent" onClick={initializeScanner} style={{ width: '100%', maxWidth: '500px', margin: '0 auto' }}>
                            <FiCamera /> OPEN CAMERA SCANNER
                        </button>
                    ) : (
                        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
                            <div id="reader" style={{ borderRadius: '12px', overflow: 'hidden', border: '2px solid var(--primary)', marginBottom: '16px' }}></div>
                            <button className="btn btn-secondary" onClick={stopScanner} style={{ width: '100%' }}>
                                CLOSE SCANNER
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="animate-fade-in">
                    {isVerifying ? (
                        <div className="glass-panel flex-center" style={{ minHeight: '400px', flexDirection: 'column', gap: '20px' }}>
                            <div className="loader"></div>
                            <h2 style={{ letterSpacing: '0.2em' }}>QUERYING BLOCKCHAIN...</h2>
                        </div>
                    ) : error ? (
                        <div className="glass-panel" style={{ border: '2px solid var(--error)', padding: '60px 40px', textAlign: 'center' }}>
                            <FiAlertTriangle size={80} color="var(--error)" style={{ marginBottom: '24px' }} />
                            <h1 style={{ color: 'var(--error)', fontSize: '2.5rem', marginBottom: '16px' }}>COUNTERFEIT DETECTED</h1>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '1.1rem' }}>{error}</p>
                            <button className="btn btn-primary" onClick={() => setShowReportModal(true)}>
                                <FiFlag /> REPORT FRAUD TO MANUFACTURER
                            </button>
                        </div>
                    ) : result && (
                        <div>
                            {result.product.status === 'Recalled' && (
                                <div style={{ 
                                    padding: '24px', 
                                    background: 'rgba(239, 68, 68, 0.15)', 
                                    border: '2px solid #EF4444', 
                                    borderRadius: '12px', 
                                    marginBottom: '32px',
                                    textAlign: 'center',
                                    animation: 'pulse-primary 2s infinite'
                                }}>
                                    <FiAlertTriangle size={48} color="#EF4444" style={{ marginBottom: '16px' }} />
                                    <h2 style={{ color: '#EF4444', marginBottom: '8px', letterSpacing: '0.1em' }}>OFFICIAL BATCH RECALL</h2>
                                    <p style={{ color: '#fff', fontSize: '1rem', maxWidth: '600px', margin: '0 auto' }}>
                                        This product is authentic but has been <strong>OFFICIALLY RECALLED</strong> by the manufacturer. 
                                        Please contact support for a replacement or refund.
                                    </p>
                                </div>
                            )}
                            {/* Hero Status */}
                            <div className="glass-panel" style={{ borderLeft: `8px solid ${result.riskProfile?.trustScore < 50 ? 'var(--error)' : 'var(--success)'}`, marginBottom: '32px', position: 'relative', overflow: 'hidden' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                            <FiShield color={result.riskProfile?.trustScore < 50 ? 'var(--error)' : 'var(--success)'} size={24} />
                                            <span style={{ color: result.riskProfile?.trustScore < 50 ? 'var(--error)' : 'var(--success)', fontWeight: 'bold', fontSize: '1.2rem' }}>
                                                {result.riskProfile?.trustScore < 50 ? 'SUSPICIOUS ASSET' : 'AUTHENTIC PRODUCT'}
                                            </span>
                                        </div>
                                        <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>{result.product.productName}</h1>
                                        <p style={{ color: 'var(--text-secondary)' }}>ID: {serialNumber}</p>
                                    </div>
                                    <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '12px', border: '1px solid var(--surface-border)' }}>
                                        <div style={{ fontSize: '1.8rem', fontWeight: 900, color: result.riskProfile?.trustScore < 50 ? 'var(--error)' : 'var(--success)' }}>
                                            {result.riskProfile?.trustScore}%
                                        </div>
                                        <div style={{ fontSize: '0.6rem', letterSpacing: '0.2em', opacity: 0.6 }}>TRUST SCORE</div>
                                    </div>
                                </div>
                            </div>

                            {result.riskProfile?.anomalyDetected && (
                                <div style={{ padding: '24px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #EF4444', borderRadius: '12px', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                                    <FiAlertCircle color="#EF4444" size={32} />
                                    <div>
                                        <h3 style={{ color: '#EF4444', fontSize: '1rem', marginBottom: '4px' }}>SECURITY ANOMALY DETECTED</h3>
                                        <p style={{ fontSize: '0.85rem', opacity: 0.8 }}>Reason: {result.riskProfile.anomalyReason}</p>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-2" style={{ gap: '32px', marginBottom: '32px' }}>
                                <div className="glass-panel">
                                    <h3 style={{ fontSize: '1.1rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <FiActivity color="var(--primary)" /> FRAUD INTELLIGENCE
                                    </h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        <div className="flex-between">
                                            <span style={{ opacity: 0.7 }}>Total Network Scans</span>
                                            <span style={{ fontWeight: 800 }}>{result.riskProfile?.scanCount}</span>
                                        </div>
                                        <div className="flex-between">
                                            <span style={{ opacity: 0.7 }}>Geographic Footprint</span>
                                            <span style={{ fontWeight: 800 }}>{result.riskProfile?.uniqueLocations} Unique IPs</span>
                                        </div>
                                        <div className="flex-between">
                                            <span style={{ opacity: 0.7 }}>Market Integrity</span>
                                            <span style={{ color: 'var(--success)', fontWeight: 800 }}>SECURED</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="glass-panel">
                                    <h3 style={{ fontSize: '1.1rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <FiShield color="var(--accent)" /> LEDGER VERIFICATION
                                    </h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        <div style={{ padding: '16px', background: 'rgba(0,0,0,0.3)', borderRadius: '10px', border: '1px solid var(--surface-border)' }}>
                                            <p style={{ fontSize: '0.65rem', opacity: 0.5, marginBottom: '8px' }}>BLOCKCHAIN TX ID</p>
                                            <p style={{ fontFamily: 'JetBrains Mono', fontSize: '0.75rem', color: 'var(--accent)', wordBreak: 'break-all' }}>
                                                {result.product.blockchainTxId}
                                            </p>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)', boxShadow: '0 0 10px var(--success)' }}></div>
                                            <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>Identity confirmed on decentralized node clusters.</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Supply Chain Journey */}
                            <div className="glass-panel" style={{ marginBottom: '32px' }}>
                                <h3 style={{ fontSize: '1.2rem', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <FiMapPin color="var(--primary)" /> SUPPLY CHAIN JOURNEY
                                </h3>
                                
                                <div className="timeline">
                                    {history.length > 0 ? (
                                        history.map((h, i) => (
                                            <div key={i} className={`timeline-item ${i === 0 ? 'active' : ''}`}>
                                                <div className="timeline-dot"></div>
                                                <div style={{ paddingBottom: '10px' }}>
                                                    <div className="flex-between">
                                                        <h4 style={{ fontSize: '1.1rem', margin: 0 }}>{h.status}</h4>
                                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                                            <FiClock /> {h.timestamp}
                                                        </span>
                                                    </div>
                                                    <div style={{ marginTop: '12px', background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px' }}>
                                                        <p style={{ margin: 0, fontSize: '0.9rem' }}>
                                                            <FiUser size={12} /> <span style={{ color: 'var(--text-secondary)' }}>TRANSFER:</span> {h.previousOwner || 'ORIGIN'} → {h.newOwner}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>
                                            Genesis block data only. No transfer history found.
                                        </div>
                                    )}
                                </div>
                            </div>

                            <button className="btn btn-secondary" style={{ width: '100%', gap: '12px' }} onClick={() => setShowReportModal(true)}>
                                <FiFlag /> SUSPECT FRAUD? REPORT THIS PRODUCT
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Report Modal */}
            {showReportModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <div className="glass-panel" style={{ maxWidth: '500px', width: '100%', position: 'relative' }}>
                        <h2 style={{ marginBottom: '16px', color: 'var(--error)' }}>Report Counterfeit</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
                            Your report will be sent directly to the manufacturer and the regulatory body. Please provide details.
                        </p>
                        <textarea 
                            value={reportDetails}
                            onChange={(e) => setReportDetails(e.target.value)}
                            placeholder="Describe the issue (e.g., packaging looks tampered, purchased from unauthorized seller)..."
                            style={{ width: '100%', height: '120px', background: '#000', border: '1px solid var(--surface-border)', color: '#fff', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}
                        ></textarea>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleReportSubmit}>SUBMIT REPORT</button>
                            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowReportModal(false)}>CANCEL</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VerificationPage;

