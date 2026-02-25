'use client';

import { useState, useRef, type DragEvent } from 'react';
interface Props {
  onFileSelected: (file: File) => void;
  disabled?: boolean;
}

export default function VideoUpload({ onFileSelected, disabled }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState('');
  const [dragging, setDragging] = useState(false);

  function handleFile(f: File) {
    if (!f.type.startsWith('video/')) return;
    setFileName(f.name);
    onFileSelected(f);
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  }

  return (
    <div
      onClick={() => !disabled && fileRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 transition-colors ${
        disabled ? 'opacity-50 cursor-not-allowed' : dragging ? 'border-accent bg-accent-glow' : 'border-border hover:border-border-hover'
      }`}
    >
      <input ref={fileRef} type="file" accept="video/*" className="hidden" disabled={disabled}
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
      <svg className="mb-4 h-12 w-12 text-text-tertiary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M15 10l4.553-2.276A1 1 0 0 1 21 8.618v6.764a1 1 0 0 1-1.447.894L15 14M3 8a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <p className="text-sm text-text-secondary">{fileName || 'Drop a video here or click to browse'}</p>
      <p className="mt-1 text-xs text-text-tertiary">MP4, MOV, AVI up to 100 MB</p>
    </div>
  );
}
