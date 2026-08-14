import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function ConsentModal({ studentId, onConsentGranted }) {
  const { updateConsent, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAccept = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.put(`/students/${studentId}/consent`);
      if (res.success) {
        if (updateConsent) updateConsent();
        onConsentGranted();
      } else {
        setError(res.error || 'Failed to record consent. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'Failed to record consent. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDecline = () => {
    logout();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(15, 23, 42, 0.4)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '1rem'
    }}>
      <div style={{ 
        maxWidth: '480px', 
        width: '100%', 
        background: '#FFFFFF', 
        borderRadius: '16px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        padding: '2rem',
        border: '1px solid var(--slate-200)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <ShieldCheck size={44} color="#0EA5E9" style={{ margin: '0 auto', strokeWidth: 2.5 }} />
          <h2 style={{ color: '#0F172A', marginTop: '1rem', fontSize: '1.4rem', fontWeight: 800 }}>Data Privacy & Consent</h2>
        </div>
        
        <div style={{ color: '#475569', lineHeight: '1.7', marginBottom: '2.5rem', fontSize: '0.95rem' }}>
          <p style={{ marginBottom: '1rem' }}>Welcome to EduGuide AI. To provide you with personalized career guidance, we need your consent to collect and process your data.</p>
          <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <li><strong>AI Scoring:</strong> Your test responses, including essays, will be evaluated by our automated AI scoring pipeline.</li>
            <li><strong>Proctoring:</strong> We track your tab switches (focus loss) and IP address during tests to ensure academic integrity. (No camera/audio is recorded).</li>
            <li><strong>Career Mapping:</strong> Your counselor's Personal Interview (PI) notes and test scores are used to map you to relevant career paths.</li>
          </ul>
          <p>By clicking "I Agree", you acknowledge and consent to these terms.</p>
          
          {error && <p style={{ color: '#DC2626', marginTop: '1rem', fontWeight: 600 }}>{error}</p>}
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            className="btn-secondary" 
            style={{ flex: 1, padding: '0.75rem', justifyContent: 'center', fontSize: '0.95rem' }}
            onClick={handleDecline}
            disabled={loading}
          >
            Decline & Logout
          </button>
          <button 
            className="btn-primary" 
            style={{ flex: 1, padding: '0.75rem', justifyContent: 'center', fontSize: '0.95rem', background: '#0F172A' }}
            onClick={handleAccept}
            disabled={loading}
          >
            {loading ? 'Recording...' : 'I Agree'}
          </button>
        </div>
      </div>
    </div>
  );
}
