'use client';

import { useEffect, useState } from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'openai-chatkit': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & { 'client-secret'?: string },
        HTMLElement
      >;
    }
  }
}

export default function Home() {
  const [secret, setSecret] = useState<string | null>(null);
  const [error, setError]   = useState<string | null>(null);

  useEffect(() => {
    const s = document.createElement('script');
    s.src  = 'https://cdn.openai.com/chatkit/v1/chatkit.js';
    s.type = 'module';
    document.head.appendChild(s);
  }, []);

  useEffect(() => {
    fetch('/api/chatkit/session', { method: 'POST' })
      .then(r => r.json())
      .then(d => {
        const val = typeof d.client_secret === 'string'
          ? d.client_secret
          : d.client_secret?.value;
        if (!val) throw new Error('Token alınamadı');
        setSecret(val);
      })
      .catch(e => setError(e.message));
  }, []);

  if (error) return (
    <div style={styles.center}>
      <div style={styles.errorBox}>
        <p>⚠️ {error}</p>
        <p style={{fontSize:13,marginTop:8,opacity:0.7}}>OPENAI_API_KEY Vercel'de tanımlı mı?</p>
        <button onClick={() => window.location.reload()} style={styles.retryBtn}>Tekrar Dene</button>
      </div>
    </div>
  );

  if (!secret) return (
    <div style={styles.center}>
      <div style={styles.spinner} />
      <p style={{color:'#8e9ab2',marginTop:16,fontSize:14}}>Bağlanıyor…</p>
    </div>
  );

  return (
    <div style={styles.center}>
      <openai-chatkit client-secret={secret} style={styles.chatkit} />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  center: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    height: '100vh', background: '#f0f4f8',
  },
  chatkit: {
    width: '420px', height: '600px',
    borderRadius: '16px',
    boxShadow: '0 8px 40px rgba(0,0,0,0.15)',
    overflow: 'hidden',
  },
  errorBox: {
    background: '#fff', border: '1px solid #fca5a5',
    borderRadius: '12px', padding: '28px 32px', textAlign: 'center',
    color: '#dc2626',
  },
  retryBtn: {
    marginTop: '14px', padding: '9px 22px',
    background: '#1a5fa8', color: '#fff',
    border: 'none', borderRadius: '8px',
    cursor: 'pointer', fontSize: '14px',
  },
  spinner: {
    width: '36px', height: '36px',
    border: '3px solid #dce2ed',
    borderTopColor: '#1a5fa8',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
};
