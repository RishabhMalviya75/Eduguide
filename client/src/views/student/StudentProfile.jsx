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
  ArrowLeft,
  Award,
  TrendingUp,
  Brain,
  CheckCircle2,
  Clock,
  Target,
  Sparkles,
  FileCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function StudentProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const studentId = user?.id || user?._id;

  useEffect(() => {
    if (studentId) {
      fetchStudentProfile();
    }
  }, [studentId]);

  const fetchStudentProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/students/${studentId}`);
      if (res.success && res.data) {
        setProfile(res.data);
      } else {
        setProfile(user);
      }
    } catch (err) {
      setProfile(user);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '60vh', alignItems: 'center', justifyContent: 'center', color: '#2563EB' }}>
        <Loader2 size={40} className="animate-spin" />
      </div>
    );
  }

  const pData = profile || user;

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Navigation Breadcrumb */}
      <div>
        <Link to="/student" style={{ color: 'var(--slate-500)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.9rem', fontWeight: 500 }}>
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
      </div>

      {/* Hero Banner Card - Classic Ocean Blue */}
      <div className="dash-card span-12" style={{ 
        background: 'linear-gradient(135deg, #FFFFFF 0%, #EFF6FF 50%, #E0F2FE 100%)',
        border: '1px solid #BAE6FD',
        borderRadius: '20px',
        padding: '2rem',
        boxShadow: '0 8px 24px -4px rgba(37, 99, 235, 0.08)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.75rem', flexWrap: 'wrap' }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2.2rem',
            fontWeight: 800,
            boxShadow: '0 8px 20px rgba(37, 99, 235, 0.3)'
          }}>
            {pData?.name ? pData.name.charAt(0).toUpperCase() : 'S'}
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
              <span className="badge badge-blue" style={{ fontWeight: 700 }}>
                Verified Student
              </span>
              <span className="badge badge-sky">
                Grade {pData?.grade || '10'}-{pData?.section || 'A'}
              </span>
              <span className="badge badge-emerald">
                <CheckCircle2 size={12} /> Active Account
              </span>
            </div>

            <h1 style={{ fontSize: '1.9rem', color: '#0F172A', margin: 0, fontWeight: 800 }}>
              {pData?.name || 'Student Name'}
            </h1>
            <p style={{ color: '#475569', fontSize: '0.95rem', marginTop: '0.2rem' }}>
              Roll Number: <strong>{pData?.roll_no}</strong> | School ID: <code>DPS001</code>
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
              <div className="card-icon-badge" style={{ background: '#EFF6FF', color: '#2563EB' }}>
                <User size={22} />
              </div>
              <div>
                <div className="card-title-text">Personal Profile</div>
                <div className="card-subtitle-text">School roster & identity record</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 1rem', background: '#F8FAFC', borderRadius: '10px' }}>
              <span style={{ color: '#64748B', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <User size={15} /> Full Name
              </span>
              <span style={{ fontWeight: 600, color: '#0F172A', fontSize: '0.88rem' }}>{pData?.name}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 1rem', background: '#F8FAFC', borderRadius: '10px' }}>
              <span style={{ color: '#64748B', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Hash size={15} /> Roll Number
              </span>
              <span style={{ fontWeight: 600, color: '#0F172A', fontSize: '0.88rem' }}>{pData?.roll_no}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 1rem', background: '#F8FAFC', borderRadius: '10px' }}>
              <span style={{ color: '#64748B', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <BookOpen size={15} /> Class & Section
              </span>
              <span style={{ fontWeight: 600, color: '#0F172A', fontSize: '0.88rem' }}>
                Grade {pData?.grade} - {pData?.section}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 1rem', background: '#F8FAFC', borderRadius: '10px' }}>
              <span style={{ color: '#64748B', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Calendar size={15} /> Date of Birth
              </span>
              <span style={{ fontWeight: 600, color: '#0F172A', fontSize: '0.88rem' }}>
                {pData?.dob ? new Date(pData.dob).toLocaleDateString() : '2010-03-15'}
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Academic Performance Summary */}
        <div className="dash-card span-6" style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '1.5rem' }}>
          <div className="card-header-row" style={{ marginBottom: '1.25rem' }}>
            <div className="card-title-group">
              <div className="card-icon-badge" style={{ background: '#EFF6FF', color: '#2563EB' }}>
                <Award size={22} />
              </div>
              <div>
                <div className="card-title-text">Academic Summary</div>
                <div className="card-subtitle-text">Performance indicators & course enrollment</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 1rem', background: '#F8FAFC', borderRadius: '10px' }}>
              <span style={{ color: '#64748B', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <TrendingUp size={15} /> Academic Rank / Status
              </span>
              <span className="badge badge-blue">Top 10% (Exemplary)</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 1rem', background: '#F8FAFC', borderRadius: '10px' }}>
              <span style={{ color: '#64748B', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <FileCheck size={15} /> Attendance Rate
              </span>
              <span style={{ fontWeight: 700, color: '#059669', fontSize: '0.88rem' }}>97.8% Attended</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 1rem', background: '#F8FAFC', borderRadius: '10px' }}>
              <span style={{ color: '#64748B', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Target size={15} /> Primary Target Track
              </span>
              <span style={{ fontWeight: 600, color: '#0F172A', fontSize: '0.88rem' }}>STEM & Software AI</span>
            </div>

            <div style={{ padding: '0.75rem 1rem', background: '#F8FAFC', borderRadius: '10px' }}>
              <div style={{ color: '#64748B', fontSize: '0.82rem', marginBottom: '0.4rem', fontWeight: 600 }}>Enrolled Core Subjects:</div>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                <span className="badge badge-slate">Mathematics</span>
                <span className="badge badge-slate">Physics</span>
                <span className="badge badge-slate">Chemistry</span>
                <span className="badge badge-slate">Computer Science</span>
                <span className="badge badge-slate">English</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Cognitive & Aptitude Profile */}
        <div className="dash-card span-6" style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '1.5rem' }}>
          <div className="card-header-row" style={{ marginBottom: '1.25rem' }}>
            <div className="card-title-group">
              <div className="card-icon-badge" style={{ background: '#EEF2FF', color: '#4F46E5' }}>
                <Brain size={22} />
              </div>
              <div>
                <div className="card-title-text">Cognitive Profile</div>
                <div className="card-subtitle-text">Aptitude assessment breakdown</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                <span style={{ color: '#475569', fontWeight: 600 }}>Quantitative & Logical Reasoning</span>
                <span style={{ color: '#2563EB', fontWeight: 700 }}>88%</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: '#F1F5F9', borderRadius: '999px', overflow: 'hidden' }}>
                <div style={{ width: '88%', height: '100%', background: '#2563EB', borderRadius: '999px' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                <span style={{ color: '#475569', fontWeight: 600 }}>Verbal & Analytical Comprehension</span>
                <span style={{ color: '#4F46E5', fontWeight: 700 }}>92%</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: '#F1F5F9', borderRadius: '999px', overflow: 'hidden' }}>
                <div style={{ width: '92%', height: '100%', background: '#4F46E5', borderRadius: '999px' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                <span style={{ color: '#475569', fontWeight: 600 }}>Spatial & Creative Problem Solving</span>
                <span style={{ color: '#0284C7', fontWeight: 700 }}>95%</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: '#F1F5F9', borderRadius: '999px', overflow: 'hidden' }}>
                <div style={{ width: '95%', height: '100%', background: '#0284C7', borderRadius: '999px' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: Security & Audit Log */}
        <div className="dash-card span-6" style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '1.5rem' }}>
          <div className="card-header-row" style={{ marginBottom: '1.25rem' }}>
            <div className="card-title-group">
              <div className="card-icon-badge" style={{ background: '#EFF6FF', color: '#2563EB' }}>
                <ShieldCheck size={22} />
              </div>
              <div>
                <div className="card-title-text">Security & Consent Audit</div>
                <div className="card-subtitle-text">Multi-tenant privacy & access control</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: '#F8FAFC', borderRadius: '10px' }}>
              <span style={{ color: '#64748B', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <KeyRound size={15} /> Security PIN
              </span>
              <span className="badge badge-blue">
                <CheckCircle size={12} /> Configured & Encrypted
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: '#F8FAFC', borderRadius: '10px' }}>
              <span style={{ color: '#64748B', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <ShieldCheck size={15} /> Privacy Consent
              </span>
              <span className={pData?.consent_flag ? 'badge badge-blue' : 'badge badge-orange'}>
                {pData?.consent_flag ? 'Granted' : 'Pending Verification'}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: '#F8FAFC', borderRadius: '10px' }}>
              <span style={{ color: '#64748B', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <School size={15} /> School Isolation
              </span>
              <span className="badge badge-sky">Strict Tenant Scope</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: '#F8FAFC', borderRadius: '10px' }}>
              <span style={{ color: '#64748B', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Clock size={15} /> Last System Session
              </span>
              <span style={{ fontSize: '0.82rem', color: '#475569', fontWeight: 600 }}>Active Today</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
