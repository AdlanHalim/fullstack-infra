# backend/models.py
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import foreign
import datetime

db = SQLAlchemy()

# ----------------------
# 🟢 DATABASE 1: MAIN (Operational)
# ----------------------
# This table knows NOTHING about the file content.
class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)

class Resume(db.Model):
    __tablename__ = 'resumes'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    
    # ✅ SAFE METADATA ONLY
    match_score = db.Column(db.Float)
    missing_keywords = db.Column(db.Text) # Stored as string "[Python, Java]"
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

    # The Magic Link to the Secret DB
    pii = db.relationship(
        'ResumePII', 
        backref='resume', 
        uselist=False,
        primaryjoin="Resume.id == foreign(ResumePII.resume_id)", 
        cascade="all, delete-orphan"
    )

# ----------------------
# 🔴 DATABASE 2: PII (Sensitive / Encrypted Storage)
# ----------------------
# All file details live HERE.
class ResumePII(db.Model):
    __bind_key__ = 'pii_db'  # <--- Sent to the Secure Database
    __tablename__ = 'resume_pii'

    id = db.Column(db.Integer, primary_key=True)
    resume_id = db.Column(db.Integer, nullable=False, index=True)
    
    # 🔒 SENSITIVE FILE DATA
    original_filename = db.Column(db.String(255)) 
    file_path = db.Column(db.String(512)) 
    extracted_text_dump = db.Column(db.Text)