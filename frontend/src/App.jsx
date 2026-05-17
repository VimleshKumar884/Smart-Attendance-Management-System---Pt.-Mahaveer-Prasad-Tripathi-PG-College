import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, roleHomePath, roleLoginPath, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/Toast';
import Spinner from './components/Spinner';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import ManageStudents from './pages/ManageStudents';
import ManageTeachers from './pages/ManageTeachers';
import MarkAttendance from './pages/MarkAttendance';
import StudentDashboard from './pages/StudentDashboard';
import AttendanceReports from './pages/AttendanceReports';
import Settings from './pages/Settings';
import FacultySubjects from './pages/FacultySubjects';
import AttendanceHistory from './pages/AttendanceHistory';
import Subjects from './pages/Subjects';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Spinner label="Checking secure session..." fullScreen />;
  
  if (!user) {
    const requestedRole = location.pathname.startsWith('/admin')
      ? 'admin'
      : location.pathname.startsWith('/faculty') || location.pathname.startsWith('/teacher')
        ? 'teacher'
        : 'student';

    return <Navigate to={roleLoginPath[requestedRole]} state={{ from: location }} replace />;
  }
  
  if (roles && !roles.includes(user.role)) {
    return <Navigate to={roleHomePath[user.role] || '/'} replace />;
  }

  return children;
};

const AppContent = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Navigate to="/login/student" replace />} />
      <Route path="/login/:role" element={<Login />} />
      
      <Route path="/admin/*" element={
        <ProtectedRoute roles={['admin']}>
          <AdminLayout>
            <Routes>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="students" element={<ManageStudents />} />
              <Route path="faculty" element={<ManageTeachers />} />
              <Route path="teachers" element={<Navigate to="/admin/faculty" replace />} />
              <Route path="subjects" element={<Subjects />} />
              <Route path="attendance" element={<AttendanceReports />} />
              <Route path="faculty-attendance" element={<FacultyAttendance />} />
              <Route path="notifications" element={<AdminNotifications />} />
              <Route path="settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="dashboard" replace />} />
            </Routes>
          </AdminLayout>
        </ProtectedRoute>
      } />

      <Route path="/faculty/*" element={
        <ProtectedRoute roles={['teacher']}>
          <AdminLayout>
            <Routes>
              <Route path="dashboard" element={<Navigate to="/faculty/subjects" replace />} />
              <Route path="subjects" element={<FacultySubjects />} />
              <Route path="mark-attendance" element={<MarkAttendance />} />
              <Route path="history" element={<AttendanceHistory />} />
              <Route path="my-attendance" element={<FacultyMyAttendance />} />
              <Route path="profile" element={<FacultyProfile />} />
              <Route path="*" element={<Navigate to="subjects" replace />} />
            </Routes>
          </AdminLayout>
        </ProtectedRoute>
      } />

      <Route path="/teacher/*" element={<Navigate to="/faculty/subjects" replace />} />

      <Route path="/student/*" element={
        <ProtectedRoute roles={['student']}>
          <AdminLayout>
            <Routes>
              <Route path="dashboard" element={<StudentDashboard />} />
              <Route path="mark-attendance" element={<StudentMarkAttendance />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="*" element={<Navigate to="dashboard" replace />} />
            </Routes>
          </AdminLayout>
        </ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
