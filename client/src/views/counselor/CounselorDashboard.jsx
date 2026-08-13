import { useState, useEffect } from 'react';
import { api } from '../../api/client';
import './CounselorDashboard.css';

function CounselorDashboard() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [rubric, setRubric] = useState({ communication: 3, problem_solving: 3, creativity: 3, leadership: 3 });
  const [tags, setTags] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      // For MVP, just fetch all students. In a real app, you'd fetch assigned students.
      const res = await api.get('/students');
      setStudents(res.data || []);
    } catch (err) {
      setError('Failed to load students.');
    } finally {
      setLoading(false);
    }
  };

  const handleRubricChange = (field, value) => {
    setRubric(prev => ({ ...prev, [field]: value }));
  };

  const submitPI = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const summary_tags = tags.split(',').map(t => t.trim()).filter(Boolean);
      await api.post('/pi', {
        student_id: selectedStudent._id,
        rubric_ratings: rubric,
        summary_tags,
        counselor_notes: notes
      });
      alert('PI Session logged successfully!');
      setSelectedStudent(null);
      setRubric({ communication: 3, problem_solving: 3, creativity: 3, leadership: 3 });
      setTags('');
      setNotes('');
    } catch (err) {
      alert('Failed to log PI session.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-2">Loading Dashboard...</div>;
  if (error) return <div className="p-2 error-text">{error}</div>;

  return (
    <div className="counselor-dashboard">
      <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>Personal Interview Workspace</h1>
          <p>Log Personal Interview (PI) Sessions for your students.</p>
        </div>
        <button className="btn-secondary" onClick={() => window.location.href = '/teacher'}>
          &larr; Back to Dashboard
        </button>
      </div>

      <div className="dashboard-layout">
        {/* Left Col: Student List */}
        <div className="student-list-col">
          <h3>Student Directory</h3>
          <ul className="student-list">
            {students.map(s => (
              <li 
                key={s._id} 
                className={selectedStudent?._id === s._id ? 'active' : ''}
                onClick={() => setSelectedStudent(s)}
              >
                <strong>{s.name}</strong>
                <span>Roll: {s.roll_no} | Grade: {s.grade}{s.section}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right Col: PI Form */}
        <div className="pi-form-col">
          {selectedStudent ? (
            <div className="bento-card">
              <h2>New PI Session: {selectedStudent.name}</h2>
              
              <form onSubmit={submitPI} className="pi-form">
                <div className="form-section">
                  <h4>Standardized Rubric (1-5)</h4>
                  <div className="rubric-grid">
                    {Object.keys(rubric).map(key => (
                      <div key={key} className="rubric-item">
                        <label>{key.replace('_', ' ').toUpperCase()}</label>
                        <input 
                          type="range" 
                          min="1" max="5" 
                          value={rubric[key]} 
                          onChange={(e) => handleRubricChange(key, parseInt(e.target.value))}
                        />
                        <span className="rubric-val">{rubric[key]}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="form-section">
                  <h4>Extracurricular / Interest Tags</h4>
                  <input 
                    type="text" 
                    placeholder="e.g. Coding, Debate, Art (comma separated)"
                    value={tags}
                    onChange={e => setTags(e.target.value)}
                  />
                </div>

                <div className="form-section">
                  <h4>Counselor Notes (Private)</h4>
                  <textarea 
                    rows="4" 
                    placeholder="General observations..."
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                  />
                </div>

                <div className="form-actions">
                  <button type="button" className="btn-secondary" onClick={() => setSelectedStudent(null)}>Cancel</button>
                  <button type="submit" className="btn-primary" disabled={submitting}>
                    {submitting ? 'Saving...' : 'Log Session & Generate Result'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="empty-state">
              Select a student from the list to start a PI Session.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CounselorDashboard;
