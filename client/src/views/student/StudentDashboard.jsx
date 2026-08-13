import { useAuth } from '../../context/AuthContext';
import { LogOut, GraduationCap, BrainCircuit, Target, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { api } from '../../api/client';
import '../../App.css'; 

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await api.get('/tests/history');
      if (res.success) {
        setHistory(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch test history', err);
    }
  };

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
            <p style={{ marginBottom: '1.5rem' }}>Take the diagnostic test to uncover your career matches.</p>
            
            <Link to="/student/test" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-flex', width: 'fit-content', marginBottom: '2rem' }}>
              Start New Test <ArrowRight size={18} />
            </Link>

            {history.length > 0 && (
              <div>
                <h3 style={{ fontSize: '1.1rem', color: 'var(--slate-700)', marginBottom: '1rem' }}>Past Tests</h3>
                {history.map(test => (
                  <div key={test._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'var(--slate-50)', borderRadius: 'var(--radius-md)', marginBottom: '0.5rem', border: '1px solid var(--slate-200)' }}>
                    <div>
                      <strong>Score: {test.score}/{test.max_score}</strong>
                    </div>
                    <div style={{ color: 'var(--slate-500)' }}>
                      {new Date(test.completed_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
