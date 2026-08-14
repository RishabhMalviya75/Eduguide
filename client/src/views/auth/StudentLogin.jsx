import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GraduationCap, LogIn, AlertCircle, ArrowLeft, UserCheck, KeyRound, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import '../../styles/auth.css';

export default function StudentLogin() {
  const navigate = useNavigate();
  const { verifyStudentIdentity, setStudentPin, loginStudent } = useAuth();
  
  // Steps: 1 = Identity / PIN, 2 = Set PIN
  const [step, setStep] = useState(1);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [identityToken, setIdentityToken] = useState(null);
  const [studentName, setStudentName] = useState('');

  // Form State
  const [schoolCode, setSchoolCode] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [dob, setDob] = useState('');
  const [pin, setPin] = useState('');

  const handleIdentitySubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Standard PIN login
    if (!dob) {
      if (!pin) {
        setError('Please enter your PIN, or select DOB for first-time login.');
        setLoading(false);
        return;
      }

      const result = await loginStudent(schoolCode, rollNo, pin);
      if (result.success) {
        navigate('/student');
      } else {
        setError(result.error);
        setLoading(false);
      }
      return;
    }

    // First Login Verification
    const result = await verifyStudentIdentity(schoolCode, rollNo, dob);
    
    if (result.success) {
      setIdentityToken(result.data.identity_token);
      setStudentName(result.data.student_name);
      setStep(2);
    } else {
      if (result.error.includes('PIN already set')) {
        setError('You have already set a PIN. Please clear Date of Birth and enter your PIN.');
      } else {
        setError(result.error);
      }
    }
    setLoading(false);
  };

  const handleSetPinSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (pin.length < 4 || pin.length > 6) {
      setError('PIN must be 4 to 6 digits.');
      setLoading(false);
      return;
    }

    const result = await setStudentPin(identityToken, pin);
    
    if (result.success) {
      navigate('/student');
    } else {
      setError(result.error);
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-card">
        {step === 1 && (
          <div style={{ textAlign: 'left', marginBottom: '1rem' }}>
            <Link to="/" style={{ color: 'var(--slate-500)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.88rem', fontWeight: 500 }}>
              <ArrowLeft size={16} /> Back to Portal Selection
            </Link>
          </div>
        )}

        {/* STEP 1: VERIFY IDENTITY OR LOGIN */}
        {step === 1 && (
          <>
            <div className="auth-header">
              <div className="auth-icon-wrapper" style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}>
                <GraduationCap size={32} />
              </div>
              <h1 className="auth-title">Student Portal</h1>
              <p className="auth-subtitle">Login with your School Code & Roll Number</p>
              
              <div style={{ 
                marginTop: '1.25rem', 
                padding: '0.85rem 1rem', 
                background: 'var(--brand-emerald-light)', 
                borderRadius: 'var(--radius-md)', 
                border: '1px solid var(--brand-emerald-border)', 
                fontSize: '0.8rem', 
                color: 'var(--brand-emerald-dark)', 
                textAlign: 'left' 
              }}>
                <strong>Test Credentials:</strong> School Code: <code>DPS001</code> | Roll: <code>1001</code> | DOB: <code>2010-03-15</code>
              </div>
            </div>

            <form className="auth-form" onSubmit={handleIdentitySubmit}>
              {error && (
                <div className="error-message">
                  <AlertCircle size={18} />
                  {error}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>School Code</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="DPS001"
                    value={schoolCode}
                    onChange={(e) => setSchoolCode(e.target.value.toUpperCase())}
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>Roll Number</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="1001"
                    value={rollNo}
                    onChange={(e) => setRollNo(e.target.value)}
                    required 
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.25rem' }}>
                <div className="form-group">
                  <label>PIN (If set)</label>
                  <input 
                    type="password" 
                    className="form-input" 
                    placeholder="••••"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                  />
                </div>
                
                <div className="form-group">
                  <label style={{ color: 'var(--brand-emerald-dark)' }}>First Login? Date of Birth</label>
                  <input 
                    type="date" 
                    className="form-input" 
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                  />
                </div>
              </div>

              <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', marginTop: '0.5rem' }}>
                {loading ? 'Processing...' : (
                  <>{dob ? 'Verify Identity' : 'Sign In'} <LogIn size={18} /></>
                )}
              </button>
            </form>
          </>
        )}

        {/* STEP 2: SET PIN */}
        {step === 2 && (
          <>
            <div className="auth-header">
              <div className="auth-icon-wrapper" style={{ background: 'linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)' }}>
                <UserCheck size={32} />
              </div>
              <h1 className="auth-title">Hi, {studentName.split(' ')[0]}!</h1>
              <p className="auth-subtitle">Identity verified. Set a 4-digit PIN for future logins.</p>
            </div>

            <form className="auth-form" onSubmit={handleSetPinSubmit}>
              {error && (
                <div className="error-message">
                  <AlertCircle size={18} />
                  {error}
                </div>
              )}

              <div className="form-group">
                <label>Create 4-6 Digit PIN</label>
                <input 
                  type="password" 
                  className="form-input" 
                  placeholder="e.g., 1234"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  maxLength={6}
                  required 
                />
              </div>

              <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', marginTop: '0.5rem' }}>
                {loading ? 'Setting PIN...' : (
                  <>Set PIN & Launch Portal <KeyRound size={18} /></>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
