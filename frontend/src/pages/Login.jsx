import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiLock, FiMail, FiShield } from 'react-icons/fi';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await axios.post(`${API_BASE_URL}/api/auth/login`, { email, password });
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('role', res.data.role);
            navigate('/admin/dashboard');
        } catch (err) {
            setError(err.response?.data?.msg || 'An error occurred during login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-center" style={{ minHeight: '100vh', width: '100%', background: 'var(--background)' }}>
            <div className="glass-panel animate-fade-in" style={{ padding: '60px 40px', width: '100%', maxWidth: '480px', textAlign: 'center' }}>
                <div className="flex-center" style={{ marginBottom: '24px' }}>
                    <FiShield size={64} color="var(--primary)" className="pulse" />
                </div>
                <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '0.1em', marginBottom: '8px' }}>VERICHAIN</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '40px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    Authorized Personnel Access Only
                </p>

                {error && (
                    <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--error)', color: 'var(--error)', padding: '16px', borderRadius: '8px', marginBottom: '24px', fontSize: '0.9rem' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin}>
                    <div style={{ marginBottom: '20px', position: 'relative' }}>
                        <FiMail style={{ position: 'absolute', top: '18px', left: '20px', color: 'var(--text-secondary)' }} />
                        <input
                            type="email"
                            placeholder="EMAIL ADDRESS"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={{ paddingLeft: '56px', margin: 0 }}
                        />
                    </div>

                    <div style={{ marginBottom: '32px', position: 'relative' }}>
                        <FiLock style={{ position: 'absolute', top: '18px', left: '20px', color: 'var(--text-secondary)' }} />
                        <input
                            type="password"
                            placeholder="PASSWORD"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{ paddingLeft: '56px', margin: 0 }}
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '18px' }}
                        disabled={loading}
                    >
                        {loading ? 'AUTHENTICATING...' : 'ACCESS DASHBOARD'}
                    </button>
                </form>

                <p style={{ marginTop: '40px', fontSize: '0.75rem', color: 'var(--text-secondary)', letterSpacing: '0.1em' }}>
                    SECURED BY IMMUTABLE BLOCKCHAIN TECHNOLOGY
                </p>
            </div>
        </div>
    );
};

export default Login;

