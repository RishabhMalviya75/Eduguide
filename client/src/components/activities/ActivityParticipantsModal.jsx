import React, { useState, useEffect } from 'react';
import { X, Users, Search, Download, CheckCircle2 } from 'lucide-react';
import { api } from '../../api/client';

export default function ActivityParticipantsModal({ activity, onClose }) {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (activity?._id) {
      fetchParticipants();
    }
  }, [activity]);

  const fetchParticipants = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get(`/activities/${activity._id}/participants`);
      setParticipants(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch participant roster');
    } finally {
      setLoading(false);
    }
  };

  const filteredParticipants = participants.filter((p) => {
    const s = p.student;
    if (!s) return false;
    const term = search.toLowerCase();
    return (
      (s.name && s.name.toLowerCase().includes(term)) ||
      (s.roll_no && s.roll_no.toLowerCase().includes(term)) ||
      (s.grade && s.grade.toString().includes(term)) ||
      (s.section && s.section.toLowerCase().includes(term))
    );
  });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '750px' }}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Users size={22} style={{ color: 'var(--brand-blue)' }} />
            <div>
              <h2 className="modal-title" style={{ fontSize: '1.2rem' }}>Participant Roster</h2>
              <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
                {activity?.title} • <strong>{participants.length}</strong> Registered
              </div>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* Search Filter */}
          <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)' }} />
            <input
              type="text"
              className="filter-control"
              style={{ paddingLeft: '2.5rem' }}
              placeholder="Search by student name, roll no, grade..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {loading ? (
            <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--slate-500)' }}>
              Loading participants roster...
            </div>
          ) : error ? (
            <div style={{ padding: '1rem', background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', borderRadius: '8px' }}>
              {error}
            </div>
          ) : filteredParticipants.length === 0 ? (
            <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: 'var(--slate-500)', background: 'var(--slate-50)', borderRadius: '12px', border: '1px dashed var(--slate-200)' }}>
              <Users size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
              <div style={{ fontWeight: 600, color: 'var(--slate-700)' }}>No registered students found</div>
              <div style={{ fontSize: '0.82rem', marginTop: '0.2rem' }}>
                {search ? 'Try adjusting your search filter' : 'Students will appear here once they register.'}
              </div>
            </div>
          ) : (
            <div style={{ overflowX: 'auto', border: '1px solid var(--slate-200)', borderRadius: '10px' }}>
              <table className="participant-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Student Name</th>
                    <th>Roll No</th>
                    <th>Class Grade</th>
                    <th>Registered On</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredParticipants.map((p, idx) => (
                    <tr key={p.registration_id || idx}>
                      <td>{idx + 1}</td>
                      <td style={{ fontWeight: 600, color: 'var(--slate-800)' }}>{p.student?.name || 'N/A'}</td>
                      <td style={{ fontFamily: 'monospace' }}>{p.student?.roll_no || 'N/A'}</td>
                      <td>Grade {p.student?.grade} - {p.student?.section}</td>
                      <td style={{ color: 'var(--slate-500)', fontSize: '0.8rem' }}>
                        {p.registered_at ? new Date(p.registered_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn-card-primary btn-details" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
