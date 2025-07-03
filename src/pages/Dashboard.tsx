
import React, { useState } from 'react';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { DashboardCharts } from '@/components/dashboard/DashboardCharts';
import { TimeFilter } from '@/components/dashboard/TimeFilter';
import { AlertsPanel } from '@/components/dashboard/AlertsPanel';
import { MessageSquare, Users, Send, TrendingUp, Bot, Eye, Sparkles, Zap, Target } from 'lucide-react';
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
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Section */}
      <div className="relative">
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">¡Bienvenido de vuelta!</h1>
                <p className="text-indigo-100 text-lg">Gestiona tu negocio desde un solo lugar</p>
                <div className="flex items-center mt-2 space-x-4">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                    <span className="text-sm text-indigo-100">Sistema activo</span>
                  </div>
                  <div className="flex items-center">
                    <Zap className="w-4 h-4 text-yellow-300 mr-1" />
                    <span className="text-sm text-indigo-100">IA habilitada</span>
                  </div>
                </div>
              </div>
            </div>
            <TimeFilter value={timeFilter} onChange={setTimeFilter} />
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="metric-card card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Conversaciones Activas</p>
              <p className="text-3xl font-bold text-gray-900">{metrics?.totalConversations || 0}</p>
              {metrics?.conversationsChange && (
                <p className={`text-sm mt-1 flex items-center ${
                  getChangeType(metrics.conversationsChange) === 'positive' ? 'text-green-600' : 
                  getChangeType(metrics.conversationsChange) === 'negative' ? 'text-red-600' : 'text-gray-500'
                }`}>
                  {metrics.conversationsChange > 0 ? '+' : ''}{metrics.conversationsChange}% vs período anterior
                </p>
              )}
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="metric-card card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Nuevos Leads</p>
              <p className="text-3xl font-bold text-gray-900">{metrics?.newLeads || 0}</p>
              {metrics?.leadsChange && (
                <p className={`text-sm mt-1 flex items-center ${
                  getChangeType(metrics.leadsChange) === 'positive' ? 'text-green-600' : 
                  getChangeType(metrics.leadsChange) === 'negative' ? 'text-red-600' : 'text-gray-500'
                }`}>
                  {metrics.leadsChange > 0 ? '+' : ''}{metrics.leadsChange}% vs período anterior
                </p>
              )}
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="metric-card card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Campañas Enviadas</p>
              <p className="text-3xl font-bold text-gray-900">{metrics?.campaignsSent || 0}</p>
              {metrics?.campaignsChange && (
                <p className={`text-sm mt-1 flex items-center ${
                  getChangeType(metrics.campaignsChange) === 'positive' ? 'text-green-600' : 
                  getChangeType(metrics.campaignsChange) === 'negative' ? 'text-red-600' : 'text-gray-500'
                }`}>
                  {metrics.campaignsChange > 0 ? '+' : ''}{metrics.campaignsChange}% vs período anterior
                </p>
              )}
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Send className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="metric-card card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Tasa de Conversión</p>
              <p className="text-3xl font-bold text-gray-900">{metrics?.conversionRate || 0}%</p>
              {metrics?.conversionChange && (
                <p className={`text-sm mt-1 flex items-center ${
                  getChangeType(metrics.conversionChange) === 'positive' ? 'text-green-600' : 
                  getChangeType(metrics.conversionChange) === 'negative' ? 'text-red-600' : 'text-gray-500'
                }`}>
                  {metrics.conversionChange > 0 ? '+' : ''}{metrics.conversionChange}% vs período anterior
                </p>
              )}
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
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
        <Card className="card-hover border-0 shadow-md bg-gradient-to-br from-indigo-50 to-blue-50">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Configurar Agente IA</h3>
            <p className="text-sm text-gray-600">Automatiza respuestas y mejora la atención</p>
          </CardContent>
        </Card>

        <Card className="card-hover border-0 shadow-md bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Send className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Nueva Campaña</h3>
            <p className="text-sm text-gray-600">Crea y envía campañas personalizadas</p>
          </CardContent>
        </Card>

        <Card className="card-hover border-0 shadow-md bg-gradient-to-br from-purple-50 to-pink-50">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Eye className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Ver Reportes</h3>
            <p className="text-sm text-gray-600">Analiza métricas y optimiza resultados</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
