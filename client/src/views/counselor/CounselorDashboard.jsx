import { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { UserCheck, Sparkles, User, Tag, FileText, CheckCircle2 } from 'lucide-react';

export default function CounselorDashboard() {
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
      const res = await api.get('/students');
      setStudents(res.data || []);
    } catch (err) {
      setError('Failed to load student directory.');
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

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '60vh', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-violet)' }}>
        Loading Counselor Workspace...
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Banner */}
      <div className="dash-card span-12" style={{ background: 'linear-gradient(135deg, #FFFFFF 0%, #FAF5FF 60%, #F0FDF4 100%)', border: '1px solid var(--accent-violet-border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <span className="badge badge-violet">Counselor Module</span>
              <span className="badge badge-slate">Personal Interview Studio</span>
            </div>
            <h1 style={{ fontSize: '1.85rem', color: 'var(--slate-900)', marginBottom: '0.25rem' }}>
              Personal Interview (PI) Workspace
            </h1>
            <p style={{ color: 'var(--slate-600)', fontSize: '0.95rem' }}>
              Evaluate soft skills, rate rubrics (1-5), assign extracurricular tags, and auto-map career interest profiles.
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
        {/* Left Column: Student Directory */}
        <div className="dash-card">
          <div className="card-header-row">
            <div className="card-title-group">
              <div className="card-icon-badge" style={{ background: 'var(--slate-100)', color: 'var(--slate-700)' }}>
                <User size={20} />
              </div>
              <div>
                <div className="card-title-text">Student Roster</div>
                <div className="card-subtitle-text">Select to start interview evaluation</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', maxHeight: '560px', overflowY: 'auto' }}>
            {students.map(s => {
              const isSelected = selectedStudent?._id === s._id;
              return (
                <div 
                  key={s._id} 
                  className="glass-card" 
                  onClick={() => setSelectedStudent(s)}
                  style={{ 
                    padding: '0.85rem 1rem', 
                    cursor: 'pointer',
                    border: isSelected ? '2px solid var(--accent-violet)' : '1px solid var(--slate-200)',
                    background: isSelected ? 'var(--accent-violet-light)' : '#FFFFFF'
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--slate-900)' }}>{s.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
                    Roll: {s.roll_no} | Grade {s.grade}-{s.section}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: PI Evaluation Form */}
        <div>
          {selectedStudent ? (
            <div className="dash-card">
              <div className="card-header-row">
                <div className="card-title-group">
                  <div className="card-icon-badge" style={{ background: 'var(--accent-violet-light)', color: 'var(--accent-violet)' }}>
                    <UserCheck size={22} />
                  </div>
                  <div>
                    <div className="card-title-text">Evaluation: {selectedStudent.name}</div>
                    <div className="card-subtitle-text">Roll: {selectedStudent.roll_no} | Class {selectedStudent.grade}-{selectedStudent.section}</div>
                  </div>
                </div>
              </div>

              <form onSubmit={submitPI} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Rubric Ratings */}
                <div>
                  <h4 style={{ fontSize: '0.95rem', color: 'var(--slate-900)', marginBottom: '1rem' }}>Standardized Soft Skill Rubrics (1 - 5)</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                    {Object.keys(rubric).map(key => (
                      <div key={key} style={{ background: 'var(--slate-50)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-200)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: 600, textTransform: 'capitalize', color: 'var(--slate-700)' }}>
                            {key.replace('_', ' ')}
                          </span>
                          <span className="badge badge-violet" style={{ fontSize: '0.85rem' }}>{rubric[key]} / 5</span>
                        </div>
                        <input 
                          type="range" 
                          min="1" 
                          max="5" 
                          value={rubric[key]} 
                          onChange={(e) => handleRubricChange(key, parseInt(e.target.value))}
                          style={{ width: '100%', accentColor: 'var(--accent-violet)' }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Interest Tags */}
                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Tag size={16} /> Extracurricular Interest Tags
                  </label>
                  <input 
                    type="text" 
                    className="form-input"
                    placeholder="e.g., Coding, Debate, Model UN, Robotics, Art (comma separated)"
                    value={tags}
                    onChange={e => setTags(e.target.value)}
                  />
                </div>

                {/* Counselor Private Notes */}
                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <FileText size={16} /> Counselor Observations & Notes
                  </label>
                  <textarea 
                    rows={4} 
                    className="form-input"
                    placeholder="Private observations during interview session..."
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    style={{ resize: 'vertical' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                  <button type="button" className="btn-secondary" onClick={() => setSelectedStudent(null)}>Cancel</button>
                  <button type="submit" className="btn-primary" disabled={submitting} style={{ background: 'linear-gradient(135deg, #A855F7 0%, #7E22CE 100%)' }}>
                    <CheckCircle2 size={18} /> {submitting ? 'Saving Session...' : 'Log PI Session & Map Interests'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="dash-card" style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--slate-500)' }}>
              Select a student from the directory roster to launch a Personal Interview session.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
