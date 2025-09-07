import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth';

type Row = { id: string; email: string; role: string; createdAt: string };

export default function AdminUsers() {
  const { accessToken } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await api.get('/admin/users', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setRows(data.users);
    })();
  }, [accessToken]);

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Users</h2>
        <button onClick={() => setOpen(true)} style={btnPrimary}>
          + Create / Invite Client
        </button>
      </div>

      <div style={{ overflowX: 'auto', marginTop: 12 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
              <th style={th}>Email</th>
              <th style={th}>Role</th>
              <th style={th}>Created</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={td}>{r.email}</td>
                <td style={td}>{r.role}</td>
                <td style={td}>{new Date(r.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open && <InviteModal onClose={() => setOpen(false)} />}
    </div>
  );
}

function InviteModal({ onClose }: { onClose: () => void }) {
  const { accessToken } = useAuth();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'INDIVIDUAL_CLIENT' | 'BUSINESS_OWNER' | 'BUSINESS_STAFF'>(
    'INDIVIDUAL_CLIENT'
  );
  const [msg, setMsg] = useState('');

  async function submit() {
    try {
      await api.post(
        '/admin/invite',
        { email, role },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      setMsg('Invite sent (check email or server console log).');
      setTimeout(onClose, 1000);
    } catch (e: any) {
      setMsg(e?.response?.data?.error || 'Error sending invite');
    }
  }

  return (
    <div style={modalBg}>
      <div style={modalCard}>
        <h3>Invite Client</h3>
        <label>Email</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="client@example.com"
          style={input}
        />
        <label>Role</label>
        <select value={role} onChange={(e) => setRole(e.target.value as any)} style={input}>
          <option value="INDIVIDUAL_CLIENT">Individual Client</option>
          <option value="BUSINESS_OWNER">Business Owner</option>
          <option value="BUSINESS_STAFF">Business Staff</option>
        </select>
        {msg && (
          <div style={{ color: msg.startsWith('Invite sent') ? '#16a34a' : 'crimson' }}>{msg}</div>
        )}
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <button onClick={submit} style={btnPrimary}>
            Send Invite
          </button>
          <button onClick={onClose} style={btnSecondary}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

const th: React.CSSProperties = { textAlign: 'left', padding: '8px' };
const td: React.CSSProperties = { padding: '8px' };
const btnPrimary: React.CSSProperties = {
  background: '#16a34a',
  color: '#fff',
  border: 'none',
  padding: '10px 12px',
  borderRadius: 8,
  fontWeight: 600,
  cursor: 'pointer',
};
const btnSecondary: React.CSSProperties = {
  background: '#374151',
  color: '#fff',
  border: 'none',
  padding: '10px 12px',
  borderRadius: 8,
  fontWeight: 600,
  cursor: 'pointer',
};
const input: React.CSSProperties = {
  width: '100%',
  padding: '10px',
  border: '1px solid #d1d5db',
  borderRadius: 8,
  marginBottom: 12,
};
const modalBg: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.25)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 16,
};
const modalCard: React.CSSProperties = {
  background: '#fff',
  width: '100%',
  maxWidth: 420,
  padding: 20,
  borderRadius: 12,
  boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
  display: 'grid',
};
