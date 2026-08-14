import { useState, useEffect, useRef } from 'react';
import { api } from '../../api/client';
import { useNavigate } from 'react-router-dom';
import { Clock, ChevronLeft, ChevronRight, CheckCircle, AlertCircle, Loader2, ShieldAlert } from 'lucide-react';

export default function AptitudeTest() {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [focusLossCount, setFocusLossCount] = useState(0);
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState({});
  const [timeLeft, setTimeLeft] = useState(15 * 60);

  const timerRef = useRef(null);

  useEffect(() => {
    const handleBlur = () => {
      if (session && !session.completed_at) {
        setFocusLossCount(prev => prev + 1);
      }
    };

    window.addEventListener('blur', handleBlur);
    return () => window.removeEventListener('blur', handleBlur);
  }, [session]);

  useEffect(() => {
    startTest();
    return () => clearInterval(timerRef.current);
  }, []);

  const startTest = async () => {
    try {
      const res = await api.post('/tests/start');
      if (res.success) {
        setSession(res.data);
        
        const startedAt = new Date(res.data.started_at).getTime();
        const now = Date.now();
        const elapsedSeconds = Math.floor((now - startedAt) / 1000);
        const remaining = Math.max(0, (15 * 60) - elapsedSeconds);
        setTimeLeft(remaining);
        
        if (res.data.responses) {
          setResponses(res.data.responses);
        }

        startTimer(remaining);
      }
    } catch (err) {
      setError(err.message || 'Failed to start test.');
    } finally {
      setLoading(false);
    }
  };

  const startTimer = (initialTime) => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    let time = initialTime;
    timerRef.current = setInterval(() => {
      time -= 1;
      setTimeLeft(time);
      if (time <= 0) {
        clearInterval(timerRef.current);
        handleAutoSubmit();
      }
    }, 1000);
  };

  const handleAutoSubmit = () => {
    submitTest(responses);
  };

  const submitTest = async (currentResponses) => {
    if (!session || submitting) return;
    setSubmitting(true);
    clearInterval(timerRef.current);

    try {
      const res = await api.post('/tests/submit', {
        session_id: session._id,
        responses: currentResponses,
        proctoring_signals: {
          focus_loss_count: focusLossCount
        }
      });
      if (res.success) {
        navigate('/student');
      }
    } catch (err) {
      setError(err.message || 'Failed to submit test.');
      setSubmitting(false);
    }
  };

  const handleManualSubmit = () => {
    if (window.confirm("Are you sure you want to submit your test? Answers cannot be changed after submission.")) {
      submitTest(responses);
    }
  };

  const handleOptionSelect = (qId, optionIndex) => {
    setResponses(prev => ({
      ...prev,
      [qId]: optionIndex
    }));
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '60vh', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-emerald)' }}>
        <Loader2 size={40} className="animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="dash-card span-12" style={{ textAlign: 'center', maxWidth: '540px', margin: '3rem auto' }}>
        <AlertCircle size={48} color="#DC2626" style={{ margin: '0 auto 1rem auto' }} />
        <h2>Evaluation Error</h2>
        <p style={{ color: 'var(--slate-600)', marginBottom: '1.5rem' }}>{error}</p>
        <button className="btn-primary" onClick={() => navigate('/student')}>Go Back to Portal</button>
      </div>
    );
  }

  if (!session || !session.questions || session.questions.length === 0) {
    return null;
  }

  const currentQuestion = session.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === session.questions.length - 1;
  const isFirstQuestion = currentQuestionIndex === 0;
  const progressPercent = Math.round(((currentQuestionIndex + 1) / session.questions.length) * 100);

  return (
    <div style={{ maxWidth: '840px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Test Progress & Timer Header */}
      <div className="glass-panel" style={{ padding: '1.25rem 1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span className="badge badge-emerald">Live Aptitude Evaluation</span>
            {focusLossCount > 0 && (
              <span className="badge badge-orange">
                <ShieldAlert size={12} /> Focus Lost: {focusLossCount}
              </span>
            )}
          </div>
          <h1 style={{ fontSize: '1.2rem', color: 'var(--slate-900)', marginTop: '0.25rem' }}>
            Question {currentQuestionIndex + 1} of {session.questions.length}
          </h1>
        </div>

        <div className={timeLeft < 120 ? 'badge badge-orange' : 'badge badge-emerald'} style={{ fontSize: '1.1rem', padding: '0.5rem 1rem' }}>
          <Clock size={18} />
          <span>{formatTime(timeLeft)}</span>
        </div>
      </div>

      {/* Visual Question Progress Bar */}
      <div style={{ width: '100%', height: '6px', background: 'var(--slate-200)', borderRadius: '999px', overflow: 'hidden' }}>
        <div style={{ width: `${progressPercent}%`, height: '100%', background: 'var(--brand-emerald)', transition: 'width 0.3s ease' }} />
      </div>

      {/* Main Question Card */}
      <div className="dash-card" style={{ padding: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <span className="badge badge-violet">
            Category: {currentQuestion.category || 'General Aptitude'}
          </span>
        </div>

        <h2 style={{ fontSize: '1.35rem', color: 'var(--slate-900)', marginBottom: '2rem', lineHeight: 1.4, fontWeight: 700 }}>
          {currentQuestion.text}
        </h2>

        {/* Options / Text Input */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {currentQuestion.format === 'MCQ' ? (
            currentQuestion.options.map((opt, idx) => {
              const isSelected = responses[currentQuestion._id] === idx;
              return (
                <button
                  key={idx}
                  onClick={() => handleOptionSelect(currentQuestion._id, idx)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1.1rem 1.4rem',
                    border: isSelected ? '2px solid var(--brand-emerald)' : '1px solid var(--slate-200)',
                    borderRadius: 'var(--radius-md)',
                    background: isSelected ? 'var(--brand-emerald-light)' : '#FFFFFF',
                    color: isSelected ? 'var(--brand-emerald-dark)' : 'var(--slate-800)',
                    fontSize: '1rem',
                    fontWeight: isSelected ? 600 : 400,
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <span>{opt}</span>
                  {isSelected && <CheckCircle size={20} color="var(--brand-emerald)" />}
                </button>
              );
            })
          ) : (
            <textarea
              value={responses[currentQuestion._id] || ''}
              onChange={(e) => handleOptionSelect(currentQuestion._id, e.target.value)}
              placeholder="Type your structured answer here..."
              rows={currentQuestion.format === 'essay' ? 8 : 4}
              className="form-input"
              style={{ fontSize: '1rem', resize: 'vertical' }}
            />
          )}
        </div>
      </div>

      {/* Navigation Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button 
          className="btn-secondary" 
          style={{ visibility: isFirstQuestion ? 'hidden' : 'visible' }}
          onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
        >
          <ChevronLeft size={18} /> Previous
        </button>

        {!isLastQuestion ? (
          <button 
            className="btn-primary" 
            onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
          >
            Next Question <ChevronRight size={18} />
          </button>
        ) : (
          <button 
            className="btn-primary" 
            style={{ background: 'linear-gradient(135deg, #10B981 0%, #047857 100%)' }}
            onClick={handleManualSubmit}
            disabled={submitting}
          >
            {submitting ? 'Submitting Evaluation...' : 'Submit Assessment'} <CheckCircle size={18} />
          </button>
        )}
      </div>

    </div>
  );
}
