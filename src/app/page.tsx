'use client';

import { useEffect, useRef, useState } from 'react';

// Extend JSX to recognize the openai-chatkit web component
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
  const chatkitContainerRef = useRef<HTMLDivElement>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load the ChatKit web component script from OpenAI's CDN
    const script = document.createElement('script');
    script.src = 'https://cdn.openai.com/chatkit/v1/chatkit.js';
    script.type = 'module';
    document.head.appendChild(script);

    return () => {
      // Cleanup script on unmount
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  useEffect(() => {
    // Fetch the ephemeral session token from our secure backend route
    const fetchSessionToken = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/chatkit/session', {
          method: 'POST',
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || `Server error: ${response.status}`);
        }

        const data = await response.json();
        setClientSecret(data.client_secret?.value || data.client_secret);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to load chat session.';
        setError(message);
        console.error('ChatKit session error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessionToken();
  }, []);

  const workflowId = process.env.NEXT_PUBLIC_CHATKIT_WORKFLOW_ID;

  return (
    <main className="chatkit-main">
      <div className="chatkit-header">
        <div className="chatkit-logo">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <circle cx="14" cy="14" r="14" fill="#10a37f"/>
            <path d="M14 7C10.134 7 7 10.134 7 14s3.134 7 7 7 7-3.134 7-7-3.134-7-7-7zm0 2a5 5 0 110 10A5 5 0 0114 9zm0 2a3 3 0 100 6 3 3 0 000-6z" fill="white"/>
          </svg>
          <span>OpenAI ChatKit</span>
        </div>
        <div className="chatkit-status">
          <span className={`status-dot ${isLoading ? 'loading' : error ? 'error' : 'ready'}`}></span>
          <span className="status-label">
            {isLoading ? 'Connecting...' : error ? 'Error' : 'Ready'}
          </span>
        </div>
      </div>

      <div className="chatkit-body" ref={chatkitContainerRef}>
        {isLoading && (
          <div className="chatkit-loader">
            <div className="loader-spinner"></div>
            <p>Initializing secure chat session…</p>
          </div>
        )}

        {error && (
          <div className="chatkit-error">
            <div className="error-icon">⚠</div>
            <h3>Session Error</h3>
            <p>{error}</p>
            <p className="error-hint">
              Make sure your <code>OPENAI_API_KEY</code> is set in <code>.env.local</code>
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
