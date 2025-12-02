import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

function Register() {
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();
            if (response.ok) {
                alert("Registration Successful! Please Login.");
                navigate('/login');
            } else {
                setError(data.error);
            }
        } catch (err) {
            setError("Server error.");
        }
    };

    return (
        <div className="dashboard-container">
            <div className="card" style={{ maxWidth: '400px', margin: '2rem auto' }}>
                <h2 style={{ textAlign: 'center', color: '#005AC1' }}>Join KerjayaFlow</h2>
                {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <input type="text" placeholder="Username" onChange={e => setFormData({ ...formData, username: e.target.value })} required style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ccc' }} />
                    <input type="email" placeholder="Email" onChange={e => setFormData({ ...formData, email: e.target.value })} required style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ccc' }} />
                    <input type="password" placeholder="Password" onChange={e => setFormData({ ...formData, password: e.target.value })} required style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ccc' }} />
                    <button type="submit" className="btn-primary" style={{ justifyContent: 'center' }}>Create Account</button>
                </form>
            </div>
        </div>
    );
}
export default Register;