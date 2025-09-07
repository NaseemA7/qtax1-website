import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

export default function AcceptInvite() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const [pw, setPw] = useState('');
  const [msg, setMsg] = useState('');
  const nav = useNavigate();

  async function submit() {
    try {
      await api.post('/auth/accept-invite', { token, password: pw });
      setMsg('Account created! Redirecting to login…');
      setTimeout(() => nav('/login'), 900);
    } catch (e: any) {
      setMsg(e?.response?.data?.error || 'Error accepting invite');
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f9fafb',
      }}
    >
      <div
        style={{
          background: '#fff',
          padding: 24,
          borderRadius: 12,
          boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
          width: '100%',
          maxWidth: 420,
        }}
      >
        <h2 style={{ marginBottom: 12 }}>Set Your Password</h2>
        <input
          type="password"
          placeholder="New password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #d1d5db',
            borderRadius: 8,
            marginBottom: 12,
          }}
        />
        <button
          onClick={submit}
          style={{
            width: '100%',
            padding: '12px',
            background: '#16a34a',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            fontWeight: 600,
          }}
        >
          Create Account
        </button>
        {msg && (
          <div
            style={{
              marginTop: 10,
              color: msg.startsWith('Account created') ? '#16a34a' : 'crimson',
            }}
          >
            {msg}
          </div>
        )}
      </div>
    </div>
  );
}
