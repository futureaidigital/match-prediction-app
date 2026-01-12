import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LoginModal } from '@/components/ui/LoginModal';
import { RegisterModal } from '@/components/ui/RegisterModal';

interface HeaderProps {
  onNavigate?: (page: string) => void;
  currentPage?: string;
}

export function Header({ onNavigate, currentPage = '' }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMenuAnimating, setIsMenuAnimating] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  // Handle menu open/close with animation
  const openMenu = () => {
    setIsMenuOpen(true);
    // Small delay to trigger animation after mount
    requestAnimationFrame(() => {
      setIsMenuAnimating(true);
    });
  };

  const closeMenu = () => {
    setIsMenuAnimating(false);
    // Wait for animation to complete before unmounting
    setTimeout(() => {
      setIsMenuOpen(false);
    }, 300);
  };

  const navItems = [
    { id: 'matches', label: 'Matches', path: '/matches' },
    { id: 'players', label: 'Players', path: '/players' },
    { id: 'league', label: 'League', path: '/league' },
    { id: 'smart-combo', label: 'Smart Combo', path: '/smart-combo' },
    { id: 'pricing', label: 'Pricing', path: '/pricing' },
  ];

  const mobileNavItems = [
    { id: 'matches', label: 'Matches', path: '/matches' },
    { id: 'players', label: 'Players', path: '/players' },
    { id: 'league', label: 'League', path: '/league' },
    { id: 'smart-combo', label: 'Smart Combo', path: '/smart-combo' },
    { id: 'pricing', label: 'Pricing', path: '/pricing' },
    ...(isAuthenticated
      ? [{ id: 'logout', label: 'Log out', path: '' }]
      : [
          { id: 'register', label: 'Register', path: '' },
          { id: 'login', label: 'Login', path: '' },
        ]
    ),
  ];

  const handleNavigation = (item: { id: string; path: string }) => {
    // Handle login specially - show modal instead of navigating
    if (item.id === 'login') {
      setShowLoginModal(true);
      return;
    }

    // Handle register specially - navigate to pricing page
    if (item.id === 'register') {
      navigate('/pricing');
      return;
    }

    // Handle logout
    if (item.id === 'logout') {
      logout();
      return;
    }

    if (onNavigate) {
      onNavigate(item.id);
    } else {
      navigate(item.path);
    }
  };

  // Switch from login to register modal
  const handleSwitchToRegister = () => {
    setShowLoginModal(false);
    setShowRegisterModal(true);
  };

  // Switch from register to login modal
  const handleSwitchToLogin = () => {
    setShowRegisterModal(false);
    setShowLoginModal(true);
  };

  return (
    <>
      <header className="w-full bg-[#0d1a67] relative z-50">
        <div className="w-full max-w-[100vw] md:max-w-[1440px] mx-auto px-4 md:px-6 py-3 flex items-center justify-between box-border">
          {/* Left side: Hamburger + Logo (mobile) / Logo only (desktop) */}
          <div className="flex items-center gap-4">
            {/* Mobile: Hamburger/Close Menu Button */}
            <button
              onClick={isMenuOpen ? closeMenu : openMenu}
              className="md:hidden relative w-10 h-10 flex items-center justify-center"
            >
              {/* Hamburger Icon */}
              <div className={`absolute transition-all duration-300 ${isMenuAnimating ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'}`}>
                <img src="/hamburger.svg" alt="Menu" className="w-10 h-10" />
              </div>
              {/* X Icon */}
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                className={`absolute transition-all duration-300 ${isMenuAnimating ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'}`}
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            {/* Logo - left aligned on both mobile and desktop */}
            <button onClick={() => navigate('/')} className="flex items-center">
              <img src="/logo.svg" alt="Fourth Official" className="h-8 md:h-10" />
            </button>
          </div>

          {/* Desktop: Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigation(item)}
                className={`text-sm font-medium transition-colors ${
                  currentPage === item.id
                    ? 'text-white'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            {/* Search */}
            <button className="w-10 h-10 flex items-center justify-center hover:opacity-80 transition-opacity">
              <img src="/search.svg" alt="Search" className="w-10 h-10" />
            </button>

            {isAuthenticated ? (
              <>
                {/* Desktop: Logged in state */}
                <span className="hidden md:block text-white text-sm font-medium">
                  Logged in as: {user?.email}
                </span>
                <button
                  onClick={logout}
                  className="hidden md:block px-5 py-2 bg-white text-[#091143] text-sm font-semibold rounded-lg hover:bg-white/90 transition-colors"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                {/* Desktop: Register Button */}
                <button
                  onClick={() => navigate('/pricing')}
                  className="hidden md:block px-5 py-2 border border-white text-white text-sm font-semibold rounded-lg hover:bg-white/10 transition-colors"
                >
                  Register
                </button>

                {/* Desktop: Login Button */}
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="hidden md:block px-5 py-2 bg-white text-[#091143] text-sm font-semibold rounded-lg hover:bg-white/90 transition-colors"
                >
                  Login
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Menu - Slides out below header */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 pt-[64px]">
          {/* Backdrop */}
          <div
            className={`absolute inset-0 bg-black transition-opacity duration-300 ${
              isMenuAnimating ? 'opacity-50' : 'opacity-0'
            }`}
            onClick={closeMenu}
          />

          {/* Menu Panel - Slides from left, starts below header */}
          <div
            className={`absolute top-[64px] bottom-0 left-0 w-full flex flex-col transform transition-transform duration-300 ease-out ${
              isMenuAnimating ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            {/* Menu Content */}
            <div className="flex-1 bg-white px-6 py-4 overflow-y-auto">
              {/* Show logged in email on mobile */}
              {isAuthenticated && user?.email && (
                <div className="py-4 border-b border-gray-200 text-sm text-gray-600">
                  Logged in as: {user.email}
                </div>
              )}
              <nav className="flex flex-col">
                {mobileNavItems.map((item, index) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      handleNavigation(item);
                      closeMenu();
                    }}
                    className={`py-5 text-left text-xl font-semibold text-gray-800 ${
                      index < mobileNavItems.length - 1 ? 'border-b border-gray-200' : ''
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Menu Footer */}
            <div className="bg-[#0d1a67] px-6 py-4">
              <div className="text-center text-white/70 text-sm">
                © 2025 Sports Predictions Platform. All rights reserved.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSwitchToRegister={handleSwitchToRegister}
      />

      {/* Register Modal */}
      <RegisterModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onSwitchToLogin={handleSwitchToLogin}
      />
    </>
  );
}
