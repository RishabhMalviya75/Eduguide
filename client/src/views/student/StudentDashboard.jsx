import { useAuth } from '../../context/AuthContext';
import { GraduationCap, BrainCircuit, Target, ArrowRight, Zap, TrendingUp, Award, Calendar, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import { api } from '../../api/client';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import ConsentModal from '../../components/ConsentModal';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [insights, setInsights] = useState(null);
  const [careerInterest, setCareerInterest] = useState(null);
  const [needsConsent, setNeedsConsent] = useState(false);

  useEffect(() => {
    if (user) {
      if (!user.consent_flag) {
        setNeedsConsent(true);
      }
      fetchHistory();
      fetchInsights();
      fetchCareerInterest(user.id);
    }
  }, [user]);

  const fetchHistory = async () => {
    try {
      const res = await api.get('/tests/history');
      if (res.success) {
        setHistory(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch test history', err);
    }
  };

  const fetchInsights = async () => {
    try {
      const res = await api.get('/analytics/student/insights');
      if (res.success) {
        setInsights(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch insights', err);
    }
  };

  const fetchCareerInterest = async (studentId) => {
    try {
      const res = await api.get(`/pi/student/${studentId}/interest`);
      if (res.success && res.data) {
        setCareerInterest(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch career interest', err);
    }
  };

  // Prepare data for the radar chart
  const radarData = useMemo(() => {
    if (!insights) return [];
    
    const dataPoints = [];
    const { academicStats = {}, aptitudeStats = {} } = insights;
    
    Object.entries(academicStats).forEach(([subject, score]) => {
      dataPoints.push({ subject, score: Math.round(score * 100) });
    });
    
    if (aptitudeStats) {
      Object.entries(aptitudeStats).forEach(([skill, score]) => {
        dataPoints.push({ subject: skill, score: Math.round(score * 100) });
      });
    }
    
    return dataPoints;
  }, [insights]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {needsConsent && (
        <ConsentModal 
          studentId={user.id} 
          onConsentGranted={() => setNeedsConsent(false)} 
        />
      )}

      {/* Hero Welcome Banner */}
      <div className="dash-card span-12" style={{ 
        background: 'linear-gradient(135deg, #FFFFFF 0%, #ECFDF5 60%, #FAF5FF 100%)',
        border: '1px solid rgba(16, 185, 129, 0.2)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 2, flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <span className="badge badge-emerald">Grade {user?.grade}-{user?.section}</span>
              <span className="badge badge-slate">Roll No: {user?.roll_no}</span>
            </div>
            <h1 style={{ fontSize: '1.85rem', color: 'var(--slate-900)', marginBottom: '0.25rem' }}>
              Welcome back, {user?.name.split(' ')[0]} 👋
            </h1>
            <p style={{ color: 'var(--slate-600)', fontSize: '0.95rem' }}>
              Your holistic career matches are calculated in real-time from academic & cognitive performance.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link to={`/student/report/${user.id}`} className="btn-secondary">
              <FileText size={16} /> Full Analytical Report
            </Link>
            <Link to="/student/test" className="btn-primary">
              <BrainCircuit size={16} /> Take Aptitude Test
            </Link>
          </div>
        </div>
      </div>

      {/* Bento Grid layout */}
      <div className="bento-grid">
        {/* Career AI Matches */}
        <div className="dash-card span-8">
          <div className="card-header-row">
            <div className="card-title-group">
              <div className="card-icon-badge" style={{ background: 'var(--brand-emerald-light)', color: 'var(--brand-emerald)' }}>
                <Zap size={22} />
              </div>
              <div>
                <div className="card-title-text">AI Recommended Career Fits</div>
                <div className="card-subtitle-text">Weighted synthesis of Academic Marks + Cognitive Aptitude</div>
              </div>
            </div>
            <span className="badge badge-emerald">Real-time Analysis</span>
          </div>

          {insights && insights.matches && insights.matches.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              {insights.matches.map((match, idx) => (
                <div key={match.careerId} className="glass-card" style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.05rem', color: 'var(--slate-900)', margin: 0 }}>{match.title}</h3>
                    <span className={idx === 0 ? 'badge badge-emerald' : 'badge badge-slate'} style={{ fontWeight: 700 }}>
                      {match.matchPercentage}% Match
                    </span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--slate-500)', lineHeight: 1.4 }}>
                    {match.description}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--slate-500)' }}>
              Complete an aptitude test and ensure teacher marks are uploaded to generate your top matches!
            </div>
          )}
        </div>

        {/* Skill Radar Chart */}
        <div className="dash-card span-4">
          <div className="card-header-row">
            <div className="card-title-group">
              <div className="card-icon-badge" style={{ background: 'var(--accent-sky-light)', color: 'var(--accent-sky)' }}>
                <TrendingUp size={22} />
              </div>
              <div>
                <div className="card-title-text">Skill Radar</div>
                <div className="card-subtitle-text">Academic & Aptitude Stats</div>
              </div>
            </div>
          </div>

          <div style={{ height: '240px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {radarData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                  <PolarGrid stroke="#E2E8F0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 11, fontWeight: 600 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar name="Score" dataKey="score" stroke="#10B981" fill="#10B981" fillOpacity={0.35} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <p style={{ color: 'var(--slate-400)', fontSize: '0.88rem' }}>Waiting for test data...</p>
            )}
          </div>
        </div>

        {/* Counselor PI Suggestions */}
        {careerInterest && careerInterest.suggestions.length > 0 && (
          <div className="dash-card span-6" style={{ background: 'linear-gradient(135deg, #FFFFFF 0%, #FAF5FF 100%)', border: '1px solid var(--accent-violet-border)' }}>
            <div className="card-header-row">
              <div className="card-title-group">
                <div className="card-icon-badge" style={{ background: 'var(--accent-violet-light)', color: 'var(--accent-violet)' }}>
                  <Target size={22} />
                </div>
                <div>
                  <div className="card-title-text">Counselor Verified Focus Areas</div>
                  <div className="card-subtitle-text">Derived from latest Personal Interview (PI) Session</div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {careerInterest.suggestions.map((suggestion, idx) => (
                <div key={idx} className="badge badge-violet" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', fontWeight: 600 }}>
                  <Award size={14} />
                  <span>{suggestion}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Test History List */}
        <div className={careerInterest ? "dash-card span-6" : "dash-card span-12"}>
          <div className="card-header-row">
            <div className="card-title-group">
              <div className="card-icon-badge" style={{ background: 'var(--accent-sky-light)', color: 'var(--accent-sky)' }}>
                <BrainCircuit size={22} />
              </div>
              <div>
                <div className="card-title-text">Test Session Log</div>
                <div className="card-subtitle-text">History of completed diagnostic evaluations</div>
              </div>
            </div>
            <Link to="/student/test" className="badge badge-emerald">
              <span>New Session</span>
              <ArrowRight size={12} />
            </Link>
          </div>

          {history.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {history.map(test => (
                <div key={test._id} className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 1.1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ padding: '0.5rem', background: 'var(--brand-emerald-light)', color: 'var(--brand-emerald)', borderRadius: 'var(--radius-sm)' }}>
                      <Award size={18} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--slate-900)' }}>
                        Score: {test.score} / {test.max_score}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Calendar size={12} />
                        {new Date(test.completed_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <span className="badge badge-emerald">Completed</span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--slate-500)', fontSize: '0.88rem' }}>No test sessions completed yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
