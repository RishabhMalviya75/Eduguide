import { useState, useEffect } from 'react';
import { api } from '../api/client';
import { UserCheck, Award, Calendar, Tag, MessageSquare, Loader2 } from 'lucide-react';

export default function PISegmentCard({ studentId }) {
  const [piHistory, setPiHistory] = useState([]);
  const [interestData, setInterestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (studentId) {
      loadPIData();
    }
  }, [studentId]);

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

  const hasPI = piHistory.length > 0 || (interestData && interestData.suggestions?.length > 0);

  return (
    <div className="dash-card span-6" style={{
      background: 'linear-gradient(135deg, #FFFFFF 0%, #F0F9FF 100%)',
      border: '1px solid var(--accent-sky-border, #BAE6FD)',
      borderRadius: 'var(--radius-lg, 16px)',
      padding: '1.5rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem'
    }}>
      <div className="card-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
              Qualitative evaluations & Career Focus tags
            </div>
          </div>
        </div>
        <span className="badge badge-sky" style={{ fontSize: '0.75rem' }}>Personal Interview</span>
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', color: 'var(--sky-500)' }}>
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
          background: 'rgba(255, 255, 255, 0.6)',
          borderRadius: '12px',
          border: '1px dashed var(--slate-300, #CBD5E1)',
          color: 'var(--slate-500)'
        }}>
          <MessageSquare size={32} style={{ margin: '0 auto 0.5rem auto', color: 'var(--slate-400)' }} />
          <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--slate-700)' }}>No PI Sessions Logged Yet</div>
          <div style={{ fontSize: '0.8rem', marginTop: '0.2rem' }}>
            Schedule a Personal Interview with your school counselor to unlock qualitative career focus tags.
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Career Interest Suggestions / Tags */}
          {interestData && interestData.suggestions && interestData.suggestions.length > 0 && (
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--slate-600)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Award size={14} color="#0284C7" /> AI-Derived Career Focus Tags:
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {interestData.suggestions.map((suggestion, idx) => (
                  <div key={idx} className="badge badge-sky" style={{
                    padding: '0.45rem 0.85rem',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    borderRadius: '20px',
                    background: '#E0F2FE',
                    color: '#0369A1',
                    border: '1px solid #BAE6FD'
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
                <Calendar size={14} color="#0284C7" /> Session Log:
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
