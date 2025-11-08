from flask import Flask
from flask_cors import CORS
from routes.users import users_bp
from routes.universities import universities_bp

def create_app():
    app = Flask(__name__)
    # More comprehensive CORS configuration for macOS compatibility
    # Explicitly allow all origins (like before) but with more explicit method/header support
    CORS(app, 
         resources={r"/*": {
             "origins": "*",
             "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
             "allow_headers": ["Content-Type", "Authorization", "X-Requested-With"],
             "supports_credentials": False  # Set to False when using wildcard origins
         }})

    app.register_blueprint(users_bp, url_prefix="/learners")
    app.register_blueprint(universities_bp, url_prefix="/universities")

    return app


if __name__ == "__main__":
    app = create_app()
    # Explicitly bind to 0.0.0.0 to ensure accessibility on macOS
    # Using port 5001 to avoid conflict with macOS AirPlay Receiver on port 5000
    app.run(host='0.0.0.0', port=5002, debug=True)
