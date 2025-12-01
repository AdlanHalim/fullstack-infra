import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase } from 'lucide-react';

function Navbar() {
    return (
        <nav className="navbar">
            <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Briefcase color="#FACC15" size={28} /> {/* The "Gold" Icon */}
                <span className="brand-name">Kerjaya<span className="brand-accent">Flow</span></span>
            </Link>
            <div className="nav-profile">
                <span>Hello, Job Seeker</span>
                <div className="avatar">AD</div>
            </div>
        </nav>
    );
}

export default Navbar;