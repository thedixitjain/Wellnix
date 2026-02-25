import UploadDropzone from '@/components/nutri-ai/UploadDropzone';

export default function NutriUploadPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="mb-2 font-display text-2xl font-bold">Upload Nutrition Label</h1>
      <p className="mb-8 text-text-secondary">Take a clear photo of the nutrition facts panel. Our AI will handle the rest.</p>
      <UploadDropzone />
    </div>
  );
}
