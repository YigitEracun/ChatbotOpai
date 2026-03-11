'use client';

import { useState, useRef, useEffect, KeyboardEvent } from 'react';

export default function Home() {
  const [messages, setMessages] = useState<{ text: string; type: 'user' | 'bot' | 'typing' }[]>([
    { text: 'Merhaba! Size nasıl yardımcı olabilirim? 👋', type: 'bot' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    const text = inputValue.trim();
    if (!text) return;

    setInputValue('');
    setMessages((prev) => [...prev, { text, type: 'user' }, { text: '', type: 'typing' }]);

    try {
      // Backend API'nize istek atıyoruz
      const res = await fetch('/api/chatkit/session', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: text }) // <-- DEĞİŞİKLİK BURADA
      });
      const data = await res.json();
      
      setMessages((prev) => {
        const filtered = prev.filter((msg) => msg.type !== 'typing');
        // Eğer arkadan hata metni dönerse ekrana yansıtalım (Örn: API eksik vb.)
        if (data.error) {
           return [...filtered, { text: `Hata: ${data.error}`, type: 'bot' }];
        }
        return [...filtered, { text: data.reply || 'Yanıt alınamadı.', type: 'bot' }];
      });
    } catch {
      setMessages((prev) => {
        const filtered = prev.filter((msg) => msg.type !== 'typing');
        return [...filtered, { text: 'Bağlantı hatası. Lütfen tekrar deneyin.', type: 'bot' }];
      });
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <div style={styles.body}>
      <div style={styles.chatWindow}>
        <div style={styles.chatHeader}>
          <div style={styles.avatar}>🤖</div>
          <div>
            <h2 style={{ color: '#fff', fontSize: '15px', fontWeight: 700, margin: 0 }}>AI Asistan</h2>
            <div style={styles.online}>
              <span style={styles.dot}></span>
              <p style={{ margin: 0 }}>Çevrimiçi</p>
            </div>
          </div>
        </div>

        <div style={styles.messages}>
          {messages.map((msg, index) => (
            <div
              key={index}
              style={{
                ...styles.msg,
                ...(msg.type === 'user' ? styles.user : styles.bot),
              }}
            >
              {msg.type === 'typing' ? (
                <div style={styles.typing}><span>.</span><span>.</span><span>.</span></div>
              ) : (
                msg.text
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div style={styles.chatInput}>
          <input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            type="text"
            placeholder="Mesajınızı yazın…"
            style={styles.input}
          />
          <button onClick={sendMessage} style={styles.sendBtn}>
            <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
              <path
                d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  body: {
    fontFamily: 'sans-serif',
    background: '#f0f4f8',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    margin: 0,
  },
  chatWindow: {
    width: '420px',
    height: '600px',
    background: '#fff',
    borderRadius: '16px',
    boxShadow: '0 8px 40px rgba(0,0,0,0.15)',
    display: 'flex',
    flexDirection: 'column' as const,
    overflow: 'hidden',
  },
  chatHeader: {
    background: 'linear-gradient(135deg, #1a5fa8, #0e8a7c)',
    padding: '18px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  avatar: {
    width: '40px',
    height: '40px',
    background: 'rgba(255,255,255,0.2)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
  },
  online: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    color: 'rgba(255,255,255,0.7)',
    fontSize: '12px',
  },
  dot: {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    background: '#4ade80',
  },
  messages: {
    flex: 1,
    overflowY: 'auto' as const,
    padding: '20px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  },
  msg: {
    maxWidth: '75%',
    padding: '11px 15px',
    borderRadius: '14px',
    fontSize: '14px',
    lineHeight: 1.5,
  },
  bot: {
    background: '#f0f4f8',
    color: '#1e2a3b',
    borderBottomLeftRadius: '4px',
    alignSelf: 'flex-start',
  },
  user: {
    background: '#1a5fa8',
    color: '#fff',
    borderBottomRightRadius: '4px',
    alignSelf: 'flex-end',
  },
  typing: {
    display: 'flex',
    gap: '5px',
  },
  chatInput: {
    padding: '16px',
    borderTop: '1px solid #eef1f6',
    display: 'flex',
    gap: '10px',
  },
  input: {
    flex: 1,
    padding: '11px 16px',
    border: '1px solid #dce2ed',
    borderRadius: '24px',
    fontSize: '14px',
    outline: 'none',
  },
  sendBtn: {
    width: '42px',
    height: '42px',
    background: '#1a5fa8',
    border: 'none',
    borderRadius: '50%',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
};
