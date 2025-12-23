import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { TeamAvatar } from '@/components/ui/TeamAvatar';
import { Button } from '@/components/ui/button';
import { useCurrentSmartCombo } from '@/hooks/useSmartCombo';
import { useSmartComboPredictions } from '@/hooks/usePredictions';
import { useAuth } from '@/contexts/AuthContext';
import { TEST_CREDENTIALS } from '@/config/defaults';

export function SmartComboPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user, login, logout, error: authError, subscriptionStatus, hasAccess } = useAuth();
  const [showAuthPanel, setShowAuthPanel] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);

  // Check premium status - use hasAccess() which checks both subscriptionStatus and demo_premium flag
  const isPremium = hasAccess();

  // Login handlers
  const handleFreeLogin = async () => {
    setLoginLoading(true);
    try {
      await login(TEST_CREDENTIALS.FREE);
    } catch (err) {
      console.error('Free login failed:', err);
    } finally {
      setLoginLoading(false);
    }
  };

  const handlePremiumLogin = async () => {
    setLoginLoading(true);
    try {
      await login(TEST_CREDENTIALS.PREMIUM);
    } catch (err) {
      console.error('Premium login failed:', err);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  // Fetch combo metadata and fixture details
  const {
    data: comboResponse,
    isLoading: isLoadingCombo,
    error: comboError,
    refetch: refetchCombo,
  } = useCurrentSmartCombo();

  const combo = comboResponse?.data?.combo;
  const fixtures = comboResponse?.data?.fixtures || [];

  // Fetch predictions sorted by pct_change
  const {
    data: predictionsResponse,
    isLoading: isLoadingPredictions,
    refetch: refetchPredictions,
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

  // Refetch data when auth state changes
  useEffect(() => {
    refetchCombo();
    if (combo?.combo_id) {
      refetchPredictions();
    }
  }, [isAuthenticated, subscriptionStatus]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header currentPage="smart-combo" />

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

      <main className="flex-1">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-4 md:py-8">
          {/* Main Card Container - Same style as SmartCombo component */}
          <div
            className="rounded-2xl overflow-hidden shadow-lg"
            style={{ background: 'linear-gradient(to top right, #091143 65%, #11207f 100%)' }}
          >
            {/* Header Section */}
            <div className="p-4 md:p-6 text-white">
              {/* Title Row */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-0">
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
                  <h1 className="text-lg md:text-2xl font-bold">This Week's Smart Combo</h1>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 md:gap-1.5 bg-yellow-500/20 text-yellow-400 px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium">
                      <img src="/icon-trusted-pick.svg" alt="" className="w-3 h-3 md:w-4 md:h-4" /> Trusted Pick
                    </span>
                    <span className="flex items-center gap-1 md:gap-1.5 bg-blue-500/20 text-blue-400 px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium">
                      <img src="/icon-safe-pick.svg" alt="" className="w-3 h-3 md:w-4 md:h-4" /> Safe Pick
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats Row */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mt-4 gap-4">
                {/* Accuracy Circle */}
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="relative w-14 h-14 md:w-16 md:h-16 shrink-0">
                    <svg className="w-14 h-14 md:w-16 md:h-16 transform -rotate-90">
                      <circle
                        cx="50%"
                        cy="50%"
                        r="24"
                        className="md:hidden"
                        stroke="rgba(255,255,255,0.2)"
                        strokeWidth="4"
                        fill="none"
                      />
                      <circle
                        cx="50%"
                        cy="50%"
                        r="24"
                        className="md:hidden"
                        stroke="#22c55e"
                        strokeWidth="4"
                        fill="none"
                        strokeDasharray={`${(accuracy / 100) * 151} 151`}
                        strokeLinecap="round"
                      />
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        className="hidden md:block"
                        stroke="rgba(255,255,255,0.2)"
                        strokeWidth="4"
                        fill="none"
                      />
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        className="hidden md:block"
                        stroke="#22c55e"
                        strokeWidth="4"
                        fill="none"
                        strokeDasharray={`${(accuracy / 100) * 176} 176`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-white font-bold text-base md:text-lg">{accuracy}%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm md:text-base">Last Week Accuracy</p>
                    <p className="text-white/60 text-xs md:text-sm">Consistently delivering winning predictions</p>
                  </div>
                </div>

                {/* Stats Badges - Hidden on mobile, shown on desktop */}
                <div className="hidden md:flex items-center gap-4">
                  <div className="bg-[#1a2555] rounded-2xl px-6 py-2.5 text-center min-w-[100px]">
                    <div className="flex items-center justify-center mb-1">
                      <img src="/icon-success.svg" alt="Success Rate" className="w-10 h-10" />
                    </div>
                    <p className="text-white font-bold text-lg">{combo?.confidence ? Math.round(combo.confidence) : 87}%</p>
                    <p className="text-white/60 text-xs">Success Rate</p>
                  </div>
                  <div className="bg-[#1a2555] rounded-2xl px-6 py-2.5 text-center min-w-[100px]">
                    <div className="flex items-center justify-center mb-1">
                      <img src="/icon-proven.svg" alt="Proven" className="w-10 h-10" />
                    </div>
                    <p className="text-white font-bold text-lg">Proven</p>
                    <p className="text-white/60 text-xs">Track Record</p>
                  </div>
                  <div className="bg-[#1a2555] rounded-2xl px-6 py-2.5 text-center min-w-[100px]">
                    <div className="flex items-center justify-center mb-1">
                      <img src="/icon-expert.svg" alt="Expert" className="w-10 h-10" />
                    </div>
                    <p className="text-white font-bold text-lg">Expert</p>
                    <p className="text-white/60 text-xs">Analysis</p>
                  </div>
                  <div className="bg-[#1a2555] rounded-2xl px-6 py-2.5 text-center min-w-[100px]">
                    <div className="flex items-center justify-center mb-1">
                      <img src="/icon-global.svg" alt="Global" className="w-10 h-10" />
                    </div>
                    <p className="text-white font-bold text-lg">Global</p>
                    <p className="text-white/60 text-xs">Coverage</p>
                  </div>
                </div>

                {/* Mobile Stats Badges - 2x2 grid */}
                <div className="grid grid-cols-4 gap-2 md:hidden">
                  <div className="bg-[#1a2555] rounded-xl px-2 py-2 text-center">
                    <div className="flex items-center justify-center mb-0.5">
                      <img src="/icon-success.svg" alt="Success Rate" className="w-6 h-6" />
                    </div>
                    <p className="text-white font-bold text-sm">{combo?.confidence ? Math.round(combo.confidence) : 87}%</p>
                    <p className="text-white/60 text-[10px]">Success</p>
                  </div>
                  <div className="bg-[#1a2555] rounded-xl px-2 py-2 text-center">
                    <div className="flex items-center justify-center mb-0.5">
                      <img src="/icon-proven.svg" alt="Proven" className="w-6 h-6" />
                    </div>
                    <p className="text-white font-bold text-sm">Proven</p>
                    <p className="text-white/60 text-[10px]">Record</p>
                  </div>
                  <div className="bg-[#1a2555] rounded-xl px-2 py-2 text-center">
                    <div className="flex items-center justify-center mb-0.5">
                      <img src="/icon-expert.svg" alt="Expert" className="w-6 h-6" />
                    </div>
                    <p className="text-white font-bold text-sm">Expert</p>
                    <p className="text-white/60 text-[10px]">Analysis</p>
                  </div>
                  <div className="bg-[#1a2555] rounded-xl px-2 py-2 text-center">
                    <div className="flex items-center justify-center mb-0.5">
                      <img src="/icon-global.svg" alt="Global" className="w-6 h-6" />
                    </div>
                    <p className="text-white font-bold text-sm">Global</p>
                    <p className="text-white/60 text-[10px]">Coverage</p>
                  </div>
                </div>
              </div>
            </div>

            {/* White Content Area */}
            <div className="bg-white rounded-t-2xl">
              {/* Combo Overview Header */}
              <div className="flex items-center justify-between px-4 md:px-6 pt-4">
                <h2 className="text-xl md:text-3xl font-semibold text-gray-900">Combo Overview</h2>
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
                <div className="p-4 md:p-6 space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="border-2 border-dashed border-gray-200 rounded-xl p-4 md:p-6 animate-pulse">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 md:gap-3">
                          <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-200 rounded-full" />
                          <div className="h-4 bg-gray-200 rounded w-12 md:w-16" />
                        </div>
                        <div className="h-6 bg-gray-200 rounded w-16 md:w-20" />
                        <div className="flex items-center gap-2 md:gap-3">
                          <div className="h-4 bg-gray-200 rounded w-12 md:w-16" />
                          <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-200 rounded-full" />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="h-12 md:h-16 bg-gray-100 rounded-lg" />
                        <div className="h-12 md:h-16 bg-gray-100 rounded-lg hidden md:block" />
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
                <div className="p-4 md:p-6 space-y-4">
                  {fixtures.map((fixtureData, fixtureIndex) => {
                    const { fixture, predictions: fallbackPredictions } = fixtureData;
                    const predictions = predictionsByFixture.get(fixture.fixture_id) || fallbackPredictions;

                    const homeTeamLogo = fixture.home_team_image_path || fixture.home_team_logo_location;
                    const awayTeamLogo = fixture.away_team_image_path || fixture.away_team_logo_location;

                    // For free users: blur entire fixture card after the first one
                    const isFixtureBlurred = !isPremium && fixtureIndex > 0;

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
                        className={`border-2 border-dashed border-gray-300 rounded-xl p-3 md:p-5 hover:border-[#091143]/30 transition-colors ${isFixtureBlurred ? 'relative' : ''}`}
                      >
                        {/* Blur overlay for non-first fixtures (free users) */}
                        {isFixtureBlurred && (
                          <div className="absolute inset-0 backdrop-blur-[6px] bg-white/50 z-10 rounded-xl" />
                        )}
                        {/* Match Header */}
                        <div className="flex items-center justify-between mb-3 md:mb-4">
                          {/* Home Team */}
                          <div className="flex items-center gap-2 md:gap-3">
                            <TeamAvatar
                              logo={homeTeamLogo}
                              name={fixture.home_team_name || 'Home'}
                              shortName={fixture.home_team_name?.slice(0, 3).toUpperCase() || 'HOM'}
                              size="md"
                            />
                            <span className="font-bold text-gray-900 text-sm md:text-lg">
                              {fixture.home_team_name?.slice(0, 3).toUpperCase() || 'HOM'}
                            </span>
                          </div>

                          {/* Center - Competition, Time */}
                          <div className="flex flex-col items-center px-2">
                            <span className="text-gray-400 text-[10px] md:text-xs font-medium mb-0.5 md:mb-1 text-center line-clamp-1">
                              {fixture.league_name || 'International'}
                            </span>
                            <span className="font-bold text-gray-900 text-base md:text-xl">{kickoffTime}</span>
                            <span className="text-gray-400 text-[10px] md:text-xs font-medium">TODAY</span>
                          </div>

                          {/* Away Team */}
                          <div className="flex items-center gap-2 md:gap-3">
                            <span className="font-bold text-gray-900 text-sm md:text-lg">
                              {fixture.away_team_name?.slice(0, 3).toUpperCase() || 'AWY'}
                            </span>
                            <TeamAvatar
                              logo={awayTeamLogo}
                              name={fixture.away_team_name || 'Away'}
                              shortName={fixture.away_team_name?.slice(0, 3).toUpperCase() || 'AWY'}
                              size="md"
                            />
                          </div>
                        </div>

                        {/* Predictions */}
                        <div className="space-y-2 md:space-y-3">
                          {predictions.slice(0, 3).map((pred, idx) => {
                            // For free users: blur predictions after the first one (only in first fixture)
                            const isPredictionBlurred = !isPremium && fixtureIndex === 0 && idx > 0;
                            const percentage = Math.round(pred.prediction || pred.pre_game_prediction);

                            return (
                              <div
                                key={pred.prediction_id}
                                className={`border border-gray-200 rounded-lg p-3 md:p-4 ${isPredictionBlurred ? 'relative overflow-hidden' : ''}`}
                              >
                                {isPredictionBlurred && (
                                  <div className="absolute inset-0 backdrop-blur-[6px] bg-white/50 z-10 flex items-center justify-center rounded-lg" />
                                )}

                                {/* Prediction Label & Trend */}
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2 gap-1">
                                  <span className="font-medium text-gray-900 text-sm md:text-base">{pred.prediction_display_name}</span>
                                  <div className="flex items-center gap-1">
                                    {pred.pct_change_value !== null && pred.pct_change_value !== undefined && (
                                      <span className={`text-xs md:text-sm font-medium ${pred.pct_change_value >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                        {pred.pct_change_value >= 0 ? '↑' : '↓'} {Math.abs(pred.pct_change_value)}% in {pred.pct_change_interval || 13} min
                                      </span>
                                    )}
                                    <button className="ml-1 md:ml-2 text-gray-400 hover:text-gray-600">
                                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polyline points="6 9 12 15 18 9" />
                                      </svg>
                                    </button>
                                  </div>
                                </div>

                                {/* Progress Bar & Stats */}
                                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6">
                                  {/* Progress Bar */}
                                  <div className="flex items-center gap-2 md:gap-3 flex-1">
                                    <span className="text-green-500 font-bold text-base md:text-lg min-w-[40px] md:min-w-[48px]">{percentage}%</span>
                                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                                      <div
                                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${percentage}%` }}
                                      />
                                    </div>
                                  </div>

                                  {/* Stats - Hidden on mobile */}
                                  <div className="hidden md:flex items-center gap-6 text-sm">
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

            </div>
          </div>

          {/* Footer CTA - Separate box below main card */}
          {!isPremium && (
            <div
              className="mt-4 md:mt-6 p-3 md:p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3 md:gap-0 relative overflow-hidden"
              style={{ background: 'linear-gradient(to right, #091143, #11207f)' }}
            >
              {/* Abstract overlay on left side */}
              <img
                src="/cta-overlay.svg"
                alt=""
                className="absolute left-0 top-0 h-full opacity-50 pointer-events-none scale-x-[-1] hidden md:block"
              />
              {/* Abstract overlay on right side */}
              <img
                src="/cta-overlay.svg"
                alt=""
                className="absolute right-0 top-0 h-full opacity-50 pointer-events-none hidden md:block"
              />
              <div className="text-white relative z-10 text-center md:text-left">
                <p className="text-base md:text-lg font-semibold">Full Combo Access</p>
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <span className="text-2xl md:text-3xl font-bold">$9.99</span>
                  <span className="text-white/60 line-through text-sm md:text-base">$19.99</span>
                  <span className="bg-green-500 text-white text-xs md:text-sm font-bold px-2 py-0.5 md:py-1 rounded">50% OFF</span>
                </div>
              </div>
              <button
                onClick={() => navigate('/pricing')}
                className="flex items-center gap-2 bg-white text-[#091143] font-semibold px-4 md:px-6 py-2.5 md:py-3 rounded-lg hover:bg-gray-100 transition-colors relative z-10 w-full md:w-auto justify-center text-sm md:text-base"
              >
                <img src="/icon-unlock.svg" alt="" className="w-4 h-4" />
                Unlock Combo
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
