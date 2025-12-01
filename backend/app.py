from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token
from config import Config
from models import db, User, UserPII

app = Flask(__name__)
app.config.from_object(Config)

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

# ... (imports stay the same)
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

# ... (Login remains similar, just check email/username)

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

if __name__ == '__main__':
    app.run(debug=True, port=5000)