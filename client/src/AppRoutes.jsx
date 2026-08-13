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
import StudentReport from './views/student/StudentReport';
import AptitudeTest from './views/student/AptitudeTest';
import ReviewQueue from './views/staff/ReviewQueue';
import CounselorDashboard from './views/counselor/CounselorDashboard';

export default function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={
        user ? (
          user.role === 'Admin' ? <Navigate to="/admin" /> :
          (user.role === 'Teacher' || user.role === 'Counselor') ? <Navigate to="/teacher" /> :
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
      <Route 
        path="/staff/review-queue" 
        element={
          <ProtectedRoute allowedRoles={['Admin', 'Teacher', 'Counselor']}>
            <ReviewQueue />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/counselor" 
        element={
          <ProtectedRoute allowedRoles={['Counselor', 'Teacher', 'Admin']}>
            <CounselorDashboard />
          </ProtectedRoute>
        } 
      />

      {/* Protected Teacher/Staff Routes */}
      <Route 
        path="/teacher" 
        element={
          <ProtectedRoute allowedRoles={['Teacher', 'Counselor', 'Admin']}>
            <TeacherDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/teacher/upload" 
        element={
          <ProtectedRoute allowedRoles={['Teacher', 'Counselor', 'Admin']}>
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
        path="/student/report/:id" 
        element={
          <ProtectedRoute allowedRoles={['Student', 'Admin', 'Teacher', 'Counselor']}>
            <StudentReport />
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
