import React, { useState } from 'react';
import { X, Plus, Sparkles } from 'lucide-react';

const CATEGORIES = [
  'Cultural & Performing Arts',
  'Sports & Physical Activity',
  'Academic & Intellectual',
  'Leadership, Service & Life Skills',
  'Seasonal / Skill-Building',
];

const GRADES = [6, 7, 8, 9, 10, 11, 12];

export default function CreateActivityModal({ isOpen, onClose, onSubmit, isSubmitting }) {
  if (!isOpen) return null;

  const [formData, setFormData] = useState({
    title: '',
    category: CATEGORIES[0],
    description: '',
    date: '',
    time: '10:00 AM - 01:00 PM',
    location: '',
    eligibilityGrades: [6, 7, 8, 9, 10, 11, 12],
    eligibilityText: 'Classes 6 to 12',
    maxParticipants: '',
    registrationDeadline: '',
    registrationDetails: '',
  });

  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGradeToggle = (grade) => {
    setFormData((prev) => {
      const exists = prev.eligibilityGrades.includes(grade);
      const updated = exists
        ? prev.eligibilityGrades.filter((g) => g !== grade)
        : [...prev.eligibilityGrades, grade].sort((a, b) => a - b);
      
      const newText = updated.length > 0 ? `Classes ${updated.join(', ')}` : 'All Students';

      return {
        ...prev,
        eligibilityGrades: updated,
        eligibilityText: newText,
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim()) return setError('Activity title is required.');
    if (!formData.description.trim()) return setError('Description is required.');
    if (!formData.date) return setError('Activity date is required.');
    if (!formData.time.trim()) return setError('Activity time is required.');
    if (!formData.location.trim()) return setError('Location is required.');
    if (!formData.registrationDeadline) return setError('Registration deadline is required.');
    if (formData.eligibilityGrades.length === 0) return setError('Select at least one eligible class grade.');

    onSubmit(formData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={20} style={{ color: 'var(--brand-blue)' }} />
            <h2 className="modal-title">Create New Activity</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            {error && (
              <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.85rem' }}>
                {error}
              </div>
            )}

            {/* Title */}
            <div>
              <label className="filter-label" style={{ marginBottom: '0.35rem', display: 'block' }}>Event Title *</label>
              <input
                type="text"
                name="title"
                className="filter-control"
                placeholder="e.g. Annual Inter-School Science Exhibition"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            {/* Category & Location */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label className="filter-label" style={{ marginBottom: '0.35rem', display: 'block' }}>Category *</label>
                <select
                  name="category"
                  className="filter-control"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="filter-label" style={{ marginBottom: '0.35rem', display: 'block' }}>Location / Venue *</label>
                <input
                  type="text"
                  name="location"
                  className="filter-control"
                  placeholder="e.g. School Auditorium"
                  value={formData.location}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="filter-label" style={{ marginBottom: '0.35rem', display: 'block' }}>Description *</label>
              <textarea
                name="description"
                className="filter-control"
                rows={3}
                placeholder="Provide event overview, highlights, guidelines..."
                value={formData.description}
                onChange={handleChange}
                required
              />
            </div>

            {/* Date & Time */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label className="filter-label" style={{ marginBottom: '0.35rem', display: 'block' }}>Event Date *</label>
                <input
                  type="date"
                  name="date"
                  className="filter-control"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="filter-label" style={{ marginBottom: '0.35rem', display: 'block' }}>Time *</label>
                <input
                  type="text"
                  name="time"
                  className="filter-control"
                  placeholder="e.g. 09:30 AM - 03:00 PM"
                  value={formData.time}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Registration Deadline & Max Capacity */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label className="filter-label" style={{ marginBottom: '0.35rem', display: 'block' }}>Registration Deadline *</label>
                <input
                  type="datetime-local"
                  name="registrationDeadline"
                  className="filter-control"
                  value={formData.registrationDeadline}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="filter-label" style={{ marginBottom: '0.35rem', display: 'block' }}>Max Participants (Optional)</label>
                <input
                  type="number"
                  name="maxParticipants"
                  className="filter-control"
                  placeholder="Leave empty for unlimited"
                  min={1}
                  value={formData.maxParticipants}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Grade Eligibility Selection */}
            <div>
              <label className="filter-label" style={{ marginBottom: '0.5rem', display: 'block' }}>Eligible Class Grades *</label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {GRADES.map((g) => {
                  const selected = formData.eligibilityGrades.includes(g);
                  return (
                    <button
                      key={g}
                      type="button"
                      onClick={() => handleGradeToggle(g)}
                      style={{
                        padding: '0.4rem 0.85rem',
                        borderRadius: '8px',
                        border: selected ? '1px solid #4F46E5' : '1px solid var(--slate-300)',
                        background: selected ? '#EEF2FF' : '#FFFFFF',
                        color: selected ? '#4F46E5' : 'var(--slate-700)',
                        fontWeight: selected ? 700 : 500,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      Class {g}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Registration Notes / Details */}
            <div>
              <label className="filter-label" style={{ marginBottom: '0.35rem', display: 'block' }}>Registration Notes / Instructions (Optional)</label>
              <input
                type="text"
                name="registrationDetails"
                className="filter-control"
                placeholder="e.g. Bring your student ID card; props will be provided."
                value={formData.registrationDetails}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-card-primary btn-details" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-create-activity" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Activity'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
