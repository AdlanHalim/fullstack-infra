# backend/config.py
import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY')
    SQLALCHEMY_DATABASE_URI = os.getenv('DB_URI_MAIN')
    SQLALCHEMY_BINDS = {
        'pii_db': os.getenv('DB_URI_PII')
    }
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # NEW: Secret key for JWT tokens
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'fallback_secret_key_change_me')