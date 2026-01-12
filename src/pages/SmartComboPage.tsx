import { useMemo, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { TeamAvatar } from '@/components/ui/TeamAvatar';
import { LoginModal } from '@/components/ui/LoginModal';
import { RegisterModal } from '@/components/ui/RegisterModal';
import { useCurrentSmartCombo } from '@/hooks/useSmartCombo';
import { useSmartComboPredictions } from '@/hooks/usePredictions';
import { useAuth } from '@/contexts/AuthContext';

export function SmartComboPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: isAuthLoading, subscriptionStatus, hasAccess } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  // Check premium status - use hasAccess() which checks both subscriptionStatus and demo_premium flag
  const isPremium = hasAccess();

  // Fetch combo metadata and fixture details - only when authenticated
  const {
    data: comboResponse,
    isLoading: isLoadingCombo,
    error: comboError,
    refetch: refetchCombo,
  } = useCurrentSmartCombo({
    enabled: isAuthenticated, // Only fetch when authenticated
  });

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

  const isLoading = isAuthLoading || isLoadingCombo || isLoadingPredictions;

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

      <main className="flex-1">
        <div className="max-w-[1440px] mx-auto px-4 md:px-0 py-4 md:py-8">
          {/* Main Card Container - Figma: 1440x820, 30px corner radius, gradient border (bottom-left to top-right) */}
          <div
            className="rounded-[30px] overflow-hidden shadow-lg p-[12px]"
            style={{
              background: 'linear-gradient(to top right, #091143 0%, #172ba9 100%)',
            }}
          >
          {/* Inner content with same gradient background */}
          <div
            className="rounded-[18px] overflow-hidden"
            style={{
              background: 'linear-gradient(to top right, #091143 0%, #172ba9 100%)',
            }}
          >
            {/* Header Section - Figma: horizontal layout with space-between */}
            <div className="px-[18px] py-[18px] text-white">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                {/* Left Side - Title, Badges, and Accuracy */}
                <div className="flex flex-col gap-[10px]" style={{ maxWidth: '570px' }}>
                  {/* Title Row with Badges */}
                  <div className="flex flex-wrap items-center gap-3 md:gap-5">
                    <h1
                      className="text-lg md:text-[22px] font-semibold leading-[130%]"
                      style={{ fontFamily: 'Montserrat, sans-serif' }}
                    >
                      This Week's Smart Combo
                    </h1>
                    <div className="flex items-center gap-[10px]">
                      {/* Trusted Pick Badge */}
                      <span
                        className="flex items-center gap-[6px] bg-white/10 px-[10px] py-[6px] rounded-full text-[14px] font-medium"
                        style={{ fontFamily: 'Montserrat, sans-serif' }}
                      >
                        <img src="/icon-trusted-pick.svg" alt="" className="w-[18px] h-[18px]" />
                        Trusted Pick
                      </span>
                      {/* Safe Pick Badge */}
                      <span
                        className="flex items-center gap-[6px] bg-white/10 px-[10px] py-[6px] rounded-full text-[14px] font-medium"
                        style={{ fontFamily: 'Montserrat, sans-serif' }}
                      >
                        <img src="/icon-safe-pick.svg" alt="" className="w-[18px] h-[18px]" />
                        Safe Pick
                      </span>
                    </div>
                  </div>

                  {/* Accuracy Circle and Text */}
                  <div className="flex items-center gap-[10px]">
                    {/* Circular Progress - 60x60, strokeAlign INSIDE means radius should be (60-5.5)/2 = 27.25 */}
                    <div className="relative w-[60px] h-[60px] shrink-0">
                      <svg className="w-[60px] h-[60px] transform -rotate-90">
                        {/* Background circle - #253076 */}
                        <circle
                          cx="30"
                          cy="30"
                          r="27.25"
                          stroke="#253076"
                          strokeWidth="5.5"
                          fill="none"
                        />
                        {/* Progress circle - #27ae60 */}
                        <circle
                          cx="30"
                          cy="30"
                          r="27.25"
                          stroke="#27ae60"
                          strokeWidth="5.5"
                          fill="none"
                          strokeDasharray={`${(accuracy / 100) * (2 * Math.PI * 27.25)} ${2 * Math.PI * 27.25}`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span
                          className="text-white font-semibold text-[18px]"
                          style={{ fontFamily: 'Montserrat, sans-serif' }}
                        >
                          {accuracy}%
                        </span>
                      </div>
                    </div>
                    {/* Accuracy Text */}
                    <div className="flex flex-col gap-[4px]">
                      <p
                        className="text-white font-semibold text-[18px]"
                        style={{ fontFamily: 'Montserrat, sans-serif' }}
                      >
                        Last Week Accuracy
                      </p>
                      <p
                        className="text-[#a6aebb] text-[14px] font-medium leading-[20px]"
                        style={{ fontFamily: 'Montserrat, sans-serif' }}
                      >
                        Consistently delivering winning predictions
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Side - Stats Boxes (Desktop: 4 boxes in row, Mobile: 4 column grid) */}
                <div className="grid grid-cols-4 gap-3 md:gap-5">
                  {/* Success Rate */}
                  <div
                    className="bg-[#0d1a67] rounded-[12px] p-[10px] flex flex-col items-center justify-center"
                    style={{ width: '100px', height: '100px' }}
                  >
                    <img src="/icon-success.svg" alt="Success Rate" className="w-[34px] h-[34px] mb-[6px]" />
                    <p
                      className="text-white font-semibold text-[16px] leading-[150%]"
                      style={{ fontFamily: 'Montserrat, sans-serif' }}
                    >
                      {combo?.confidence ? Math.round(combo.confidence) : 87}%
                    </p>
                    <p
                      className="text-[#a6aebb] text-[12px] font-medium"
                      style={{ fontFamily: 'Montserrat, sans-serif' }}
                    >
                      Success Rate
                    </p>
                  </div>
                  {/* Proven Track Record */}
                  <div
                    className="bg-[#0d1a67] rounded-[12px] p-[10px] flex flex-col items-center justify-center"
                    style={{ width: '100px', height: '100px' }}
                  >
                    <img src="/icon-proven.svg" alt="Proven" className="w-[34px] h-[34px] mb-[6px]" />
                    <p
                      className="text-white font-semibold text-[16px] leading-[150%]"
                      style={{ fontFamily: 'Montserrat, sans-serif' }}
                    >
                      Proven
                    </p>
                    <p
                      className="text-[#a6aebb] text-[12px] font-medium"
                      style={{ fontFamily: 'Montserrat, sans-serif' }}
                    >
                      Track Record
                    </p>
                  </div>
                  {/* Expert Analysis */}
                  <div
                    className="bg-[#0d1a67] rounded-[12px] p-[10px] flex flex-col items-center justify-center"
                    style={{ width: '100px', height: '100px' }}
                  >
                    <img src="/icon-expert.svg" alt="Expert" className="w-[34px] h-[34px] mb-[6px]" />
                    <p
                      className="text-white font-semibold text-[16px] leading-[150%]"
                      style={{ fontFamily: 'Montserrat, sans-serif' }}
                    >
                      Expert
                    </p>
                    <p
                      className="text-[#a6aebb] text-[12px] font-medium"
                      style={{ fontFamily: 'Montserrat, sans-serif' }}
                    >
                      Analysis
                    </p>
                  </div>
                  {/* Global Coverage */}
                  <div
                    className="bg-[#0d1a67] rounded-[12px] p-[10px] flex flex-col items-center justify-center"
                    style={{ width: '100px', height: '100px' }}
                  >
                    <img src="/icon-global.svg" alt="Global" className="w-[34px] h-[34px] mb-[6px]" />
                    <p
                      className="text-white font-semibold text-[16px] leading-[150%]"
                      style={{ fontFamily: 'Montserrat, sans-serif' }}
                    >
                      Global
                    </p>
                    <p
                      className="text-[#a6aebb] text-[12px] font-medium"
                      style={{ fontFamily: 'Montserrat, sans-serif' }}
                    >
                      Coverage
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* White Content Area - Figma: 30px rounded corners to match outer container */}
            <div className="bg-white rounded-[30px]">
              {/* Combo Overview Header - Figma: space-between, 29px height */}
              <div className="flex items-center justify-between px-4 md:px-6 pt-4">
                <h2
                  className="text-[18px] md:text-[22px] font-semibold text-[#0a0a0a] leading-[130%]"
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                >
                  Combo Overview
                </h2>
                <button className="text-gray-400 hover:text-gray-600">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
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
              {comboError && !isLoading && isAuthenticated && (
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

              {/* Unauthenticated State - Prompt to login */}
              {!isLoading && !isAuthenticated && (
                <div className="p-12 text-center">
                  <div className="w-20 h-20 mx-auto mb-6 bg-[#091143]/10 rounded-full flex items-center justify-center">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#091143" strokeWidth="1.5">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </div>
                  <p className="text-gray-900 font-semibold text-xl mb-2">Login to View Smart Combo</p>
                  <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">
                    Access our expert predictions and weekly smart combos by logging in to your account.
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={() => setShowLoginModal(true)}
                      className="px-6 py-2.5 bg-[#091143] text-white rounded-lg hover:bg-[#11207f] transition-colors font-medium"
                    >
                      Login
                    </button>
                    <button
                      onClick={() => setShowRegisterModal(true)}
                      className="px-6 py-2.5 border border-[#091143] text-[#091143] rounded-lg hover:bg-[#091143]/5 transition-colors font-medium"
                    >
                      Create Account
                    </button>
                  </div>
                </div>
              )}

              {/* Empty State */}
              {!isLoading && !comboError && isAuthenticated && fixtures.length === 0 && (
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
                        className={`border border-[#e1e4eb] rounded-[20px] p-[14px] md:p-5 hover:border-[#091143]/30 transition-colors ${isFixtureBlurred ? 'select-none pointer-events-none' : ''}`}
                        style={isFixtureBlurred ? { filter: 'blur(10px)' } : {}}
                      >
                        {/* League Name - Figma: 1360x20, centered, 14px Montserrat Medium #7c8a9c */}
                        <div className="text-center">
                          <span
                            className="text-[12px] md:text-[14px] font-medium text-[#7c8a9c] leading-[20px]"
                            style={{ fontFamily: 'Montserrat, sans-serif' }}
                          >
                            {fixture.league_name || 'International'}
                          </span>
                        </div>

                        {/* Match Header - Figma: 1360x60, space-between, px-[20px], gap-[40px] */}
                        <div className="flex items-center justify-between mb-3 md:mb-4 md:px-[20px]">
                          {/* Home Team - Figma: gap 6px */}
                          <div className="flex items-center gap-[6px]">
                            <div className="w-[40px] h-[40px] md:w-[60px] md:h-[60px] shrink-0">
                              {homeTeamLogo ? (
                                <img
                                  src={homeTeamLogo}
                                  alt={fixture.home_team_name || 'Home'}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <TeamAvatar
                                  logo={homeTeamLogo}
                                  name={fixture.home_team_name || 'Home'}
                                  shortName={fixture.home_team_name?.slice(0, 3).toUpperCase() || 'HOM'}
                                  size="md"
                                />
                              )}
                            </div>
                            <span
                              className="text-[14px] md:text-[16px] font-semibold text-[#0a0a0a] leading-[24px]"
                              style={{ fontFamily: 'Montserrat, sans-serif' }}
                            >
                              {fixture.home_team_name?.slice(0, 3).toUpperCase() || 'HOM'}
                            </span>
                          </div>

                          {/* Center - Time - Figma: 76px wide, vertical layout */}
                          <div className="flex flex-col items-center w-[60px] md:w-[76px]">
                            <span
                              className="text-[14px] md:text-[18px] font-semibold text-[#0a0a0a]"
                              style={{ fontFamily: 'Montserrat, sans-serif' }}
                            >
                              {kickoffTime}
                            </span>
                            <span
                              className="text-[12px] md:text-[14px] font-medium text-[#7c8a9c] leading-[20px]"
                              style={{ fontFamily: 'Montserrat, sans-serif' }}
                            >
                              TODAY
                            </span>
                          </div>

                          {/* Away Team - Figma: gap 6px, right aligned */}
                          <div className="flex items-center gap-[6px]">
                            <span
                              className="text-[14px] md:text-[16px] font-semibold text-[#0a0a0a] leading-[24px]"
                              style={{ fontFamily: 'Montserrat, sans-serif' }}
                            >
                              {fixture.away_team_name?.slice(0, 3).toUpperCase() || 'AWY'}
                            </span>
                            <div className="w-[40px] h-[40px] md:w-[60px] md:h-[60px] shrink-0">
                              {awayTeamLogo ? (
                                <img
                                  src={awayTeamLogo}
                                  alt={fixture.away_team_name || 'Away'}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <TeamAvatar
                                  logo={awayTeamLogo}
                                  name={fixture.away_team_name || 'Away'}
                                  shortName={fixture.away_team_name?.slice(0, 3).toUpperCase() || 'AWY'}
                                  size="md"
                                />
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Predictions */}
                        <div className="space-y-2 md:space-y-3">
                          {predictions.slice(0, 3).map((pred, idx) => {
                            // For free users: blur predictions after the first one (only in first fixture)
                            const isPredictionBlurred = !isPremium && fixtureIndex === 0 && idx > 0;
                            const percentage = Math.round(pred.prediction || pred.pre_game_prediction);
                            const preGamePercentage = Math.round(pred.pre_game_prediction || 0);
                            const category = pred.prediction_type?.includes('goal') ? 'Goals' : pred.prediction_type?.includes('card') ? 'Cards' : 'Match';
                            const predType = pred.prediction_type === 'player' ? 'Player' : 'Match';

                            return (
                              <div
                                key={pred.prediction_id}
                                className={`bg-white border border-[#e1e4eb] rounded-[16px] p-[16px] shadow-[0_2px_15px_rgba(0,0,0,0.1)] flex items-center gap-[20px] ${isPredictionBlurred ? 'select-none pointer-events-none' : ''}`}
                                style={isPredictionBlurred ? { filter: 'blur(10px)' } : {}}
                              >
                                {/* Main Content */}
                                <div className="flex-1 flex flex-col gap-[14px]">
                                  {/* Prediction Name - Figma: 18px Montserrat Medium #0a0a0a */}
                                  <span
                                    className="text-[14px] md:text-[18px] font-medium text-[#0a0a0a] leading-[135%]"
                                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                                  >
                                    {pred.prediction_display_name}
                                  </span>

                                  {/* Progress Bar Row - Figma: horizontal layout, gap 40px */}
                                  <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-[40px]">
                                    {/* Progress Bar Section - flexible width to allow stats to fit */}
                                    <div className="w-full md:w-auto md:min-w-[300px] md:flex-1 flex flex-col gap-[2px]">
                                      {/* Progress Bar - Figma: 6px height, rounded-[100px], bg #27ae60/10 */}
                                      <div className="w-full h-[6px] rounded-[100px]" style={{ backgroundColor: 'rgba(39, 174, 96, 0.1)' }}>
                                        <div
                                          className="h-[6px] rounded-[100px] transition-all duration-300"
                                          style={{ width: `${percentage}%`, backgroundColor: '#27ae60' }}
                                        />
                                      </div>
                                      {/* Percentage and Trend Row */}
                                      <div className="flex items-center justify-between">
                                        <span
                                          className="text-[14px] font-semibold leading-[150%]"
                                          style={{ fontFamily: 'Montserrat, sans-serif', color: '#27ae60' }}
                                        >
                                          {percentage}%
                                        </span>
                                        {pred.pct_change_value !== null && pred.pct_change_value !== undefined && (
                                          <span
                                            className="text-[12px] font-medium"
                                            style={{ fontFamily: 'Montserrat, sans-serif', color: pred.pct_change_value >= 0 ? '#27ae60' : '#e74c3c' }}
                                          >
                                            {pred.pct_change_value >= 0 ? '↑' : '↓'} {Math.abs(pred.pct_change_value)}% in the last {pred.pct_change_interval || 13} min
                                          </span>
                                        )}
                                      </div>
                                    </div>

                                    {/* Divider - Hidden on mobile */}
                                    <div className="hidden md:block w-[1px] h-[24px] bg-[#e1e4eb]" />

                                    {/* Pre-game Prediction - Hidden on mobile */}
                                    <div className="hidden md:flex items-center gap-[10px]">
                                      <span
                                        className="text-[14px] font-medium text-[#7c8a9c] leading-[20px]"
                                        style={{ fontFamily: 'Montserrat, sans-serif' }}
                                      >
                                        Pre-game Prediction:
                                      </span>
                                      <span
                                        className="text-[16px] font-semibold leading-[24px]"
                                        style={{ fontFamily: 'Montserrat, sans-serif', color: '#27ae60' }}
                                      >
                                        {preGamePercentage}%
                                      </span>
                                    </div>

                                    {/* Divider - Hidden on mobile */}
                                    <div className="hidden md:block w-[1px] h-[24px] bg-[#e1e4eb]" />

                                    {/* Category - Hidden on mobile */}
                                    <div className="hidden md:flex items-center gap-[10px]">
                                      <span
                                        className="text-[14px] font-medium text-[#7c8a9c] leading-[20px]"
                                        style={{ fontFamily: 'Montserrat, sans-serif' }}
                                      >
                                        Category:
                                      </span>
                                      <span
                                        className="text-[16px] font-semibold text-[#0a0a0a] leading-[24px]"
                                        style={{ fontFamily: 'Montserrat, sans-serif' }}
                                      >
                                        {category}
                                      </span>
                                    </div>

                                    {/* Divider - Hidden on mobile */}
                                    <div className="hidden md:block w-[1px] h-[24px] bg-[#e1e4eb]" />

                                    {/* Type - Hidden on mobile */}
                                    <div className="hidden md:flex items-center gap-[10px]">
                                      <span
                                        className="text-[14px] font-medium text-[#7c8a9c] leading-[20px]"
                                        style={{ fontFamily: 'Montserrat, sans-serif' }}
                                      >
                                        Type:
                                      </span>
                                      <span
                                        className="text-[16px] font-semibold text-[#0a0a0a] leading-[24px]"
                                        style={{ fontFamily: 'Montserrat, sans-serif' }}
                                      >
                                        {predType}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Down Arrow Icon - Figma: 24x24 */}
                                <button className="text-[#7c8a9c] hover:text-[#0a0a0a] transition-colors shrink-0">
                                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="6 9 12 15 18 9" />
                                  </svg>
                                </button>
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
          </div>

          {/* Footer CTA - Separate box below main card */}
          {!isPremium && (
            <div className="mt-4 md:mt-6 grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              {/* Weekly Pass Option */}
              <div
                className="p-3 md:p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4 relative overflow-hidden"
                style={{ background: 'linear-gradient(to right, #091143, #11207f)' }}
              >
                {/* Abstract overlay */}
                <img
                  src="/cta-overlay.svg"
                  alt=""
                  className="absolute right-0 top-0 h-full opacity-50 pointer-events-none hidden md:block"
                />
                <div className="text-white relative z-10 text-center md:text-left flex-1">
                  <p className="text-sm md:text-base font-semibold">Weekly Pass</p>
                  <div className="flex items-center justify-center md:justify-start gap-2">
                    <span className="text-xl md:text-2xl font-bold">$3.99</span>
                    <span className="text-white/60 text-xs md:text-sm">/week</span>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/pricing')}
                  className="flex items-center gap-2 bg-white text-[#091143] font-semibold px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors relative z-10 w-full md:w-auto justify-center text-sm"
                >
                  <img src="/icon-unlock.svg" alt="" className="w-4 h-4" />
                  Get Weekly
                </button>
              </div>

              {/* Monthly Pro Option */}
              <div
                className="p-3 md:p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4 relative overflow-hidden"
                style={{ background: 'linear-gradient(to right, #091143, #11207f)' }}
              >
                {/* Abstract overlay */}
                <img
                  src="/cta-overlay.svg"
                  alt=""
                  className="absolute right-0 top-0 h-full opacity-50 pointer-events-none hidden md:block"
                />
                <div className="text-white relative z-10 text-center md:text-left flex-1">
                  <p className="text-sm md:text-base font-semibold">Monthly Pro</p>
                  <div className="flex items-center justify-center md:justify-start gap-2">
                    <span className="text-xl md:text-2xl font-bold">$9.99</span>
                    <span className="text-white/60 line-through text-xs md:text-sm">$19.99</span>
                    <span className="bg-green-500 text-white text-[10px] md:text-xs font-bold px-1.5 py-0.5 rounded">50% OFF</span>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/pricing')}
                  className="flex items-center gap-2 bg-white text-[#091143] font-semibold px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors relative z-10 w-full md:w-auto justify-center text-sm"
                >
                  <img src="/icon-unlock.svg" alt="" className="w-4 h-4" />
                  Get Monthly
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSwitchToRegister={() => {
          setShowLoginModal(false);
          setShowRegisterModal(true);
        }}
      />

      {/* Register Modal */}
      <RegisterModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onSwitchToLogin={() => {
          setShowRegisterModal(false);
          setShowLoginModal(true);
        }}
      />
    </div>
  );
}
