import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GraduationCap, LogIn, AlertCircle, ArrowLeft, UserCheck, KeyRound, Calendar, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import '../../styles/auth.css';

export default function StudentLogin() {
  const navigate = useNavigate();
  const { verifyStudentIdentity, setStudentPin, loginStudent } = useAuth();
  
  // Mode: 'login' (PIN Login) or 'register' (First Time DOB Verification)
  const [mode, setMode] = useState('login');
  // Step for registration: 1 = Verify DOB, 2 = Set PIN
  const [regStep, setRegStep] = useState(1);

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const [identityToken, setIdentityToken] = useState(null);
  const [studentName, setStudentName] = useState('');

  // Form fields
  const [schoolCode, setSchoolCode] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [dob, setDob] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  const clearState = () => {
    setError(null);
    setLoading(false);
  };

  const handleModeSwitch = (newMode) => {
    setMode(newMode);
    setRegStep(1);
    clearState();
  };

  // Step 3 / Direct PIN Login
  const handlePinLogin = async (e) => {
    e.preventDefault();
    clearState();

    if (!schoolCode.trim()) {
      setError('School Code is required.');
      return;
    }
    if (!rollNo.trim()) {
      setError('Roll Number is required.');
      return;
    }
    if (!pin) {
      setError('PIN is required.');
      return;
    }
    if (!/^\d{4,6}$/.test(pin)) {
      setError('PIN must be 4 to 6 digits.');
      return;
    }

    setLoading(true);
    const result = await loginStudent(schoolCode.trim().toUpperCase(), rollNo.trim(), pin);
    
    if (result.success) {
      navigate('/student');
    } else {
      let msg = result.error || 'Invalid credentials. Please check your details.';
      if (msg.toLowerCase().includes('pin not set') || msg.toLowerCase().includes('first login')) {
        msg = 'No PIN set for this account yet. Please switch to "First-Time Student" tab.';
      }
      setError(msg);
      setLoading(false);
    }
  };

  // Step 1: First-Time DOB Identity Verification
  const handleVerifyIdentity = async (e) => {
    e.preventDefault();
    clearState();

    if (!schoolCode.trim()) {
      setError('School Code is required.');
      return;
    }
    if (!rollNo.trim()) {
      setError('Roll Number is required.');
      return;
    }
    if (!dob) {
      setError('Date of Birth is required for first-time login.');
      return;
    }

    setLoading(true);
    const result = await verifyStudentIdentity(schoolCode.trim().toUpperCase(), rollNo.trim(), dob);

    if (result.success) {
      setIdentityToken(result.data.identity_token);
      setStudentName(result.data.student_name || 'Student');
      setRegStep(2);
    } else {
      let msg = result.error || 'Verification failed.';
      if (msg.includes('PIN already set')) {
        msg = 'You have already set a PIN! Please switch to the "PIN Login" tab above.';
      }
      setError(msg);
    }
    setLoading(false);
  };

  // Step 2: Create 4-6 Digit PIN
  const handleSetPin = async (e) => {
    e.preventDefault();
    clearState();

    if (!pin) {
      setError('Please enter a 4-6 digit PIN.');
      return;
    }
    if (!/^\d{4,6}$/.test(pin)) {
      setError('PIN must be between 4 and 6 numeric digits.');
      return;
    }
    if (pin !== confirmPin) {
      setError('PINs do not match. Please try again.');
      return;
    }

    setLoading(true);
    const result = await setStudentPin(identityToken, pin);

    if (result.success) {
      navigate('/student');
    } else {
      setError(result.error || 'Failed to set PIN. Please try again.');
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

        {/* Header Banner */}
        <div className="auth-header" style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' }}>
            <img src="/logo.png" alt="EduGuide Logo" style={{ width: '72px', height: '72px', objectFit: 'contain' }} />
          </div>
          <h1 className="auth-title" style={{ fontSize: '1.65rem' }}>Student Portal</h1>
          <p className="auth-subtitle">Access your Career Fit Zone & Assessment Reports</p>
          
          <div style={{ 
            marginTop: '1rem', 
            padding: '0.85rem 1rem', 
            background: 'var(--accent-sky-light, #F0F9FF)', 
            borderRadius: 'var(--radius-md, 8px)', 
            border: '1px solid var(--accent-sky-border, #BAE6FD)', 
            fontSize: '0.8rem', 
            color: '#0369A1', 
            textAlign: 'left' 
          }}>
            <strong>Test Student Credentials:</strong> School Code: <code>DPS001</code> | Roll: <code>1001</code> | DOB: <code>2010-03-15</code>
          </div>
        </div>

        {/* Mode Toggle Tabs (when not in Step 2 of registration) */}
        {regStep === 1 && (
          <div style={{
            display: 'flex',
            background: '#F1F5F9',
            padding: '0.25rem',
            borderRadius: '10px',
            marginBottom: '1.25rem',
            gap: '0.25rem'
          }}>
            <button
              type="button"
              onClick={() => handleModeSwitch('login')}
              style={{
                flex: 1,
                padding: '0.55rem 0.75rem',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                background: mode === 'login' ? '#FFFFFF' : 'transparent',
                color: mode === 'login' ? '#0F172A' : '#64748B',
                boxShadow: mode === 'login' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem'
              }}
            >
              <Lock size={15} /> PIN Login
            </button>
            <button
              type="button"
              onClick={() => handleModeSwitch('register')}
              style={{
                flex: 1,
                padding: '0.55rem 0.75rem',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                background: mode === 'register' ? '#FFFFFF' : 'transparent',
                color: mode === 'register' ? '#0F172A' : '#64748B',
                boxShadow: mode === 'register' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem'
              }}
            >
              <Calendar size={15} /> First-Time (Set PIN)
            </button>
          </div>
        )}

        {/* Global Error Banner */}
        {error && (
          <div className="error-message" style={{ marginBottom: '1rem' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* MODE 1: STANDARD PIN LOGIN */}
        {mode === 'login' && regStep === 1 && (
          <form className="auth-form" onSubmit={handlePinLogin}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label htmlFor="schoolCode">School Code</label>
                <input 
                  id="schoolCode"
                  type="text" 
                  className="form-input" 
                  placeholder="e.g., DPS001"
                  value={schoolCode}
                  onChange={(e) => setSchoolCode(e.target.value.toUpperCase())}
                  required 
                />
              </div>

              <div className="form-group">
                <label htmlFor="rollNo">Roll Number</label>
                <input 
                  id="rollNo"
                  type="text" 
                  className="form-input" 
                  placeholder="e.g., 1001"
                  value={rollNo}
                  onChange={(e) => setRollNo(e.target.value)}
                  required 
                />
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '0.5rem' }}>
              <label htmlFor="pin">4-6 Digit Security PIN</label>
              <input 
                id="pin"
                type="password" 
                className="form-input" 
                placeholder="••••"
                value={pin}
                maxLength={6}
                onChange={(e) => setPin(e.target.value)}
                required 
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', marginTop: '0.75rem' }}>
              {loading ? 'Signing In...' : (
                <>Sign In to Portal <LogIn size={18} /></>
              )}
            </button>
          </form>
        )}

        {/* MODE 2: FIRST TIME DOB VERIFICATION (STEP 1) */}
        {mode === 'register' && regStep === 1 && (
          <form className="auth-form" onSubmit={handleVerifyIdentity}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label htmlFor="regSchoolCode">School Code</label>
                <input 
                  id="regSchoolCode"
                  type="text" 
                  className="form-input" 
                  placeholder="DPS001"
                  value={schoolCode}
                  onChange={(e) => setSchoolCode(e.target.value.toUpperCase())}
                  required 
                />
              </div>

              <div className="form-group">
                <label htmlFor="regRollNo">Roll Number</label>
                <input 
                  id="regRollNo"
                  type="text" 
                  className="form-input" 
                  placeholder="1001"
                  value={rollNo}
                  onChange={(e) => setRollNo(e.target.value)}
                  required 
                />
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '0.5rem' }}>
              <label htmlFor="dob">Date of Birth</label>
              <input 
                id="dob"
                type="date" 
                className="form-input" 
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                required 
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', marginTop: '0.75rem' }}>
              {loading ? 'Verifying Identity...' : (
                <>Verify Identity <UserCheck size={18} /></>
              )}
            </button>
          </form>
        )}

        {/* STEP 2: SET PIN (after Identity Verified) */}
        {regStep === 2 && (
          <div>
            <div style={{ 
              background: '#F0FDF4', 
              border: '1px solid #BBF7D0', 
              borderRadius: '8px', 
              padding: '0.75rem 1rem', 
              marginBottom: '1rem',
              textAlign: 'center'
            }}>
              <div style={{ fontWeight: 700, color: '#166534', fontSize: '0.95rem' }}>
                Identity Verified: {studentName}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#15803D' }}>
                Create your secret 4-6 digit PIN for quick future logins.
              </div>
            </div>

            <form className="auth-form" onSubmit={handleSetPin}>
              <div className="form-group">
                <label htmlFor="newPin">Create 4-6 Digit PIN</label>
                <input 
                  id="newPin"
                  type="password" 
                  className="form-input" 
                  placeholder="e.g., 1234"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  maxLength={6}
                  required 
                />
              </div>

              <div className="form-group" style={{ marginTop: '0.5rem' }}>
                <label htmlFor="confirmPin">Confirm PIN</label>
                <input 
                  id="confirmPin"
                  type="password" 
                  className="form-input" 
                  placeholder="Re-enter PIN"
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value)}
                  maxLength={6}
                  required 
                />
              </div>

              <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', marginTop: '0.75rem' }}>
                {loading ? 'Setting PIN...' : (
                  <>Set PIN & Launch Dashboard <KeyRound size={18} /></>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
