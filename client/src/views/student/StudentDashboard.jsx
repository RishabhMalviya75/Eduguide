import { useAuth } from '../../context/AuthContext';
import { LogOut, GraduationCap, BrainCircuit, Target } from 'lucide-react';
import '../../App.css'; 

export default function StudentDashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="app-container">
      <header className="header" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <GraduationCap size={40} className="icon-logo" />
          <div>
            <h1>Student Portal</h1>
            <p style={{ color: 'var(--slate-500)' }}>
              Hi {user?.name.split(' ')[0]}! (Grade {user?.grade}-{user?.section})
            </p>
          </div>
        </div>
        
        <button onClick={logout} className="btn-primary" style={{ background: 'var(--slate-800)' }}>
          <LogOut size={18} /> Logout
        </button>
      </header>

      <main className="bento-grid">
        <div className="bento-card span-2-col">
          <div className="card-header">
            <div className="card-icon"><Target size={24} /></div>
            <h2 className="card-title">My Performance</h2>
          </div>
          <div className="card-content">
            <p>Your latest marks and academic performance will appear here.</p>
          </div>
        </div>

        <div className="bento-card span-2-col">
          <div className="card-header">
            <div className="card-icon"><BrainCircuit size={24} /></div>
            <h2 className="card-title">Aptitude Tests</h2>
          </div>
          <div className="card-content">
            <p>No active tests right now. Check back later!</p>
          </div>
        </div>
      </main>
    </div>
  );
}
