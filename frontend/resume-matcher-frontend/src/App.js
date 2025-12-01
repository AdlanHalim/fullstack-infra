import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import ResumeRate from './pages/ResumeRate';
import AtsCheck from './pages/AtsCheck';
import InternFind from './pages/InternFind';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-layout">
        <Navbar />
        <div className="content-container">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/rate" element={<ResumeRate />} />
            <Route path="/ats" element={<AtsCheck />} />
            <Route path="/intern" element={<InternFind />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;