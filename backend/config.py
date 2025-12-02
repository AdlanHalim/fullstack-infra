# backend/config.py
import os
from dotenv import load_dotenv

load_dotenv()


basedir = os.path.abspath(os.path.dirname(__file__))

def fix_sqlite_uri(uri):
    if uri and uri.startswith('sqlite:///'):
        part = uri.replace('sqlite:///', '')
        if not os.path.isabs(part):
            return 'sqlite:///' + os.path.join(basedir, part)
    return uri

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY')
    SQLALCHEMY_DATABASE_URI = fix_sqlite_uri(os.getenv('DB_URI_MAIN'))
    SQLALCHEMY_BINDS = {
        'pii_db': fix_sqlite_uri(os.getenv('DB_URI_PII'))
    }
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # NEW: Secret key for JWT tokens
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'fallback_secret_key_change_me')