import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DemoPage } from './pages/DemoPage';
import { MatchesPage } from './pages/MatchesPage';
import { MatchDetailPage } from './pages/MatchDetailPage';
import { PricingPage } from './pages/PricingPage';

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

        {/* Catch-all route */}
        <Route path="*" element={<div>Page not found - Go to <a href="/" className="text-blue-600 underline">Demo</a></div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;