import Link from 'next/link';

const columns = [
  {
    title: 'Products',
    links: [
      { href: '/nutri-ai', label: 'Nutri AI' },
      { href: '/muscle-ai', label: 'Muscle AI' },
      { href: '/ana', label: 'Ana' },
      { href: '/pricing', label: 'Pricing' },
    ],
  },
  {
    title: 'Company',
    links: [
      { href: '/about', label: 'About' },
      { href: '/contact', label: 'Contact' },
      { href: '/enterprise', label: 'Enterprise' },
      { href: '/roadmap', label: 'Roadmap' },
    ],
  },
  {
    title: 'Developers',
    links: [
      { href: '/developers', label: 'API Docs' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-border bg-bg-secondary">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div>
            <span className="font-display text-lg font-bold text-text-primary">Wellnix</span>
            <p className="mt-3 text-sm text-text-tertiary leading-relaxed">
              AI-powered health and fitness platform. Scan nutrition labels, analyze workout form, and chat with Ana for personalized diet advice.
            </p>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="mb-4 text-sm font-semibold text-text-primary">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-sm text-text-tertiary transition-colors hover:text-text-primary">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 border-t border-border pt-8 text-center text-xs text-text-tertiary">
          &copy; {new Date().getFullYear()} Wellnix. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
