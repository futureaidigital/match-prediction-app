import { useState, useMemo, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { MatchBanner } from '@/components/MatchBanner';
import { useFixtures, useFixtureStatistics, useFixtureCommentary } from '@/hooks/useFixtures';
import { useFixturePredictions } from '@/hooks/usePredictions';
import { useMultiplePlayerDetails } from '@/hooks/usePlayers';
import { useAuth } from '@/contexts/AuthContext';
import { useSSEStream } from '@/hooks/useSSEStream';

type TabType = 'predictions' | 'commentary' | 'stats' | 'lineups';

// Prediction card component with expand/collapse - Figma specs: 358x350 expanded
function PredictionCard({ prediction, index: _index, isLive: _isLive, isBlurred = false, isSelected = false, onClick, compact: _compact = false }: { prediction: any; index: number; isLive: boolean; isBlurred?: boolean; isSelected?: boolean; onClick?: () => void; compact?: boolean }) {
  const rawValue = prediction.value ?? prediction.prediction ?? prediction.pre_game_value ?? prediction.pre_game_prediction ?? 0;
  const percentage = rawValue > 1 ? Math.round(rawValue) : Math.round(rawValue * 100);
  const rawPreGame = prediction.pre_game_value ?? prediction.pre_game_prediction ?? 0;
  const preGamePercentage = rawPreGame > 1 ? Math.round(rawPreGame) : Math.round(rawPreGame * 100);
  const pctChange = prediction.pct_change_value ?? 0;
  const interval = prediction.pct_change_interval ?? null;

  // Use API confidence if available, else derive from percentage
  const getConfidence = () => {
    const cat = (prediction.model_confidence_category || '').toLowerCase();
    if (cat === 'high') return { label: 'HIGH', color: '#27ae60', bg: '#e6f4ec' };
    if (cat === 'medium') return { label: 'MEDIUM', color: '#f39c12', bg: '#fff9ec' };
    if (cat === 'low') return { label: 'LOW', color: '#e74c3c', bg: '#fdedec' };
    // Fallback: derive from percentage
    if (percentage >= 70) return { label: 'HIGH', color: '#27ae60', bg: '#e6f4ec' };
    if (percentage >= 40) return { label: 'MEDIUM', color: '#f39c12', bg: '#fff9ec' };
    return { label: 'LOW', color: '#e74c3c', bg: '#fdedec' };
  };
  const confidence = getConfidence();

  // Map prediction_type to category label
  const getCategoryLabel = () => {
    const type = (prediction.prediction_type || '').toLowerCase();
    if (type.includes('goal') || type.includes('scorer')) return 'Player Insight';
    if (type.includes('booked') || type.includes('card')) return 'Cards Insight';
    if (type.includes('shot')) return 'Shots Insight';
    if (type.includes('corner')) return 'Match Insight';
    if (type.includes('player')) return 'Player Insight';
    return 'Match Insight';
  };

  const title = prediction.title || prediction.prediction_display_name || 'Insight';

  return (
    <div
      onClick={!isBlurred ? onClick : undefined}
      className={`rounded-[14px] md:rounded-[20px] p-3 md:p-5 flex flex-col gap-[10px] md:gap-5 bg-white w-full ${isBlurred ? 'relative select-none pointer-events-none' : 'cursor-pointer'}`}
      style={{
        boxShadow: isSelected ? 'none' : '0 2px 10px rgba(0,0,0,0.06)',
        fontFamily: 'Montserrat, sans-serif',
        outline: isSelected ? '4px solid #0d1a67' : 'none',
        outlineOffset: '0px',
        ...(isBlurred ? {
          filter: 'blur(3px)',
          WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)',
          maskImage: 'linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)',
        } : {})
      }}
    >
      {/* Top section: badge + title + subtitle */}
      <div className="flex flex-col gap-[6px] md:gap-[7px]">
        <span
          className="h-[22px] px-2 rounded text-xs font-bold uppercase leading-[20px] inline-flex items-center w-fit"
          style={{ backgroundColor: confidence.bg, color: confidence.color }}
        >
          {confidence.label}
        </span>
        <div className="flex flex-col gap-[5px]">
          <span className="text-[16px] md:text-[18px] font-semibold text-[#0a0a0a] leading-[135%] md:leading-normal">
            {title}
          </span>
          <span className="text-xs font-medium md:font-semibold text-[#7c8a9c] leading-[140%] md:leading-[18px]">
            {getCategoryLabel()}
          </span>
        </div>
      </div>

      {/* Bottom section: gray container with percentage, bar, pre-game */}
      <div className="rounded-[10px] md:rounded-[14px] bg-[#f7f8fa] p-2 md:p-[10px] flex flex-col gap-[14px]">
        {/* Percentage + trend row */}
        <div className="flex items-center justify-between">
          <span className="text-[18px] font-bold" style={{ color: confidence.color }}>
            {percentage}%
          </span>
          {pctChange !== 0 && interval != null && (
            <div className="flex items-center gap-[6px]">
              <img
                src="/trend.svg"
                width="20"
                height="12"
                alt=""
                style={{
                  filter: pctChange > 0
                    ? 'brightness(0) saturate(100%) invert(52%) sepia(79%) saturate(409%) hue-rotate(95deg) brightness(93%) contrast(91%)'
                    : 'brightness(0) saturate(100%) invert(33%) sepia(84%) saturate(1200%) hue-rotate(329deg) brightness(97%) contrast(95%)',
                  transform: pctChange > 0 ? 'none' : 'scaleY(-1)',
                }}
              />
              <span className="text-sm font-medium text-[#7c8a9c] leading-[20px]">
                {Math.abs(pctChange).toFixed(0)}% in last {interval} min
              </span>
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 md:h-[6px] rounded-[10px] md:rounded-full bg-[#e1e4eb]">
          <div
            className="h-2 md:h-[6px] rounded-[10px] md:rounded-full transition-all duration-300"
            style={{ width: `${percentage}%`, backgroundColor: confidence.color }}
          />
        </div>

        {/* Pre-game prediction row */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-[#7c8a9c] leading-[20px]">
            Pre-game Insight {preGamePercentage}%
          </span>
          {pctChange !== 0 && (
            <span
              className="h-[22px] px-2 rounded text-sm font-semibold leading-[20px] flex items-center"
              style={{
                backgroundColor: pctChange > 0 ? '#e6f4ec' : '#fdeaea',
                color: pctChange > 0 ? '#27ae60' : '#eb5757',
              }}
            >
              {pctChange > 0 ? '+' : ''}{pctChange.toFixed(0)}%
            </span>
          )}
        </div>
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

// Player position component for lineup - Mobile style matching Figma specs
function PlayerPosition({
  number,
  name,
  position,
  isHome: _isHome,
  isCaptain,
  hasYellowCard,
  hasRedCard,
  imageUrl,
}: {
  number: number;
  name: string;
  position: { x: number; y: number };
  isHome: boolean;
  isCaptain?: boolean;
  hasYellowCard?: boolean;
  hasRedCard?: boolean;
  imageUrl?: string;
}) {
  return (
    <div
      className="absolute flex flex-col items-center transform -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${position.x}%`, top: `${position.y}%` }}
    >
      {/* Player container with number badge */}
      <div className="relative">
        {/* Jersey number badge - top left of photo */}
        <div
          className="absolute -top-1 -left-1 bg-white text-[#0a0a0a] text-[10px] font-semibold rounded-full w-[17px] h-[17px] flex items-center justify-center z-10"
          style={{ fontFamily: 'Montserrat, sans-serif' }}
        >
          {number}
        </div>

        {/* Player photo circle - 35px with dark blue border */}
        <div className="w-[35px] h-[35px] rounded-full overflow-hidden border-[2px] border-[#0d1a67] bg-[#0d1a67]">
          {imageUrl ? (
            <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-b from-gray-300 to-gray-400 flex items-center justify-center">
              <svg className="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </div>
          )}
        </div>

        {/* Captain badge - soccer ball icon */}
        {isCaptain && (
          <div className="absolute -bottom-0.5 right-0 w-[14px] h-[14px] bg-white rounded-full flex items-center justify-center">
            <svg className="w-[10px] h-[10px]" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#0d1a67" strokeWidth="2" fill="white"/>
              <path d="M12 7l1.5 3 3 .5-2.25 2.25.5 3-2.75-1.5-2.75 1.5.5-3L7.5 10.5l3-.5L12 7z" fill="#0d1a67"/>
            </svg>
          </div>
        )}

        {/* Yellow card indicator */}
        {hasYellowCard && (
          <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-[6px] h-[10px] bg-yellow-400 rounded-[1px]" />
        )}

        {/* Red card indicator */}
        {hasRedCard && (
          <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-[6px] h-[10px] bg-red-500 rounded-[1px]" />
        )}
      </div>

      {/* Name label - white pill with rounded corners */}
      <div className="mt-0.5 bg-white px-1 py-px rounded">
        <span
          className="text-[9px] font-semibold text-[#0a0a0a] whitespace-nowrap leading-tight"
          style={{ fontFamily: 'Montserrat, sans-serif' }}
        >
          {name}
        </span>
      </div>
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
    <div className="flex items-center justify-between py-2 md:py-3 border-b border-gray-100 last:border-b-0">
      {/* Home side player (left) */}
      <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
        {homePlayer && (
          <>
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-200 overflow-hidden shrink-0">
              {homePlayer.image ? (
                <img src={homePlayer.image} alt={homePlayer.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gray-300" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs md:text-sm font-semibold text-gray-900 flex items-center gap-1 truncate">
                {homePlayer.name}
                {homePlayer.hasIcon === 'ucl' && (
                  <svg className="w-3 h-3 md:w-4 md:h-4 text-blue-600 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="12" r="10" />
                  </svg>
                )}
              </p>
              <p className="text-[10px] md:text-xs text-gray-400 truncate">
                <span className="text-green-500">↗</span> {homePlayer.subName}. {homePlayer.minute}
              </p>
            </div>
          </>
        )}
      </div>

      {/* Away side player (right) */}
      <div className="flex items-center gap-2 md:gap-3 flex-1 justify-end min-w-0">
        {awayPlayer && (
          <>
            <div className="text-right min-w-0">
              <p className="text-xs md:text-sm font-semibold text-gray-900 flex items-center justify-end gap-1 truncate">
                {awayPlayer.hasIcon === 'yellow' && (
                  <span className="w-2.5 h-3 md:w-3 md:h-4 bg-yellow-400 rounded-sm inline-block shrink-0" />
                )}
                {awayPlayer.name}
              </p>
              <p className="text-[10px] md:text-xs text-gray-400 truncate">
                {awayPlayer.minute} {awayPlayer.subName}. <span className="text-green-500">↗</span>
              </p>
            </div>
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-200 overflow-hidden shrink-0">
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

// H2H Match Detail Modal — shows stats for a clicked H2H match
function H2HMatchModal({ h2hMatch, onClose }: { h2hMatch: any; onClose: () => void }) {
  const { data: statsResponse, isLoading } = useFixtureStatistics(String(h2hMatch.fixture_id));
  const modalStatsData = statsResponse?.data?.statistics;
  const homeTeamColour = modalStatsData?.home_team_color || '#0a0a0a';
  const awayTeamColour = modalStatsData?.away_team_color || '#0a0a0a';
  const [modalExpandedCards, setModalExpandedCards] = useState<Set<string>>(new Set());

  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const date = h2hMatch.starting_at ? new Date(h2hMatch.starting_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" />
      {/* Modal */}
      <div
        className="relative bg-white w-full md:w-[960px] md:rounded-[16px] rounded-t-[16px] max-h-[90vh] overflow-y-auto scrollbar-hide"
        style={{ fontFamily: 'Montserrat, sans-serif' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-[#e1e4eb] px-6 py-4 flex items-center justify-between rounded-t-[16px]">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              {h2hMatch.home_team_image_path ? <img src={h2hMatch.home_team_image_path} alt="" className="w-8 h-8 object-contain" /> : <div className="w-8 h-8 rounded-full bg-[#f7f8fa]" />}
              <span className="text-[16px] font-semibold text-[#0a0a0a]">{h2hMatch.home_team_name || 'Home'}</span>
            </div>
            <span className="text-[20px] font-bold text-[#0a0a0a]">{h2hMatch.home_score} - {h2hMatch.away_score}</span>
            <div className="flex items-center gap-3">
              <span className="text-[16px] font-semibold text-[#0a0a0a]">{h2hMatch.away_team_name || 'Away'}</span>
              {h2hMatch.away_team_image_path ? <img src={h2hMatch.away_team_image_path} alt="" className="w-8 h-8 object-contain" /> : <div className="w-8 h-8 rounded-full bg-[#f7f8fa]" />}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[12px] text-[#7c8a9c]">{date}</span>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#f7f8fa]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col gap-[30px]">
          {isLoading ? (
            <div className="flex flex-col gap-6 py-6">
              {/* Skeleton stat bars */}
              <div className="bg-[#f7f8fa] rounded-[15px] p-[16px] flex flex-col gap-6 animate-pulse">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="flex flex-col gap-2">
                    <div className="flex justify-between">
                      <div className="w-10 h-4 bg-gray-200 rounded" />
                      <div className="w-24 h-4 bg-gray-200 rounded" />
                      <div className="w-10 h-4 bg-gray-200 rounded" />
                    </div>
                    <div className="flex gap-1">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full" />
                      <div className="flex-1 h-2 bg-gray-200 rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
              {/* Skeleton comparison cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-pulse">
                {[1,2,3,4].map(i => (
                  <div key={i} className="bg-white rounded-[14px] border border-[#e1e4eb] p-4 flex flex-col gap-4">
                    <div className="w-32 h-5 bg-gray-200 rounded" />
                    {[1,2,3,4,5].map(j => (
                      <div key={j} className="flex justify-between">
                        <div className="w-12 h-4 bg-gray-100 rounded" />
                        <div className="w-24 h-4 bg-gray-100 rounded" />
                        <div className="w-12 h-4 bg-gray-100 rounded" />
                      </div>
                    ))}
                    <div className="w-full h-10 bg-gray-200 rounded-lg" />
                  </div>
                ))}
              </div>
            </div>
          ) : !modalStatsData ? (
            <div className="text-center py-20 text-[#7c8a9c]">No statistics available for this match.</div>
          ) : (
            <>
              {/* Match stat bars */}
              <div className="bg-[#f7f8fa] rounded-[15px] p-[16px] flex flex-col items-center" style={{ gap: '32px' }}>
                {(() => {
                  const raw = modalStatsData?.raw_statistics?.top_level_summary || {};
                  return [
                    { label: 'Ball possession', home: raw['ball-possession']?.home ?? null, away: raw['ball-possession']?.away ?? null, isPct: true },
                    { label: 'Total shots', home: raw['shots-total']?.home ?? null, away: raw['shots-total']?.away ?? null },
                    { label: 'Corner kicks', home: raw['corners']?.home ?? null, away: raw['corners']?.away ?? null },
                    { label: 'Fouls', home: raw['fouls']?.home ?? null, away: raw['fouls']?.away ?? null },
                    { label: 'Passes completed', home: raw['successful-passes']?.home ?? null, away: raw['successful-passes']?.away ?? null },
                  ];
                })().map((s, i) => (
                  <div key={`${s.label}-${i}`} className="w-full">
                    <StatBar label={s.label} homeValue={s.home ?? 0} awayValue={s.away ?? 0} isPercentage={s.isPct} homeColour={homeTeamColour} awayColour={awayTeamColour} />
                  </div>
                ))}
              </div>

              {/* Team Performance Comparison */}
              <div className="flex flex-col gap-[15px]">
                <h3 className="text-[18px] font-semibold text-[#000000]">Team Performance Comparison</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-[20px]">
                  {(() => {
                    const raw = modalStatsData?.raw_statistics || {} as any;
                    const atk = raw.attacking_threat || {};
                    const shots = raw.shots || {};
                    const duels = raw.duels_and_dribbling || {};
                    const def = raw.defence_and_discipline || {};
                    const passes = raw.passes || {};
                    return [
                      { id: 'xg', title: 'Attacking Threat', rows: [
                        { label: 'Goals', home: atk['goals']?.home, away: atk['goals']?.away },
                        { label: 'Assists', home: atk['assists']?.home, away: atk['assists']?.away },
                        { label: 'Dangerous Attacks', home: atk['dangerous-attacks']?.home, away: atk['dangerous-attacks']?.away },
                        { label: 'Big Chances Created', home: atk['big-chances-created']?.home, away: atk['big-chances-created']?.away },
                        { label: 'Big Chances Missed', home: atk['big-chances-missed']?.home, away: atk['big-chances-missed']?.away },
                      ]},
                      { id: 'shots', title: 'Shots', rows: [
                        { label: 'Total Shots', home: shots['shots-total']?.home, away: shots['shots-total']?.away },
                        { label: 'Shots on Target', home: shots['shots-on-target']?.home, away: shots['shots-on-target']?.away },
                        { label: 'Shots off Target', home: shots['shots-off-target']?.home, away: shots['shots-off-target']?.away },
                        { label: 'Blocked Shots', home: shots['shots-blocked']?.home, away: shots['shots-blocked']?.away },
                        { label: 'Hit woodwork', home: shots['hit-woodwork']?.home, away: shots['hit-woodwork']?.away },
                      ]},
                      { id: 'duels', title: 'Duels', rows: [
                        { label: 'Duels Won', home: duels['duels-won']?.home, away: duels['duels-won']?.away },
                        { label: 'Successful Headers', home: duels['successful-headers']?.home, away: duels['successful-headers']?.away },
                        { label: 'Successful dribbles', home: duels['successful-dribbles']?.home, away: duels['successful-dribbles']?.away },
                      ]},
                      { id: 'defence', title: 'Defence', rows: [
                        { label: 'Tackles', home: def['tackles']?.home, away: def['tackles']?.away },
                        { label: 'Interceptions', home: def['interceptions']?.home, away: def['interceptions']?.away },
                        { label: 'Keeper Saves', home: def['saves']?.home, away: def['saves']?.away },
                        { label: 'Offsides', home: def['offsides']?.home, away: def['offsides']?.away },
                      ]},
                      { id: 'passes', title: 'Passes', rows: [
                        { label: 'Total Passes', home: passes['passes']?.home, away: passes['passes']?.away },
                        { label: 'Accurate Passes', home: passes['successful-passes']?.home, away: passes['successful-passes']?.away },
                        { label: 'Pass Accuracy %', home: passes['successful-passes-percentage']?.home, away: passes['successful-passes-percentage']?.away },
                        { label: 'Key Passes', home: passes['key-passes']?.home, away: passes['key-passes']?.away },
                      ]},
                    ];
                  })().map(card => (
                    <StatComparisonCard
                      key={card.id}
                      title={card.title}
                      rows={card.rows}
                      isExpanded={modalExpandedCards.has(card.id)}
                      onToggle={() => setModalExpandedCards(prev => { const next = new Set(prev); if (next.has(card.id)) next.delete(card.id); else next.add(card.id); return next; })}
                      homeColour={homeTeamColour}
                      awayColour={awayTeamColour}
                    />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Reusable stat comparison card — used in Team Performance Comparison section
function StatComparisonCard({
  title,
  rows,
  isExpanded,
  onToggle,
  homeColour = '#0a0a0a',
  awayColour = '#0a0a0a',
}: {
  title: string;
  rows: { label: string; home: any; away: any }[];
  isExpanded: boolean;
  onToggle: () => void;
  homeColour?: string;
  awayColour?: string;
}) {
  const font = { fontFamily: 'Montserrat, sans-serif' } as const;
  return (
    <div className="bg-white rounded-[14px] border border-[#e1e4eb] shadow-[0_1px_15px_0_rgba(0,0,0,0.10)] p-[16px] flex flex-col gap-[16px] flex-1" style={font}>
      {/* Title — 18px SemiBold #0a0a0a */}
      <h3 className="text-[18px] font-semibold text-[#0a0a0a]">{title}</h3>
      {/* Stat rows — 15px gap, animated max-height */}
      <div
        className="overflow-hidden transition-all duration-300 ease-in-out flex flex-col"
        style={{ gap: '15px', height: isExpanded ? `${rows.length * 39}px` : '195px' }}
      >
        {rows.map((row, i) => {
          const h = typeof row.home === 'number' ? row.home : 0;
          const a = typeof row.away === 'number' ? row.away : 0;
          return (
            <div key={i} className="flex items-center justify-between h-[24px]" style={{ gap: '10px' }}>
              {/* Home value + left indicator (only show bar if home wins) */}
              <div className="flex items-center gap-[7px] min-w-[60px]">
                <div className="w-[3px] h-[24px]" style={{ borderRadius: '99px 0 0 99px', backgroundColor: h > a ? homeColour : 'transparent' }} />
                <span className={`text-[16px] font-semibold ${h >= a ? 'text-[#0a0a0a]' : 'text-[#0a0a0a60]'}`} style={{ lineHeight: '24px' }}>{row.home ?? '—'}</span>
              </div>
              {/* Center label — 14px Medium #7c8a9c */}
              <span className="text-[14px] font-medium text-[#7c8a9c] text-center flex-1" style={{ lineHeight: '20px' }}>{row.label}</span>
              {/* Away value + right indicator (only show bar if away wins) */}
              <div className="flex items-center justify-end gap-[7px] min-w-[60px]">
                <span className={`text-[16px] font-semibold ${a >= h ? 'text-[#0a0a0a]' : 'text-[#0a0a0a60]'}`} style={{ lineHeight: '24px' }}>{row.away ?? '—'}</span>
                <div className="w-[3px] h-[24px]" style={{ borderRadius: '0 99px 99px 0', backgroundColor: a > h ? awayColour : 'transparent' }} />
              </div>
            </div>
          );
        })}
      </div>
      {/* Gradient dividers + counter */}
      <div className="flex items-center justify-center gap-[15px]">
        <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, transparent, #091143)' }} />
        <span className="text-[12px] font-medium text-[#7c8a9c]" style={{ lineHeight: '140%' }}>
          {isExpanded ? rows.length : Math.min(5, rows.length)} out of {rows.length}
        </span>
        <div className="flex-1 h-px" style={{ background: 'linear-gradient(to left, transparent, #091143)' }} />
      </div>
      {/* See More button — #0d1a67, rounded-8, h-40, border #d9d9d9, shadow */}
      <button
        onClick={onToggle}
        className="w-full h-[40px] bg-[#0d1a67] border border-[#d9d9d9] text-white text-[14px] font-semibold rounded-[8px] hover:bg-[#0d1a67]/90 transition-colors"
        style={{ boxShadow: '0 7px 4px -3px rgba(0,0,0,0.05)' }}
      >
        {isExpanded ? 'Show Less' : 'See More'}
      </button>
    </div>
  );
}

// Stat comparison bar component
function StatBar({
  label,
  homeValue,
  awayValue,
  isPercentage = false,
  homeColour = '#27ae60',
  awayColour = '#0d1a67',
}: {
  label: string;
  homeValue: number;
  awayValue: number;
  isPercentage?: boolean;
  homeColour?: string;
  awayColour?: string;
}) {
  const total = homeValue + awayValue;
  const homePercent = total > 0 ? (homeValue / total) * 100 : 50;
  const awayPercent = total > 0 ? (awayValue / total) * 100 : 50;

  const font = { fontFamily: 'Montserrat, sans-serif' } as const;
  const homeWins = homeValue > awayValue;
  const awayWins = awayValue > homeValue;
  const homeBarColor = homeWins ? homeColour : `${homeColour}40`;
  const awayBarColor = awayWins ? awayColour : `${awayColour}40`;

  // Ball Possession — pills + label row on top, 10px bars below
  if (isPercentage) {
    return (
      <div className="flex flex-col items-center" style={{ gap: '10px', ...font }}>
        {/* Top: home pill — label — away pill */}
        <div className="flex items-center justify-between w-full">
          <div className="h-[24px] px-[6px] rounded-[50px] flex items-center justify-center" style={{ backgroundColor: homeWins ? homeColour : `${homeColour}60` }}>
            <span className="text-white text-[12px] font-semibold">{homeValue}%</span>
          </div>
          <span className="text-[14px] font-medium text-[#0a0a0a]" style={{ lineHeight: '135%' }}>{label}</span>
          <div className="h-[24px] px-[6px] rounded-[50px] flex items-center justify-center" style={{ backgroundColor: awayWins ? awayColour : `${awayColour}60` }}>
            <span className="text-white text-[12px] font-semibold">{awayValue}%</span>
          </div>
        </div>
        {/* Single full bar — home fills left, away fills right */}
        <div className="flex w-full h-[10px] rounded-[10px] overflow-hidden">
          <div className="h-full rounded-l-[10px]" style={{ width: `${homePercent}%`, backgroundColor: homeBarColor }} />
          <div className="h-full rounded-r-[10px]" style={{ width: `${awayPercent}%`, backgroundColor: awayBarColor }} />
        </div>
      </div>
    );
  }

  // Standard stat — value + label + value row on top, 4px bars below
  return (
    <div className="flex flex-col items-center" style={{ gap: '10px', ...font }}>
      {/* Top: home value — label — away value */}
      <div className="flex items-center justify-between w-full">
        <span className="text-[14px] font-semibold" style={{ lineHeight: '135%', color: homeWins ? '#0a0a0a' : '#0a0a0a60' }}>{homeValue}</span>
        <span className="text-[14px] font-medium text-[#0a0a0a]" style={{ lineHeight: '135%' }}>{label}</span>
        <span className="text-[14px] font-semibold text-right" style={{ lineHeight: '135%', color: awayWins ? '#0a0a0a' : '#0a0a0a60' }}>{awayValue}</span>
      </div>
      {/* Bars below */}
      <div className="flex w-full" style={{ gap: '4px' }}>
        <div className="flex-1 h-[4px] rounded-[10px] bg-[#0a0a0a1a] overflow-hidden flex justify-end">
          <div className="h-full rounded-[10px]" style={{ width: `${homePercent}%`, backgroundColor: homeBarColor }} />
        </div>
        <div className="flex-1 h-[4px] rounded-[10px] bg-[#0a0a0a1a] overflow-hidden">
          <div className="h-full rounded-[10px]" style={{ width: `${awayPercent}%`, backgroundColor: awayBarColor }} />
        </div>
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
    <div className="flex items-start gap-2 md:gap-4 py-3 md:py-4 border-b border-gray-100 last:border-b-0">
      <span className="text-gray-500 font-medium text-xs md:text-sm w-10 md:w-14 shrink-0">{minute}</span>
      <div className="w-12 md:w-20 shrink-0 flex justify-center">{getIcon()}</div>
      <p className={`text-xs md:text-sm flex-1 ${isGoal ? 'text-orange-500 font-medium' : 'text-gray-700'}`}>
        {comment}
      </p>
    </div>
  );
}

// Mobile Bottom Navigation - Shows/hides based on scroll position
function MobileBottomNav() {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  // Show footer when user scrolls to bottom OR when page has no scroll
  useEffect(() => {
    const checkVisibility = () => {
      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // Show if no scroll needed (content fits in viewport) or at bottom
      const hasNoScroll = documentHeight <= windowHeight + 10;
      const isAtBottom = scrollTop + windowHeight >= documentHeight - 50;
      setIsVisible(hasNoScroll || isAtBottom);
    };

    window.addEventListener('scroll', checkVisibility);
    window.addEventListener('resize', checkVisibility);

    // Check after initial render and after content loads
    checkVisibility();
    const timeoutId = setTimeout(checkVisibility, 100);
    const timeoutId2 = setTimeout(checkVisibility, 500);

    // Also observe DOM changes
    const observer = new MutationObserver(checkVisibility);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener('scroll', checkVisibility);
      window.removeEventListener('resize', checkVisibility);
      clearTimeout(timeoutId);
      clearTimeout(timeoutId2);
      observer.disconnect();
    };
  }, []);

  const tabs = [
    { id: 'home', label: 'Home', path: '/' },
    { id: 'live', label: 'Live', path: '/matches' },
    { id: 'combos', label: 'Combos', path: '/smart-combo' },
    { id: 'login', label: 'Login', path: '/login' },
  ];

  return (
    <div className={`md:hidden fixed bottom-0 left-0 right-0 bg-[#0d1a67] transition-transform duration-300 z-50 ${isVisible ? 'translate-y-0' : 'translate-y-full'}`}>
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

// AI Analysis panel - shown when a prediction card is clicked
function AIAnalysisPanel({ prediction, fixture: _fixture, statsData: _statsData, onClose: _onClose }: { prediction: any; fixture: any; statsData: any; onClose: () => void }) {
  const [formTab, setFormTab] = useState<'home' | 'away'>('home');

  // Real data from prediction.detail (from /fixtures/{id}/predictions endpoint)
  const detail = prediction.detail || null;
  const aiAnalysis: string = detail?.ai_analysis || '';
  // match_history can be a flat array OR { home_last_5: [...], away_last_5: [...] }
  const rawMatchHistory = detail?.match_history;
  const matchHistory: any[] = Array.isArray(rawMatchHistory)
    ? rawMatchHistory
    : (rawMatchHistory?.home_last_5 || rawMatchHistory?.away_last_5)
      ? [...(rawMatchHistory.home_last_5 || []), ...(rawMatchHistory.away_last_5 || [])]
      : [];
  const homeMatchHistory: any[] = Array.isArray(rawMatchHistory) ? rawMatchHistory : (rawMatchHistory?.home_last_5 || []);
  void (Array.isArray(rawMatchHistory) ? [] : (rawMatchHistory?.away_last_5 || [])); // away_last_5 available for future use
  const modelConfidence = detail?.model_confidence || null;
  const seasonContext = detail?.season_context || null;
  // season_context can be { home_form: {...}, away_form: {...} } OR flat keys like "TeamName_stat: value"
  const homeForm = seasonContext?.home_form || null;
  const awayForm = seasonContext?.away_form || null;
  // If no home_form/away_form, build from flat season_context keys
  const flatSeasonEntries = seasonContext && !homeForm && !awayForm
    ? Object.entries(seasonContext).filter(([, v]) => v != null)
    : [];
  const activeForm = formTab === 'home' ? homeForm : awayForm;

  const rawValue = prediction.value ?? prediction.prediction ?? prediction.pre_game_value ?? prediction.pre_game_prediction ?? 0;
  const percentage = rawValue > 1 ? Math.round(rawValue) : Math.round(rawValue * 100);
  const getConfidence = () => {
    const cat = (prediction.model_confidence_category || modelConfidence?.category || '').toLowerCase();
    if (cat === 'high') return { label: 'High Confidence', color: '#27ae60', bg: '#e6f4ec' };
    if (cat === 'medium') return { label: 'Medium Confidence', color: '#f39c12', bg: '#fff9ec' };
    if (cat === 'low') return { label: 'Low Confidence', color: '#e74c3c', bg: '#fdedec' };
    if (percentage >= 70) return { label: 'High Confidence', color: '#27ae60', bg: '#e6f4ec' };
    if (percentage >= 40) return { label: 'Medium Confidence', color: '#f39c12', bg: '#fff9ec' };
    return { label: 'Low Confidence', color: '#e74c3c', bg: '#fdedec' };
  };
  const conf = getConfidence();
  const modelScore = modelConfidence?.score ?? (percentage / 100);

  // Dynamically build stat columns from whatever fields the API returns
  const sampleMatch = homeMatchHistory[0] || matchHistory[0];
  // Keys to exclude from stat columns (metadata, not stats)
  const excludedKeys = new Set([
    'fixture_id', 'opponent', 'opponent_logo', 'date', 'result',
    'starting_at', 'league_id', 'league_name', 'home_team', 'away_team',
    'home_team_id', 'away_team_id', 'score', 'is_home', 'match_id',
  ]);
  const statCols = sampleMatch
    ? Object.keys(sampleMatch)
        .filter(k => !excludedKeys.has(k) && typeof sampleMatch[k] === 'number')
        .map(k => ({
          key: k,
          label: k.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()).slice(0, 4).toUpperCase(),
        }))
    : [];

  return (
    <div
      className="bg-white rounded-t-[20px] md:rounded-[10px] p-4 md:p-6 flex flex-col gap-4 md:gap-4 w-full overflow-y-auto max-h-[90vh] md:max-h-none"
      style={{ fontFamily: 'Montserrat, sans-serif' }}
    >

      {/* Inner #f7f8fa container */}
      <div className="rounded-[16px] bg-[#f7f8fa] p-4 flex flex-col gap-6">

        {/* 1. AI Analysis - collapsible */}
        <div className="flex flex-col gap-[15px]">
          <button
            onClick={() => {
              const el = document.getElementById(`ai-analysis-${prediction.prediction_id || prediction._id || 'detail'}`);
              if (el) el.classList.toggle('hidden');
              const chevron = document.getElementById(`ai-chevron-${prediction.prediction_id || prediction._id || 'detail'}`);
              if (chevron) chevron.classList.toggle('rotate-180');
            }}
            className="flex items-center justify-between w-full"
          >
            <span className="text-[14px] font-semibold text-[#0a0a0a] uppercase tracking-wide">AI Analysis</span>
            <svg id={`ai-chevron-${prediction.prediction_id || prediction._id || 'detail'}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7c8a9c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          <div id={`ai-analysis-${prediction.prediction_id || prediction._id || 'detail'}`} className="rounded-[20px] bg-white shadow-[0_2px_10px_rgba(0,0,0,0.06)] p-5 flex flex-col gap-3">
            {(() => {
              if (!aiAnalysis) return <p className="text-[13px] font-medium text-[#7c8a9c]">No analysis available for this prediction.</p>;
              // Strip "Component N (Label):" prefixes and split into clean sentences
              const cleaned = aiAnalysis.replace(/Component\s+\d+\s*\([^)]+\):\s*/gi, '').trim();
              const sentences = cleaned.split(/(?<=\.)\s+/).filter(s => s.trim().length > 0);
              return sentences.map((sentence, i) => (
                <p key={i} className="text-[13px] font-medium text-[#3a3f47] leading-[1.7]">{sentence.trim()}</p>
              ));
            })()}
          </div>
        </div>

        {/* 2. Performance vs. Similar Teams */}
        {(() => {
          const rawPreGame = prediction.pre_game_value ?? prediction.pre_game_prediction ?? 0;
          const preGamePct = rawPreGame > 1 ? Math.round(rawPreGame) : Math.round(rawPreGame * 100);
          const pctChange = prediction.pct_change_value ?? 0;
          const predTitle = prediction.title || prediction.prediction_display_name || 'Prediction';
          return (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <h4 className="text-[16px] font-semibold text-[#0a0a0a]">Performance vs. Similar Teams</h4>
                <p className="text-xs font-medium text-[#7c8a9c]">Comparing {predTitle} vs Top 6{'\n'}Teams vs Bottom 6</p>
              </div>
              <div className="rounded-[8px] bg-white p-4 flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  {/* vs Top 6 row — h-24, gap-16 */}
                  <div className="flex items-center h-[24px]" style={{ gap: '16px' }}>
                    <span className="text-[12px] font-semibold text-[#7c8a9c] w-[94px] shrink-0">vs Top 6</span>
                    <span className="text-[14px] font-semibold text-[#0a0a0a] whitespace-nowrap" style={{ lineHeight: '150%' }}>{preGamePct > 0 ? `${(preGamePct / 100 * 5).toFixed(1)} Avg SOT` : '-'}</span>
                    <div className="w-px h-4 bg-[#e1e4eb] shrink-0" />
                    <div className="relative w-[90px] h-[6px] rounded-full bg-[#f7f8fa] shrink-0">
                      <div className="absolute top-0 left-0 h-[6px] rounded-full bg-[#7c8a9c] transition-all" style={{ width: `${Math.min(preGamePct, 100)}%` }} />
                    </div>
                  </div>
                  {/* vs Bottom 6 row — h-24, gap-16 */}
                  <div className="flex items-center h-[24px]" style={{ gap: '16px' }}>
                    <span className="text-[12px] font-semibold text-[#7c8a9c] w-[94px] shrink-0">vs Bottom 6</span>
                    <span className="text-[14px] font-semibold text-[#0a0a0a] whitespace-nowrap" style={{ lineHeight: '150%' }}>{percentage > 0 ? `${(percentage / 100 * 5).toFixed(1)} Avg SOT` : '-'}</span>
                    <div className="w-px h-4 bg-[#e1e4eb] shrink-0" />
                    <div className="relative w-[90px] h-[6px] rounded-full bg-[#f7f8fa] shrink-0">
                      <div className="absolute top-0 left-0 h-[6px] rounded-full bg-[#27ae60] transition-all" style={{ width: `${Math.min(percentage, 100)}%` }} />
                    </div>
                  </div>
                </div>
                {pctChange !== 0 && (
                  <div className="rounded-[4px] px-2 py-1 flex items-center gap-2" style={{ backgroundColor: '#e6f4ec' }}>
                    <img src="/trend.svg" width="18" height="18" alt="" style={{
                      filter: 'brightness(0) saturate(100%) invert(52%) sepia(79%) saturate(409%) hue-rotate(95deg) brightness(93%) contrast(91%)',
                      transform: pctChange > 0 ? 'none' : 'scaleY(-1)',
                    }} />
                    <span className="text-[12px] font-semibold text-[#27ae60]">
                      {Math.abs(pctChange).toFixed(0)}% Performance {pctChange > 0 ? 'Increase' : 'Decrease'} vs Weak Teams
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* Prediction Summary */}
        {detail?.prediction_summary && (
          <div className="rounded-[8px] bg-white p-4">
            <p className="text-[13px] font-medium text-[#3a3f47] leading-[1.7]">{detail.prediction_summary}</p>
          </div>
        )}

        {/* Divider */}
        <div className="w-full h-px bg-[#e1e4eb]" />

        {/* 3. Detailed Match Stats */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h4 className="text-[16px] font-semibold text-[#0a0a0a]" style={{ letterSpacing: '-1%' }}>Detailed Match Stats</h4>
            <p className="text-[12px] font-semibold text-[#7c8a9c]" style={{ letterSpacing: '-0.5px' }}>Last 5 matches</p>
          </div>
          <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
            <table className="w-full border-collapse">
              {/* Table header */}
              <thead>
                <tr>
                  <th colSpan={2} className="text-left text-[12px] font-semibold text-[#7c8a9c] bg-white rounded-l-[8px] px-3 h-[30px]" style={{ letterSpacing: '-0.5px' }}>MATCH</th>
                  {statCols.map((col, idx) => (
                    <th key={col.key} className={`text-center text-[12px] font-semibold text-[#7c8a9c] bg-white px-1 h-[30px] ${idx === statCols.length - 1 ? 'rounded-r-[8px]' : ''}`} style={{ letterSpacing: '-0.5px', width: '56px' }}>{col.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {homeMatchHistory.length > 0 ? homeMatchHistory.slice(0, 5).map((match: any, i: number) => {
                  const dateStr = match.date || match.starting_at;
                  const date = dateStr ? new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : '';
                  const oppName = match.opponent || match.away_team_name || match.home_team_name || '';
                  const oppLogo = match.opponent_logo || match.away_team_logo_url || match.home_team_logo_url || '';
                  const result = match.result || (match.goals > 0 ? 'W' : match.goals === 0 ? 'D' : 'L');
                  const resultColor = result === 'W' ? '#00ca68' : result === 'L' ? '#e74c3c' : '#f39c12';
                  // stat values accessed dynamically via statCols
                  return (
                    <tr key={i} className={i > 0 ? 'border-t border-[#e1e4eb]' : ''}>
                      {/* Team logo with W/D/L badge overlapping bottom-right */}
                      <td className="px-3 py-3 w-[50px]">
                        <div className="relative w-[30px] h-[30px]">
                          {oppLogo ? (
                            <img src={oppLogo} alt="" className="w-[30px] h-[30px] rounded-full object-contain" />
                          ) : (
                            <div className="w-[30px] h-[30px] rounded-full bg-[#e1e4eb]" />
                          )}
                          <div className="absolute -bottom-[2px] -right-[2px] w-[16px] h-[16px] rounded-full flex items-center justify-center border-[1.5px] border-white" style={{ backgroundColor: resultColor }}>
                            <span className="text-[8px] font-semibold text-white leading-none">{result}</span>
                          </div>
                        </div>
                      </td>
                      {/* Name + date */}
                      <td className="py-3 pr-3">
                        <div className="flex flex-col">
                          <span className="text-[12px] font-semibold text-[#000] whitespace-nowrap" style={{ letterSpacing: '-0.5px', lineHeight: '18px' }}>Vs {oppName}</span>
                          <span className="text-[12px] font-semibold text-[#7c8a9c]" style={{ letterSpacing: '-0.5px', lineHeight: '18px' }}>{date}</span>
                        </div>
                      </td>
                      {/* Stat columns */}
                      {statCols.map((col, colIdx) => {
                        const val = match[col.key];
                        return (
                          <td key={col.key} className="text-center px-1 py-3">
                            <div className="flex items-center justify-center gap-3">
                              <div className="w-px h-4 bg-[#e1e4eb]" />
                              <span className="inline-flex items-center justify-center w-[40px] h-[30px] rounded-[4px] bg-[#f7f8fa] text-[12px] font-semibold text-[#7c8a9c]" style={{ letterSpacing: '-0.5px' }}>
                                {val === true ? 'Yes' : val === false ? 'No' : val != null ? (typeof val === 'number' && !Number.isInteger(val) ? val.toFixed(1) : val) : '-'}
                              </span>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                }) : (
                  <tr><td colSpan={2 + statCols.length} className="px-4 py-6 text-[12px] text-[#7c8a9c] text-center">No match history available</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-[#e1e4eb]" />

        {/* 4. Model Confidence */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h4 className="text-[16px] font-semibold text-[#0a0a0a]" style={{ letterSpacing: '-1%', lineHeight: '24px' }}>Model confidence</h4>
            <p className="text-[12px] font-semibold text-[#7c8a9c]" style={{ letterSpacing: '-0.5px', lineHeight: '18px' }}>Based on 15+ factors</p>
          </div>
          <div className="rounded-[8px] bg-white p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-end gap-2">
                <span className="text-[32px] font-semibold" style={{ color: conf.color, letterSpacing: '-0.5px', lineHeight: '40px' }}>{modelScore.toFixed(2)}</span>
                <span className="text-[16px] font-semibold text-[#7c8a9c]" style={{ letterSpacing: '-0.5px', lineHeight: '16px', paddingBottom: '4px' }}>/  1.0</span>
              </div>
              <div className="flex items-center gap-2 px-2 py-1 rounded-[8px]" style={{ backgroundColor: '#ddefe7' }}>
                <img src="/trend.svg" width="14" height="14" alt="" style={{
                  filter: 'brightness(0) saturate(100%) invert(52%) sepia(79%) saturate(409%) hue-rotate(95deg) brightness(93%) contrast(91%)',
                  transform: modelScore < 0.5 ? 'scaleY(-1)' : 'none',
                }} />
                <span className="text-[12px] font-semibold" style={{ color: '#27ae60', letterSpacing: '-0.5px', lineHeight: '18px' }}>{conf.label}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 5. Season Context */}
        {seasonContext && (homeForm || awayForm || flatSeasonEntries.length > 0) && (
          <div className="flex flex-col gap-4">
            {/* Header: title + tab switcher (only show tabs if home_form/away_form exist) */}
            <div className="flex items-center justify-between h-[56px]">
              <h4 className="text-[16px] font-semibold text-[#0a0a0a]" style={{ letterSpacing: '-1%', lineHeight: '24px' }}>Season Context</h4>
              {(homeForm || awayForm) && (
                <div className="flex rounded-[10px] bg-white p-[6px] gap-[6px]">
                  <button onClick={() => setFormTab('home')}
                    className={`h-[44px] px-6 rounded-[8px] text-[14px] font-semibold transition-colors ${formTab === 'home' ? 'bg-[#0d1a67] text-white' : 'text-[#7c8a9c]'}`}>
                    Home Form
                  </button>
                  <button onClick={() => setFormTab('away')}
                    className={`h-[44px] px-6 rounded-[8px] text-[14px] font-semibold transition-colors ${formTab === 'away' ? 'bg-[#0d1a67] text-white' : 'text-[#7c8a9c]'}`}>
                    Away Form
                  </button>
                </div>
              )}
            </div>
            {/* Stats card - from home_form/away_form or flat season_context */}
            {(() => {
              const formLabelMap: Record<string, string> = {
                // General
                total_matches: 'Matches', appearances: 'Apps', total: 'Total', minutes: 'Minutes',
                // Goals / Scoring
                goals: 'Goals', goals_total: 'Goals', avg_goals_per_game: 'Goals/G',
                goal_conversion_rate: 'Conv. Rate', xG: 'xG',
                // Shots
                average_shots_on_target: 'Avg SOT', avg_sot_per_game: 'SOT/G',
                avg_shots_per_game: 'Shots/G', avg_shots_insidebox_per_game: 'Box Shots/G',
                avg_big_chances_per_game: 'Big Ch./G', avg_minutes: 'Avg Min',
                // Cards / Discipline
                yellowcards_total: 'Yellows', avg_yellowcards_per_game: 'Yellow/G',
                avg_fouls_per_game: 'Fouls/G', avg_tackles_per_game: 'Tackles/G',
                avg_duels_per_game: 'Duels/G', league_ref_cards_baseline: 'Ref Baseline',
                // Team context
                dangerous_attacks_pg: 'Dang. Atk/G', volatility: 'Volatility',
                h2h_goal_trend: 'H2H Goals', h2h_avg_first_goal_min: 'H2H 1st Goal',
                league_goals_per_game: 'League G/G',
                // Legacy
                average_rating: 'Avg Rating', shots_per_90: 'Shots/90',
                fouls_per_90: 'Fouls/G', tackles_per_90: 'Tackles/G',
              };
              // Clean label from flat keys like "Newcastle United_dangerous_attacks_pg"
              const cleanLabel = (k: string) => {
                // Try direct lookup first
                if (formLabelMap[k]) return formLabelMap[k];
                // Strip team name prefix (everything before the last known stat key)
                const knownKeys = Object.keys(formLabelMap);
                for (const known of knownKeys) {
                  if (k.endsWith(known)) return formLabelMap[known];
                }
                // Fallback: strip "TeamName_" prefix (team names can have spaces)
                const parts = k.split('_');
                // Try progressively removing leading parts until we find a match
                for (let i = 1; i < parts.length; i++) {
                  const remainder = parts.slice(i).join('_');
                  if (formLabelMap[remainder]) return formLabelMap[remainder];
                }
                // Last resort: humanize the whole key
                return k.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
              };
              const entries = activeForm
                ? Object.entries(activeForm)
                    .filter(([, v]) => v != null && typeof v === 'number')
                    .map(([k, v]) => ({ key: k, label: formLabelMap[k] || k.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), value: v as number }))
                : flatSeasonEntries
                    .filter(([, v]) => typeof v === 'number')
                    .map(([k, v]) => ({ key: k, label: cleanLabel(k), value: v as number }));

              if (entries.length === 0) return null;
              const colors = entries.map((_, i) => i % 3 === 1 ? '#27ae60' : '#0d1a67');
              return (
                <div className="rounded-[14px] bg-white shadow-[0_2px_10px_rgba(0,0,0,0.06)] px-[20px] py-[20px]">
                  <div className="grid grid-cols-3 gap-y-6">
                    {entries.slice(0, 6).map((entry, i) => (
                      <div key={entry.key} className={`flex flex-col items-center ${i % 3 !== 0 ? 'border-l border-[#d9d9d9]' : ''}`}>
                        <span className="text-[28px] font-bold" style={{ color: colors[i], lineHeight: '130%' }}>
                          {typeof entry.value === 'number' ? (Number.isInteger(entry.value) ? entry.value : entry.value.toFixed(1)) : entry.value}
                        </span>
                        <span className="text-[12px] font-medium text-[#7c8a9c] text-center mt-1">{entry.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}

export function MatchDetailPage() {
  const { fixtureId } = useParams<{ fixtureId: string }>();
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('predictions');
  const [predictionCategory, setPredictionCategory] = useState<string>('all');
  const [commentaryFilter] = useState<'all' | 'goals' | 'cards' | 'important'>('all');
  const [selectedPrediction, setSelectedPrediction] = useState<any>(null);
  const [drawerClosing, setDrawerClosing] = useState(false);
  const aiPanelRef = useRef<HTMLDivElement>(null);
  const predCardsRef = useRef<HTMLDivElement>(null);
  const [aiPanelHeight, setAiPanelHeight] = useState(0);
  const closeMobileDrawer = () => {
    setDrawerClosing(true);
    setTimeout(() => {
      setSelectedPrediction(null);
      setDrawerClosing(false);
    }, 250);
  };
  const [playerStatsTab, setPlayerStatsTab] = useState<'summary' | 'attacking' | 'passing' | 'defensive' | 'discipline'>('summary');
  const [expandedStatCards, setExpandedStatCards] = useState<Set<string>>(new Set());
  const [h2hModalFixture, setH2hModalFixture] = useState<any>(null);

  // Sync left card list height with AI panel height
  useEffect(() => {
    if (!selectedPrediction || !aiPanelRef.current) { setAiPanelHeight(0); return; }
    const observer = new ResizeObserver(([entry]) => setAiPanelHeight(entry.contentRect.height));
    observer.observe(aiPanelRef.current);
    return () => observer.disconnect();
  }, [selectedPrediction]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (selectedPrediction && window.innerWidth < 768) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [selectedPrediction]);

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
  const inlinePredictions = fixtureData?.predictions || [];

  // Fetch full predictions (with detail) from /fixtures/{id}/predictions
  const { data: fullPredictionsResponse } = useFixturePredictions(
    { fixture_id: fixtureId ? parseInt(fixtureId, 10) : undefined, limit: 500, sort_by: 'pct_change', sort_order: 'desc' },
    { enabled: !!fixtureId }
  );
  const fullPredictions: any[] = (fullPredictionsResponse?.data as any)?.predictions || (fullPredictionsResponse?.data as any) || [];

  // Extract unique player IDs from player predictions for the Player Stats section
  const featuredPlayerIds = useMemo(() => {
    const ids = new Set<number>();
    fullPredictions.forEach((p: any) => {
      if (p.player_id && typeof p.player_id === 'number') ids.add(p.player_id);
    });
    return Array.from(ids).slice(0, 12);
  }, [fullPredictions]);

  // Player details/stats now come from inline statsData.players (fixture statistics endpoint)

  // When a prediction is selected, enrich it with detail from full predictions
  const selectedPredictionWithDetail = useMemo(() => {
    if (!selectedPrediction) return null;
    const full = fullPredictions.find(
      (p: any) => p.prediction_type === selectedPrediction.prediction_type &&
        (p.title || '') === (selectedPrediction.prediction_display_name || selectedPrediction.title || '')
    ) || fullPredictions.find(
      (p: any) => p.prediction_type === selectedPrediction.prediction_type && p.detail != null
    );
    return full ? { ...selectedPrediction, ...full } : selectedPrediction;
  }, [selectedPrediction, fullPredictions]);

  // Fetch fixture statistics
  const { data: statsResponse, isLoading: isLoadingStats } = useFixtureStatistics(fixtureId || '');
  // Backend returns { statistics: { basic: {...}, advanced: {...}, players: [...] } }
  const staticStatsData = statsResponse?.data?.statistics;

  // Team colours from fixture statistics — used for radar chart, stat bars, and comparison cards
  const homeTeamColour = staticStatsData?.home_team_color || '#0a0a0a';
  const awayTeamColour = staticStatsData?.away_team_color || '#0a0a0a';
  // Lighter versions for radar fill (append 40-80 hex opacity)
  const homeTeamColourLight = `${homeTeamColour}60`;
  const awayTeamColourLight = `${awayTeamColour}40`;

  // Resolve player names/images from player IDs in stats
  const statsPlayerIds = useMemo(() => {
    return ((staticStatsData as any)?.players || []).map((p: any) => p.player_id as number);
  }, [staticStatsData]);
  const statsPlayerDetails = useMultiplePlayerDetails(statsPlayerIds);

  // Fetch fixture commentary
  const { data: commentaryResponse, isLoading: isLoadingCommentary, error: commentaryError } = useFixtureCommentary(fixtureId || '');
  // Backend returns { commentaries: [...], fixture_id, total_commentaries, etc. }
  const staticCommentaryItems = commentaryResponse?.data?.commentaries;

  // ==================== SSE Live Streaming ====================
  // Only subscribe to streams when the match is live
  const isLiveMatch = !!fixture?.is_live;

  // Track previous tab to detect tab changes and apply the 1.5s delay
  const prevTabRef = useRef<TabType>(activeTab);
  const [sseDelay, setSseDelay] = useState(0);

  // On tab change: set delay so static data loads before stream subscribes
  useEffect(() => {
    if (prevTabRef.current !== activeTab) {
      prevTabRef.current = activeTab;
      setSseDelay(1500);
    }
  }, [activeTab]);

  // Reset delay after it has been consumed
  useEffect(() => {
    if (sseDelay > 0) {
      const timer = setTimeout(() => setSseDelay(0), sseDelay + 100);
      return () => clearTimeout(timer);
    }
  }, [sseDelay]);

  // Predictions SSE stream (no delay on initial landing since predictions is the default tab)
  const { data: streamedPredictions, isConnected: isPredictionsStreaming } = useSSEStream<any>({
    path: fixtureId ? `/fixtures/${fixtureId}/predictions/stream` : null,
    enabled: isLiveMatch && !!fixtureId && activeTab === 'predictions',
    delay: activeTab === 'predictions' && sseDelay === 0 ? 0 : sseDelay,
  });

  // Commentary SSE stream
  const { data: streamedCommentary, isConnected: isCommentaryStreaming } = useSSEStream<any>({
    path: fixtureId ? `/fixtures/${fixtureId}/commentary/stream` : null,
    enabled: isLiveMatch && !!fixtureId && activeTab === 'commentary',
    delay: sseDelay,
  });

  // Statistics SSE stream
  const { data: streamedStats, isConnected: isStatsStreaming } = useSSEStream<any>({
    path: fixtureId ? `/fixtures/${fixtureId}/statistics/stream` : null,
    enabled: isLiveMatch && !!fixtureId && activeTab === 'stats',
    delay: sseDelay,
  });

  // Lineups SSE stream
  const { data: _streamedLineups } = useSSEStream<any>({
    path: fixtureId ? `/fixtures/${fixtureId}/lineups/stream` : null,
    enabled: isLiveMatch && !!fixtureId && activeTab === 'lineups',
    delay: sseDelay,
  });

  // Merge streamed predictions with static data
  const predictions = useMemo(() => {
    const base = fullPredictions.length > 0 ? fullPredictions : inlinePredictions;
    if (!streamedPredictions) return base;
    const streamed = Array.isArray(streamedPredictions)
      ? streamedPredictions
      : streamedPredictions?.predictions || [];
    if (streamed.length === 0) return base;
    // Merge: streamed values take priority, keyed by prediction_type + display name
    const merged = new Map<string, any>();
    for (const p of base) {
      const key = `${p.prediction_type}::${p.prediction_display_name || p.title || ''}`;
      merged.set(key, p);
    }
    for (const p of streamed) {
      const key = `${p.prediction_type}::${p.prediction_display_name || p.title || ''}`;
      merged.set(key, { ...merged.get(key), ...p });
    }
    return Array.from(merged.values());
  }, [fullPredictions, inlinePredictions, streamedPredictions]);

  // Filter predictions by category
  const filteredPredictions = useMemo(() => {
    if (predictionCategory === 'all') return predictions;
    return predictions.filter((p: any) => {
      const type = (p.prediction_type || '').toLowerCase();
      const title = (p.title || p.prediction_display_name || '').toLowerCase();
      switch (predictionCategory) {
        case 'player': return type === 'anytime_goalscorer' || type.includes('player') || type.includes('scorer');
        case 'match': return type === 'both_teams_to_score' || type === 'total_goals' || type.includes('match');
        case 'team': return type === 'total_corners' || type === 'both_teams_to_score' || type === 'total_goals' || type.includes('team');
        case 'cards': return type === 'player_to_be_booked' || type.includes('card') || title.includes('card') || title.includes('booking') || title.includes('yellow');
        case 'shots': return type === 'shots_on_target' || type.includes('shot') || title.includes('shot');
        default: return true;
      }
    });
  }, [predictions, predictionCategory]);

  // Merge streamed commentary with static data
  const commentaryItems = useMemo(() => {
    if (!streamedCommentary) return staticCommentaryItems;
    const streamed = Array.isArray(streamedCommentary)
      ? streamedCommentary
      : streamedCommentary?.commentaries || [];
    if (streamed.length === 0) return staticCommentaryItems;
    const existing = staticCommentaryItems || [];
    const existingKeys = new Set(existing.map((c: any) => `${c.minute}::${c.comment}`));
    const newItems = streamed.filter((c: any) => !existingKeys.has(`${c.minute}::${c.comment}`));
    return [...newItems, ...existing].sort((a: any, b: any) => (b.minute ?? 0) - (a.minute ?? 0));
  }, [staticCommentaryItems, streamedCommentary]);

  // Merge streamed stats with static data
  const statsData = useMemo(() => {
    if (!streamedStats) return staticStatsData;
    const streamed = streamedStats?.statistics || streamedStats;
    if (!streamed || typeof streamed !== 'object') return staticStatsData;
    return { ...staticStatsData, ...streamed };
  }, [staticStatsData, streamedStats]);

  // Mock commentary data (used when API doesn't return data)

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
    { id: 'predictions' as TabType, label: 'Insights' },
    { id: 'stats' as TabType, label: 'Stats' },
    { id: 'commentary' as TabType, label: 'Commentary' },
    { id: 'lineups' as TabType, label: 'Lineups' },
  ];

  // Loading skeleton
  if (isLoadingFixtures) {
    return (
      <div className="min-h-[100vh] flex flex-col bg-gray-50">
        <Header />
        <div className="flex-1 max-w-[1400px] mx-auto px-4 md:px-6 py-6 pb-32 md:pb-6 w-full">
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header currentPage="matches" />

      <main className="pb-32 md:pb-0 flex-1">
        {/* Match Banner - Using reusable component */}
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 pt-6">
          <MatchBanner fixture={fixture} predictions={[]} showPredictions={false} variant="compact" />
        </div>

        {/* Content */}
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-4 md:py-6">
          {/* Tabs */}
          <div className="flex items-center justify-between mb-4 md:mb-6 gap-2">
            <div className="bg-[#f7f8fa] rounded-[10px] p-1.5 flex items-center flex-1 overflow-x-auto scrollbar-hide">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setSelectedPrediction(null); }}
                  className={`flex-1 shrink-0 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-[#0d1a67] text-white'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Predictions Tab */}
          {activeTab === 'predictions' && (
            <div className="space-y-4">
              {/* Desktop: Header row: count + live badge — on white bg */}
              <div className="hidden md:flex items-center justify-between">
                <h2
                  className="text-[22px] font-semibold text-[#0a0a0a] leading-[130%]"
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                >
                  {predictions.length} Insights Available
                </h2>
                {isPredictionsStreaming && (
                  <div
                    className="flex items-center gap-[5px] pl-2 pr-4 h-[40px] rounded-[8px] border border-[#d9d9d9]"
                    style={{
                      backgroundColor: '#27ae60',
                      boxShadow: '0 7px 4px -3px rgba(0,0,0,0.05)',
                      fontFamily: 'Montserrat, sans-serif',
                    }}
                  >
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    <span className="text-white text-[14px] font-medium">Insights Updating in Real-Time</span>
                  </div>
                )}
              </div>

              {/* Desktop: Sub-filter bar: category pills + Filters button — on white bg */}
              <div className="hidden md:flex items-center justify-between gap-[10px] px-[10px] py-[8px]">
                <div className="flex items-center gap-[10px]">
                  {[
                    { id: 'all', label: 'All Insights' },
                    { id: 'player', label: 'Player' },
                    { id: 'match', label: 'Match' },
                    { id: 'team', label: 'Team' },
                    { id: 'cards', label: 'Cards' },
                    { id: 'shots', label: 'Shots' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => { setPredictionCategory(cat.id); setSelectedPrediction(null); }}
                      className={`h-[38px] px-[10px] rounded-lg text-sm font-medium leading-[20px] transition-colors flex items-center justify-center ${
                        predictionCategory === cat.id
                          ? 'bg-[#0d1a67] text-white'
                          : 'bg-white text-[#7c8a9c]'
                      }`}
                      style={{ fontFamily: 'Montserrat, sans-serif' }}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
                <button
                  className="h-[38px] px-4 py-3 rounded-lg bg-[#0d1a67] text-white text-sm font-medium transition-colors flex items-center gap-[10px]"
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                >
                  <img src="/filter.svg" alt="" width="16" height="16" />
                  Filters
                </button>
              </div>

              {/* Mobile: #f7f8fa container with header + cards */}
              <div className="md:hidden rounded-[10px] bg-[#f7f8fa] p-[10px] flex flex-col gap-[15px]">
                {/* Mobile live badge */}
                {fixture?.is_live && (
                  <div
                    className="flex items-center gap-[6px] px-[6px] py-[6px] rounded-[6px]"
                    style={{
                      backgroundColor: '#27ae60',
                      fontFamily: 'Montserrat, sans-serif',
                    }}
                  >
                    <span className="w-[6px] h-[6px] rounded-full bg-white animate-pulse" />
                    <span className="text-white text-[13px] font-medium leading-[150%]">Insights updating in real-time</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span
                    className="text-sm font-semibold text-[#0a0a0a] leading-[150%]"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    {predictions.length} Insights Available
                  </span>
                  <button
                    className="h-[38px] px-2 py-[7px] rounded-lg bg-[#0d1a67] text-white text-[13px] font-medium transition-colors flex items-center gap-[10px]"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    <img src="/filter.svg" alt="" width="16" height="16" />
                    Filters
                  </button>
                </div>
                {isLoadingFixtures ? (
                  <div className="flex flex-col gap-[20px]">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="bg-white rounded-[14px] p-3 animate-pulse" style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
                        <div className="h-5 bg-gray-200 rounded w-1/4 mb-3" />
                        <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
                        <div className="h-4 bg-gray-200 rounded w-1/3 mb-5" />
                        <div className="rounded-[10px] bg-[#f7f8fa] p-2">
                          <div className="h-5 bg-gray-200 rounded w-1/4 mb-3" />
                          <div className="h-2 bg-gray-200 rounded-[10px] w-full mb-3" />
                          <div className="h-4 bg-gray-200 rounded w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredPredictions.length > 0 ? (
                  <>
                    <div className="flex flex-col gap-[12px]">
                      {filteredPredictions.slice(0, 5).map((prediction: any, index: number) => (
                        <div key={prediction.prediction_id || index} id={`pred-card-mobile-${index}`}>
                        <PredictionCard
                          prediction={prediction}
                          index={index}
                          isLive={fixture?.minutes_elapsed !== null && fixture?.minutes_elapsed !== undefined}
                          isBlurred={!isAuthenticated && index >= 3}
                          isSelected={selectedPrediction === prediction}
                          onClick={() => {
                            const next = selectedPrediction === prediction ? null : prediction;
                            setSelectedPrediction(next);
                          }}
                        />
                        </div>
                      ))}
                    </div>
                    {/* Mobile AI Analysis — Bottom Drawer */}
                    {selectedPrediction && (
                      <div className="md:hidden fixed inset-0 z-[100]" onClick={closeMobileDrawer}>
                        {/* Backdrop */}
                        <div className={`absolute inset-0 bg-black/50 transition-opacity ${drawerClosing ? 'opacity-0' : 'opacity-100'}`} />
                        {/* Drawer */}
                        <div
                          className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-[20px] max-h-[85vh] overflow-y-auto ${drawerClosing ? 'animate-slide-down' : 'animate-slide-up'}`}
                          style={{ fontFamily: 'Montserrat, sans-serif' }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {/* Header */}
                          <div className="sticky top-0 z-10 bg-white rounded-t-[20px] px-4 pt-4 pb-3 flex items-center justify-between border-b border-[#e1e4eb]">
                            <h3 className="text-[18px] font-semibold text-[#0a0a0a]">Details</h3>
                            <button
                              onClick={closeMobileDrawer}
                              className="w-6 h-6 flex items-center justify-center"
                            >
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                              </svg>
                            </button>
                          </div>
                          {/* Content */}
                          <div className="p-4">
                            <AIAnalysisPanel
                              prediction={selectedPredictionWithDetail || selectedPrediction}
                              fixture={fixture}
                              statsData={statsData}
                              onClose={closeMobileDrawer}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                    {!isAuthenticated && filteredPredictions.length > 6 && (
                      <button
                        onClick={() => window.location.href = '/login'}
                        className="w-full h-[38px] rounded-lg flex items-center justify-center gap-[10px] border border-[#d9d9d9] text-white text-[13px] font-medium"
                        style={{
                          backgroundColor: '#0d1a67',
                          boxShadow: '0 7px 4px -3px rgba(0,0,0,0.05)',
                          fontFamily: 'Montserrat, sans-serif',
                        }}
                      >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                          <path d="M6 10V8C6 4.69 7 2 12 2C17 2 18 4.69 18 8V10" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M12 18.5C13.1046 18.5 14 17.6046 14 16.5C14 15.3954 13.1046 14.5 12 14.5C10.8954 14.5 10 15.3954 10 16.5C10 17.6046 10.8954 18.5 12 18.5Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M17 22H7C3 22 2 21 2 17V15C2 11 3 10 7 10H17C21 10 22 11 22 15V17C22 21 21 22 17 22Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        See All Insights
                      </button>
                    )}
                  </>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    No predictions available for this match
                  </div>
                )}
              </div>

              {/* Desktop: cards in flex grid + AI Analysis panel */}
              <div className="hidden md:flex gap-5 items-start bg-[#F5F5F5] rounded-[20px] p-5">
                <div className={`${selectedPrediction ? 'w-[400px] flex-shrink-0 sticky top-4 self-start' : 'flex-1'} transition-all duration-300`}>
                {isLoadingFixtures ? (
                  <div className={`${selectedPrediction ? 'flex flex-col' : 'flex flex-row flex-wrap'} items-start gap-[20px]`}>
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className={`bg-white rounded-[20px] p-5 animate-pulse ${selectedPrediction ? 'w-full' : 'w-[calc(33.333%-14px)] max-w-[440px]'}`} style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
                        <div className="h-5 bg-gray-200 rounded w-1/4 mb-3" />
                        <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
                        <div className="h-4 bg-gray-200 rounded w-1/3 mb-5" />
                        <div className="rounded-[14px] bg-[#f7f8fa] p-[10px]">
                          <div className="h-5 bg-gray-200 rounded w-1/4 mb-3" />
                          <div className="h-[6px] bg-gray-200 rounded-full w-full mb-3" />
                          <div className="h-4 bg-gray-200 rounded w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredPredictions.length > 0 ? (
                  <>
                    <div ref={selectedPrediction ? predCardsRef : undefined} className={`${selectedPrediction ? 'flex flex-col overflow-y-auto pr-2 prediction-scroll snap-y snap-mandatory' : 'flex flex-row flex-wrap'} items-start gap-[20px] min-h-[300px] p-[12px]`} style={selectedPrediction && aiPanelHeight > 0 ? { maxHeight: aiPanelHeight } : selectedPrediction ? { maxHeight: '80vh' } : undefined}>
                      {filteredPredictions.map((prediction: any, index: number) => (
                        <div key={prediction.prediction_id || index} id={`pred-card-desktop-${index}`} className={`${selectedPrediction ? 'w-full snap-start scroll-mt-[12px]' : 'w-[calc(33.333%-14px)]'}`}>
                        <PredictionCard
                          prediction={prediction}
                          index={index}
                          isLive={fixture?.minutes_elapsed !== null && fixture?.minutes_elapsed !== undefined}
                          isBlurred={!isAuthenticated && index >= 6}
                          isSelected={selectedPrediction === prediction}
                          onClick={() => {
                            const next = selectedPrediction === prediction ? null : prediction;
                            setSelectedPrediction(next);
                            if (next) {
                              setTimeout(() => {
                                document.getElementById(`pred-card-desktop-${index}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                              }, 50);
                            }
                          }}
                          compact={!!selectedPrediction}
                        />
                        </div>
                      ))}
                    </div>
                    {!isAuthenticated && filteredPredictions.length > 6 && (
                      <button
                        onClick={() => window.location.href = '/login'}
                        className="w-full h-[50px] mt-5 rounded-lg flex items-center justify-center gap-[10px] border border-[#d9d9d9] text-white text-sm font-medium"
                        style={{
                          backgroundColor: '#0d1a67',
                          boxShadow: '0 7px 4px -3px rgba(0,0,0,0.05)',
                          fontFamily: 'Montserrat, sans-serif',
                        }}
                      >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                          <path d="M6 10V8C6 4.69 7 2 12 2C17 2 18 4.69 18 8V10" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M12 18.5C13.1046 18.5 14 17.6046 14 16.5C14 15.3954 13.1046 14.5 12 14.5C10.8954 14.5 10 15.3954 10 16.5C10 17.6046 10.8954 18.5 12 18.5Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M17 22H7C3 22 2 21 2 17V15C2 11 3 10 7 10H17C21 10 22 11 22 15V17C22 21 21 22 17 22Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        See All Insights
                      </button>
                    )}
                  </>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    No predictions available for this match
                  </div>
                )}
                </div>
                {/* Desktop AI Analysis Panel */}
                {selectedPrediction && (
                  <div className="flex-1 sticky top-4 self-start min-w-0" ref={aiPanelRef}>
                    <AIAnalysisPanel
                      prediction={selectedPredictionWithDetail || selectedPrediction}
                      fixture={fixture}
                      statsData={statsData}
                      onClose={() => setSelectedPrediction(null)}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Commentary Tab */}
          {activeTab === 'commentary' && (
            <div className="bg-white rounded-[14px] md:rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.06)] p-4 md:p-5">
              {isCommentaryStreaming && (
                <div className="flex items-center gap-[5px] pl-2 pr-4 h-[40px] rounded-[8px] border border-[#d9d9d9] w-fit mb-4" style={{ backgroundColor: '#27ae60', boxShadow: '0 7px 4px -3px rgba(0,0,0,0.05)', fontFamily: 'Montserrat, sans-serif' }}>
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  <span className="text-white text-[14px] font-medium">Commentary Updating in Real-Time</span>
                </div>
              )}
              {isLoadingCommentary ? (
                <div className="space-y-3 md:space-y-4 animate-pulse">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-start gap-4 md:gap-5 py-3 md:py-4 border-b border-gray-100 last:border-0">
                      <div className="w-12 md:w-14 h-5 md:h-6 bg-gray-200 rounded" />
                      <div className="w-7 h-7 bg-gray-200 rounded-md" />
                      <div className="flex-1 h-4 md:h-5 bg-gray-200 rounded" />
                    </div>
                  ))}
                </div>
              ) : (!commentaryItems || commentaryItems.length === 0 || commentaryError) ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <img src="/404.svg" alt="No commentary" className="w-28 h-28 mb-4 opacity-60" />
                  <p className="text-[#7c8a9c] font-semibold text-base">No commentary available</p>
                  <p className="text-[#7c8a9c] text-sm mt-1">Commentary will appear when the match is live</p>
                </div>
              ) : (
                <>
                  {commentaryItems.map((item: any) => ({
                    minute: item.extra_minute ? `${item.minute}+${item.extra_minute}'` : `${item.minute}'`,
                    type: item.type || 'general',
                    comment: item.comment,
                    score: item.score,
                    isGoal: item.is_goal || item.type === 'goal',
                  }))
                    .filter((item: any) => {
                      if (commentaryFilter === 'all') return true;
                      if (commentaryFilter === 'goals') return item.type === 'goal' || item.isGoal;
                      if (commentaryFilter === 'cards') return item.type === 'yellow_card' || item.type === 'red_card';
                      if (commentaryFilter === 'important') {
                        return item.type === 'goal' || item.isGoal ||
                               item.type === 'yellow_card' || item.type === 'red_card' ||
                               item.type === 'substitution';
                      }
                      return true;
                    })
                    .map((item: any, index: number) => (
                    <CommentaryItem
                      key={index}
                      minute={item.minute}
                      type={item.type || 'general'}
                      comment={item.comment}
                      score={item.score}
                      isGoal={item.isGoal}
                    />
                  ))}
                </>
              )}
            </div>
          )}
          {activeTab === 'stats' && (
            <div className="flex flex-col gap-[30px]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              {isStatsStreaming && (
                <div className="flex items-center gap-[5px] pl-2 pr-4 h-[40px] rounded-[8px] border border-[#d9d9d9] w-fit" style={{ backgroundColor: '#27ae60', boxShadow: '0 7px 4px -3px rgba(0,0,0,0.05)', fontFamily: 'Montserrat, sans-serif' }}>
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  <span className="text-white text-[14px] font-medium">Stats Updating in Real-Time</span>
                </div>
              )}
              {/* ═══ SECTION 1: MATCH HEADER ═══ stacks on mobile, horizontal on desktop */}
              <div className="flex flex-col xl:flex-row gap-[30px]">

              {/* LEFT PANEL: Match Stats — 950x514, rounded-10, white, shadow */}
              <div className="w-[950px] max-w-full h-[514px] bg-white rounded-[10px] shadow-[0_0_20px_0_rgba(0,0,0,0.10)] pt-[24px] px-[16px] pb-[16px] flex flex-col gap-[16px]">
                {/* Match Info Bar — 918x32, horizontal, space-between, px-20, gap-46 */}
                <div className="flex items-center justify-between px-[20px] h-[32px]" style={{ gap: '46px' }}>
                  <div className="flex items-center gap-3">
                    {fixture?.home_team_image_path
                      ? <img src={fixture.home_team_image_path} alt={fixture.home_team_name} className="w-8 h-8 object-contain" />
                      : <div className="w-8 h-8 bg-[#f7f8fa] rounded-full" />}
                    <span className="text-[14px] font-semibold text-[#0a0a0a]">
                      {fixture?.home_team_short_code || fixture?.home_team_name?.slice(0, 3).toUpperCase() || 'HOM'}
                    </span>
                  </div>
                  <span className="text-[14px] font-semibold text-[#7c8a9c]">VS</span>
                  <div className="flex items-center gap-3">
                    <span className="text-[14px] font-semibold text-[#0a0a0a]">
                      {fixture?.away_team_short_code || fixture?.away_team_name?.slice(0, 3).toUpperCase() || 'AWY'}
                    </span>
                    {fixture?.away_team_image_path
                      ? <img src={fixture.away_team_image_path} alt={fixture.away_team_name} className="w-8 h-8 object-contain" />
                      : <div className="w-8 h-8 bg-[#f7f8fa] rounded-full" />}
                  </div>
                </div>
                {/* Stat bars */}
                {isLoadingStats ? (
                  <div className="bg-[#f7f8fa] rounded-[15px] p-4 space-y-3 animate-pulse">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className="flex items-center gap-4 py-2">
                        <div className="w-8 h-3 bg-gray-200 rounded" />
                        <div className="flex-1 h-1.5 bg-gray-200 rounded-full" />
                        <div className="w-8 h-3 bg-gray-200 rounded" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-[#f7f8fa] rounded-[15px] p-[16px] flex flex-col items-center" style={{ gap: '32px' }}>
                    {(() => {
                      const raw = statsData?.raw_statistics?.top_level_summary || {};
                      return [
                        { label: 'Ball possession', home: raw['ball-possession']?.home ?? null, away: raw['ball-possession']?.away ?? null, isPct: true, h: 44 },
                        { label: 'Total shots', home: raw['shots-total']?.home ?? null, away: raw['shots-total']?.away ?? null, h: 38 },
                        { label: 'Corner kicks', home: raw['corners']?.home ?? null, away: raw['corners']?.away ?? null, h: 38 },
                        { label: 'Fouls', home: raw['fouls']?.home ?? null, away: raw['fouls']?.away ?? null, h: 38 },
                        { label: 'Passes completed', home: raw['successful-passes']?.home ?? null, away: raw['successful-passes']?.away ?? null, h: 38 },
                        { label: 'Total shots', home: raw['shots-total']?.home ?? null, away: raw['shots-total']?.away ?? null, h: 38 },
                      ];
                    })().map((s, i) => (
                      <div key={`${s.label}-${i}`} className="w-full">
                        <StatBar label={s.label} homeValue={s.home ?? 0} awayValue={s.away ?? 0} isPercentage={s.isPct} homeColour={homeTeamColour} awayColour={awayTeamColour} />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* RIGHT PANEL (desktop) / BELOW STATS (mobile): Team Analysis */}
              <div className="flex w-full xl:w-[460px] h-auto xl:h-[514px] shrink-0 bg-white rounded-[10px] shadow-[0_0_20px_0_rgba(0,0,0,0.10)] pt-[16px] pb-[16px] px-[16px] xl:px-[24px] flex-col items-center gap-[20px] xl:gap-[30px]">
                {/* Header — title left, See Previous button right */}
                <div className="w-full flex items-start justify-between">
                  <div className="flex flex-col" style={{ gap: '4px' }}>
                    <h3 className="text-[16px] font-semibold text-[#0a0a0a]" style={{ lineHeight: '24px' }}>Team Analysis</h3>
                    <p className="text-[12px] font-semibold text-[#7c8a9c]" style={{ letterSpacing: '-0.5px', lineHeight: '18px' }}>Based on performance in the last match</p>
                  </div>
                  <button className="h-[46px] px-[16px] py-[12px] rounded-[8px] bg-[#f7f8fa] text-[14px] font-medium text-[#0a0a0a] flex items-center gap-[10px] hover:opacity-70 whitespace-nowrap">
                    See Previous <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
                  </button>
                </div>
                {/* Radar chart — data-driven from raw_statistics */}
                {(() => {
                  const raw = statsData?.raw_statistics || {} as any;
                  const atk = raw.attacking_threat || {};
                  const shots = raw.shots || {};
                  const duels = raw.duels_and_dribbling || {};
                  const def = raw.defence_and_discipline || {};
                  const pas = raw.passes || {};
                  // Compute scores per axis (0-100 scale)
                  const computeScore = (val: number, max: number) => Math.min(Math.round((val / Math.max(max, 1)) * 100), 100);

                  // ATT: goals + dangerous-attacks + shots-on-target
                  const attHome = (atk['goals']?.home || 0) * 20 + (atk['dangerous-attacks']?.home || 0) * 0.5 + (shots['shots-on-target']?.home || 0) * 3;
                  const attAway = (atk['goals']?.away || 0) * 20 + (atk['dangerous-attacks']?.away || 0) * 0.5 + (shots['shots-on-target']?.away || 0) * 3;
                  const attMax = Math.max(attHome, attAway, 1);

                  // TEC: pass accuracy + dribble success
                  const tecHome = (pas['successful-passes-percentage']?.home || 0) + (duels['successful-dribbles-percentage']?.home || 0) * 0.5;
                  const tecAway = (pas['successful-passes-percentage']?.away || 0) + (duels['successful-dribbles-percentage']?.away || 0) * 0.5;
                  const tecMax = Math.max(tecHome, tecAway, 1);

                  // TAC: tackles + interceptions
                  const tacHome = (def['tackles']?.home || 0) + (def['interceptions']?.home || 0);
                  const tacAway = (def['tackles']?.away || 0) + (def['interceptions']?.away || 0);
                  const tacMax = Math.max(tacHome, tacAway, 1);

                  // DEF: saves + ball-safe + successful-headers
                  const defHome = (def['saves']?.home || 0) * 3 + (def['ball-safe']?.home || 0) + (duels['successful-headers']?.home || 0);
                  const defAway = (def['saves']?.away || 0) * 3 + (def['ball-safe']?.away || 0) + (duels['successful-headers']?.away || 0);
                  const defMax = Math.max(defHome, defAway, 1);

                  // CRE: key-passes + big-chances-created + assists
                  const creHome = (pas['key-passes']?.home || 0) + (atk['big-chances-created']?.home || 0) * 3 + (atk['assists']?.home || 0) * 5;
                  const creAway = (pas['key-passes']?.away || 0) + (atk['big-chances-created']?.away || 0) * 3 + (atk['assists']?.away || 0) * 5;
                  const creMax = Math.max(creHome, creAway, 1);

                  // Order: ATT (top), TEC (right), TAC (bottom-right), DEF (bottom-left), CRE (left)
                  const homeScores = [
                    computeScore(attHome, attMax),
                    computeScore(tecHome, tecMax),
                    computeScore(tacHome, tacMax),
                    computeScore(defHome, defMax),
                    computeScore(creHome, creMax),
                  ];
                  const awayScores = [
                    computeScore(attAway, attMax),
                    computeScore(tecAway, tecMax),
                    computeScore(tacAway, tacMax),
                    computeScore(defAway, defMax),
                    computeScore(creAway, creMax),
                  ];

                  const cx = 132, cy = 124, maxR = 103;
                  const toPoints = (scores: number[]) => scores.map((s, j) => {
                    const r = (s / 100) * maxR;
                    const angle = (Math.PI * 2 * j / 5) - Math.PI / 2;
                    return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
                  }).join(' ');

                  const labels = [
                    { name: 'ATT', homeVal: homeScores[0], awayVal: awayScores[0], style: { top: '0%', left: '50%', transform: 'translateX(-50%)' } },
                    { name: 'TEC', homeVal: homeScores[1], awayVal: awayScores[1], style: { top: '28%', right: '0%' } },
                    { name: 'TAC', homeVal: homeScores[2], awayVal: awayScores[2], style: { bottom: '3%', right: '10%' } },
                    { name: 'DEF', homeVal: homeScores[3], awayVal: awayScores[3], style: { bottom: '3%', left: '10%' } },
                    { name: 'CRE', homeVal: homeScores[4], awayVal: awayScores[4], style: { top: '28%', left: '0%' } },
                  ];

                  return (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="relative w-[280px] h-[220px] xl:w-[415px] xl:h-[325px] group">
                        <svg viewBox="0 0 264 247" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[187px] xl:w-[264px] xl:h-[247px]">
                          {/* 100% reference pentagon */}
                          <polygon points={toPoints([100,100,100,100,100])} fill="#f7f8fa" stroke="#f7f8fa" strokeWidth="0.85" />
                          {/* Interval grid pentagons — dashed at 20%, 40%, 60%, 80% */}
                          {[0.2, 0.4, 0.6, 0.8].map((scale, i) => (
                            <polygon key={i} points={toPoints([scale*100,scale*100,scale*100,scale*100,scale*100])} fill="none" stroke="#e1e4eb" strokeWidth="0.5" strokeDasharray="4 3" />
                          ))}
                          {/* Axis lines from center to each vertex */}
                          {[0, 1, 2, 3, 4].map(j => {
                            const angle = (Math.PI * 2 * j / 5) - Math.PI / 2;
                            return <line key={j} x1={cx} y1={cy} x2={cx + maxR * Math.cos(angle)} y2={cy + maxR * Math.sin(angle)} stroke="#e1e4eb" strokeWidth="0.5" />;
                          })}
                          {/* Interval % labels along top-left axis (always visible) */}
                          {[20, 40, 60, 80, 100].map(pct => {
                            const r = (pct / 100) * maxR;
                            const angle = -Math.PI / 2; // top axis
                            const x = cx + r * Math.cos(angle);
                            const y = cy + r * Math.sin(angle);
                            return (
                              <text key={pct} x={x + 5} y={y + 3} fontSize="7" fill="#b0b8c4" fontWeight="500">{pct}%</text>
                            );
                          })}
                          {/* Home team shape */}
                          <polygon points={toPoints(homeScores)} fill={homeTeamColourLight} stroke={homeTeamColour} strokeWidth="1.7" opacity="0.85" />
                          {/* Away team shape */}
                          <polygon points={toPoints(awayScores)} fill={awayTeamColourLight} stroke={awayTeamColour} strokeWidth="1.7" />
                        </svg>
                        {/* Labels with value pills */}
                        {labels.map(lbl => (
                          <div key={lbl.name} className="absolute flex flex-col items-center gap-[2px]" style={lbl.style as any}>
                            {/* Label + score pills */}
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] font-semibold text-[#8c99a9]" style={{ letterSpacing: '-0.5px', lineHeight: '18px' }}>{lbl.name}</span>
                              <div className="flex gap-[2px]">
                                <span className="px-1 py-[6px] rounded-[4px] bg-[#f7f8fa] text-[10px] font-medium" style={{ lineHeight: '7px', color: homeTeamColour }}>{lbl.homeVal}</span>
                                <span className="px-1 py-[6px] rounded-[4px] bg-[#f7f8fa] text-[10px] font-medium" style={{ lineHeight: '7px', color: awayTeamColour }}>{lbl.awayVal}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
                {/* Legend — 103x40, vertical, 4px gap */}
                <div className="flex flex-col items-center gap-[4px]">
                  <div className="flex items-center gap-2">
                    <div className="w-[24px] h-[6px] rounded-full" style={{ backgroundColor: homeTeamColour }} />
                    <span className="text-[10px] font-semibold" style={{ letterSpacing: '-0.5px', lineHeight: '18px', color: homeTeamColour }}>{fixture?.home_team_name || 'Home'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-[24px] h-[6px] rounded-full" style={{ backgroundColor: awayTeamColour }} />
                    <span className="text-[10px] font-semibold" style={{ letterSpacing: '-0.5px', lineHeight: '18px', color: awayTeamColour }}>{fixture?.away_team_name || 'Away'}</span>
                  </div>
                </div>
              </div>
              </div>

              {/* ═══ SECTION 2: TEAM PERFORMANCE COMPARISON ═══ 1440x782, gap-15 */}
              <div className="flex flex-col gap-[15px]">
                <h2 className="text-[22px] font-semibold text-[#000000]" style={{ lineHeight: '130%' }}>Team Performance Comparison</h2>
                {/* Cards container — rounded-20, p-20, gap-20 */}
                <div className="rounded-[20px] bg-[#F5F5F5] p-[20px] flex flex-col gap-[20px]">
                {/* Row 1: 3 cards at 453.33px */}
                <div className="flex gap-[20px] items-start">
                  {(() => {
                    const raw = statsData?.raw_statistics || {} as any;
                    const atk = raw.attacking_threat || {};
                    const shots = raw.shots || {};
                    const duels = raw.duels_and_dribbling || {};
                    return [
                    {
                      id: 'xg',
                      title: 'Attacking Threat',
                      rows: [
                        { label: 'Goals', home: atk['goals']?.home, away: atk['goals']?.away },
                        { label: 'Assists', home: atk['assists']?.home, away: atk['assists']?.away },
                        { label: 'Goal Attempts', home: atk['goal-attempts']?.home, away: atk['goal-attempts']?.away },
                        { label: 'Attacks', home: atk['attacks']?.home, away: atk['attacks']?.away },
                        { label: 'Dangerous Attacks', home: atk['dangerous-attacks']?.home, away: atk['dangerous-attacks']?.away },
                        { label: 'Big Chances Created', home: atk['big-chances-created']?.home, away: atk['big-chances-created']?.away },
                        { label: 'Big Chances Missed', home: atk['big-chances-missed']?.home, away: atk['big-chances-missed']?.away },
                        { label: 'Penalties', home: atk['penalties']?.home, away: atk['penalties']?.away },
                      ],
                    },
                    {
                      id: 'shots',
                      title: 'Shots',
                      rows: [
                        { label: 'Total Shots', home: shots['shots-total']?.home, away: shots['shots-total']?.away },
                        { label: 'Shots off Target', home: shots['shots-off-target']?.home, away: shots['shots-off-target']?.away },
                        { label: 'Shots on Target', home: shots['shots-on-target']?.home, away: shots['shots-on-target']?.away },
                        { label: 'Blocked Shots', home: shots['shots-blocked']?.home, away: shots['shots-blocked']?.away },
                        { label: 'Hit woodwork', home: shots['hit-woodwork']?.home, away: shots['hit-woodwork']?.away },
                        { label: 'Shots Inside Box', home: shots['shots-insidebox']?.home, away: shots['shots-insidebox']?.away },
                        { label: 'Shots Outside Box', home: shots['shots-outsidebox']?.home, away: shots['shots-outsidebox']?.away },
                      ],
                    },
                    {
                      id: 'duels',
                      title: 'Duels',
                      rows: [
                        { label: 'Duels Won', home: duels['duels-won']?.home, away: duels['duels-won']?.away },
                        { label: 'Successful Headers', home: duels['successful-headers']?.home, away: duels['successful-headers']?.away },
                        { label: 'Dribble Attempts', home: duels['dribble-attempts']?.home, away: duels['dribble-attempts']?.away },
                        { label: 'Successful dribbles', home: duels['successful-dribbles']?.home, away: duels['successful-dribbles']?.away },
                        { label: 'Dribble Success %', home: duels['successful-dribbles-percentage']?.home, away: duels['successful-dribbles-percentage']?.away },
                      ],
                    },
                    // Defence and Passes are in Row 2 below
                  ]; })().map((card) => (
                    <StatComparisonCard
                      key={card.id}
                      title={card.title}
                      rows={card.rows}
                      isExpanded={expandedStatCards.has(card.id)}
                      onToggle={() => setExpandedStatCards(prev => prev.has(card.id) ? new Set() : new Set([card.id]))}
                      homeColour={homeTeamColour}
                      awayColour={awayTeamColour}
                    />
                  ))}
                </div>
                {/* Row 2: 2 cards at 690px */}
                <div className="flex gap-[20px] items-start">
                  {(() => {
                    const raw = statsData?.raw_statistics || {} as any;
                    const def = raw.defence_and_discipline || {};
                    const passes = raw.passes || {};
                    const row2Cards = [
                      { id: 'defence', title: 'Defence', rows: [
                        { label: 'Tackles', home: def['tackles']?.home, away: def['tackles']?.away },
                        { label: 'Interceptions', home: def['interceptions']?.home, away: def['interceptions']?.away },
                        { label: 'Keeper Saves', home: def['saves']?.home, away: def['saves']?.away },
                        { label: 'Ball Safe', home: def['ball-safe']?.home, away: def['ball-safe']?.away },
                        { label: 'Offsides', home: def['offsides']?.home, away: def['offsides']?.away },
                        { label: 'Yellow Cards', home: def['yellowcards']?.home, away: def['yellowcards']?.away },
                      ]},
                      { id: 'passes', title: 'Passes', rows: [
                        { label: 'Total Passes', home: passes['passes']?.home, away: passes['passes']?.away },
                        { label: 'Accurate Passes', home: passes['successful-passes']?.home, away: passes['successful-passes']?.away },
                        { label: 'Pass Accuracy %', home: passes['successful-passes-percentage']?.home, away: passes['successful-passes-percentage']?.away },
                        { label: 'Key Passes', home: passes['key-passes']?.home, away: passes['key-passes']?.away },
                        { label: 'Long Passes', home: passes['successful-long-passes']?.home, away: passes['successful-long-passes']?.away },
                        { label: 'Total Crosses', home: passes['total-crosses']?.home, away: passes['total-crosses']?.away },
                        { label: 'Free Kicks', home: passes['free-kicks']?.home, away: passes['free-kicks']?.away },
                        { label: 'Throw-ins', home: passes['throwins']?.home, away: passes['throwins']?.away },
                        { label: 'Goal Kicks', home: passes['goals-kicks']?.home, away: passes['goals-kicks']?.away },
                      ]},
                    ];
                    return row2Cards.map(card => (
                      <StatComparisonCard
                        key={card.id}
                        title={card.title}
                        rows={card.rows}
                        isExpanded={expandedStatCards.has(card.id)}
                        onToggle={() => setExpandedStatCards(prev => prev.has(card.id) ? new Set() : new Set([card.id]))}
                      />
                    ));
                  })()}
                </div>
                </div>
              </div>

              {/* ═══ SECTION 3: RECENT HEAD-TO-HEAD ═══ 1440x179, gap-15 */}
              {((statsData as any)?.head_to_head?.length > 0) && (() => {
                const h2hData = (statsData as any).head_to_head as any[];
                const h2hScrollRef = { current: null as HTMLDivElement | null };
                const scrollH2H = (dir: 'left' | 'right') => {
                  if (h2hScrollRef.current) {
                    h2hScrollRef.current.scrollBy({ left: dir === 'right' ? 302 : -302, behavior: 'smooth' });
                  }
                };
                return (
              <div className="flex flex-col gap-[15px]">
                <div className="flex items-center justify-between">
                  <h2 className="text-[22px] font-semibold text-[#000000]" style={{ lineHeight: '130%' }}>Recent Head-to-Head</h2>
                  <div className="flex items-center gap-2">
                    <button onClick={() => scrollH2H('left')} className="w-[36px] h-[36px] rounded-[8px] border border-[#e1e4eb] bg-white flex items-center justify-center hover:bg-[#f7f8fa] transition-colors">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
                    </button>
                    <button onClick={() => scrollH2H('right')} className="w-[36px] h-[36px] rounded-[8px] border border-[#e1e4eb] bg-white flex items-center justify-center hover:bg-[#f7f8fa] transition-colors">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
                    </button>
                  </div>
                </div>
                <div ref={(el) => { h2hScrollRef.current = el; }} className="flex gap-[20px] overflow-x-auto pb-2 scrollbar-hide scroll-smooth">
                  {h2hData.slice(0, 10).map((h2h: any, i: number) => {
                    const date = h2h.starting_at ? new Date(h2h.starting_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
                    const homeName = h2h.home_team_name?.split(' ').pop()?.slice(0, 3).toUpperCase() || 'HOM';
                    const awayName = h2h.away_team_name?.split(' ').pop()?.slice(0, 3).toUpperCase() || 'AWY';
                    return (
                      <div key={h2h.fixture_id || i} onClick={() => setH2hModalFixture(h2h)} className="flex-shrink-0 w-[282px] h-[135px] bg-white rounded-[14px] shadow-[0_1px_15px_0_rgba(0,0,0,0.10)] p-[15px] flex flex-col gap-[15px] cursor-pointer hover:shadow-[0_2px_20px_0_rgba(0,0,0,0.15)] transition-shadow">
                        <span className="text-[14px] font-medium text-[#000000] text-center" style={{ lineHeight: '20px' }}>Completed • {date}</span>
                        <div className="flex items-center justify-between h-[70px]">
                          <div className="flex flex-col items-center gap-1 w-[75px]">
                            {h2h.home_team_image_path ? (
                              <img src={h2h.home_team_image_path} alt="" className="w-8 h-8 object-contain" />
                            ) : <div className="w-8 h-8 rounded-full bg-[#f7f8fa]" />}
                            <span className="text-[12px] font-semibold text-[#0a0a0a]">{homeName}</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <span className="text-[20px] font-bold text-[#0a0a0a]">{h2h.home_score} - {h2h.away_score}</span>
                            <span className="text-[10px] text-[#7c8a9c]">{h2h.duration_minutes ? `${h2h.duration_minutes}'` : '90\''}</span>
                          </div>
                          <div className="flex flex-col items-center gap-1 w-[75px]">
                            {h2h.away_team_image_path ? (
                              <img src={h2h.away_team_image_path} alt="" className="w-8 h-8 object-contain" />
                            ) : <div className="w-8 h-8 rounded-full bg-[#f7f8fa]" />}
                            <span className="text-[12px] font-semibold text-[#0a0a0a]">{awayName}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
                );
              })()}

              {/* ── Player Stats ── */}
              {((statsData as any)?.players?.length > 0 || featuredPlayerIds.length > 0) && (
                <div>
                  <h2 className="text-[22px] font-semibold text-[#0a0a0a] mb-4 text-left" style={{ fontFamily: 'Montserrat, sans-serif' }}>Player stats</h2>
                  <div className="bg-white rounded-[20px] border border-[#e1e4eb] p-5">
                    <div className="flex flex-col gap-5">
                    {/* Tab bar — 735x56, #f7f8fa bg, rounded-10, p-6 */}
                    <div className="w-[735px] max-w-full h-[56px] rounded-[10px] bg-[#f7f8fa] p-[6px]">
                    <div className="flex h-[44px] items-center justify-center overflow-x-auto scrollbar-hide">
                      {(['summary','attacking','passing','defensive','discipline'] as const).map(tab => (
                        <button
                          key={tab}
                          onClick={() => setPlayerStatsTab(tab)}
                          className={`w-[144px] h-[44px] rounded-[8px] text-[16px] text-center transition-colors ${
                            playerStatsTab === tab
                              ? 'bg-[#0d1a67] text-white font-semibold'
                              : 'bg-[#f7f8fa] text-[#7c8a9c] font-normal hover:text-[#0d1a67]'
                          }`}
                          style={{ fontFamily: 'Montserrat, sans-serif', lineHeight: '24px', paddingTop: '10px', paddingBottom: '10px' }}
                        >
                          {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                      ))}
                    </div>
                    </div>
                    {/* Table header */}
                    <div className="flex items-center px-5 py-[14px] rounded-[10px] bg-[#f7f8fa]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      <div className="flex-1 text-[16px] font-medium text-[#0a0a0a]" style={{ lineHeight: '135%' }}>Players</div>
                      <div className="w-[900px] flex justify-end">
                        {playerStatsTab === 'summary' && <>
                          <div className="w-[150px] text-center text-[16px] font-medium text-[#0a0a0a]" style={{ lineHeight: '135%' }}>Rating</div>
                          <div className="w-[150px] text-center text-[16px] font-medium text-[#0a0a0a]" style={{ lineHeight: '135%' }}>Min</div>
                          <div className="w-[150px] text-center text-[16px] font-medium text-[#0a0a0a]" style={{ lineHeight: '135%' }}>Goal</div>
                          <div className="w-[150px] text-center text-[16px] font-medium text-[#0a0a0a]" style={{ lineHeight: '135%' }}>Assists</div>
                          <div className="w-[150px] text-center text-[16px] font-medium text-[#0a0a0a]" style={{ lineHeight: '135%' }}>xG</div>
                          <div className="w-[150px] text-center text-[16px] font-medium text-[#0a0a0a]" style={{ lineHeight: '135%' }}>xA</div>
                        </>}
                        {playerStatsTab === 'attacking' && <>
                          <div className="w-[150px] text-center text-[16px] font-medium text-[#0a0a0a]" style={{ lineHeight: '135%' }}>Goals</div>
                          <div className="w-[150px] text-center text-[16px] font-medium text-[#0a0a0a]" style={{ lineHeight: '135%' }}>Assists</div>
                          <div className="w-[150px] text-center text-[16px] font-medium text-[#0a0a0a]" style={{ lineHeight: '135%' }}>Shots</div>
                          <div className="w-[150px] text-center text-[16px] font-medium text-[#0a0a0a]" style={{ lineHeight: '135%' }}>On Target</div>
                          <div className="w-[150px] text-center text-[16px] font-medium text-[#0a0a0a]" style={{ lineHeight: '135%' }}>Key Pass</div>
                        </>}
                        {playerStatsTab === 'passing' && <>
                          <div className="w-[150px] text-center text-[16px] font-medium text-[#0a0a0a]" style={{ lineHeight: '135%' }}>Passes</div>
                          <div className="w-[150px] text-center text-[16px] font-medium text-[#0a0a0a]" style={{ lineHeight: '135%' }}>Accurate</div>
                          <div className="w-[150px] text-center text-[16px] font-medium text-[#0a0a0a]" style={{ lineHeight: '135%' }}>Acc %</div>
                          <div className="w-[150px] text-center text-[16px] font-medium text-[#0a0a0a]" style={{ lineHeight: '135%' }}>Key</div>
                        </>}
                        {playerStatsTab === 'defensive' && <>
                          <div className="w-[150px] text-center text-[16px] font-medium text-[#0a0a0a]" style={{ lineHeight: '135%' }}>Tackles</div>
                          <div className="w-[150px] text-center text-[16px] font-medium text-[#0a0a0a]" style={{ lineHeight: '135%' }}>Intercept</div>
                          <div className="w-[150px] text-center text-[16px] font-medium text-[#0a0a0a]" style={{ lineHeight: '135%' }}>Duels</div>
                          <div className="w-[150px] text-center text-[16px] font-medium text-[#0a0a0a]" style={{ lineHeight: '135%' }}>Won</div>
                          <div className="w-[150px] text-center text-[16px] font-medium text-[#0a0a0a]" style={{ lineHeight: '135%' }}>Clear</div>
                        </>}
                        {playerStatsTab === 'discipline' && <>
                          <div className="w-[150px] text-center text-[16px] font-medium text-[#0a0a0a]" style={{ lineHeight: '135%' }}>Fouls</div>
                          <div className="w-[150px] text-center text-[16px] font-medium text-[#0a0a0a]" style={{ lineHeight: '135%' }}>Yellow</div>
                          <div className="w-[150px] text-center text-[16px] font-medium text-[#0a0a0a]" style={{ lineHeight: '135%' }}>Red</div>
                          <div className="w-[150px] text-center text-[16px] font-medium text-[#0a0a0a]" style={{ lineHeight: '135%' }}>F.Drawn</div>
                        </>}
                      </div>
                    </div>
                    {/* Player rows - use inline player stats from fixture statistics endpoint */}
                    <div className="flex flex-col gap-5">
                    {((statsData as any)?.players || []).map((p: any, idx: number) => {
                      const ts = p.statistics?.top_stats || {};
                      const atk = p.statistics?.attack || {};
                      const pas = p.statistics?.passes || {};
                      const def = p.statistics?.defence || {};
                      const duel = p.statistics?.duels || {};
                      // Resolve player name/image from details lookup
                      const playerDetail = (statsPlayerDetails[idx]?.data?.data as any)?.player || (statsPlayerDetails[idx]?.data?.data as any);
                      const name = playerDetail?.display_name || playerDetail?.common_name || playerDetail?.player_name || `Player ${p.player_id}`;
                      const imgUrl = playerDetail?.image_path;
                      const jerseyNum = playerDetail?.current_team?.jersey_number;
                      const posObj = playerDetail?.position;
                      const position = typeof posObj === 'object' ? posObj?.name : (p.location === 'home' ? 'Home' : 'Away');
                      const rating = ts.rating;
                      const ratingNum = typeof rating === 'number' ? rating.toFixed(1) : null;
                      const ratingColor = ratingNum == null ? '#7c8a9c' : parseFloat(ratingNum) >= 7 ? '#27ae60' : parseFloat(ratingNum) >= 5 ? '#f39c12' : '#e74c3c';
                      const v = (val: any) => val != null ? val : '—';

                      return (
                        <div key={`${p.player_id}-${idx}`} className="flex items-center px-5 h-[50px]">
                          {/* Player info — avatar with jersey badge + name/position */}
                          <div className="flex-1 flex items-center gap-[10px]">
                            <div className="relative">
                              {imgUrl ? (
                                <img src={imgUrl} alt={name} className="w-[40px] h-[40px] rounded-full object-cover bg-[#f7f8fa]" />
                              ) : (
                                <div className="w-[40px] h-[40px] rounded-full bg-[#f7f8fa] flex items-center justify-center text-[12px] font-bold text-[#7c8a9c]">{name.slice(0,2).toUpperCase()}</div>
                              )}
                              {jerseyNum != null && (
                                <span className="absolute -bottom-1 -left-1 w-[18px] h-[18px] rounded-full bg-[#0d1a67] text-white text-[9px] font-bold flex items-center justify-center border-2 border-white">{jerseyNum}</span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-[14px] font-semibold text-[#0a0a0a] truncate" style={{ fontFamily: 'Montserrat, sans-serif' }}>{name}</p>
                              <p className="text-[12px] text-[#7c8a9c]" style={{ fontFamily: 'Montserrat, sans-serif' }}>{position}</p>
                            </div>
                          </div>
                          {/* Stats */}
                          <div className="w-[900px] flex justify-end">
                            {playerStatsTab === 'summary' && <>
                              <div className="w-[150px] text-center">
                                {ratingNum ? (
                                  <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-[6px] text-[14px] font-bold text-white" style={{ backgroundColor: ratingColor }}>{ratingNum}</span>
                                ) : <span className="text-[16px] font-medium text-[#7c8a9c]">—</span>}
                              </div>
                              <div className="w-[150px] text-center text-[16px] font-medium text-[#0a0a0a]" style={{ lineHeight: '135%' }}>{v(ts['minutes-played'])}</div>
                              <div className="w-[150px] text-center text-[16px] font-medium text-[#0a0a0a]" style={{ lineHeight: '135%' }}>{v(ts.goals ?? atk.goals)}</div>
                              <div className="w-[150px] text-center text-[16px] font-medium text-[#0a0a0a]" style={{ lineHeight: '135%' }}>{v(ts.assists ?? pas.assists)}</div>
                              <div className="w-[150px] text-center text-[16px] font-medium text-[#0a0a0a]" style={{ lineHeight: '135%' }}>{v(ts.xg ?? atk.xg)}</div>
                              <div className="w-[150px] text-center text-[16px] font-medium text-[#0a0a0a]" style={{ lineHeight: '135%' }}>{v(ts.xa ?? pas.xa)}</div>
                            </>}
                            {playerStatsTab === 'attacking' && <>
                              <div className="w-[150px] text-center text-[16px] font-medium text-[#0a0a0a]" style={{ lineHeight: '135%' }}>{v(atk.goals)}</div>
                              <div className="w-[150px] text-center text-[16px] font-medium text-[#0a0a0a]" style={{ lineHeight: '135%' }}>{v(pas.assists)}</div>
                              <div className="w-[150px] text-center text-[16px] font-medium text-[#0a0a0a]" style={{ lineHeight: '135%' }}>{v(atk['shots-total'])}</div>
                              <div className="w-[150px] text-center text-[16px] font-medium text-[#0a0a0a]" style={{ lineHeight: '135%' }}>{v(atk['shots-on-target'])}</div>
                              <div className="w-[150px] text-center text-[16px] font-medium text-[#0a0a0a]" style={{ lineHeight: '135%' }}>{v(pas['key-passes'])}</div>
                            </>}
                            {playerStatsTab === 'passing' && <>
                              <div className="w-[150px] text-center text-[16px] font-medium text-[#0a0a0a]" style={{ lineHeight: '135%' }}>{v(pas.touches)}</div>
                              <div className="w-[150px] text-center text-[16px] font-medium text-[#0a0a0a]" style={{ lineHeight: '135%' }}>{v(pas['accurate-passes'])}</div>
                              <div className="w-[150px] text-center text-[16px] font-medium text-[#0a0a0a]" style={{ lineHeight: '135%' }}>{pas['accurate-passes-percentage'] != null ? `${pas['accurate-passes-percentage']}%` : '—'}</div>
                              <div className="w-[150px] text-center text-[16px] font-medium text-[#0a0a0a]" style={{ lineHeight: '135%' }}>{v(pas['key-passes'])}</div>
                            </>}
                            {playerStatsTab === 'defensive' && <>
                              <div className="w-[150px] text-center text-[16px] font-medium text-[#0a0a0a]" style={{ lineHeight: '135%' }}>{v(def.tackles)}</div>
                              <div className="w-[150px] text-center text-[16px] font-medium text-[#0a0a0a]" style={{ lineHeight: '135%' }}>{v(def['blocked-shots'])}</div>
                              <div className="w-[150px] text-center text-[16px] font-medium text-[#0a0a0a]" style={{ lineHeight: '135%' }}>{v(duel['duels-lost'])}</div>
                              <div className="w-[150px] text-center text-[16px] font-medium text-[#0a0a0a]" style={{ lineHeight: '135%' }}>{v(duel['ground-duels-won'])}</div>
                              <div className="w-[150px] text-center text-[16px] font-medium text-[#0a0a0a]" style={{ lineHeight: '135%' }}>{v(def.clearances)}</div>
                            </>}
                            {playerStatsTab === 'discipline' && <>
                              <div className="w-[150px] text-center text-[16px] font-medium text-[#0a0a0a]" style={{ lineHeight: '135%' }}>{v(duel.fouls)}</div>
                              <div className="w-[150px] text-center text-[16px] font-medium text-[#0a0a0a]" style={{ lineHeight: '135%' }}>—</div>
                              <div className="w-[150px] text-center text-[16px] font-medium text-[#0a0a0a]" style={{ lineHeight: '135%' }}>—</div>
                              <div className="w-[150px] text-center text-[16px] font-medium text-[#0a0a0a]" style={{ lineHeight: '135%' }}>{v(duel['fouls-drawn'])}</div>
                            </>}
                          </div>
                        </div>
                      );
                    })}
                    </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          {/* H2H Match Detail Modal */}
          {h2hModalFixture && (
            <H2HMatchModal h2hMatch={h2hModalFixture} onClose={() => setH2hModalFixture(null)} />
          )}
          {activeTab === 'lineups' && (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-4 md:gap-6">
              {/* Mobile Football Pitch - Vertical layout (358x524) */}
              <div
                className="md:hidden relative rounded-2xl overflow-hidden"
                style={{
                  backgroundImage: 'url(/Match.svg)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  aspectRatio: '358/524'
                }}
              >
                {/* Home Team Players (Top Half - 3-4-3 formation) */}
                {/* Goalkeeper - top */}
                <PlayerPosition number={29} name="Meslier" position={{ x: 50, y: 7 }} isHome={true} />

                {/* Defenders - 3 across */}
                <PlayerPosition number={42} name="Meslier" position={{ x: 18, y: 18 }} isHome={true} />
                <PlayerPosition number={4} name="Meslier" position={{ x: 50, y: 18 }} isHome={true} />
                <PlayerPosition number={19} name="Meslier" position={{ x: 82, y: 18 }} isHome={true} />

                {/* Midfielders - 4 across */}
                <PlayerPosition number={16} name="Meslier" position={{ x: 12, y: 30 }} isHome={true} />
                <PlayerPosition number={15} name="Meslier" position={{ x: 37, y: 30 }} isHome={true} />
                <PlayerPosition number={8} name="Meslier" position={{ x: 63, y: 30 }} isHome={true} />
                <PlayerPosition number={10} name="Meslier" position={{ x: 88, y: 30 }} isHome={true} />

                {/* Forwards - 3 across */}
                <PlayerPosition number={17} name="Mesl..." position={{ x: 25, y: 41 }} isHome={true} hasYellowCard={true} />
                <PlayerPosition number={9} name="Meslier" position={{ x: 50, y: 41 }} isHome={true} isCaptain={true} />
                <PlayerPosition number={70} name="Meslier" position={{ x: 75, y: 41 }} isHome={true} />

                {/* Away Team Players (Bottom Half - 3-4-3 formation mirrored) */}
                {/* Forwards - 3 across */}
                <PlayerPosition number={32} name="Perri" position={{ x: 25, y: 59 }} isHome={false} />
                <PlayerPosition number={9} name="Aaron..." position={{ x: 50, y: 59 }} isHome={false} />
                <PlayerPosition number={10} name="Justin" position={{ x: 75, y: 59 }} isHome={false} />

                {/* Midfielders - 4 across */}
                <PlayerPosition number={3} name="Meslier" position={{ x: 12, y: 70 }} isHome={false} />
                <PlayerPosition number={6} name="Meslier" position={{ x: 37, y: 70 }} isHome={false} />
                <PlayerPosition number={20} name="Mesl..." position={{ x: 63, y: 70 }} isHome={false} hasRedCard={true} />
                <PlayerPosition number={15} name="Gudm..." position={{ x: 88, y: 70 }} isHome={false} />

                {/* Defenders - 3 across */}
                <PlayerPosition number={5} name="Meslier" position={{ x: 18, y: 82 }} isHome={false} />
                <PlayerPosition number={4} name="Meslier" position={{ x: 50, y: 82 }} isHome={false} />
                <PlayerPosition number={44} name="Meslier" position={{ x: 82, y: 82 }} isHome={false} />

                {/* Goalkeeper - bottom */}
                <PlayerPosition number={1} name="Meslier" position={{ x: 50, y: 93 }} isHome={false} />
              </div>

              {/* Desktop Football Pitch - Horizontal layout (833x595) */}
              <div
                className="hidden md:block relative rounded-2xl overflow-hidden"
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
                <PlayerPosition number={17} name="Mesl..." position={{ x: 32, y: 75 }} isHome={true} hasYellowCard={true} />

                {/* Forwards */}
                <PlayerPosition number={10} name="Meslier" position={{ x: 44, y: 20 }} isHome={true} isCaptain={true} />
                <PlayerPosition number={9} name="Meslier" position={{ x: 44, y: 50 }} isHome={true} />
                <PlayerPosition number={70} name="Meslier" position={{ x: 44, y: 80 }} isHome={true} />

                {/* Away Team Players (Right Side - 4-4-2 formation) */}
                {/* Goalkeeper */}
                <PlayerPosition number={1} name="Meslier" position={{ x: 92, y: 50 }} isHome={false} />

                {/* Defenders */}
                <PlayerPosition number={4} name="Meslier" position={{ x: 80, y: 20 }} isHome={false} />
                <PlayerPosition number={5} name="Meslier" position={{ x: 80, y: 40 }} isHome={false} />
                <PlayerPosition number={44} name="Meslier" position={{ x: 80, y: 60 }} isHome={false} />
                <PlayerPosition number={3} name="Meslier" position={{ x: 80, y: 80 }} isHome={false} />

                {/* Midfielders */}
                <PlayerPosition number={6} name="Meslier" position={{ x: 68, y: 15 }} isHome={false} />
                <PlayerPosition number={20} name="Mesl..." position={{ x: 68, y: 38 }} isHome={false} hasRedCard={true} />
                <PlayerPosition number={10} name="Justin" position={{ x: 56, y: 50 }} isHome={false} isCaptain={true} />
                <PlayerPosition number={32} name="Perri" position={{ x: 68, y: 62 }} isHome={false} />

                {/* Forwards */}
                <PlayerPosition number={15} name="Gudm..." position={{ x: 68, y: 85 }} isHome={false} />
                <PlayerPosition number={9} name="Aaron..." position={{ x: 56, y: 30 }} isHome={false} />
                <PlayerPosition number={37} name="Perri" position={{ x: 56, y: 70 }} isHome={false} />
              </div>

              {/* Substituted Players */}
              <div className="bg-gray-50 rounded-xl md:rounded-2xl p-4 md:p-6">
                <h3 className="text-base md:text-xl font-bold text-gray-900 mb-3 md:mb-4">Substituted Players</h3>

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

          {/* Weather Section - hidden for now */}
          <div className="mt-6 md:mt-8 hidden">
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
