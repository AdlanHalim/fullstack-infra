from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})  # allow all origins

@app.route('/ping')
def ping():
    return jsonify({"message": "pong"})

if __name__ == '__main__':
    app.run(port=5000)
