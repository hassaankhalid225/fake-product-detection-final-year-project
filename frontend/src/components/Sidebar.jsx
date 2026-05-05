import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FiHome, FiBox, FiLogOut, FiShield } from 'react-icons/fi';

const Sidebar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        navigate('/login');
    };

    const role = localStorage.getItem('role') || 'Admin';

    return (
        <div
            className="glass-panel"
            style={{
                width: '280px',
                height: 'calc(100vh - 80px)',
                margin: '40px 0 40px 40px',
                padding: '40px 24px',
                display: 'flex',
                flexDirection: 'column',
                borderRight: '1px solid var(--surface-border)'
            }}
        >
            <div style={{ marginBottom: '48px', textAlign: 'center' }}>
                <div className="flex-center" style={{ marginBottom: '12px' }}>
                    <FiShield size={32} color="var(--primary)" />
                </div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '0.1em', color: 'var(--text-primary)', margin: 0 }}>VERICHAIN</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.2em', marginTop: '4px' }}>{role} PORTAL</p>
            </div>

            <nav style={{ flex: 1 }}>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    <li style={{ marginBottom: '12px' }}>
                        <NavLink
                            to="/admin/dashboard"
                            style={({ isActive }) => ({
                                display: 'flex',
                                alignItems: 'center',
                                padding: '14px 20px',
                                borderRadius: '8px',
                                textDecoration: 'none',
                                color: isActive ? 'white' : 'var(--text-secondary)',
                                background: isActive ? 'var(--primary)' : 'transparent',
                                fontWeight: isActive ? '700' : '500',
                                transition: 'all 200ms ease',
                                fontSize: '0.9rem'
                            })}
                        >
                            <FiHome style={{ marginRight: '12px', fontSize: '1.2rem' }} />
                            DASHBOARD
                        </NavLink>
                    </li>
                    <li style={{ marginBottom: '12px' }}>
                        <NavLink
                            to="/admin/products"
                            style={({ isActive }) => ({
                                display: 'flex',
                                alignItems: 'center',
                                padding: '14px 20px',
                                borderRadius: '8px',
                                textDecoration: 'none',
                                color: isActive ? 'white' : 'var(--text-secondary)',
                                background: isActive ? 'var(--primary)' : 'transparent',
                                fontWeight: isActive ? '700' : '500',
                                transition: 'all 200ms ease',
                                fontSize: '0.9rem'
                            })}
                        >
                            <FiBox style={{ marginRight: '12px', fontSize: '1.2rem' }} />
                            PRODUCTS
                        </NavLink>
                    </li>
                </ul>
            </nav>

            <button
                onClick={handleLogout}
                className="btn btn-secondary"
                style={{ width: '100%', padding: '12px', fontSize: '0.8rem' }}
            >
                <FiLogOut style={{ marginRight: '8px' }} />
                SIGN OUT
            </button>
        </div>
    );
};

export default Sidebar;

