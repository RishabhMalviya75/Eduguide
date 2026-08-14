import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Briefcase, LogIn, AlertCircle, ArrowLeft, KeyRound, Shield, School, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import '../../styles/auth.css';

export default function StaffLogin() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loginStaff } = useAuth();
  
  const initialRole = searchParams.get('role') || 'Admin';
  const [activeRole, setActiveRole] = useState(initialRole);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const r = searchParams.get('role');
    if (r && ['Admin', 'Teacher', 'Counselor'].includes(r)) {
      setActiveRole(r);
    }
  }, [searchParams]);

  // Set sample credentials when tab changes
  useEffect(() => {
    setError(null);
    if (activeRole === 'Admin') {
      setEmail('admin@dps001.edu');
      setPassword('admin123');
    } else if (activeRole === 'Teacher') {
      setEmail('rahul.verma@dps001.edu');
      setPassword('teacher123');
    } else if (activeRole === 'Counselor') {
      setEmail('neha.gupta@dps001.edu');
      setPassword('counselor123');
    }
  }, [activeRole]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);

    try {
      const result = await loginStaff(email.trim(), password);

      if (result.success) {
        const userRole = result.user.role;
        if (userRole === 'Admin') navigate('/admin');
        else if (userRole === 'Teacher') navigate('/teacher');
        else if (userRole === 'Counselor') navigate('/counselor');
        else navigate('/teacher');
      } else {
        setError(result.error || 'Invalid email or password for staff portal.');
        setLoading(false);
      }
    } catch (err) {
      setError(err.message || 'An error occurred during sign in.');
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-card" style={{ maxWidth: '520px' }}>
        <div style={{ textAlign: 'left', marginBottom: '1rem' }}>
          <Link to="/" style={{ color: 'var(--slate-500)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.88rem', fontWeight: 500 }}>
            <ArrowLeft size={16} /> Back to Portal Selection
          </Link>
        </div>
        
        <div className="auth-header" style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' }}>
            <img src="/logo.png" alt="EduGuide Logo" style={{ width: '56px', height: '56px', objectFit: 'contain' }} />
          </div>
          <h1 className="auth-title" style={{ fontSize: '1.65rem' }}>Staff Workspace</h1>
          <p className="auth-subtitle">Select role tab to sign in</p>
        </div>

        {/* Role Tab Selector */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.4rem', background: '#F1F5F9', padding: '0.3rem', borderRadius: '12px', marginBottom: '1.25rem' }}>
          <button 
            type="button"
            onClick={() => setActiveRole('Admin')}
            style={{
              padding: '0.6rem 0.4rem',
              borderRadius: '9px',
              border: 'none',
              background: activeRole === 'Admin' ? '#FFFFFF' : 'transparent',
              color: activeRole === 'Admin' ? '#2563EB' : '#64748B',
              fontWeight: activeRole === 'Admin' ? 700 : 500,
              fontSize: '0.82rem',
              cursor: 'pointer',
              boxShadow: activeRole === 'Admin' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem',
              transition: 'all 0.15s ease'
            }}
          >
            <Shield size={14} /> Admin
          </button>

          <button 
            type="button"
            onClick={() => setActiveRole('Teacher')}
            style={{
              padding: '0.6rem 0.4rem',
              borderRadius: '9px',
              border: 'none',
              background: activeRole === 'Teacher' ? '#FFFFFF' : 'transparent',
              color: activeRole === 'Teacher' ? '#2563EB' : '#64748B',
              fontWeight: activeRole === 'Teacher' ? 700 : 500,
              fontSize: '0.82rem',
              cursor: 'pointer',
              boxShadow: activeRole === 'Teacher' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem',
              transition: 'all 0.15s ease'
            }}
          >
            <School size={14} /> Teacher
          </button>

          <button 
            type="button"
            onClick={() => setActiveRole('Counselor')}
            style={{
              padding: '0.6rem 0.4rem',
              borderRadius: '9px',
              border: 'none',
              background: activeRole === 'Counselor' ? '#FFFFFF' : 'transparent',
              color: activeRole === 'Counselor' ? '#2563EB' : '#64748B',
              fontWeight: activeRole === 'Counselor' ? 700 : 500,
              fontSize: '0.82rem',
              cursor: 'pointer',
              boxShadow: activeRole === 'Counselor' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem',
              transition: 'all 0.15s ease'
            }}
          >
            <UserCheck size={14} /> Counselor
          </button>
        </div>

        {/* Quick Credential Banner */}
        <div style={{ 
          marginBottom: '1.25rem', 
          padding: '0.85rem 1rem', 
          background: '#EFF6FF', 
          borderRadius: '12px', 
          border: '1px solid #BAE6FD', 
          fontSize: '0.8rem', 
          color: '#1E40AF', 
          textAlign: 'left' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, marginBottom: '0.2rem' }}>
            <KeyRound size={14} color="#2563EB" />
            <span>Sample {activeRole} Credential Loaded:</span>
          </div>
          <div>Email: <code>{email}</code> | Pass: <code>{password}</code></div>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && (
            <div className="error-message">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input 
              type="email" 
              id="email" 
              className="form-input" 
              placeholder="e.g., staff@dps001.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input 
              type="password" 
              id="password" 
              className="form-input" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', marginTop: '0.5rem' }}>
            {loading ? 'Signing in...' : (
              <>Sign In as {activeRole} <LogIn size={18} /></>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
