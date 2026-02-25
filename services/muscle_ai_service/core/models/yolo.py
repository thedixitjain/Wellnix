"""
YOLO model loader module
"""
import logging
import torch

from ...config.settings import Config

logger = logging.getLogger(__name__)

def setup_gpu():
    """Configure GPU settings if available"""
    if torch.cuda.is_available():
        logger.info("CUDA is available. Setting up GPU acceleration")
        torch.backends.cudnn.benchmark = True
        torch.backends.cudnn.enabled = True
        return True
    logger.info("CUDA not available. Using CPU")
    return False

def get_yolo_models():
    """Load and optimize YOLO models"""
    try:
        # Import ultralytics lazily so the service can still boot without optional deps.
        from ultralytics import YOLO  # type: ignore

        logger.info("Loading YOLO models...")
        models = {}
        
        for exercise_type, model_path in Config.MODEL_PATHS.items():
            models[exercise_type] = YOLO(model_path)
        
        # Optimize for GPU if available
        use_gpu = setup_gpu()
        if use_gpu:
            for model in models.values():
                logger.info(f"Optimizing model for GPU")
                model.to('cuda')
                model.conf = 0.3
                model.iou = 0.45
                model.half()  # Use FP16
        
        logger.info("Models loaded successfully")
        return models
    except Exception as e:
        logger.error(f"Error loading YOLO models: {e}")
        raise