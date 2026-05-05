import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import ProductManagement from './pages/ProductManagement';
import VerificationPage from './pages/VerificationPage';
import ManufacturerDashboard from './pages/ManufacturerDashboard';
import DistributorDashboard from './pages/DistributorDashboard';
import RetailerDashboard from './pages/RetailerDashboard';
import Sidebar from './components/Sidebar';
import './index.css';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const isAuthenticated = token && token !== 'undefined';
  console.log('ProtectedRoute: isAuthenticated?', isAuthenticated);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app-container" style={{ background: 'var(--background)' }}>
      <Sidebar />
      <main style={{ 
        flex: 1, 
        padding: '40px', 
        overflowY: 'auto', 
        height: '100vh',
        background: 'var(--background)' 
      }}>
        {children}
      </main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<VerificationPage />} />
        <Route path="/verify/:serialNumber" element={<VerificationPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<Navigate to="/admin/dashboard" />} />

        {/* Protected Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/products"
          element={
            <ProtectedRoute>
              <ProductManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manufacturer"
          element={
            <ProtectedRoute>
              <ManufacturerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/distributor"
          element={
            <ProtectedRoute>
              <DistributorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/retailer"
          element={
            <ProtectedRoute>
              <RetailerDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
