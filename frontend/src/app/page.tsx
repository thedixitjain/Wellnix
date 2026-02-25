import Link from 'next/link';

const products = [
  {
    href: '/nutri-ai',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 12H3" /><path d="M16 6H3" /><path d="M16 18H3" /><path d="m19 10-4 4" /><path d="m15 10 4 4" />
      </svg>
    ),
    title: 'Nutri AI',
    desc: 'Snap a photo of any nutrition label and get instant health analysis with grade scoring, calorie breakdown, and disease-aware recommendations.',
  },
  {
    href: '/muscle-ai',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8h1a4 4 0 0 1 0 8h-1" /><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" /><line x1="6" y1="1" x2="6" y2="4" /><line x1="10" y1="1" x2="10" y2="4" /><line x1="14" y1="1" x2="14" y2="4" />
      </svg>
    ),
    title: 'Muscle AI',
    desc: 'Upload a workout video and our YOLO-powered pose estimation gives you real-time form feedback, rep counting, and injury prevention tips.',
  },
  {
    href: '/ana',
    badge: 'NEW',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446A9 9 0 1 1 12 3z" />
        <path d="M17 4a2 2 0 0 0 2 2c-1.5 0-2 1-2 2 0-1-.5-2-2-2a2 2 0 0 0 2-2" />
      </svg>
    ),
    title: 'Ana',
    desc: 'Tell Ana what ingredients you have, and she will suggest a healthy, balanced meal plan personalized to your goals. Powered by RAG and nutrition science.',
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.08),transparent_60%)]" />
        <div className="relative mx-auto max-w-5xl px-6 pb-20 pt-28 text-center">
          <h1 className="font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            Your health, decoded
            <br />
            <span className="text-accent">by AI.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-text-secondary leading-relaxed">
            Scan nutrition labels in seconds, get real-time workout form feedback, and chat with Ana for personalized diet plans. Three tools, one platform.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              href="/register"
              className="rounded-lg bg-accent px-7 py-3 text-sm font-medium text-white shadow-lg shadow-accent/25 transition-all hover:bg-accent-hover hover:shadow-xl hover:shadow-accent/30"
            >
              Get Started Free
            </Link>
            <Link
              href="/developers"
              className="rounded-lg border border-border px-7 py-3 text-sm text-text-secondary transition-colors hover:border-border-hover hover:text-text-primary"
            >
              View API Docs
            </Link>
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="mb-16 text-center">
          <h2 className="font-display text-3xl font-bold">Three products. One platform.</h2>
          <p className="mx-auto mt-3 max-w-lg text-text-secondary">
            Minimal workflow. Clear results. Built for everyday use.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {products.map((p) => (
            <Link
              key={p.href}
              href={p.href}
              className="group relative rounded-xl border border-border bg-bg-secondary p-8 transition-all duration-300 hover:border-accent/40 hover:shadow-lg hover:shadow-accent/5"
            >
              {p.badge && (
                <span className="absolute right-6 top-6 rounded-full border border-accent/30 bg-accent-glow px-2.5 py-0.5 text-xs font-semibold text-accent">
                  {p.badge}
                </span>
              )}
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-accent/10 text-accent transition-colors group-hover:bg-accent/20">
                {p.icon}
              </div>
              <h3 className="mb-2 text-xl font-semibold">{p.title}</h3>
              <p className="text-sm leading-relaxed text-text-secondary">{p.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Developer API */}
      <section className="border-t border-border bg-bg-secondary">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div>
              <span className="rounded-full border border-accent/30 bg-accent-glow px-3 py-1 text-xs font-semibold text-accent">
                API
              </span>
              <h2 className="mt-4 font-display text-3xl font-bold">Built for developers</h2>
              <p className="mt-4 text-text-secondary leading-relaxed">
                Integrate nutrition scanning and workout analysis into your own applications with our RESTful API. JWT authentication, JSON responses, comprehensive documentation.
              </p>
              <Link
                href="/developers"
                className="mt-6 inline-block rounded-lg bg-accent px-6 py-2.5 text-sm font-medium text-white shadow-md shadow-accent/20 transition-colors hover:bg-accent-hover"
              >
                Explore the API
              </Link>
            </div>
            <div className="rounded-xl border border-border bg-bg-primary p-6 font-mono text-sm">
              <div className="mb-1 text-text-tertiary"># Analyze a nutrition label</div>
              <div>
                <span className="text-accent">curl</span> -X POST /api/v1/nutri-ai/upload \
              </div>
              <div className="pl-4">-H &quot;Authorization: Bearer $TOKEN&quot; \</div>
              <div className="pl-4">-F &quot;image=@label.jpg&quot;</div>
            </div>
          </div>
        </div>
      </section>

      {/* Enterprise */}
      <section className="mx-auto max-w-7xl px-6 py-24 text-center">
        <h2 className="font-display text-3xl font-bold">Need enterprise-grade health AI?</h2>
        <p className="mx-auto mt-4 max-w-xl text-text-secondary">
          Custom models, dedicated infrastructure, compliance support, and priority SLAs for organizations that need more.
        </p>
        <Link
          href="/enterprise"
          className="mt-8 inline-block rounded-lg border border-border px-7 py-3 text-sm text-text-secondary transition-colors hover:border-border-hover hover:text-text-primary"
        >
          Contact Sales
        </Link>
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-bg-secondary">
        <div className="mx-auto max-w-3xl px-6 py-24 text-center">
          <h2 className="font-display text-3xl font-bold">Start building healthier habits today.</h2>
          <p className="mt-4 text-text-secondary">
            Free to start. No credit card required.
          </p>
          <Link
            href="/register"
            className="mt-8 inline-block rounded-lg bg-accent px-8 py-3.5 text-sm font-medium text-white shadow-lg shadow-accent/25 transition-all hover:bg-accent-hover"
          >
            Create Free Account
          </Link>
        </div>
      </section>
    </>
  );
}
