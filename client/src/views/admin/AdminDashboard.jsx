import { useAuth } from '../../context/AuthContext';
import { LogOut, LayoutDashboard, Users, School } from 'lucide-react';
import '../../App.css'; // Reusing the bento styles

export default function AdminDashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="app-container">
      <header className="header" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <LayoutDashboard size={40} className="icon-logo" />
          <div>
            <h1>Admin Dashboard</h1>
            <p style={{ color: 'var(--slate-500)' }}>Welcome back, {user?.name}</p>
          </div>
        </div>
        
        <button onClick={logout} className="btn-primary" style={{ background: 'var(--slate-800)' }}>
          <LogOut size={18} /> Logout
        </button>
      </header>

      <main className="bento-grid">
        <div className="bento-card span-2-col">
          <div className="card-header">
            <div className="card-icon"><Users size={24} /></div>
            <h2 className="card-title">Staff Management</h2>
          </div>
          <div className="card-content">
            <p>Admin tools to create and manage teachers will go here.</p>
          </div>
        </div>

        <div className="bento-card span-2-col">
          <div className="card-header">
            <div className="card-icon"><School size={24} /></div>
            <h2 className="card-title">School Settings</h2>
          </div>
          <div className="card-content">
            <p>School Profile: <strong>{user?.school_id}</strong></p>
          </div>
        </div>
      </main>
    </div>
  );
}
