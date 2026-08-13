import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { Printer, ArrowLeft } from 'lucide-react';
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

  if (loading) return <div className="p-2">Generating Report...</div>;
  if (error) return <div className="p-2 error-text">{error}</div>;
  if (!data) return <div className="p-2">No data available.</div>;

  return (
    <div className="report-container">
      {/* Non-printable controls */}
      <div className="report-controls no-print">
        <button className="btn-secondary" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} /> Back
        </button>
        <button className="btn-primary" onClick={() => window.print()}>
          <Printer size={18} /> Print PDF
        </button>
      </div>

      {/* Printable Report Page */}
      <div className="report-page">
        <header className="report-header">
          <h1>EduGuide AI Comprehensive Report</h1>
          <div className="student-info">
            <p><strong>Name:</strong> {data.profile.name}</p>
            <p><strong>Roll No:</strong> {data.profile.roll_no}</p>
            <p><strong>Class:</strong> {data.profile.grade}-{data.profile.section}</p>
          </div>
        </header>

        <section className="report-section">
          <h2>1. Academic Performance</h2>
          {data.marks && data.marks.length > 0 ? (
            <table className="report-table">
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Exam</th>
                  <th>Marks</th>
                  <th>Percentage</th>
                </tr>
              </thead>
              <tbody>
                {data.marks.map(mark => (
                  <tr key={mark._id}>
                    <td>{mark.subject}</td>
                    <td>{mark.exam_name}</td>
                    <td>{mark.marks_obtained} / {mark.max_marks}</td>
                    <td>{Math.round((mark.marks_obtained / mark.max_marks) * 100)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No academic marks recorded.</p>
          )}
        </section>

        <section className="report-section">
          <h2>2. Aptitude & Cognitive Testing</h2>
          {data.aptitude_tests && data.aptitude_tests.length > 0 ? (
            <ul className="report-list">
              {data.aptitude_tests.map(test => (
                <li key={test._id}>
                  Test on {new Date(test.completed_at).toLocaleDateString()}: <strong>{test.score} / {test.max_score}</strong> ({Math.round((test.score/test.max_score)*100)}%)
                </li>
              ))}
            </ul>
          ) : (
            <p>No aptitude tests recorded.</p>
          )}
        </section>

        {data.pi_data && (
          <section className="report-section">
            <h2>3. Counselor Personal Interview</h2>
            <p><strong>Session Date:</strong> {new Date(data.pi_data.createdAt).toLocaleDateString()}</p>
            <p><strong>Counselor Notes:</strong> {data.pi_data.counselor_notes || 'N/A'}</p>
            <div className="tags">
              <strong>Interests: </strong> 
              {data.pi_data.summary_tags.join(', ')}
            </div>
          </section>
        )}

        <section className="report-section">
          <h2>4. AI Career Recommendations</h2>
          <p className="section-desc">Based on your combined academic, aptitude, and interview profile.</p>
          {data.final_matches && data.final_matches.length > 0 ? (
            <div className="career-matches">
              {data.final_matches.map((match, i) => (
                <div key={match.careerId} className="match-card">
                  <h3>#{i + 1} {match.title}</h3>
                  <div className="match-score">Match: {match.matchPercentage}%</div>
                  <p>{match.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <p>Not enough data to generate recommendations yet.</p>
          )}
        </section>
      </div>
    </div>
  );
}
