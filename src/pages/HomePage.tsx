import { useNavigate } from 'react-router-dom';
import { MatchCard } from '@/components/MatchCard';
import { MatchCardSkeleton } from '@/components/MatchCardSkeleton';
import { Button } from '@/components/ui/button';
import { FixtureWithPredictions } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { useFixtures } from '@/hooks/useFixtures';

// Helper function to format kickoff time
const formatKickoffTime = (kickoffAt: string): string => {
  const date = new Date(kickoffAt);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const kickoffDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const timeString = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });

  if (kickoffDate.getTime() === today.getTime()) {
    return `Today, ${timeString}`;
  } else if (kickoffDate.getTime() === today.getTime() + 86400000) {
    return `Tomorrow, ${timeString}`;
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
};

export function HomePage() {
  const { hasAccess, isAuthenticated, user, subscriptionStatus, subscriptionError, logout } = useAuth();
  const navigate = useNavigate();

  // Fetch featured matches
  const {
    data: fixturesData,
    isLoading: isLoadingFixtures,
    error: fixturesError,
  } = useFixtures({
    with_predictions: true,
    limit: 6,
  });

  const featuredMatches = fixturesData?.data?.fixtures || [];

  // Check if user has premium access
  const isPremium = hasAccess();

  // Handle error from fixtures query
  const error = fixturesError
    ? (fixturesError as Error)?.message || 'Failed to load data. Please try again.'
    : null;

  // Transform fixture data for MatchCard component
  const transformFixtureToMatchCard = (fixtureItem: FixtureWithPredictions) => {
    const fixture = fixtureItem.fixture;
    const predictions = fixtureItem.predictions || [];

    if (!fixture || !fixture.home_team_name || !fixture.away_team_name) {
      return null;
    }

    const userHasAccess = hasAccess();

    // Determine status
    let status: 'live' | 'upcoming' | 'finished' = 'upcoming';
    if (fixture.minutes_elapsed !== null && fixture.minutes_elapsed !== undefined && fixture.minutes_elapsed > 0) {
      status = fixture.minutes_elapsed >= 90 ? 'finished' : 'live';
    }

    return {
      id: String(fixture.fixture_id),
      competition: fixture.league_name || 'League',
      homeTeam: {
        id: String(fixture.home_team_id),
        name: fixture.home_team_name || 'Home',
        shortName: fixture.home_team_short_code || fixture.home_team_name?.slice(0, 3).toUpperCase() || 'HOM',
        logo: fixture.home_team_image_path
      },
      awayTeam: {
        id: String(fixture.away_team_id),
        name: fixture.away_team_name || 'Away',
        shortName: fixture.away_team_short_code || fixture.away_team_name?.slice(0, 3).toUpperCase() || 'AWY',
        logo: fixture.away_team_image_path
      },
      status,
      score: (fixture.home_team_score !== undefined && fixture.away_team_score !== undefined) ? {
        home: fixture.home_team_score,
        away: fixture.away_team_score
      } : undefined,
      currentMinute: fixture.minutes_elapsed ?? undefined,
      kickoffTime: fixture.starting_at ? formatKickoffTime(fixture.starting_at) : 'TBD',
      predictions: predictions.slice(0, 4).map((pred, idx) => {
        const predValue = pred.prediction ?? pred.pre_game_prediction ?? 0;
        let percentage = predValue > 1 ? Math.round(predValue) : Math.round(predValue * 100);
        percentage = Math.max(1, Math.min(99, percentage));

        return {
          id: String(pred.prediction_id || idx),
          label: pred.prediction_display_name || `Prediction ${idx + 1}`,
          percentage,
          trend: {
            direction: (pred.pct_change_value || 0) >= 0 ? 'up' as const : 'down' as const,
            value: Math.abs(pred.pct_change_value || 0),
            timeframe: pred.pct_change_interval ? `${pred.pct_change_interval} min` : '13 min',
          },
          isBlurred: !userHasAccess && idx > 1
        };
      }),
      totalPredictions: predictions.length || 5,
      lastUpdated: '2 mins ago',
      isPremium
    };
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Featured Matches</h1>
            <p className="text-gray-600">Live predictions and match insights</p>
          </div>
          {/* Auth Section */}
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              {/* Subscription Badge */}
              <div className="px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-600 font-medium uppercase">
                  {subscriptionStatus?.has_access ? 'Premium' : 'Free'} Tier
                </p>
              </div>

              {/* User Info */}
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user?.name || user?.email}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <Button
                  onClick={logout}
                  variant="outline"
                  className="border-gray-300 hover:bg-red-50 hover:border-red-300"
                >
                  Logout
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex gap-3">
              <Button
                onClick={() => navigate('/login')}
                variant="outline"
                className="border-gray-300"
              >
                Login
              </Button>
              <Button
                onClick={() => navigate('/register')}
                className="bg-[#1e293b] hover:bg-[#334155]"
              >
                Sign Up
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="max-w-7xl mx-auto mb-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
            <p className="font-semibold">Error loading data</p>
            <p className="text-sm">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="mt-2"
            >
              Retry
            </Button>
          </div>
        </div>
      )}

      {/* Subscription Error Warning */}
      {subscriptionError && isAuthenticated && (
        <div className="max-w-7xl mx-auto mb-8">
          <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 text-yellow-900">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <p className="font-semibold">Subscription Status Unavailable</p>
                <p className="text-sm mt-1">{subscriptionError}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Match Cards Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {isLoadingFixtures ? (
          <>
            <MatchCardSkeleton />
            <MatchCardSkeleton />
            <MatchCardSkeleton />
          </>
        ) : featuredMatches.length > 0 ? (
          featuredMatches.slice(0, 6).map((match) => {
            const transformed = transformFixtureToMatchCard(match);
            if (!transformed) return null;
            return (
              <MatchCard
                key={transformed.id}
                {...transformed}
                onSeeMore={() => navigate(`/match/${transformed.id}`)}
              />
            );
          }).filter(Boolean)
        ) : (
          <div className="col-span-3 text-center py-12 text-gray-500">
            <p>No featured matches available at the moment.</p>
          </div>
        )}
      </div>

      {/* Empty State */}
      {!isLoadingFixtures && featuredMatches.length === 0 && (
        <div className="max-w-7xl mx-auto text-center py-20">
          <div className="text-gray-400 mb-4">
            <svg className="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No data available</h3>
          <p className="text-gray-500 mb-4">There are no matches available at the moment.</p>
          <Button onClick={() => window.location.reload()}>
            Refresh
          </Button>
        </div>
      )}
    </div>
  );
}
