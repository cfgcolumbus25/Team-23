from flask import Flask
from config import Config
from extensions import init_extensions
from blueprints.users import user_bp

def create_app(config_object=Config):
    app = Flask(__name__)
    app.config.from_object(config_object)

    init_extensions(app)

    app.register_blueprint(user_bp, url_prefix="/learners")

    return app

if __name__ == "__main__":
    create_app().run(debug=True)
