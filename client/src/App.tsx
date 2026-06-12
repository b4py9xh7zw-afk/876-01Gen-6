import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ChildDashboard from './pages/child/ChildDashboard';
import LevelPlay from './pages/child/LevelPlay';
import ParentDashboard from './pages/parent/ParentDashboard';
import ChildProgress from './pages/parent/ChildProgress';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import ClassDetail from './pages/teacher/ClassDetail';
import ClassAnalytics from './pages/teacher/ClassAnalytics';
import CreateLevel from './pages/teacher/CreateLevel';
import Layout from './components/Layout';

function PrivateRoute({ children, allowedRoles }: { children: JSX.Element; allowedRoles?: string[] }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const redirectMap: Record<string, string> = {
      child: '/child',
      parent: '/parent',
      teacher: '/teacher',
    };
    return <Navigate to={redirectMap[user.role] || '/login'} replace />;
  }

  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route path="/child" element={
        <PrivateRoute allowedRoles={['child']}>
          <Layout><ChildDashboard /></Layout>
        </PrivateRoute>
      } />
      <Route path="/child/level/:id" element={
        <PrivateRoute allowedRoles={['child']}>
          <Layout><LevelPlay /></Layout>
        </PrivateRoute>
      } />

      <Route path="/parent" element={
        <PrivateRoute allowedRoles={['parent']}>
          <Layout><ParentDashboard /></Layout>
        </PrivateRoute>
      } />
      <Route path="/parent/child/:id" element={
        <PrivateRoute allowedRoles={['parent']}>
          <Layout><ChildProgress /></Layout>
        </PrivateRoute>
      } />

      <Route path="/teacher" element={
        <PrivateRoute allowedRoles={['teacher']}>
          <Layout><TeacherDashboard /></Layout>
        </PrivateRoute>
      } />
      <Route path="/teacher/class/:id" element={
        <PrivateRoute allowedRoles={['teacher']}>
          <Layout><ClassDetail /></Layout>
        </PrivateRoute>
      } />
      <Route path="/teacher/class/:id/analytics" element={
        <PrivateRoute allowedRoles={['teacher']}>
          <Layout><ClassAnalytics /></Layout>
        </PrivateRoute>
      } />
      <Route path="/teacher/create-level" element={
        <PrivateRoute allowedRoles={['teacher']}>
          <Layout><CreateLevel /></Layout>
        </PrivateRoute>
      } />

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
