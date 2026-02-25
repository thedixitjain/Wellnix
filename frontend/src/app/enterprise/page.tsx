import Link from 'next/link';

const features = [
  { title: 'Custom AI Models', desc: 'Fine-tune nutrition and fitness models on your proprietary data for domain-specific accuracy.' },
  { title: 'Dedicated Infrastructure', desc: 'Isolated compute resources with guaranteed uptime SLAs for mission-critical deployments.' },
  { title: 'SSO & Compliance', desc: 'SAML/OIDC single sign-on, SOC 2 readiness, and HIPAA-compatible data handling.' },
  { title: 'Priority Support', desc: 'Dedicated account manager, 4-hour response SLA, and direct engineering escalation.' },
  { title: 'White-Label Options', desc: 'Rebrand the Wellnix platform under your own identity for B2B health products.' },
  { title: 'Unlimited API Access', desc: 'No rate limits, no per-call pricing. Integrate deeply into your own workflows.' },
];

export default function EnterprisePage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-24">
      <div className="mb-16 text-center">
        <h1 className="font-display text-4xl font-bold">Enterprise-grade health AI</h1>
        <p className="mx-auto mt-4 max-w-lg text-text-secondary">
          For organizations that need custom models, dedicated infrastructure, and compliance support.
        </p>
      </div>

      <div className="mb-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <div key={f.title} className="rounded-xl border border-border bg-bg-secondary p-8">
            <h3 className="mb-2 font-semibold">{f.title}</h3>
            <p className="text-sm text-text-secondary">{f.desc}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-bg-secondary p-12 text-center">
        <h2 className="font-display text-2xl font-bold">Ready to get started?</h2>
        <p className="mt-3 text-text-secondary">Talk to our team to design a solution that fits your needs.</p>
        <Link href="/contact" className="mt-6 inline-block rounded-lg bg-accent px-8 py-3 text-sm font-medium text-white shadow-md shadow-accent/20 hover:bg-accent-hover">
          Contact Sales
        </Link>
      </div>
    </div>
  );
}
