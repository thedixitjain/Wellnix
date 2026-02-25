"""
Nutri AI microservice entrypoint.

Runs the Nutri AI Flask blueprint as a standalone service (default port 5001).
"""

import os
from pathlib import Path

from flask import Flask
from flask_cors import CORS

from .api.routes import nutri_ai_bp


def create_app() -> Flask:
    root = Path(__file__).resolve().parents[2]

    app = Flask(
        __name__,
        template_folder=str(root / 'web' / 'templates'),
        static_folder=str(root / 'web' / 'static'),
    )

    # Enable CORS for API endpoints
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Secret key for sessions
    app.secret_key = os.environ.get('SECRET_KEY', os.urandom(24))

    # Blueprint contains url_prefix='/health'
    app.register_blueprint(nutri_ai_bp)

    return app


if __name__ == '__main__':
    app = create_app()
    app.run(
        host='0.0.0.0',
        port=int(os.environ.get('NUTRI_AI_PORT', '5001')),
        debug=os.environ.get('FLASK_DEBUG') == '1',
    )


