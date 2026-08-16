import { useAuth } from '../context/AuthContext';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  GraduationCap, 
  BookOpen, 
  FileCheck2, 
  UserCheck, 
  ShieldAlert, 
  LogOut, 
  Sparkles,
  Users,
  Award,
  BarChart3
} from 'lucide-react';

export default function Sidebar() {
  const { user, logout } = useAuth();

  if (!user) return null;

  const role = user.role;

  return (
    <aside className="app-sidebar">
      {/* Branded Header Logo */}
      <div className="sidebar-logo">
        <img src="/logo.png" alt="EduGuide Logo" style={{ width: '64px', height: '64px', objectFit: 'contain' }} />
        <div>
          <div className="sidebar-logo-text">EduGuide <span className="sidebar-logo-tag">AI</span></div>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Navigation</div>

        {/* Student Links */}
        {role === 'Student' && (
          <>
            <NavLink to="/student" end className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
              <LayoutDashboard size={20} />
              <span>My Portal</span>
            </NavLink>
            <NavLink to="/activities" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
              <Sparkles size={20} />
              <span>Activity Hub</span>
            </NavLink>
            <NavLink to="/student/test" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
              <Award size={20} />
              <span>Aptitude Test</span>
            </NavLink>
            <NavLink to="/student/profile" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
              <Users size={20} />
              <span>My Profile</span>
            </NavLink>
            <NavLink to={`/student/report/${user.id || user._id}`} className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
              <BarChart3 size={20} />
              <span>Career Report</span>
            </NavLink>
          </>
        )}

        {/* Staff / Teacher / Counselor Links */}
        {(role === 'Teacher' || role === 'Counselor' || role === 'Admin') && (
          <>
            <NavLink to="/teacher" end className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
              <LayoutDashboard size={20} />
              <span>Class Overview</span>
            </NavLink>
            <NavLink to="/activities" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
              <Sparkles size={20} />
              <span>Activity Hub</span>
            </NavLink>
            <NavLink to="/teacher/upload" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
              <BookOpen size={20} />
              <span>Upload Marks</span>
            </NavLink>
            <NavLink to="/counselor" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
              <UserCheck size={20} />
              <span>PI Sessions</span>
            </NavLink>
            <NavLink to="/staff/review-queue" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
              <ShieldAlert size={20} />
              <span>AI Review Queue</span>
            </NavLink>
          </>
        )}


        {/* Admin Links */}
        {role === 'Admin' && (
          <>
            <div className="sidebar-section-label" style={{ marginTop: '1rem' }}>Administration</div>
            <NavLink to="/admin" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
              <Users size={20} />
              <span>Admin Console</span>
            </NavLink>
          </>
        )}
      </nav>

      {/* Footer Profile Snippet */}
      <div className="sidebar-user-footer">
        <div className="user-profile-pill">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div className="user-avatar">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="user-details">
              <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--slate-800)', lineHeight: 1.2 }}>
                {user.name}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--slate-500)' }}>
                {role}
              </div>
            </div>
          </div>
          <button 
            onClick={logout} 
            title="Logout"
            style={{ 
              border: 'none', 
              background: 'transparent', 
              color: 'var(--slate-400)', 
              cursor: 'pointer', 
              padding: '0.25rem',
              borderRadius: '6px',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.color = '#EF4444'}
            onMouseOut={(e) => e.currentTarget.style.color = 'var(--slate-400)'}
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
}
