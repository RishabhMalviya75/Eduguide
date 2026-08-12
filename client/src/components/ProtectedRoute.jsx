import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

/**
 * A wrapper for routes that require authentication.
 * It checks the AuthContext and redirects unauthenticated users.
 * It also checks if the user has the required role for the route.
 */
export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', color: 'var(--sky-500)' }}>
        <Loader2 size={40} className="animate-spin" />
      </div>
    );
  }

  // Not logged in -> Redirect to role selection
  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Role check
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Determine where to send them based on their actual role
    if (user.role === 'Admin') return <Navigate to="/admin" replace />;
    if (user.role === 'Teacher') return <Navigate to="/teacher" replace />;
    if (user.role === 'Student') return <Navigate to="/student" replace />;
    
    // Fallback if role is unknown
    return <Navigate to="/" replace />;
  }

  return children;
}
