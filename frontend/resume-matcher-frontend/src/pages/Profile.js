import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FileText, LogOut } from 'lucide-react';
import '../App.css';

function Profile() {
    const { token, logout } = useAuth();
    const [profileData, setProfileData] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        // Fetch secure data
        fetch('http://127.0.0.1:5000/profile', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(res => {
                if (!res.ok) throw new Error("Failed to load profile. Please login again.");
                return res.json();
            })
            .then(data => setProfileData(data))
            .catch(err => {
                console.error(err);
                setError(err.message);
            });
    }, [token]);

    if (error) return (
        <div className="dashboard-container" style={{ textAlign: 'center', marginTop: '50px' }}>
            <h3 style={{ color: '#BA1A1A' }}>⚠️ Session Error</h3>
            <p>{error}</p>
            <button onClick={logout} className="btn-primary">Go to Login</button>
        </div>
    );

    if (!profileData) return <div className="hero-section">Loading Profile...</div>;

    return (
        <div className="dashboard-container">
            {/* Header Card */}
            <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    {/* SAFE CHECK: Only try charAt if username exists */}
                    <div className="avatar" style={{ width: '80px', height: '80px', fontSize: '2rem' }}>
                        {profileData.username ? profileData.username.charAt(0).toUpperCase() : '?'}
                    </div>
                    <div>
                        <h2 style={{ margin: 0 }}>{profileData.username || 'Unknown User'}</h2>
                        <p style={{ margin: 0, color: '#666' }}>{profileData.email}</p>
                    </div>
                </div>
                <button onClick={logout} className="btn-primary" style={{ background: '#BA1A1A', color: 'white' }}>
                    <LogOut size={18} /> Logout
                </button>
            </div>

            {/* History Section */}
            <h3 style={{ marginLeft: '10px' }}>Resume History</h3>
            <div className="tools-grid">
                {!profileData.resumes || profileData.resumes.length === 0 ? (
                    <p style={{ padding: '20px' }}>No resumes scanned yet.</p>
                ) : (
                    profileData.resumes.map(resume => (
                        <div key={resume.id} className="tool-card" style={{ cursor: 'default' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                <FileText size={24} color="#005AC1" />
                                <span style={{ fontWeight: 'bold', color: resume.score > 70 ? 'green' : 'orange' }}>
                                    {resume.score}%
                                </span>
                            </div>
                            <h4>Scan on {resume.date}</h4>
                            <p style={{ fontSize: '0.9rem', color: '#666' }}>
                                Missing: {resume.missing.slice(0, 3).join(", ")}...
                            </p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default Profile;