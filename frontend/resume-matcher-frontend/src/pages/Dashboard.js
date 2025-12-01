import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Search, Award } from 'lucide-react';

function Dashboard() {
    return (
        <div className="dashboard-container">
            <div className="hero-section">
                <h1>Selamat Datang to KerjayaFlow 🇲🇾</h1>
                <p>Your AI-powered companion for the Malaysian job market.</p>
            </div>

            <div className="tools-grid">

                {/* Card 1: Resume Rater */}
                <Link to="/rate" className="tool-card">
                    <div className="icon-box blue"><Award size={32} /></div>
                    <h3>Resume Rater</h3>
                    <p>Get a score (0-100) and detailed feedback on your CV's strength.</p>
                </Link>

                {/* Card 2: ATS Checker */}
                <Link to="/ats" className="tool-card">
                    <div className="icon-box green"><CheckCircle size={32} /></div>
                    <h3>ATS Scanner</h3>
                    <p>Ensure your resume is readable by automated HR robots.</p>
                </Link>

                {/* Card 3: Internship Finder */}
                <Link to="/intern" className="tool-card">
                    <div className="icon-box yellow"><Search size={32} /></div>
                    <h3>Intern Finder</h3>
                    <p>Find internships in KL, Penang, or Johor that match your skills.</p>
                </Link>

            </div>
        </div>
    );
}

export default Dashboard;