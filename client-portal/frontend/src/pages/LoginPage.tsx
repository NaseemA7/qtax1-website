import { useState } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const setAuth = useAuth(s => s.setAuth);
  const nav = useNavigate();

  async function onLogin() {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      setAuth({ accessToken: data.accessToken, refreshToken: data.refreshToken, role: data.role });
      const r = data.role as string;
      if (r === 'SUPER_ADMIN' || r === 'ADMIN') nav('/admin');
      else if (r === 'BUSINESS_OWNER' || r === 'BUSINESS_STAFF') nav('/business');
      else nav('/me');
    } catch (e: any) {
      setMsg(e?.response?.data?.error || 'Login failed');
    }
  }

  async function onForgot() {
    if (!email) {
      setMsg('Enter your email first');
      return;
    }
    await api.post('/auth/forgot-password', { email });
    setMsg('If that email exists, we sent a reset link.');
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#f9fafb',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <div
        style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          width: '100%',
          maxWidth: '400px',
        }}
      >
        <h2 style={{ textAlign: 'center', marginBottom: '1rem', color: '#111827' }}>
          Client Portal Login
        </h2>

        <input
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={{
            width: '100%',
            padding: '0.75rem',
            marginBottom: '0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
          }}
        />

        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={{
            width: '100%',
            padding: '0.75rem',
            marginBottom: '1rem',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
          }}
        />

        <button
          onClick={onLogin}
          style={{
            width: '100%',
            padding: '0.75rem',
            background: '#16a34a',
            color: 'white',
            fontWeight: '600',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          Login
        </button>

        <button
          onClick={onForgot}
          style={{
            width: '100%',
            padding: '0.5rem',
            background: 'transparent',
            color: '#2563eb',
            border: 'none',
            marginTop: '0.5rem',
            cursor: 'pointer',
            textDecoration: 'underline',
          }}
        >
          Forgot password?
        </button>

        {msg && (
          <div style={{ marginTop: '0.75rem', color: 'crimson', fontSize: '0.9rem' }}>{msg}</div>
        )}

        <hr style={{ margin: '1.5rem 0' }} />

        <a
          href="http://localhost:5500/index.html"
          style={{
            display: 'block',
            textAlign: 'center',
            padding: '0.75rem',
            background: '#374151',
            color: 'white',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: '600',
          }}
        >
          ⬅ Back to Site
        </a>
      </div>
    </div>
  );
}
