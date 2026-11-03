import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../app/providers/AuthContext';
import { Role } from '../../types';

export interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[] | string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, isLoading, role } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && role) {
    const normalizedRole = role.startsWith('ROLE_') ? role : `ROLE_${role}`;
    const normalizedAllowed = allowedRoles.map((r) => (r.startsWith('ROLE_') ? r : `ROLE_${r}`));
    if (!normalizedAllowed.includes(normalizedRole)) {
      return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mb-4 text-2xl font-bold">
            !
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Access Denied</h2>
          <p className="text-slate-600 max-w-md mb-6">
            You do not have permission to access this page with your current role ({role}).
          </p>
          <Navigate to="/" replace />
        </div>
      );
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
