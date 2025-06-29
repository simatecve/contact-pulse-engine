
import React, { useState } from 'react';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { DashboardCharts } from '@/components/dashboard/DashboardCharts';
import { TimeFilter } from '@/components/dashboard/TimeFilter';
import { AlertsPanel } from '@/components/dashboard/AlertsPanel';
import { MessageSquare, Users, Send, TrendingUp, Bot, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDashboardMetrics } from '@/hooks/useDashboardMetrics';

export const Dashboard: React.FC = () => {
  const [timeFilter, setTimeFilter] = useState('30');
  const { data: metrics, isLoading } = useDashboardMetrics(timeFilter);

  const getChangeType = (change: number): 'positive' | 'negative' | 'neutral' => {
    if (change > 0) return 'positive';
    if (change < 0) return 'negative';
    return 'neutral';
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section with Time Filter */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">¡Bienvenido de vuelta!</h1>
          <p className="text-gray-600 mt-1">Aquí tienes un resumen de tu actividad reciente</p>
        </div>
        <TimeFilter value={timeFilter} onChange={setTimeFilter} />
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Conversaciones Activas"
          value={metrics?.totalConversations || 0}
          change={metrics?.conversationsChange}
          changeType={metrics?.conversationsChange ? getChangeType(metrics.conversationsChange) : undefined}
          icon={MessageSquare}
          isLoading={isLoading}
        />
        <MetricCard
          title="Nuevos Leads"
          value={metrics?.newLeads || 0}
          change={metrics?.leadsChange}
          changeType={metrics?.leadsChange ? getChangeType(metrics.leadsChange) : undefined}
          icon={Users}
          isLoading={isLoading}
        />
        <MetricCard
          title="Campañas Enviadas"
          value={metrics?.campaignsSent || 0}
          change={metrics?.campaignsChange}
          changeType={metrics?.campaignsChange ? getChangeType(metrics.campaignsChange) : undefined}
          icon={Send}
          isLoading={isLoading}
        />
        <MetricCard
          title="Tasa de Conversión"
          value={`${metrics?.conversionRate || 0}%`}
          change={metrics?.conversionChange}
          changeType={metrics?.conversionChange ? getChangeType(metrics.conversionChange) : undefined}
          icon={TrendingUp}
          isLoading={isLoading}
        />
      </div>

      {/* Charts Section */}
      <DashboardCharts timeFilter={timeFilter} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Feed */}
        <div className="lg:col-span-2">
          <ActivityFeed />
        </div>

        {/* Alerts Panel */}
        <div>
          <AlertsPanel />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <Bot className="w-12 h-12 text-blue-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Configurar Agente IA</h3>
            <p className="text-sm text-gray-600">Automatiza respuestas y mejora la atención</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <Send className="w-12 h-12 text-green-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Nueva Campaña</h3>
            <p className="text-sm text-gray-600">Crea y envía campañas personalizadas</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <Eye className="w-12 h-12 text-purple-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Ver Reportes</h3>
            <p className="text-sm text-gray-600">Analiza métricas y optimiza resultados</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
