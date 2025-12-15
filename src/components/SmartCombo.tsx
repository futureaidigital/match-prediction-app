import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MatchCard } from '@/components/MatchCard';
import { useCurrentSmartCombo } from '@/hooks/useSmartCombo';
import { useSmartComboPredictions } from '@/hooks/usePredictions';

interface SmartComboProps {
  isPremium?: boolean;
}

export function SmartCombo({ isPremium = false }: SmartComboProps) {
  const navigate = useNavigate();

  // Fetch combo metadata and fixture details from /smart-combos/current
  const {
    data: comboResponse,
    isLoading: isLoadingCombo,
    error: comboError,
  } = useCurrentSmartCombo();

  const combo = comboResponse?.data?.combo;
  const fixtures = comboResponse?.data?.fixtures || [];

  // Fetch predictions sorted by pct_change from /predictions/smart-combos
  // This follows the architecture: sort by pct_change for trending predictions
  const {
    data: predictionsResponse,
    isLoading: isLoadingPredictions,
  } = useSmartComboPredictions(
    {
      combo_id: combo?.combo_id,
      sort_by: 'pct_change',
      sort_order: 'desc',
      limit: 50,
    },
    {
      enabled: !!combo?.combo_id,
    }
  );

  // Get the sorted predictions and group by fixture_id
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

  // Convert fixtures to MatchCard format, using sorted predictions
  const matchCards = useMemo(() => {
    return fixtures.map((fixtureData) => {
      const { fixture, predictions: fallbackPredictions } = fixtureData;

      // Use sorted predictions from the separate endpoint, or fall back to embedded predictions
      const predictions = predictionsByFixture.get(fixture.fixture_id) || fallbackPredictions;

      // Use logo fields if available from backend
      const homeTeamLogo = fixture.home_team_image_path || fixture.home_team_logo_location;
      const awayTeamLogo = fixture.away_team_image_path || fixture.away_team_logo_location;

      // Format kickoff time
      let kickoffTime = '15:30h';
      if (fixture.starting_at) {
        const date = new Date(fixture.starting_at);
        kickoffTime = date.toLocaleTimeString('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
        });
      }

      return {
        id: fixture.fixture_id.toString(),
        competition: fixture.league_name || 'International • WC Qualification, UEFA',
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
        kickoffTime,
        isToday: true,
        predictions: predictions.map((pred) => ({
          id: pred.prediction_id.toString(),
          label: pred.prediction_display_name,
          percentage: Math.round(pred.prediction || pred.pre_game_prediction),
          trend: {
            direction: (pred.pct_change_value || 0) >= 0 ? 'up' as const : 'down' as const,
            value: Math.abs(pred.pct_change_value || 0),
            timeframe: pred.pct_change_interval ? `${pred.pct_change_interval} min` : '13 min',
          },
        })),
      };
    });
  }, [fixtures, predictionsByFixture]);

  // Use accuracy from combo data
  const accuracy = useMemo(() => {
    return combo?.previous_week_combo_accuracy
      ? Math.round(combo.previous_week_combo_accuracy)
      : 85;
  }, [combo]);


  // Loading state
  if (isLoadingCombo || isLoadingPredictions) {
    return (
      <div className="w-full md:w-[360px]">
        <div
          className="rounded-2xl overflow-hidden shadow-lg"
          style={{ background: 'linear-gradient(to top right, #091143 65%, #11207f 100%)' }}
        >
          <div className="text-white px-4 py-3">
            <h2 className="text-[20px]">Smart Combo</h2>
          </div>
          <div className="p-5">
            {/* Accuracy skeleton */}
            <div className="mb-5 bg-white/10 rounded-xl p-4 animate-pulse">
              <div className="flex items-center justify-between mb-3">
                <div className="h-4 bg-white/20 rounded w-32" />
                <div className="h-6 bg-white/20 rounded w-12" />
              </div>
              <div className="w-full bg-white/20 rounded-full h-2.5" />
            </div>
            {/* Card skeletons */}
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
                  <div className="h-3 bg-gray-200 rounded w-32 mb-3" />
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gray-200 rounded-full" />
                      <div className="h-3 bg-gray-200 rounded w-10" />
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-12" />
                    <div className="flex items-center gap-2">
                      <div className="h-3 bg-gray-200 rounded w-10" />
                      <div className="w-8 h-8 bg-gray-200 rounded-full" />
                    </div>
                  </div>
                  <div className="h-12 bg-gray-100 rounded-lg" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (comboError) {
    return (
      <div className="w-full md:w-[360px]">
        <div
          className="rounded-2xl overflow-hidden shadow-lg"
          style={{ background: 'linear-gradient(to top right, #091143 65%, #11207f 100%)' }}
        >
          <div className="text-white px-4 py-3">
            <h2 className="text-[20px]">Smart Combo</h2>
          </div>
          <div className="p-8 text-center">
            <p className="text-red-400 font-medium">Failed to load Smart Combo</p>
            <p className="text-white/50 text-sm mt-1">Please try again later</p>
          </div>
        </div>
      </div>
    );
  }

  // No data state
  if (!combo || matchCards.length === 0) {
    return (
      <div className="w-full md:w-[360px]">
        <div
          className="rounded-2xl overflow-hidden shadow-lg"
          style={{ background: 'linear-gradient(to top right, #091143 65%, #11207f 100%)' }}
        >
          <div className="text-white px-4 py-3">
            <h2 className="text-[20px]">Smart Combo</h2>
          </div>
          <div className="p-8 text-center">
            <p className="text-white font-medium">No Smart Combo available</p>
            <p className="text-white/50 text-sm mt-1">Check back later</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full md:w-[360px]">
      <div
        className="rounded-2xl overflow-hidden shadow-lg p-[3px]"
        style={{ background: 'linear-gradient(to top right, #091143 65%, #11207f 100%)' }}
      >
        {/* Header - On gradient */}
        <div className="text-white px-4 py-3">
          <h2 className="text-xl font-semibold">Smart Combo</h2>
        </div>

        {/* White Content Area */}
        <div className="bg-white rounded-xl mx-1 mb-1">
          {/* Accuracy Section */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <span className="text-gray-900 font-bold text-lg">{accuracy}%</span>
              <span className="text-gray-500 text-sm">Accuracy last week</span>
              <div className="flex-1 bg-gray-200 rounded-full h-2 ml-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${accuracy}%` }}
                />
              </div>
            </div>
          </div>

          {/* Match Cards */}
          <div className="p-4 space-y-4">
            {matchCards.slice(0, 2).map((match) => (
              <MatchCard
                key={match.id}
                {...match}
                variant="compact"
                isPremium={isPremium}
              />
            ))}
          </div>

          {/* See More Button - Inside white area */}
          <div className="px-4 pb-4">
            <button
              onClick={() => navigate('/smart-combo')}
              className="w-full py-2 px-4 border border-[#091143] text-[#091143] font-semibold rounded-lg hover:bg-[#091143] hover:text-white transition-all duration-200 text-sm"
            >
              See more
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
