import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SignUp } from './pages/SignUp';
import { SignIn } from './pages/SignIn';
import { AdminDashboard } from './components/AdminDashboard';
import { UserDashboard } from './components/UserDashboard';
import { ProtectedRoute } from './components/ProtectedRoute';

/**
 * App Component - Main Application Router
 *
 * This component sets up the routing structure for the entire application:
 *
 * Route Structure:
 * - / (root) - Redirects to /signin
 * - /signup - Public route for user registration with role selection
 * - /signin - Public route for authentication
 * - /admin - Protected route (Admin role only) - Event management, certificate generation
 * - /dashboard - Protected route (User role only) - View certificates, verify authenticity
 *
 * Authentication Flow:
 * 1. Users sign up and select their role (admin or user)
 * 2. After authentication, users are redirected based on role
 * 3. Protected routes check authentication and role before rendering
 * 4. Unauthorized access attempts redirect to appropriate dashboard
 */
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Default route - redirect to sign in */}
          <Route path="/" element={<Navigate to="/signin" replace />} />

          {/* Public authentication routes */}
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signin" element={<SignIn />} />

          {/* Protected Admin route - requires 'admin' role */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Protected User route - requires 'user' role */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute requiredRole="user">
                <UserDashboard />
              </ProtectedRoute>
            }
          />

          {/* Catch-all route - redirect to sign in */}
          <Route path="*" element={<Navigate to="/signin" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
