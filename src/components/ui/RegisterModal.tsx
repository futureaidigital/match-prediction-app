import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

const COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'ES', name: 'Spain' },
  { code: 'IT', name: 'Italy' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'BR', name: 'Brazil' },
  { code: 'MX', name: 'Mexico' },
  { code: 'AR', name: 'Argentina' },
  { code: 'IN', name: 'India' },
  { code: 'JP', name: 'Japan' },
  { code: 'CN', name: 'China' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'EG', name: 'Egypt' },
];

export function RegisterModal({ isOpen, onClose, onSwitchToLogin }: RegisterModalProps) {
  const { register, error: authError } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setFullName('');
      setEmail('');
      setCountry('');
      setPassword('');
      setConfirmPassword('');
      setError(null);
      setShowPassword(false);
      setShowConfirmPassword(false);
      setAgreedToTerms(false);
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

    // Validation
    if (!fullName.trim()) {
      setError('Please enter your full name');
      return;
    }

    if (!country) {
      setError('Please select your country');
      return;
    }

    // Password validation
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (!/[A-Z]/.test(password)) {
      setError('Password must contain at least one uppercase letter');
      return;
    }

    if (!/[a-z]/.test(password)) {
      setError('Password must contain at least one lowercase letter');
      return;
    }

    if (!/[0-9]/.test(password)) {
      setError('Password must contain at least one number');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!agreedToTerms) {
      setError('Please agree to the terms and conditions');
      return;
    }

    setIsLoading(true);

    try {
      await register({ email, password, name: fullName, country });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    onClose();
  };

  const handleLogin = () => {
    onClose();
    onSwitchToLogin();
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div
          className="relative w-full max-w-[358px] md:max-w-[500px] bg-white rounded-[16px] md:rounded-[20px] border border-[#e1e4eb] shadow-[0_10px_30px_rgba(0,0,0,0.1)] my-4"
          style={{ fontFamily: 'Montserrat, sans-serif' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with Title, Back and Close - Aligned */}
          <div className="relative flex items-center justify-center p-4 md:px-[60px] md:pt-[50px] md:pb-0">
            {/* Back Button - Absolute Left */}
            <button
              onClick={handleBack}
              className="absolute left-4 md:left-[60px] flex items-center gap-1 text-[#0a0a0a] text-[14px] font-medium hover:opacity-70 transition-opacity"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Back
            </button>

            {/* Title - Centered */}
            <h2 className="text-[18px] md:text-[22px] font-semibold text-[#0a0a0a] leading-[130%]">
              Create an account
            </h2>

            {/* Close Button - Absolute Right */}
            <button
              onClick={onClose}
              className="absolute right-4 md:right-[60px] w-6 h-6 flex items-center justify-center text-[#7c8a9c] hover:text-[#0a0a0a] transition-colors"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="px-4 pb-4 md:px-[60px] md:pb-[50px] pt-5 md:pt-[30px]">
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">

              {/* Form Fields */}
              <div className="flex flex-col gap-5">
                {/* Full Name Field */}
                <div className="flex flex-col gap-2 md:gap-3">
                  <label className="text-[14px] font-normal text-[#0a0a0a] leading-[140%]">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="h-[48px] px-4 bg-white border border-[#0a0a0a] rounded-[8px] text-[14px] font-medium text-[#0a0a0a] placeholder:text-[#7c8a9c] outline-none focus:border-[#0d1a67] transition-colors"
                    required
                  />
                </div>

                {/* Email Field */}
                <div className="flex flex-col gap-2 md:gap-3">
                  <label className="text-[14px] font-normal text-[#0a0a0a] leading-[140%]">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="h-[48px] px-4 bg-white border border-[#0a0a0a] rounded-[8px] text-[14px] font-medium text-[#0a0a0a] placeholder:text-[#7c8a9c] outline-none focus:border-[#0d1a67] transition-colors"
                    required
                  />
                </div>

                {/* Country Dropdown */}
                <div className="flex flex-col gap-2 md:gap-3">
                  <label className="text-[14px] font-normal text-[#0a0a0a] leading-[140%]">
                    Country
                  </label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="h-[48px] px-4 bg-white border border-[#0a0a0a] rounded-[8px] text-[14px] font-medium text-[#0a0a0a] outline-none focus:border-[#0d1a67] transition-colors appearance-none cursor-pointer"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%230a0a0a' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 16px center',
                    }}
                    required
                  >
                    <option value="" disabled>Select your country</option>
                    {COUNTRIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.name}
                      </option>
                    ))}
                  </select>
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
                  <p className="text-[11px] text-[#7c8a9c] leading-[140%]">
                    Must be at least 8 characters with uppercase, lowercase, and number
                  </p>
                </div>

                {/* Confirm Password Field */}
                <div className="flex flex-col gap-2">
                  <label className="text-[14px] font-normal text-[#0a0a0a] leading-[140%]">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full h-[48px] px-4 pr-12 bg-white border border-[#7c8a9c] rounded-[8px] text-[14px] font-normal text-[#0a0a0a] placeholder:text-[#7c8a9c] outline-none focus:border-[#0a0a0a] transition-colors"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#7c8a9c] hover:text-[#0a0a0a] transition-colors"
                    >
                      {showConfirmPassword ? (
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
                </div>

                {/* Terms Checkbox */}
                <label className="flex items-start gap-3 cursor-pointer">
                  <div className="relative mt-0.5">
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 border-2 rounded transition-colors ${
                      agreedToTerms
                        ? 'bg-[#0d1a67] border-[#0d1a67]'
                        : 'bg-white border-[#7c8a9c]'
                    }`}>
                      {agreedToTerms && (
                        <svg className="w-full h-full text-white p-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="text-[12px] md:text-[14px] text-[#0a0a0a] leading-[150%]">
                    I agree to the{' '}
                    <a href="/terms" className="text-[#0d1a67] underline hover:no-underline">
                      User Agreement
                    </a>
                    {' '}& confirm I am at least 18 years old
                  </span>
                </label>
              </div>

              {/* Error Message */}
              {error && (
                <div className="text-red-500 text-[14px] text-center">
                  {error}
                </div>
              )}

              {/* Buttons */}
              <div className="flex flex-col items-center gap-3">
                {/* Proceed to Payment Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-[40px] bg-[#0d1a67] text-white text-[14px] font-medium rounded-[10px] hover:bg-[#0a1452] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Processing...' : 'Proceed to Payment'}
                </button>

                {/* Login Link */}
                <div className="flex items-center gap-2 text-[14px] mt-2">
                  <span className="text-[#7c8a9c] font-medium">Already Have An Account?</span>
                  <button
                    type="button"
                    onClick={handleLogin}
                    className="text-[#0a0a0a] font-medium hover:underline"
                  >
                    Log In
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
