import { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { ShieldAlert, CheckCircle2, AlertTriangle, User, Calendar, Award, X } from 'lucide-react';

export default function ReviewQueue() {
  const [flaggedScores, setFlaggedScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [resolving, setResolving] = useState(null);

  // Review modal state
  const [selectedScore, setSelectedScore] = useState(null);
  const [overrideScore, setOverrideScore] = useState(0);
  const [reviewNotes, setReviewNotes] = useState('');

  useEffect(() => {
    fetchFlaggedScores();
  }, []);

  const fetchFlaggedScores = async () => {
    try {
      setLoading(true);
      const res = await api.get('/scores/flagged');
      setFlaggedScores(res.data.data);
    } catch (err) {
      setError('Failed to load review queue.');
    } finally {
      setLoading(false);
    }
  };

  const openReviewModal = (score) => {
    setSelectedScore(score);
    setOverrideScore(score.total_score);
    setReviewNotes('');
  };

  const submitReview = async () => {
    try {
      setResolving(selectedScore._id);
      await api.put(`/scores/${selectedScore._id}/review`, {
        total_score: overrideScore,
        review_notes: reviewNotes,
      });
      setFlaggedScores(prev => prev.filter(s => s._id !== selectedScore._id));
      setSelectedScore(null);
    } catch (err) {
      alert('Failed to submit review.');
    } finally {
      setResolving(null);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '60vh', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-orange)' }}>
        Loading AI Review Queue...
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Banner */}
      <div className="dash-card span-12" style={{ background: 'linear-gradient(135deg, #FFFFFF 0%, #FFF7ED 60%, #FEF2F2 100%)', border: '1px solid var(--accent-orange-border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <span className="badge badge-orange">Human-in-the-Loop</span>
              <span className="badge badge-slate">AI Shadow Mode</span>
            </div>
            <h1 style={{ fontSize: '1.85rem', color: 'var(--slate-900)', marginBottom: '0.25rem' }}>
              AI Scoring Review Queue
            </h1>
            <p style={{ color: 'var(--slate-600)', fontSize: '0.95rem' }}>
              Test sessions flagged due to low confidence scores (&lt; 70%). Inspect student answers and submit verified overrides.
            </p>
          </div>
        </div>
      </div>

      {/* Queue List */}
      {flaggedScores.length === 0 ? (
        <div className="dash-card span-12" style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--slate-500)' }}>
          <CheckCircle2 size={48} color="var(--brand-emerald)" style={{ margin: '0 auto 1rem auto' }} />
          <h2 style={{ fontSize: '1.25rem', color: 'var(--slate-900)' }}>Review Queue Cleared 🎉</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--slate-500)', marginTop: '0.25rem' }}>All AI-scored evaluations meet confidence thresholds.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {flaggedScores.map(score => (
            <div key={score._id} className="dash-card" style={{ borderLeft: '4px solid var(--accent-orange)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', color: 'var(--slate-900)', margin: 0 }}>
                    {score.student_id?.name || 'Student'}
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', marginTop: '0.2rem' }}>
                    Roll: {score.student_id?.roll_no} | Grade {score.student_id?.grade}-{score.student_id?.section}
                  </div>
                </div>
                <span className="badge badge-orange" style={{ fontWeight: 700 }}>
                  <AlertTriangle size={12} />
                  {(score.overall_confidence ? (score.overall_confidence * 100).toFixed(0) : 0)}% Conf
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--slate-50)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-200)', marginBottom: '1.25rem' }}>
                <div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)' }}>Initial AI Score</div>
                  <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--slate-900)' }}>
                    {score.total_score} / {score.max_score}
                  </div>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)' }}>
                  {new Date(score.created_at).toLocaleDateString()}
                </div>
              </div>

              <button className="btn-primary" onClick={() => openReviewModal(score)} style={{ background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)', width: '100%' }}>
                Inspect Answers & Override
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {selectedScore && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.5)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '1.5rem'
        }}>
          <div className="glass-panel" style={{ background: '#FFFFFF', width: '100%', maxWidth: '720px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--slate-200)', paddingBottom: '1rem' }}>
              <div>
                <span className="badge badge-orange" style={{ marginBottom: '0.35rem' }}>Human Override Protocol</span>
                <h2 style={{ fontSize: '1.3rem', color: 'var(--slate-900)', margin: 0 }}>
                  Reviewing Attempt: {selectedScore.student_id?.name}
                </h2>
              </div>
              <button 
                onClick={() => setSelectedScore(null)}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--slate-400)' }}
              >
                <X size={24} />
              </button>
            </div>

            {/* Questions List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {selectedScore.session_id?.questions?.map((q, idx) => {
                const qScore = selectedScore.question_scores?.find(qs => qs.question_id === q._id);
                return (
                  <div key={q._id} style={{ background: 'var(--slate-50)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-200)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                      <strong style={{ color: 'var(--slate-900)', fontSize: '0.92rem' }}>Q{idx + 1}: {q.text}</strong>
                      <span className="badge badge-sky" style={{ fontSize: '0.78rem' }}>
                        Awarded: {qScore?.awarded ?? 0}/{qScore?.max ?? 1}
                      </span>
                    </div>

                    {q.format === 'MCQ' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', marginTop: '0.5rem' }}>
                        {q.options.map((opt, i) => (
                          <div key={i} style={{ 
                            padding: '0.4rem 0.75rem', 
                            borderRadius: 'var(--radius-sm)', 
                            fontSize: '0.85rem',
                            background: i === q.correct_option_index ? 'var(--brand-emerald-light)' : '#FFFFFF',
                            color: i === q.correct_option_index ? 'var(--brand-emerald-dark)' : 'var(--slate-700)',
                            fontWeight: i === q.correct_option_index ? 600 : 400
                          }}>
                            {opt} {i === q.correct_option_index && '✓ (Correct)'}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Override Controls */}
            <div style={{ background: 'var(--slate-50)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-200)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label>Verified Total Score (out of {selectedScore.max_score})</label>
                <input 
                  type="number" 
                  min="0" 
                  max={selectedScore.max_score}
                  className="form-input"
                  value={overrideScore}
                  onChange={e => setOverrideScore(parseInt(e.target.value) || 0)}
                  style={{ width: '120px' }}
                />
              </div>

              <div className="form-group">
                <label>Reviewer Notes / Override Rationale</label>
                <textarea 
                  className="form-input"
                  rows={3}
                  value={reviewNotes}
                  onChange={e => setReviewNotes(e.target.value)}
                  placeholder="Explain why the score was adjusted..."
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button className="btn-secondary" onClick={() => setSelectedScore(null)}>Cancel</button>
              <button 
                className="btn-primary" 
                onClick={submitReview}
                disabled={resolving === selectedScore._id}
                style={{ background: 'linear-gradient(135deg, #10B981 0%, #047857 100%)' }}
              >
                {resolving === selectedScore._id ? 'Saving Override...' : 'Confirm Verified Score'}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
