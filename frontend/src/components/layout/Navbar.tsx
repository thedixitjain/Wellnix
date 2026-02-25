'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import MobileMenu from './MobileMenu';

const navLinks = [
  { href: '/nutri-ai', label: 'Nutri AI' },
  { href: '/muscle-ai', label: 'Muscle AI' },
  { href: '/ana', label: 'Ana' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/developers', label: 'Developers' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg-primary/80 backdrop-blur-lg">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-bold font-display tracking-tight text-text-primary">
          Wellnix
        </Link>

        {/* Desktop */}
        <ul className="hidden items-center gap-8 md:flex">
          {navLinks.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="text-sm text-text-secondary transition-colors hover:text-text-primary">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="rounded-lg px-4 py-2 text-sm text-text-secondary transition-colors hover:text-text-primary"
              >
                Dashboard
              </Link>
              <button
                onClick={logout}
                className="rounded-lg border border-border px-4 py-2 text-sm text-text-secondary transition-colors hover:border-border-hover hover:text-text-primary"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-lg px-4 py-2 text-sm text-text-secondary transition-colors hover:text-text-primary"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white shadow-md shadow-accent/20 transition-colors hover:bg-accent-hover"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="flex flex-col gap-1.5 md:hidden"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          aria-expanded={mobileOpen}
        >
          <span className="block h-0.5 w-6 bg-text-primary" />
          <span className="block h-0.5 w-6 bg-text-primary" />
          <span className="block h-0.5 w-6 bg-text-primary" />
        </button>
      </nav>

      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} links={navLinks} user={user} onLogout={logout} />
    </header>
  );
}
