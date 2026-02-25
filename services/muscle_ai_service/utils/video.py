"""
Video processing utilities
"""
import os
import logging
import cv2
import torch
import numpy as np
from ..core.models.analyzer import MovementAnalyzer

logger = logging.getLogger(__name__)

class NullContext:
    """A context manager that does nothing"""
    def __enter__(self): return None
    def __exit__(self, *excinfo): pass

def process_video(video_path, output_path, web_path, exercise_type, yolo_model):
    """
    Process a video using the YOLO model and movement analyzer
    
    Args:
        video_path (str): Path to the input video
        output_path (str): Path for the processed video
        web_path (str): Path for the web-friendly video
        exercise_type (str): Type of exercise for analysis
        yolo_model: The YOLO model to use for detection
        
    Returns:
        dict: Movement metrics
    """
    try:
        # Optional dependency: moviepy (only needed for conversion step)
        from moviepy.video.io.VideoFileClip import VideoFileClip  # type: ignore

        use_gpu = torch.cuda.is_available()
        logger.info(f"Processing video with GPU acceleration: {use_gpu}")
        
        analyzer = MovementAnalyzer(exercise_type)
        
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            raise IOError("Error opening video file")

        # Get video properties
        frame_width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        frame_height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        fps = cap.get(cv2.CAP_PROP_FPS)
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

        # Use NVIDIA encoder if available
        if use_gpu:
            fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        else:
            fourcc = cv2.VideoWriter_fourcc(*'XVID')

        out = cv2.VideoWriter(
            output_path,
            fourcc,
            fps,
            (frame_width, frame_height)
        )

        # Batch processing parameters
        batch_size = 4 if use_gpu else 1
        
        # Use CUDA stream for parallel processing
        with torch.cuda.amp.autocast() if use_gpu else NullContext():
            for _ in range(0, total_frames, batch_size):
                frames_buffer = []
                for _ in range(batch_size):
                    ret, frame = cap.read()
                    if ret:
                        frames_buffer.append(frame)
                    else:
                        break
                
                if not frames_buffer:
                    break

                # Process batch
                if use_gpu:
                    frames_tensor = torch.from_numpy(np.stack(frames_buffer)).cuda().half()
                    results = yolo_model(frames_tensor, stream=True)
                else:
                    results = yolo_model(frames_buffer, stream=True)

                # Process results
                for frame, result in zip(frames_buffer, results):
                    labels = {}
                    if result.boxes is not None:
                        for box in result.boxes:
                            class_id = int(box.cls)
                            conf = float(box.conf)
                            label = result.names[class_id]
                            labels[label] = conf

                    form_value, down_value = analyzer.process_frame(labels)

                    if hasattr(result, 'keypoints') and result.keypoints is not None:
                        keypoints = result.keypoints.xy[0]
                        for point in keypoints:
                            x, y = int(point[0]), int(point[1])
                            cv2.circle(frame, (x, y), 5, (0, 255, 0), -1)

                    metrics = analyzer.get_metrics()
                    if metrics:
                        cv2.putText(frame, f"Score: {metrics['movement_assessment']['score']}/10",
                                  (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
                        cv2.putText(frame, f"Reps: {metrics['repetitions']}",
                                  (50, 100), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)

                    out.write(frame)

                # Clear GPU cache periodically
                if use_gpu and _ % (batch_size * 10) == 0:
                    torch.cuda.empty_cache()

        cap.release()
        out.release()

        # Convert to web format using GPU acceleration
        logger.info("Converting video to web format")
        clip = VideoFileClip(output_path)
        
        if use_gpu:
            clip.write_videofile(web_path, 
                               codec='libx264',
                               preset='fast',
                               threads=4,
                               ffmpeg_params=[
                                   '-hwaccel', 'cuda',
                                   '-hwaccel_output_format', 'cuda',
                                   '-c:v', 'h264_nvenc',
                                   '-preset', 'p4',
                                   '-tune', 'zerolatency'
                               ])
        else:
            clip.write_videofile(web_path, codec='libx264')
            
        clip.close()
        
        return analyzer.get_metrics()

    except Exception as e:
        logger.error(f"Error processing video: {e}")
        raise