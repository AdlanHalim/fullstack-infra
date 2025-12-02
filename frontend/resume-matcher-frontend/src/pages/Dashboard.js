import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Search, Award } from 'lucide-react';

function Dashboard() {
    return (
        <div className="dashboard-container">
            <div className="hero-section">
                <h1>Apa khabar, Adlan? 👋</h1>
                <p style={{ fontSize: '1.2rem', color: '#666' }}>Ready to upgrade your career journey today?</p>
            </div>

            <div className="tools-grid">

                {/* Card 1: Resume Rater (Primary Color) */}
                <Link to="/rate" className="tool-card" style={{ background: '#D8E2FF', color: '#001A41' }}>
                    <Award size={40} style={{ marginBottom: '10px' }} />
                    <h3>Resume Health Check</h3>
                    <p>AI scan for structure, contact info, and missing sections.</p>
                </Link>

                {/* Card 2: ATS Scanner (Secondary Color) */}
                <Link to="/ats" className="tool-card" style={{ background: '#E6F4EA', color: '#0B572E' }}>
                    <CheckCircle size={40} style={{ marginBottom: '10px' }} />
                    <h3>ATS Robot Check</h3>
                    <p>Ensure your resume passes automated hiring filters.</p>
                </Link>

                {/* Card 3: Intern Finder (Tertiary Color) */}
                <Link to="/intern" className="tool-card" style={{ background: '#FFEC9F', color: '#221B00' }}>
                    <Search size={40} style={{ marginBottom: '10px' }} />
                    <h3>Internship Finder</h3>
                    <p>Match your skills with companies in KL & Penang.</p>
                </Link>

            </div>
        </div>
    );
}

export default Dashboard;