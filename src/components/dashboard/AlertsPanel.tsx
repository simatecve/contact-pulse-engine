
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { useAlerts } from '@/hooks/useAlerts';

export const AlertsPanel: React.FC = () => {
  const { alerts, isLoading } = useAlerts();

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'danger': return AlertCircle;
      case 'warning': return AlertTriangle;
      case 'info': return Info;
      default: return Info;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'danger': return 'text-red-600 bg-red-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'info': return 'text-blue-600 bg-blue-50';
      default: return 'text-blue-600 bg-blue-50';
    }
  };

  const getBadgeVariant = (type: string) => {
    switch (type) {
      case 'danger': return 'destructive' as const;
      case 'warning': return 'secondary' as const;
      case 'info': return 'default' as const;
      default: return 'default' as const;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Alertas Proactivas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg animate-pulse">
                <div className="w-5 h-5 bg-gray-300 rounded"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-300 rounded mb-1"></div>
                  <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (alerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Alertas Proactivas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Info className="w-12 h-12 text-green-600 mx-auto mb-2" />
            <p className="text-gray-600">¡Todo está funcionando correctamente!</p>
            <p className="text-sm text-gray-500 mt-1">No hay alertas en este momento</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Alertas Proactivas
          <Badge variant="secondary">{alerts.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alerts.map((alert) => {
            const Icon = getAlertIcon(alert.type);
            return (
              <div
                key={alert.id}
                className={`flex items-center space-x-3 p-3 rounded-lg ${getAlertColor(alert.type)}`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm">{alert.title}</p>
                    {alert.count && (
                      <Badge variant={getBadgeVariant(alert.type)} className="ml-2">
                        {alert.count}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm opacity-80 mt-1">{alert.message}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
