import React, { useState, useEffect } from 'react';
import { Upload, FileText, Bot, AlertTriangle, CheckCircle, Eye, History, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../App.css';

function AtsCheck() {
    const { token, user } = useAuth();

    // UI State
    const [activeTab, setActiveTab] = useState('upload'); // 'upload' or 'history'
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Data State
    const [file, setFile] = useState(null);
    const [userResumes, setUserResumes] = useState([]);
    const [result, setResult] = useState(null);

    // 1. Fetch User History on Load (if logged in)
    useEffect(() => {
        if (user && token) {
            fetch('http://127.0.0.1:5000/profile', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(res => res.json())
                .then(data => {
                    if (data.resumes) setUserResumes(data.resumes);
                })
                .catch(err => console.error("Failed to load history"));
        }
    }, [user, token]);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    // 2. Scan NEW File
    const handleScanNew = async () => {
        if (!file) { alert("Please upload a resume."); return; }
        setLoading(true); setError('');

        const formData = new FormData();
        formData.append('resume', file);

        const headers = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        try {
            const response = await fetch('http://127.0.0.1:5000/ats-scan', {
                method: 'POST',
                headers: headers,
                body: formData,
            });
            const data = await response.json();
            if (response.ok) setResult(data);
            else setError(data.error || "Scan failed.");
        } catch (err) { setError("Cannot connect to server."); }
        finally { setLoading(false); }
    };

    // 3. Scan EXISTING File
    const handleScanExisting = async (resumeId) => {
        setLoading(true); setError('');
        try {
            const response = await fetch(`http://127.0.0.1:5000/ats-rescan/${resumeId}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) setResult(data);
            else setError(data.error || "Rescan failed.");
        } catch (err) { setError("Cannot connect to server."); }
        finally { setLoading(false); }
    };

    return (
        <div className="dashboard-container">
            <div className="hero-section">
                <h1>ATS Robot Check 🤖</h1>
                <p>See your resume through the eyes of a hiring robot.</p>
            </div>

            {!result ? (
                <div style={{ maxWidth: '700px', margin: '0 auto' }}>

                    {/* TAB SWITCHER (Only for Logged In Users) */}
                    {user && (
                        <div style={{ display: 'flex', background: '#E0E2EC', padding: '4px', borderRadius: '50px', marginBottom: '20px' }}>
                            <button
                                onClick={() => setActiveTab('upload')}
                                style={{
                                    flex: 1, padding: '10px', borderRadius: '50px', border: 'none', cursor: 'pointer', fontWeight: 'bold',
                                    background: activeTab === 'upload' ? 'white' : 'transparent',
                                    color: activeTab === 'upload' ? '#005AC1' : '#444',
                                    boxShadow: activeTab === 'upload' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                                    transition: 'all 0.2s'
                                }}
                            >
                                Upload New
                            </button>
                            <button
                                onClick={() => setActiveTab('history')}
                                style={{
                                    flex: 1, padding: '10px', borderRadius: '50px', border: 'none', cursor: 'pointer', fontWeight: 'bold',
                                    background: activeTab === 'history' ? 'white' : 'transparent',
                                    color: activeTab === 'history' ? '#005AC1' : '#444',
                                    boxShadow: activeTab === 'history' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                                    transition: 'all 0.2s'
                                }}
                            >
                                Select Existing
                            </button>
                        </div>
                    )}

                    {/* MODE A: UPLOAD NEW */}
                    {activeTab === 'upload' && (
                        <div className="card">
                            <h3 style={{ textAlign: 'center' }}>Upload Resume for ATS Scan</h3>
                            <div className="dropzone" style={{ borderColor: '#0B572E', background: '#E6F4EA' }}>
                                <Bot size={48} color="#0B572E" />
                                <p>Drag & Drop or Click to Upload (PDF)</p>
                                <input type="file" onChange={handleFileChange} accept=".pdf" />
                                {file && <div style={{ marginTop: '10px', color: '#0B572E', fontWeight: 'bold' }}><FileText size={16} /> {file.name}</div>}
                            </div>

                            <button className="analyze-btn" onClick={handleScanNew} disabled={loading} style={{ background: '#0B572E', marginTop: '20px' }}>
                                {loading ? "Robot is Reading..." : "Run ATS Simulation"}
                            </button>

                            {!user && (
                                <p style={{ fontSize: '0.8rem', textAlign: 'center', color: '#666', marginTop: '15px' }}>
                                    *Guest scan (Data will not be saved)
                                </p>
                            )}
                        </div>
                    )}

                    {/* MODE B: SELECT EXISTING */}
                    {activeTab === 'history' && user && (
                        <div className="card">
                            <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>Select from your Profile</h3>
                            {userResumes.length === 0 ? (
                                <p style={{ textAlign: 'center', color: '#666' }}>No resumes found. Please upload one first.</p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {userResumes.map(resume => (
                                        <div key={resume.id} style={{
                                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                            padding: '15px', border: '1px solid #E0E2EC', borderRadius: '12px',
                                            background: 'white'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div style={{ background: '#D8E2FF', padding: '8px', borderRadius: '8px' }}>
                                                    <FileText size={20} color="#005AC1" />
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 'bold' }}>Resume #{resume.id}</div>
                                                    <div style={{ fontSize: '0.8rem', color: '#666' }}>Uploaded: {resume.date}</div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleScanExisting(resume.id)}
                                                disabled={loading}
                                                style={{
                                                    background: '#0B572E', color: 'white', border: 'none',
                                                    padding: '8px 16px', borderRadius: '50px', cursor: 'pointer',
                                                    display: 'flex', alignItems: 'center', gap: '5px'
                                                }}
                                            >
                                                Check ATS <ArrowRight size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {error && <div className="card" style={{ background: '#FCE8E6', color: '#C5221F', marginTop: '20px', textAlign: 'center' }}>{error}</div>}
                </div>
            ) : (
                // --- RESULTS DASHBOARD ---
                <div className="dashboard">
                    {!result.is_saved && (
                        <div style={{ background: '#221B00', color: '#FFEC9F', padding: '15px', borderRadius: '16px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                            <div><strong>Guest Mode:</strong> Report not saved.</div>
                            <Link to="/register" style={{ background: '#FFEC9F', color: '#221B00', padding: '6px 12px', borderRadius: '50px', textDecoration: 'none', fontWeight: 'bold' }}>Register</Link>
                        </div>
                    )}

                    <div className="card" style={{ width: '100%', marginBottom: '20px', textAlign: 'center' }}>
                        {result.filename && <div style={{ marginBottom: '10px', color: '#666' }}>Analysis for: <strong>{result.filename}</strong></div>}
                        <div className="score-circle" style={{ borderColor: result.score > 80 ? '#10B981' : '#BA1A1A', margin: '0 auto 10px auto', width: '100px', height: '100px' }}>
                            <span className="score-number" style={{ fontSize: '2rem' }}>{result.score}%</span>
                        </div>
                        <h3>Parsability Score</h3>
                        <p>How easily robots can read your file.</p>
                    </div>

                    <div className="feedback-grid">
                        <div className="card" style={{ gridColumn: '1 / -1', background: '#1e1e1e', color: '#00ff00', fontFamily: 'monospace' }}>
                            <h4 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'white' }}><Eye size={20} /> Robot Vision</h4>
                            <div style={{ maxHeight: '200px', overflowY: 'auto', padding: '10px', border: '1px solid #333', borderRadius: '8px', fontSize: '0.85rem', lineHeight: '1.4', whiteSpace: 'pre-wrap' }}>
                                {result.results.raw_text_preview}
                            </div>
                        </div>

                        <div className="card">
                            <h4><CheckCircle size={20} color="#005AC1" /> Data Extracted</h4>
                            <ul style={{ listStyle: 'none', padding: 0 }}>
                                <li><strong>Email: </strong> {result.results.parsed_info.email ? <span style={{ color: 'green' }}>✅ {result.results.parsed_info.email}</span> : <span style={{ color: 'red' }}>❌ Not Found</span>}</li>
                                <li><strong>Phone: </strong> {result.results.parsed_info.phone ? <span style={{ color: 'green' }}>✅ {result.results.parsed_info.phone}</span> : <span style={{ color: 'red' }}>❌ Not Found</span>}</li>
                            </ul>
                        </div>

                        <div className="card" style={{ background: result.results.issues.length > 0 ? '#FCE8E6' : '#E6F4EA' }}>
                            <h4 style={{ color: result.results.issues.length > 0 ? '#BA1A1A' : '#0B572E' }}><AlertTriangle size={20} /> {result.results.issues.length} Issues</h4>
                            <ul style={{ paddingLeft: '20px' }}>
                                {result.results.issues.map((issue, idx) => <li key={idx} style={{ color: '#BA1A1A', marginBottom: '5px' }}>{issue}</li>)}
                            </ul>
                        </div>
                    </div>
                    <button className="btn-primary" onClick={() => setResult(null)}>Scan Another File</button>
                </div>
            )}
        </div>
    );
}

export default AtsCheck;