import { useState, useMemo } from 'react'; // useState still used for activeTab
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { MatchBanner } from '@/components/MatchBanner';
import { useFixtures, useFixtureStatistics, useFixtureCommentary } from '@/hooks/useFixtures';

type TabType = 'predictions' | 'commentary' | 'stats' | 'lineups';

// Prediction card component with expand/collapse
function PredictionCard({ prediction, index: _index, isLive }: { prediction: any; index: number; isLive: boolean }) {
  // Featured predictions are always expanded, non-featured are always collapsed
  const isFeatured = prediction.is_featured === true;
  const isExpanded = isFeatured;

  const percentage = Math.round(prediction.prediction || prediction.pre_game_prediction || 0);
  const preGamePercentage = Math.round(prediction.pre_game_prediction || 0);
  const pctChange = prediction.pct_change_value || 0;
  const isPlayer = prediction.prediction_type === 'player' || prediction.player_id;

  // Mock insights for expanded view
  const insights = [
    prediction.prediction_display_name,
    `${prediction.player_name || 'Player'} usually takes 5+ shots on target when playing against ${prediction.opponent_name || 'opponents'}`,
    `In the past 10 sunny games, ${prediction.player_name || 'player'} has scored every single match!`,
  ];

  return (
    <div className={`rounded-xl overflow-hidden ${isExpanded ? 'bg-[#0d1a67] pt-4 px-2.5 pb-2.5' : 'border border-gray-200'}`}>
      {/* Header */}
      <div
        className={`w-full flex items-center justify-between ${
          isExpanded ? 'px-1 pb-4' : 'bg-white px-5 py-4'
        }`}
      >
        <span className={`font-semibold text-sm text-left ${isExpanded ? 'text-white' : 'text-gray-900'}`}>
          {prediction.prediction_display_name || 'Prediction'}
        </span>
        <div className="flex items-center gap-3">
          {isPlayer && (
            <span className={`px-3 py-1 text-xs font-medium rounded-full border ${
              isExpanded
                ? 'bg-transparent text-white border-white'
                : 'bg-gray-100 text-gray-700 border-gray-200'
            }`}>
              Player
            </span>
          )}
        </div>
      </div>

      {/* Content - White background */}
      <div className={`bg-white px-5 py-4 ${isExpanded ? 'rounded-lg' : ''}`}>
        {/* Progress bar and percentages */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-green-500 font-bold text-lg">{percentage}%</span>
            <span className={`text-sm ${pctChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {pctChange >= 0 ? '↑' : '↓'} {Math.abs(pctChange).toFixed(0)}% in the last 13 min
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-green-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* Pre-game prediction */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">{isLive ? 'Pre-game Prediction:' : 'Pre-game Prediction:'}</span>
          <span className="text-[#0d1a67] font-semibold">{preGamePercentage}%</span>
        </div>

        {/* Insights - Only show when expanded */}
        {isExpanded && (
          <div className="space-y-2.5 mt-4 pt-4 border-t border-gray-100">
            {insights.map((insight, idx) => (
              <div key={idx} className="flex items-start gap-2.5">
                <img src="/Vector.svg" alt="" className="w-4 h-4 mt-0.5 shrink-0" />
                <span className="text-gray-700 text-sm">{insight}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Weather card component
function WeatherCard({
  time,
  temp,
  icon,
  isNow,
}: {
  time: string;
  temp: number;
  icon: string;
  isNow?: boolean;
}) {
  const getWeatherIcon = (iconType: string) => {
    switch (iconType) {
      case 'sunny':
        return '☀️';
      case 'partly-cloudy':
        return '⛅';
      case 'cloudy':
        return '☁️';
      case 'rainy':
        return '🌧️';
      case 'night':
        return '🌙';
      default:
        return '☀️';
    }
  };

  return (
    <div className="flex flex-col items-center w-20 md:w-auto">
      <span className="text-gray-900 font-semibold text-sm md:text-lg">{temp}°C</span>
      <span className="text-2xl md:text-4xl my-1 md:my-2">{getWeatherIcon(icon)}</span>
      <span className="text-gray-500 text-xs md:text-sm">{isNow ? 'Now' : time}</span>
    </div>
  );
}

// Divider component for weather timeline
function WeatherDivider({ type }: { type: 'normal' | 'match-start' | 'match-end' }) {
  if (type === 'match-start') {
    return (
      <div className="self-stretch flex flex-col items-center justify-center min-h-[60px] md:min-h-0">
        <div className="flex flex-col items-center h-full">
          <div className="w-px h-4 md:flex-1 bg-[#0d1a67]" />
          <div
            className="flex items-center gap-0.5 md:gap-1 text-[8px] md:text-[10px] text-[#0d1a67] font-medium py-0.5 md:py-1"
            style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
          >
            <img src="/Vector.svg" alt="" className="w-2 h-2 md:w-3 md:h-3" style={{ transform: 'rotate(90deg)' }} />
            <span>Match Start</span>
          </div>
          <div className="w-px h-4 md:flex-1 bg-[#0d1a67]" />
        </div>
      </div>
    );
  }

  if (type === 'match-end') {
    return (
      <div className="self-stretch flex flex-col items-center justify-center min-h-[60px] md:min-h-0">
        <div className="flex flex-col items-center h-full">
          <div className="w-px h-6 md:flex-1 bg-orange-500" />
          <span
            className="text-[8px] md:text-[10px] text-orange-500 font-medium py-0.5 md:py-1"
            style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
          >
            Match End
          </span>
          <div className="w-px h-6 md:flex-1 bg-orange-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="self-stretch flex items-center justify-center min-h-[60px] md:min-h-0">
      <div className="w-px h-24 md:h-full bg-gray-200" />
    </div>
  );
}

// Player position component for lineup
function PlayerPosition({
  number,
  name,
  position,
  isHome,
  isCaptain,
}: {
  number: number;
  name: string;
  position: { x: number; y: number };
  isHome: boolean;
  isCaptain?: boolean;
}) {
  return (
    <div
      className="absolute flex flex-col items-center transform -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${position.x}%`, top: `${position.y}%` }}
    >
      <div className={`relative w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
        isHome ? 'bg-[#0d1a67] text-white' : 'bg-white text-[#0d1a67] border-2 border-[#0d1a67]'
      }`}>
        {number}
        {isCaptain && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center text-[8px] text-black font-bold">
            C
          </span>
        )}
      </div>
      <span className="mt-1 text-[10px] font-medium text-white bg-black/60 px-1.5 py-0.5 rounded whitespace-nowrap">
        {name}
      </span>
    </div>
  );
}

// Substitution row component - matches Figma design
function SubstitutionRow({
  homePlayer,
  awayPlayer,
}: {
  homePlayer?: { name: string; subName: string; minute: string; image?: string; hasIcon?: 'yellow' | 'ucl' };
  awayPlayer?: { name: string; subName: string; minute: string; image?: string; hasIcon?: 'yellow' | 'ucl' };
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
      {/* Home side player (left) */}
      <div className="flex items-center gap-3 flex-1">
        {homePlayer && (
          <>
            <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden shrink-0">
              {homePlayer.image ? (
                <img src={homePlayer.image} alt={homePlayer.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gray-300" />
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                {homePlayer.name}
                {homePlayer.hasIcon === 'ucl' && (
                  <svg className="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="12" r="10" />
                  </svg>
                )}
              </p>
              <p className="text-xs text-gray-400">
                <span className="text-green-500">↗</span> {homePlayer.subName}. {homePlayer.minute}
              </p>
            </div>
          </>
        )}
      </div>

      {/* Away side player (right) */}
      <div className="flex items-center gap-3 flex-1 justify-end">
        {awayPlayer && (
          <>
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900 flex items-center justify-end gap-1">
                {awayPlayer.hasIcon === 'yellow' && (
                  <span className="w-3 h-4 bg-yellow-400 rounded-sm inline-block" />
                )}
                {awayPlayer.name}
              </p>
              <p className="text-xs text-gray-400">
                {awayPlayer.minute} {awayPlayer.subName}. <span className="text-green-500">↗</span>
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden shrink-0">
              {awayPlayer.image ? (
                <img src={awayPlayer.image} alt={awayPlayer.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gray-300" />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Stat comparison bar component
function StatBar({
  label,
  homeValue,
  awayValue,
  isPercentage = false
}: {
  label: string;
  homeValue: number;
  awayValue: number;
  isPercentage?: boolean;
}) {
  const total = homeValue + awayValue;
  const homePercent = total > 0 ? (homeValue / total) * 100 : 50;
  const awayPercent = total > 0 ? (awayValue / total) * 100 : 50;
  const homeWinning = homeValue > awayValue;
  const awayWinning = awayValue > homeValue;

  return (
    <div className="py-5">
      <p className="text-center text-gray-900 font-semibold mb-3">{label}</p>
      <div className="flex items-center gap-4">
        <span className={`w-12 text-left font-semibold ${homeWinning ? 'text-green-500' : 'text-gray-900'}`}>
          {isPercentage ? `${homeValue}%` : homeValue}
        </span>
        <div className="flex-1 flex h-2 gap-1">
          {/* Home bar - grows from center to left */}
          <div className="flex-1 flex justify-end bg-gray-200 rounded-full">
            <div
              className={`h-full rounded-full ${homeWinning ? 'bg-green-500' : 'bg-gray-900'}`}
              style={{ width: `${homePercent}%` }}
            />
          </div>
          {/* Away bar - grows from center to right */}
          <div className="flex-1 flex justify-start bg-gray-200 rounded-full">
            <div
              className={`h-full rounded-full ${awayWinning ? 'bg-green-500' : 'bg-gray-900'}`}
              style={{ width: `${awayPercent}%` }}
            />
          </div>
        </div>
        <span className={`w-12 text-right font-semibold ${awayWinning ? 'text-green-500' : 'text-gray-900'}`}>
          {isPercentage ? `${awayValue}%` : awayValue}
        </span>
      </div>
    </div>
  );
}

// Commentary item component
function CommentaryItem({
  minute,
  type,
  comment,
  score,
  isGoal,
}: {
  minute: string;
  type: 'whistle' | 'clock' | 'corner' | 'goal' | 'yellow_card' | 'red_card' | 'substitution' | 'chance' | 'general';
  comment: string;
  score?: string;
  isGoal?: boolean;
}) {
  const getIcon = () => {
    switch (type) {
      case 'whistle':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-gray-500">
            <circle cx="8" cy="12" r="6" stroke="currentColor" strokeWidth="2" />
            <path d="M14 12h6M17 9l3 3-3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        );
      case 'clock':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-gray-500">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
            <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        );
      case 'corner':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-gray-500">
            <path d="M4 4v16M4 4h4M4 4l8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        );
      case 'goal':
        return (
          <div className="flex items-center gap-1.5 bg-[#0d1a67] text-white px-2.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap">
            <img src="/Vector.svg" alt="" className="w-3.5 h-3.5 invert" />
            <span>{score}</span>
          </div>
        );
      case 'yellow_card':
        return (
          <div className="w-4 h-5 bg-yellow-400 rounded-sm" />
        );
      case 'red_card':
        return (
          <div className="w-4 h-5 bg-red-500 rounded-sm" />
        );
      case 'substitution':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-gray-500">
            <path d="M7 10l-3 3 3 3" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M17 10l3-3-3-3" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M4 13h8M12 7h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        );
      case 'chance':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-blue-500">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
            <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex items-start gap-4 py-4 border-b border-gray-100 last:border-b-0">
      <span className="text-gray-500 font-medium text-sm w-14 shrink-0">{minute}</span>
      <div className="w-20 shrink-0 flex justify-center">{getIcon()}</div>
      <p className={`text-sm flex-1 ${isGoal ? 'text-orange-500 font-medium' : 'text-gray-700'}`}>
        {comment}
      </p>
    </div>
  );
}

// Mobile Bottom Navigation
function MobileBottomNav() {
  const navigate = useNavigate();

  const tabs = [
    { id: 'home', label: 'Home', path: '/' },
    { id: 'live', label: 'Live', path: '/matches' },
    { id: 'combos', label: 'Combos', path: '/smart-combo' },
    { id: 'login', label: 'Login', path: '/login' },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0d1a67]">
      <div className="flex items-center justify-center gap-8 py-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => navigate(tab.path)}
            className="text-sm font-medium text-white/60"
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="border-t border-white/20 py-4">
        <p className="text-center text-white/50 text-xs">
          © 2025 Sports Predictions Platform. All rights reserved.
        </p>
      </div>
    </div>
  );
}

export function MatchDetailPage() {
  const { fixtureId } = useParams<{ fixtureId: string }>();
  const [activeTab, setActiveTab] = useState<TabType>('predictions');

  // Fetch specific fixture by ID (backend returns fixture with predictions)
  const { data: fixturesResponse, isLoading: isLoadingFixtures } = useFixtures(
    fixtureId ? { fixture_ids: [parseInt(fixtureId, 10)] } : undefined,
    { enabled: !!fixtureId }
  );

  // Get the fixture from response (should be the only one when fetching by ID)
  const fixtureData = useMemo(() => {
    const fixtures = fixturesResponse?.data?.fixtures || [];
    return fixtures[0] || null;
  }, [fixturesResponse]);

  const fixture = fixtureData?.fixture;
  const predictions = fixtureData?.predictions || [];

  // Fetch fixture statistics
  const { data: statsResponse, isLoading: isLoadingStats } = useFixtureStatistics(fixtureId || '');
  const stats = statsResponse?.data;

  // Fetch fixture commentary
  const { data: commentaryResponse, isLoading: isLoadingCommentary } = useFixtureCommentary(fixtureId || '');
  const commentaryData = commentaryResponse?.data;

  // Mock commentary data (used when API doesn't return data)
  const mockCommentary: Array<{
    minute: string;
    type: 'whistle' | 'clock' | 'corner' | 'goal' | 'yellow_card' | 'red_card' | 'substitution' | 'chance' | 'general';
    comment: string;
    score?: string;
    isGoal?: boolean;
  }> = [
    { minute: "90+6'", type: 'whistle', comment: "The referee checks his watch and blows his whistle to signal the end of this match." },
    { minute: "90+3'", type: 'general', comment: "Atalanta seem to be finding their feet as they enjoy some possession. Great movement by the offensive players allows the defenders to set up the attack." },
    { minute: "90'", type: 'clock', comment: "Juan Cuadrado (Pisa) delivers a poor cross from a free kick as one of the defenders comfortably clears it away." },
    { minute: "90'", type: 'corner', comment: "A quickly taken corner by Pisa." },
    { minute: "87'", type: 'goal', score: '2 - 1', comment: "G O O O A A A L - Vinicius Junior scores with the right foot!", isGoal: true },
    { minute: "84'", type: 'yellow_card', comment: "Ivan Juric isn't happy on the touchline after referee Alberto Arena shows him a yellow card." },
    { minute: "82'", type: 'chance', comment: "Charles De Ketelaere (Atalanta) meets a cross inside the box, but Adrian Semper wins the battle for the ball and the chance is gone." },
    { minute: "80'", type: 'general', comment: "Atalanta seem to be finding their feet as they enjoy some possession. Great movement by the offensive players allows the defenders to set up the attack." },
    { minute: "76'", type: 'substitution', comment: "Daniel Denoon (Pisa) is being substituted because of an injury. Alberto Gilardino sends Arturo Calabresi on the pitch." },
    { minute: "70'", type: 'goal', score: '1 - 1', comment: "Gianluca Scamacca (Atalanta) has acres of space after latching on to a precise pass into the box. He doesn't hesitate to release a low effort which ends up in the bottom right corner.", isGoal: true },
    { minute: "66'", type: 'general', comment: "Henrik Meister (Pisa) tries to latch onto a through ball, but it's too long." },
  ];

  // Mock weather data for display - dividerAfter specifies what divider comes after this card
  const weatherData: Array<{
    time: string;
    temp: number;
    icon: string;
    isNow?: boolean;
    dividerAfter?: 'normal' | 'match-start' | 'match-end';
  }> = [
    { time: 'Now', temp: 21, icon: 'sunny', isNow: true, dividerAfter: 'normal' },
    { time: '3:00 pm', temp: 24, icon: 'sunny', dividerAfter: 'normal' },
    { time: '4:00 pm', temp: 24, icon: 'sunny', dividerAfter: 'match-start' },
    { time: '4:30 pm', temp: 25, icon: 'sunny', dividerAfter: 'normal' },
    { time: '6:00 pm', temp: 30, icon: 'partly-cloudy', dividerAfter: 'match-end' },
    { time: '7:00 pm', temp: 32, icon: 'cloudy', dividerAfter: 'normal' },
    { time: '8:00 pm', temp: 29, icon: 'cloudy', dividerAfter: 'normal' },
    { time: '9:00 pm', temp: 27, icon: 'night' },
  ];

  const tabs = [
    { id: 'predictions' as TabType, label: 'Predictions' },
    { id: 'commentary' as TabType, label: 'Commentary' },
    { id: 'stats' as TabType, label: 'Stats' },
    { id: 'lineups' as TabType, label: 'Lineups' },
  ];

  // Loading skeleton
  if (isLoadingFixtures) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-6 pb-32 md:pb-6">
          {/* Banner Skeleton */}
          <div className="rounded-xl overflow-hidden bg-gradient-to-b from-[#1a2a4a] to-[#0d1829] animate-pulse mb-6">
            <div className="px-8 py-12">
              <div className="flex items-center justify-center gap-8">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-white/20" />
                  <div className="h-6 bg-white/20 rounded w-16" />
                </div>
                <div className="h-16 bg-white/20 rounded w-32" />
                <div className="flex items-center gap-4">
                  <div className="h-6 bg-white/20 rounded w-16" />
                  <div className="w-16 h-16 rounded-full bg-white/20" />
                </div>
              </div>
            </div>
          </div>
          {/* Content Skeleton */}
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-4" />
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
                <div className="h-2 bg-gray-200 rounded w-full" />
              </div>
            ))}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Not found state
  if (!fixture) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header currentPage="matches" />
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-12 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Match Not Found</h1>
          <p className="text-gray-500 mb-6">The match you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-2 bg-[#0d1a67] text-white rounded-lg hover:bg-[#0a1450] transition-colors"
          >
            Go Back
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentPage="matches" />

      <main className="pb-32 md:pb-0">
        {/* Match Banner - Using reusable component */}
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 pt-6">
          <MatchBanner fixture={fixture} predictions={[]} showPredictions={false} />
        </div>

        {/* Content */}
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-6">
          {/* Tabs */}
          <div className="flex items-center justify-between mb-6">
            <div className="bg-gray-100 rounded-xl p-1 flex items-center">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-5 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-[#0d1a67] text-white'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
              {activeTab === 'commentary' ? 'All Comments' : 'Basic'}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
          </div>

          {/* Predictions Tab */}
          {activeTab === 'predictions' && (
            <div className="space-y-4">
              {isLoadingFixtures ? (
                // Loading skeleton
                [1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
                    <div className="h-5 bg-gray-200 rounded w-3/4 mb-4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
                    <div className="h-2 bg-gray-200 rounded w-full" />
                  </div>
                ))
              ) : predictions.length > 0 ? (
                predictions.map((prediction: any, index: number) => (
                  <PredictionCard
                    key={prediction.prediction_id || index}
                    prediction={prediction}
                    index={index}
                    isLive={fixture?.minutes_elapsed !== null && fixture?.minutes_elapsed !== undefined}
                  />
                ))
              ) : (
                <div className="text-center py-12 text-gray-500">
                  No predictions available for this match
                </div>
              )}
            </div>
          )}

          {/* Commentary Tab */}
          {activeTab === 'commentary' && (
            <div className="bg-white rounded-xl border border-gray-200">
              {isLoadingCommentary ? (
                <div className="p-6 space-y-4 animate-pulse">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-start gap-4 py-4 border-b border-gray-100">
                      <div className="w-12 h-4 bg-gray-200 rounded" />
                      <div className="w-8 h-6 bg-gray-200 rounded" />
                      <div className="flex-1 h-4 bg-gray-200 rounded" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-6">
                  {!commentaryData && (
                    <div className="mx-0 mt-4 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="text-amber-700 text-sm text-center">
                        Using placeholder data - live commentary will appear during the match
                      </p>
                    </div>
                  )}
                  {(commentaryData || mockCommentary).map((item: any, index: number) => (
                    <CommentaryItem
                      key={index}
                      minute={item.minute}
                      type={item.type || 'general'}
                      comment={item.comment}
                      score={item.score}
                      isGoal={item.isGoal}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
          {activeTab === 'stats' && (
            <div className="bg-gray-100 rounded-2xl p-4">
              {/* Teams Header */}
              <div className="flex items-center justify-between mb-4 px-2">
                <div className="flex items-center gap-3">
                  {fixture?.home_team_image_path ? (
                    <img src={fixture.home_team_image_path} alt={fixture.home_team_name} className="w-10 h-10 object-contain" />
                  ) : (
                    <div className="w-10 h-10 bg-gray-200 rounded-full" />
                  )}
                  <span className="font-bold text-gray-900">
                    {fixture?.home_team_short_code || fixture?.home_team_name?.slice(0, 3).toUpperCase() || 'HOM'}
                  </span>
                </div>
                <span className="text-gray-400 text-sm">vs</span>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-gray-900">
                    {fixture?.away_team_short_code || fixture?.away_team_name?.slice(0, 3).toUpperCase() || 'AWY'}
                  </span>
                  {fixture?.away_team_image_path ? (
                    <img src={fixture.away_team_image_path} alt={fixture.away_team_name} className="w-10 h-10 object-contain" />
                  ) : (
                    <div className="w-10 h-10 bg-gray-200 rounded-full" />
                  )}
                </div>
              </div>

              {/* Stats Bars */}
              {isLoadingStats ? (
                <div className="bg-white rounded-xl p-6 space-y-4 animate-pulse">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="py-4">
                      <div className="h-4 bg-gray-200 rounded w-32 mx-auto mb-3" />
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-4 bg-gray-200 rounded" />
                        <div className="flex-1 h-2 bg-gray-200 rounded-full" />
                        <div className="w-12 h-4 bg-gray-200 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-xl overflow-hidden">
                  {!stats && (
                    <div className="mx-4 mt-4 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="text-amber-700 text-sm text-center">
                        Using placeholder data - live stats will appear during the match
                      </p>
                    </div>
                  )}
                  <div className="px-6">
                    <StatBar
                      label="Ball possession"
                      homeValue={stats?.home_team_stats?.possession ?? 60}
                      awayValue={stats?.away_team_stats?.possession ?? 40}
                      isPercentage
                    />
                  </div>
                  <div className="h-px bg-gray-200" />
                  <div className="px-6">
                    <StatBar
                      label="Total shots"
                      homeValue={stats?.home_team_stats?.total_shots ?? 12}
                      awayValue={stats?.away_team_stats?.total_shots ?? 8}
                    />
                  </div>
                  <div className="h-px bg-gray-200" />
                  <div className="px-6">
                    <StatBar
                      label="Shots on target"
                      homeValue={stats?.home_team_stats?.shots_on_target ?? 5}
                      awayValue={stats?.away_team_stats?.shots_on_target ?? 3}
                    />
                  </div>
                  <div className="h-px bg-gray-200" />
                  <div className="px-6">
                    <StatBar
                      label="Corner kicks"
                      homeValue={stats?.home_team_stats?.corner_kicks ?? 6}
                      awayValue={stats?.away_team_stats?.corner_kicks ?? 4}
                    />
                  </div>
                  <div className="h-px bg-gray-200" />
                  <div className="px-6">
                    <StatBar
                      label="Fouls"
                      homeValue={stats?.home_team_stats?.fouls ?? 10}
                      awayValue={stats?.away_team_stats?.fouls ?? 12}
                    />
                  </div>
                  <div className="h-px bg-gray-200" />
                  <div className="px-6">
                    <StatBar
                      label="Yellow cards"
                      homeValue={stats?.home_team_stats?.yellow_cards ?? 2}
                      awayValue={stats?.away_team_stats?.yellow_cards ?? 3}
                    />
                  </div>
                  <div className="h-px bg-gray-200" />
                  <div className="px-6">
                    <StatBar
                      label="Red cards"
                      homeValue={stats?.home_team_stats?.red_cards ?? 0}
                      awayValue={stats?.away_team_stats?.red_cards ?? 0}
                    />
                  </div>
                  <div className="h-px bg-gray-200" />
                  <div className="px-6">
                    <StatBar
                      label="Pass accuracy"
                      homeValue={stats?.home_team_stats?.passes_total ? Math.round((stats.home_team_stats.passes_accurate / stats.home_team_stats.passes_total) * 100) : 78}
                      awayValue={stats?.away_team_stats?.passes_total ? Math.round((stats.away_team_stats.passes_accurate / stats.away_team_stats.passes_total) * 100) : 72}
                      isPercentage
                    />
                  </div>
                </div>
              )}
            </div>
          )}
          {activeTab === 'lineups' && (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
              {/* Football Pitch */}
              <div
                className="relative rounded-2xl overflow-hidden"
                style={{
                  backgroundImage: 'url(/Match.svg)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  aspectRatio: '833/595'
                }}
              >
                {/* Home Team Players (Left Side - 4-3-3 formation) */}
                {/* Goalkeeper */}
                <PlayerPosition number={29} name="Meslier" position={{ x: 8, y: 50 }} isHome={true} />

                {/* Defenders */}
                <PlayerPosition number={4} name="Meslier" position={{ x: 20, y: 20 }} isHome={true} />
                <PlayerPosition number={15} name="Meslier" position={{ x: 20, y: 40 }} isHome={true} />
                <PlayerPosition number={42} name="Meslier" position={{ x: 20, y: 60 }} isHome={true} />
                <PlayerPosition number={16} name="Meslier" position={{ x: 20, y: 80 }} isHome={true} />

                {/* Midfielders */}
                <PlayerPosition number={19} name="Meslier" position={{ x: 32, y: 25 }} isHome={true} />
                <PlayerPosition number={8} name="Meslier" position={{ x: 32, y: 50 }} isHome={true} />
                <PlayerPosition number={17} name="Mesl..." position={{ x: 32, y: 75 }} isHome={true} />

                {/* Forwards */}
                <PlayerPosition number={10} name="Meslier" position={{ x: 44, y: 20 }} isHome={true} isCaptain={true} />
                <PlayerPosition number={9} name="Meslier" position={{ x: 44, y: 50 }} isHome={true} />
                <PlayerPosition number={7} name="Meslier" position={{ x: 44, y: 80 }} isHome={true} />

                {/* Away Team Players (Right Side - 4-4-2 formation) */}
                {/* Goalkeeper */}
                <PlayerPosition number={1} name="Meslier" position={{ x: 92, y: 50 }} isHome={false} />

                {/* Defenders */}
                <PlayerPosition number={4} name="Meslier" position={{ x: 80, y: 20 }} isHome={false} />
                <PlayerPosition number={5} name="Meslier" position={{ x: 80, y: 40 }} isHome={false} />
                <PlayerPosition number={6} name="Meslier" position={{ x: 80, y: 60 }} isHome={false} />
                <PlayerPosition number={3} name="Meslier" position={{ x: 80, y: 80 }} isHome={false} />

                {/* Midfielders */}
                <PlayerPosition number={44} name="Meslier" position={{ x: 68, y: 15 }} isHome={false} />
                <PlayerPosition number={20} name="Mesl..." position={{ x: 68, y: 38 }} isHome={false} />
                <PlayerPosition number={10} name="Justin" position={{ x: 56, y: 50 }} isHome={false} isCaptain={true} />
                <PlayerPosition number={32} name="Meslier" position={{ x: 68, y: 62 }} isHome={false} />

                {/* Forwards */}
                <PlayerPosition number={15} name="Gudm..." position={{ x: 68, y: 85 }} isHome={false} />
                <PlayerPosition number={9} name="Aaron..." position={{ x: 56, y: 30 }} isHome={false} />
                <PlayerPosition number={37} name="Perri" position={{ x: 56, y: 70 }} isHome={false} />
              </div>

              {/* Substituted Players */}
              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Substituted Players</h3>

                <div>
                  <SubstitutionRow
                    homePlayer={{ name: "Miley L.", subName: "Tonali S", minute: "66'" }}
                    awayPlayer={{ name: "Bradley C.", subName: "Wirtz F", minute: "80'", hasIcon: 'yellow' }}
                  />
                  <SubstitutionRow
                    homePlayer={{ name: "Ramsey J.", subName: "Tonali S", minute: "76'" }}
                    awayPlayer={{ name: "Chiesa F.", subName: "Wirtz F", minute: "80'", hasIcon: 'ucl' }}
                  />
                  <SubstitutionRow
                    homePlayer={{ name: "Osula W.", subName: "Tonali S", minute: "76'", hasIcon: 'ucl' }}
                    awayPlayer={{ name: "Ngumoha R.", subName: "Tonali S", minute: "90+6'" }}
                  />
                  <SubstitutionRow
                    homePlayer={{ name: "Hall L.", subName: "Tonali S", minute: "76'" }}
                    awayPlayer={{ name: "Elliott H.", subName: "Tonali S", minute: "90+6'" }}
                  />
                  <SubstitutionRow
                    homePlayer={{ name: "Thiaw M.", subName: "Tonali S", minute: "81'" }}
                    awayPlayer={{ name: "Endo W.", subName: "Tonali S", minute: "90+12'" }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Weather Section */}
          <div className="mt-6 md:mt-8">
            {/* Header */}
            <div className="flex items-start justify-between mb-3 md:mb-4">
              <div>
                <h2 className="text-base md:text-xl font-bold text-gray-900">
                  <span className="hidden md:inline">Weather • </span>
                  <span className="md:hidden">Weather</span>
                  <span className="hidden md:inline">{(fixture as any)?.venue_name || 'Michigan Stadium'}</span>
                </h2>
                <p className="text-gray-500 text-xs md:text-sm">
                  {fixture?.starting_at
                    ? new Date(fixture.starting_at).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })
                    : 'Today, January 15, 2025'}
                </p>
              </div>
              <button className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1 md:py-1.5 text-xs md:text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
                Today
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="md:w-4 md:h-4">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
            </div>

            {/* Weather Timeline Card */}
            <div className="relative mb-12 md:mb-16">
              <div className="bg-white rounded-xl md:rounded-2xl border-4 md:border-[7px] border-gray-200 py-4 md:py-6 pb-6 md:pb-8 relative overflow-hidden">
                {/* Fade overlay - left side (mobile only) - narrow, inside border, behind border layer */}
                <div className="absolute left-0 top-1 bottom-1 w-6 bg-gradient-to-r from-white to-transparent z-[5] pointer-events-none md:hidden" />
                {/* Weather Icons Row */}
                <div className="overflow-x-auto scrollbar-hide -mx-1 px-1">
                  <div className="flex items-stretch gap-4 md:gap-0 md:justify-evenly min-w-max md:min-w-0 md:w-full px-3 md:px-0 pr-12 md:pr-0">
                    {weatherData.map((item, index) => (
                      <div key={index} className="flex items-stretch gap-4 md:gap-0 md:contents">
                        <div className="flex flex-col items-center justify-center shrink-0">
                          <WeatherCard
                            time={item.time}
                            temp={item.temp}
                            icon={item.icon}
                            isNow={item.isNow}
                          />
                        </div>
                        {item.dividerAfter && (
                          <div className="shrink-0 md:contents">
                            <WeatherDivider type={item.dividerAfter} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Match Window Box - Merging with bottom border */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full">
                  <div className="bg-gray-200 rounded-b-lg md:rounded-b-xl px-3 md:px-4 py-1.5 md:py-2 flex items-center gap-2 md:gap-3">
                    <div className="text-center">
                      <p className="text-gray-900 font-semibold text-xs md:text-sm whitespace-nowrap">Match Window (4:30 - 6:00 pm)</p>
                      <p className="text-gray-400 text-[10px] md:text-xs hidden md:block">Weather conditions during match</p>
                    </div>
                    <button className="px-2 md:px-3 py-1 md:py-1.5 bg-white border border-gray-300 text-gray-700 text-xs md:text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap">
                      View Detail
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Desktop Footer */}
      <div className="hidden md:block">
        <Footer />
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
}
