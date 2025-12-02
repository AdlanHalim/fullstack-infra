import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const navigate = useNavigate();

    // 1. LOGIN FUNCTION
    const login = (userData, authToken) => {
        setUser(userData);
        setToken(authToken);
        localStorage.setItem('token', authToken);
        localStorage.setItem('user', JSON.stringify(userData));
        navigate('/'); // Redirect to dashboard
    };

    // 2. LOGOUT FUNCTION
    const logout = useCallback(() => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    }, [navigate]);

    // 3. AUTO-LOGOUT (Inactivity Timer) - 10 Minutes
    useEffect(() => {
        if (!token) return;

        let timeout;

        const resetTimer = () => {
            clearTimeout(timeout);
            // 10 minutes = 600,000 ms
            timeout = setTimeout(() => {
                alert("Session expired due to inactivity.");
                logout();
            }, 10 * 60 * 1000);
        };

        // Listen for any action
        window.addEventListener('mousemove', resetTimer);
        window.addEventListener('keypress', resetTimer);
        window.addEventListener('click', resetTimer);

        // Start timer immediately
        resetTimer();

        return () => {
            clearTimeout(timeout);
            window.removeEventListener('mousemove', resetTimer);
            window.removeEventListener('keypress', resetTimer);
            window.removeEventListener('click', resetTimer);
        };
    }, [token, logout]); // Re-run if login state changes

    // 4. RESTORE SESSION ON REFRESH
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        }
    }, []);

    return (
        <AuthContext.Provider value={{ user, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);