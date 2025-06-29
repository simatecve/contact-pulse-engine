
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { timeFilters } from '@/hooks/useDashboardMetrics';

interface TimeFilterProps {
  value: string;
  onChange: (value: string) => void;
}

export const TimeFilter: React.FC<TimeFilterProps> = ({ value, onChange }) => {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-48">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {timeFilters.map((filter) => (
          <SelectItem key={filter.value} value={filter.value}>
            {filter.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
