import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api, User, SubscriptionStatus, LoginRequest, RegisterRequest } from '../services/api';
import { ApiError } from '@/lib/queryHelpers';
import { devLog } from '@/config/env';
import { TEST_CREDENTIALS } from '@/config/defaults';

// ==================== Types ====================

interface AuthContextType {
  // State
  user: User | null;
  subscriptionStatus: SubscriptionStatus | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  subscriptionError: string | null;

  // Auth methods
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;

  // User methods
  updateProfile: (data: { name?: string; country?: string }) => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;

  // Subscription methods
  refreshSubscriptionStatus: () => Promise<void>;
  hasAccess: () => boolean;

  // Utility methods
  clearError: () => void;
}

// ==================== Context ====================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ==================== Provider ====================

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscriptionError, setSubscriptionError] = useState<string | null>(null);

  // Check if user is authenticated
  const isAuthenticated = !!user && !!api.getToken();

  // ==================== Initialize Auth State ====================

  useEffect(() => {
    const initializeAuth = async () => {
      devLog.log('Initializing auth...');
      const token = api.getToken();
      const wasLoggedOut = localStorage.getItem('logged_out') === 'true';
      devLog.log('Token exists:', !!token, 'Was logged out:', wasLoggedOut);

      if (!token) {
        // Only auto-login if user hasn't explicitly logged out
        if (!wasLoggedOut) {
          devLog.log('No token found, auto-logging in with premium user...');
          try {
            const response = await api.login(TEST_CREDENTIALS.PREMIUM);
            if (response.success) {
              api.setToken(response.data.access_token);
              localStorage.setItem('refresh_token', response.data.refresh_token);
              setUser(response.data.user);
              // Set demo premium flag for hasAccess check
              localStorage.setItem('demo_premium', 'true');
              devLog.log('Auto-logged in as premium user');
            }
          } catch (err) {
            devLog.warn('Auto-login failed, continuing as guest', err);
          }
        } else {
          devLog.log('User previously logged out, not auto-logging in');
        }
        setIsLoading(false);
        return;
      }

      try {
        devLog.log('Fetching current user...');
        // Try to fetch current user with existing token
        const response = await api.getCurrentUser();
        devLog.log('User response:', response);

        if (response.success && response.data) {
          devLog.log('User fetched:', response.data.email);
          setUser(response.data);
        } else {
          devLog.error('Invalid user response structure');
          throw new Error('Invalid user response');
        }
      } catch (err) {
        devLog.warn('Failed to fetch user, attempting token refresh...', err);
        // Token might be expired, try to refresh
        try {
          await refreshToken();
        } catch (refreshErr) {
          devLog.error('Refresh failed, clearing auth state', refreshErr);
          // Refresh failed, clear auth state
          api.setToken(null);
          setUser(null);
          setSubscriptionStatus(null);
        }
      } finally {
        devLog.log('Auth initialization complete');
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Fetch subscription status when user is authenticated
  useEffect(() => {
    if (user && api.getToken()) {
      fetchSubscriptionStatus();
    }
  }, [user]);

  // ==================== Helper Functions ====================

  const handleApiError = (err: unknown) => {
    if (err instanceof ApiError) {
      setError(err.message);
    } else if (err instanceof Error) {
      setError(err.message);
    } else {
      setError('An unexpected error occurred');
    }
  };

  const fetchSubscriptionStatus = async () => {
    try {
      devLog.log('Fetching subscription status...');
      const response = await api.getSubscriptionStatus();
      devLog.log('Subscription status response:', response);

      if (response.success) {
        setSubscriptionStatus(response.data);
        setSubscriptionError(null);
        devLog.log('Subscription status set:', response.data);
      } else {
        const errorMessage = (response as { errors?: string }).errors || 'Failed to load subscription status';
        devLog.error('Subscription API returned error:', errorMessage);

        // SECURITY: Deny access by default when subscription check fails
        setSubscriptionStatus({
          has_access: false,
          access_type: null,
          access_expires_at: null,
          provider: null
        });
        setSubscriptionError('Unable to verify subscription status. Please try again later.');
      }
    } catch (err) {
      devLog.error('Failed to fetch subscription status:', err);

      // SECURITY: Deny access by default on error
      setSubscriptionStatus({
        has_access: false,
        access_type: null,
        access_expires_at: null,
        provider: null
      });

      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setSubscriptionError(`Subscription check failed: ${errorMessage}`);

      // Log error details for debugging
      devLog.error('Subscription fetch error details:', {
        error: err,
        timestamp: new Date().toISOString(),
        userId: user?.id,
      });
    }
  };

  // ==================== Auth Methods ====================

  const login = async (credentials: LoginRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.login(credentials);

      if (response.success) {
        // Clear logged_out flag since user is explicitly logging in
        localStorage.removeItem('logged_out');

        // Set the token first
        api.setToken(response.data.access_token);
        localStorage.setItem('refresh_token', response.data.refresh_token);

        // Set the user
        setUser(response.data.user);

        // Set demo_premium flag based on user email for test accounts
        if (response.data.user?.email?.includes('premium')) {
          localStorage.setItem('demo_premium', 'true');
        } else {
          localStorage.removeItem('demo_premium');
        }

        // Don't fetch subscription status during login - do it separately if needed
      }
    } catch (err) {
      handleApiError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.register(data);

      if (response.success) {
        // Clear logged_out flag since user is explicitly registering
        localStorage.removeItem('logged_out');

        // Set token first
        api.setToken(response.data.access_token);
        localStorage.setItem('refresh_token', response.data.refresh_token);

        // Set the user
        setUser(response.data.user);

        // Don't fetch subscription status during registration - do it separately if needed
      }
    } catch (err) {
      handleApiError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await api.logout();
    } catch (err) {
      console.error('Logout error:', err);
      // Continue with local logout even if API call fails
    } finally {
      // Clear all auth state
      api.setToken(null);
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('demo_premium');
      // Set flag to prevent auto-login on next page load
      localStorage.setItem('logged_out', 'true');
      setUser(null);
      setSubscriptionStatus(null);
      setIsLoading(false);
    }
  };

  const refreshToken = async () => {
    try {
      const response = await api.refreshToken();

      if (response.success) {
        // Set the new token
        api.setToken(response.data.access_token);
        localStorage.setItem('refresh_token', response.data.refresh_token);

        // Set the user
        setUser(response.data.user);

        // Don't fetch subscription status during token refresh - do it separately if needed
      }
    } catch (err) {
      handleApiError(err);
      throw err;
    }
  };

  // ==================== User Methods ====================

  const updateProfile = async (data: { name?: string; country?: string }) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.updateUserProfile(data);

      if (response.success) {
        setUser(response.data);
      }
    } catch (err) {
      handleApiError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updatePassword = async (currentPassword: string, newPassword: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await api.updatePassword(currentPassword, newPassword);
    } catch (err) {
      handleApiError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // ==================== Subscription Methods ====================

  const refreshSubscriptionStatus = async () => {
    await fetchSubscriptionStatus();
  };

  const hasAccess = (): boolean => {
    // Check for demo premium mode
    if (localStorage.getItem('demo_premium') === 'true') {
      return true;
    }

    if (!subscriptionStatus) return false;

    return subscriptionStatus.has_access;
  };

  // ==================== Utility Methods ====================

  const clearError = () => {
    setError(null);
    setSubscriptionError(null);
  };

  // ==================== Context Value ====================

  const value: AuthContextType = {
    // State
    user,
    subscriptionStatus,
    isAuthenticated,
    isLoading,
    error,
    subscriptionError,

    // Auth methods
    login,
    register,
    logout,
    refreshToken,

    // User methods
    updateProfile,
    updatePassword,

    // Subscription methods
    refreshSubscriptionStatus,
    hasAccess,

    // Utility methods
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// ==================== Hook ====================

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};

// Export context for advanced use cases
export default AuthContext;
