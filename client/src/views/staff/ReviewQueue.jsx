import { useState, useEffect } from 'react';
import { api } from '../../api/client';
import './ReviewQueue.css'; // We'll add some basic styling

function ReviewQueue() {
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
      // Remove from queue
      setFlaggedScores(prev => prev.filter(s => s._id !== selectedScore._id));
      setSelectedScore(null);
    } catch (err) {
      alert('Failed to submit review.');
    } finally {
      setResolving(null);
    }
  };

  if (loading) return <div className="p-2">Loading Review Queue...</div>;
  if (error) return <div className="p-2 error-text">{error}</div>;

  return (
    <div className="review-queue-container">
      <h2>AI Scoring Review Queue</h2>
      <p className="subtitle">
        These test sessions received a low confidence score from the AI evaluator and require human review.
      </p>

      {flaggedScores.length === 0 ? (
        <div className="empty-state">
          No flagged tests currently require review. 🎉
        </div>
      ) : (
        <div className="queue-list">
          {flaggedScores.map(score => (
            <div key={score._id} className="queue-item">
              <div className="item-header">
                <div>
                  <strong>{score.student_id?.name}</strong> (Roll: {score.student_id?.roll_no})
                  <div className="meta">
                    Test Date: {new Date(score.created_at).toLocaleString()}
                  </div>
                </div>
                <div className="score-badge">
                  AI Score: {score.total_score} / {score.max_score}
                  <span className="confidence-warning">
                    (Conf: {score.overall_confidence ? (score.overall_confidence * 100).toFixed(0) : 0}%)
                  </span>
                </div>
              </div>
              <button 
                className="btn-primary mt-1" 
                onClick={() => openReviewModal(score)}
              >
                Review Attempt
              </button>
            </div>
          ))}
        </div>
      )}

      {selectedScore && (
        <div className="modal-overlay">
          <div className="review-modal">
            <h3>Review Test Attempt</h3>
            <p><strong>Student:</strong> {selectedScore.student_id?.name}</p>
            
            <div className="questions-review">
              {selectedScore.session_id?.questions?.map((q, idx) => {
                const qScore = selectedScore.question_scores?.find(qs => qs.question_id === q._id);
                return (
                  <div key={q._id} className="question-review-item">
                    <p><strong>Q{idx + 1}:</strong> {q.text}</p>
                    {q.format === 'MCQ' && (
                      <ul className="options-list">
                        {q.options.map((opt, i) => (
                          <li key={i} className={i === q.correct_option_index ? 'correct-option' : ''}>
                            {opt} {i === q.correct_option_index && '✓'}
                          </li>
                        ))}
                      </ul>
                    )}
                    <div className="ai-eval">
                      Awarded: {qScore?.awarded ?? 0}/{qScore?.max ?? 1} 
                      <span className="conf-pill">Conf: {qScore?.confidence ? (qScore.confidence * 100).toFixed(0) : 0}%</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="review-controls">
              <div className="form-group">
                <label>Final Verified Score (out of {selectedScore.max_score})</label>
                <input 
                  type="number" 
                  min="0" 
                  max={selectedScore.max_score}
                  value={overrideScore}
                  onChange={e => setOverrideScore(parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="form-group">
                <label>Review Notes (Optional)</label>
                <textarea 
                  value={reviewNotes}
                  onChange={e => setReviewNotes(e.target.value)}
                  placeholder="Reason for override..."
                />
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setSelectedScore(null)}>Cancel</button>
              <button 
                className="btn-primary" 
                onClick={submitReview}
                disabled={resolving === selectedScore._id}
              >
                {resolving === selectedScore._id ? 'Saving...' : 'Submit Final Score'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReviewQueue;
