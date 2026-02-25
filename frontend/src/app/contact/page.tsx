'use client';

import { useState, type FormEvent } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Alert from '@/components/ui/Alert';

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-24">
      <div className="mb-12 text-center">
        <h1 className="font-display text-4xl font-bold">Contact Us</h1>
        <p className="mt-4 text-text-secondary">
          Questions, feedback, or partnership inquiries? We would love to hear from you.
        </p>
      </div>

      {sent ? (
        <Alert variant="success" className="text-center">
          Thank you! Your message has been received. We will get back to you within 48 hours.
        </Alert>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <Input label="Name" required placeholder="Your name" />
            <Input label="Email" type="email" required placeholder="you@example.com" />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-text-secondary">Subject</label>
            <select className="w-full rounded-lg border border-border bg-bg-tertiary px-4 py-2.5 text-sm text-text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent">
              <option>General Inquiry</option>
              <option>Bug Report</option>
              <option>Feature Request</option>
              <option>Enterprise / Partnership</option>
              <option>Other</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-text-secondary">Message</label>
            <textarea
              required
              rows={5}
              placeholder="Tell us more..."
              className="w-full rounded-lg border border-border bg-bg-tertiary px-4 py-2.5 text-sm text-text-primary placeholder-text-tertiary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
          <Button type="submit" size="lg" className="w-full">Send Message</Button>
        </form>
      )}
    </div>
  );
}
