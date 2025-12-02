import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Briefcase, CheckCircle, ArrowRight, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import '../App.css';

function InternFind() {
    const { token, user } = useAuth();
    const [resumes, setResumes] = useState([]);
    const [selectedResumeId, setSelectedResumeId] = useState(null);
    const [matches, setMatches] = useState(null);
    const [loading, setLoading] = useState(false);

    // 1. Fetch Resumes on Load
    useEffect(() => {
        if (user && token) {
            fetch(`${process.env.REACT_APP_API_URL}/profile`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(res => res.json())
                .then(data => {
                    if (data.resumes) setResumes(data.resumes);
                })
                .catch(err => console.error("Failed to load resumes"));
        }
    }, [user, token]);

    // 2. Find Matches
    const handleFindInternships = async (resumeId) => {
        setLoading(true);
        setSelectedResumeId(resumeId);
        setMatches(null);

        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/internship-match/${resumeId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                setMatches(data);
            } else {
                alert("Failed to find matches");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="dashboard-container" style={{ textAlign: 'center', marginTop: '50px' }}>
                <h2 style={{ color: 'var(--primary)' }}>🔒 Login Required</h2>
                <p style={{ color: 'var(--text-secondary)' }}>Please login to access the Internship Finder.</p>
                <Link to="/login" className="btn-primary">Login Now</Link>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <div className="hero-section" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)', color: 'white', borderRadius: 'var(--radius-lg)', padding: '3rem' }}>
                <h1 style={{ color: 'white' }}>Internship Finder 🚀</h1>
                <p style={{ color: 'rgba(255,255,255,0.9)' }}>We match your resume skills to real internship opportunities.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px', marginTop: '20px' }}>

                {/* LEFT: RESUME SELECTOR */}
                <div className="card">
                    <h3 style={{ color: 'var(--primary)' }}>Select Your Resume</h3>
                    {resumes.length === 0 ? (
                        <p style={{ color: 'var(--text-secondary)' }}>No resumes found. Please upload one first.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {resumes.map(resume => (
                                <div
                                    key={resume.id}
                                    onClick={() => handleFindInternships(resume.id)}
                                    style={{
                                        padding: '15px',
                                        border: selectedResumeId === resume.id ? '2px solid var(--accent)' : '1px solid #E2E8F0',
                                        borderRadius: '12px',
                                        background: selectedResumeId === resume.id ? 'var(--bg-subtle)' : 'white',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <div style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary)' }}>
                                        <FileText size={18} /> {resume.filename}
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '5px' }}>
                                        Uploaded: {resume.date}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* RIGHT: JOB MATCHES */}
                <div>
                    {loading && <div className="card" style={{ textAlign: 'center' }}>Finding the best roles for you... ⏳</div>}

                    {!loading && matches && (
                        <div className="card" style={{ background: 'var(--bg-main)' }}>
                            <h3 style={{ marginBottom: '20px', color: 'var(--primary)' }}>
                                Found {matches.matches.length} Matches based on:
                                <span style={{ color: 'var(--accent)', marginLeft: '10px' }}>
                                    {matches.skills_detected.join(", ")}
                                </span>
                            </h3>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                {matches.matches.map((match, idx) => (
                                    <div key={idx} style={{
                                        background: 'white', padding: '20px', borderRadius: '12px',
                                        boxShadow: 'var(--shadow-sm)',
                                        borderLeft: `5px solid ${match.score > 70 ? 'var(--success)' : 'var(--warning)'}`
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                            <div>
                                                <h4 style={{ margin: '0 0 5px 0', fontSize: '1.2rem', color: 'var(--primary)' }}>{match.job.title}</h4>
                                                <div style={{ fontWeight: 'bold', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                                                    <Briefcase size={14} style={{ marginRight: '5px' }} /> {match.job.company}
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontSize: '1.5rem', fontWeight: '800', color: match.score > 70 ? 'var(--success)' : 'var(--warning)' }}>
                                                    {match.score}%
                                                </div>
                                                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>MATCH</div>
                                            </div>
                                        </div>

                                        <div style={{ marginTop: '10px' }}>
                                            <div style={{ fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '5px', color: 'var(--primary)' }}>Matched Skills:</div>
                                            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                                                {match.matched_skills.map(skill => (
                                                    <span key={skill} style={{ background: 'var(--success-bg)', color: 'var(--success)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>
                                                        <CheckCircle size={12} style={{ marginRight: '3px' }} /> {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        <button className="btn-primary" style={{ width: '100%', marginTop: '15px', padding: '10px' }}>
                                            Apply Now <ArrowRight size={16} style={{ marginLeft: '5px' }} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {!loading && !matches && !selectedResumeId && (
                        <div className="card" style={{ textAlign: 'center', padding: '50px', color: 'var(--text-secondary)' }}>
                            <Briefcase size={48} style={{ marginBottom: '10px', opacity: 0.5 }} />
                            <p>Select a resume from the left to start matching.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default InternFind;