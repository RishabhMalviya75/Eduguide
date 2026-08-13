import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Briefcase, LogIn, AlertCircle, ArrowLeft } from 'lucide-react';
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
    setLoading(true);

    const result = await loginStaff(email, password);

    if (result.success) {
      if (result.user.role === 'Admin') navigate('/admin');
      else navigate('/teacher'); // Teacher and Counselor both go to unified staff dashboard
    } else {
      setError(result.error);
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-card">
        <div style={{ textAlign: 'left', marginBottom: '1rem' }}>
          <Link to="/" style={{ color: 'var(--slate-500)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.9rem' }}>
            <ArrowLeft size={16} /> Back
          </Link>
        </div>
        
        <div className="auth-header">
          <Briefcase size={40} className="auth-icon" />
          <h1 className="auth-title">Staff Portal</h1>
          <p className="auth-subtitle">Sign in to manage classes and students</p>
          
          <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--sky-50)', borderRadius: '8px', border: '1px solid var(--sky-200)', fontSize: '0.85rem', color: 'var(--slate-700)', textAlign: 'left' }}>
            <strong>Testing Credentials:</strong>
            <ul style={{ margin: '0.5rem 0 0 0', paddingLeft: '1.2rem', lineHeight: '1.6' }}>
              <li><strong>Admin:</strong> admin@dps001.edu <br/> <span style={{color: 'var(--slate-500)'}}>Pass: admin123</span></li>
              <li><strong>Teacher:</strong> rahul.verma@dps001.edu <br/> <span style={{color: 'var(--slate-500)'}}>Pass: teacher123</span></li>
              <li><strong>Counselor:</strong> neha.gupta@dps001.edu <br/> <span style={{color: 'var(--slate-500)'}}>Pass: counselor123</span></li>
            </ul>
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
              placeholder="e.g., admin@school.edu"
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

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Signing in...' : (
              <>Sign In <LogIn size={18} /></>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
