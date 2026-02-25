"""
Muscle AI Service - API Routes
Handles exercise form analysis and video processing endpoints
"""

from flask import Blueprint, render_template, request, url_for, Response, jsonify
import os
import logging
from datetime import datetime
from pathlib import Path

# Import service core modules
try:
    from ..core.models.analyzer import MovementAnalyzer
    from ..core.models.yolo import get_yolo_models
    from ..utils.video import process_video
except ImportError:
    MovementAnalyzer = None
    get_yolo_models = None
    process_video = None

logger = logging.getLogger(__name__)

# Create blueprint - templates loaded from app's template_folder + 'muscle-ai/'
muscle_ai_bp = Blueprint(
    'muscle',
    __name__,
    url_prefix='/muscle'
)

SUPPORTED_EXERCISES = [
    'regular_deadlift',
    'sumo_deadlift',
    'squat',
    'romanian_deadlift',
    'zercher_squat',
    'front_squat'
]

VIDEO_FOLDER = Path('data/uploads/videos')
PROCESSED_FOLDER = Path('data/processed/videos')
WEB_FOLDER = Path('web/static/videos')

for folder in [VIDEO_FOLDER, PROCESSED_FOLDER, WEB_FOLDER]:
    folder.mkdir(parents=True, exist_ok=True)

models = None

def init_models():
    """Initialize YOLO models"""
    global models
    if models is None:
        try:
            if get_yolo_models is None:
                raise RuntimeError("YOLO loader not available")
            models = get_yolo_models()
            logger.info("YOLO models loaded successfully")
        except Exception as e:
            logger.error(f"Failed to load YOLO models: {e}")
            models = {}


@muscle_ai_bp.route('/')
@muscle_ai_bp.route('/index')
def index():
    """Muscle AI landing page"""
    init_models()
    return render_template(
        'muscle-ai/index.html',
        gateway_url=os.environ.get('GATEWAY_URL', 'http://127.0.0.1:5000').rstrip('/'),
        supported_exercises=SUPPORTED_EXERCISES
    )


@muscle_ai_bp.route('/upload', methods=['POST'])
def upload():
    """Handle video upload and processing"""
    init_models()
    gateway_url = os.environ.get('GATEWAY_URL', 'http://127.0.0.1:5000').rstrip('/')
    
    if 'video' not in request.files:
        return render_template(
            'muscle-ai/index.html',
            message='No video file uploaded',
            gateway_url=gateway_url,
            supported_exercises=SUPPORTED_EXERCISES
        )
    
    file = request.files['video']
    if file.filename == '':
        return render_template(
            'muscle-ai/index.html',
            message='No selected file',
            gateway_url=gateway_url,
            supported_exercises=SUPPORTED_EXERCISES
        )
    
    if not file.filename.lower().endswith(('.mp4', '.avi', '.mov')):
        return render_template(
            'muscle-ai/index.html',
            message='Invalid file type. Please upload MP4, AVI, or MOV files',
            gateway_url=gateway_url,
            supported_exercises=SUPPORTED_EXERCISES
        )
    
    exercise_type = request.form.get('exercise_type')
    if exercise_type not in SUPPORTED_EXERCISES:
        return render_template(
            'muscle-ai/index.html',
            message='Invalid exercise type',
            gateway_url=gateway_url,
            supported_exercises=SUPPORTED_EXERCISES
        )
    
    try:
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        base_filename = os.path.splitext(file.filename)[0]
        filename = f"{timestamp}_{base_filename}"
        
        video_path = VIDEO_FOLDER / f"{filename}.mp4"
        processed_path = PROCESSED_FOLDER / f"processed_{filename}.mp4"
        web_filename = f'web_{filename}.mp4'
        web_path = WEB_FOLDER / web_filename
        
        file.save(str(video_path))
        logger.info(f"Saved video: {video_path}")
        
        if models and exercise_type in models:
            metrics = process_video(
                str(video_path),
                str(processed_path),
                str(web_path),
                exercise_type,
                models[exercise_type]
            )
            
            if video_path.exists():
                video_path.unlink()
            if processed_path.exists():
                processed_path.unlink()
            
            return render_template(
                'muscle-ai/index.html',
                video_url=url_for('static', filename=f'videos/{web_filename}'),
                movement_analysis={
                    'score': metrics['movement_assessment']['score'],
                    'metrics': metrics
                },
                gateway_url=gateway_url,
                supported_exercises=SUPPORTED_EXERCISES
            )
        else:
            return render_template(
                'muscle-ai/index.html',
                message=f'Model for {exercise_type} not available',
                gateway_url=gateway_url,
                supported_exercises=SUPPORTED_EXERCISES
            )
            
    except Exception as e:
        logger.error(f"Error processing upload: {e}", exc_info=True)
        return render_template(
            'muscle-ai/index.html',
            message=f'Error processing video: {str(e)}',
            gateway_url=gateway_url,
            supported_exercises=SUPPORTED_EXERCISES
        )


@muscle_ai_bp.route('/api/exercises', methods=['GET'])
def api_exercises():
    """Get list of supported exercises"""
    return jsonify({'exercises': SUPPORTED_EXERCISES}), 200


@muscle_ai_bp.route('/api/health', methods=['GET'])
def api_health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'muscle-ai-service',
        'version': '2.0.0',
        'models_loaded': models is not None and len(models) > 0
    }), 200


init_models()
