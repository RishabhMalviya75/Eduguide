import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Briefcase, LogIn, AlertCircle, ArrowLeft, KeyRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import '../../styles/auth.css';

export default function StaffLogin() {
  const navigate = useNavigate();
  const { loginStaff } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);

    try {
      const result = await loginStaff(email, password);

      if (result.success) {
        if (result.user.role === 'Admin') navigate('/admin');
        else if (result.user.role === 'Teacher') navigate('/teacher');
        else if (result.user.role === 'Counselor') navigate('/counselor');
        else navigate('/teacher');
      } else {
        setError(result.error || 'Invalid email or password.');
        setLoading(false);
      }
    } catch (err) {
      setError(err.message || 'An error occurred during sign in.');
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-card">
        <div style={{ textAlign: 'left', marginBottom: '1rem' }}>
          <Link to="/" style={{ color: 'var(--slate-500)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.88rem', fontWeight: 500 }}>
            <ArrowLeft size={16} /> Back to Portal Selection
          </Link>
        </div>
        
        <div className="auth-header">
          <div className="auth-icon-wrapper" style={{ background: 'linear-gradient(135deg, #A855F7 0%, #7E22CE 100%)', boxShadow: '0 10px 25px rgba(168, 85, 247, 0.25)' }}>
            <Briefcase size={32} />
          </div>
          <h1 className="auth-title">Staff Workspace</h1>
          <p className="auth-subtitle">Sign in as Admin, Teacher, or Counselor</p>
          
          {/* Quick Credential Hint Box */}
          <div style={{ 
            marginTop: '1.25rem', 
            padding: '1rem', 
            background: 'var(--slate-50)', 
            borderRadius: 'var(--radius-md)', 
            border: '1px solid var(--slate-200)', 
            fontSize: '0.82rem', 
            color: 'var(--slate-700)', 
            textAlign: 'left' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, color: 'var(--slate-900)', marginBottom: '0.4rem' }}>
              <KeyRound size={14} color="var(--brand-emerald)" />
              <span>Development Test Credentials:</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.3rem', fontSize: '0.8rem' }}>
              <div><strong>Admin:</strong> <code>admin@dps001.edu</code> (pass: <code>admin123</code>)</div>
              <div><strong>Teacher:</strong> <code>rahul.verma@dps001.edu</code> (pass: <code>teacher123</code>)</div>
              <div><strong>Counselor:</strong> <code>neha.gupta@dps001.edu</code> (pass: <code>counselor123</code>)</div>
            </div>
          </div>
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
              placeholder="e.g., admin@dps001.edu"
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
              <>Sign In to Workspace <LogIn size={18} /></>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
