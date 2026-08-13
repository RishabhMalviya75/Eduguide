import { useAuth } from '../../context/AuthContext';
import { LogOut, Presentation, Users, BookCheck, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import '../../App.css'; 

export default function TeacherDashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="app-container">
      <header className="header" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Presentation size={40} className="icon-logo" />
          <div>
            <h1>Teacher Dashboard</h1>
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
            <h2 className="card-title">My Classes</h2>
          </div>
          <div className="card-content">
            <p>You are assigned to:</p>
            <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem', color: 'var(--slate-600)' }}>
              {user?.assigned_classes && user.assigned_classes.length > 0 ? (
                user.assigned_classes.map((c, i) => (
                  <li key={i} style={{ marginBottom: '0.5rem' }}><strong>Grade {c.grade}</strong> - Section {c.section}</li>
                ))
              ) : (
                <li style={{ color: 'var(--error-text)' }}>No classes assigned yet.</li>
              )}
            </ul>
          </div>
        </div>

        <div className="bento-card span-2-col">
          <div className="card-header">
            <div className="card-icon"><BookCheck size={24} /></div>
            <h2 className="card-title">Marks Upload Pipeline</h2>
          </div>
          <div className="card-content">
            <p style={{ marginBottom: '1rem' }}>Upload marks for your assigned classes (Sprint 3 feature).</p>
            <Link to="/teacher/upload" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-flex', width: 'fit-content' }}>
              Open Uploader <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
