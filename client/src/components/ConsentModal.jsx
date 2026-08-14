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
      background: 'rgba(15, 23, 42, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '1rem'
    }}>
      <div className="bento-card" style={{ maxWidth: '600px', width: '100%', background: 'white' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <ShieldCheck size={48} color="var(--sky-500)" style={{ margin: '0 auto' }} />
          <h2 style={{ color: 'var(--slate-800)', marginTop: '1rem' }}>Data Privacy & Consent</h2>
        </div>
        
        <div style={{ color: 'var(--slate-600)', lineHeight: '1.6', marginBottom: '2rem' }}>
          <p>Welcome to EduGuide AI. To provide you with personalized career guidance, we need your consent to collect and process your data.</p>
          <ul style={{ paddingLeft: '1.5rem', marginTop: '1rem', marginBottom: '1rem' }}>
            <li><strong>AI Scoring:</strong> Your test responses, including essays, will be evaluated by our automated AI scoring pipeline.</li>
            <li><strong>Proctoring:</strong> We track your tab switches (focus loss) and IP address during tests to ensure academic integrity. (No camera/audio is recorded).</li>
            <li><strong>Career Mapping:</strong> Your counselor's Personal Interview (PI) notes and test scores are used to map you to relevant career paths.</li>
          </ul>
          <p>By clicking "I Agree", you acknowledge and consent to these terms.</p>
          
          {error && <p style={{ color: 'var(--error-text)', marginTop: '1rem' }}>{error}</p>}
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            className="btn-secondary" 
            style={{ flex: 1 }}
            onClick={handleDecline}
            disabled={loading}
          >
            Decline & Logout
          </button>
          <button 
            className="btn-primary" 
            style={{ flex: 1, justifyContent: 'center' }}
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
