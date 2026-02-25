import Link from 'next/link';

const endpoints = [
  { method: 'POST', path: '/api/v1/auth/register', desc: 'Create a new account' },
  { method: 'POST', path: '/api/v1/auth/login', desc: 'Get JWT tokens' },
  { method: 'POST', path: '/api/v1/auth/refresh', desc: 'Refresh access token' },
  { method: 'GET', path: '/api/v1/user', desc: 'Get current user profile' },
  { method: 'PUT', path: '/api/v1/user/settings', desc: 'Update user settings' },
  { method: 'GET', path: '/api/v1/dashboard/stats', desc: 'Dashboard statistics' },
  { method: 'POST', path: '/api/v1/nutri-ai/upload', desc: 'Upload nutrition label image' },
  { method: 'POST', path: '/api/v1/nutri-ai/analyze', desc: 'Analyze nutrition data' },
  { method: 'POST', path: '/api/v1/muscle-ai/upload', desc: 'Upload workout video' },
  { method: 'GET', path: '/api/v1/muscle-ai/task/:id', desc: 'Poll task status' },
  { method: 'POST', path: '/api/v1/ana/chat', desc: 'Chat with Ana' },
];

export default function DevelopersPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-24">
      <div className="mb-16 text-center">
        <span className="mb-4 inline-block rounded-full border border-accent/30 bg-accent-glow px-3 py-1 text-xs font-semibold text-accent">API</span>
        <h1 className="font-display text-4xl font-bold">Developer Documentation</h1>
        <p className="mx-auto mt-4 max-w-lg text-text-secondary">
          Integrate Wellnix AI tools into your own applications with our REST API.
        </p>
      </div>

      {/* Auth example */}
      <section className="mb-16">
        <h2 className="mb-6 font-display text-2xl font-bold">Authentication</h2>
        <p className="mb-4 text-text-secondary">All authenticated endpoints require a Bearer token in the Authorization header.</p>
        <div className="rounded-xl border border-border bg-bg-primary p-6 font-mono text-sm">
          <div className="text-text-tertiary"># Login to get tokens</div>
          <div className="mt-1">
            <span className="text-accent">curl</span> -X POST {`http://localhost:5000/api/v1/auth/login`} \
          </div>
          <div className="pl-4">-H &quot;Content-Type: application/json&quot; \</div>
          <div className="pl-4">-d {`'{"email":"user@example.com","password":"secret123"}'`}</div>
          <div className="mt-4 text-text-tertiary"># Use the access_token in subsequent requests</div>
          <div className="mt-1">
            <span className="text-accent">curl</span> {`http://localhost:5000/api/v1/user`} \
          </div>
          <div className="pl-4">-H &quot;Authorization: Bearer YOUR_ACCESS_TOKEN&quot;</div>
        </div>
      </section>

      {/* Endpoints table */}
      <section>
        <h2 className="mb-6 font-display text-2xl font-bold">Endpoints</h2>
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-bg-secondary text-left text-text-tertiary">
              <tr>
                <th className="px-6 py-3 font-medium">Method</th>
                <th className="px-6 py-3 font-medium">Endpoint</th>
                <th className="hidden px-6 py-3 font-medium sm:table-cell">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {endpoints.map((ep, i) => (
                <tr key={i} className="hover:bg-bg-tertiary/50">
                  <td className="px-6 py-3">
                    <span className={`rounded px-2 py-0.5 font-mono text-xs font-bold ${
                      ep.method === 'GET' ? 'bg-info/10 text-info' : 'bg-accent-glow text-accent'
                    }`}>{ep.method}</span>
                  </td>
                  <td className="px-6 py-3 font-mono text-xs">{ep.path}</td>
                  <td className="hidden px-6 py-3 text-text-secondary sm:table-cell">{ep.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="mt-12 text-center">
        <Link href="/register" className="rounded-lg bg-accent px-6 py-3 text-sm font-medium text-white shadow-md shadow-accent/20 hover:bg-accent-hover">
          Get Your API Key
        </Link>
      </div>
    </div>
  );
}
