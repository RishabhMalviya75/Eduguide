import React from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Eye, 
  UserPlus, 
  UserCheck,
  Award,
  BookOpen,
  GraduationCap
} from 'lucide-react';

const CATEGORY_STYLES = {
  'Cultural & Performing Arts': { className: 'category-cultural', icon: Sparkles },
  'Sports & Physical Activity': { className: 'category-sports', icon: Award },
  'Academic & Intellectual': { className: 'category-academic', icon: BookOpen },
  'Leadership, Service & Life Skills': { className: 'category-leadership', icon: GraduationCap },
  'Seasonal / Skill-Building': { className: 'category-skill', icon: Sparkles },
};

export default function ActivityCard({ 
  activity, 
  userRole, 
  onViewDetails, 
  onRegister, 
  onUnregister, 
  onViewParticipants,
  onEdit
}) {
  const {
    title,
    category,
    description,
    date,
    time,
    location,
    eligibility,
    maxParticipants,
    currentParticipantsCount = 0,
    isJoined,
    isEligible,
    isFull,
    isDeadlinePassed,
    organizer,
    status
  } = activity;

  const categoryInfo = CATEGORY_STYLES[category] || { className: 'category-academic', icon: Sparkles };
  const CategoryIcon = categoryInfo.icon;

  const formattedDate = date ? new Date(date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }) : 'TBD';

  return (
    <div className="activity-card">
      <div>
        {/* Top Badges */}
        <div className="activity-card-badge-row">
          <span className={`category-badge ${categoryInfo.className}`}>
            <CategoryIcon size={13} />
            {category}
          </span>

          {isJoined && (
            <span className="joined-pill">
              <CheckCircle2 size={13} />
              Joined
            </span>
          )}

          {status === 'cancelled' && (
            <span style={{ background: '#FEE2E2', color: '#DC2626', padding: '0.25rem 0.6rem', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 600 }}>
              Cancelled
            </span>
          )}
        </div>

        {/* Event Title */}
        <h3 className="activity-card-title">{title}</h3>

        {/* Short Description */}
        <p className="activity-card-description">{description}</p>

        {/* Meta Info List */}
        <div className="activity-meta-list">
          <div className="activity-meta-item">
            <Calendar size={15} className="activity-meta-icon" />
            <span>{formattedDate}</span>
          </div>

          <div className="activity-meta-item">
            <Clock size={15} className="activity-meta-icon" />
            <span>{time}</span>
          </div>

          <div className="activity-meta-item">
            <MapPin size={15} className="activity-meta-icon" />
            <span>{location}</span>
          </div>

          <div className="activity-meta-item">
            <Users size={15} className="activity-meta-icon" />
            <span>Eligibility: <strong>{eligibility?.text || 'All Students'}</strong></span>
          </div>
        </div>

        {/* Capacity Bar */}
        {maxParticipants ? (
          <div className="capacity-container">
            <div className="capacity-header">
              <span>Registrations</span>
              <span>
                <strong>{currentParticipantsCount}</strong> / {maxParticipants} Spots
              </span>
            </div>
            <div className="capacity-bar-bg">
              <div 
                className={`capacity-bar-fill ${isFull ? 'full' : ''}`}
                style={{ width: `${Math.min(100, (currentParticipantsCount / maxParticipants) * 100)}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="capacity-container">
            <div className="capacity-header">
              <span>Registrations</span>
              <span><strong>{currentParticipantsCount}</strong> Registered (Unlimited)</span>
            </div>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="activity-card-actions">
        <button 
          className="btn-card-primary btn-details"
          onClick={() => onViewDetails(activity)}
        >
          <Eye size={15} />
          Details
        </button>

        {userRole === 'Student' && (
          <>
            {isJoined ? (
              <button 
                className="btn-card-primary btn-leave"
                onClick={() => onUnregister(activity._id)}
              >
                Leave
              </button>
            ) : isDeadlinePassed ? (
              <button className="btn-card-primary btn-disabled" disabled>
                Deadline Passed
              </button>
            ) : isFull ? (
              <button className="btn-card-primary btn-disabled" disabled>
                Full
              </button>
            ) : !isEligible ? (
              <button 
                className="btn-card-primary btn-disabled" 
                title="Not eligible based on grade"
                disabled
              >
                Not Eligible
              </button>
            ) : (
              <button 
                className="btn-card-primary btn-join"
                onClick={() => onRegister(activity._id)}
              >
                <UserPlus size={15} />
                Join
              </button>
            )}
          </>
        )}

        {(userRole === 'Teacher' || userRole === 'Admin') && (
          <button 
            className="btn-card-primary btn-join"
            onClick={() => onViewParticipants(activity)}
          >
            <UserCheck size={15} />
            Roster ({currentParticipantsCount})
          </button>
        )}
      </div>
    </div>
  );
}
