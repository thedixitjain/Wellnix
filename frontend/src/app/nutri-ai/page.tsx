import Link from 'next/link';

export default function NutriAIPage() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.08),transparent_60%)]" />
        <div className="relative mx-auto max-w-4xl px-6 pb-20 pt-28 text-center">
          <span className="mb-4 inline-block rounded-full border border-accent/30 bg-accent-glow px-3 py-1 text-xs font-semibold text-accent">
            NUTRI AI
          </span>
          <h1 className="font-display text-4xl font-bold leading-tight sm:text-5xl">
            Decode any nutrition label<br />
            <span className="text-accent">in seconds.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-text-secondary">
            Take a photo of a nutrition label and get an instant health score, nutrient breakdown, and personalized recommendations based on your profile.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              href="/nutri-ai/profile"
              className="rounded-lg bg-accent px-7 py-3 text-sm font-medium text-white shadow-lg shadow-accent/25 hover:bg-accent-hover"
            >
              Get Started
            </Link>
            <Link
              href="/nutri-ai/upload"
              className="rounded-lg border border-border px-7 py-3 text-sm text-text-secondary hover:border-border-hover hover:text-text-primary"
            >
              Skip to Upload
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-24">
        <div className="grid gap-8 md:grid-cols-3">
          {[
            { title: 'Snap a Photo', desc: 'Point your camera at any nutrition label. Our OCR reads it instantly.' },
            { title: 'Get a Health Score', desc: 'AI analyzes macro and micro nutrients against your dietary needs.' },
            { title: 'Personalized Tips', desc: 'Receive disease-aware recommendations tailored to your health goals.' },
          ].map((step, i) => (
            <div key={i} className="rounded-xl border border-border bg-bg-secondary p-8 text-center">
              <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-accent font-bold">{i + 1}</div>
              <h3 className="mb-2 font-semibold">{step.title}</h3>
              <p className="text-sm text-text-secondary">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
