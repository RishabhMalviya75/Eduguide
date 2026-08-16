import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import ActivityCard from '../../components/activities/ActivityCard';
import ActivityDetailModal from '../../components/activities/ActivityDetailModal';
import CreateActivityModal from '../../components/activities/CreateActivityModal';
import ActivityParticipantsModal from '../../components/activities/ActivityParticipantsModal';
import { 
  Sparkles, 
  Search, 
  Filter, 
  Calendar, 
  MapPin, 
  Plus, 
  CheckCircle2, 
  Award, 
  BookOpen, 
  Users, 
  X,
  Layers
} from 'lucide-react';
import './activities.css';

const CATEGORIES = [
  'All Categories',
  'Cultural & Performing Arts',
  'Sports & Physical Activity',
  'Academic & Intellectual',
  'Leadership, Service & Life Skills',
  'Seasonal / Skill-Building',
];

export default function ActivityHubView() {
  const { user } = useAuth();
  const userRole = user?.role || 'Student';

  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // Filters State
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'joined' (student), 'mine' (teacher/admin)
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  // Modals State
  const [detailActivity, setDetailActivity] = useState(null);
  const [participantsActivity, setParticipantsActivity] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmittingCreate, setIsSubmittingCreate] = useState(false);

  useEffect(() => {
    fetchActivities();
  }, [activeTab, selectedCategory, selectedDate, selectedLocation]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const fetchActivities = async () => {
    try {
      setLoading(true);
      setError('');

      const queryParams = new URLSearchParams();
      if (selectedCategory && selectedCategory !== 'All Categories') {
        queryParams.append('category', selectedCategory);
      }
      if (selectedLocation.trim()) {
        queryParams.append('location', selectedLocation.trim());
      }
      if (selectedDate) {
        queryParams.append('date', selectedDate);
      }
      if (searchTerm.trim()) {
        queryParams.append('search', searchTerm.trim());
      }
      if (activeTab === 'joined' && userRole === 'Student') {
        queryParams.append('joinedOnly', 'true');
      }

      const res = await api.get(`/activities?${queryParams.toString()}`);
      let fetched = res.data || [];

      if (activeTab === 'mine' && (userRole === 'Teacher' || userRole === 'Admin')) {
        const myUserId = (user.id || user._id || user.user_id)?.toString();
        fetched = fetched.filter((act) => act.organizer?.user_id?.toString() === myUserId);
      }

      setActivities(fetched);
    } catch (err) {
      setError(err.message || 'Failed to load activities');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchActivities();
  };

  const handleRegister = async (activityId) => {
    try {
      await api.post(`/activities/${activityId}/register`);
      showToast('🎉 Successfully registered for activity!');
      fetchActivities();
    } catch (err) {
      showToast(`⚠️ ${err.message || 'Failed to register'}`);
    }
  };

  const handleUnregister = async (activityId) => {
    try {
      await api.delete(`/activities/${activityId}/register`);
      showToast('Notice: Unregistered from activity.');
      fetchActivities();
    } catch (err) {
      showToast(`⚠️ ${err.message || 'Failed to unregister'}`);
    }
  };

  const handleCreateSubmit = async (formData) => {
    try {
      setIsSubmittingCreate(true);
      await api.post('/activities', formData);
      setIsCreateOpen(false);
      showToast('✨ Activity created successfully!');
      fetchActivities();
    } catch (err) {
      showToast(`⚠️ ${err.message || 'Failed to create activity'}`);
    } finally {
      setIsSubmittingCreate(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All Categories');
    setSelectedLocation('');
    setSelectedDate('');
  };

  return (
    <div className="activity-hub-container">
      {/* Toast Alert */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          zIndex: 2000,
          background: '#0F172A',
          color: '#FFFFFF',
          padding: '0.85rem 1.4rem',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.25)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          fontSize: '0.9rem',
          fontWeight: 500,
          animation: 'slideUp 0.2s ease-out'
        }}>
          <span>{toastMessage}</span>
          <button 
            onClick={() => setToastMessage('')}
            style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', display: 'flex' }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="activity-hub-header">
        <div>
          <h1 className="activity-hub-title">
            <Sparkles size={28} style={{ color: 'var(--brand-blue)' }} />
            Extracurricular Activity Hub
          </h1>
          <p className="activity-hub-subtitle">
            Explore workshops, competitions, sports tournaments, and leadership programs across your school.
          </p>
        </div>

        <div className="activity-hub-actions">
          {(userRole === 'Teacher' || userRole === 'Admin') && (
            <button className="btn-create-activity" onClick={() => setIsCreateOpen(true)}>
              <Plus size={18} />
              Create Activity
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="activity-tabs">
        <button
          className={`activity-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          <Layers size={16} />
          All Activities
        </button>

        {userRole === 'Student' && (
          <button
            className={`activity-tab-btn ${activeTab === 'joined' ? 'active' : ''}`}
            onClick={() => setActiveTab('joined')}
          >
            <CheckCircle2 size={16} />
            My Joined Activities
          </button>
        )}

        {(userRole === 'Teacher' || userRole === 'Admin') && (
          <button
            className={`activity-tab-btn ${activeTab === 'mine' ? 'active' : ''}`}
            onClick={() => setActiveTab('mine')}
          >
            <Award size={16} />
            My Created Activities
          </button>
        )}
      </div>

      {/* Filter & Search Bar */}
      <form onSubmit={handleSearchSubmit} className="activity-filters-bar">
        {/* Search Input */}
        <div className="filter-input-group">
          <label className="filter-label">Search</label>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)' }} />
            <input
              type="text"
              className="filter-control"
              style={{ paddingLeft: '2.4rem' }}
              placeholder="Search by title, description, keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Category Dropdown */}
        <div className="filter-input-group">
          <label className="filter-label">Category</label>
          <select
            className="filter-control"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Location Input */}
        <div className="filter-input-group">
          <label className="filter-label">Location / Venue</label>
          <input
            type="text"
            className="filter-control"
            placeholder="e.g. Auditorium, Grounds..."
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
          />
        </div>

        {/* Date Filter */}
        <div className="filter-input-group">
          <label className="filter-label">Event Date</label>
          <input
            type="date"
            className="filter-control"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
      </form>

      {/* Error Message */}
      {error && (
        <div style={{ padding: '1rem 1.25rem', background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', borderRadius: '12px', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      {/* Loading Grid State */}
      {loading ? (
        <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--slate-500)' }}>
          <Sparkles size={32} style={{ animation: 'spin 1.5s linear infinite', margin: '0 auto 1rem', display: 'block', color: 'var(--brand-blue)' }} />
          Loading extracurricular activity hub...
        </div>
      ) : activities.length === 0 ? (
        /* Empty State */
        <div className="empty-state-box">
          <div className="empty-state-icon">
            <Sparkles size={28} />
          </div>
          <h3 className="empty-state-title">No Activities Found</h3>
          <p className="empty-state-text">
            {activeTab === 'joined'
              ? "You haven't joined any extracurricular activities yet. Explore 'All Activities' and register for eligible events!"
              : activeTab === 'mine'
              ? "You haven't created any activities yet. Click 'Create Activity' to get started!"
              : "No activities match your current search or category filters. Try clearing your filters."}
          </p>
          {(searchTerm || selectedCategory !== 'All Categories' || selectedDate || selectedLocation) && (
            <button className="btn-card-primary btn-details" style={{ margin: '0 auto' }} onClick={clearFilters}>
              Reset All Filters
            </button>
          )}
        </div>
      ) : (
        /* Activities Grid */
        <div className="activities-grid">
          {activities.map((act) => (
            <ActivityCard
              key={act._id}
              activity={act}
              userRole={userRole}
              onViewDetails={(activity) => setDetailActivity(activity)}
              onRegister={handleRegister}
              onUnregister={handleUnregister}
              onViewParticipants={(activity) => setParticipantsActivity(activity)}
            />
          ))}
        </div>
      )}

      {/* Activity Details Modal */}
      {detailActivity && (
        <ActivityDetailModal
          activity={detailActivity}
          userRole={userRole}
          onClose={() => setDetailActivity(null)}
          onRegister={handleRegister}
          onUnregister={handleUnregister}
          onViewParticipants={(activity) => {
            setDetailActivity(null);
            setParticipantsActivity(activity);
          }}
        />
      )}

      {/* Activity Participants Roster Modal (Teacher/Admin) */}
      {participantsActivity && (
        <ActivityParticipantsModal
          activity={participantsActivity}
          onClose={() => setParticipantsActivity(null)}
        />
      )}

      {/* Create Activity Form Modal (Teacher/Admin) */}
      {isCreateOpen && (
        <CreateActivityModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onSubmit={handleCreateSubmit}
          isSubmitting={isSubmittingCreate}
        />
      )}
    </div>
  );
}
