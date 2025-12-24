import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DemoPage } from './pages/DemoPage';
import { MatchesPage } from './pages/MatchesPage';
import { MatchDetailPage } from './pages/MatchDetailPage';
import { PricingPage } from './pages/PricingPage';
import { SmartComboPage } from './pages/SmartComboPage';
import { LeaguePage } from './pages/LeaguePage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Demo page for testing new components */}
        <Route path="/" element={<DemoPage />} />
        <Route path="/demo" element={<DemoPage />} />

        {/* Matches pages */}
        <Route path="/matches" element={<MatchesPage />} />
        <Route path="/match/:fixtureId" element={<MatchDetailPage />} />

        {/* Pricing page */}
        <Route path="/pricing" element={<PricingPage />} />

        {/* Smart Combo page */}
        <Route path="/smart-combo" element={<SmartComboPage />} />

        {/* League page */}
        <Route path="/league" element={<LeaguePage />} />

        {/* Catch-all route */}
        <Route path="*" element={
          <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="flex flex-col items-center justify-center bg-white rounded-xl border border-gray-200 p-12 max-w-md w-full">
              <img
                src="/404.svg"
                alt="Page not found"
                className="w-32 h-32 mb-6 opacity-60"
              />
              <h1 className="text-xl font-bold text-gray-900 mb-2">Page Not Found</h1>
              <p className="text-gray-500 mb-6 text-center">The page you're looking for doesn't exist</p>
              <a
                href="/"
                className="px-6 py-2 bg-[#091143] text-white rounded-lg hover:bg-[#11207f] transition-colors font-medium"
              >
                Go Home
              </a>
            </div>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;