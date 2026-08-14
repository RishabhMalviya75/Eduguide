import { useAuth } from '../context/AuthContext';
import { Search, Bell, School, Shield, Sparkles } from 'lucide-react';

export default function Header() {
  const { user } = useAuth();

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
        </div>
      </div>
    </header>
  );
}
