import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, XCircle, Save } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Import Auth
import '../App.css';

function ResumeRate() {
    const { token, user } = useAuth(); // Get current auth state
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleAnalyze = async () => {
        if (!file) {
            alert("Sila upload resume anda (PDF).");
            return;
        }

        setLoading(true);
        setError('');

        const formData = new FormData();
        formData.append('resume', file);

        // Prepare Headers
        const headers = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`; // Send token if logged in
        }

        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/analyze`, {
                method: 'POST',
                headers: headers, // Pass headers here
                body: formData,
            });

            const data = await response.json();

            if (response.ok) {
                setResult(data);
            } else {
                setError(data.error || "Something went wrong.");
            }
        } catch (err) {
            setError("Cannot connect to server. Is Backend running?");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard-container">
            <div className="hero-section">
                <h1>Resume Health Check 🏥</h1>
                <p>Check if your student resume has all the essential Malaysian standard sections.</p>
            </div>

            {!result ? (
                // --- INPUT MODE ---
                <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                    <div className="card">
                        <h3 style={{ textAlign: 'center' }}>Upload Your Resume (PDF)</h3>
                        <div className="dropzone">
                            <Upload size={48} color="#005AC1" />
                            <p>Drag & Drop or Click to Upload</p>
                            <input type="file" onChange={handleFileChange} accept=".pdf" />
                            {file && <div style={{ marginTop: '10px', color: '#0B572E', fontWeight: 'bold' }}><FileText size={16} /> {file.name}</div>}
                        </div>

                        <button className="analyze-btn" onClick={handleAnalyze} disabled={loading} style={{ width: '100%', marginTop: '20px' }}>
                            {loading ? "Scanning Structure..." : "Analyze Resume"}
                        </button>

                        {/* Trust Signal */}
                        {!user && (
                            <p style={{ fontSize: '0.8rem', textAlign: 'center', color: '#666', marginTop: '15px' }}>
                                *We do not store your data unless you register.
                            </p>
                        )}

                        {error && <p style={{ color: 'red', marginTop: '10px', textAlign: 'center' }}>{error}</p>}
                    </div>
                </div>
            ) : (
                // --- RESULTS MODE ---
                <div className="dashboard">

                    {/* GUEST BANNER: The Hook */}
                    {!result.is_saved && (
                        <div style={{
                            background: '#221B00', color: '#FFEC9F',
                            padding: '15px', borderRadius: '16px', width: '100%',
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            marginBottom: '20px'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Save size={24} />
                                <div>
                                    <strong>Guest Mode:</strong> This report will be lost when you refresh.
                                </div>
                            </div>
                            <Link to="/register" style={{
                                background: '#FFEC9F', color: '#221B00',
                                padding: '8px 16px', borderRadius: '50px',
                                textDecoration: 'none', fontWeight: 'bold'
                            }}>
                                Register to Save
                            </Link>
                        </div>
                    )}

                    <div className="score-circle" style={{ borderColor: result.score > 70 ? '#10B981' : '#F59E0B' }}>
                        <span className="score-number">{result.score}/100</span>
                        <span className="score-label">Completeness</span>
                    </div>

                    <div className="feedback-grid">
                        <div className="card feedback-card good">
                            <h4><CheckCircle size={20} /> Good Job! ({result.present.length})</h4>
                            <ul>
                                {result.present.map(item => <li key={item}>{item}</li>)}
                            </ul>
                        </div>

                        <div className="card feedback-card bad">
                            <h4><XCircle size={20} /> Missing Sections ({result.missing.length})</h4>
                            <ul>
                                {result.missing.map(item => <li key={item}>{item}</li>)}
                            </ul>
                        </div>
                    </div>

                    <button className="btn-primary" onClick={() => setResult(null)}>Check Another Resume</button>
                </div>
            )}
        </div>
    );
}

export default ResumeRate;