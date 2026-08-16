import React from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  CheckCircle2, 
  AlertTriangle, 
  User, 
  Mail, 
  FileText, 
  Sparkles,
  UserPlus,
  Edit3
} from 'lucide-react';

export default function ActivityDetailModal({ 
  activity, 
  userRole, 
  onClose, 
  onRegister, 
  onUnregister,
  onViewParticipants,
  onEdit
}) {
  if (!activity) return null;

  const {
    _id,
    title,
    category,
    description,
    date,
    time,
    location,
    eligibility,
    maxParticipants,
    currentParticipantsCount = 0,
    registrationDeadline,
    registrationDetails,
    organizer,
    isJoined,
    isEligible,
    eligibilityReason,
    isFull,
    isDeadlinePassed
  } = activity;

  const formattedDate = date ? new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }) : 'TBD';

  const formattedDeadline = registrationDeadline ? new Date(registrationDeadline).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }) : 'N/A';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content-box" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 600, color: 'var(--brand-blue)' }}>
              {category}
            </span>
            <h2 className="modal-title" style={{ marginTop: '0.2rem' }}>{title}</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* Status Alert Banners */}
          {isJoined && (
            <div style={{ background: '#DCFCE7', border: '1px solid #86EFAC', color: '#15803D', padding: '0.85rem 1rem', borderRadius: '10px', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.88rem' }}>
              <CheckCircle2 size={18} />
              <div>
                <strong>You are registered!</strong> Your spot is confirmed for this event.
              </div>
            </div>
          )}

          {!isEligible && userRole === 'Student' && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', padding: '0.85rem 1rem', borderRadius: '10px', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.88rem' }}>
              <AlertTriangle size={18} />
              <div>
                <strong>Eligibility Restriction:</strong> {eligibilityReason || 'You are not eligible based on your class grade.'}
              </div>
            </div>
          )}

          {isDeadlinePassed && !isJoined && (
            <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', color: '#92400E', padding: '0.85rem 1rem', borderRadius: '10px', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.88rem' }}>
              <AlertTriangle size={18} />
              <div>
                <strong>Registration Closed:</strong> The deadline to sign up passed on {formattedDeadline}.
              </div>
            </div>
          )}

          {/* Description Section */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--slate-800)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              About the Activity
            </h4>
            <p style={{ color: 'var(--slate-600)', lineHeight: '1.6', fontSize: '0.92rem', whiteSpace: 'pre-line' }}>
              {description}
            </p>
          </div>

          {/* Key Details Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: 'var(--slate-50)', padding: '1.25rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid var(--slate-200)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <Calendar size={18} style={{ color: 'var(--brand-blue)' }} />
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', fontWeight: 600 }}>Date</div>
                <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--slate-800)' }}>{formattedDate}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <Clock size={18} style={{ color: 'var(--brand-blue)' }} />
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', fontWeight: 600 }}>Time</div>
                <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--slate-800)' }}>{time}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <MapPin size={18} style={{ color: 'var(--brand-blue)' }} />
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', fontWeight: 600 }}>Location</div>
                <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--slate-800)' }}>{location}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <Users size={18} style={{ color: 'var(--brand-blue)' }} />
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', fontWeight: 600 }}>Eligible Classes</div>
                <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--slate-800)' }}>{eligibility?.text || 'All Grades'}</div>
              </div>
            </div>
          </div>

          {/* Registration Details & Deadline */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--slate-800)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              Registration & Guidelines
            </h4>
            <div style={{ fontSize: '0.88rem', color: 'var(--slate-600)', marginBottom: '0.75rem' }}>
              Registration Deadline: <strong style={{ color: 'var(--slate-800)' }}>{formattedDeadline}</strong>
            </div>
            {registrationDetails && (
              <div style={{ background: '#EEF2FF', padding: '0.85rem 1rem', borderRadius: '8px', borderLeft: '4px solid #4F46E5', fontSize: '0.88rem', color: 'var(--slate-700)' }}>
                {registrationDetails}
              </div>
            )}
          </div>

          {/* Organizer Info */}
          {organizer && (
            <div style={{ paddingTop: '1rem', borderTop: '1px dashed var(--slate-200)' }}>
              <h4 style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--slate-500)', marginBottom: '0.6rem', textTransform: 'uppercase' }}>
                Organized By
              </h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#EEF2FF', color: '#4F46E5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                  {organizer.name ? organizer.name.charAt(0) : 'O'}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--slate-800)' }}>{organizer.name}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)' }}>{organizer.role || 'Teacher Organizer'} • {organizer.email}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="modal-footer">
          <button className="btn-card-primary btn-details" onClick={onClose}>
            Close
          </button>

          {userRole === 'Student' && (
            <>
              {isJoined ? (
                <button 
                  className="btn-card-primary btn-leave"
                  onClick={() => {
                    onUnregister(_id);
                    onClose();
                  }}
                >
                  Cancel Registration
                </button>
              ) : (
                <button 
                  className="btn-card-primary btn-join"
                  disabled={!isEligible || isFull || isDeadlinePassed}
                  onClick={() => {
                    onRegister(_id);
                    onClose();
                  }}
                >
                  <UserPlus size={16} />
                  Register Now
                </button>
              )}
            </>
          )}

          {(userRole === 'Teacher' || userRole === 'Admin') && (
            <>
              {onEdit && (
                <button
                  className="btn-card-primary btn-details"
                  style={{ border: '1px solid var(--brand-blue)', color: 'var(--brand-blue)', background: '#F0F7FF' }}
                  onClick={() => {
                    onClose();
                    onEdit(activity);
                  }}
                >
                  <Edit3 size={16} />
                  Edit Activity Details
                </button>
              )}
              <button 
                className="btn-card-primary btn-join"
                onClick={() => {
                  onClose();
                  onViewParticipants(activity);
                }}
              >
                View Participant Roster ({currentParticipantsCount})
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
