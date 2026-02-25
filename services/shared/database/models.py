"""
Wellnix Database Models
Shared across all microservices
"""

from datetime import datetime, timezone
from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()


class User(db.Model, UserMixin):
    """User account model"""
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    
    # OAuth providers
    google_id = db.Column(db.String(255), unique=True, nullable=True, index=True)
    
    # Subscription
    plan = db.Column(db.String(20), default='free')  # free, pro, enterprise
    scans_this_month = db.Column(db.Integer, default=0)
    scans_reset_date = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    
    # Profile data (for Nutri AI)
    age = db.Column(db.Integer)
    gender = db.Column(db.String(20))
    height_cm = db.Column(db.Float)
    weight_kg = db.Column(db.Float)
    activity_level = db.Column(db.String(50))
    diet_type = db.Column(db.String(50))
    goal = db.Column(db.String(50))
    medical_conditions = db.Column(db.JSON, default=list)
    allergies = db.Column(db.JSON, default=list)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    last_login = db.Column(db.DateTime)
    
    # Relationships
    scans = db.relationship('ScanHistory', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    workouts = db.relationship('WorkoutSession', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def can_scan(self):
        """Check if user can perform a scan based on plan limits"""
        if self.plan in ['pro', 'enterprise']:
            return True
        # Free users: 5 scans per month
        return self.scans_this_month < 5
    
    def increment_scan_count(self):
        """Increment monthly scan count"""
        now = datetime.now(timezone.utc)
        # Reset if new month
        if self.scans_reset_date and self.scans_reset_date.month != now.month:
            self.scans_this_month = 0
            self.scans_reset_date = now
        self.scans_this_month += 1
    
    @property
    def health_score(self):
        """Calculate overall health score from recent activity"""
        recent_scans = self.scans.order_by(ScanHistory.created_at.desc()).limit(10).all()
        recent_workouts = self.workouts.order_by(WorkoutSession.created_at.desc()).limit(10).all()
        
        nutri_score = sum(s.score for s in recent_scans) / len(recent_scans) if recent_scans else 0
        fitness_score = sum(w.form_score for w in recent_workouts) / len(recent_workouts) if recent_workouts else 0
        
        if recent_scans and recent_workouts:
            return round((nutri_score * 0.5 + fitness_score * 0.5), 1)
        elif recent_scans:
            return round(nutri_score, 1)
        elif recent_workouts:
            return round(fitness_score, 1)
        return 0
    
    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'name': self.name,
            'plan': self.plan,
            'health_score': self.health_score,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class ScanHistory(db.Model):
    """Nutrition scan history"""
    __tablename__ = 'scan_history'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    
    # Product info
    product_name = db.Column(db.String(255))
    brand = db.Column(db.String(255))
    barcode = db.Column(db.String(50))
    
    # Nutrition data
    nutrition_data = db.Column(db.JSON)
    
    # Analysis results
    score = db.Column(db.Float, nullable=False)
    explanation = db.Column(db.Text)
    recommendations = db.Column(db.JSON)
    
    # Context
    meal_type = db.Column(db.String(20))  # breakfast, lunch, dinner, snack
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    
    @property
    def grade(self):
        if self.score >= 80: return 'A'
        if self.score >= 60: return 'B'
        if self.score >= 40: return 'C'
        if self.score >= 20: return 'D'
        return 'F'

    @property
    def calories(self):
        if self.nutrition_data and isinstance(self.nutrition_data, dict):
            return self.nutrition_data.get('calories') or self.nutrition_data.get('energy_kcal')
        return None

    def to_dict(self):
        return {
            'id': self.id,
            'product_name': self.product_name,
            'brand': self.brand,
            'score': self.score,
            'grade': self.grade,
            'calories': self.calories,
            'meal_type': self.meal_type,
            'nutrition_data': self.nutrition_data,
            'explanation': self.explanation,
            'recommendations': self.recommendations,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class WorkoutSession(db.Model):
    """Workout/exercise session history"""
    __tablename__ = 'workout_sessions'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    
    # Exercise info
    exercise_type = db.Column(db.String(50), nullable=False)
    
    # Performance metrics
    form_score = db.Column(db.Float, nullable=False)
    reps = db.Column(db.Integer)
    sets = db.Column(db.Integer)
    weight_kg = db.Column(db.Float)
    duration_seconds = db.Column(db.Integer)
    
    # Analysis results
    form_quality = db.Column(db.Float)
    depth_quality = db.Column(db.Float)
    consistency = db.Column(db.Float)
    feedback = db.Column(db.JSON)
    
    # Video reference
    video_path = db.Column(db.String(500))
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'exercise_type': self.exercise_type,
            'form_score': self.form_score,
            'reps': self.reps,
            'sets': self.sets,
            'weight_kg': self.weight_kg,
            'duration_seconds': self.duration_seconds,
            'feedback': self.feedback,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class Achievement(db.Model):
    """User achievements/badges"""
    __tablename__ = 'achievements'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    
    type = db.Column(db.String(50), nullable=False)  # streak, milestone, etc.
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(255))
    icon = db.Column(db.String(10))  # emoji
    
    unlocked_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))


class APIKey(db.Model):
    """Developer API keys"""
    __tablename__ = 'api_keys'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    
    key = db.Column(db.String(64), unique=True, nullable=False, index=True)
    name = db.Column(db.String(100))
    
    # Rate limiting
    requests_today = db.Column(db.Integer, default=0)
    requests_reset_date = db.Column(db.Date)
    rate_limit = db.Column(db.Integer, default=1000)  # requests per day
    
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    last_used = db.Column(db.DateTime)


def init_db(app):
    """Initialize database with app context"""
    db.init_app(app)
    with app.app_context():
        db.create_all()

