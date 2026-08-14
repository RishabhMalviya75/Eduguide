import { useAuth } from '../../context/AuthContext';
import { Presentation, Users, BookCheck, ArrowRight, Target, ShieldAlert, Sparkles, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TeacherDashboard() {
  const { user } = useAuth();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Hero Banner */}
      <div className="dash-card span-12" style={{ 
        background: 'linear-gradient(135deg, #FFFFFF 0%, #ECFDF5 50%, #FAF5FF 100%)',
        border: '1px solid rgba(16, 185, 129, 0.2)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <span className="badge badge-emerald">{user?.role} Workspace</span>
              <span className="badge badge-slate">Active Term 2026</span>
            </div>
            <h1 style={{ fontSize: '1.85rem', color: 'var(--slate-900)', marginBottom: '0.25rem' }}>
              Welcome, {user?.name} 👋
            </h1>
            <p style={{ color: 'var(--slate-600)', fontSize: '0.95rem' }}>
              Manage assigned classes, validate academic marks, log counselor sessions, and resolve AI review flags.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link to="/teacher/upload" className="btn-primary">
              <BookCheck size={16} /> Upload Marks CSV
            </Link>
          </div>
        </div>
      </div>

      {/* Bento Grid Action Cards */}
      <div className="bento-grid">
        {/* Assigned Classes Card */}
        <div className="dash-card span-6">
          <div className="card-header-row">
            <div className="card-title-group">
              <div className="card-icon-badge" style={{ background: 'var(--brand-emerald-light)', color: 'var(--brand-emerald)' }}>
                <Users size={22} />
              </div>
              <div>
                <div className="card-title-text">Assigned Classes</div>
                <div className="card-subtitle-text">Authorized classes for grade entry & analytics</div>
              </div>
            </div>
            <span className="badge badge-emerald">Verified</span>
          </div>

          <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap' }}>
            {user?.assigned_classes && user.assigned_classes.length > 0 ? (
              user.assigned_classes.map((c, i) => (
                <div key={i} className="glass-card" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ padding: '0.5rem', background: 'var(--brand-emerald-light)', color: 'var(--brand-emerald)', borderRadius: 'var(--radius-sm)' }}>
                    <Presentation size={20} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--slate-900)' }}>
                      Grade {c.grade} - Section {c.section}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)' }}>Active Students Enrolled</div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ color: '#DC2626', fontSize: '0.9rem' }}>No classes currently assigned. Contact Admin.</div>
            )}
          </div>
        </div>

        {/* Academic Marks Upload Card */}
        <div className="dash-card span-6">
          <div className="card-header-row">
            <div className="card-title-group">
              <div className="card-icon-badge" style={{ background: 'var(--accent-sky-light)', color: 'var(--accent-sky)' }}>
                <BookCheck size={22} />
              </div>
              <div>
                <div className="card-title-text">Marks Upload Pipeline</div>
                <div className="card-subtitle-text">Drag-and-drop CSV validation & error preview</div>
              </div>
            </div>
          </div>
          <p style={{ color: 'var(--slate-600)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
            Upload exam marks per subject. Automatic validation checks schema limits and flags missing roll numbers.
          </p>
          <Link to="/teacher/upload" className="btn-primary" style={{ width: 'fit-content' }}>
            <span>Launch CSV Uploader</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Personal Interviews (PI) Card */}
        <div className="dash-card span-6">
          <div className="card-header-row">
            <div className="card-title-group">
              <div className="card-icon-badge" style={{ background: 'var(--accent-violet-light)', color: 'var(--accent-violet)' }}>
                <Target size={22} />
              </div>
              <div>
                <div className="card-title-text">Counseling & Personal Interviews (PI)</div>
                <div className="card-subtitle-text">Log soft skill rubrics (1-5) and extracurricular interest tags</div>
              </div>
            </div>
          </div>
          <p style={{ color: 'var(--slate-600)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
            Conduct 1-on-1 interview evaluations to map soft skills into career interest profiles.
          </p>
          <Link to="/counselor" className="btn-primary" style={{ background: 'linear-gradient(135deg, #A855F7 0%, #7E22CE 100%)', width: 'fit-content' }}>
            <span>Open PI Workspace</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Human Review Queue Card */}
        <div className="dash-card span-6">
          <div className="card-header-row">
            <div className="card-title-group">
              <div className="card-icon-badge" style={{ background: 'var(--accent-orange-light)', color: 'var(--accent-orange)' }}>
                <ShieldAlert size={22} />
              </div>
              <div>
                <div className="card-title-text">AI Scoring Review Queue</div>
                <div className="card-subtitle-text">Human-in-the-loop overrides for low confidence AI test scores</div>
              </div>
            </div>
          </div>
          <p style={{ color: 'var(--slate-600)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
            Inspect test sessions flagged by the LLM scorer. Override individual item scores with reviewer notes.
          </p>
          <Link to="/staff/review-queue" className="btn-primary" style={{ background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)', width: 'fit-content' }}>
            <span>Inspect Review Queue</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
