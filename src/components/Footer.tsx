interface FooterProps {
  onNavigate?: (page: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'live', label: 'Live' },
    { id: 'combos', label: 'Combos' },
    { id: 'login', label: 'Login' },
  ];

  return (
    <footer className="w-full bg-[#0d1a67]">
      <div className="w-full max-w-[100vw] md:max-w-7xl mx-auto px-4 md:px-6 py-4 box-border">
        {/* Mobile Layout - Stacked */}
        <div className="md:hidden flex flex-col items-center gap-4">
          <nav className="flex items-center gap-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate?.(item.id)}
                className="text-sm text-white/70 hover:text-white transition-colors"
              >
                {item.label}
              </button>
            ))}
          </nav>
          <div className="w-full border-t border-white/20" />
          <div className="text-xs text-white/70">
            © 2025 Sports Predictions Platform. All rights reserved.
          </div>
        </div>

        {/* Desktop Layout - Row */}
        <div className="hidden md:flex items-center justify-between">
          <nav className="flex items-center gap-6">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate?.(item.id)}
                className="text-sm text-white/70 hover:text-white transition-colors"
              >
                {item.label}
              </button>
            ))}
          </nav>
          <div className="text-sm text-white/70">
            © 2025 Sports Predictions Platform. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
