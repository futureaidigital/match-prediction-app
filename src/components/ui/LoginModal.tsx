import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister?: () => void;
}

export function LoginModal({ isOpen, onClose, onSwitchToRegister }: LoginModalProps) {
  const navigate = useNavigate();
  const { login, error: authError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setEmail('');
      setPassword('');
      setError(null);
      setShowPassword(false);
    }
  }, [isOpen]);

  // Update error from auth context
  useEffect(() => {
    if (authError) {
      setError(authError);
    }
  }, [authError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login({ email, password });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAccount = () => {
    if (onSwitchToRegister) {
      onSwitchToRegister();
    } else {
      onClose();
      navigate('/register');
    }
  };

  const handleForgotPassword = () => {
    onClose();
    navigate('/forgot-password');
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="relative w-full max-w-[358px] md:max-w-[500px] bg-white rounded-[16px] md:rounded-[20px] border border-[#e1e4eb] shadow-[0_10px_30px_rgba(0,0,0,0.1)]"
          style={{ fontFamily: 'Montserrat, sans-serif' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Mobile: Close button at top right */}
          <div className="md:hidden flex justify-end p-4 pb-0">
            <button
              onClick={onClose}
              className="w-6 h-6 flex items-center justify-center text-[#7c8a9c] hover:text-[#0a0a0a] transition-colors"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Desktop: Close button positioned absolute */}
          <button
            onClick={onClose}
            className="hidden md:flex absolute top-[50px] right-[60px] w-6 h-6 items-center justify-center text-[#7c8a9c] hover:text-[#0a0a0a] transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          {/* Content */}
          <div className="px-4 pb-4 md:px-[60px] md:py-[50px]">
            <form onSubmit={handleSubmit} className="flex flex-col gap-5 md:gap-[30px]">
              {/* Title */}
              <h2 className="text-[18px] md:text-[22px] font-semibold text-[#0a0a0a] leading-[130%]">
                Login to your account
              </h2>

              {/* Form Fields */}
              <div className="flex flex-col gap-5 md:gap-5">
                {/* Email Field */}
                <div className="flex flex-col gap-3">
                  <label className="text-[14px] font-normal text-[#0a0a0a] leading-[140%]">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="h-[48px] px-4 bg-white border border-[#7c8a9c] rounded-[8px] text-[14px] font-medium text-[#0a0a0a] placeholder:text-[#7c8a9c] outline-none focus:border-[#0a0a0a] transition-colors"
                    required
                  />
                </div>

                {/* Password Field */}
                <div className="flex flex-col gap-2">
                  <label className="text-[14px] font-normal text-[#0a0a0a] leading-[140%]">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full h-[48px] px-4 pr-12 bg-white border border-[#7c8a9c] rounded-[8px] text-[14px] font-normal text-[#0a0a0a] placeholder:text-[#7c8a9c] outline-none focus:border-[#0a0a0a] transition-colors"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#7c8a9c] hover:text-[#0a0a0a] transition-colors"
                    >
                      {showPassword ? (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      ) : (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      )}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="self-end text-[14px] font-medium text-[#0a0a0a] hover:underline"
                  >
                    Forgot Password ?
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="text-red-500 text-[14px] text-center">
                  {error}
                </div>
              )}

              {/* Login Button & Create Account */}
              <div className="flex flex-col items-center gap-5">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-[40px] md:h-[40px] bg-[#0d1a67] text-white text-[14px] font-medium rounded-[10px] hover:bg-[#0a1452] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Logging in...' : 'Login'}
                </button>

                <div className="flex items-center gap-2 text-[14px]">
                  <span className="text-[#7c8a9c] font-medium">Don't have an account ?</span>
                  <button
                    type="button"
                    onClick={handleCreateAccount}
                    className="text-[#0a0a0a] font-medium hover:underline"
                  >
                    Create Account
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
