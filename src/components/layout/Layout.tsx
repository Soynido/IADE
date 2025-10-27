import React, { useState } from 'react';

export interface LayoutProps {
  children: React.ReactNode;
  currentView?: 'dashboard' | 'quiz' | 'stats' | 'settings';
  onNavigate?: (view: 'dashboard' | 'quiz' | 'stats' | 'settings') => void;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  currentView = 'dashboard',
  onNavigate,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigationItems = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: '🏠' },
    { id: 'quiz' as const, label: 'Sessions', icon: '📝' },
    { id: 'stats' as const, label: 'Statistiques', icon: '📊' },
    { id: 'settings' as const, label: 'Paramètres', icon: '⚙️' },
  ];

  const handleNavigation = (view: typeof currentView) => {
    if (onNavigate) {
      onNavigate(view);
    }
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="bg-white w-64 h-full shadow-xl animate-slide-in-right"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-iade-gray-900">Menu</h2>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-iade-gray-500 hover:text-iade-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <nav className="space-y-2">
                {navigationItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleNavigation(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                      currentView === item.id
                        ? 'bg-iade-blue-100 text-iade-blue-700 font-semibold'
                        : 'text-iade-gray-700 hover:bg-iade-gray-100'
                    }`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Navigation (optional - hidden for now, keeping layout simple) */}
      
      {/* Main Content */}
      <main className="flex-1 bg-gray-50 dark:bg-gray-900 min-h-screen">
        {children}
      </main>

      {/* Footer (optional) */}
      <footer className="bg-white dark:bg-gray-800 border-t border-iade-gray-200 dark:border-gray-700 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-iade-gray-600 dark:text-gray-400">
            © 2025 IADE Learning Core - Préparation au concours IADE
          </p>
        </div>
      </footer>
    </div>
  );
};

