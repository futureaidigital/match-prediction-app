import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireSubscription?: boolean;
}

/**
 * ProtectedRoute wrapper component
 *
 * Protects routes that require authentication and optionally subscription access.
 *
 * @param children - The child components to render if access is granted
 * @param requireSubscription - Whether to check for active subscription (default: false)
 */
export function ProtectedRoute({
  children,
  requireSubscription = false
}: ProtectedRouteProps) {
  const { isAuthenticated, hasAccess } = useAuth();

  // Check if user is authenticated
  if (!isAuthenticated) {
    // Redirect to login page if not authenticated
    return <Navigate to="/login" replace />;
  }

  // Check if subscription is required and user has access
  if (requireSubscription && !hasAccess()) {
    // Redirect to subscription page if no active subscription
    return <Navigate to="/subscribe" replace />;
  }

  // User is authenticated (and has subscription if required)
  return <>{children}</>;
}
