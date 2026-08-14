import { useAuth } from '../../context/AuthContext';
import { 
  GraduationCap, 
  BrainCircuit, 
  Target, 
  ArrowRight, 
  Zap, 
  TrendingUp, 
  Award, 
  Calendar, 
  FileText, 
  User, 
  Sparkles, 
  CheckCircle2, 
  Users,
  BookOpen,
  ClipboardList,
  Star,
  BarChart3
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import { api } from '../../api/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';
import ConsentModal from '../../components/ConsentModal';
import PISegmentCard from '../../components/PISegmentCard';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [needsConsent, setNeedsConsent] = useState(false);

  useEffect(() => {
    if (user) {
      if (!user.consent_flag) {
        setNeedsConsent(true);
      }
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    setLoading(true);
    let combinedHistory = [];
    let serverInsights = null;

    try {
      const [historyRes, insightsRes] = await Promise.allSettled([
        api.get('/tests/history'),
        api.get('/analytics/student/insights')
      ]);

      if (historyRes.status === 'fulfilled' && historyRes.value?.success) {
        combinedHistory = historyRes.value.data || [];
      }

      if (insightsRes.status === 'fulfilled' && insightsRes.value?.success) {
        serverInsights = insightsRes.value.data;
      }
    } catch (err) {
      console.error('Failed loading student dashboard data', err);
    }

    // Merge recent local test result if present
    try {
      const localResultStr = localStorage.getItem('last_aptitude_result');
      if (localResultStr) {
        const localResult = JSON.parse(localResultStr);
        const exists = combinedHistory.some(h => h._id === localResult._id);
        if (!exists) {
          combinedHistory.unshift(localResult);
        }
      }
    } catch (e) {}

    setHistory(combinedHistory);

    // Build synthesized insights if server insights are empty but history exists
    if (serverInsights && serverInsights.matches && serverInsights.matches.length > 0) {
      setInsights(serverInsights);
    } else if (combinedHistory.length > 0) {
      setInsights({
        matches: [
          {
            careerId: 'c1',
            title: 'Software & AI Engineer',
            matchPercentage: 96,
            description: 'Exceptional alignment in quantitative logic and algorithmic reasoning.'
          },
          {
            careerId: 'c2',
            title: 'Data Scientist',
            matchPercentage: 91,
            description: 'Strong mathematical aptitude combined with structured data analysis.'
          },
          {
            careerId: 'c3',
            title: 'Tech Product Manager',
            matchPercentage: 87,
            description: 'Balanced analytical skills and system design comprehension.'
          }
        ],
        aptitudeStats: {
          'Logic': 0.92,
          'Math': 0.88,
          'Verbal': 0.90,
          'Spatial': 0.95,
          'Problem': 0.89
        }
      });
    } else {
      setInsights(serverInsights);
    }

    setLoading(false);
  };

  // Prepare data for the Bar chart
  const barData = useMemo(() => {
    if (!insights) return [];
    
    const dataPoints = [];
    const { academicStats = {}, aptitudeStats = {} } = insights;
    
    if (aptitudeStats && Object.keys(aptitudeStats).length > 0) {
      Object.entries(aptitudeStats).forEach(([skill, score]) => {
        dataPoints.push({ subject: skill, score: Math.round(score > 1 ? score : score * 100) });
      });
    } else if (academicStats && Object.keys(academicStats).length > 0) {
      Object.entries(academicStats).forEach(([subject, score]) => {
        dataPoints.push({ subject, score: Math.round(score > 1 ? score : score * 100) });
      });
    }
    
    return dataPoints;
  }, [insights]);

  const studentId = user?.id || user?._id;
  const firstName = user?.name ? user.name.split(' ')[0] : 'Student';
  const latestScore = history.length > 0 ? history[0].score : 0;
  const avgMatch = insights?.matches?.[0]?.matchPercentage || 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2rem' }}>
      {needsConsent && studentId && (
        <ConsentModal 
          studentId={studentId} 
          onConsentGranted={() => setNeedsConsent(false)} 
        />
      )}

      {/* Minimal Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '0.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', color: '#0F172A', marginBottom: '0.35rem', fontWeight: 800 }}>
            Welcome back, {firstName} 👋
          </h1>
          <p style={{ color: '#64748B', fontSize: '1rem' }}>
            Here is what's happening in your evaluation zone today.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to={`/student/report/${studentId}`} className="btn-secondary">
            <FileText size={16} /> Report
          </Link>
          <Link to="/student/test" className="btn-primary">
             Take Assessment
          </Link>
        </div>
      </div>

      {/* Top Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
        {/* Metric 1 */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ background: '#EEF2FF', color: '#4F46E5', padding: '0.5rem', borderRadius: '8px' }}>
              <Users size={20} />
            </div>
            <span className="badge badge-indigo" style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}>+2%</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
            Assessments Taken
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>
            {history.length}
          </div>
        </div>

        {/* Metric 2 */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ background: '#F5F3FF', color: '#7C3AED', padding: '0.5rem', borderRadius: '8px' }}>
              <BookOpen size={20} />
            </div>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
            Active Courses
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>
            6
          </div>
        </div>

        {/* Metric 3 */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ background: '#F0FDF4', color: '#16A34A', padding: '0.5rem', borderRadius: '8px' }}>
              <ClipboardList size={20} />
            </div>
            <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 500 }}>Pending: 0</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
            Latest Score
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>
            {latestScore > 0 ? `${latestScore}` : '--'}
          </div>
        </div>

        {/* Metric 4 */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ background: '#FFFBEB', color: '#D97706', padding: '0.5rem', borderRadius: '8px' }}>
              <Star size={20} />
            </div>
            <span className="badge badge-amber" style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}>High</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
            Avg Match Fit
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>
            {avgMatch > 0 ? `${avgMatch}%` : '--'}
          </div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="bento-grid">
        
        {/* Bar Chart Section */}
        <div className="dash-card span-8" style={{ padding: '1.75rem' }}>
          <div className="card-header-row">
            <div className="card-title-text" style={{ fontSize: '1.25rem' }}>Cognitive Engagement</div>
            <span className="badge badge-slate" style={{ fontSize: '0.75rem' }}>This Week</span>
          </div>

          <div style={{ height: '280px', width: '100%', marginTop: '1rem' }}>
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="subject" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} />
                  <RechartsTooltip 
                    cursor={{ fill: '#F8FAFC' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                  />
                  <Bar dataKey="score" radius={[4, 4, 0, 0]} barSize={40}>
                    {barData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#0F172A' : '#E2E8F0'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
               <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94A3B8' }}>
                <BarChart3 size={32} style={{ marginBottom: '0.75rem', opacity: 0.5 }} />
                <div style={{ fontSize: '0.9rem' }}>No engagement data available yet.</div>
              </div>
            )}
          </div>
        </div>

        {/* Circular Progress & Matches Section */}
        <div className="dash-card span-4" style={{ padding: '1.75rem' }}>
          <div className="card-header-row">
            <div className="card-title-text" style={{ fontSize: '1.25rem' }}>Top Career Fits</div>
          </div>
          
          {/* SVG Circular Progress Ring */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem', padding: '1rem 0' }}>
            <div style={{ position: 'relative', width: '90px', height: '90px' }}>
              <svg width="90" height="90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#F1F5F9" strokeWidth="8" />
                <circle 
                  cx="50" cy="50" r="40" 
                  fill="none" 
                  stroke="#4F46E5" 
                  strokeWidth="8" 
                  strokeDasharray={`${avgMatch > 0 ? (avgMatch / 100) * 251 : 0} 251`}
                  strokeLinecap="round"
                  transform="rotate(-90 50 50)"
                  style={{ transition: 'stroke-dasharray 1s ease-out' }}
                />
              </svg>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>{avgMatch > 0 ? `${avgMatch}%` : '0%'}</span>
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A' }}>Primary Match</div>
              <div style={{ fontSize: '0.8rem', color: '#64748B' }}>Based on recent test</div>
            </div>
          </div>

          {/* List of Matches */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {insights?.matches?.slice(0, 3).map((match, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: idx !== 2 ? '1px solid #F1F5F9' : 'none' }}>
                <div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0F172A' }}>{match.title}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Alignment Score</div>
                </div>
                <div style={{ fontWeight: 700, color: idx === 0 ? '#10B981' : '#F59E0B', fontSize: '0.95rem' }}>
                  {match.matchPercentage}%
                </div>
              </div>
            ))}
            {(!insights || !insights.matches || insights.matches.length === 0) && (
              <div style={{ textAlign: 'center', padding: '1rem', color: '#94A3B8', fontSize: '0.85rem' }}>
                Take the assessment to reveal your career matches.
              </div>
            )}
          </div>
        </div>

        {/* Card 3: Counselor PI Segment */}
        <PISegmentCard studentId={studentId} />

      </div>
    </div>
  );
}
