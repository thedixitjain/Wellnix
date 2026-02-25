# """
# Movement analysis module
# """
# import numpy as np

# class MovementAnalyzer:
#     """
#     Analyzes exercise form and provides metrics on movement quality.
#     This is a placeholder - you should implement the full functionality 
#     from your original codebase.
#     """
#     def __init__(self, exercise_type):
#         self.exercise_type = exercise_type
#         self.form_values = []
#         self.depth_values = []
#         self.repetitions = 0
#         self.in_rep = False
#         self.down_threshold = 0.8  # Threshold for detecting bottom position
#         self.rep_threshold = 0.89  # Threshold for counting a rep
        
#     def process_frame(self, labels):
#         """Process a single frame with detected labels"""
#         # Calculate form and depth values based on labels
#         # This is simplified - implement your actual logic here
#         form_value = max([labels.get(label, 0) for label in ["good_form", "proper_form"]], default=0)
#         down_value = max([labels.get(label, 0) for label in ["down", "bottom_position"]], default=0)
        
#         # Track rep counting logic
#         if down_value > self.down_threshold and not self.in_rep:
#             self.in_rep = True
#         elif down_value < self.rep_threshold and self.in_rep:
#             self.in_rep = False
#             self.repetitions += 1
            
#         # Store metrics
#         self.form_values.append(form_value)
#         self.depth_values.append(down_value)
        
#         return form_value, down_value
        
#     def get_metrics(self):
#         """Calculate and return movement metrics"""
#         if not self.form_values:
#             return None
            
#         form_avg = np.mean(self.form_values) if self.form_values else 0
#         form_std = np.std(self.form_values) if len(self.form_values) > 1 else 0
        
#         depth_avg = np.mean(self.depth_values) if self.depth_values else 0
#         depth_std = np.std(self.depth_values) if len(self.depth_values) > 1 else 0
        
#         # Calculate quality scores
#         form_quality = min(10, form_avg * 10)
#         depth_quality = min(10, depth_avg * 10)
        
#         # Calculate consistency scores (lower std = better consistency)
#         form_consistency = min(10, (1 - form_std) * 10)
#         depth_consistency = min(10, (1 - depth_std) * 10)
        
#         # Overall score
#         overall_score = int(round((form_quality + depth_quality + 
#                                    form_consistency + depth_consistency) / 4))
        
#         return {
#             "repetitions": self.repetitions,
#             "form_metrics": {
#                 "average": form_avg,
#                 "std_dev": form_std
#             },
#             "depth_metrics": {
#                 "average": depth_avg,
#                 "std_dev": depth_std
#             },
#             "movement_assessment": {
#                 "form_quality": round(form_quality, 1),
#                 "depth_quality": round(depth_quality, 1),
#                 "form_consistency": round(form_consistency, 1),
#                 "depth_consistency": round(depth_consistency, 1),
#                 "score": overall_score
#             }
#         }
# app/models/analyzer.py
import numpy as np
import math
class MovementAnalyzer:
    def __init__(self, exercise_type):
        self.exercise_type = exercise_type
        self.form_scores = []  # ibw for regular/squat, up for others
        self.down_scores = []
        self.rep_count = 0
        
        # Rep counting parameters
        self.form_values = []  # Store recent form values for smoothing
        self.window_size = 5   # Number of frames to use for smoothing
        self.rep_threshold = 0.89  # Threshold for rep detection
        self.min_frames_between_reps = 10  # Minimum frames between reps to prevent double counting
        self.frames_since_last_rep = 0
        self.in_rep_motion = False
        self.rep_start_threshold = 0.85  # Start of rep threshold
        self.rep_end_threshold = 0.92    # End of rep threshold
        self.min_rep_frames = 5  # Minimum frames a rep motion should take
        self.current_rep_frames = 0

    def smooth_value(self, value):
        """Apply moving average smoothing to reduce noise"""
        self.form_values.append(value if value is not None else self.form_values[-1] if self.form_values else 0)
        if len(self.form_values) > self.window_size:
            self.form_values.pop(0)
        return sum(self.form_values) / len(self.form_values)

    def detect_rep(self, smoothed_value):
        """Detect repetition using state machine approach"""
        self.frames_since_last_rep += 1
        
        if smoothed_value is None:
            return
        
        # Update rep detection state
        if not self.in_rep_motion:
            # Looking for the start of a rep
            if (smoothed_value < self.rep_start_threshold and 
                self.frames_since_last_rep > self.min_frames_between_reps):
                self.in_rep_motion = True
                self.current_rep_frames = 1
        else:
            # In the middle of a rep motion
            self.current_rep_frames += 1
            
            # Check for rep completion
            if (smoothed_value > self.rep_end_threshold and 
                self.current_rep_frames >= self.min_rep_frames):
                self.rep_count += 1
                self.frames_since_last_rep = 0
                self.in_rep_motion = False
                self.current_rep_frames = 0
            
            # Reset if rep takes too long
            elif self.current_rep_frames > self.min_frames_between_reps * 2:
                self.in_rep_motion = False
                self.current_rep_frames = 0

    def process_frame(self, labels):
        """Process a single frame's labels and update metrics"""
        # Get appropriate form value based on exercise type
        if self.exercise_type in ['regular_deadlift', 'squat']:
            form_value = labels.get('ibw', None)
        else:
            form_value = labels.get('up', None)
        
        down_value = labels.get('down', None)

        # Update scores
        if form_value is not None:
            self.form_scores.append(form_value)
        if down_value is not None:
            self.down_scores.append(down_value)

        # Apply smoothing and detect reps
        smoothed_value = self.smooth_value(form_value)
        self.detect_rep(smoothed_value)
        
        return form_value, down_value

    def get_metrics(self):
        """Calculate and return movement metrics"""
        if not self.form_scores or not self.down_scores:
            return None

        metrics = {
            'frames_analyzed': len(self.form_scores),
            'repetitions': self.rep_count,
            'form_metrics': {
                'average': np.mean(self.form_scores),
                'min': min(self.form_scores),
                'max': max(self.form_scores),
                'consistency': 1 - (max(self.form_scores) - min(self.form_scores))
            },
            'depth_metrics': {
                'average': np.mean(self.down_scores),
                'min': min(self.down_scores),
                'max': max(self.down_scores),
                'consistency': 1 - (max(self.down_scores) - min(self.down_scores))
            }
        }

        # Calculate overall score out of 10
        form_component = metrics['form_metrics']['average'] * 0.6
        depth_component = metrics['depth_metrics']['average'] * 0.4
        overall_score = (form_component + depth_component) * 10

        metrics['movement_assessment'] = {
            'form_quality': self.get_quality_assessment(metrics['form_metrics']['average']),
            'depth_quality': self.get_quality_assessment(metrics['depth_metrics']['average']),
            'form_consistency': self.get_quality_assessment(metrics['form_metrics']['consistency']),
            'depth_consistency': self.get_quality_assessment(metrics['depth_metrics']['consistency']),
            'score': round(overall_score, 1)
        }

        return metrics

    @staticmethod
    def get_quality_assessment(value):
        """Return a qualitative assessment based on the metric value"""
        if value >= 0.9:
            return math.ceil(value*10)
        elif value >= 0.8:
            return math.ceil(value*10)
        elif value >= 0.7:
            return math.ceil(value*10)
        elif value >= 0.6:
            return math.ceil(value*10)
        else:
            return math.ceil(value*10)