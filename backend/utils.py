import os
import re
from pdfminer.high_level import extract_text

def extract_text_from_pdf(file_path):
    try:
        text = extract_text(file_path)
        return text
    except Exception as e:
        print(f"Error reading PDF: {e}")
        return ""

def analyze_resume_structure(text):
    """
    Scans the resume for essential sections and contact info.
    Returns: Score, Breakdown of what exists/missing.
    """
    text = text.lower() # Convert to lowercase for easier searching
    
    score = 0
    feedback = {
        "present": [],
        "missing": []
    }

    # --- 1. CONTACT INFO CHECKS (25 Points) ---
    
    # Email Check (5 pts)
    if re.search(r'[\w\.-]+@[\w\.-]+', text):
        score += 5
        feedback["present"].append("Email Address")
    else:
        feedback["missing"].append("Email Address")

    # Phone Number Check (5 pts) - Matches 01x-xxxxxxx or +60
    if re.search(r'(\+?6?01)[0-46-9]-*[0-9]{7,8}', text):
        score += 5
        feedback["present"].append("Phone Number")
    else:
        feedback["missing"].append("Phone Number")

    # LinkedIn (5 pts)
    if "linkedin.com" in text:
        score += 5
        feedback["present"].append("LinkedIn Profile")
    else:
        feedback["missing"].append("LinkedIn Profile")
        
    # Location (10 pts) - Checking for common Malaysian keywords
    if any(loc in text for loc in ["malaysia", "kuala lumpur", "selangor", "penang", "johor", "kedah", "sarawak", "sabah"]):
        score += 10
        feedback["present"].append("Location (State/Country)")
    else:
        feedback["missing"].append("Location (State/Country)")


    # --- 2. CORE SECTIONS (40 Points) ---
    
    # Education (15 pts)
    if any(w in text for w in ["education", "academic", "university", "cgpa"]):
        score += 15
        feedback["present"].append("Education Section")
    else:
        feedback["missing"].append("Education Section")

    # Experience/Internship (15 pts)
    if any(w in text for w in ["experience", "internship", "employment", "work history"]):
        score += 15
        feedback["present"].append("Work/Internship Experience")
    else:
        feedback["missing"].append("Work/Internship Experience")

    # Summary/Objective (10 pts)
    if any(w in text for w in ["summary", "objective", "profile", "about me"]):
        score += 10
        feedback["present"].append("Professional Summary")
    else:
        feedback["missing"].append("Professional Summary")


    # --- 3. SKILLS & EXTRAS (35 Points) ---
    
    # Technical Skills (10 pts)
    if any(w in text for w in ["skills", "technologies", "technical", "programming", "languages"]):
        score += 10
        feedback["present"].append("Technical Skills")
    else:
        feedback["missing"].append("Technical Skills")
        
    # Soft Skills (5 pts)
    if any(w in text for w in ["leadership", "communication", "teamwork", "problem solving", "soft skills"]):
        score += 5
        feedback["present"].append("Soft Skills")
    else:
        feedback["missing"].append("Soft Skills (Keywords)")

    # Achievements/Awards (5 pts)
    if any(w in text for w in ["achievement", "award", "certification", "honor"]):
        score += 5
        feedback["present"].append("Achievements/Certifications")
    else:
        feedback["missing"].append("Achievements/Certifications")

    # Involvement/Co-curricular (5 pts)
    if any(w in text for w in ["involvement", "co-curricular", "club", "society", "volunteer"]):
        score += 5
        feedback["present"].append("Co-curricular Activities")
    else:
        feedback["missing"].append("Co-curricular Activities")

    # References (10 pts)
    if "references" in text or "referees" in text:
        score += 10
        feedback["present"].append("References")
    else:
        feedback["missing"].append("References")

    return score, feedback

def analyze_ats_compatibility(text, file_size_bytes):
    """
    Simulates how an ATS robot reads the file.
    Checks for readability, entity parsing, and formatting issues.
    """
    results = {
        "is_readable": True,
        "parsed_info": {},
        "issues": [],
        "raw_text_preview": text[:500] + "..." # First 500 chars
    }

    # 1. READABILITY CHECK (The "Empty PDF" Check)
    # If file is big (>50KB) but text is small (<100 chars), it's likely an Image/Scan.
    if len(text.strip()) < 50 and file_size_bytes > 50000:
        results["is_readable"] = False
        results["issues"].append("CRITICAL: Text not selectable. This looks like an Image/Scan.")
        return 0, results

    # 2. ENTITY PARSING (Can the robot find your details?)
    # Email
    email_match = re.search(r'[\w\.-]+@[\w\.-]+', text)
    if email_match:
        results["parsed_info"]["email"] = email_match.group(0)
    else:
        results["issues"].append("Parsing Error: Could not automatically detect Email.")

    # Phone
    phone_match = re.search(r'(\+?6?01)[0-46-9]-*[0-9]{7,8}', text)
    if phone_match:
        results["parsed_info"]["phone"] = phone_match.group(0)
    else:
        results["issues"].append("Parsing Error: Could not automatically detect Phone Number.")

    # 3. FORMATTING CHECKS
    # Check for weird characters (cid:12) which indicate font encoding errors
    if text.count('(cid:') > 3:
        results["issues"].append("Font Encoding Error: Your PDF uses fonts that turn into garbage text.")
    
    # Check for very long single lines (Parsing tables/columns wrongly)
    lines = text.split('\n')
    if any(len(line) > 300 for line in lines):
        results["issues"].append("Formatting Warning: Some text lines are extremely long. Avoid complex tables.")

    # 4. SCORING
    # Start perfect, deduct for issues
    ats_score = 100
    if not results["parsed_info"].get("email"): ats_score -= 25
    if not results["parsed_info"].get("phone"): ats_score -= 25
    if len(results["issues"]) > 0: ats_score -= (len(results["issues"]) * 10)
    
    return max(0, ats_score), results

def extract_skills(text):
    """
    Simple keyword matching for demo purposes.
    In production, use NLP (Spacy/NLTK).
    """
    text = text.lower()
    skills_db = [
        "python", "java", "javascript", "react", "node", "sql", "aws", "docker", 
        "communication", "leadership", "excel", "html", "css", "flask", "django"
    ]
    
    found_skills = []
    for skill in skills_db:
        if skill in text:
            found_skills.append(skill.capitalize())
            
    return found_skills

def match_jobs(user_skills):
    """
    Mock Job Database matching.
    """
    mock_jobs = [
        {"id": 1, "title": "Frontend Intern", "company": "TechCorp", "req": ["React", "Javascript", "Html", "Css"]},
        {"id": 2, "title": "Backend Intern", "company": "DataSystems", "req": ["Python", "Sql", "Flask"]},
        {"id": 3, "title": "Fullstack Intern", "company": "StartupX", "req": ["React", "Node", "Docker"]},
        {"id": 4, "title": "Business Analyst Intern", "company": "BizGroup", "req": ["Excel", "Communication", "Sql"]},
        {"id": 5, "title": "Cloud Engineer Intern", "company": "CloudNet", "req": ["Aws", "Docker", "Linux"]}
    ]
    
    matches = []
    user_skills_set = set([s.lower() for s in user_skills])
    
    for job in mock_jobs:
        job_req_set = set([r.lower() for r in job['req']])
        overlap = user_skills_set.intersection(job_req_set)
        
        if len(overlap) > 0:
            match_score = int((len(overlap) / len(job_req_set)) * 100)
            matches.append({
                "job": job,
                "score": match_score,
                "matched_skills": list(overlap)
            })
            
    # Sort by highest match score
    return sorted(matches, key=lambda x: x['score'], reverse=True)