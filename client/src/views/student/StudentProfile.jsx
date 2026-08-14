import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import { 
  User, 
  ShieldCheck, 
  KeyRound, 
  School, 
  Calendar, 
  Hash, 
  BookOpen, 
  CheckCircle, 
  Loader2, 
  AlertCircle,
  ArrowLeft,
  Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function StudentProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const studentId = user?.id || user?._id;

  useEffect(() => {
    if (studentId) {
      fetchStudentProfile();
    }
  }, [studentId]);

  const fetchStudentProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/students/${studentId}`);
      if (res.success && res.data) {
        setProfile(res.data);
      } else {
        setProfile(user);
      }
    } catch (err) {
      // Fall back to context user details if API returns error
      setProfile(user);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '60vh', alignItems: 'center', justifyContent: 'center', color: '#0EA5E9' }}>
        <Loader2 size={40} className="animate-spin" />
      </div>
    );
  }

  const pData = profile || user;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Back Button */}
      <div>
        <Link to="/student" style={{ color: 'var(--slate-500)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.9rem', fontWeight: 500 }}>
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
      </div>

      {/* Hero Banner Card */}
      <div className="dash-card span-12" style={{ 
        background: 'linear-gradient(135deg, #FFFFFF 0%, #F0F9FF 50%, #E0F2FE 100%)',
        border: '1px solid #BAE6FD',
        borderRadius: '20px',
        padding: '2rem',
        boxShadow: '0 8px 24px -4px rgba(14, 165, 233, 0.08)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            fontWeight: 800,
            boxShadow: '0 6px 18px rgba(14, 165, 233, 0.3)'
          }}>
            {pData?.name ? pData.name.charAt(0).toUpperCase() : 'S'}
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
              <span className="badge badge-sky" style={{ background: '#E0F2FE', color: '#0369A1', border: '1px solid #BAE6FD', fontWeight: 700 }}>
                Student Profile
              </span>
              <span className="badge badge-emerald">
                <CheckCircle size={12} /> Active Account
              </span>
            </div>

            <h1 style={{ fontSize: '1.8rem', color: '#0F172A', margin: 0, fontWeight: 800 }}>
              {pData?.name || 'Student Name'}
            </h1>
            <p style={{ color: '#64748B', fontSize: '0.92rem', marginTop: '0.2rem' }}>
              Roll Number: <strong>{pData?.roll_no}</strong> | Grade {pData?.grade || '10'}-{pData?.section || 'A'}
            </p>
          </div>
        </div>
      </div>

      {/* Bento Grid Info Cards */}
      <div className="bento-grid">
        
        {/* Card 1: Personal Details */}
        <div className="dash-card span-6" style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '1.5rem' }}>
          <div className="card-header-row" style={{ marginBottom: '1.25rem' }}>
            <div className="card-title-group">
              <div className="card-icon-badge" style={{ background: '#E0F2FE', color: '#0284C7' }}>
                <User size={22} />
              </div>
              <div>
                <div className="card-title-text">Personal Details</div>
                <div className="card-subtitle-text">Official school roster record</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: '#F8FAFC', borderRadius: '10px' }}>
              <span style={{ color: '#64748B', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <User size={15} /> Full Name
              </span>
              <span style={{ fontWeight: 600, color: '#0F172A', fontSize: '0.88rem' }}>{pData?.name}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: '#F8FAFC', borderRadius: '10px' }}>
              <span style={{ color: '#64748B', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Hash size={15} /> Roll Number
              </span>
              <span style={{ fontWeight: 600, color: '#0F172A', fontSize: '0.88rem' }}>{pData?.roll_no}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: '#F8FAFC', borderRadius: '10px' }}>
              <span style={{ color: '#64748B', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <BookOpen size={15} /> Class & Section
              </span>
              <span style={{ fontWeight: 600, color: '#0F172A', fontSize: '0.88rem' }}>
                Grade {pData?.grade} - {pData?.section}
              </span>
            </div>

            {pData?.dob && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: '#F8FAFC', borderRadius: '10px' }}>
                <span style={{ color: '#64748B', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Calendar size={15} /> Date of Birth
                </span>
                <span style={{ fontWeight: 600, color: '#0F172A', fontSize: '0.88rem' }}>
                  {new Date(pData.dob).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Card 2: Security & Privacy Status */}
        <div className="dash-card span-6" style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '1.5rem' }}>
          <div className="card-header-row" style={{ marginBottom: '1.25rem' }}>
            <div className="card-title-group">
              <div className="card-icon-badge" style={{ background: '#ECFDF5', color: '#10B981' }}>
                <ShieldCheck size={22} />
              </div>
              <div>
                <div className="card-title-text">Security & Consent</div>
                <div className="card-subtitle-text">Authentication and data privacy state</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: '#F8FAFC', borderRadius: '10px' }}>
              <span style={{ color: '#64748B', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <KeyRound size={15} /> 4-6 Digit Security PIN
              </span>
              <span className="badge badge-emerald">
                <CheckCircle size={12} /> Active / Configured
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: '#F8FAFC', borderRadius: '10px' }}>
              <span style={{ color: '#64748B', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <ShieldCheck size={15} /> Data Privacy Consent
              </span>
              <span className={pData?.consent_flag ? 'badge badge-emerald' : 'badge badge-orange'}>
                {pData?.consent_flag ? 'Granted' : 'Pending'}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: '#F8FAFC', borderRadius: '10px' }}>
              <span style={{ color: '#64748B', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <School size={15} /> Multi-Tenant Scoping
              </span>
              <span className="badge badge-sky">School Isolated</span>
            </div>

            <div style={{ 
              marginTop: '0.5rem', 
              padding: '0.75rem 1rem', 
              background: '#F0F9FF', 
              border: '1px solid #BAE6FD', 
              borderRadius: '10px', 
              fontSize: '0.78rem', 
              color: '#0369A1' 
            }}>
              <strong>Note:</strong> Profile records are managed by school administrators. If your class or roll details need updating, please contact your school administrator.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
