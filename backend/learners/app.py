from flask import Flask
from flask_cors import CORS
from routes.users import users_bp

app = Flask(__name__)
CORS(app, resources={r"/learners/*": {"origins": "*"}})

app.register_blueprint(users_bp)

if __name__ == "__main__":
    app.run(port=5000, debug=True)