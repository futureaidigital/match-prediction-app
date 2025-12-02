import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api, User, SubscriptionStatus, LoginRequest, RegisterRequest, ApiError } from '../services/api';

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
      console.log('🔐 Initializing auth...');
      const token = api.getToken();
      console.log('🔑 Token exists:', !!token);

      if (!token) {
        console.log('🔑 No token found, auto-logging in with premium user...');
        try {
          const response = await api.login({
            email: 'premium@fourthofficial.ai',
            password: 'TestPassword123!'
          });
          if (response.success) {
            api.setToken(response.data.access_token);
            localStorage.setItem('refresh_token', response.data.refresh_token);
            setUser(response.data.user);
            // Set demo premium flag for hasAccess check
            localStorage.setItem('demo_premium', 'true');
            console.log('✅ Auto-logged in as premium user');
          }
        } catch (err) {
          console.log('⚠️ Auto-login failed, continuing as guest', err);
        }
        setIsLoading(false);
        return;
      }

      try {
        console.log('📡 Fetching current user...');
        // Try to fetch current user with existing token
        const response = await api.getCurrentUser();
        console.log('📦 User response:', response);

        if (response.success && response.data) {
          // Type is now correctly ApiResponse<User>, data is User directly
          console.log('✅ User fetched:', response.data.email);
          setUser(response.data);

          // Don't fetch subscription status during initialization - do it separately if needed
        } else {
          console.log('❌ Invalid user response structure');
          throw new Error('Invalid user response');
        }
      } catch (err) {
        console.log('⚠️ Failed to fetch user, attempting token refresh...', err);
        // Token might be expired, try to refresh
        try {
          await refreshToken();
        } catch (refreshErr) {
          console.log('❌ Refresh failed, clearing auth state', refreshErr);
          // Refresh failed, clear auth state
          api.setToken(null);
          setUser(null);
          setSubscriptionStatus(null);
        }
      } finally {
        console.log('✅ Auth initialization complete');
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // ==================== Helper Functions ====================

  const handleApiError = (err: unknown) => {
    const apiError = err as ApiError;
    if (apiError.error?.message) {
      setError(apiError.error.message);
    } else {
      setError('An unexpected error occurred');
    }
  };

  const fetchSubscriptionStatus = async () => {
    try {
      console.log('Fetching subscription status...');
      const response = await api.getSubscriptionStatus();
      console.log('Subscription status response:', response);

      if (response.success) {
        setSubscriptionStatus(response.data);
        setSubscriptionError(null); // Clear any previous errors
        console.log('✅ Subscription status set:', response.data);
      } else {
        // API returned success:false, log the errors
        const errorMessage = (response as any).errors || 'Failed to load subscription status';
        console.error('⚠️ Subscription API returned error:', errorMessage);

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
      console.error('❌ Failed to fetch subscription status (exception):', err);

      // SECURITY: Deny access by default on error
      // This prevents users from getting free access during API downtime or network issues
      setSubscriptionStatus({
        has_access: false,
        access_type: null,
        access_expires_at: null,
        provider: null
      });

      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setSubscriptionError(`Subscription check failed: ${errorMessage}`);

      // Log to error tracking service (e.g., Sentry, LogRocket)
      // TODO: Add error tracking integration
      console.error('Subscription fetch error details:', {
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
        // Set the token first
        api.setToken(response.data.access_token);
        localStorage.setItem('refresh_token', response.data.refresh_token);

        // Set the user
        setUser(response.data.user);

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
