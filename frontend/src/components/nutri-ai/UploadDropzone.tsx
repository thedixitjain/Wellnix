'use client';

import { useState, useRef, type DragEvent } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';

export default function UploadDropzone() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  function handleFile(f: File) {
    if (!f.type.startsWith('image/')) { setError('Please upload an image file.'); return; }
    setFile(f);
    setError('');
    setPreview(URL.createObjectURL(f));
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  }

  async function handleUpload() {
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const body = new FormData();
      body.append('image', file);
      const result = await apiFetch('/nutri-ai/upload', { method: 'POST', body });
      sessionStorage.setItem('nutri_result', JSON.stringify(result));
      router.push('/nutri-ai/results');
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-6">
      {error && <Alert variant="error">{error}</Alert>}

      <div
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 transition-colors ${
          dragging ? 'border-accent bg-accent-glow' : 'border-border hover:border-border-hover'
        }`}
      >
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />

        {preview ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={preview} alt="Preview" className="mb-4 max-h-64 rounded-lg object-contain" />
        ) : (
          <svg className="mb-4 h-12 w-12 text-text-tertiary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 16V4m0 0-4 4m4-4 4 4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M2 17l.621 2.485A2 2 0 0 0 4.561 21h14.878a2 2 0 0 0 1.94-1.515L22 17" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
        <p className="text-sm text-text-secondary">{file ? file.name : 'Drop an image here or click to browse'}</p>
        <p className="mt-1 text-xs text-text-tertiary">JPG, PNG, WEBP up to 10 MB</p>
      </div>

      <Button onClick={handleUpload} loading={uploading} disabled={!file} size="lg" className="w-full">
        Analyze Label
      </Button>
    </div>
  );
}
