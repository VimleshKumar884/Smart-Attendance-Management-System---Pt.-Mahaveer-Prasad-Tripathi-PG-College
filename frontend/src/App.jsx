import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import ManageStudents from './pages/ManageStudents';
import ManageTeachers from './pages/ManageTeachers';
import MarkAttendance from './pages/MarkAttendance';
import StudentDashboard from './pages/StudentDashboard';

// Protected Route Component
const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
  
  if (!user) return <Navigate to="/login" />;
  
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" />;
  }

  return children;
};

const AppContent = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          
          {/* Admin Routes */}
          <Route path="/admin/*" element={
            <ProtectedRoute roles={['admin']}>
              <AdminLayout>
                <Routes>
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="students" element={<ManageStudents />} />
                  <Route path="teachers" element={<ManageTeachers />} />
                  <Route path="subjects" element={<div className="glass p-8 rounded-3xl"><h2 className="text-2xl font-bold">Manage Subjects</h2></div>} />
                  <Route path="*" element={<Navigate to="dashboard" />} />
                </Routes>
              </AdminLayout>
            </ProtectedRoute>
          } />

          {/* Teacher Routes */}
          <Route path="/teacher/*" element={
            <ProtectedRoute roles={['teacher']}>
              <Routes>
                <Route path="dashboard" element={<MarkAttendance />} />
                <Route path="*" element={<Navigate to="dashboard" />} />
              </Routes>
            </ProtectedRoute>
          } />

          {/* Student Routes */}
          <Route path="/student/*" element={
            <ProtectedRoute roles={['student']}>
              <Routes>
                <Route path="dashboard" element={<StudentDashboard />} />
                <Route path="*" element={<Navigate to="dashboard" />} />
              </Routes>
            </ProtectedRoute>
          } />
        </Routes>
      </main>
      <footer className="py-8 text-center text-slate-400 text-sm border-t border-slate-100 bg-white">
        © 2026 Pt. Mahaveer Prasad Tripathi PG College. All rights reserved.
      </footer>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;