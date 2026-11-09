import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import ProtectedRoute from '../../components/common/ProtectedRoute';

// Public pages
import LandingPage from '../../features/public-jobs/LandingPage';
import JobListingPage from '../../features/public-jobs/JobListingPage';
import JobDetailPage from '../../features/public-jobs/JobDetailPage';
import LoginPage from '../../features/auth/LoginPage';
import RegisterPage from '../../features/auth/RegisterPage';

// Candidate pages
import CandidateDashboard from '../../features/candidate/CandidateDashboard';
import CandidateProfilePage from '../../features/candidate/CandidateProfilePage';
import CandidateApplicationsPage from '../../features/candidate/CandidateApplicationsPage';
import CandidateInterviewsPage from '../../features/candidate/CandidateInterviewsPage';
import CandidateOffersPage from '../../features/candidate/CandidateOffersPage';

// Recruiter pages
import RecruiterDashboard from '../../features/recruiter/RecruiterDashboard';
import RecruiterJobsPage from '../../features/recruiter/RecruiterJobsPage';
import RecruiterApplicationsPage from '../../features/recruiter/RecruiterApplicationsPage';
import RecruiterInterviewsPage from '../../features/recruiter/RecruiterInterviewsPage';
import RecruiterOffersPage from '../../features/recruiter/RecruiterOffersPage';
import RecruiterTalentPoolPage from '../../features/recruiter/RecruiterTalentPoolPage';
import RecruiterCompanyProfilePage from '../../features/recruiter/RecruiterCompanyProfilePage';

// Admin pages
import AdminDashboard from '../../features/admin/AdminDashboard';
import AdminCompaniesPage from '../../features/admin/AdminCompaniesPage';
import AdminAuditLogsPage from '../../features/admin/AdminAuditLogsPage';

// Notifications
import NotificationsPage from '../../features/notifications/NotificationsPage';

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/jobs" element={<JobListingPage />} />
        <Route path="/jobs/:id" element={<JobDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/auth/login" element={<Navigate to="/login" replace />} />
        <Route path="/auth/register" element={<Navigate to="/register" replace />} />

        {/* Candidate Protected Routes */}
        <Route
          path="/candidate/dashboard"
          element={
            <ProtectedRoute allowedRoles={['ROLE_CANDIDATE']}>
              <CandidateDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/candidate/profile"
          element={
            <ProtectedRoute allowedRoles={['ROLE_CANDIDATE']}>
              <CandidateProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/candidate/applications"
          element={
            <ProtectedRoute allowedRoles={['ROLE_CANDIDATE']}>
              <CandidateApplicationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/candidate/interviews"
          element={
            <ProtectedRoute allowedRoles={['ROLE_CANDIDATE']}>
              <CandidateInterviewsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/candidate/offers"
          element={
            <ProtectedRoute allowedRoles={['ROLE_CANDIDATE']}>
              <CandidateOffersPage />
            </ProtectedRoute>
          }
        />

        {/* Recruiter Protected Routes */}
        <Route
          path="/recruiter/dashboard"
          element={
            <ProtectedRoute allowedRoles={['ROLE_RECRUITER']}>
              <RecruiterDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/recruiter/jobs"
          element={
            <ProtectedRoute allowedRoles={['ROLE_RECRUITER']}>
              <RecruiterJobsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/recruiter/applications"
          element={
            <ProtectedRoute allowedRoles={['ROLE_RECRUITER']}>
              <RecruiterApplicationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/recruiter/interviews"
          element={
            <ProtectedRoute allowedRoles={['ROLE_RECRUITER']}>
              <RecruiterInterviewsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/recruiter/offers"
          element={
            <ProtectedRoute allowedRoles={['ROLE_RECRUITER']}>
              <RecruiterOffersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/recruiter/talent-pool"
          element={
            <ProtectedRoute allowedRoles={['ROLE_RECRUITER']}>
              <RecruiterTalentPoolPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/recruiter/company"
          element={
            <ProtectedRoute allowedRoles={['ROLE_RECRUITER']}>
              <RecruiterCompanyProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Admin Protected Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/companies"
          element={
            <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
              <AdminCompaniesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/audit-logs"
          element={
            <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
              <AdminAuditLogsPage />
            </ProtectedRoute>
          }
        />

        {/* Shared Authenticated Routes */}
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
