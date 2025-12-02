import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename

from config import Config
from models import db, User, Resume, ResumePII
# Import all analysis functions
from utils import extract_text_from_pdf, analyze_resume_structure, analyze_ats_compatibility, extract_skills, match_jobs

app = Flask(__name__)
app.config.from_object(Config)


# --- CONFIGURATION ---
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Ensure instance folder exists for SQLite
instance_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'instance')
os.makedirs(instance_path, exist_ok=True)

CORS(app)
db.init_app(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

with app.app_context():
    db.create_all()

# --- ROUTES ---

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    if User.query.filter_by(email=data.get('email')).first():
        return jsonify({"error": "Email already exists"}), 400
    hashed_password = bcrypt.generate_password_hash(data.get('password')).decode('utf-8')
    new_user = User(username=data.get('username'), email=data.get('email'), password_hash=hashed_password)
    try:
        db.session.add(new_user)
        db.session.commit()
        return jsonify({"message": "User registered successfully!"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    user = User.query.filter_by(username=username).first()
    if user and bcrypt.check_password_hash(user.password_hash, password):
        access_token = create_access_token(identity=user.id)
        return jsonify({"token": access_token, "username": user.username}), 200
    return jsonify({"error": "Invalid credentials"}), 401

@app.route('/profile', methods=['GET'])
@jwt_required()
def get_user_profile():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    # Get all resumes, sorted by newest first
    resumes = Resume.query.filter_by(user_id=current_user_id).order_by(Resume.created_at.desc()).all()
    
    resume_list = []
    for r in resumes:
        # Get filename safely from PII
        filename = "Unknown File"
        if r.pii:
            filename = r.pii.original_filename

        resume_list.append({
            "id": r.id,
            "filename": filename,
            "date": r.created_at.strftime("%Y-%m-%d"),
            
            # Health Check Data
            "structure_score": r.structure_score,
            "structure_feedback": eval(r.structure_feedback) if r.structure_feedback else [],

            # ATS Data
            "ats_score": r.ats_score,
            "ats_feedback": eval(r.ats_feedback) if r.ats_feedback else [],
            
            # Skills Data (Privacy Safe)
            "skills": eval(r.skills_detected) if r.skills_detected else []
        })

    return jsonify({
        "username": user.username,
        "email": user.email,
        "resumes": resume_list
    })

# --- RESUME HEALTH CHECK (Upload New) ---
@app.route('/analyze', methods=['POST'])
@jwt_required(optional=True)
def analyze_resume():
    if 'resume' not in request.files:
        return jsonify({"error": "Missing resume file"}), 400
    file = request.files['resume']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    current_user_id = get_jwt_identity()
    
    filename = secure_filename(file.filename)
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(file_path)

    try:
        resume_text = extract_text_from_pdf(file_path)
        score, feedback = analyze_resume_structure(resume_text)
        
        # Extract Skills
        skills = extract_skills(resume_text)
        
        saved_status = False
        
        if current_user_id:
            new_resume = Resume(
                user_id=current_user_id,
                structure_score=score,
                structure_feedback=str(feedback['missing']),
                skills_detected=str(skills) # Save skills to Main DB
            )
            db.session.add(new_resume)
            db.session.flush()

            new_pii = ResumePII(
                resume_id=new_resume.id,
                original_filename=filename,
                file_path=file_path,
                extracted_text_dump=resume_text
            )
            db.session.add(new_pii)
            db.session.commit()
            saved_status = True
        else:
            if os.path.exists(file_path):
                os.remove(file_path)

        return jsonify({
            "score": score,
            "present": feedback["present"],
            "missing": feedback["missing"],
            "is_saved": saved_status
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# --- ATS SCANNER (Upload New) ---
@app.route('/ats-scan', methods=['POST'])
@jwt_required(optional=True)
def ats_scan():
    if 'resume' not in request.files:
        return jsonify({"error": "Missing resume file"}), 400
    file = request.files['resume']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    current_user_id = get_jwt_identity()
    filename = secure_filename(file.filename)
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(file_path)
    file_size = os.path.getsize(file_path)

    try:
        resume_text = extract_text_from_pdf(file_path)
        score, results = analyze_ats_compatibility(resume_text, file_size)
        
        # Extract Skills
        skills = extract_skills(resume_text)
        
        saved_status = False
        if current_user_id:
            new_resume = Resume(
                user_id=current_user_id,
                ats_score=score,
                ats_feedback=str(results['issues']),
                skills_detected=str(skills) # Save skills to Main DB
            )
            db.session.add(new_resume)
            db.session.flush()

            new_pii = ResumePII(
                resume_id=new_resume.id,
                original_filename=filename,
                file_path=file_path,
                extracted_text_dump=resume_text
            )
            db.session.add(new_pii)
            db.session.commit()
            saved_status = True
        else:
            if os.path.exists(file_path):
                os.remove(file_path)

        return jsonify({
            "score": score,
            "results": results,
            "is_saved": saved_status
        })

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# --- ATS RESCAN (Using History) ---
@app.route('/ats-rescan/<int:resume_id>', methods=['POST'])
@jwt_required()
def ats_rescan(resume_id):
    current_user_id = get_jwt_identity()

    # 1. Verify Ownership
    resume = Resume.query.filter_by(id=resume_id, user_id=current_user_id).first()
    if not resume:
        return jsonify({"error": "Resume not found or unauthorized"}), 404

    # 2. Retrieve Private Data
    resume_pii = resume.pii
    if not resume_pii:
        return jsonify({"error": "Original file not found in secure storage."}), 404

    try:
        file_path = resume_pii.file_path
        
        # Check if file exists
        if not os.path.exists(file_path):
             return jsonify({"error": "File missing from disk."}), 404

        file_size = os.path.getsize(file_path)
        
        # Prefer re-extracting to ensure fresh analysis
        resume_text = extract_text_from_pdf(file_path)

        # 4. Run ATS Logic
        score, results = analyze_ats_compatibility(resume_text, file_size)

        # 5. UPDATE the existing Resume row
        resume.ats_score = score
        resume.ats_feedback = str(results['issues'])
        
        # SELF-HEALING: If skills missing, extract and save
        if not resume.skills_detected:
            skills = extract_skills(resume_text)
            resume.skills_detected = str(skills)
            
        db.session.commit()

        return jsonify({
            "score": score,
            "results": results,
            "is_saved": True, 
            "filename": resume_pii.original_filename
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --- INTERNSHIP MATCHING ---
@app.route('/internship-match/<int:resume_id>', methods=['GET'])
@jwt_required()
def internship_match(resume_id):
    current_user_id = get_jwt_identity()
    
    # 1. Get Resume from Main DB
    resume = Resume.query.filter_by(id=resume_id, user_id=current_user_id).first()
    if not resume:
        return jsonify({"error": "Resume not found"}), 404
        
    # 2. Get Skills (Privacy Safe - No File Access Needed if already extracted)
    skills = []
    if resume.skills_detected:
        skills = eval(resume.skills_detected)
    else:
        # Fallback: If old resume, fetch from PII and update
        if resume.pii and os.path.exists(resume.pii.file_path):
            text = extract_text_from_pdf(resume.pii.file_path)
            skills = extract_skills(text)
            resume.skills_detected = str(skills)
            db.session.commit()
            
    # 3. Find Matches
    matches = match_jobs(skills)
    
    return jsonify({
        "skills_detected": skills,
        "matches": matches
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)