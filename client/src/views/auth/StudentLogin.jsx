import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GraduationCap, LogIn, AlertCircle, ArrowLeft, UserCheck, KeyRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import '../../styles/auth.css';

export default function StudentLogin() {
  const navigate = useNavigate();
  const { verifyStudentIdentity, setStudentPin, loginStudent } = useAuth();
  
  // Steps: 1 = Identity, 2 = Set PIN, 3 = Login with PIN
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

  // ----------------------------------------------------
  // Step 1: Verify Identity OR standard Login
  // ----------------------------------------------------
  const handleIdentitySubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Try standard PIN login first if they didn't provide DOB
    if (!dob) {
      if (!pin) {
        setError('Please provide a PIN if you have set one, or provide your Date of Birth for first login.');
        setLoading(false);
        return;
      }

      // Try PIN login
      const result = await loginStudent(schoolCode, rollNo, pin);
      if (result.success) {
        navigate('/student');
      } else {
        setError(result.error);
        setLoading(false);
      }
      return;
    }

    // Try Identity Verification (First Login)
    const result = await verifyStudentIdentity(schoolCode, rollNo, dob);
    
    if (result.success) {
      setIdentityToken(result.data.identity_token);
      setStudentName(result.data.student_name);
      setStep(2); // Move to Set PIN step
    } else {
      // If error says PIN already set, suggest they use standard login
      if (result.error.includes('PIN already set')) {
        setError('You have already set a PIN. Please clear the DOB field and enter your PIN instead.');
      } else {
        setError(result.error);
      }
    }
    setLoading(false);
  };

  // ----------------------------------------------------
  // Step 2: Set PIN
  // ----------------------------------------------------
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
            <Link to="/" style={{ color: 'var(--slate-500)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.9rem' }}>
              <ArrowLeft size={16} /> Back
            </Link>
          </div>
        )}

        {/* STEP 1: VERIFY IDENTITY OR LOGIN */}
        {step === 1 && (
          <>
            <div className="auth-header">
              <GraduationCap size={40} className="auth-icon" />
              <h1 className="auth-title">Student Portal</h1>
              <p className="auth-subtitle">Login with your School Code and Roll Number</p>
            </div>

            <form className="auth-form" onSubmit={handleIdentitySubmit}>
              {error && (
                <div className="error-message">
                  <AlertCircle size={18} />
                  {error}
                </div>
              )}

              <div className="form-group">
                <label>School Code</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g., DPS001"
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
                  placeholder="e.g., 1001"
                  value={rollNo}
                  onChange={(e) => setRollNo(e.target.value)}
                  required 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
                <div className="form-group">
                  <label>PIN (If already set)</label>
                  <input 
                    type="password" 
                    className="form-input" 
                    placeholder="••••"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                  />
                </div>
                
                <div className="form-group">
                  <label style={{ fontSize: '0.8rem', color: 'var(--sky-600)' }}>First Login? Enter DOB instead</label>
                  <input 
                    type="date" 
                    className="form-input" 
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                  />
                </div>
              </div>

              <button type="submit" className="btn-primary" disabled={loading}>
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
              <UserCheck size={40} className="auth-icon" />
              <h1 className="auth-title">Hi, {studentName.split(' ')[0]}!</h1>
              <p className="auth-subtitle">Identity verified. Please set a secure PIN for future logins.</p>
            </div>

            <form className="auth-form" onSubmit={handleSetPinSubmit}>
              {error && (
                <div className="error-message">
                  <AlertCircle size={18} />
                  {error}
                </div>
              )}

              <div className="form-group">
                <label>Create a 4-6 digit PIN</label>
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

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Setting PIN...' : (
                  <>Set PIN & Login <KeyRound size={18} /></>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
