import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Users, School, BookOpen, GraduationCap, ShieldCheck, Sparkles, UserPlus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { api } from '../../api/client';

export default function AdminDashboard() {
  const { user } = useAuth();
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Banner */}
      <div className="dash-card span-12" style={{ background: 'linear-gradient(135deg, #FFFFFF 0%, #ECFDF5 50%, #F0F9FF 100%)', border: '1px solid var(--brand-emerald-border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <span className="badge badge-emerald">System Administrator</span>
              <span className="badge badge-slate">Campus Node DPS001</span>
            </div>
            <h1 style={{ fontSize: '1.85rem', color: 'var(--slate-900)', marginBottom: '0.25rem' }}>
              School Ecosystem Control Panel
            </h1>
            <p style={{ color: 'var(--slate-600)', fontSize: '0.95rem' }}>
              Real-time administrative metrics, user provisioning, class assignments, and security rules.
            </p>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="bento-grid">
        <div className="dash-card span-4">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '0.85rem', background: 'var(--brand-emerald-light)', color: 'var(--brand-emerald)', borderRadius: 'var(--radius-md)' }}>
              <GraduationCap size={32} />
            </div>
            <div>
              <div style={{ fontSize: '0.82rem', color: 'var(--slate-500)', fontWeight: 600, textTransform: 'uppercase' }}>Active Students</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--slate-900)', lineHeight: 1.1 }}>{stats.totalStudents}</div>
            </div>
          </div>
        </div>

        <div className="dash-card span-4">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '0.85rem', background: 'var(--accent-violet-light)', color: 'var(--accent-violet)', borderRadius: 'var(--radius-md)' }}>
              <Users size={32} />
            </div>
            <div>
              <div style={{ fontSize: '0.82rem', color: 'var(--slate-500)', fontWeight: 600, textTransform: 'uppercase' }}>Faculty & Staff</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--slate-900)', lineHeight: 1.1 }}>{stats.totalTeachers}</div>
            </div>
          </div>
        </div>

        <div className="dash-card span-4">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '0.85rem', background: 'var(--accent-sky-light)', color: 'var(--accent-sky)', borderRadius: 'var(--radius-md)' }}>
              <BookOpen size={32} />
            </div>
            <div>
              <div style={{ fontSize: '0.82rem', color: 'var(--slate-500)', fontWeight: 600, textTransform: 'uppercase' }}>Evaluations Conducted</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--slate-900)', lineHeight: 1.1 }}>{stats.totalTests}</div>
            </div>
          </div>
        </div>

        {/* Staff Management Card */}
        <div className="dash-card span-6">
          <div className="card-header-row">
            <div className="card-title-group">
              <div className="card-icon-badge" style={{ background: 'var(--brand-emerald-light)', color: 'var(--brand-emerald)' }}>
                <Users size={22} />
              </div>
              <div>
                <div className="card-title-text">Faculty Provisioning</div>
                <div className="card-subtitle-text">Manage teacher accounts & class scope assignments</div>
              </div>
            </div>
            <button className="btn-primary" style={{ padding: '0.4rem 0.85rem', fontSize: '0.82rem' }}>
              <UserPlus size={14} /> Provision User
            </button>
          </div>

          <div style={{ color: 'var(--slate-600)', fontSize: '0.9rem', lineHeight: 1.5 }}>
            <p style={{ marginBottom: '1rem' }}>Manage active teacher credentials and class section mapping (Grade 9-12).</p>
            <div className="glass-card" style={{ padding: '1rem', background: 'var(--slate-50)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>Mr. Rahul Verma</strong> (Teacher)
                  <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)' }}>Assigned: Grade 10-A, 10-B</div>
                </div>
                <span className="badge badge-emerald">Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* School Settings Card */}
        <div className="dash-card span-6">
          <div className="card-header-row">
            <div className="card-title-group">
              <div className="card-icon-badge" style={{ background: 'var(--accent-sky-light)', color: 'var(--accent-sky)' }}>
                <School size={22} />
              </div>
              <div>
                <div className="card-title-text">Campus Environment & Security</div>
                <div className="card-subtitle-text">Tenant isolation rules & API configuration</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div className="glass-card" style={{ padding: '0.85rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--slate-900)' }}>Mongoose Tenant Isolation (`schoolScope`)</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)' }}>Enforcing zero cross-school data leaks</div>
              </div>
              <span className="badge badge-emerald">Enabled</span>
            </div>

            <div className="glass-card" style={{ padding: '0.85rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--slate-900)' }}>AI Scoring Engine Mode</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)' }}>OpenAI GPT-4o-Mini with Shadow Mock Fallback</div>
              </div>
              <span className="badge badge-violet">Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
