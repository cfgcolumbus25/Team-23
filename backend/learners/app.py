from flask import Flask
from flask_cors import CORS
from learners.routes.users import users_bp


def create_app():
    app = Flask(__name__)
    CORS(app, resources={r"/*": {"origins": "*"}})

    app.register_blueprint(users_bp, url_prefix="/learners")

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(port=5000, debug=True)
