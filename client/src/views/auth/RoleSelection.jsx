import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GraduationCap, Briefcase, ArrowRight, Shield, UserCheck, School, X } from 'lucide-react';
import '../../styles/auth.css';

export default function RoleSelection() {
  const navigate = useNavigate();
  const [showStaffModal, setShowStaffModal] = useState(false);

  const handleSelectStaffRole = (role) => {
    setShowStaffModal(false);
    navigate(`/login/staff?role=${role}`);
  };

  return (
    <div className="auth-layout">
      <div className="auth-card" style={{ maxWidth: '660px', position: 'relative' }}>
        
        <div className="auth-header" style={{ marginBottom: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <img src="/logo.png" alt="EduGuide Logo" style={{ width: '64px', height: '64px', objectFit: 'contain' }} />
          </div>
          <h1 className="auth-title" style={{ fontSize: '1.85rem' }}>Welcome to EduGuide AI</h1>
          <p className="auth-subtitle">Select your portal to access holistic evaluation & career analytics</p>
        </div>

        <div className="role-grid">
          {/* Student Portal Card */}
          <Link to="/login/student" className="role-card student" style={{ textDecoration: 'none' }}>
            <div className="role-card-icon" style={{ background: '#EFF6FF', color: '#2563EB' }}>
              <GraduationCap size={32} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', color: '#0F172A' }}>Student Portal</h3>
              <p style={{ color: '#64748B', fontSize: '0.85rem' }}>Aptitude tests, skill radar & career matches</p>
            </div>
            <div className="badge badge-blue" style={{ marginTop: '0.5rem', width: 'fit-content' }}>
              <span>Enter Portal</span>
              <ArrowRight size={12} />
            </div>
          </Link>
          
          {/* Staff Portal Card -> Opens Role Choice */}
          <div 
            onClick={() => setShowStaffModal(true)} 
            className="role-card staff" 
            style={{ cursor: 'pointer' }}
          >
            <div className="role-card-icon" style={{ background: '#EEF2FF', color: '#4F46E5' }}>
              <Briefcase size={32} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', color: '#0F172A' }}>Staff Portal</h3>
              <p style={{ color: '#64748B', fontSize: '0.85rem' }}>School Admins, Teachers & Counselors</p>
            </div>
            <div className="badge badge-violet" style={{ marginTop: '0.5rem', width: 'fit-content' }}>
              <span>Select Role</span>
              <ArrowRight size={12} />
            </div>
          </div>
        </div>

        {/* Staff Role Modal */}
        {showStaffModal && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.55)',
            backdropFilter: 'blur(8px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}>
            <div style={{
              background: '#FFFFFF',
              borderRadius: '20px',
              maxWidth: '480px',
              width: '100%',
              padding: '2rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              position: 'relative',
              animation: 'fadeIn 0.2s ease-out'
            }}>
              <button 
                onClick={() => setShowStaffModal(false)}
                style={{
                  position: 'absolute',
                  top: '1.25rem',
                  right: '1.25rem',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  color: '#64748B'
                }}
              >
                <X size={20} />
              </button>

              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <img src="/logo.png" alt="EduGuide" style={{ width: '44px', height: '44px', margin: '0 auto 0.75rem auto', objectFit: 'contain' }} />
                <h2 style={{ fontSize: '1.35rem', color: '#0F172A' }}>Select Your Staff Role</h2>
                <p style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '0.25rem' }}>
                  Choose your role to access your dedicated workspace
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <button 
                  onClick={() => handleSelectStaffRole('Admin')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '1rem 1.25rem',
                    border: '1px solid #E2E8F0',
                    borderRadius: '12px',
                    background: '#F8FAFC',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.borderColor = '#2563EB'; e.currentTarget.style.background = '#EFF6FF'; }}
                  onMouseOut={(e) => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.background = '#F8FAFC'; }}
                >
                  <div style={{ padding: '0.6rem', background: '#EEF2FF', color: '#4F46E5', borderRadius: '10px' }}>
                    <Shield size={22} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0F172A' }}>School Administrator</div>
                    <div style={{ fontSize: '0.78rem', color: '#64748B' }}>System settings, student onboarding & access control</div>
                  </div>
                </button>

                <button 
                  onClick={() => handleSelectStaffRole('Teacher')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '1rem 1.25rem',
                    border: '1px solid #E2E8F0',
                    borderRadius: '12px',
                    background: '#F8FAFC',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.borderColor = '#2563EB'; e.currentTarget.style.background = '#EFF6FF'; }}
                  onMouseOut={(e) => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.background = '#F8FAFC'; }}
                >
                  <div style={{ padding: '0.6rem', background: '#EFF6FF', color: '#2563EB', borderRadius: '10px' }}>
                    <School size={22} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0F172A' }}>Class Teacher</div>
                    <div style={{ fontSize: '0.78rem', color: '#64748B' }}>Marks upload, class overview & academic tracking</div>
                  </div>
                </button>

                <button 
                  onClick={() => handleSelectStaffRole('Counselor')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '1rem 1.25rem',
                    border: '1px solid #E2E8F0',
                    borderRadius: '12px',
                    background: '#F8FAFC',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.borderColor = '#2563EB'; e.currentTarget.style.background = '#EFF6FF'; }}
                  onMouseOut={(e) => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.background = '#F8FAFC'; }}
                >
                  <div style={{ padding: '0.6rem', background: '#F0F9FF', color: '#0284C7', borderRadius: '10px' }}>
                    <UserCheck size={22} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0F172A' }}>Career Counselor</div>
                    <div style={{ fontSize: '0.78rem', color: '#64748B' }}>Personal interviews, qualitative feedback & review queue</div>
                  </div>
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
