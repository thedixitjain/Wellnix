"""
Celery tasks for async processing.
"""

import os
import requests
from pathlib import Path
from .celery_app import celery_app

MUSCLE_AI_URL = os.environ.get('MUSCLE_AI_URL', 'http://localhost:5002').rstrip('/')


@celery_app.task(bind=True, name='wellnix.analyze_video')
def analyze_video(self, video_path: str, exercise_type: str) -> dict:
    """Send a saved video to the Muscle AI service for analysis."""
    video = Path(video_path)
    if not video.exists():
        return {'error': 'Video file not found', 'status': 'failed'}

    try:
        with open(video_path, 'rb') as f:
            files = {'video': (video.name, f, 'video/mp4')}
            data = {'exercise_type': exercise_type}
            resp = requests.post(
                f'{MUSCLE_AI_URL}/muscle/upload',
                files=files,
                data=data,
                timeout=120,
            )

        if video.exists():
            video.unlink()

        if resp.status_code == 200:
            return {'status': 'completed', 'result': resp.json() if resp.headers.get('content-type', '').startswith('application/json') else {'html': resp.text}}
        return {'status': 'failed', 'error': f'Service returned {resp.status_code}'}
    except Exception as exc:
        return {'status': 'failed', 'error': str(exc)}
