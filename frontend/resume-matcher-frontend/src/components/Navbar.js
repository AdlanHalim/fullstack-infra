import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, User, LogOut, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function Navbar() {
    const { user, logout } = useAuth();
    const [showMenu, setShowMenu] = useState(false);

    return (
        <nav className="navbar">
            <Link to="/" className="brand-link">
                <div style={{ background: '#D8E2FF', padding: '8px', borderRadius: '12px' }}>
                    <Briefcase color="#005AC1" size={24} />
                </div>
                <span className="brand-name">KerjayaFlow</span>
            </Link>

            <div className="nav-profile" style={{ position: 'relative' }}>
                {user ? (
                    // LOGGED IN VIEW
                    <>
                        <span style={{ marginRight: '10px', display: 'none', md: 'block' }}>Hi, {user.username}</span>
                        <div
                            className="avatar"
                            onClick={() => setShowMenu(!showMenu)}
                            style={{ cursor: 'pointer' }}
                        >
                            {user.username.charAt(0).toUpperCase()}
                        </div>

                        {showMenu && (
                            <div style={{
                                position: 'absolute', top: '50px', right: '0',
                                background: 'white', padding: '10px', borderRadius: '16px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: '150px', zIndex: 100
                            }}>
                                <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: '#333', padding: '8px' }} onClick={() => setShowMenu(false)}>
                                    <User size={16} /> Profile
                                </Link>
                                <div onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#BA1A1A', cursor: 'pointer', padding: '8px' }}>
                                    <LogOut size={16} /> Logout
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    // GUEST VIEW (Invite to Save)
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <div style={{ display: 'flex', gap: '20px', marginLeft: '40px', marginRight: 'auto' }}>
                            <Link to="/ats" style={{ textDecoration: 'none', color: '#444746', fontWeight: '500' }}>ATS Check</Link>
                            <Link to="/intern" style={{ textDecoration: 'none', color: '#444746', fontWeight: '500' }}>Internships</Link>
                        </div>
                        <Link to="/login" style={{ textDecoration: 'none', color: '#005AC1', fontWeight: 'bold', padding: '10px' }}>
                            Log In
                        </Link>
                        <Link to="/register" className="btn-primary" style={{ textDecoration: 'none', borderRadius: '50px', fontSize: '0.9rem' }}>
                            Sign Up to Save <ArrowRight size={16} style={{ marginLeft: '5px' }} />
                        </Link>
                    </div>
                )}
            </div>
        </nav>
    );
}

export default Navbar;