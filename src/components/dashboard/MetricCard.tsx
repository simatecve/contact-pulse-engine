
import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  isLoading?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  isLoading = false
}) => {
  const getChangeColor = () => {
    if (!changeType || change === undefined) return 'text-gray-600';
    switch (changeType) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      case 'neutral': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const getChangeText = () => {
    if (change === undefined) return '';
    const sign = change > 0 ? '+' : '';
    return `${sign}${change}% vs. período anterior`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-3 bg-gray-200 rounded animate-pulse w-24"></div>
            </div>
            <div className="h-12 w-12 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="transition-all duration-200 hover:shadow-md">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
            {change !== undefined && (
              <p className={`text-sm mt-1 ${getChangeColor()}`}>
                {getChangeText()}
              </p>
            )}
          </div>
          <div className="h-12 w-12 bg-blue-50 rounded-lg flex items-center justify-center">
            <Icon className="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
