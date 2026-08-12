import { Link } from 'react-router-dom';
import { GraduationCap, Briefcase, BookOpen } from 'lucide-react';
import '../../styles/auth.css';

export default function RoleSelection() {
  return (
    <div className="auth-layout">
      <div className="auth-card" style={{ maxWidth: '600px' }}>
        <div className="auth-header">
          <BookOpen size={48} className="auth-icon" />
          <h1 className="auth-title">Welcome to EduGuide AI</h1>
          <p className="auth-subtitle">Choose your portal to get started</p>
        </div>

        <div className="role-grid">
          <Link to="/login/student" className="role-card">
            <GraduationCap size={40} color="var(--sky-500)" />
            <h3>Student Portal</h3>
          </Link>
          
          <Link to="/login/staff" className="role-card">
            <Briefcase size={40} color="var(--sky-500)" />
            <h3>Staff Portal</h3>
          </Link>
        </div>
      </div>
    </div>
  );
}
