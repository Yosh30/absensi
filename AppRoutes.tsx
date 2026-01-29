import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ROUTES } from './constants/routes';
import { UserRole } from './types';
import { useApp } from './App';

// Importing Pages
import { HomePage } from './pages/HomePage';
import { SchedulePage } from './pages/SchedulePage';
import { AnnouncementPage } from './pages/AnnouncementPage';
import { AdminPage } from './pages/AdminPage';
import { AdminMemberManagementPage } from './pages/AdminMemberManagementPage';
import { AttendanceRecapPage } from './pages/AttendanceRecapPage';
import { ProfilePage } from './pages/ProfilePage';
import { CalendarPage } from './pages/CalendarPage';
import { MonthlyAttendancePage } from './pages/MonthlyAttendancePage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

// Wrapper for pages that require authentication (Dashboard, etc.)
const PrivateRoute = ({ children }: { children: React.ReactElement }) => {
  const { state } = useApp();
  // If not logged in, redirect to Login
  return state.currentUser ? children : <Navigate to={ROUTES.LOGIN} replace />;
};

// Wrapper for pages that are ONLY for guests (Login, Signup)
const PublicRoute = ({ children }: { children: React.ReactElement }) => {
  const { state } = useApp();
  // If already logged in, redirect to Home
  return !state.currentUser ? children : <Navigate to={ROUTES.HOME} replace />;
};

export const AppRoutes = () => {
  const { state } = useApp();
  const isAdmin = state.currentUser?.role === UserRole.ADMIN;

  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Default Redirect */}
        <Route path="/" element={<Navigate to={state.currentUser ? ROUTES.HOME : ROUTES.LOGIN} replace />} />
        
        {/* Public Routes (Accessible only when logged out) */}
        <Route path={ROUTES.LOGIN} element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path={ROUTES.SIGNUP} element={<PublicRoute><SignupPage /></PublicRoute>} />
        
        {/* Private Routes (Accessible only when logged in) */}
        <Route path={ROUTES.HOME} element={<PrivateRoute><HomePage /></PrivateRoute>} />
        <Route path={ROUTES.SCHEDULE} element={<PrivateRoute><SchedulePage /></PrivateRoute>} />
        <Route path={ROUTES.ANNOUNCEMENTS} element={<PrivateRoute><AnnouncementPage /></PrivateRoute>} />
        <Route path={ROUTES.PROFILE} element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
        <Route path={ROUTES.PROFILE_ATTENDANCE} element={<PrivateRoute><MonthlyAttendancePage /></PrivateRoute>} />
        <Route path={ROUTES.CALENDAR} element={<PrivateRoute><CalendarPage /></PrivateRoute>} />
        
        {/* Admin Specific Routes */}
        {isAdmin && (
          <>
            <Route path={ROUTES.ADMIN} element={<PrivateRoute><AdminPage /></PrivateRoute>} />
            <Route path={ROUTES.ADMIN_MEMBERS} element={<PrivateRoute><AdminMemberManagementPage /></PrivateRoute>} />
            <Route path={ROUTES.ADMIN_RECAP} element={<PrivateRoute><AttendanceRecapPage /></PrivateRoute>} />
          </>
        )}

        {/* Catch All */}
        <Route path="*" element={<Navigate to={state.currentUser ? ROUTES.HOME : ROUTES.LOGIN} replace />} />
      </Routes>
    </>
  );
};