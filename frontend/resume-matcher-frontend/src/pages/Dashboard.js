import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Search, Award, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function Dashboard() {
    const { user } = useAuth();

    return (
        <div className="dashboard-container">
            <div className="hero-section">
                <h1>
                    Apa khabar, <span style={{ color: 'var(--accent)' }}>{user ? user.username : 'Guest'}</span>? 👋
                </h1>
                <p>Ready to upgrade your career journey today?</p>
            </div>

            <div className="tools-grid">

                {/* Card 1: Resume Rater */}
                <Link to="/rate" className="tool-card">
                    <div style={{ background: 'var(--bg-subtle)', width: 'fit-content', padding: '12px', borderRadius: '12px', marginBottom: '16px' }}>
                        <Award size={32} color="var(--accent)" />
                    </div>
                    <h3>Resume Health Check</h3>
                    <p>AI scan for structure, contact info, and missing sections.</p>
                    <div style={{ marginTop: 'auto', paddingTop: '16px', display: 'flex', alignItems: 'center', color: 'var(--accent)', fontWeight: '600', fontSize: '0.9rem' }}>
                        Start Check <ArrowRight size={16} style={{ marginLeft: '4px' }} />
                    </div>
                </Link>

                {/* Card 2: ATS Scanner */}
                <Link to="/ats" className="tool-card">
                    <div style={{ background: 'var(--success-bg)', width: 'fit-content', padding: '12px', borderRadius: '12px', marginBottom: '16px' }}>
                        <CheckCircle size={32} color="var(--success)" />
                    </div>
                    <h3>ATS Robot Check</h3>
                    <p>Ensure your resume passes automated hiring filters.</p>
                    <div style={{ marginTop: 'auto', paddingTop: '16px', display: 'flex', alignItems: 'center', color: 'var(--success)', fontWeight: '600', fontSize: '0.9rem' }}>
                        Scan Now <ArrowRight size={16} style={{ marginLeft: '4px' }} />
                    </div>
                </Link>

                {/* Card 3: Intern Finder */}
                <Link to="/intern" className="tool-card">
                    <div style={{ background: 'var(--warning-bg)', width: 'fit-content', padding: '12px', borderRadius: '12px', marginBottom: '16px' }}>
                        <Search size={32} color="var(--warning)" />
                    </div>
                    <h3>Internship Finder</h3>
                    <p>Match your skills with companies in KL & Penang.</p>
                    <div style={{ marginTop: 'auto', paddingTop: '16px', display: 'flex', alignItems: 'center', color: 'var(--warning)', fontWeight: '600', fontSize: '0.9rem' }}>
                        Find Internships <ArrowRight size={16} style={{ marginLeft: '4px' }} />
                    </div>
                </Link>

            </div>
        </div>
    );
}

export default Dashboard;