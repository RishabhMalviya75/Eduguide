import { useAuth } from '../context/AuthContext';
import { Search, Bell, School, Shield, Sparkles, LogOut } from 'lucide-react';

export default function Header() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <header className="app-top-header">
      {/* Search Input */}
      <div className="header-search">
        <Search size={16} color="var(--slate-400)" />
        <input type="text" placeholder="Search students, tests, metrics..." />
      </div>

      {/* Header Context Badges & Actions */}
      <div className="header-actions">
        {/* Active School Context */}
        <div className="badge badge-emerald" style={{ padding: '0.4rem 0.85rem' }}>
          <School size={14} />
          <span>Delhi Public School - Test Campus</span>
        </div>

        {/* User Role Badge */}
        <div className="badge badge-violet" style={{ padding: '0.4rem 0.85rem' }}>
          <Shield size={14} />
          <span>{user.role} Mode</span>
        </div>

        {/* Notifications Pill */}
        <div 
          style={{
            position: 'relative',
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            background: '#FFFFFF',
            border: '1px solid var(--slate-200)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--slate-600)',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
          }}
        >
          <Bell size={18} />
          <span 
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: 'var(--brand-emerald)'
            }}
          />
        {/* User Profile Block */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: '1rem', paddingLeft: '1rem', borderLeft: '1px solid var(--slate-200)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div className="user-avatar" style={{ width: '32px', height: '32px', fontSize: '0.8rem', background: 'var(--brand-navy)', color: '#FFFFFF' }}>
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--slate-900)', lineHeight: 1.1 }}>{user.name}</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--slate-500)' }}>{user.role}</span>
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
              transition: 'all 0.2s ease',
              marginLeft: '0.25rem'
            }}
            onMouseOver={(e) => e.currentTarget.style.color = '#EF4444'}
            onMouseOut={(e) => e.currentTarget.style.color = 'var(--slate-400)'}
          >
            <LogOut size={16} />
          </button>
        </div>
        </div>
      </div>
    </header>
  );
}
