import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiLink, FiLink2, FiAlertCircle } from 'react-icons/fi';

const BlockchainStatus = () => {
    const [status, setStatus] = useState({ connected: false, loading: true });

    useEffect(() => {
        const checkStatus = async () => {
            try {
                const res = await axios.get('http://localhost:5000/blockchain-status');
                setStatus({ ...res.data, loading: false });
            } catch (err) {
                setStatus({ connected: false, loading: false, error: 'Backend unreachable' });
            }
        };
        checkStatus();
        const interval = setInterval(checkStatus, 10000); // Check every 10s
        return () => clearInterval(interval);
    }, []);

    if (status.loading) return <div className="status-badge loading">Checking Blockchain...</div>;

    return (
        <div className={`status-badge ${status.connected ? 'connected' : 'disconnected'}`} 
             title={status.contractAddress ? `Contract: ${status.contractAddress}` : status.error}>
            {status.connected ? (
                <>
                    <FiLink style={{ marginRight: '8px' }} />
                    Blockchain Active
                </>
            ) : (
                <>
                    <FiAlertCircle style={{ marginRight: '8px' }} />
                    Blockchain Offline
                </>
            )}
            <style jsx>{`
                .status-badge {
                    display: inline-flex;
                    align-items: center;
                    padding: 6px 12px;
                    border-radius: 20px;
                    font-size: 0.85rem;
                    font-weight: 600;
                    margin-bottom: 16px;
                }
                .connected {
                    background: rgba(16, 185, 129, 0.15);
                    color: #10b981;
                    border: 1px solid rgba(16, 185, 129, 0.3);
                }
                .disconnected {
                    background: rgba(239, 68, 68, 0.15);
                    color: #ef4444;
                    border: 1px solid rgba(239, 68, 68, 0.3);
                }
                .loading {
                    background: rgba(255, 255, 255, 0.05);
                    color: #94a3b8;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }
            `}</style>
        </div>
    );
};

export default BlockchainStatus;
