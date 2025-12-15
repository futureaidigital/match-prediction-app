import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { TeamAvatar } from '@/components/ui/TeamAvatar';
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

  const accuracy = combo?.previous_week_combo_accuracy
    ? Math.round(combo.previous_week_combo_accuracy)
    : 85;

  const isLoading = isLoadingCombo || isLoadingPredictions;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header currentPage="smart-combo" />

      <main className="flex-1">
        <div className="max-w-[1400px] mx-auto px-6 py-8">
          {/* Main Card Container - Same style as SmartCombo component */}
          <div
            className="rounded-2xl overflow-hidden shadow-lg"
            style={{ background: 'linear-gradient(to top right, #091143 65%, #11207f 100%)' }}
          >
            {/* Header Section */}
            <div className="p-6 text-white">
              {/* Title Row */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold">This Week's Smart Combo</h1>
                  <span className="flex items-center gap-1.5 bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-sm font-medium">
                    <img src="/icon-trusted-pick.svg" alt="" className="w-4 h-4" /> Trusted Pick
                  </span>
                  <span className="flex items-center gap-1.5 bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm font-medium">
                    <img src="/icon-safe-pick.svg" alt="" className="w-4 h-4" /> Safe Pick
                  </span>
                </div>
              </div>

              {/* Stats Row */}
              <div className="flex items-center justify-between">
                {/* Accuracy Circle */}
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16">
                    <svg className="w-16 h-16 transform -rotate-90">
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        stroke="rgba(255,255,255,0.2)"
                        strokeWidth="4"
                        fill="none"
                      />
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        stroke="#22c55e"
                        strokeWidth="4"
                        fill="none"
                        strokeDasharray={`${(accuracy / 100) * 176} 176`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-white font-bold text-lg">{accuracy}%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-white font-semibold">Last Week Accuracy</p>
                    <p className="text-white/60 text-sm">Consistently delivering winning predictions</p>
                  </div>
                </div>

                {/* Stats Badges */}
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-2 mx-auto">
                      <img src="/icon-success.svg" alt="Success Rate" className="w-8 h-8" />
                    </div>
                    <p className="text-white font-bold">{combo?.confidence ? Math.round(combo.confidence) : 87}%</p>
                    <p className="text-white/60 text-xs">Success Rate</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-2 mx-auto">
                      <img src="/icon-proven.svg" alt="Proven" className="w-8 h-8" />
                    </div>
                    <p className="text-white font-bold">Proven</p>
                    <p className="text-white/60 text-xs">Track Record</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-2 mx-auto">
                      <img src="/icon-expert.svg" alt="Expert" className="w-8 h-8" />
                    </div>
                    <p className="text-white font-bold">Expert</p>
                    <p className="text-white/60 text-xs">Analysis</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-2 mx-auto">
                      <img src="/icon-global.svg" alt="Global" className="w-8 h-8" />
                    </div>
                    <p className="text-white font-bold">Global</p>
                    <p className="text-white/60 text-xs">Coverage</p>
                  </div>
                </div>
              </div>
            </div>

            {/* White Content Area */}
            <div className="bg-white rounded-t-2xl">
              {/* Combo Overview Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900">Combo Overview</h2>
                <button className="text-gray-400 hover:text-gray-600">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                </button>
              </div>

              {/* Loading State */}
              {isLoading && (
                <div className="p-6 space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="border-2 border-dashed border-gray-200 rounded-xl p-6 animate-pulse">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-200 rounded-full" />
                          <div className="h-4 bg-gray-200 rounded w-16" />
                        </div>
                        <div className="h-6 bg-gray-200 rounded w-20" />
                        <div className="flex items-center gap-3">
                          <div className="h-4 bg-gray-200 rounded w-16" />
                          <div className="w-12 h-12 bg-gray-200 rounded-full" />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="h-16 bg-gray-100 rounded-lg" />
                        <div className="h-16 bg-gray-100 rounded-lg" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Error State */}
              {comboError && !isLoading && (
                <div className="p-12 text-center">
                  <img src="/404.svg" alt="Error" className="w-32 h-32 mx-auto mb-6 opacity-60" />
                  <p className="text-gray-500 font-medium text-lg">Failed to load Smart Combo</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="mt-4 px-6 py-2 bg-[#091143] text-white rounded-lg hover:bg-[#11207f] transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              )}

              {/* Empty State */}
              {!isLoading && !comboError && fixtures.length === 0 && (
                <div className="p-12 text-center">
                  <img src="/404.svg" alt="No combo" className="w-32 h-32 mx-auto mb-6 opacity-60" />
                  <p className="text-gray-500 font-medium text-lg">No Smart Combo available</p>
                  <p className="text-gray-400 text-sm mt-2">Check back later for new predictions</p>
                </div>
              )}

              {/* Fixtures List */}
              {!isLoading && !comboError && fixtures.length > 0 && (
                <div className="p-6 space-y-4">
                  {fixtures.map((fixtureData) => {
                    const { fixture, predictions: fallbackPredictions } = fixtureData;
                    const predictions = predictionsByFixture.get(fixture.fixture_id) || fallbackPredictions;

                    const homeTeamLogo = fixture.home_team_image_path || fixture.home_team_logo_location;
                    const awayTeamLogo = fixture.away_team_image_path || fixture.away_team_logo_location;

                    let kickoffTime = '15:30h';
                    if (fixture.starting_at) {
                      const date = new Date(fixture.starting_at);
                      kickoffTime = date.toLocaleTimeString('en-GB', {
                        hour: '2-digit',
                        minute: '2-digit',
                      }) + 'h';
                    }

                    return (
                      <div
                        key={fixture.fixture_id}
                        className="border-2 border-dashed border-gray-300 rounded-xl p-5 hover:border-[#091143]/30 transition-colors"
                      >
                        {/* Match Header */}
                        <div className="flex items-center justify-between mb-4">
                          {/* Home Team */}
                          <div className="flex items-center gap-3">
                            <TeamAvatar
                              logo={homeTeamLogo}
                              name={fixture.home_team_name || 'Home'}
                              shortName={fixture.home_team_name?.slice(0, 3).toUpperCase() || 'HOM'}
                              size="lg"
                            />
                            <span className="font-bold text-gray-900 text-lg">
                              {fixture.home_team_name?.slice(0, 3).toUpperCase() || 'HOM'}
                            </span>
                          </div>

                          {/* Center - Competition, Time */}
                          <div className="flex flex-col items-center">
                            <span className="text-gray-400 text-xs font-medium mb-1">
                              {fixture.league_name || 'International • WC Qualification, UEFA'}
                            </span>
                            <span className="font-bold text-gray-900 text-xl">{kickoffTime}</span>
                            <span className="text-gray-400 text-xs font-medium">TODAY</span>
                          </div>

                          {/* Away Team */}
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-gray-900 text-lg">
                              {fixture.away_team_name?.slice(0, 3).toUpperCase() || 'AWY'}
                            </span>
                            <TeamAvatar
                              logo={awayTeamLogo}
                              name={fixture.away_team_name || 'Away'}
                              shortName={fixture.away_team_name?.slice(0, 3).toUpperCase() || 'AWY'}
                              size="lg"
                            />
                          </div>
                        </div>

                        {/* Predictions */}
                        <div className="space-y-3">
                          {predictions.slice(0, 3).map((pred, idx) => {
                            const isBlurred = !isPremium && idx > 0;
                            const percentage = Math.round(pred.prediction || pred.pre_game_prediction);

                            return (
                              <div
                                key={pred.prediction_id}
                                className={`border border-gray-200 rounded-lg p-4 ${isBlurred ? 'relative overflow-hidden' : ''}`}
                              >
                                {isBlurred && (
                                  <div className="absolute inset-0 backdrop-blur-sm bg-white/70 z-10 flex items-center justify-center">
                                    <div className="flex items-center gap-2 text-gray-500">
                                      <img src="/Lock.svg" alt="" className="w-4 h-4" />
                                      <span className="text-sm font-medium">Premium Only</span>
                                    </div>
                                  </div>
                                )}

                                {/* Prediction Label & Trend */}
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-medium text-gray-900">{pred.prediction_display_name}</span>
                                  <div className="flex items-center gap-1">
                                    {pred.pct_change_value !== null && pred.pct_change_value !== undefined && (
                                      <span className={`text-sm font-medium ${pred.pct_change_value >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                        {pred.pct_change_value >= 0 ? '↑' : '↓'} {Math.abs(pred.pct_change_value)}% in the last {pred.pct_change_interval || 13} min
                                      </span>
                                    )}
                                    <button className="ml-2 text-gray-400 hover:text-gray-600">
                                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polyline points="6 9 12 15 18 9" />
                                      </svg>
                                    </button>
                                  </div>
                                </div>

                                {/* Progress Bar & Stats */}
                                <div className="flex items-center gap-6">
                                  {/* Progress Bar */}
                                  <div className="flex items-center gap-3 flex-1">
                                    <span className="text-green-500 font-bold text-lg min-w-[48px]">{percentage}%</span>
                                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                                      <div
                                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${percentage}%` }}
                                      />
                                    </div>
                                  </div>

                                  {/* Stats */}
                                  <div className="flex items-center gap-6 text-sm">
                                    <div className="text-gray-500">
                                      Pre-game Prediction: <span className="text-green-500 font-medium">{Math.round(pred.pre_game_prediction)}%</span>
                                    </div>
                                    <div className="text-gray-500">
                                      Category: <span className="text-gray-900 font-medium">Goals</span>
                                    </div>
                                    <div className="text-gray-500">
                                      Type: <span className="text-gray-900 font-medium">Match</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Footer CTA */}
              {!isPremium && (
                <div
                  className="mx-6 mb-6 p-4 rounded-xl flex items-center justify-between"
                  style={{ background: 'linear-gradient(to right, #091143, #11207f)' }}
                >
                  <div className="text-white">
                    <p className="font-semibold">Full Combo Access</p>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold">$9.99</span>
                      <span className="text-white/60 line-through text-sm">$19.99</span>
                      <span className="bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded">50% OFF</span>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/pricing')}
                    className="flex items-center gap-2 bg-white text-[#091143] font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <img src="/Lock.svg" alt="" className="w-4 h-4" />
                    Unlock Combo
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
