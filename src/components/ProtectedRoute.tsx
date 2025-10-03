import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

/**
 * ProtectedRoute Component
 *
 * This component implements role-based access control for routes:
 * - Checks if user is authenticated
 * - Validates user role if requiredRole is specified
 * - Redirects unauthenticated users to sign-in page
 * - Redirects users without proper role to their appropriate dashboard
 *
 * Usage:
 *   <ProtectedRoute requiredRole="admin">
 *     <AdminDashboard />
 *   </ProtectedRoute>
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to sign-in if user is not authenticated
  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  // Check role-based access if requiredRole is specified
  if (requiredRole && user.role !== requiredRole) {
    // Redirect to appropriate dashboard based on user's actual role
    const redirectPath = user.role === 'admin' ? '/admin' : '/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  // User is authenticated and has proper role, render children
  return <>{children}</>;
};
