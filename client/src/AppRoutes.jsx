import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';

import RoleSelection from './views/auth/RoleSelection';
import StaffLogin from './views/auth/StaffLogin';
import StudentLogin from './views/auth/StudentLogin';
import AdminDashboard from './views/admin/AdminDashboard';
import TeacherDashboard from './views/teacher/TeacherDashboard';
import MarksUpload from './views/teacher/MarksUpload';
import StudentDashboard from './views/student/StudentDashboard';
import StudentReport from './views/student/StudentReport';
import AptitudeTest from './views/student/AptitudeTest';
import StudentProfile from './views/student/StudentProfile';
import ReviewQueue from './views/staff/ReviewQueue';
import CounselorDashboard from './views/counselor/CounselorDashboard';
import ActivityHubView from './views/activities/ActivityHubView';

export default function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Extracurricular Activity Hub (All Roles) */}
      <Route 
        path="/activities" 
        element={
          <ProtectedRoute allowedRoles={['Student', 'Teacher', 'Counselor', 'Admin']}>
            <AppLayout>
              <ActivityHubView />
            </AppLayout>
          </ProtectedRoute>
        } 
      />

      {/* Public Unauthenticated Routes */}
      <Route 
        path="/" 
        element={
          user ? (
            user.role === 'Admin' ? <Navigate to="/admin" replace /> :
            user.role === 'Counselor' ? <Navigate to="/counselor" replace /> :
            user.role === 'Teacher' ? <Navigate to="/teacher" replace /> :
            <Navigate to="/student" replace />
          ) : <RoleSelection />
        } 
      />
      
      <Route path="/login/staff" element={user ? <Navigate to="/" replace /> : <StaffLogin />} />
      <Route path="/login/student" element={user ? <Navigate to="/" replace /> : <StudentLogin />} />

      {/* Protected Admin Routes */}
      <Route 
        path="/admin/*" 
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <AppLayout>
              <AdminDashboard />
            </AppLayout>
          </ProtectedRoute>
        } 
      />

      {/* Protected Review Queue (Staff Only) */}
      <Route 
        path="/staff/review-queue" 
        element={
          <ProtectedRoute allowedRoles={['Admin', 'Teacher', 'Counselor']}>
            <AppLayout>
              <ReviewQueue />
            </AppLayout>
          </ProtectedRoute>
        } 
      />

      {/* Protected Counselor Workspace */}
      <Route 
        path="/counselor" 
        element={
          <ProtectedRoute allowedRoles={['Counselor', 'Teacher', 'Admin']}>
            <AppLayout>
              <CounselorDashboard />
            </AppLayout>
          </ProtectedRoute>
        } 
      />

      {/* Protected Teacher Routes */}
      <Route 
        path="/teacher" 
        element={
          <ProtectedRoute allowedRoles={['Teacher', 'Counselor', 'Admin']}>
            <AppLayout>
              <TeacherDashboard />
            </AppLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/teacher/upload" 
        element={
          <ProtectedRoute allowedRoles={['Teacher', 'Counselor', 'Admin']}>
            <AppLayout>
              <MarksUpload />
            </AppLayout>
          </ProtectedRoute>
        } 
      />

      {/* Protected Student Routes */}
      <Route 
        path="/student" 
        element={
          <ProtectedRoute allowedRoles={['Student']}>
            <AppLayout>
              <StudentDashboard />
            </AppLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/student/profile" 
        element={
          <ProtectedRoute allowedRoles={['Student']}>
            <AppLayout>
              <StudentProfile />
            </AppLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/student/test" 
        element={
          <ProtectedRoute allowedRoles={['Student']}>
            <AppLayout>
              <AptitudeTest />
            </AppLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/student/report/:id" 
        element={
          <ProtectedRoute allowedRoles={['Student', 'Admin', 'Teacher', 'Counselor']}>
            <AppLayout>
              <StudentReport />
            </AppLayout>
          </ProtectedRoute>
        } 
      />

      {/* Catch-all 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
