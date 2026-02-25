import Link from 'next/link';

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    features: ['5 nutrition scans / month', '2 workout analyses / month', 'Ana chatbot access', 'Basic health dashboard'],
    cta: 'Get Started',
    href: '/register',
    accent: false,
  },
  {
    name: 'Pro',
    price: '$9',
    period: '/month',
    features: ['Unlimited nutrition scans', 'Unlimited workout analyses', 'Priority Ana responses', 'Advanced analytics', 'Export reports', 'API access (1K calls/month)'],
    cta: 'Upgrade to Pro',
    href: '/register',
    accent: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    features: ['Everything in Pro', 'Dedicated infrastructure', 'Custom AI model tuning', 'SSO & compliance', 'Priority support SLA', 'Unlimited API access'],
    cta: 'Contact Sales',
    href: '/enterprise',
    accent: false,
  },
];

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-24">
      <div className="mb-16 text-center">
        <h1 className="font-display text-4xl font-bold">Simple, transparent pricing</h1>
        <p className="mx-auto mt-4 max-w-lg text-text-secondary">
          Start free, upgrade when you need more. No hidden fees, no surprises.
        </p>
      </div>
      <div className="grid gap-8 md:grid-cols-3">
        {plans.map((p) => (
          <div
            key={p.name}
            className={`flex flex-col rounded-2xl border p-8 ${
              p.accent ? 'border-accent/40 bg-bg-secondary shadow-xl shadow-accent/5' : 'border-border bg-bg-secondary'
            }`}
          >
            {p.accent && (
              <span className="mb-4 inline-block w-fit rounded-full border border-accent/30 bg-accent-glow px-3 py-1 text-xs font-semibold text-accent">
                POPULAR
              </span>
            )}
            <h2 className="text-xl font-bold">{p.name}</h2>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-4xl font-bold">{p.price}</span>
              {p.period && <span className="text-text-tertiary">{p.period}</span>}
            </div>
            <ul className="mt-8 flex-1 space-y-3">
              {p.features.map((f, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-text-secondary">
                  <svg className="h-4 w-4 shrink-0 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href={p.href}
              className={`mt-8 block rounded-lg py-3 text-center text-sm font-medium transition-colors ${
                p.accent
                  ? 'bg-accent text-white shadow-md shadow-accent/20 hover:bg-accent-hover'
                  : 'border border-border text-text-secondary hover:border-border-hover hover:text-text-primary'
              }`}
            >
              {p.cta}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
