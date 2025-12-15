import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { MatchCard } from '@/components/MatchCard';
import { useCurrentSmartCombo } from '@/hooks/useSmartCombo';
import { useSmartComboPredictions } from '@/hooks/usePredictions';
import { useAuth } from '@/contexts/AuthContext';

export function SmartComboPage() {
  const navigate = useNavigate();
  const { hasAccess } = useAuth();
  const isPremium = hasAccess();

  // Fetch combo metadata and fixture details
  const {
    data: comboResponse,
    isLoading: isLoadingCombo,
    error: comboError,
  } = useCurrentSmartCombo();

  const combo = comboResponse?.data?.combo;
  const fixtures = comboResponse?.data?.fixtures || [];

  // Fetch predictions sorted by pct_change
  const {
    data: predictionsResponse,
    isLoading: isLoadingPredictions,
  } = useSmartComboPredictions(
    {
      combo_id: combo?.combo_id,
      sort_by: 'pct_change',
      sort_order: 'desc',
      limit: 100,
    },
    {
      enabled: !!combo?.combo_id,
    }
  );

  // Get sorted predictions grouped by fixture_id
  const sortedPredictions = predictionsResponse?.data?.predictions || [];
  const predictionsByFixture = useMemo(() => {
    const map = new Map<number, typeof sortedPredictions>();
    sortedPredictions.forEach((pred) => {
      const existing = map.get(pred.fixture_id) || [];
      existing.push(pred);
      map.set(pred.fixture_id, existing);
    });
    return map;
  }, [sortedPredictions]);

  // Convert fixtures to MatchCard format
  const matchCards = useMemo(() => {
    return fixtures.map((fixtureData) => {
      const { fixture, predictions: fallbackPredictions } = fixtureData;
      const predictions = predictionsByFixture.get(fixture.fixture_id) || fallbackPredictions;

      const homeTeamLogo = fixture.home_team_image_path || fixture.home_team_logo_location;
      const awayTeamLogo = fixture.away_team_image_path || fixture.away_team_logo_location;

      let kickoffTime = 'TBD';
      let kickoffDate = '';
      if (fixture.starting_at) {
        const date = new Date(fixture.starting_at);
        kickoffTime = date.toLocaleTimeString('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
        });
        kickoffDate = date.toLocaleDateString('en-GB', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
        });
      }

      return {
        id: fixture.fixture_id.toString(),
        competition: fixture.league_name || 'League',
        homeTeam: {
          id: 'home',
          name: fixture.home_team_name || 'Home Team',
          shortName: fixture.home_team_name?.slice(0, 3).toUpperCase() || 'HOM',
          logo: homeTeamLogo,
        },
        awayTeam: {
          id: 'away',
          name: fixture.away_team_name || 'Away Team',
          shortName: fixture.away_team_name?.slice(0, 3).toUpperCase() || 'AWY',
          logo: awayTeamLogo,
        },
        status: 'upcoming' as const,
        kickoffTime: `${kickoffDate}, ${kickoffTime}`,
        predictions: predictions.map((pred, idx) => ({
          id: pred.prediction_id.toString(),
          label: pred.prediction_display_name,
          percentage: Math.round(pred.prediction || pred.pre_game_prediction),
          trend: {
            direction: (pred.pct_change_value || 0) >= 0 ? 'up' as const : 'down' as const,
            value: Math.abs(pred.pct_change_value || 0),
            timeframe: pred.pct_change_interval ? `${pred.pct_change_interval} min` : '13 min',
          },
          isBlurred: !isPremium && idx > 1,
        })),
        totalPredictions: predictions.length,
      };
    });
  }, [fixtures, predictionsByFixture, isPremium]);

  const accuracy = combo?.previous_week_combo_accuracy
    ? Math.round(combo.previous_week_combo_accuracy)
    : null;

  const isLoading = isLoadingCombo || isLoadingPredictions;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header currentPage="smart-combo" />

      <main className="flex-1">
        {/* Hero Section */}
        <div
          className="text-white py-8 px-4"
          style={{ background: 'linear-gradient(to right, #091143, #11207f)' }}
        >
          <div className="max-w-4xl mx-auto">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-white/70 hover:text-white mb-4 transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Back
            </button>

            <h1 className="text-3xl font-bold mb-2">Smart Combo</h1>
            <p className="text-white/70 mb-6">
              Our AI-powered selection of high-confidence predictions
            </p>

            {/* Accuracy Bar */}
            {accuracy !== null && (
              <div className="bg-white/10 rounded-xl p-4 max-w-md">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/70 text-sm">Last week's accuracy</span>
                  <span className="text-white font-bold text-xl">{accuracy}%</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div
                    className="bg-green-400 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${accuracy}%` }}
                  />
                </div>
              </div>
            )}

            {/* Combo Info */}
            {combo && (
              <div className="mt-4 flex flex-wrap gap-4 text-sm">
                <div className="bg-white/10 rounded-lg px-3 py-2">
                  <span className="text-white/70">Total Odds: </span>
                  <span className="text-white font-semibold">{combo.total_odds?.toFixed(2) || 'N/A'}</span>
                </div>
                <div className="bg-white/10 rounded-lg px-3 py-2">
                  <span className="text-white/70">Confidence: </span>
                  <span className="text-white font-semibold">{combo.confidence ? `${Math.round(combo.confidence)}%` : 'N/A'}</span>
                </div>
                <div className="bg-white/10 rounded-lg px-3 py-2">
                  <span className="text-white/70">Fixtures: </span>
                  <span className="text-white font-semibold">{fixtures.length}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Loading State */}
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
                  <div className="h-3 bg-gray-200 rounded w-32 mb-3" />
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-gray-200 rounded-full" />
                      <div className="h-4 bg-gray-200 rounded w-12" />
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-8" />
                    <div className="flex items-center gap-2">
                      <div className="h-4 bg-gray-200 rounded w-12" />
                      <div className="w-10 h-10 bg-gray-200 rounded-full" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-10 bg-gray-100 rounded-lg" />
                    <div className="h-10 bg-gray-100 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {comboError && !isLoading && (
            <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-xl border border-gray-200">
              <img
                src="/404.svg"
                alt="Error"
                className="w-32 h-32 mb-6 opacity-60"
              />
              <p className="text-gray-500 font-medium text-lg">Failed to load Smart Combo</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-[#091143] text-white rounded-lg hover:bg-[#11207f] transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !comboError && matchCards.length === 0 && (
            <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-xl border border-gray-200">
              <img
                src="/404.svg"
                alt="No combo"
                className="w-32 h-32 mb-6 opacity-60"
              />
              <p className="text-gray-500 font-medium text-lg">No Smart Combo available</p>
              <p className="text-gray-400 text-sm mt-2">Check back later for new predictions</p>
            </div>
          )}

          {/* Match Cards Grid */}
          {!isLoading && !comboError && matchCards.length > 0 && (
            <>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Fixtures in this combo ({matchCards.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {matchCards.map((match) => (
                  <MatchCard
                    key={match.id}
                    {...match}
                    isPremium={isPremium}
                    onSeeMore={() => navigate(`/match/${match.id}`)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
