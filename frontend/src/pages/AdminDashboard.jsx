import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { FiBox, FiActivity, FiAlertCircle, FiDatabase, FiClock, FiFlag, FiAlertTriangle } from 'react-icons/fi';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AdminDashboard = () => {
    const [stats, setStats] = useState({ 
        totalProducts: 0, 
        totalVerifications: 0, 
        fakeAttempts: 0, 
        totalReports: 0,
        recentLogs: [],
        recentReports: []
    });
    const [loading, setLoading] = useState(true);
    const [recallSerial, setRecallSerial] = useState('');

    useEffect(() => {
        fetchStats();
    }, []);

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

    const fetchStats = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/analytics/stats`);
            setStats(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleRecall = async () => {
        if (!recallSerial) return;
        try {
            await axios.post(`${API_BASE_URL}/api/products/recall`, { serialNumber: recallSerial });
            alert(`ASSET ${recallSerial} RECALLED ON BLOCKCHAIN`);
            setRecallSerial('');
            fetchStats();
        } catch (err) {
            alert('Recall failed. Verify serial number.');
        }
    };

    if (loading) return (
        <div className="flex-center" style={{ minHeight: '400px' }}>
            <div className="loader"></div>
        </div>
    );

    const doughnutData = {
        labels: ['VERIFIED ORIGINALS', 'FRAUD ATTEMPTS'],
        datasets: [
            {
                data: [stats.totalVerifications - stats.fakeAttempts, stats.fakeAttempts],
                backgroundColor: ['rgba(16, 185, 129, 0.8)', 'rgba(225, 29, 72, 0.8)'],
                borderColor: ['#10B981', '#E11D48'],
                borderWidth: 2,
            },
        ],
    };

    return (
        <div className="animate-fade-in" style={{ width: '100%' }}>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '0.1em', marginBottom: '8px' }}>ADMIN ANALYTICS</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '48px', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
                System-wide integrity & blockchain status
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', marginBottom: '48px' }}>
                <div className="glass-panel" style={{ borderLeft: '4px solid var(--primary)' }}>
                    <div className="flex-between" style={{ marginBottom: '16px' }}>
                        <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Assets</h3>
                        <FiBox color="var(--primary)" />
                    </div>
                    <p style={{ fontSize: '2.5rem', fontWeight: 800 }}>{stats.totalProducts}</p>
                </div>

                <div className="glass-panel" style={{ borderLeft: '4px solid var(--accent)' }}>
                    <div className="flex-between" style={{ marginBottom: '16px' }}>
                        <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Verifications</h3>
                        <FiDatabase color="var(--accent)" />
                    </div>
                    <p style={{ fontSize: '2.5rem', fontWeight: 800 }}>{stats.totalVerifications}</p>
                </div>

                <div className="glass-panel" style={{ borderLeft: '4px solid var(--error)' }}>
                    <div className="flex-between" style={{ marginBottom: '16px' }}>
                        <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Fraud Intercepted</h3>
                        <FiAlertCircle color="var(--error)" />
                    </div>
                    <p style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--error)' }}>{stats.fakeAttempts}</p>
                </div>

                <div className="glass-panel" style={{ borderLeft: '4px solid #F59E0B' }}>
                    <div className="flex-between" style={{ marginBottom: '16px' }}>
                        <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase' }}>User Reports</h3>
                        <FiFlag color="#F59E0B" />
                    </div>
                    <p style={{ fontSize: '2.5rem', fontWeight: 800, color: '#F59E0B' }}>{stats.totalReports}</p>
                </div>
            </div>

            <div className="grid-2 grid" style={{ marginBottom: '24px' }}>
                <div className="glass-panel">
                    <h2 style={{ marginBottom: '32px', fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <FiActivity color="var(--primary)" /> NETWORK HEALTH
                    </h2>
                    <div style={{ maxWidth: '280px', margin: '0 auto' }}>
                        <Doughnut
                            data={doughnutData}
                            options={{ 
                                maintainAspectRatio: true, 
                                plugins: { 
                                    legend: { 
                                        position: 'bottom', 
                                        labels: { color: '#94A3B8', font: { family: 'JetBrains Mono', size: 10 } } 
                                    } 
                                } 
                            }}
                        />
                    </div>
                </div>

                <div className="glass-panel">
                    <h2 style={{ marginBottom: '24px', fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <FiAlertTriangle color="var(--error)" /> ASSET RECALL TOOL
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '24px' }}>
                        Flag a batch or specific serial number as "Compromised" to instantly warn all future scanners.
                    </p>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <input 
                            type="text" 
                            placeholder="ENTER SERIAL NUMBER" 
                            value={recallSerial}
                            onChange={(e) => setRecallSerial(e.target.value)}
                            style={{ flex: 1, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--surface-border)', color: '#fff', padding: '12px', borderRadius: '8px' }}
                        />
                        <button className="btn btn-primary" onClick={handleRecall}>RECALL</button>
                    </div>
                </div>
            </div>

            <div className="grid-2 grid">
                <div className="glass-panel">
                    <h2 style={{ marginBottom: '32px', fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <FiClock color="var(--primary)" /> LIVE VERIFICATION FEED
                    </h2>
                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        {stats.recentLogs.map((log, index) => (
                            <div key={log._id || index} style={{ padding: '16px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', marginBottom: '12px', border: '1px solid var(--surface-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <p style={{ fontWeight: 700, fontSize: '0.8rem' }}>SERIAL: {log.serialNumber}</p>
                                    <p style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>{new Date(log.createdAt).toLocaleString()}</p>
                                </div>
                                <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '0.6rem', fontWeight: 700, border: '1px solid', borderColor: (log.status || '').includes('Verified') ? 'var(--success)' : 'var(--error)', color: (log.status || '').includes('Verified') ? 'var(--success)' : 'var(--error)' }}>
                                    {(log.status || 'UNKNOWN').toUpperCase()}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="glass-panel">
                    <h2 style={{ marginBottom: '32px', fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <FiFlag color="#F59E0B" /> CONSUMER FRAUD REPORTS
                    </h2>
                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        {stats.recentReports.length === 0 ? (
                            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '40px' }}>No user reports.</p>
                        ) : (
                            stats.recentReports.map((report, index) => (
                                <div key={report._id || index} style={{ padding: '16px', background: 'rgba(245, 158, 11, 0.05)', borderRadius: '8px', marginBottom: '12px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                                    <div className="flex-between" style={{ marginBottom: '8px' }}>
                                        <span style={{ fontWeight: 800, fontSize: '0.8rem', color: '#F59E0B' }}>{report.productName.toUpperCase()}</span>
                                        <span style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>{new Date(report.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <p style={{ fontSize: '0.75rem', color: '#fff', marginBottom: '8px' }}>"{report.details}"</p>
                                    <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>SERIAL: {report.serialNumber} | IP: {report.ipAddress}</div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;

