import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FileText, Bot, LogOut, Calendar, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import '../App.css';

function Profile() {
    const { token, logout } = useAuth();
    const [profileData, setProfileData] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        fetch('http://127.0.0.1:5000/profile', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => {
                if (!res.ok) throw new Error("Failed to load profile.");
                return res.json();
            })
            .then(data => setProfileData(data))
            .catch(err => setError(err.message));
    }, [token]);

    if (error) return (
        <div className="dashboard-container" style={{ textAlign: 'center', marginTop: '50px' }}>
            <h3 style={{ color: '#BA1A1A' }}>⚠️ Session Error</h3>
            <button onClick={logout} className="btn-primary">Go to Login</button>
        </div>
    );

    if (!profileData) return <div className="hero-section">Loading Profile...</div>;

    return (
        <div className="dashboard-container">
            {/* HEADER CARD */}
            <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                    <div className="avatar" style={{ width: '80px', height: '80px', fontSize: '2.5rem' }}>
                        {profileData.username ? profileData.username.charAt(0).toUpperCase() : '?'}
                    </div>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '1.8rem' }}>{profileData.username}</h1>
                        <p style={{ margin: 0, color: '#666', fontSize: '1rem' }}>{profileData.email}</p>
                    </div>
                </div>
                <button onClick={logout} className="btn-primary" style={{ background: '#BA1A1A', color: 'white', padding: '10px 20px' }}>
                    <LogOut size={20} /> Logout
                </button>
            </div>

            {/* HISTORY SECTION */}
            <h3 style={{ marginLeft: '10px', fontSize: '1.4rem' }}>My Resumes</h3>

            <div className="tools-grid">
                {!profileData.resumes || profileData.resumes.length === 0 ? (
                    <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>
                        <p style={{ color: '#666' }}>You haven't uploaded any resumes yet.</p>
                    </div>
                ) : (
                    profileData.resumes.map(resume => (
                        <div key={resume.id} className="tool-card" style={{
                            cursor: 'default',
                            background: 'white',
                            borderLeft: '6px solid #444'
                        }}>
                            {/* HEADER: Filename & Date */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                <div>
                                    <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{resume.filename}</h4>
                                    <div style={{ fontSize: '0.85rem', color: '#666', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <Calendar size={14} /> {resume.date}
                                    </div>
                                </div>
                                <div style={{ background: '#F0F0F0', padding: '5px 10px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                    #{resume.id}
                                </div>
                            </div>

                            {/* SCORES ROW */}
                            <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                                {/* 1. HEALTH SCORE */}
                                <div style={{ flex: 1, background: '#F8F9FA', padding: '10px', borderRadius: '12px', textAlign: 'center' }}>
                                    <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '5px' }}>Health Score</div>
                                    {resume.structure_score !== null ? (
                                        <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: resume.structure_score > 70 ? '#10B981' : '#F59E0B' }}>
                                            {resume.structure_score}%
                                        </div>
                                    ) : (
                                        <div style={{ fontSize: '0.9rem', color: '#999', fontStyle: 'italic' }}>Not Scanned</div>
                                    )}
                                </div>

                                {/* 2. ATS SCORE */}
                                <div style={{ flex: 1, background: '#F8F9FA', padding: '10px', borderRadius: '12px', textAlign: 'center' }}>
                                    <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '5px' }}>ATS Score</div>
                                    {resume.ats_score !== null ? (
                                        <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: resume.ats_score > 70 ? '#0B572E' : '#BA1A1A' }}>
                                            {resume.ats_score}%
                                        </div>
                                    ) : (
                                        <div style={{ fontSize: '0.9rem', color: '#999', fontStyle: 'italic' }}>Not Scanned</div>
                                    )}
                                </div>
                            </div>

                            {/* ACTIONS */}
                            <div style={{ display: 'flex', gap: '10px' }}>
                                {resume.ats_score === null && (
                                    <Link to="/ats" style={{ flex: 1, textAlign: 'center', textDecoration: 'none', background: '#0B572E', color: 'white', padding: '8px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 'bold' }}>
                                        Check ATS
                                    </Link>
                                )}
                                <button style={{ flex: 1, border: '1px solid #ddd', background: 'white', padding: '8px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
                                    View Details
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default Profile;