import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import ResumeRate from './pages/ResumeRate';
import Profile from './pages/Profile';
import { AuthProvider, useAuth } from './context/AuthContext';
import './App.css';
import Register from './pages/Register';

// --- REAL LOGIN COMPONENT ---
const Login = () => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://127.0.0.1:5000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // Success! We got a REAL token from Python
        login({ username: data.username }, data.token);
      } else {
        setError(data.error || "Login failed");
      }
    } catch (err) {
      setError("Cannot connect to server.");
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px' }} className="card">
      <h2 style={{ textAlign: 'center', color: '#005AC1' }}>Login to KerjayaFlow</h2>
      {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input
          type="text"
          placeholder="Username"
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ccc' }}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ccc' }}
          required
        />
        <button type="submit" className="btn-primary" style={{ justifyContent: 'center' }}>
          Sign In
        </button>
      </form>
      <p style={{ textAlign: 'center', marginTop: '15px', fontSize: '0.9rem', color: '#666' }}>
        (Use the account you registered earlier)
      </p>
    </div>
  );
};

// Guard: Protects routes that need login
const ProtectedRoute = ({ children }) => {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app-layout">
          <Navbar />
          <div className="content-container">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/login" element={<Login />} />
              <Route path="/rate" element={<ResumeRate />} />

              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />

              <Route path="/register" element={<Register />} />
              <Route path="/ats" element={<h2>ATS Checker Coming Soon</h2>} />
              <Route path="/intern" element={<h2>Intern Finder Coming Soon</h2>} />
            </Routes>
          </div>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;