import { useState, useRef, useEffect } from 'react';

interface CalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  className?: string;
}

export function Calendar({ selectedDate, onDateSelect, className = '' }: CalendarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(new Date(selectedDate));
  const calendarRef = useRef<HTMLDivElement>(null);

  const DAYS = ['Sa', 'Su', 'Mo', 'Tu', 'We', 'Th', 'Fr'];
  const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset view date when selectedDate changes
  useEffect(() => {
    setViewDate(new Date(selectedDate));
  }, [selectedDate]);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    // Get day of week (0 = Sunday, 6 = Saturday)
    // We want Saturday = 0, so adjust
    const day = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    // Convert: Sunday(0)->1, Monday(1)->2, ..., Saturday(6)->0
    return day === 6 ? 0 : day + 1;
  };

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(viewDate);
    const firstDay = getFirstDayOfMonth(viewDate);
    const daysInPrevMonth = getDaysInMonth(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));

    const days: { day: number; isCurrentMonth: boolean; date: Date }[] = [];

    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      days.push({
        day,
        isCurrentMonth: false,
        date: new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, day)
      });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        day,
        isCurrentMonth: true,
        date: new Date(viewDate.getFullYear(), viewDate.getMonth(), day)
      });
    }

    // Next month days to fill the grid (6 rows x 7 days = 42)
    const remaining = 42 - days.length;
    for (let day = 1; day <= remaining; day++) {
      days.push({
        day,
        isCurrentMonth: false,
        date: new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, day)
      });
    }

    return days;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  const handleDateClick = (date: Date) => {
    onDateSelect(date);
    setIsOpen(false);
  };

  const goToPrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    const today = new Date();
    setViewDate(today);
    onDateSelect(today);
    setIsOpen(false);
  };

  const clearDate = () => {
    const today = new Date();
    setViewDate(today);
    onDateSelect(today);
  };

  return (
    <div ref={calendarRef} className={`relative ${className}`}>
      {/* Calendar trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center"
      >
        <img src="/Calendar.svg" alt="Calendar" className="w-[20px] h-[20px]" />
      </button>

      {/* Calendar dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-12 z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-4 w-[280px]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-gray-900">
              {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={goToPrevMonth}
                className="w-7 h-7 rounded hover:bg-gray-100 flex items-center justify-center transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <button
                onClick={goToNextMonth}
                className="w-7 h-7 rounded hover:bg-gray-100 flex items-center justify-center transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS.map((day) => (
              <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {generateCalendarDays().map((item, index) => (
              <button
                key={index}
                onClick={() => handleDateClick(item.date)}
                className={`
                  w-8 h-8 rounded-full text-sm flex items-center justify-center transition-colors
                  ${!item.isCurrentMonth ? 'text-gray-300' : 'text-gray-700'}
                  ${isSelected(item.date) ? 'bg-[#0d1a67] text-white' : ''}
                  ${isToday(item.date) && !isSelected(item.date) ? 'border-2 border-[#0d1a67]' : ''}
                  ${item.isCurrentMonth && !isSelected(item.date) ? 'hover:bg-gray-100' : ''}
                `}
              >
                {item.day}
              </button>
            ))}
          </div>

          {/* Footer */}
          <div className="flex justify-between mt-4 pt-3 border-t border-gray-100">
            <button
              onClick={clearDate}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Clear
            </button>
            <button
              onClick={goToToday}
              className="text-sm text-[#0d1a67] hover:text-[#0a1452] font-medium transition-colors"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
