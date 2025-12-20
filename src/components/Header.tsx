import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  onNavigate?: (page: string) => void;
  currentPage?: string;
}

export function Header({ onNavigate, currentPage = '' }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const navItems = [
    { id: 'matches', label: 'Matches', path: '/matches' },
    { id: 'players', label: 'Players', path: '/players' },
    { id: 'league', label: 'League', path: '/league' },
    { id: 'smart-combo', label: 'Smart Combo', path: '/smart-combo' },
    { id: 'fantasy-insights', label: 'Fantasy Insights', path: '/fantasy-insights' },
    { id: 'pricing', label: 'Pricing', path: '/pricing' },
  ];

  const mobileNavItems = [
    { id: 'matches', label: 'Matches', path: '/matches' },
    { id: 'players', label: 'Players', path: '/players' },
    { id: 'smart-combo', label: 'Smart Combo', path: '/smart-combo' },
    { id: 'fantasy-insights', label: 'Fantasy Insights', path: '/fantasy-insights' },
    { id: 'pricing', label: 'Pricing', path: '/pricing' },
    { id: 'login', label: 'Login', path: '/login' },
  ];

  const handleNavigation = (item: { id: string; path: string }) => {
    if (onNavigate) {
      onNavigate(item.id);
    } else {
      navigate(item.path);
    }
  };

  return (
    <>
      <header className="w-full bg-[#0d1a67]">
        <div className="w-full max-w-[100vw] md:max-w-7xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between box-border">
          {/* Mobile: Hamburger Menu */}
          <button
            onClick={() => setIsMenuOpen(true)}
            className="md:hidden p-1"
          >
            <img src="/Hamburger Menu.png" alt="Menu" className="w-6 h-6" />
          </button>

          {/* Desktop: Logo */}
          <button
            onClick={() => navigate('/')}
            className="hidden md:flex items-center gap-2"
          >
            <img src="/SPORTSPRED.png" alt="SportsPred" className="h-6" />
          </button>

          {/* Mobile: Center Logo */}
          <button onClick={() => navigate('/')} className="md:hidden">
            <img src="/SPORTSPRED.png" alt="SportsPred" className="h-6" />
          </button>

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
            <button className="p-2 bg-white/10 border border-white/30 rounded-lg hover:bg-white/20 transition-colors">
              <img src="/Search.png" alt="Search" className="w-5 h-5" />
            </button>

            {/* Desktop: Register Button */}
            <button className="hidden md:block px-5 py-2 border border-white text-white text-sm font-semibold rounded-full hover:bg-white/10 transition-colors">
              Register
            </button>

            {/* Desktop: Login Button */}
            <button className="hidden md:block px-5 py-2 bg-white text-[#091143] text-sm font-semibold rounded-full hover:bg-white/90 transition-colors">
              Login
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Full Screen Menu Overlay */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col">
          {/* Menu Header */}
          <div className="bg-[#0d1a67] px-4 py-3 flex items-center justify-between">
            {/* Close Button */}
            <button
              onClick={() => setIsMenuOpen(false)}
              className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            {/* Logo */}
            <img src="/SPORTSPRED.png" alt="SportsPred" className="h-6" />

            {/* Search */}
            <button className="p-2 bg-white/10 border border-white/30 rounded-lg">
              <img src="/Search.png" alt="Search" className="w-5 h-5" />
            </button>
          </div>

          {/* Menu Content */}
          <div className="flex-1 bg-white px-6 py-4 overflow-y-auto">
            <nav className="flex flex-col">
              {mobileNavItems.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => {
                    handleNavigation(item);
                    setIsMenuOpen(false);
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
      )}
    </>
  );
}
