import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { MatchBanner } from '@/components/MatchBanner';
import { useFixtures, useFixtureStatistics, useFixtureCommentary } from '@/hooks/useFixtures';
import { useFixturePredictions } from '@/hooks/usePredictions';
// Player stats now come from inline statsData.players (fixture statistics endpoint)
import { useAuth } from '@/contexts/AuthContext';

type TabType = 'predictions' | 'commentary' | 'stats' | 'lineups';

// Prediction card component with expand/collapse - Figma specs: 358x350 expanded
function PredictionCard({ prediction, index: _index, isLive: _isLive, isBlurred = false, isSelected = false, onClick, compact = false }: { prediction: any; index: number; isLive: boolean; isBlurred?: boolean; isSelected?: boolean; onClick?: () => void; compact?: boolean }) {
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
    if (type.includes('goal') || type.includes('scorer')) return 'Player Prediction';
    if (type.includes('booked') || type.includes('card')) return 'Cards Prediction';
    if (type.includes('shot')) return 'Shots Prediction';
    if (type.includes('corner')) return 'Match Prediction';
    if (type.includes('player')) return 'Player Prediction';
    return 'Match Prediction';
  };

  const title = prediction.title || prediction.prediction_display_name || 'Prediction';

  return (
    <div
      onClick={!isBlurred ? onClick : undefined}
      className={`rounded-[14px] md:rounded-[20px] p-3 md:p-5 flex flex-col gap-[10px] md:gap-5 bg-white w-full ${!compact ? 'md:w-[calc(33.333%-14px)] md:max-w-[440px]' : ''} ${isBlurred ? 'relative select-none pointer-events-none' : 'cursor-pointer'}`}
      style={{
        boxShadow: isSelected ? 'none' : '0 2px 15px rgba(0,0,0,0.1)',
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
            Pre-game Prediction {preGamePercentage}%
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
    <div className="py-3 md:py-5">
      <p className="text-center text-gray-900 font-semibold text-xs md:text-base mb-2 md:mb-3">{label}</p>
      <div className="flex items-center gap-2 md:gap-4">
        <span className={`w-8 md:w-12 text-left font-semibold text-xs md:text-base ${homeWinning ? 'text-green-500' : 'text-gray-900'}`}>
          {isPercentage ? `${homeValue}%` : homeValue}
        </span>
        <div className="flex-1 flex h-1.5 md:h-2 gap-0.5 md:gap-1">
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
        <span className={`w-8 md:w-12 text-right font-semibold text-xs md:text-base ${awayWinning ? 'text-green-500' : 'text-gray-900'}`}>
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
function AIAnalysisPanel({ prediction, fixture: _fixture, statsData: _statsData, onClose }: { prediction: any; fixture: any; statsData: any; onClose: () => void }) {
  const [formTab, setFormTab] = useState<'home' | 'away'>('home');

  // Real data from prediction.detail (from /fixtures/{id}/predictions endpoint)
  const detail = prediction.detail || null;
  const aiAnalysis: string = detail?.ai_analysis || '';
  const matchHistory: any[] = detail?.match_history || [];
  const modelConfidence = detail?.model_confidence || null;
  const seasonContext = detail?.season_context || null;
  const homeForm = seasonContext?.home_form || null;
  const awayForm = seasonContext?.away_form || null;
  const activeForm = formTab === 'home' ? homeForm : awayForm;

  const rawValue = prediction.value ?? prediction.prediction ?? prediction.pre_game_value ?? prediction.pre_game_prediction ?? 0;
  const percentage = rawValue > 1 ? Math.round(rawValue) : Math.round(rawValue * 100);
  const rawPreGame = prediction.pre_game_value ?? prediction.pre_game_prediction ?? 0;
  const preGamePercentage = rawPreGame > 1 ? Math.round(rawPreGame) : Math.round(rawPreGame * 100);
  const pctChange = prediction.pct_change_value ?? 0;

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

  const title = prediction.title || prediction.prediction_display_name || 'Prediction';

  // Dynamic stat columns derived from match_history data
  // Map known keys to short labels; fall back to uppercase key
  const labelMap: Record<string, string> = {
    rating: 'RTG', shots_on_target: 'SOT', 'shots on target': 'SOT',
    total_shots: 'SHOT', 'total shots': 'SHOT', shots_off_target: 'OFF',
    chances_created: 'CRE', goals: 'GLS', xG: 'xG',
    big_chances: 'BIG', tackles: 'TKL', fouls: 'FLS',
    cards: 'CRD', tackle_to_interception_ratio: 'T/I',
  };
  // Exclude non-stat keys from match_history entries
  const excludeKeys = new Set(['fixture_id', 'home_team_name', 'away_team_name', 'home_team_logo_url', 'away_team_logo_url', 'starting_at']);
  const statCols = matchHistory.length > 0
    ? Object.keys(matchHistory[0])
        .filter(k => !excludeKeys.has(k))
        .map(k => ({ key: k, label: labelMap[k] || k.slice(0, 4).toUpperCase() }))
    : [
        { key: 'rating', label: 'RTG' },
        { key: 'shots_on_target', label: 'SOT' },
        { key: 'total_shots', label: 'SHOT' },
        { key: 'shots_off_target', label: 'OFF' },
        { key: 'chances_created', label: 'CRE' },
        { key: 'goals', label: 'GLS' },
      ];

  return (
    <div
      className="bg-white rounded-t-[20px] md:rounded-[10px] p-4 md:p-6 flex flex-col gap-4 md:gap-4 w-full overflow-y-auto max-h-[90vh] md:max-h-none"
      style={{ fontFamily: 'Montserrat, sans-serif' }}
    >
      {/* Header: "Details" + close X */}
      <div className="flex items-center justify-between">
        <h3 className="text-[18px] font-semibold text-[#0a0a0a]">Details</h3>
        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#f7f8fa]">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M1 1L12 12M12 1L1 12" stroke="#0a0a0a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

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
            <span className="text-[14px] font-semibold text-[#7c8a9c] uppercase tracking-wide">AI Analysis</span>
            <svg id={`ai-chevron-${prediction.prediction_id || prediction._id || 'detail'}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7c8a9c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          <div id={`ai-analysis-${prediction.prediction_id || prediction._id || 'detail'}`} className="rounded-[20px] bg-white border border-[#e1e4eb] p-4">
            <p className="text-sm font-medium text-[#7c8a9c] leading-[1.6]">
              {aiAnalysis || 'No analysis available for this prediction.'}
            </p>
          </div>
        </div>

        {/* 2. Performance vs. Similar Teams */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h4 className="text-[16px] font-semibold text-[#0a0a0a]">Performance vs. Similar Teams</h4>
            <p className="text-xs font-medium text-[#7c8a9c]">Comparing {title} performance</p>
          </div>
          <div className="rounded-[8px] bg-white p-4 flex flex-col gap-4">
            {/* Bars container */}
            <div className="flex flex-col gap-2">
              {/* vs Top 6 row */}
              <div className="flex items-center gap-4 h-6">
                <span className="text-[12px] font-semibold text-[#7c8a9c] flex-1" style={{ letterSpacing: '-0.5px' }}>vs Top 6</span>
                <span className="text-[14px] font-semibold text-black whitespace-nowrap" style={{ letterSpacing: '-0.5px' }}>{preGamePercentage > 0 ? `${(preGamePercentage / 100 * 5).toFixed(1)} Avg SOT` : '-'}</span>
                <div className="w-px h-4 bg-[#e1e4eb]" />
                <div className="relative w-[204px] h-[6px] rounded-full bg-[#ebebeb]">
                  <div className="absolute top-0 left-0 h-[6px] rounded-full bg-[#858585] transition-all" style={{ width: `${Math.min(preGamePercentage, 100)}%` }} />
                </div>
              </div>
              {/* vs Bottom 6 row */}
              <div className="flex items-center gap-4 h-6">
                <span className="text-[12px] font-semibold text-[#7c8a9c] flex-1" style={{ letterSpacing: '-0.5px' }}>vs Bottom 6</span>
                <span className="text-[14px] font-semibold text-black whitespace-nowrap" style={{ letterSpacing: '-0.5px' }}>{percentage > 0 ? `${(percentage / 100 * 5).toFixed(1)} Avg SOT` : '-'}</span>
                <div className="w-px h-4 bg-[#e1e4eb]" />
                <div className="relative w-[204px] h-[6px] rounded-full bg-[#ebebeb]">
                  <div className="absolute top-0 left-0 h-[6px] rounded-full bg-[#27ae60] transition-all" style={{ width: `${Math.min(percentage, 100)}%` }} />
                </div>
              </div>
            </div>
            {/* Insight badge */}
            {pctChange !== 0 && (
              <div className="rounded-[8px] px-2 py-1 flex items-center justify-center gap-2" style={{ backgroundColor: '#ddefe7' }}>
                <img src="/trend.svg" width="14" height="14" alt="" style={{
                  filter: 'brightness(0) saturate(100%) invert(52%) sepia(79%) saturate(409%) hue-rotate(95deg) brightness(93%) contrast(91%)',
                  transform: pctChange > 0 ? 'none' : 'scaleY(-1)',
                }} />
                <span className="text-[12px] font-semibold" style={{ color: '#27ae60', letterSpacing: '-0.5px' }}>
                  {Math.abs(pctChange).toFixed(0)}% Performance {pctChange > 0 ? 'Increase' : 'Decrease'} vs Weak Teams
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-[#e1e4eb]" />

        {/* 3. Detailed Match Stats */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h4 className="text-[16px] font-semibold text-[#0a0a0a]" style={{ letterSpacing: '-1%' }}>Detailed Match Stats</h4>
            <p className="text-[12px] font-semibold text-[#7c8a9c]" style={{ letterSpacing: '-0.5px' }}>Last 5 matches</p>
          </div>
          <div className="flex flex-col gap-4">
            {/* Table header row */}
            <div className="flex items-center px-2 h-[30px] bg-white rounded-[8px]">
              <span className="text-[12px] font-semibold text-[#7c8a9c] flex-1" style={{ letterSpacing: '-0.5px' }}>MATCH</span>
              {statCols.map((col, idx) => (
                <div key={col.key} className="flex items-center">
                  {idx > 0 && <div className="w-px h-4 bg-[#e1e4eb] mx-1.5" />}
                  <span className="w-10 h-[30px] rounded-[4px] flex items-center justify-center text-[12px] font-semibold text-[#7c8a9c]" style={{ letterSpacing: '-0.5px' }}>{col.label}</span>
                </div>
              ))}
            </div>
            {/* Data rows */}
            {matchHistory.length > 0 ? matchHistory.slice(0, 5).map((match: any, i: number) => {
              const date = match.starting_at ? new Date(match.starting_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : '';
              const oppName = match.away_team_name || match.home_team_name || '';
              const shortOpp = oppName.length > 12 ? oppName.slice(0, 10) + '…' : oppName;
              const oppLogo = match.away_team_logo_url || match.home_team_logo_url || '';
              // Determine result badge
              const goals = match.goals ?? 0;
              const result = goals > 0 ? 'W' : goals === 0 ? 'D' : 'L';
              const resultColor = result === 'W' ? '#27ae60' : result === 'L' ? '#e74c3c' : '#f39c12';
              // RTG color based on rating value
              const rtg = match.rating;
              const rtgColor = rtg != null && rtg >= 7.5 ? '#00ca68' : rtg != null && rtg >= 6.5 ? '#f39c12' : '#e74c3c';
              return (
                <div key={i} className="flex items-center px-2 h-[38px]">
                  {/* Match info */}
                  <div className="flex-1 flex items-center gap-2 min-w-0">
                    {oppLogo ? (
                      <img src={oppLogo} alt="" className="w-5 h-5 rounded-full shrink-0" />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-[#e1e4eb] shrink-0" />
                    )}
                    <div className="flex flex-col min-w-0">
                      <span className="text-[12px] font-semibold text-[#0a0a0a] leading-tight truncate" style={{ letterSpacing: '-0.5px' }}>Vs {shortOpp}</span>
                      <span className="text-[10px] font-medium text-[#27ae60]" style={{ letterSpacing: '-0.5px' }}>{date}</span>
                    </div>
                    {/* Result badge */}
                    <span className="ml-1 w-[18px] h-[18px] rounded-[4px] flex items-center justify-center text-[10px] font-bold text-white shrink-0" style={{ backgroundColor: resultColor }}>
                      {result}
                    </span>
                  </div>
                  {/* Stat columns */}
                  {statCols.map((col, colIdx) => {
                    const val = match[col.key];
                    return (
                      <div key={col.key} className="flex items-center">
                        {colIdx > 0 && <div className="w-px h-4 bg-[#e1e4eb] mx-1.5" />}
                        {/* RTG column (first) gets colored pill */}
                        {colIdx === 0 ? (
                          <span className="w-10 h-[30px] rounded-[4px] flex items-center justify-center text-[12px] font-bold text-white" style={{ backgroundColor: val != null ? rtgColor : '#f7f8fa', color: val != null ? '#fff' : '#7c8a9c' }}>
                            {val != null ? (typeof val === 'number' ? val.toFixed(1) : val) : '-'}
                          </span>
                        ) : (
                          <span className="w-10 h-[30px] rounded-[4px] bg-[#f7f8fa] flex items-center justify-center text-[12px] font-medium text-[#3a3f47]">
                            {val != null ? val : '-'}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            }) : (
              <div className="px-4 py-6 text-[12px] text-[#7c8a9c] text-center">No match history available</div>
            )}
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
        {seasonContext && (
          <div className="flex flex-col gap-4">
            {/* Header: title + tab switcher */}
            <div className="flex items-center justify-between h-[56px]">
              <h4 className="text-[16px] font-semibold text-[#0a0a0a]" style={{ letterSpacing: '-1%', lineHeight: '24px' }}>Season Context</h4>
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
            </div>
            {/* Stats card - dynamic fields from activeForm */}
            {activeForm && (() => {
              // Map known keys to display labels
              const formLabelMap: Record<string, string> = {
                total_matches: 'Matches', goals: 'Goals', xG: 'xG',
                conversions: 'Conv. Rate', average_shots_on_target: 'Avg SOT',
                average_rating: 'Avg Rating', shots_per_90: 'Shots/90',
                cards: 'Cards', fouls_per_90: 'Fouls/90', tackles_per_90: 'Tackles/90',
              };
              const formEntries = Object.entries(activeForm)
                .filter(([, v]) => v != null && typeof v === 'number')
                .map(([k, v]) => ({
                  key: k,
                  label: formLabelMap[k] || k.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
                  value: v as number,
                }));
              // Color: first stat = navy, middle = green, rest = navy
              const colors = formEntries.map((_, i) => i === 1 ? '#27ae60' : '#0d1a67');
              return (
                <div className="rounded-[14px] bg-white border border-[#e1e4eb] px-[14px] pt-[14px] pb-[20px] flex items-center justify-center">
                  <div className="flex items-center gap-[60px]">
                    {formEntries.map((entry, i) => (
                      <div key={entry.key} className="flex items-center gap-[60px]">
                        {i > 0 && (
                          <div className="h-[36px] w-px" style={{ background: 'linear-gradient(to bottom, transparent, #0d1a67, transparent)' }} />
                        )}
                        <div className="flex flex-col items-center">
                          <span className="text-[40px] font-bold" style={{ color: colors[i], lineHeight: '135%' }}>
                            {typeof entry.value === 'number' ? (Number.isInteger(entry.value) ? entry.value : entry.value.toFixed(1)) : entry.value}
                          </span>
                          <span className="text-[16px] font-medium text-[#7c8a9c]" style={{ lineHeight: '135%', marginTop: '-5px' }}>{entry.label}</span>
                        </div>
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
  const [commentaryFilter, setCommentaryFilter] = useState<'all' | 'goals' | 'cards' | 'important'>('all');
  const [selectedPrediction, setSelectedPrediction] = useState<any>(null);
  const [playerStatsTab, setPlayerStatsTab] = useState<'summary' | 'attacking' | 'passing' | 'defensive' | 'discipline'>('summary');
  const [expandedStatCards, setExpandedStatCards] = useState<Set<string>>(new Set());

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
    { fixture_id: fixtureId ? parseInt(fixtureId, 10) : undefined, limit: 50, sort_by: 'pct_change', sort_order: 'desc' },
    { enabled: !!fixtureId }
  );
  const fullPredictions: any[] = (fullPredictionsResponse?.data as any)?.predictions || (fullPredictionsResponse?.data as any) || [];

  // Use full predictions as primary source, fall back to inline predictions
  const predictions = fullPredictions.length > 0 ? fullPredictions : inlinePredictions;

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

  // Fetch fixture statistics
  const { data: statsResponse, isLoading: isLoadingStats } = useFixtureStatistics(fixtureId || '');
  // Backend returns { statistics: { basic: {...}, advanced: {...} } }
  const statsData = statsResponse?.data?.statistics;

  // Fetch fixture commentary
  const { data: commentaryResponse, isLoading: isLoadingCommentary } = useFixtureCommentary(fixtureId || '');
  // Backend returns { commentaries: [...], fixture_id, total_commentaries, etc. }
  const commentaryItems = commentaryResponse?.data?.commentaries;

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
            {activeTab === 'commentary' && (
              <div className="relative hidden md:block shrink-0">
                <select
                  value={commentaryFilter}
                  onChange={(e) => setCommentaryFilter(e.target.value as 'all' | 'goals' | 'cards' | 'important')}
                  className="appearance-none bg-white border border-gray-200 rounded-lg px-3 py-1.5 pr-8 text-sm font-medium text-gray-600 cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#0d1a67]/20"
                >
                  <option value="all">All Events</option>
                  <option value="goals">Goals</option>
                  <option value="cards">Cards</option>
                  <option value="important">Important</option>
                </select>
                <svg
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            )}
          </div>

          {/* Predictions Tab */}
          {activeTab === 'predictions' && (
            <div className="space-y-4">
              {/* Desktop: Header row: count + live badge */}
              <div className="hidden md:flex items-center justify-between">
                <h2
                  className="text-[22px] font-semibold text-[#0a0a0a] leading-[130%]"
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                >
                  {predictions.length} Predictions Available
                </h2>
                {fixture?.is_live && (
                  <div
                    className="flex items-center gap-[5px] pl-2 pr-4 py-3 rounded-lg border border-[#d9d9d9]"
                    style={{
                      backgroundColor: '#27ae60',
                      boxShadow: '0 7px 4px -3px rgba(0,0,0,0.05)',
                      fontFamily: 'Montserrat, sans-serif',
                    }}
                  >
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    <span className="text-white text-sm font-medium">Predictions Updating in Real-Time</span>
                  </div>
                )}
              </div>

              {/* Desktop: Sub-filter bar: category pills + Filters button */}
              <div className="hidden md:flex items-center justify-between gap-[10px]">
                <div className="flex items-center gap-[10px]">
                  {[
                    { id: 'all', label: 'All Predictions' },
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
                    <span className="text-white text-[13px] font-medium leading-[150%]">Predictions updating in real-time</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span
                    className="text-sm font-semibold text-[#0a0a0a] leading-[150%]"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    {predictions.length} Predictions Available
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
                      <div key={i} className="bg-white rounded-[14px] p-3 animate-pulse" style={{ boxShadow: '0 2px 15px rgba(0,0,0,0.1)' }}>
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
                    <div className="flex flex-col gap-[20px]">
                      {filteredPredictions.slice(0, 9).map((prediction: any, index: number) => (
                        <PredictionCard
                          key={prediction.prediction_id || index}
                          prediction={prediction}
                          index={index}
                          isLive={fixture?.minutes_elapsed !== null && fixture?.minutes_elapsed !== undefined}
                          isBlurred={!isAuthenticated && index >= 6}
                          isSelected={selectedPrediction === prediction}
                          onClick={() => setSelectedPrediction(selectedPrediction === prediction ? null : prediction)}
                        />
                      ))}
                    </div>
                    {/* Mobile AI Analysis Panel */}
                    {selectedPrediction && (
                      <AIAnalysisPanel
                        prediction={selectedPredictionWithDetail || selectedPrediction}
                        fixture={fixture}
                        statsData={statsData}
                        onClose={() => setSelectedPrediction(null)}
                      />
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
                        See All Predictions
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
              <div className="hidden md:flex gap-5 items-start">
                <div className={`${selectedPrediction ? 'w-[400px] flex-shrink-0' : 'flex-1'} transition-all duration-300`}>
                {isLoadingFixtures ? (
                  <div className={`${selectedPrediction ? 'flex flex-col' : 'flex flex-row flex-wrap'} items-start gap-[20px]`}>
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className={`bg-white rounded-[20px] p-5 animate-pulse ${selectedPrediction ? 'w-full' : 'w-[calc(33.333%-14px)] max-w-[440px]'}`} style={{ boxShadow: '0 2px 15px rgba(0,0,0,0.1)' }}>
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
                    <div className={`${selectedPrediction ? 'flex flex-col' : 'flex flex-row flex-wrap'} items-start gap-[20px] min-h-[300px]`}>
                      {filteredPredictions.slice(0, 9).map((prediction: any, index: number) => (
                        <PredictionCard
                          key={prediction.prediction_id || index}
                          prediction={prediction}
                          index={index}
                          isLive={fixture?.minutes_elapsed !== null && fixture?.minutes_elapsed !== undefined}
                          isBlurred={!isAuthenticated && index >= 6}
                          isSelected={selectedPrediction === prediction}
                          onClick={() => setSelectedPrediction(selectedPrediction === prediction ? null : prediction)}
                          compact={!!selectedPrediction}
                        />
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
                        See All Predictions
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
                  <div className="flex-1 sticky top-4 self-start min-w-0">
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
            <div className="bg-white rounded-[14px] md:rounded-xl border border-[#e1e4eb] shadow-sm p-4 md:p-5">
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
              ) : (
                <>
                  {(!commentaryItems || commentaryItems.length === 0) && (
                    <div className="mb-4 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="text-amber-700 text-xs md:text-sm text-center">
                        Using placeholder data - live commentary will appear during the match
                      </p>
                    </div>
                  )}
                  {(commentaryItems && commentaryItems.length > 0 ? commentaryItems.map((item: any) => ({
                    minute: item.extra_minute ? `${item.minute}+${item.extra_minute}'` : `${item.minute}'`,
                    type: item.type || 'general',
                    comment: item.comment,
                    score: item.score,
                    isGoal: item.is_goal || item.type === 'goal',
                  })) : mockCommentary)
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
                  {/* Empty state for filtered results */}
                  {commentaryFilter !== 'all' && (commentaryItems && commentaryItems.length > 0 ? commentaryItems.map((item: any) => ({
                    minute: item.extra_minute ? `${item.minute}+${item.extra_minute}'` : `${item.minute}'`,
                    type: item.type || 'general',
                    comment: item.comment,
                    score: item.score,
                    isGoal: item.is_goal || item.type === 'goal',
                  })) : mockCommentary)
                    .filter((item: any) => {
                      if (commentaryFilter === 'goals') return item.type === 'goal' || item.isGoal;
                      if (commentaryFilter === 'cards') return item.type === 'yellow_card' || item.type === 'red_card';
                      if (commentaryFilter === 'important') {
                        return item.type === 'goal' || item.isGoal ||
                               item.type === 'yellow_card' || item.type === 'red_card' ||
                               item.type === 'substitution';
                      }
                      return true;
                    }).length === 0 && (
                    <div className="py-8 text-center text-gray-500 text-sm">
                      No {commentaryFilter === 'goals' ? 'goals' : commentaryFilter === 'cards' ? 'cards' : 'important events'} in this match yet
                    </div>
                  )}
                </>
              )}
            </div>
          )}
          {activeTab === 'stats' && (
            <div className="space-y-6">
              {/* ── Match Info Card + Team Analysis ── */}
              <div className="flex gap-[30px]">
              <div className="flex-1 bg-white rounded-[10px] shadow-[0_0_20px_0_rgba(0,0,0,0.10)] p-4 md:p-6">
                {/* Team header */}
                <div className="flex items-center justify-between px-5 mb-4">
                  <div className="flex items-center gap-3">
                    {fixture?.home_team_image_path
                      ? <img src={fixture.home_team_image_path} alt={fixture.home_team_name} className="w-8 h-8 object-contain" />
                      : <div className="w-8 h-8 bg-[#f7f8fa] rounded-full" />}
                    <span className="font-semibold text-[#0a0a0a] text-sm">
                      {fixture?.home_team_short_code || fixture?.home_team_name?.slice(0, 3).toUpperCase() || 'HOM'}
                    </span>
                  </div>
                  <span className="text-[#7c8a9c] text-sm font-semibold">VS</span>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-[#0a0a0a] text-sm">
                      {fixture?.away_team_short_code || fixture?.away_team_name?.slice(0, 3).toUpperCase() || 'AWY'}
                    </span>
                    {fixture?.away_team_image_path
                      ? <img src={fixture.away_team_image_path} alt={fixture.away_team_name} className="w-8 h-8 object-contain rounded-full" />
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
                  <div className="bg-[#f7f8fa] rounded-[15px] overflow-hidden">
                    {(() => {
                      const raw = statsData?.raw_statistics?.top_level_summary || {};
                      return [
                        { label: 'Ball possession', home: raw['ball-possession']?.home ?? null, away: raw['ball-possession']?.away ?? null, isPct: true },
                        { label: 'Total shots', home: raw['shots-total']?.home ?? null, away: raw['shots-total']?.away ?? null },
                        { label: 'Corner kicks', home: raw['corners']?.home ?? null, away: raw['corners']?.away ?? null },
                        { label: 'Fouls', home: (statsData?.raw_statistics?.defence_and_discipline as any)?.['fouls']?.home ?? raw['fouls']?.home ?? null, away: (statsData?.raw_statistics?.defence_and_discipline as any)?.['fouls']?.away ?? raw['fouls']?.away ?? null },
                        { label: 'Passes completed', home: raw['successful-passes']?.home ?? null, away: raw['successful-passes']?.away ?? null },
                      ];
                    })().map((s, i, arr) => (
                      <div key={s.label}>
                        <div className="px-4">
                          <StatBar label={s.label} homeValue={s.home ?? 0} awayValue={s.away ?? 0} isPercentage={s.isPct} />
                        </div>
                        {i < arr.length - 1 && <div className="h-px bg-[#e1e4eb] mx-4" />}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Team Analysis Panel (right side) */}
              <div className="hidden xl:flex w-[460px] shrink-0 bg-white rounded-[10px] shadow-[0_0_20px_0_rgba(0,0,0,0.10)] p-6 flex-col gap-[30px]">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-[16px] font-semibold text-[#0a0a0a]" style={{ fontFamily: 'Montserrat, sans-serif' }}>Team Analysis</h3>
                    <p className="text-[12px] font-semibold text-[#7c8a9c]" style={{ letterSpacing: '-0.5px' }}>Based on performance in the last match</p>
                  </div>
                  <button className="text-[14px] font-medium text-[#0a0a0a] flex items-center gap-1 hover:opacity-70">
                    See Previous <span className="text-lg">›</span>
                  </button>
                </div>
                {/* Radar chart placeholder */}
                <div className="flex-1 flex items-center justify-center">
                  <div className="relative w-[280px] h-[280px]">
                    {/* Pentagon background */}
                    <svg viewBox="0 0 280 280" className="w-full h-full">
                      {/* Grid lines */}
                      {[0.3, 0.5, 0.7, 0.9].map((scale, i) => {
                        const cx = 140, cy = 140, r = 120 * scale;
                        const points = [0, 1, 2, 3, 4].map(j => {
                          const angle = (Math.PI * 2 * j / 5) - Math.PI / 2;
                          return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
                        }).join(' ');
                        return <polygon key={i} points={points} fill="none" stroke="#e1e4eb" strokeWidth="1" />;
                      })}
                      {/* Axis lines */}
                      {[0, 1, 2, 3, 4].map(j => {
                        const angle = (Math.PI * 2 * j / 5) - Math.PI / 2;
                        return <line key={j} x1="140" y1="140" x2={140 + 108 * Math.cos(angle)} y2={140 + 108 * Math.sin(angle)} stroke="#e1e4eb" strokeWidth="1" />;
                      })}
                    </svg>
                    {/* Labels */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 text-center">
                      <span className="text-[11px] font-semibold text-[#0d1a67]">ATT</span>
                    </div>
                    <div className="absolute top-1/3 right-0 translate-x-2 text-center">
                      <span className="text-[11px] font-semibold text-[#0d1a67]">TAC</span>
                    </div>
                    <div className="absolute bottom-[10%] right-[10%] text-center">
                      <span className="text-[11px] font-semibold text-[#0d1a67]">TAC</span>
                    </div>
                    <div className="absolute bottom-[10%] left-[10%] text-center">
                      <span className="text-[11px] font-semibold text-[#0d1a67]">DEF</span>
                    </div>
                    <div className="absolute top-1/3 left-0 -translate-x-2 text-center">
                      <span className="text-[11px] font-semibold text-[#0d1a67]">CRE</span>
                    </div>
                  </div>
                </div>
                {/* Legend */}
                <div className="flex items-center justify-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-[2px] bg-[#0d1a67]" />
                    <span className="text-[12px] text-[#7c8a9c]">{fixture?.home_team_name || 'Home'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-[2px] bg-[#27ae60]" />
                    <span className="text-[12px] text-[#7c8a9c]">{fixture?.away_team_name || 'Away'}</span>
                  </div>
                </div>
              </div>
              </div>

              {/* ── Team Performance Comparison ── */}
              <div className="rounded-[20px] bg-[#f7f8fa] p-5">
                <h2 className="text-[22px] font-semibold text-[#0a0a0a] mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>Team Performance Comparison</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {(() => {
                    const raw = statsData?.raw_statistics || {} as any;
                    const atk = raw.attacking_threat || {};
                    const shots = raw.shots || {};
                    const duels = raw.duels_and_dribbling || {};
                    const def = raw.defence_and_discipline || {};
                    const passes = raw.passes || {};
                    return [
                    {
                      id: 'xg',
                      title: 'Expected Goals (xG)',
                      rows: [
                        { label: 'Expected Goals (xG)', home: atk['expected-goals']?.home, away: atk['expected-goals']?.away },
                        { label: 'xG Open Play', home: atk['xg-open-play']?.home, away: atk['xg-open-play']?.away },
                        { label: 'xG Set Play', home: atk['xg-set-play']?.home, away: atk['xg-set-play']?.away },
                        { label: 'Non-penalty xG', home: atk['non-penalty-xg']?.home, away: atk['non-penalty-xg']?.away },
                        { label: 'xG on target (xGOT)', home: atk['xgot']?.home, away: atk['xgot']?.away },
                        { label: 'Big Chances Created', home: atk['big-chances-created']?.home, away: atk['big-chances-created']?.away },
                        { label: 'Big Chances Missed', home: atk['big-chances-missed']?.home, away: atk['big-chances-missed']?.away },
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
                    {
                      id: 'defence',
                      title: 'Defence',
                      rows: [
                        { label: 'Tackles', home: def['tackles']?.home, away: def['tackles']?.away },
                        { label: 'Interceptions', home: def['interceptions']?.home, away: def['interceptions']?.away },
                        { label: 'Keeper Saves', home: def['saves']?.home, away: def['saves']?.away },
                        { label: 'Offsides', home: def['offsides']?.home, away: def['offsides']?.away },
                        { label: 'Yellow Cards', home: def['yellowcards']?.home, away: def['yellowcards']?.away },
                      ],
                    },
                    {
                      id: 'passes',
                      title: 'Passes',
                      rows: [
                        { label: 'Total Passes', home: passes['passes']?.home, away: passes['passes']?.away },
                        { label: 'Accurate Passes', home: passes['successful-passes']?.home, away: passes['successful-passes']?.away },
                        { label: 'Pass Accuracy %', home: passes['successful-passes-percentage']?.home, away: passes['successful-passes-percentage']?.away },
                        { label: 'Key Passes', home: passes['key-passes']?.home, away: passes['key-passes']?.away },
                        { label: 'Long Passes', home: passes['successful-long-passes']?.home, away: passes['successful-long-passes']?.away },
                        { label: 'Total Crosses', home: passes['total-crosses']?.home, away: passes['total-crosses']?.away },
                        { label: 'Free Kicks', home: passes['free-kicks']?.home, away: passes['free-kicks']?.away },
                      ],
                    },
                  ]; })().map((card) => {
                    const isExpanded = expandedStatCards.has(card.id);
                    const visibleRows = isExpanded ? card.rows : card.rows.slice(0, 5);
                    const hasData = card.rows.some(r => r.home != null || r.away != null);
                    return (
                      <div key={card.id} className={`bg-white rounded-[14px] shadow-[0_1px_15px_0_rgba(0,0,0,0.10)] p-4 ${card.id === 'defence' || card.id === 'passes' ? 'xl:col-span-1 md:col-span-1' : ''}`}>
                        <h3 className="text-[18px] font-semibold text-[#0a0a0a] mb-3" style={{ fontFamily: 'Montserrat, sans-serif' }}>{card.title}</h3>
                        {!hasData && isLoadingStats ? (
                          <div className="space-y-3 animate-pulse">
                            {[1,2,3,4,5].map(i => (
                              <div key={i} className="flex items-center gap-3">
                                <div className="w-8 h-3 bg-gray-100 rounded" />
                                <div className="flex-1 h-3 bg-gray-100 rounded" />
                                <div className="w-8 h-3 bg-gray-100 rounded" />
                              </div>
                            ))}
                          </div>
                        ) : (
                          <>
                            {visibleRows.map((row, i) => {
                              const h = row.home ?? 0;
                              const a = row.away ?? 0;
                              const total = h + a;
                              const homePct = total > 0 ? (h / total) * 100 : 50;
                              const awayPct = total > 0 ? (a / total) * 100 : 50;
                              const homeWin = h > a;
                              const awayWin = a > h;
                              return (
                                <div key={i} className={i > 0 ? 'mt-3 pt-3 border-t border-[#e1e4eb]' : ''}>
                                  <div className="flex items-center justify-between mb-1">
                                    <span className={`text-sm font-semibold ${homeWin ? 'text-[#0d1a67]' : 'text-[#0a0a0a]'}`}>{row.home ?? '—'}</span>
                                    <span className="text-xs text-[#7c8a9c] font-medium">{row.label}</span>
                                    <span className={`text-sm font-semibold ${awayWin ? 'text-[#0d1a67]' : 'text-[#0a0a0a]'}`}>{row.away ?? '—'}</span>
                                  </div>
                                  <div className="flex h-1.5 gap-0.5">
                                    <div className="flex-1 bg-[#e1e4eb] rounded-full overflow-hidden flex justify-end">
                                      <div className="h-full rounded-full bg-[#0d1a67] transition-all" style={{ width: `${homePct}%` }} />
                                    </div>
                                    <div className="flex-1 bg-[#e1e4eb] rounded-full overflow-hidden flex justify-start">
                                      <div className="h-full rounded-full bg-[#ccd3fc] transition-all" style={{ width: `${awayPct}%` }} />
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                            <p className="text-[12px] text-[#7c8a9c] text-center mt-3" style={{ fontFamily: 'Montserrat, sans-serif' }}>5 out of {card.rows.length}</p>
                            <button
                              onClick={() => setExpandedStatCards(prev => {
                                const next = new Set(prev);
                                if (next.has(card.id)) next.delete(card.id); else next.add(card.id);
                                return next;
                              })}
                              className="mt-3 w-full h-10 bg-[#0d1a67] text-white text-[14px] font-semibold rounded-[8px] hover:bg-[#0d1a67]/90 transition-colors shadow-[0_7px_4px_-3px_rgba(0,0,0,0.05)]"
                              style={{ fontFamily: 'Montserrat, sans-serif' }}
                            >
                              {isExpanded ? 'Show Less' : 'See More'}
                            </button>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ── Recent Head-to-Head ── */}
              <div>
                <h2 className="text-[22px] font-semibold text-[#0a0a0a] mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>Recent Head-to-Head</h2>
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                  {/* Placeholder cards - will be populated when H2H API is available */}
                  {[1, 2].map((i) => (
                    <div key={i} className="flex-shrink-0 w-[282px] bg-white rounded-[14px] border border-[#e1e4eb] p-[15px] flex flex-col gap-[15px]">
                      <span className="text-[12px] font-semibold text-[#27ae60]" style={{ letterSpacing: '-0.5px' }}>Completed • —</span>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-[#f7f8fa]" />
                          <span className="text-[14px] font-semibold text-[#0a0a0a]">—</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="text-[18px] font-bold text-[#0a0a0a]">— - —</span>
                          <span className="text-[10px] text-[#7c8a9c]">—′</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[14px] font-semibold text-[#0a0a0a]">—</span>
                          <div className="w-8 h-8 rounded-full bg-[#f7f8fa]" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-[12px] text-[#7c8a9c] mt-2">Head-to-head data will appear when available from the API.</p>
              </div>

              {/* ── Player Stats ── */}
              {((statsData as any)?.players?.length > 0 || featuredPlayerIds.length > 0) && (
                <div>
                  <h2 className="text-[22px] font-semibold text-[#0a0a0a] mb-4 text-center" style={{ fontFamily: 'Montserrat, sans-serif' }}>Player stats</h2>
                  <div className="bg-white rounded-[20px] border border-[#e1e4eb] p-5">
                    <div className="flex flex-col gap-5">
                    {/* Tab bar - 735px max width */}
                    <div className="w-[735px] max-w-full rounded-[10px] bg-[#f7f8fa] p-[6px]">
                    <div className="flex h-[44px] items-center justify-center gap-[6px] overflow-x-auto scrollbar-hide">
                      {(['summary','attacking','passing','defensive','discipline'] as const).map(tab => (
                        <button
                          key={tab}
                          onClick={() => setPlayerStatsTab(tab)}
                          className={`flex-shrink-0 h-[44px] px-5 rounded-[8px] text-[14px] font-semibold capitalize transition-colors ${
                            playerStatsTab === tab
                              ? 'bg-[#0d1a67] text-white'
                              : 'text-[#7c8a9c] hover:text-[#0d1a67]'
                          }`}
                          style={{ fontFamily: 'Montserrat, sans-serif' }}
                        >
                          {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                      ))}
                    </div>
                    </div>
                    {/* Table header */}
                    <div className="flex items-center px-5 py-[14px] rounded-[10px] bg-[#f7f8fa]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      <div className="flex-1 text-[16px] font-medium text-[#0a0a0a]" style={{ lineHeight: '135%' }}>Players</div>
                      <div className="flex">
                        {playerStatsTab === 'summary' && <>
                          <div className="w-[150px] text-right text-[16px] font-medium text-[#0a0a0a]" style={{ lineHeight: '135%' }}>Rating</div>
                          <div className="w-[150px] text-right text-[16px] font-medium text-[#0a0a0a]" style={{ lineHeight: '135%' }}>Min</div>
                          <div className="w-[150px] text-right text-[16px] font-medium text-[#0a0a0a]" style={{ lineHeight: '135%' }}>Goal</div>
                          <div className="w-[150px] text-right text-[16px] font-medium text-[#0a0a0a]" style={{ lineHeight: '135%' }}>Assists</div>
                          <div className="w-[150px] text-right text-[16px] font-medium text-[#0a0a0a]" style={{ lineHeight: '135%' }}>xG</div>
                          <div className="w-[150px] text-right text-[16px] font-medium text-[#0a0a0a]" style={{ lineHeight: '135%' }}>xA</div>
                        </>}
                        {playerStatsTab === 'attacking' && <>
                          <div className="w-[150px] text-right text-[16px] font-medium text-[#0a0a0a]" style={{ lineHeight: '135%' }}>Goals</div>
                          <div className="w-[150px] text-right text-[16px] font-medium text-[#0a0a0a]" style={{ lineHeight: '135%' }}>Assists</div>
                          <div className="w-[150px] text-right text-[16px] font-medium text-[#0a0a0a]" style={{ lineHeight: '135%' }}>Shots</div>
                          <div className="w-[150px] text-right text-[16px] font-medium text-[#0a0a0a]" style={{ lineHeight: '135%' }}>On Target</div>
                          <div className="w-[150px] text-right text-[16px] font-medium text-[#0a0a0a]" style={{ lineHeight: '135%' }}>Key Pass</div>
                        </>}
                        {playerStatsTab === 'passing' && <>
                          <div className="w-[150px] text-right text-[16px] font-medium text-[#0a0a0a]" style={{ lineHeight: '135%' }}>Passes</div>
                          <div className="w-[150px] text-right text-[16px] font-medium text-[#0a0a0a]" style={{ lineHeight: '135%' }}>Accurate</div>
                          <div className="w-[150px] text-right text-[16px] font-medium text-[#0a0a0a]" style={{ lineHeight: '135%' }}>Acc %</div>
                          <div className="w-[150px] text-right text-[16px] font-medium text-[#0a0a0a]" style={{ lineHeight: '135%' }}>Key</div>
                        </>}
                        {playerStatsTab === 'defensive' && <>
                          <div className="w-[150px] text-right text-[16px] font-medium text-[#0a0a0a]" style={{ lineHeight: '135%' }}>Tackles</div>
                          <div className="w-[150px] text-right text-[16px] font-medium text-[#0a0a0a]" style={{ lineHeight: '135%' }}>Intercept</div>
                          <div className="w-[150px] text-right text-[16px] font-medium text-[#0a0a0a]" style={{ lineHeight: '135%' }}>Duels</div>
                          <div className="w-[150px] text-right text-[16px] font-medium text-[#0a0a0a]" style={{ lineHeight: '135%' }}>Won</div>
                          <div className="w-[150px] text-right text-[16px] font-medium text-[#0a0a0a]" style={{ lineHeight: '135%' }}>Clear</div>
                        </>}
                        {playerStatsTab === 'discipline' && <>
                          <div className="w-[150px] text-right text-[16px] font-medium text-[#0a0a0a]" style={{ lineHeight: '135%' }}>Fouls</div>
                          <div className="w-[150px] text-right text-[16px] font-medium text-[#0a0a0a]" style={{ lineHeight: '135%' }}>Yellow</div>
                          <div className="w-[150px] text-right text-[16px] font-medium text-[#0a0a0a]" style={{ lineHeight: '135%' }}>Red</div>
                          <div className="w-[150px] text-right text-[16px] font-medium text-[#0a0a0a]" style={{ lineHeight: '135%' }}>F.Drawn</div>
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
                      const name = `Player ${p.player_id}`;
                      const position = p.location === 'home' ? fixture?.home_team_short_code : fixture?.away_team_short_code;
                      const rating = ts.rating;
                      const ratingNum = typeof rating === 'number' ? rating.toFixed(1) : null;
                      const ratingColor = ratingNum == null ? '#7c8a9c' : parseFloat(ratingNum) >= 7 ? '#27ae60' : parseFloat(ratingNum) >= 5 ? '#f39c12' : '#e74c3c';
                      const v = (val: any) => val != null ? val : '—';

                      return (
                        <div key={`${p.player_id}-${idx}`} className="flex items-center px-[1px] h-[50px]" style={{ gap: '55px' }}>
                          {/* Player info */}
                          <div className="flex items-center gap-[10px] min-w-[158px]">
                            <div className="w-8 h-8 rounded-full bg-[#f7f8fa] flex items-center justify-center text-[10px] font-bold text-[#7c8a9c]">{String(p.player_id).slice(-2)}</div>
                            <div className="min-w-0">
                              <p className="text-[14px] font-semibold text-[#0a0a0a] truncate" style={{ fontFamily: 'Montserrat, sans-serif' }}>{name}</p>
                              <p className="text-[12px] text-[#7c8a9c]" style={{ fontFamily: 'Montserrat, sans-serif' }}>{position}</p>
                            </div>
                          </div>
                          {/* Stats */}
                          <div className="flex flex-1 justify-end">
                            {playerStatsTab === 'summary' && <>
                              <div className="w-[150px] text-right">
                                {ratingNum ? (
                                  <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-[6px] text-[14px] font-bold text-white" style={{ backgroundColor: ratingColor }}>{ratingNum}</span>
                                ) : <span className="text-[16px] font-medium text-[#7c8a9c]">—</span>}
                              </div>
                              <div className="w-[150px] text-right text-[16px] font-medium text-[#0a0a0a]" style={{ lineHeight: '135%' }}>{v(ts['minutes-played'])}</div>
                              <div className="w-[150px] text-right text-[16px] font-medium text-[#0a0a0a]" style={{ lineHeight: '135%' }}>{v(ts.goals ?? atk.goals)}</div>
                              <div className="w-[150px] text-right text-[16px] font-medium text-[#0a0a0a]" style={{ lineHeight: '135%' }}>{v(ts.assists ?? pas.assists)}</div>
                              <div className="w-[150px] text-right text-[16px] font-medium text-[#0a0a0a]" style={{ lineHeight: '135%' }}>{v(ts.xg ?? atk.xg)}</div>
                              <div className="w-[150px] text-right text-[16px] font-medium text-[#0a0a0a]" style={{ lineHeight: '135%' }}>{v(ts.xa ?? pas.xa)}</div>
                            </>}
                            {playerStatsTab === 'attacking' && <>
                              <div className="w-[150px] text-right text-[16px] font-medium text-[#0a0a0a]" style={{ lineHeight: '135%' }}>{v(atk.goals)}</div>
                              <div className="w-[150px] text-right text-[16px] font-medium text-[#0a0a0a]" style={{ lineHeight: '135%' }}>{v(pas.assists)}</div>
                              <div className="w-[150px] text-right text-[16px] font-medium text-[#0a0a0a]" style={{ lineHeight: '135%' }}>{v(atk['shots-total'])}</div>
                              <div className="w-[150px] text-right text-[16px] font-medium text-[#0a0a0a]" style={{ lineHeight: '135%' }}>{v(atk['shots-on-target'])}</div>
                              <div className="w-[150px] text-right text-[16px] font-medium text-[#0a0a0a]" style={{ lineHeight: '135%' }}>{v(pas['key-passes'])}</div>
                            </>}
                            {playerStatsTab === 'passing' && <>
                              <div className="w-[150px] text-right text-[16px] font-medium text-[#0a0a0a]" style={{ lineHeight: '135%' }}>{v(pas.touches)}</div>
                              <div className="w-[150px] text-right text-[16px] font-medium text-[#0a0a0a]" style={{ lineHeight: '135%' }}>{v(pas['accurate-passes'])}</div>
                              <div className="w-[150px] text-right text-[16px] font-medium text-[#0a0a0a]" style={{ lineHeight: '135%' }}>{pas['accurate-passes-percentage'] != null ? `${pas['accurate-passes-percentage']}%` : '—'}</div>
                              <div className="w-[150px] text-right text-[16px] font-medium text-[#0a0a0a]" style={{ lineHeight: '135%' }}>{v(pas['key-passes'])}</div>
                            </>}
                            {playerStatsTab === 'defensive' && <>
                              <div className="w-[150px] text-right text-[16px] font-medium text-[#0a0a0a]" style={{ lineHeight: '135%' }}>{v(def.tackles)}</div>
                              <div className="w-[150px] text-right text-[16px] font-medium text-[#0a0a0a]" style={{ lineHeight: '135%' }}>{v(def['blocked-shots'])}</div>
                              <div className="w-[150px] text-right text-[16px] font-medium text-[#0a0a0a]" style={{ lineHeight: '135%' }}>{v(duel['duels-lost'])}</div>
                              <div className="w-[150px] text-right text-[16px] font-medium text-[#0a0a0a]" style={{ lineHeight: '135%' }}>{v(duel['ground-duels-won'])}</div>
                              <div className="w-[150px] text-right text-[16px] font-medium text-[#0a0a0a]" style={{ lineHeight: '135%' }}>{v(def.clearances)}</div>
                            </>}
                            {playerStatsTab === 'discipline' && <>
                              <div className="w-[150px] text-right text-[16px] font-medium text-[#0a0a0a]" style={{ lineHeight: '135%' }}>{v(duel.fouls)}</div>
                              <div className="w-[150px] text-right text-[16px] font-medium text-[#0a0a0a]" style={{ lineHeight: '135%' }}>—</div>
                              <div className="w-[150px] text-right text-[16px] font-medium text-[#0a0a0a]" style={{ lineHeight: '135%' }}>—</div>
                              <div className="w-[150px] text-right text-[16px] font-medium text-[#0a0a0a]" style={{ lineHeight: '135%' }}>{v(duel['fouls-drawn'])}</div>
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
