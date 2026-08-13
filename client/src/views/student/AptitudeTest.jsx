import { useState, useEffect, useRef } from 'react';
import { api } from '../../api/client';
import { useNavigate } from 'react-router-dom';
import { Clock, ChevronLeft, ChevronRight, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import '../../App.css';

export default function AptitudeTest() {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState({}); // { question_id: option_index }
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes in seconds

  const timerRef = useRef(null);

  useEffect(() => {
    startTest();
    return () => clearInterval(timerRef.current);
  }, []);

  const startTest = async () => {
    try {
      const res = await api.post('/tests/start');
      if (res.success) {
        setSession(res.data);
        
        // If resuming, calculate remaining time based on started_at
        const startedAt = new Date(res.data.started_at).getTime();
        const now = Date.now();
        const elapsedSeconds = Math.floor((now - startedAt) / 1000);
        const remaining = Math.max(0, (15 * 60) - elapsedSeconds);
        setTimeLeft(remaining);
        
        // Load existing responses if any
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
    // We use a ref or pass the current state to ensure latest responses are sent
    submitTest(responses);
  };

  const submitTest = async (currentResponses) => {
    if (!session || submitting) return;
    setSubmitting(true);
    clearInterval(timerRef.current);

    try {
      const res = await api.post('/tests/submit', {
        sessionId: session._id,
        responses: currentResponses
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
    if (window.confirm("Are you sure you want to submit your test? You cannot change your answers after submitting.")) {
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
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', color: 'var(--sky-500)' }}>
        <Loader2 size={40} className="animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="bento-card" style={{ textAlign: 'center', maxWidth: '500px' }}>
          <AlertCircle size={48} color="var(--error-text)" style={{ margin: '0 auto 1rem auto' }} />
          <h2>Error</h2>
          <p style={{ color: 'var(--slate-600)', marginBottom: '1.5rem' }}>{error}</p>
          <button className="btn-primary" onClick={() => navigate('/student')}>Go Back</button>
        </div>
      </div>
    );
  }

  if (!session || !session.questions || session.questions.length === 0) {
    return null;
  }

  const currentQuestion = session.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === session.questions.length - 1;
  const isFirstQuestion = currentQuestionIndex === 0;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--slate-50)', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        {/* Test Header */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', padding: '1rem 1.5rem', background: 'white', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-sm)' }}>
          <div>
            <h1 style={{ fontSize: '1.25rem', color: 'var(--slate-800)', margin: 0 }}>Aptitude Assessment</h1>
            <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem', margin: 0 }}>Question {currentQuestionIndex + 1} of {session.questions.length}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: timeLeft < 60 ? 'var(--error-text)' : 'var(--sky-600)', fontWeight: 'bold', fontSize: '1.25rem' }}>
            <Clock size={24} />
            {formatTime(timeLeft)}
          </div>
        </header>

        {/* Question Card */}
        <main className="bento-card" style={{ padding: '3rem 2rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span style={{ background: 'var(--sky-100)', color: 'var(--sky-700)', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600 }}>
              {currentQuestion.category}
            </span>
          </div>
          
          <h2 style={{ fontSize: '1.5rem', color: 'var(--slate-800)', marginBottom: '2rem', lineHeight: 1.4 }}>
            {currentQuestion.text}
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {currentQuestion.options.map((opt, idx) => {
              const isSelected = responses[currentQuestion._id] === idx;
              return (
                <button
                  key={idx}
                  onClick={() => handleOptionSelect(currentQuestion._id, idx)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1.25rem 1.5rem',
                    border: `2px solid ${isSelected ? 'var(--sky-400)' : 'var(--slate-200)'}`,
                    borderRadius: 'var(--radius-lg)',
                    background: isSelected ? 'var(--sky-50)' : 'white',
                    color: isSelected ? 'var(--sky-900)' : 'var(--slate-700)',
                    fontSize: '1.1rem',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <span>{opt}</span>
                  {isSelected && <CheckCircle size={20} color="var(--sky-500)" />}
                </button>
              );
            })}
          </div>
        </main>

        {/* Navigation Footer */}
        <footer style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button 
            className="btn-primary" 
            style={{ background: 'white', color: 'var(--slate-700)', border: '1px solid var(--slate-300)', visibility: isFirstQuestion ? 'hidden' : 'visible' }}
            onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
          >
            <ChevronLeft size={20} /> Previous
          </button>
          
          {!isLastQuestion ? (
            <button 
              className="btn-primary" 
              onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
            >
              Next <ChevronRight size={20} />
            </button>
          ) : (
            <button 
              className="btn-primary" 
              style={{ background: 'var(--success-text)' }}
              onClick={handleManualSubmit}
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Finish & Submit Test'} <CheckCircle size={20} />
            </button>
          )}
        </footer>

      </div>
    </div>
  );
}
