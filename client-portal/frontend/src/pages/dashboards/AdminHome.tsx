import { Link } from 'react-router-dom';

export default function AdminHome() {
  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginBottom: 12 }}>Admin Dashboard</h2>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
        }}
      >
        <Link to="/admin/users" style={card}>
          <div style={tileHeader}>👥</div>
          <div style={tileTitle}>Users</div>
          <div style={tileSub}>View all users and invite clients</div>
        </Link>

        <div style={card}>
          <div style={tileHeader}>📄</div>
          <div style={tileTitle}>Documents</div>
          <div style={tileSub}>Upload & review (coming soon)</div>
        </div>

        <div style={card}>
          <div style={tileHeader}>💳</div>
          <div style={tileTitle}>Bills & Statements</div>
          <div style={tileSub}>Manage statements (coming soon)</div>
        </div>
      </div>
    </div>
  );
}

const card: React.CSSProperties = {
  background: '#fff',
  border: '1px solid #e5e7eb',
  borderRadius: 12,
  padding: 16,
  textDecoration: 'none',
  color: '#111827',
  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  display: 'grid',
  alignContent: 'start',
  gap: 8,
  minHeight: 140,
};

const tileHeader: React.CSSProperties = {
  fontSize: 28,
  lineHeight: 1,
};

const tileTitle: React.CSSProperties = {
  fontWeight: 700,
  fontSize: 16,
};

const tileSub: React.CSSProperties = {
  fontSize: 13,
  color: '#6b7280',
};
