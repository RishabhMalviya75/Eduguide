import { useAuth } from '../../context/AuthContext';
import { LogOut, GraduationCap, BrainCircuit, Target, ArrowRight, Zap, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import { api } from '../../api/client';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import ConsentModal from '../../components/ConsentModal';
import '../../App.css'; 

export default function StudentDashboard() {
  const { user, logout } = useAuth();
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
      fetchCareerInterest(user.student_id);
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
      // Fetch latest PI history to get career interest mapped results
      const res = await api.get(`/pi/student/${studentId}`);
      if (res.success && res.data.length > 0) {
        // Since CareerInterestResult is generated on PI submit, we can just fetch the PI session 
        // Wait, the API returns PISession history. I should fetch the CareerInterestResult directly.
        const intRes = await api.get(`/pi/student/${studentId}/interest`); // I need to create this route!
        if (intRes.success && intRes.data) {
          setCareerInterest(intRes.data);
        }
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
    
    // Convert 0-1 scale to 0-100
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
    <div className="app-container">
      {needsConsent && (
        <ConsentModal 
          studentId={user.student_id} 
          onConsentGranted={() => {
            setNeedsConsent(false);
            // Optional: You could update local storage context here to reflect the change
          }} 
        />
      )}
      <header className="header" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <GraduationCap size={40} className="icon-logo" />
          <div>
            <h1>Student Portal</h1>
            <p style={{ color: 'var(--slate-500)' }}>
              Hi {user?.name.split(' ')[0]}! (Grade {user?.grade}-{user?.section})
            </p>
          </div>
        </div>
        
        <button onClick={logout} className="btn-primary" style={{ background: 'var(--slate-800)' }}>
          <LogOut size={18} /> Logout
        </button>
      </header>

      <main className="bento-grid">
        {/* Analytics & Recommendations Card */}
        <div className="bento-card span-4-col" style={{ background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)' }}>
          <div className="card-header">
            <div className="card-icon" style={{ background: 'var(--sky-500)', color: 'white' }}><Zap size={24} /></div>
            <h2 className="card-title">Career AI Matches (Test Based)</h2>
          </div>
          <div className="card-content">
            {insights && insights.matches && insights.matches.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                {insights.matches.map((match, idx) => (
                  <div key={match.careerId} style={{ background: 'white', padding: '1.5rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', transition: 'transform 0.2s', cursor: 'default' }} className="hover-lift">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <h3 style={{ fontSize: '1.1rem', color: 'var(--slate-800)', margin: 0 }}>{match.title}</h3>
                      <span style={{ 
                        background: idx === 0 ? 'var(--sky-100)' : 'var(--slate-100)', 
                        color: idx === 0 ? 'var(--sky-700)' : 'var(--slate-600)', 
                        padding: '0.25rem 0.5rem', 
                        borderRadius: '20px', 
                        fontSize: '0.85rem', 
                        fontWeight: 'bold' 
                      }}>
                        {match.matchPercentage}% Match
                      </span>
                    </div>
                    <p style={{ fontSize: '0.9rem', color: 'var(--slate-500)', lineHeight: 1.4 }}>{match.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--slate-600)' }}>Take the aptitude test and ensure your marks are uploaded to see your test-based matches!</p>
            )}
          </div>
        </div>

        {/* Career Interest Zone (PI Based) */}
        {careerInterest && careerInterest.suggestions.length > 0 && (
          <div className="bento-card span-4-col" style={{ background: 'linear-gradient(135deg, #fdf4ff 0%, #fae8ff 100%)' }}>
            <div className="card-header">
              <div className="card-icon" style={{ background: '#d946ef', color: 'white' }}><Target size={24} /></div>
              <h2 className="card-title">Career Interest Zone (Counselor Verified)</h2>
            </div>
            <div className="card-content">
              <p style={{ color: 'var(--slate-600)', marginBottom: '1rem' }}>Based on your latest Personal Interview (PI) session.</p>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                {careerInterest.suggestions.map((suggestion, idx) => (
                  <div key={idx} style={{ background: 'white', padding: '1rem 1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid #f0abfc', fontWeight: 'bold', color: '#86198f' }}>
                    {suggestion}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Skill Radar Chart */}
        <div className="bento-card span-2-col">
          <div className="card-header">
            <div className="card-icon"><TrendingUp size={24} /></div>
            <h2 className="card-title">My Skill Radar</h2>
          </div>
          <div className="card-content" style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {radarData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar name="Score" dataKey="score" stroke="#0ea5e9" fill="#38bdf8" fillOpacity={0.5} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <p style={{ color: 'var(--slate-400)', textAlign: 'center' }}>Waiting for test data...</p>
            )}
          </div>
        </div>

        <div className="bento-card span-2-col">
          <div className="card-header">
            <div className="card-icon"><BrainCircuit size={24} /></div>
            <h2 className="card-title">Aptitude Tests</h2>
          </div>
          <div className="card-content">
            <p style={{ marginBottom: '1.5rem', color: 'var(--slate-600)' }}>Take the diagnostic test to uncover your career matches.</p>
            
            <Link to="/student/test" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-flex', width: 'fit-content', marginBottom: '2rem' }}>
              Start New Test <ArrowRight size={18} />
            </Link>

            {history.length > 0 && (
              <div>
                <h3 style={{ fontSize: '1.1rem', color: 'var(--slate-700)', marginBottom: '1rem' }}>Past Tests</h3>
                {history.map(test => (
                  <div key={test._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'var(--slate-50)', borderRadius: 'var(--radius-md)', marginBottom: '0.5rem', border: '1px solid var(--slate-200)' }}>
                    <div>
                      <strong>Score: {test.score}/{test.max_score}</strong>
                    </div>
                    <div style={{ color: 'var(--slate-500)' }}>
                      {new Date(test.completed_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
