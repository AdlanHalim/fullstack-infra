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