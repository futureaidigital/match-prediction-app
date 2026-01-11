import { useState, useRef, useEffect } from 'react';
import { useLeagues } from '@/hooks/useLeagues';

export interface FilterValues {
  leagues: number[];
  matchStatus: 'all' | 'live' | 'upcoming' | 'finished';
}

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onApply?: (filters: FilterValues) => void;
  initialFilters?: FilterValues;
  className?: string;
}

export function FilterPanel({ isOpen, onClose, onApply, initialFilters, className = '' }: FilterPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Fetch leagues from API
  const { data: leaguesData, isLoading: isLoadingLeagues } = useLeagues();
  const leagues = leaguesData?.data?.leagues || [];

  // Local state for UI
  const [selectedLeagues, setSelectedLeagues] = useState<number[]>(initialFilters?.leagues || []);
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'live' | 'upcoming' | 'finished'>(
    initialFilters?.matchStatus || 'all'
  );
  const [searchQuery, setSearchQuery] = useState('');

  // Reset to initial values when panel opens
  useEffect(() => {
    if (isOpen && initialFilters) {
      setSelectedLeagues(initialFilters.leagues);
      setSelectedStatus(initialFilters.matchStatus);
    }
  }, [isOpen, initialFilters]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const statuses: Array<{ value: 'all' | 'live' | 'upcoming' | 'finished'; label: string }> = [
    { value: 'all', label: 'All' },
    { value: 'live', label: 'Live' },
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'finished', label: 'Finished' },
  ];

  const toggleLeague = (leagueId: number) => {
    setSelectedLeagues(prev =>
      prev.includes(leagueId)
        ? prev.filter(id => id !== leagueId)
        : [...prev, leagueId]
    );
  };

  const handleApply = () => {
    if (onApply) {
      onApply({
        leagues: selectedLeagues,
        matchStatus: selectedStatus,
      });
    }
    onClose();
  };

  const handleClear = () => {
    setSelectedLeagues([]);
    setSelectedStatus('all');
    setSearchQuery('');
  };

  // Filter leagues by search query
  const filteredLeagues = leagues.filter(league =>
    league.league_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      ref={panelRef}
      className={`absolute right-0 top-12 z-50 w-[358px] bg-white rounded-[20px] border border-[#e1e4eb] shadow-[0_10px_30px_rgba(0,0,0,0.1)] ${className}`}
      style={{ fontFamily: 'Montserrat, sans-serif' }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {/* Header with drag indicator */}
      <div className="flex justify-center pt-5 pb-0">
        <div className="w-[60px] h-[5px] bg-gray-200 rounded-full" />
      </div>

      {/* Content */}
      <div className="px-5 py-5 flex flex-col gap-[30px]">
        {/* Leagues Section */}
        <div className="flex flex-col gap-3">
          <span className="text-[#7c8a9c] text-[16px] font-normal leading-[24px]">Leagues</span>

          {/* Search Input */}
          <div className="flex items-center justify-between h-[40px] px-3 bg-[#f7f8fa] border border-[#e1e4eb] rounded-[10px]">
            <input
              type="text"
              placeholder="Search leagues..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-[#0a0a0a] text-[14px] font-normal leading-[140%] outline-none placeholder:text-[#7c8a9c]"
            />
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7c8a9c" strokeWidth="1.5">
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-4-4" strokeLinecap="round" />
            </svg>
          </div>

          {/* League Checkboxes */}
          <div className="flex flex-col gap-[10px] max-h-[175px] overflow-y-auto">
            {isLoadingLeagues ? (
              // Loading skeleton
              <>
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-[10px]">
                    <div className="w-5 h-5 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
                  </div>
                ))}
              </>
            ) : filteredLeagues.length > 0 ? (
              filteredLeagues.map((league) => (
                <button
                  key={league.league_id}
                  onClick={() => toggleLeague(league.league_id)}
                  className="flex items-center gap-[10px] text-left"
                >
                  <div className={`w-5 h-5 rounded border-[1.5px] flex items-center justify-center transition-colors ${
                    selectedLeagues.includes(league.league_id)
                      ? 'bg-[#0d1a67] border-[#0d1a67]'
                      : 'bg-white border-[#7c8a9c]'
                  }`}>
                    {selectedLeagues.includes(league.league_id) && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {league.image_path && (
                      <img src={league.image_path} alt="" className="w-5 h-5 object-contain" />
                    )}
                    <span className="text-[#0a0a0a] text-[14px] font-normal leading-[150%]">{league.league_name}</span>
                  </div>
                </button>
              ))
            ) : (
              <span className="text-[#7c8a9c] text-[14px]">No leagues found</span>
            )}
          </div>
        </div>

        {/* Match Status Section */}
        <div className="flex flex-col gap-3">
          <span className="text-[#7c8a9c] text-[16px] font-normal leading-[24px]">Match Status</span>
          <div className="flex flex-wrap gap-[10px]">
            {statuses.map((status) => (
              <button
                key={status.value}
                onClick={() => setSelectedStatus(status.value)}
                className={`h-[40px] px-3 rounded-full text-[14px] leading-[150%] transition-colors ${
                  selectedStatus === status.value
                    ? 'bg-[#0d1a67] text-white font-medium'
                    : 'bg-[#f7f8fa] text-[#0a0a0a] border border-[#e1e4eb] font-normal hover:bg-gray-100'
                }`}
              >
                {status.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="px-5 pb-5 flex gap-[10px]">
        <button
          onClick={handleClear}
          className="flex-1 h-[48px] rounded-[10px] border border-[#e1e4eb] bg-white text-[#0a0a0a] text-[14px] font-semibold hover:bg-gray-50 transition-colors"
        >
          Clear All
        </button>
        <button
          onClick={handleApply}
          className="flex-1 h-[48px] rounded-[10px] bg-[#0d1a67] text-white text-[14px] font-semibold hover:bg-[#0a1452] transition-colors"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
}
