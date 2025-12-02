import React from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FilterBarProps {
  title?: string;
  onFilterClick?: () => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
  title = "Matches",
  onFilterClick
}) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
      <Button
        variant="outline"
        onClick={onFilterClick}
        className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 border-0 text-gray-700 font-medium"
      >
        Filter
        <ChevronDown className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default FilterBar;
