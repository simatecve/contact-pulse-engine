
import React from 'react';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { MessageSquare, Users, Send, TrendingUp, Bot, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">¡Bienvenido de vuelta!</h1>
        <p className="text-gray-600 mt-1">Aquí tienes un resumen de tu actividad reciente</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Conversaciones Activas"
          value="127"
          change="+12% vs. semana pasada"
          changeType="positive"
          icon={MessageSquare}
        />
        <MetricCard
          title="Nuevos Leads"
          value="89"
          change="+23% vs. semana pasada"
          changeType="positive"
          icon={Users}
        />
        <MetricCard
          title="Campañas Enviadas"
          value="15"
          change="-5% vs. semana pasada"
          changeType="negative"
          icon={Send}
        />
        <MetricCard
          title="Tasa de Conversión"
          value="4.2%"
          change="+0.8% vs. semana pasada"
          changeType="positive"
          icon={TrendingUp}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Rendimiento de Campañas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Gráfico de rendimiento próximamente</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity Feed */}
        <div>
          <ActivityFeed />
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
