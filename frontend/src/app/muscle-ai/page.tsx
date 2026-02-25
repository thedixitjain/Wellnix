'use client';

import { useState, useCallback } from 'react';
import { apiFetch } from '@/lib/api';
import { usePolling } from '@/hooks/usePolling';
import type { MuscleTaskStatus } from '@/lib/types';
import ExerciseSelect from '@/components/muscle-ai/ExerciseSelect';
import VideoUpload from '@/components/muscle-ai/VideoUpload';
import AnalysisResults from '@/components/muscle-ai/AnalysisResults';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';

export default function MuscleAIPage() {
  const [exercise, setExercise] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [taskId, setTaskId] = useState('');
  const [syncResult, setSyncResult] = useState<any>(null);

  const fetcher = useCallback(
    () => apiFetch<MuscleTaskStatus>(`/muscle-ai/task/${taskId}`),
    [taskId],
  );

  const { data: taskData, polling, start: startPolling } = usePolling(
    fetcher,
    (d) => d.status === 'completed' || d.status === 'failed',
    3000,
  );

  async function handleUpload() {
    if (!file || !exercise) return;
    setUploading(true);
    setError('');
    setSyncResult(null);

    const body = new FormData();
    body.append('video', file);
    body.append('exercise_type', exercise);

    try {
      const res = await apiFetch<any>('/muscle-ai/upload', { method: 'POST', body });
      if (res.task_id) {
        setTaskId(res.task_id);
        setTimeout(() => startPolling(), 500);
      } else {
        setSyncResult(res);
      }
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  const isComplete = taskData?.status === 'completed' || syncResult;
  const resultData = syncResult || taskData?.result;

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <div className="mb-12 text-center">
        <span className="mb-4 inline-block rounded-full border border-accent/30 bg-accent-glow px-3 py-1 text-xs font-semibold text-accent">
          MUSCLE AI
        </span>
        <h1 className="font-display text-3xl font-bold sm:text-4xl">
          AI-powered <span className="text-accent">form analysis</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-text-secondary">
          Select your exercise, upload a video, and get real-time feedback on your form with rep counting and injury prevention tips.
        </p>
      </div>

      {error && <Alert variant="error" className="mb-6">{error}</Alert>}

      {/* Step 1: Exercise */}
      <div className="mb-8">
        <h2 className="mb-4 font-semibold">1. Select Exercise</h2>
        <ExerciseSelect value={exercise} onChange={setExercise} />
      </div>

      {/* Step 2: Video */}
      <div className="mb-8">
        <h2 className="mb-4 font-semibold">2. Upload Video</h2>
        <VideoUpload onFileSelected={setFile} disabled={!exercise} />
      </div>

      {/* Upload button */}
      {!isComplete && (
        <Button
          onClick={handleUpload}
          loading={uploading || polling}
          disabled={!exercise || !file}
          size="lg"
          className="w-full"
        >
          {polling ? 'Analyzing...' : 'Analyze Form'}
        </Button>
      )}

      {/* Processing indicator */}
      {polling && !isComplete && (
        <div className="mt-6 flex flex-col items-center text-center">
          <div className="mb-3 h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          <p className="text-sm text-text-secondary">Processing your video. This may take a minute...</p>
        </div>
      )}

      {/* Results */}
      {isComplete && resultData && (
        <div className="mt-8">
          <h2 className="mb-4 font-semibold">Results</h2>
          <AnalysisResults data={resultData} />
          <Button
            variant="secondary"
            className="mt-6 w-full"
            onClick={() => { setTaskId(''); setSyncResult(null); setFile(null); setExercise(''); }}
          >
            Analyze Another Video
          </Button>
        </div>
      )}

      {taskData?.status === 'failed' && (
        <Alert variant="error" className="mt-6">
          Analysis failed. {taskData.error || 'Please try again.'}
        </Alert>
      )}
    </div>
  );
}
