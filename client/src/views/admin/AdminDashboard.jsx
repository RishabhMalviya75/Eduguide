import { useAuth } from '../../context/AuthContext';
import { LogOut, LayoutDashboard, Users, School, BookOpen, GraduationCap } from 'lucide-react';
import { useState, useEffect } from 'react';
import { api } from '../../api/client';
import '../../App.css'; // Reusing the bento styles

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({ totalStudents: 0, totalTeachers: 0, totalTests: 0 });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/users/admin/stats');
      if (res.success) {
        setStats(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch admin stats:', err);
    }
  };

  return (
    <div className="app-container">
      <header className="header" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <LayoutDashboard size={40} className="icon-logo" />
          <div>
            <h1>Admin Control Panel</h1>
            <p style={{ color: 'var(--slate-500)' }}>Manage your school ecosystem</p>
          </div>
        </div>
        
        <button onClick={logout} className="btn-primary" style={{ background: 'var(--slate-800)' }}>
          <LogOut size={18} /> Logout
        </button>
      </header>

      <main className="bento-grid">
        {/* Metric Cards */}
        <div className="bento-card span-4-col" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', background: 'transparent', boxShadow: 'none', padding: 0 }}>
          
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '1rem', background: 'var(--sky-100)', color: 'var(--sky-600)', borderRadius: 'var(--radius-md)' }}>
              <GraduationCap size={32} />
            </div>
            <div>
              <p style={{ margin: 0, color: 'var(--slate-500)', fontSize: '0.9rem', fontWeight: 600 }}>Total Students</p>
              <h3 style={{ margin: 0, fontSize: '2rem', color: 'var(--slate-800)' }}>{stats.totalStudents}</h3>
            </div>
          </div>

          <div style={{ background: 'white', padding: '1.5rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '1rem', background: '#dcfce7', color: '#16a34a', borderRadius: 'var(--radius-md)' }}>
              <Users size={32} />
            </div>
            <div>
              <p style={{ margin: 0, color: 'var(--slate-500)', fontSize: '0.9rem', fontWeight: 600 }}>Total Teachers</p>
              <h3 style={{ margin: 0, fontSize: '2rem', color: 'var(--slate-800)' }}>{stats.totalTeachers}</h3>
            </div>
          </div>

          <div style={{ background: 'white', padding: '1.5rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '1rem', background: '#f3e8ff', color: '#9333ea', borderRadius: 'var(--radius-md)' }}>
              <BookOpen size={32} />
            </div>
            <div>
              <p style={{ margin: 0, color: 'var(--slate-500)', fontSize: '0.9rem', fontWeight: 600 }}>Aptitude Tests Taken</p>
              <h3 style={{ margin: 0, fontSize: '2rem', color: 'var(--slate-800)' }}>{stats.totalTests}</h3>
            </div>
          </div>

        </div>

        <div className="bento-card span-2-col">
          <div className="card-header">
            <div className="card-icon"><Users size={24} /></div>
            <h2 className="card-title">Manage Staff</h2>
          </div>
          <div className="card-content">
            <p>Admin tools to add or remove teachers will appear here.</p>
          </div>
        </div>

        <div className="bento-card span-2-col">
          <div className="card-header">
            <div className="card-icon"><School size={24} /></div>
            <h2 className="card-title">School Settings</h2>
          </div>
          <div className="card-content">
            <p>School profile and API configuration settings.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
