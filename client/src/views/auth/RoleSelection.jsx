import { Link } from 'react-router-dom';
import { GraduationCap, Briefcase, Sparkles, ArrowRight } from 'lucide-react';
import '../../styles/auth.css';

export default function RoleSelection() {
  return (
    <div className="auth-layout">
      <div className="auth-card" style={{ maxWidth: '640px' }}>
        <div className="auth-header">
          <div className="auth-icon-wrapper">
            <Sparkles size={32} />
          </div>
          <h1 className="auth-title">Welcome to EduGuide AI</h1>
          <p className="auth-subtitle">Select your portal to access holistic evaluation & career analytics</p>
        </div>

        <div className="role-grid">
          <Link to="/login/student" className="role-card student">
            <div className="role-card-icon">
              <GraduationCap size={30} />
            </div>
            <div>
              <h3>Student Portal</h3>
              <p>Aptitude tests, skill radar & career matches</p>
            </div>
            <div className="badge badge-emerald" style={{ marginTop: '0.25rem' }}>
              <span>Enter Portal</span>
              <ArrowRight size={12} />
            </div>
          </Link>
          
          <Link to="/login/staff" className="role-card staff">
            <div className="role-card-icon">
              <Briefcase size={30} />
            </div>
            <div>
              <h3>Staff Portal</h3>
              <p>Teachers, Counselors & School Admins</p>
            </div>
            <div className="badge badge-violet" style={{ marginTop: '0.25rem' }}>
              <span>Staff Login</span>
              <ArrowRight size={12} />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
