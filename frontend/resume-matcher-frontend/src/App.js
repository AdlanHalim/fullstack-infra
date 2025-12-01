import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import './App.css';

function App() {
  const [file, setFile] = useState(null);
  const [jobDesc, setJobDesc] = useState('');
  const [analyzing, setAnalyzing] = useState(false);

  // Placeholder for results (we will hook this to backend later)
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!file || !jobDesc) {
      alert("Please upload a resume and paste a job description.");
      return;
    }

    setAnalyzing(true);

    // Simulate API call delay
    setTimeout(() => {
      setAnalyzing(false);
      // Mock Result
      setResult({
        score: 78,
        missing: ['Python', 'Docker', 'Team Leadership'],
        matching: ['React', 'JavaScript', 'Communication']
      });
    }, 2000);
  };

  return (
    <div className="app-container">
      {/* Navbar */}
      <nav className="navbar">
        <div className="logo">AI Resume Matcher</div>
        <div className="nav-links">
          <button className="btn-secondary">Log In</button>
          <button className="btn-primary">Sign Up to Save</button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="main-content">
        {!result ? (
          <>
            <div className="hero-text">
              <h1>Optimize your resume for any job.</h1>
              <p>Upload your resume and the job description to get an instant match score.</p>
            </div>

            <div className="upload-section">
              {/* Left: Resume Upload */}
              <div className="card upload-box">
                <h3>1. Upload Resume</h3>
                <div className="dropzone">
                  <Upload size={48} color="#666" />
                  <p>Drag & Drop PDF or DOCX</p>
                  <input type="file" onChange={handleFileChange} accept=".pdf,.docx" />
                  {file && <div className="file-preview"><FileText size={16} /> {file.name}</div>}
                </div>
              </div>

              {/* Right: Job Description */}
              <div className="card job-box">
                <h3>2. Job Description</h3>
                <textarea
                  placeholder="Paste the job description here..."
                  value={jobDesc}
                  onChange={(e) => setJobDesc(e.target.value)}
                />
              </div>
            </div>

            <button
              className="analyze-btn"
              onClick={handleAnalyze}
              disabled={analyzing}
            >
              {analyzing ? "Analyzing AI Models..." : "Check Match Score"}
            </button>
          </>
        ) : (
          /* RESULT DASHBOARD PLACEHOLDER */
          <div className="dashboard">
            <div className="score-circle">
              <span className="score-number">{result.score}%</span>
              <span className="score-label">Match</span>
            </div>

            <div className="feedback-grid">
              <div className="card feedback-card bad">
                <h4><AlertCircle size={16} /> Missing Keywords</h4>
                <ul>{result.missing.map(m => <li key={m}>{m}</li>)}</ul>
              </div>
              <div className="card feedback-card good">
                <h4><CheckCircle size={16} /> Matching Skills</h4>
                <ul>{result.matching.map(m => <li key={m}>{m}</li>)}</ul>
              </div>
            </div>

            <button className="btn-primary" onClick={() => setResult(null)}>Scan Another</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;