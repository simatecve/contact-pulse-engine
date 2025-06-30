
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface BadgeCounterProps {
  count: number;
  max?: number;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary';
  className?: string;
}

export const BadgeCounter: React.FC<BadgeCounterProps> = ({ 
  count, 
  max = 99, 
  variant = 'destructive',
  className = ''
}) => {
  if (count <= 0) return null;

  const displayCount = count > max ? `${max}+` : count.toString();

  return (
    <Badge 
      variant={variant}
      className={`h-5 w-5 flex items-center justify-center p-0 text-xs ${className}`}
    >
      {displayCount}
    </Badge>
  );
};
