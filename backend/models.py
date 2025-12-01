from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import foreign
import datetime

db = SQLAlchemy()

# ----------------------
# DATABASE 1: MAIN (Operational)
# ----------------------
class User(db.Model):
    __tablename__ = 'users'
    # Normal Auth: All account info stays here
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False) # Moved back here
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

class Resume(db.Model):
    __tablename__ = 'resumes'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True) # Nullable because guests can upload
    
    # Metadata (Safe to store in main DB)
    job_description_snippet = db.Column(db.Text) # First few lines of job desc
    match_score = db.Column(db.Float)
    missing_keywords = db.Column(db.Text) # JSON string of keywords
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

    # Magic Link to PII DB
    pii = db.relationship(
        'ResumePII', 
        backref='resume', 
        uselist=False,
        primaryjoin="Resume.id == foreign(ResumePII.resume_id)", 
        cascade="all, delete-orphan"
    )

# ----------------------
# DATABASE 2: PII (Sensitive)
# ----------------------
class ResumePII(db.Model):
    __bind_key__ = 'pii_db' 
    __tablename__ = 'resume_pii'

    id = db.Column(db.Integer, primary_key=True)
    resume_id = db.Column(db.Integer, nullable=False, index=True)
    
    # The Dangerous Data
    original_filename = db.Column(db.String(255))
    file_path = db.Column(db.String(512)) # Path to file on disk
    extracted_text_dump = db.Column(db.Text) # Full text content of PDF
    extracted_contact_info = db.Column(db.Text) # JSON of phone/email/address