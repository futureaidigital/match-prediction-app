import { useMemo, useState } from 'react';
import { MatchCard } from '@/components/MatchCard';
import { SmartCombo } from '@/components/SmartCombo';
import { Pagination } from '@/components/Pagination';
import { PlayersToWatch } from '@/components/PlayersToWatch';
import { LiveMatchBanner } from '@/components/LiveMatchBanner';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ApiDebugInfo } from '@/components/ApiDebugInfo';
import { useFixtures } from '@/hooks/useFixtures';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

export function DemoPage() {
  const { user, isAuthenticated, login, logout, error: authError } = useAuth();
  const [loginLoading, setLoginLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAuthPanel, setShowAuthPanel] = useState(false);
  const itemsPerPage = 6;

  // Fetch fixtures
  const { data: fixturesResponse, isLoading, error, refetch } = useFixtures({
    limit: 100
  });

  // Safely extract fixtures array from response
  const fixtures = fixturesResponse?.data?.fixtures ?? [];

  // Login handlers
  const handleFreeLogin = async () => {
    setLoginLoading(true);
    try {
      await login({
        email: 'free@fourthofficial.ai',
        password: 'TestPassword123!'
      });
      await refetch();
    } catch (err) {
      console.error('Free login failed:', err);
    } finally {
      setLoginLoading(false);
    }
  };

  const handlePremiumLogin = async () => {
    setLoginLoading(true);
    try {
      await login({
        email: 'premium@fourthofficial.ai',
        password: 'TestPassword123!'
      });
      await refetch();
    } catch (err) {
      console.error('Premium login failed:', err);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      await refetch();
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  // Check if user is premium
  const isPremium = user?.email?.includes('premium') || false;

  // Transform fixture data to match MatchCard interface and paginate
  const { matchCards, totalPages, paginatedCards } = useMemo(() => {
    if (!fixtures || fixtures.length === 0) {
      return { matchCards: [], totalPages: 0, paginatedCards: [] };
    }

    const allMatchCards = fixtures.map((fixtureItem) => {
      const fixture = fixtureItem.fixture;
      const predictions = fixtureItem.predictions || [];

      return {
        id: fixture.fixture_id.toString(),
        competition: fixture.league_name || 'UEFA Champions League',
        homeTeam: {
          id: fixture.home_team_id.toString(),
          name: fixture.home_team_name || fixture.home_team_short_code || 'Home',
          shortName: fixture.home_team_short_code || fixture.home_team_name?.slice(0, 3).toUpperCase() || 'HOM',
          logo: fixture.home_team_image_path,
        },
        awayTeam: {
          id: fixture.away_team_id.toString(),
          name: fixture.away_team_name || fixture.away_team_short_code || 'Away',
          shortName: fixture.away_team_short_code || fixture.away_team_name?.slice(0, 3).toUpperCase() || 'AWY',
          logo: fixture.away_team_image_path,
        },
        score: fixture.home_team_score !== undefined && fixture.away_team_score !== undefined ? {
          home: fixture.home_team_score,
          away: fixture.away_team_score,
        } : undefined,
        status: (fixture.minutes_elapsed !== null && fixture.minutes_elapsed !== undefined) ? 'live' as const : 'upcoming' as const,
        currentMinute: fixture.minutes_elapsed ?? undefined,
        kickoffTime: fixture.starting_at ? new Date(fixture.starting_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : 'TBD',
        predictions: predictions.map((pred, index) => {
          const predValue = pred.prediction ?? pred.pre_game_prediction ?? 0;
          let percentage;
          if (predValue > 1) {
            percentage = Math.round(predValue);
          } else {
            percentage = Math.round(predValue * 100);
          }
          percentage = Math.max(1, Math.min(99, percentage));

          return {
            id: pred.prediction_id?.toString() || index.toString(),
            label: pred.prediction_display_name || `Prediction ${index + 1}`,
            percentage: percentage,
            trend: {
              direction: (pred.pct_change_value || 0) >= 0 ? 'up' as const : 'down' as const,
              value: Math.abs(pred.pct_change_value || 0),
              timeframe: pred.pct_change_interval ? `${pred.pct_change_interval} min` : '13 min',
            },
            isBlurred: false,
          };
        }),
        totalPredictions: predictions.length || 5,
        lastUpdated: '2 mins ago',
        onSeeMore: () => console.log('See more clicked for:', fixture.fixture_id),
      };
    });

    const totalPages = Math.ceil(allMatchCards.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedCards = allMatchCards.slice(startIndex, endIndex);

    return {
      matchCards: allMatchCards,
      totalPages,
      paginatedCards
    };
  }, [fixtures, currentPage, itemsPerPage]);

  // Skeleton components for loading state
  const SkeletonMatchCard = () => (
    <div className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
      <div className="h-3 bg-gray-200 rounded w-32 mb-3" />
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gray-200 rounded-full" />
          <div className="h-4 bg-gray-200 rounded w-12" />
        </div>
        <div className="h-5 bg-gray-200 rounded w-16" />
        <div className="flex items-center gap-2">
          <div className="h-4 bg-gray-200 rounded w-12" />
          <div className="w-10 h-10 bg-gray-200 rounded-full" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-12 bg-gray-100 rounded-lg" />
        <div className="h-12 bg-gray-100 rounded-lg" />
      </div>
    </div>
  );

  const SkeletonBanner = () => (
    <div className="w-full rounded-xl overflow-hidden bg-gradient-to-b from-[#1a2a4a] to-[#0d1829] animate-pulse">
      <div className="px-8 py-8">
        <div className="h-4 bg-white/20 rounded w-48 mx-auto mb-4" />
        <div className="flex items-center justify-center gap-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/20" />
            <div className="h-6 bg-white/20 rounded w-16" />
          </div>
          <div className="h-12 bg-white/20 rounded w-24" />
          <div className="flex items-center gap-4">
            <div className="h-6 bg-white/20 rounded w-16" />
            <div className="w-16 h-16 rounded-full bg-white/20" />
          </div>
        </div>
      </div>
      <div className="h-16 bg-[#0d1829]" />
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-[1400px] mx-auto px-6 py-8">
          {/* Banner Skeleton */}
          <div className="mb-8">
            <SkeletonBanner />
          </div>

          {/* Main Content Layout */}
          <div className="flex gap-8">
            {/* Left Side: Featured Matches */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-6">
                <div className="h-8 bg-gray-200 rounded w-48 animate-pulse" />
                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse" />
                  <div className="w-20 h-10 bg-gray-200 rounded-lg animate-pulse" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <SkeletonMatchCard key={i} />
                ))}
              </div>
            </div>

            {/* Right Side: Smart Combo Skeleton */}
            <div className="hidden md:block w-[360px]">
              <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(to top right, #091143 65%, #11207f 100%)' }}>
                <div className="text-white px-4 py-3">
                  <div className="h-6 bg-white/20 rounded w-32 animate-pulse" />
                </div>
                <div className="bg-white rounded-xl mx-1 mb-1 p-4">
                  <div className="space-y-4">
                    <SkeletonMatchCard />
                    <SkeletonMatchCard />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />

      {/* Auth Toggle Button - Fixed Position */}
      <button
        onClick={() => setShowAuthPanel(!showAuthPanel)}
        className="fixed top-4 right-4 z-50 bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 transition-colors"
        title={isAuthenticated ? `Logged in as ${user?.email}` : 'Login'}
      >
        {isAuthenticated ? (
          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        )}
      </button>

      {/* Auth Panel - Slide Out */}
      {showAuthPanel && (
        <div className="fixed top-16 right-4 z-40 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 p-4">
          {isAuthenticated ? (
            <div className="space-y-3">
              <div className="text-sm text-gray-600">
                Logged in as: <span className="font-medium text-gray-900">{user?.email}</span>
              </div>
              <div className="text-xs text-gray-500">
                Status: <span className={isPremium ? 'text-green-600' : 'text-gray-600'}>{isPremium ? 'Premium' : 'Free'}</span>
              </div>
              <Button
                onClick={handleLogout}
                className="w-full bg-red-500 hover:bg-red-600 text-white text-sm"
              >
                Logout
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-sm font-medium text-gray-900 mb-2">Test Accounts</div>
              <Button
                onClick={handleFreeLogin}
                disabled={loginLoading}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white text-sm"
              >
                {loginLoading ? 'Loading...' : 'Login as Free User'}
              </Button>
              <Button
                onClick={handlePremiumLogin}
                disabled={loginLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm"
              >
                {loginLoading ? 'Loading...' : 'Login as Premium User'}
              </Button>
              {authError && (
                <div className="text-xs text-red-500 mt-2">{authError}</div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="max-w-[1400px] mx-auto px-6 py-8">
        {/* Live Match Banner - Full Width */}
        <div className="mb-8">
          <LiveMatchBanner />
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">Failed to load fixtures: {error.message}</p>
          </div>
        )}

        {/* Main Content Layout */}
        <div className="flex gap-8">
          {/* Left Side: Featured Matches */}
          <div className="flex-1">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">Featured Matches</h1>
                <div className="text-gray-600">
                  <ApiDebugInfo
                    endpoint="/api/v1/fixtures?limit=100&with_predictions=true"
                    response={fixturesResponse?.data}
                    isLoading={isLoading}
                    error={error?.message}
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                {/* Calendar Button */}
                <button className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </button>
                {/* Filter Button */}
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors text-gray-700 text-sm font-medium">
                  Filter
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Match Cards Grid - 3 columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {paginatedCards.map((match) => (
                <MatchCard key={match.id} {...match} isPremium={isPremium} />
              ))}
            </div>

            {/* Empty State */}
            {matchCards.length === 0 && !isLoading && (
              <div className="text-center py-12 text-gray-500">
                {error ? 'Unable to load fixtures' : 'No fixtures available'}
              </div>
            )}

            {/* Mobile: View All Button */}
            <div className="md:hidden mt-6">
              <button className="w-full py-3 border border-[#0d1a67] text-[#0d1a67] font-semibold rounded-xl hover:bg-[#0d1a67] hover:text-white transition-all">
                View All
              </button>
            </div>

            {/* Desktop: Pagination */}
            {totalPages > 1 && (
              <div className="hidden md:block mt-8">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </div>

          {/* Right Side: Smart Combo - Desktop only */}
          <div className="hidden xl:block">
            <SmartCombo isPremium={isPremium} />
          </div>
        </div>

        {/* Mobile: Smart Combo - Below Featured Matches */}
        <div className="xl:hidden mt-8">
          <SmartCombo isPremium={isPremium} />
        </div>

        {/* Players to Watch Section - Full Width on Desktop */}
        <div className="hidden md:block mt-8">
          <PlayersToWatch />
        </div>
      </div>

      {/* Players to Watch Section - Edge to Edge on Mobile */}
      <div className="md:hidden mt-8 mb-8">
        <PlayersToWatch />
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
