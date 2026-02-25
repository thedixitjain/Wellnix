import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-24">
      <div className="mb-16 text-center">
        <h1 className="font-display text-4xl font-bold">About Wellnix</h1>
        <p className="mx-auto mt-4 max-w-lg text-text-secondary">
          We are building the future of personal health through accessible, AI-powered tools that anyone can use.
        </p>
      </div>

      <div className="space-y-12 text-text-secondary leading-relaxed">
        <section>
          <h2 className="mb-4 font-display text-2xl font-bold text-text-primary">Our Mission</h2>
          <p>
            Wellnix exists to make nutrition science and fitness knowledge available to everyone, not just those who can afford personal trainers and dietitians. We believe that AI can democratize health literacy by turning complex data into clear, actionable guidance.
          </p>
        </section>

        <section>
          <h2 className="mb-4 font-display text-2xl font-bold text-text-primary">What We Do</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { title: 'Nutri AI', desc: 'Computer vision that reads nutrition labels and grades them against your health profile.' },
              { title: 'Muscle AI', desc: 'Pose estimation that analyzes your workout form and counts reps in real time.' },
              { title: 'Ana', desc: 'A RAG-powered chatbot that creates personalized meal plans from your available ingredients.' },
            ].map((item) => (
              <div key={item.title} className="rounded-xl border border-border bg-bg-secondary p-6">
                <h3 className="mb-2 font-semibold text-text-primary">{item.title}</h3>
                <p className="text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-4 font-display text-2xl font-bold text-text-primary">Our Technology</h2>
          <p>
            Built on state-of-the-art AI models including YOLOv8 for object detection, EasyOCR for text extraction, SentenceTransformers for semantic search, and Groq-powered LLMs for natural language understanding. Our architecture follows microservice principles with a Flask API gateway, Next.js frontend, and Celery-based async processing.
          </p>
        </section>
      </div>

      <div className="mt-16 text-center">
        <Link href="/contact" className="rounded-lg bg-accent px-6 py-3 text-sm font-medium text-white shadow-md shadow-accent/20 hover:bg-accent-hover">
          Get in Touch
        </Link>
      </div>
    </div>
  );
}
