import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { Printer, ArrowLeft, GraduationCap, Award, BookOpen, UserCheck, Sparkles } from 'lucide-react';
import './StudentReport.css';

export default function StudentReport() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        const res = await api.get(`/analytics/student/${id}/report`);
        setData(res.data);
      } catch (err) {
        setError('Failed to load report data.');
      } finally {
        setLoading(false);
      }
    };
    fetchReportData();
  }, [id]);

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '60vh', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-emerald)' }}>
        Generating Analytical Report...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="dash-card span-12" style={{ textAlign: 'center', maxWidth: '500px', margin: '3rem auto' }}>
        <h2>Report Error</h2>
        <p style={{ color: 'var(--slate-600)', margin: '1rem 0' }}>{error || 'No report data found.'}</p>
        <button className="btn-secondary" onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button className="btn-secondary" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} /> Back
        </button>
        <button className="btn-primary" onClick={() => window.print()}>
          <Printer size={18} /> Export PDF Report
        </button>
      </div>

      {/* Printable Glassmorphic Report Sheet */}
      <div className="dash-card" style={{ padding: '3rem', background: '#FFFFFF' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid var(--slate-100)', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <Sparkles size={20} color="var(--brand-emerald)" />
              <h1 style={{ fontSize: '1.65rem', color: 'var(--slate-900)', margin: 0 }}>EduGuide AI — Career Evaluation Report</h1>
            </div>
            <p style={{ color: 'var(--slate-500)', fontSize: '0.88rem' }}>Holistic Student Assessment & AI Career Recommendation Profile</p>
          </div>

          <div style={{ textTransform: 'uppercase', textAlign: 'right' }}>
            <span className="badge badge-emerald" style={{ fontSize: '0.85rem' }}>Official Transcript</span>
          </div>
        </header>

        {/* Student Demographics Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', background: 'var(--slate-50)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-200)', marginBottom: '2rem' }}>
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)', textTransform: 'uppercase', fontWeight: 600 }}>Student Name</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--slate-900)' }}>{data.profile.name}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)', textTransform: 'uppercase', fontWeight: 600 }}>Roll Number</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--slate-900)' }}>{data.profile.roll_no}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)', textTransform: 'uppercase', fontWeight: 600 }}>Class & Section</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--slate-900)' }}>Grade {data.profile.grade}-{data.profile.section}</div>
          </div>
        </div>

        {/* 1. Academic Performance */}
        <section style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <BookOpen size={20} color="var(--brand-emerald)" />
            <h2 style={{ fontSize: '1.2rem', color: 'var(--slate-900)' }}>1. Academic Subject Performance</h2>
          </div>

          {data.marks && data.marks.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--slate-200)' }}>
              <thead>
                <tr style={{ background: 'var(--slate-100)', textTransform: 'uppercase', fontSize: '0.78rem', color: 'var(--slate-600)' }}>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Subject</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Exam</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Marks</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Percentage</th>
                </tr>
              </thead>
              <tbody>
                {data.marks.map(mark => (
                  <tr key={mark._id} style={{ borderBottom: '1px solid var(--slate-100)' }}>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{mark.subject}</td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--slate-600)' }}>{mark.exam_name}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>{mark.marks_obtained} / {mark.max_marks}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span className="badge badge-emerald">
                        {Math.round((mark.marks_obtained / mark.max_marks) * 100)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem' }}>No academic marks recorded.</p>
          )}
        </section>

        {/* 2. Aptitude & Cognitive Testing */}
        <section style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Award size={20} color="var(--accent-sky)" />
            <h2 style={{ fontSize: '1.2rem', color: 'var(--slate-900)' }}>2. Cognitive Aptitude Session Log</h2>
          </div>

          {data.aptitude_tests && data.aptitude_tests.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              {data.aptitude_tests.map(test => (
                <div key={test._id} className="glass-card" style={{ padding: '1rem' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
                    {new Date(test.completed_at).toLocaleDateString()}
                  </div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--slate-900)', margin: '0.25rem 0' }}>
                    {test.score} / {test.max_score} Score
                  </div>
                  <span className="badge badge-sky">
                    {Math.round((test.score / test.max_score) * 100)}% Accuracy
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem' }}>No aptitude tests recorded.</p>
          )}
        </section>

        {/* 3. Counselor Personal Interview */}
        {data.pi_data && (
          <section style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <UserCheck size={20} color="var(--accent-violet)" />
              <h2 style={{ fontSize: '1.2rem', color: 'var(--slate-900)' }}>3. Personal Interview & Counseling Evaluation</h2>
            </div>
            
            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <div style={{ marginBottom: '0.5rem', color: 'var(--slate-600)', fontSize: '0.9rem' }}>
                <strong>Session Date:</strong> {new Date(data.pi_data.createdAt).toLocaleDateString()}
              </div>
              <div style={{ marginBottom: '0.75rem', color: 'var(--slate-700)', fontSize: '0.92rem' }}>
                <strong>Notes:</strong> {data.pi_data.counselor_notes || 'No private notes attached.'}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--slate-600)' }}>Interest Tags:</span>
                {data.pi_data.summary_tags.map((tag, idx) => (
                  <span key={idx} className="badge badge-violet">{tag}</span>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* 4. Top AI Career Matches */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Sparkles size={20} color="var(--brand-emerald)" />
            <h2 style={{ fontSize: '1.2rem', color: 'var(--slate-900)' }}>4. AI Career Pathway Fit</h2>
          </div>

          {data.final_matches && data.final_matches.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
              {data.final_matches.map((match, i) => (
                <div key={match.careerId} className="glass-card" style={{ padding: '1.5rem', borderLeft: i === 0 ? '4px solid var(--brand-emerald)' : '1px solid var(--slate-200)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.1rem', color: 'var(--slate-900)', margin: 0 }}>#{i + 1} {match.title}</h3>
                    <span className={i === 0 ? 'badge badge-emerald' : 'badge badge-slate'} style={{ fontWeight: 700 }}>
                      {match.matchPercentage}% Fit
                    </span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--slate-500)', lineHeight: 1.4 }}>
                    {match.description}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem' }}>Not enough data to calculate career match pathways.</p>
          )}
        </section>

      </div>
    </div>
  );
}
