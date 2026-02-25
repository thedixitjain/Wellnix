import Link from 'next/link';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <h1 className="font-display text-6xl font-bold text-accent">404</h1>
      <p className="mt-4 text-xl font-semibold">Page not found</p>
      <p className="mt-2 text-text-secondary">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link href="/" className="mt-8 rounded-lg bg-accent px-6 py-3 text-sm font-medium text-white shadow-md shadow-accent/20 hover:bg-accent-hover">
        Back to Home
      </Link>
    </div>
  );
}
