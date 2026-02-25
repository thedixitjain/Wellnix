"""
Muscle AI microservice entrypoint.

Runs the Muscle AI Flask blueprint as a standalone service (default port 5002).
"""

import os
from pathlib import Path

from flask import Flask
from flask_cors import CORS

from .api.routes import muscle_ai_bp


def create_app() -> Flask:
    root = Path(__file__).resolve().parents[2]

    app = Flask(
        __name__,
        template_folder=str(root / 'web' / 'templates'),
        static_folder=str(root / 'web' / 'static'),
    )

    # Enable CORS for API endpoints
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Secret key for sessions (used by some templates/forms)
    app.secret_key = os.environ.get('SECRET_KEY', os.urandom(24))

    # Blueprint contains url_prefix='/muscle'
    app.register_blueprint(muscle_ai_bp)

    return app


if __name__ == '__main__':
    app = create_app()
    app.run(
        host='0.0.0.0',
        port=int(os.environ.get('MUSCLE_AI_PORT', '5002')),
        debug=os.environ.get('FLASK_DEBUG') == '1',
    )


