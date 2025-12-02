import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename # <--- Added this missing import

from config import Config
# FIX: Import db and models so Python knows what they are
from models import db, User, Resume, ResumePII 
from utils import extract_text_from_pdf, analyze_resume_structure

app = Flask(__name__)
app.config.from_object(Config)

# --- CONFIGURATION ---
# Create a folder to save uploaded files if it doesn't exist
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# 1. Enable CORS (Allow React to talk to us)
CORS(app)

# 2. Initialize Tools
db.init_app(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

# Create tables if they don't exist
with app.app_context():
    db.create_all()

# --- ROUTES ---

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    # Simple check
    if User.query.filter_by(email=data.get('email')).first():
        return jsonify({"error": "Email already exists"}), 400

    hashed_password = bcrypt.generate_password_hash(data.get('password')).decode('utf-8')

    # All data goes to Main DB now
    new_user = User(
        username=data.get('username'), 
        email=data.get('email'), 
        password_hash=hashed_password
    )
    
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

    # 1. Find user in Main DB
    user = User.query.filter_by(username=username).first()

    # 2. Check password hash
    if user and bcrypt.check_password_hash(user.password_hash, password):
        # 3. Create a Token (VIP Pass)
        access_token = create_access_token(identity=user.id)
        return jsonify({"token": access_token, "username": user.username}), 200
    
    return jsonify({"error": "Invalid credentials"}), 401

@app.route('/profile', methods=['GET'])
@jwt_required() # <--- PROTECTED ROUTE
def get_user_profile():
    current_user_id = get_jwt_identity()
    
    # 1. Get User Info
    user = User.query.get(current_user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    # 2. Get Past Resumes (From Main DB)
    resumes = Resume.query.filter_by(user_id=current_user_id).order_by(Resume.created_at.desc()).all()
    
    resume_list = []
    for r in resumes:
        resume_list.append({
            "id": r.id,
            "score": r.match_score,
            "date": r.created_at.strftime("%Y-%m-%d"),
            "missing": eval(r.missing_keywords) if r.missing_keywords else []
        })

    return jsonify({
        "username": user.username,
        "email": user.email,
        "resumes": resume_list
    })

@app.route('/analyze', methods=['POST'])
@jwt_required(optional=True) # <--- CRITICAL CHANGE: Allows guests
def analyze_resume():
    # 1. Check if file exists
    if 'resume' not in request.files:
        return jsonify({"error": "Missing resume file"}), 400
    
    file = request.files['resume']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    # 2. Check who is calling (User or Guest?)
    current_user_id = get_jwt_identity()
    
    # 3. Save file temporarily (Required for PDF extraction)
    filename = secure_filename(file.filename)
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(file_path)

    try:
        # 4. AI PROCESSING
        resume_text = extract_text_from_pdf(file_path)
        score, feedback = analyze_resume_structure(resume_text)

        # 5. DATABASE LOGIC (The Filter)
        if current_user_id:
            # --- AUTHENTICATED USER: SAVE DATA ---
            print(f"User {current_user_id} detected. Saving to DB...")
            
            # A. Main DB
            new_resume = Resume(
                user_id=current_user_id, # Link to user                
                match_score=score,
                missing_keywords=str(feedback['missing'])
            )
            db.session.add(new_resume)
            db.session.flush()

            # B. PII DB
            new_pii = ResumePII(
                resume_id=new_resume.id,
                original_filename=filename,
                file_path=file_path, # We keep the file for registered users
                extracted_text_dump=resume_text
            )
            db.session.add(new_pii)
            db.session.commit()
            saved_status = True
            
        else:
            # --- GUEST USER: DO NOT SAVE ---
            print("Guest detected. Skipping Database.")
            
            # Security Cleanup: Delete the uploaded file immediately
            if os.path.exists(file_path):
                os.remove(file_path)
            
            saved_status = False

        # 6. Return Result
        return jsonify({
            "score": score,
            "present": feedback["present"],
            "missing": feedback["missing"],
            "is_saved": saved_status # Tell frontend if we saved it
        })

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)