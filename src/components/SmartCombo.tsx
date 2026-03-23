import { useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MatchCard } from '@/components/MatchCard';
import { useCurrentSmartCombo } from '@/hooks/useSmartCombo';
import { useAuth } from '@/contexts/AuthContext';

interface SmartComboProps {
  isPremium?: boolean;
  compact?: boolean;
}

export function SmartCombo({ isPremium = false, compact = false }: SmartComboProps) {
  // Width classes: compact uses mobile sizes everywhere, default uses responsive
  const outerW = compact ? 'w-[358px]' : 'w-[358px] md:w-[460px]';
  const innerW = compact ? 'w-[342px]' : 'w-[342px] md:w-[444px]';
  const accentMobile = compact ? '' : 'md:hidden';
  const accentDesktop = compact ? 'hidden' : 'hidden md:flex';
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  // Fetch combo metadata and fixture details from /smart-combos/current
  // Only fetch when authenticated since the API requires auth
  const {
    data: comboResponse,
    isLoading: isLoadingCombo,
    error: comboError,
    refetch: refetchCombo,
  } = useCurrentSmartCombo({
    enabled: isAuthenticated,
  });

  const combo = comboResponse?.data?.combo;
  const fixtures = comboResponse?.data?.fixtures || [];

  // Refetch data when authentication state changes
  useEffect(() => {
    if (isAuthenticated) {
      refetchCombo();
    }
  }, [isAuthenticated]);

  // Convert fixtures to MatchCard format using inline predictions
  const matchCards = useMemo(() => {
    return fixtures.map((fixtureData) => {
      const { fixture, predictions } = fixtureData;

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
          id: fixture.home_team_id?.toString() || 'home',
          name: fixture.home_team_name || fixture.home_team_short_code || 'Home Team',
          shortName: fixture.home_team_short_code || fixture.home_team_name?.slice(0, 3).toUpperCase() || 'HOM',
          logo: homeTeamLogo,
        },
        awayTeam: {
          id: fixture.away_team_id?.toString() || 'away',
          name: fixture.away_team_name || fixture.away_team_short_code || 'Away Team',
          shortName: fixture.away_team_short_code || fixture.away_team_name?.slice(0, 3).toUpperCase() || 'AWY',
          logo: awayTeamLogo,
        },
        score: fixture.home_team_score != null && fixture.away_team_score != null
          ? { home: fixture.home_team_score, away: fixture.away_team_score }
          : undefined,
        status: fixture.minutes_elapsed != null ? 'live' as const : 'upcoming' as const,
        currentMinute: fixture.minutes_elapsed ?? undefined,
        kickoffTime,
        isToday: true,
        predictions: predictions.map((pred) => {
          const raw = pred.prediction ?? pred.pre_game_prediction ?? 0;
          return {
            id: pred.prediction_id.toString(),
            label: pred.prediction_display_name,
            percentage: Math.round(raw > 0 && raw <= 1 ? raw * 100 : raw),
            trend: {
              direction: (pred.pct_change_value || 0) >= 0 ? 'up' as const : 'down' as const,
              value: Math.abs(pred.pct_change_value || 0),
              timeframe: pred.pct_change_interval ? `${pred.pct_change_interval} min` : '5 min',
            },
          };
        }),
      };
    });
  }, [fixtures]);

  // Use accuracy from combo data
  const accuracy = useMemo(() => {
    const raw = combo?.previous_week_combo_accuracy;
    if (raw == null) return 85;
    return Math.round(raw > 0 && raw <= 1 ? raw * 100 : raw);
  }, [combo]);


  // Loading state
  if (isAuthLoading || isLoadingCombo) {
    return (
      <div className={`${outerW} mx-auto md:mx-0`}>
        <div
          className="rounded-2xl overflow-hidden shadow-lg p-[3px]"
          style={{ backgroundImage: 'linear-gradient(180deg, rgba(9, 17, 67, 0) 0%, rgba(9, 17, 67, 1) 100%), linear-gradient(0deg, rgba(13, 26, 103, 0.55) 0%, rgba(13, 26, 103, 0.55) 100%)', backgroundColor: '#0d1a67' }}
        >
          <div className="text-white px-4 py-3">
            <h2 className="text-[18px] md:text-[22px] font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>Smart Combo</h2>
          </div>
          <div className={`bg-white rounded-xl ${innerW} mx-auto mb-[3px] pt-[16px]`}>
            {/* Accuracy skeleton - Mobile: white with shadow, Desktop: grey */}
            <div className={`${accentMobile} bg-white rounded-xl w-[318px] h-[42px] mx-auto px-4 flex items-center shadow-md animate-pulse`}>
              <div className="flex items-center gap-2 w-full">
                <div className="h-5 bg-gray-200 rounded w-10" />
                <div className="h-4 bg-gray-200 rounded w-24" />
                <div className="flex-1 bg-gray-200 rounded-full h-2 ml-2" />
              </div>
            </div>
            <div className={`${accentDesktop} bg-gray-100 rounded-xl w-[412px] h-[42px] mx-auto px-4 items-center animate-pulse`}>
              <div className="flex items-center gap-3 w-full">
                <div className="h-5 bg-gray-300 rounded w-10" />
                <div className="h-4 bg-gray-300 rounded w-24" />
                <div className="flex-1 bg-gray-300 rounded-full h-2 ml-2" />
              </div>
            </div>
            {/* Card skeletons */}
            <div className="p-4 space-y-4">
              {/* Mobile: 1 skeleton, Desktop: 2 skeletons */}
              <div className={compact ? '' : 'md:hidden'}>
                <div className="bg-white rounded-xl p-3 shadow-md w-[318px] mx-auto animate-pulse">
                  <div className="h-3 bg-gray-200 rounded w-24 mb-2 mx-auto" />
                  <div className="flex items-center justify-between w-[294px] h-[56px] mx-auto mb-3 pb-3 border-b border-gray-100">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-8 h-8 bg-gray-200 rounded-full" />
                      <div className="h-2 bg-gray-200 rounded w-8" />
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-12" />
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-8 h-8 bg-gray-200 rounded-full" />
                      <div className="h-2 bg-gray-200 rounded w-8" />
                    </div>
                  </div>
                  <div className="h-10 bg-gray-100 rounded-lg" />
                </div>
              </div>
              <div className={compact ? 'hidden' : 'hidden md:block space-y-4'}>
                {[1, 2].map((i) => (
                  <div key={i} className="bg-white rounded-xl p-4 shadow-md w-[412px] mx-auto animate-pulse">
                    <div className="h-3 bg-gray-200 rounded w-32 mb-3 mx-auto" />
                    <div className="flex items-center justify-between w-[382px] h-[66px] mx-auto mb-4 pb-4 border-b border-gray-100">
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-10 h-10 bg-gray-200 rounded-full" />
                        <div className="h-3 bg-gray-200 rounded w-10" />
                      </div>
                      <div className="h-5 bg-gray-200 rounded w-14" />
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-10 h-10 bg-gray-200 rounded-full" />
                        <div className="h-3 bg-gray-200 rounded w-10" />
                      </div>
                    </div>
                    <div className="h-12 bg-gray-100 rounded-lg" />
                  </div>
                ))}
              </div>
            </div>
            {/* Button skeleton */}
            <div className="px-4 pb-4">
              <div className="w-full h-[36px] bg-gray-200 rounded-lg animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state (only show if authenticated - unauthenticated has its own state)
  if (comboError && isAuthenticated) {
    return (
      <div className={`${outerW} mx-auto md:mx-0`}>
        <div
          className="rounded-2xl overflow-hidden shadow-lg p-[3px]"
          style={{ backgroundImage: 'linear-gradient(180deg, rgba(9, 17, 67, 0) 0%, rgba(9, 17, 67, 1) 100%), linear-gradient(0deg, rgba(13, 26, 103, 0.55) 0%, rgba(13, 26, 103, 0.55) 100%)', backgroundColor: '#0d1a67' }}
        >
          <div className="text-white px-4 py-3">
            <h2 className="text-[18px] md:text-[22px] font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>Smart Combo</h2>
          </div>
          <div className={`bg-white rounded-xl ${innerW} mx-auto mb-[3px] p-8 text-center`}>
            <p className="text-red-500 font-medium">Failed to load Smart Combo</p>
            <p className="text-gray-500 text-sm mt-1">Please try again later</p>
          </div>
        </div>
      </div>
    );
  }

  // Unauthenticated state - show login prompt
  if (!isAuthenticated && !isLoadingCombo) {
    return (
      <div className={`${outerW} mx-auto md:mx-0`}>
        <div
          className="rounded-2xl overflow-hidden shadow-lg p-[3px]"
          style={{ backgroundImage: 'linear-gradient(180deg, rgba(9, 17, 67, 0) 0%, rgba(9, 17, 67, 1) 100%), linear-gradient(0deg, rgba(13, 26, 103, 0.55) 0%, rgba(13, 26, 103, 0.55) 100%)', backgroundColor: '#0d1a67' }}
        >
          <div className="text-white px-4 py-3">
            <h2 className="text-[18px] md:text-[22px] font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>Smart Combo</h2>
          </div>
          <div className={`bg-white rounded-xl ${innerW} mx-auto mb-[3px] p-6 text-center`}>
            <div className="w-12 h-12 mx-auto mb-3 bg-[#091143]/10 rounded-full flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#091143" strokeWidth="1.5">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <p className="text-gray-900 font-medium text-sm mb-1">Login to View</p>
            <p className="text-gray-500 text-xs">Access expert predictions</p>
          </div>
        </div>
      </div>
    );
  }

  // No data state
  if (!combo || matchCards.length === 0) {
    return (
      <div className={`${outerW} mx-auto md:mx-0`}>
        <div
          className="rounded-2xl overflow-hidden shadow-lg p-[3px]"
          style={{ backgroundImage: 'linear-gradient(180deg, rgba(9, 17, 67, 0) 0%, rgba(9, 17, 67, 1) 100%), linear-gradient(0deg, rgba(13, 26, 103, 0.55) 0%, rgba(13, 26, 103, 0.55) 100%)', backgroundColor: '#0d1a67' }}
        >
          <div className="text-white px-4 py-3">
            <h2 className="text-[18px] md:text-[22px] font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>Smart Combo</h2>
          </div>
          <div className={`bg-white rounded-xl ${innerW} mx-auto mb-[3px] p-8 text-center`}>
            <p className="text-gray-900 font-medium">No Smart Combo available</p>
            <p className="text-gray-500 text-sm mt-1">Check back later</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${outerW} mx-auto md:mx-0`}>
      <div
        className="rounded-2xl overflow-hidden shadow-lg p-[3px]"
        style={{ backgroundImage: 'linear-gradient(180deg, rgba(9, 17, 67, 0) 0%, rgba(9, 17, 67, 1) 100%), linear-gradient(0deg, rgba(13, 26, 103, 0.55) 0%, rgba(13, 26, 103, 0.55) 100%)', backgroundColor: '#0d1a67' }}
      >
        {/* Header - On gradient */}
        <div className="text-white px-4 py-3 flex items-center justify-between">
          <h2 className="text-[18px] md:text-[22px] font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>Smart Combo</h2>
          <button className="w-6 h-6 flex items-center justify-center hover:opacity-80 transition-opacity">
            <img src="/Infrmation-Circle.svg" alt="Info" className="w-6 h-6" />
          </button>
        </div>

        {/* White Content Area - Mobile: 342px, Desktop: 444px width, dynamic height */}
        <div className={`bg-white rounded-xl ${innerW} mx-auto ${compact ? 'mb-[8px] pt-[8px]' : 'mb-[8px] md:mb-[3px] pt-[8px] md:pt-[16px]'}`}>
          {/* Accuracy Section - Mobile: white with shadow, Desktop: grey background */}
          {/* Mobile version - white container with shadow */}
          <div className={`${accentMobile} bg-white rounded-xl w-[318px] h-[42px] mx-auto px-4 flex items-center shadow-md`}>
            <div className="flex items-center gap-2 w-full">
              <span className="text-gray-900 font-bold text-base">{accuracy}%</span>
              <span className="text-gray-500 text-xs">Accuracy last week</span>
              <div className="flex-1 bg-gray-200 rounded-full h-2 ml-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${accuracy}%` }}
                />
              </div>
            </div>
          </div>
          {/* Desktop version - grey background */}
          <div className={`${accentDesktop} bg-gray-100 rounded-xl w-[412px] h-[42px] mx-auto px-4 items-center`}>
            <div className="flex items-center gap-3 w-full">
              <span className="text-gray-900 font-bold text-lg">{accuracy}%</span>
              <span className="text-gray-500 text-sm whitespace-nowrap">Accuracy last week</span>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${accuracy}%` }}
                />
              </div>
            </div>
          </div>

          {/* Match Cards - Mobile: 1 card, Desktop: 2 cards */}
          <div className="p-4 pt-4 space-y-4">
            {/* Mobile: show 1 card, Desktop: show 2 cards */}
            <div className={compact ? '' : 'md:hidden'}>
              {matchCards.slice(0, 1).map((match) => (
                <MatchCard
                  key={match.id}
                  {...match}
                  variant="compact"
                  isPremium={isPremium}
                />
              ))}
            </div>
            <div className={compact ? 'hidden' : 'hidden md:block space-y-4'}>
              {matchCards.slice(0, 2).map((match) => (
                <MatchCard
                  key={match.id}
                  {...match}
                  variant="compact"
                  isPremium={isPremium}
                />
              ))}
            </div>
          </div>

          {/* See More Button - Inside white area */}
          <div className="px-4 pb-2 md:pb-4">
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
