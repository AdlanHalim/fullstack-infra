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
                <div style={{ background: 'var(--bg-subtle)', padding: '8px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Briefcase color="var(--accent)" size={24} />
                </div>
                <span className="brand-name">KerjayaFlow</span>
            </Link>

            <div className="nav-profile" style={{ position: 'relative' }}>
                {user ? (
                    // LOGGED IN VIEW
                    <>
                        <span style={{ fontWeight: 500, color: 'var(--text-main)', display: 'none', md: 'block' }}>
                            Hi, {user.username}
                        </span>
                        <div
                            className="avatar"
                            onClick={() => setShowMenu(!showMenu)}
                            role="button"
                            tabIndex={0}
                        >
                            {user.username.charAt(0).toUpperCase()}
                        </div>

                        {showMenu && (
                            <div style={{
                                position: 'absolute',
                                top: '50px',
                                right: '0',
                                background: 'white',
                                padding: '8px',
                                borderRadius: 'var(--radius-md)',
                                boxShadow: 'var(--shadow-lg)',
                                width: '180px',
                                zIndex: 100,
                                border: '1px solid #E2E8F0'
                            }}>
                                <Link
                                    to="/profile"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        textDecoration: 'none',
                                        color: 'var(--text-main)',
                                        padding: '10px',
                                        borderRadius: 'var(--radius-sm)',
                                        transition: 'background 0.2s'
                                    }}
                                    onClick={() => setShowMenu(false)}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-subtle)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                    <User size={18} /> Profile
                                </Link>
                                <div
                                    onClick={logout}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        color: 'var(--error)',
                                        cursor: 'pointer',
                                        padding: '10px',
                                        borderRadius: 'var(--radius-sm)',
                                        transition: 'background 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--error-bg)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                    <LogOut size={18} /> Logout
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    // GUEST VIEW
                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                        <div style={{ gap: '24px', display: 'none', md: 'flex' }}>
                            <Link to="/ats" style={{ textDecoration: 'none', color: 'var(--text-secondary)', fontWeight: '500', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = 'var(--primary)'} onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}>ATS Check</Link>
                            <Link to="/intern" style={{ textDecoration: 'none', color: 'var(--text-secondary)', fontWeight: '500', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = 'var(--primary)'} onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}>Internships</Link>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <Link to="/login" style={{ textDecoration: 'none', color: 'var(--accent)', fontWeight: '600' }}>
                                Log In
                            </Link>
                            <Link to="/register" className="btn-primary" style={{ borderRadius: 'var(--radius-full)', padding: '0.6rem 1.2rem' }}>
                                Sign Up <ArrowRight size={16} style={{ marginLeft: '4px' }} />
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}

export default Navbar;