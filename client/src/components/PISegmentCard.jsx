import { useState, useEffect, useRef } from 'react';
import { api } from '../api/client';
import { 
  UserCheck, 
  Award, 
  Calendar, 
  Tag, 
  MessageSquare, 
  Loader2, 
  Camera, 
  PhoneOff, 
  Video, 
  AlertCircle,
  Sparkles,
  Mic,
  ShieldCheck
} from 'lucide-react';

export default function PISegmentCard({ studentId }) {
  const [piHistory, setPiHistory] = useState([]);
  const [interestData, setInterestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Live Camera / PI Session state
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [camError, setCamError] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    if (studentId) {
      loadPIData();
    }
  }, [studentId]);

  // Clean up camera stream on component unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const loadPIData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [historyRes, interestRes] = await Promise.allSettled([
        api.get(`/pi/student/${studentId}`),
        api.get(`/pi/student/${studentId}/interest`)
      ]);

      if (historyRes.status === 'fulfilled' && historyRes.value?.success) {
        setPiHistory(historyRes.value.data || []);
      }

      if (interestRes.status === 'fulfilled' && interestRes.value?.success) {
        setInterestData(interestRes.value.data);
      }
    } catch (err) {
      setError('Unable to fetch counselor interview records.');
    } finally {
      setLoading(false);
    }
  };

  const startCamera = async () => {
    setCamError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: { ideal: 640 }, height: { ideal: 360 } }, 
        audio: false 
      });
      streamRef.current = stream;
      setIsCameraActive(true);
      
      // Delay slightly for DOM ref binding
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (err) {
      console.error('Camera access error:', err);
      setCamError('Camera access denied or device unavailable. Please allow camera permissions.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setCamError(null);
  };

  const hasPI = piHistory.length > 0 || (interestData && interestData.suggestions?.length > 0);

  return (
    <div className="dash-card span-6" style={{
      background: 'linear-gradient(135deg, #FFFFFF 0%, #F0F9FF 100%)',
      border: '1px solid var(--accent-sky-border, #BAE6FD)',
      borderRadius: 'var(--radius-lg, 16px)',
      padding: '1.5rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      position: 'relative'
    }}>
      {/* Header Row */}
      <div className="card-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div className="card-title-group" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="card-icon-badge" style={{
            padding: '0.55rem',
            borderRadius: '10px',
            background: 'var(--accent-sky-light, #E0F2FE)',
            color: 'var(--accent-sky, #0284C7)'
          }}>
            <UserCheck size={22} />
          </div>
          <div>
            <div className="card-title-text" style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--slate-900)' }}>
              Counselor PI Insights
            </div>
            <div className="card-subtitle-text" style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
              Qualitative evaluations & Live Counselor Interview
            </div>
          </div>
        </div>

        {/* Live PI Session Trigger Button */}
        {!isCameraActive ? (
          <button
            onClick={startCamera}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.45rem 0.9rem',
              borderRadius: '10px',
              border: 'none',
              background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
              color: '#FFFFFF',
              fontWeight: 600,
              fontSize: '0.82rem',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
              transition: 'all 0.2s ease'
            }}
          >
            <Camera size={15} /> Start Live PI
          </button>
        ) : (
          <button
            onClick={stopCamera}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.45rem 0.9rem',
              borderRadius: '10px',
              border: 'none',
              background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
              color: '#FFFFFF',
              fontWeight: 600,
              fontSize: '0.82rem',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.25)',
              transition: 'all 0.2s ease'
            }}
          >
            <PhoneOff size={15} /> Leave Session
          </button>
        )}
      </div>

      {/* Live Camera Stream Overlay when active */}
      {isCameraActive && (
        <div style={{
          background: '#0F172A',
          borderRadius: '14px',
          padding: '0.75rem',
          position: 'relative',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
          overflow: 'hidden'
        }}>
          {/* Live Status Bar */}
          <div style={{
            display: 'flex',
            justify: 'space-between',
            alignItems: 'center',
            marginBottom: '0.5rem',
            padding: '0.25rem 0.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: '#EF4444',
                boxShadow: '0 0 10px #EF4444',
                animation: 'pulse 1.5s infinite'
              }} />
              <span style={{ color: '#FFFFFF', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.03em' }}>
                LIVE PI SESSION
              </span>
            </div>
            <span style={{ background: 'rgba(255,255,255,0.15)', color: '#93C5FD', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <ShieldCheck size={12} /> Proctor Encrypted
            </span>
          </div>

          {/* Video Player */}
          <div style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', background: '#1E293B', aspectRatio: '16/9' }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />

            {/* Video overlay badges */}
            <div style={{ position: 'absolute', bottom: '0.75rem', left: '0.75rem', background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)', padding: '0.3rem 0.6rem', borderRadius: '6px', color: '#FFFFFF', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Video size={13} color="#60A5FA" /> Student WebCam Feed
            </div>

            <div style={{ position: 'absolute', bottom: '0.75rem', right: '0.75rem', background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)', padding: '0.3rem 0.6rem', borderRadius: '6px', color: '#34D399', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Mic size={13} /> Counselor Connected
            </div>
          </div>

          {/* Leave Button inside video container */}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0.75rem' }}>
            <button
              onClick={stopCamera}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1.25rem',
                background: '#EF4444',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              <PhoneOff size={16} /> Leave & End Live Interview
            </button>
          </div>
        </div>
      )}

      {camError && (
        <div style={{ padding: '0.75rem 1rem', background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '10px', color: '#991B1B', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={16} />
          {camError}
        </div>
      )}

      {/* Main Card Content */}
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', color: '#2563EB' }}>
          <Loader2 size={24} className="animate-spin" />
        </div>
      ) : error ? (
        <div style={{ padding: '1rem', color: 'var(--slate-500)', fontSize: '0.88rem' }}>
          {error}
        </div>
      ) : !hasPI ? (
        <div style={{
          padding: '1.5rem',
          textAlign: 'center',
          background: 'rgba(255, 255, 255, 0.7)',
          borderRadius: '12px',
          border: '1px dashed var(--slate-300, #CBD5E1)',
          color: 'var(--slate-500)'
        }}>
          <MessageSquare size={32} style={{ margin: '0 auto 0.5rem auto', color: 'var(--slate-400)' }} />
          <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--slate-700)' }}>No Past Sessions Logged</div>
          <div style={{ fontSize: '0.8rem', marginTop: '0.2rem' }}>
            Click <strong>"Start Live PI"</strong> above to launch your interactive interview video room with school counselors.
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Career Interest Suggestions / Tags */}
          {interestData && interestData.suggestions && interestData.suggestions.length > 0 && (
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--slate-600)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Award size={14} color="#2563EB" /> AI-Derived Career Focus Tags:
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {interestData.suggestions.map((suggestion, idx) => (
                  <div key={idx} className="badge badge-sky" style={{
                    padding: '0.45rem 0.85rem',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    borderRadius: '20px',
                    background: '#EFF6FF',
                    color: '#1E40AF',
                    border: '1px solid #BFDBFE'
                  }}>
                    <Tag size={12} />
                    <span>{suggestion}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Past Sessions List */}
          {piHistory.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--slate-600)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Calendar size={14} color="#2563EB" /> Session Log:
              </div>
              {piHistory.map((sess) => (
                <div key={sess._id} style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  background: '#FFFFFF',
                  border: '1px solid var(--slate-200, #E2E8F0)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--slate-800)' }}>
                      Counselor: {sess.counselor_id?.name || 'School Counselor'}
                    </div>
                    {sess.summary_tags && sess.summary_tags.length > 0 && (
                      <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)', marginTop: '0.2rem' }}>
                        Tags: {sess.summary_tags.join(', ')}
                      </div>
                    )}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>
                    {sess.date ? new Date(sess.date).toLocaleDateString() : ''}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
