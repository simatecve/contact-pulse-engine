
import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useCampaignAnalytics } from '@/hooks/useCampaignAnalytics';
import { useCampaigns } from '@/hooks/useCampaigns';

interface CampaignAnalyticsProps {
  campaignId?: string;
}

export const CampaignAnalytics: React.FC<CampaignAnalyticsProps> = ({ campaignId }) => {
  const [selectedCampaign, setSelectedCampaign] = useState(campaignId || '');
  const { campaigns } = useCampaigns();
  const { metrics, timeRangeAnalytics, campaignsSummary } = useCampaignAnalytics(selectedCampaign);

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  const pieData = [
    { name: 'Enviados', value: metrics.sent, color: COLORS[0] },
    { name: 'Entregados', value: metrics.delivered, color: COLORS[1] },
    { name: 'Abiertos', value: metrics.opened, color: COLORS[2] },
    { name: 'Clics', value: metrics.clicked, color: COLORS[3] },
    { name: 'Respuestas', value: metrics.replied, color: COLORS[4] },
    { name: 'Conversiones', value: metrics.converted, color: COLORS[5] }
  ].filter(item => item.value > 0);

  const timeSeriesData = timeRangeAnalytics?.reduce((acc, analytics) => {
    const date = new Date(analytics.event_timestamp).toLocaleDateString();
    const existing = acc.find(item => item.date === date);
    
    if (existing) {
      existing[analytics.event_type] = (existing[analytics.event_type] || 0) + 1;
    } else {
      acc.push({
        date,
        [analytics.event_type]: 1
      });
    }
    
    return acc;
  }, [] as any[]) || [];

  const MetricCard = ({ title, value, percentage, color = 'blue' }: {
    title: string;
    value: number;
    percentage: number;
    color?: string;
  }) => (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold">{value.toLocaleString()}</p>
          </div>
          <Badge variant="secondary" className={`bg-${color}-100 text-${color}-800`}>
            {percentage.toFixed(1)}%
          </Badge>
        </div>
      </CardContent>
    </Card>
  );

  if (!selectedCampaign && !campaignId) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Analytics de Campañas</h2>
          <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Seleccionar campaña" />
            </SelectTrigger>
            <SelectContent>
              {campaigns?.map((campaign) => (
                <SelectItem key={campaign.id} value={campaign.id}>
                  {campaign.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Resumen de todas las campañas */}
        <div className="grid gap-4">
          {campaignsSummary.map((campaign) => (
            <Card key={campaign.id} className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedCampaign(campaign.id)}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{campaign.name}</h3>
                    <p className="text-sm text-gray-500">
                      Creada el {new Date(campaign.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-4 text-sm">
                    <div className="text-center">
                      <p className="font-medium">{campaign.metrics.sent}</p>
                      <p className="text-gray-500">Enviados</p>
                    </div>
                    <div className="text-center">
                      <p className="font-medium">{campaign.metrics.delivered}</p>
                      <p className="text-gray-500">Entregados</p>
                    </div>
                    <div className="text-center">
                      <p className="font-medium">{campaign.metrics.opened}</p>
                      <p className="text-gray-500">Abiertos</p>
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-green-600">{campaign.metrics.open_rate.toFixed(1)}%</p>
                      <p className="text-gray-500">Tasa Apertura</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Analytics de Campaña</h2>
        {!campaignId && (
          <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Seleccionar campaña" />
            </SelectTrigger>
            <SelectContent>
              {campaigns?.map((campaign) => (
                <SelectItem key={campaign.id} value={campaign.id}>
                  {campaign.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <MetricCard title="Enviados" value={metrics.sent} percentage={100} color="blue" />
        <MetricCard title="Entregados" value={metrics.delivered} percentage={metrics.delivery_rate} color="green" />
        <MetricCard title="Abiertos" value={metrics.opened} percentage={metrics.open_rate} color="yellow" />
        <MetricCard title="Clics" value={metrics.clicked} percentage={metrics.click_rate} color="purple" />
        <MetricCard title="Respuestas" value={metrics.replied} percentage={metrics.reply_rate} color="pink" />
        <MetricCard title="Conversiones" value={metrics.converted} percentage={metrics.conversion_rate} color="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de barras */}
        <Card>
          <CardHeader>
            <CardTitle>Resumen de Métricas</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={[
                { name: 'Enviados', value: metrics.sent },
                { name: 'Entregados', value: metrics.delivered },
                { name: 'Abiertos', value: metrics.opened },
                { name: 'Clics', value: metrics.clicked },
                { name: 'Respuestas', value: metrics.replied },
                { name: 'Conversiones', value: metrics.converted }
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de pastel */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución de Eventos</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de línea temporal */}
      {timeSeriesData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Tendencia Temporal (Últimos 30 días)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="sent" stroke="#3B82F6" name="Enviados" />
                <Line type="monotone" dataKey="delivered" stroke="#10B981" name="Entregados" />
                <Line type="monotone" dataKey="opened" stroke="#F59E0B" name="Abiertos" />
                <Line type="monotone" dataKey="clicked" stroke="#EF4444" name="Clics" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
