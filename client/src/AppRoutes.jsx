import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// View placeholders (will be implemented next)
import RoleSelection from './views/auth/RoleSelection';
import StaffLogin from './views/auth/StaffLogin';
import StudentLogin from './views/auth/StudentLogin';
import AdminDashboard from './views/admin/AdminDashboard';
import TeacherDashboard from './views/teacher/TeacherDashboard';
import MarksUpload from './views/teacher/MarksUpload';
import StudentDashboard from './views/student/StudentDashboard';
import AptitudeTest from './views/student/AptitudeTest';

export default function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={
        // If already logged in, redirect to respective dashboard
        user ? (
          user.role === 'Admin' ? <Navigate to="/admin" /> :
          user.role === 'Teacher' ? <Navigate to="/teacher" /> :
          <Navigate to="/student" />
        ) : <RoleSelection />
      } />
      
      <Route path="/login/staff" element={<StaffLogin />} />
      <Route path="/login/student" element={<StudentLogin />} />

      {/* Protected Admin Routes */}
      <Route 
        path="/admin/*" 
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />

      {/* Protected Teacher Routes */}
      <Route 
        path="/teacher" 
        element={
          <ProtectedRoute allowedRoles={['Teacher']}>
            <TeacherDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/teacher/upload" 
        element={
          <ProtectedRoute allowedRoles={['Teacher']}>
            <MarksUpload />
          </ProtectedRoute>
        } 
      />

      {/* Protected Student Routes */}
      <Route 
        path="/student" 
        element={
          <ProtectedRoute allowedRoles={['Student']}>
            <StudentDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/student/test" 
        element={
          <ProtectedRoute allowedRoles={['Student']}>
            <AptitudeTest />
          </ProtectedRoute>
        } 
      />

      {/* Catch-all 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
