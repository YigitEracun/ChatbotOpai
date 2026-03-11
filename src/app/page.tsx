'use client';

import { useEffect, useRef, useState } from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'openai-chatkit': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          'client-secret'?: string;
          'workflow-id'?: string;
        },
        HTMLElement
      >;
    }
  }
}

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load the ChatKit web component script once
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.openai.com/chatkit/v1/chatkit.js';
    script.type = 'module';
    document.head.appendChild(script);
    return () => { document.head.contains(script) && document.head.removeChild(script); };
  }, []);

  // Fetch ephemeral session token from our secure backend
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/chatkit/session', { method: 'POST' });
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);

        // client_secret can be a string OR { value: string }
        const secret =
          typeof data.client_secret === 'string'
            ? data.client_secret
            : data.client_secret?.value ?? null;

        if (!secret) throw new Error('No client_secret returned from server.');
        setClientSecret(secret);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to start session.');
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const workflowId = process.env.NEXT_PUBLIC_CHATKIT_WORKFLOW_ID;

  return (
    <main className="chatkit-main">
      <div className="chatkit-header">
        <div className="chatkit-logo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="12" fill="#10a37f"/>
            <path d="M12 6C8.686 6 6 8.686 6 12s2.686 6 6 6 6-2.686 6-6-2.686-6-6-6zm0 2a4 4 0 110 8 4 4 0 010-8zm0 2a2 2 0 100 4 2 2 0 000-4z" fill="white"/>
          </svg>
          <span>OpenAI ChatKit</span>
        </div>
        <div className="chatkit-status">
          <span className={`status-dot ${isLoading ? 'loading' : error ? 'error' : 'ready'}`} />
          <span className="status-label">
            {isLoading ? 'Connecting…' : error ? 'Error' : 'Ready'}
          </span>
        </div>
      </div>

      <div className="chatkit-body" ref={containerRef}>
        {isLoading && (
          <div className="chatkit-loader">
            <div className="loader-spinner" />
            <p>Initializing secure session…</p>
          </div>
        )}

        {!isLoading && error && (
          <div className="chatkit-error">
            <div className="error-icon">⚠</div>
            <h3>Session Error</h3>
            <p>{error}</p>
            <p className="error-hint">
              Check that <code>OPENAI_API_KEY</code> is set in your Vercel environment variables.
            </p>
            <button onClick={() => window.location.reload()} className="retry-btn">
              Retry
            </button>
          </div>
        )}

        {!isLoading && !error && clientSecret && (
          <openai-chatkit
            client-secret={clientSecret}
            {...(workflowId ? { 'workflow-id': workflowId } : {})}
          />
        )}
      </div>
    </main>
  );
}
