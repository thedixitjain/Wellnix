"""
Nutri AI Service - API Routes
Handles nutrition analysis and health scoring endpoints
"""

from flask import Blueprint, request, render_template, jsonify, redirect, url_for, session
from werkzeug.utils import secure_filename
import os
import json
from datetime import datetime
from pathlib import Path

# Import service core modules (internal microservice implementation)
from ..core.ocr.nutrition_extractor import extract_nutrition_info, parse_nutrition_table
from ..core.profile.process_profile import calculate_health_metrics
from ..core.scoring.consumability_agent import generate_consumability_score

# Create blueprint - templates are loaded from app's template_folder + 'nutri-ai/'
nutri_ai_bp = Blueprint(
    'health',
    __name__,
    url_prefix='/health'
)

# Configuration
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
UPLOAD_FOLDER = Path('data/uploads')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

# Ensure directories exist
UPLOAD_FOLDER.mkdir(parents=True, exist_ok=True)


def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@nutri_ai_bp.route('/')
def index():
    """Nutri AI landing page"""
    gateway_url = os.environ.get('GATEWAY_URL', 'http://127.0.0.1:5000').rstrip('/')
    return render_template('nutri-ai/index.html', gateway_url=gateway_url)


@nutri_ai_bp.route('/profile', methods=['GET', 'POST'])
def profile():
    """User profile creation and management"""
    gateway_url = os.environ.get('GATEWAY_URL', 'http://127.0.0.1:5000').rstrip('/')
    
    if request.method == 'POST':
        try:
            profile_data = {
                "age": int(request.form.get('age')),
                "gender": request.form.get('gender'),
                "height_cm": float(request.form.get('height_cm')),
                "weight_kg": float(request.form.get('weight_kg')),
                "activity_level": request.form.get('activity_level'),
                "diet_type": request.form.get('diet_type'),
                "goal": request.form.get('goal'),
                "smoker": request.form.get('smoker') == 'true',
                "alcohol_consumption": request.form.get('alcohol_consumption'),
                "allergies": request.form.get('allergies', '').split(',') if request.form.get('allergies') else [],
                "medical_history": {
                    "diseases": json.loads(request.form.get('diseases', '[]')),
                    "family_history": request.form.get('family_history', '').split(',') if request.form.get('family_history') else []
                },
                "food_preferences": {
                    "cuisine": request.form.get('cuisine', '').split(',') if request.form.get('cuisine') else [],
                    "spice_tolerance": request.form.get('spice_tolerance'),
                    "meal_frequency": int(request.form.get('meal_frequency', 3))
                },
                "hydration_level": request.form.get('hydration_level'),
                "sleep_hours": float(request.form.get('sleep_hours', 7.0)),
                "stress_level": request.form.get('stress_level')
            }
            
            session['user_profile'] = profile_data
            health_metrics = calculate_health_metrics(profile_data)
            session['health_metrics'] = health_metrics
            
            return redirect(url_for('health.upload_nutrition'))
            
        except Exception as e:
            return jsonify({'error': f'Profile processing error: {str(e)}'}), 400
    
    return render_template('nutri-ai/profile.html', gateway_url=gateway_url)


@nutri_ai_bp.route('/upload', methods=['GET', 'POST'])
def upload_nutrition():
    """Nutrition label upload and OCR processing"""
    gateway_url = os.environ.get('GATEWAY_URL', 'http://127.0.0.1:5000').rstrip('/')
    
    if request.method == 'POST':
        if 'file' not in request.files:
            return jsonify({'error': 'No file part'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400
        
        if file and allowed_file(file.filename):
            try:
                filename = secure_filename(file.filename)
                timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
                filename = f"{timestamp}_{filename}"
                filepath = UPLOAD_FOLDER / filename
                file.save(str(filepath))
                
                extracted_text = extract_nutrition_info(str(filepath))
                nutrition_info = parse_nutrition_table(extracted_text)
                
                session['nutrition_info'] = nutrition_info
                
                if filepath.exists():
                    filepath.unlink()
                
                return redirect(url_for('health.results'))
                
            except Exception as e:
                return jsonify({'error': f'OCR processing error: {str(e)}'}), 500
        else:
            return jsonify({'error': 'Invalid file type. Please upload PNG, JPG, or JPEG'}), 400
    
    return render_template('nutri-ai/upload.html', gateway_url=gateway_url)


@nutri_ai_bp.route('/results')
def results():
    """Display nutrition analysis results"""
    gateway_url = os.environ.get('GATEWAY_URL', 'http://127.0.0.1:5000').rstrip('/')
    
    if 'user_profile' not in session or 'nutrition_info' not in session:
        return redirect(url_for('health.index'))
    
    user_profile = session['user_profile']
    nutrition_info = session['nutrition_info']
    health_metrics = session.get('health_metrics', {})
    
    try:
        score, explanation = generate_consumability_score(
            user_profile,
            nutrition_info,
            health_metrics,
            api_key=GROQ_API_KEY
        )
        
        result = {
            'user_profile': user_profile,
            'nutrition_info': nutrition_info,
            'health_metrics': health_metrics,
            'consumability_score': score,
            'explanation': explanation,
            'timestamp': datetime.now().isoformat()
        }
        
        output_dir = Path('data/outputs/nutri-ai')
        output_dir.mkdir(parents=True, exist_ok=True)
        
        timestamp = datetime.now().strftime('%Y_%m_%d_%H_%M_%S')
        output_file = output_dir / f'result_{timestamp}.json'
        
        with open(output_file, 'w') as f:
            json.dump(result, f, indent=2)
        
        return render_template(
            'nutri-ai/results.html',
            score=score,
            explanation=explanation,
            nutrition=nutrition_info,
            health_metrics=health_metrics,
            gateway_url=gateway_url
        )
        
    except Exception as e:
        return jsonify({'error': f'Analysis error: {str(e)}'}), 500


# API Endpoints

@nutri_ai_bp.route('/api/analyze', methods=['POST'])
def api_analyze():
    """API endpoint for nutrition analysis"""
    
    try:
        data = request.get_json()
        
        required_fields = ['user_profile', 'nutrition_info']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        health_metrics = calculate_health_metrics(data['user_profile'])
        
        score, explanation = generate_consumability_score(
            data['user_profile'],
            data['nutrition_info'],
            health_metrics,
            api_key=GROQ_API_KEY
        )
        
        return jsonify({
            'success': True,
            'score': score,
            'explanation': explanation,
            'health_metrics': health_metrics
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@nutri_ai_bp.route('/api/health', methods=['GET'])
def api_health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'nutri-ai-service',
        'version': '2.0.0'
    }), 200
