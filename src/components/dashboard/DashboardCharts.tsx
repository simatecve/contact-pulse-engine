
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useDashboardCharts } from '@/hooks/useDashboardCharts';
import { TrendingUp, Users } from 'lucide-react';

interface DashboardChartsProps {
  timeFilter: string;
}

const chartConfig = {
  conversations: {
    label: 'Conversaciones',
    color: '#3B82F6',
  },
  leads: {
    label: 'Leads',
    color: '#10B981',
  },
  campaigns: {
    label: 'Campañas',
    color: '#F59E0B',
  },
};

export const DashboardCharts: React.FC<DashboardChartsProps> = ({ timeFilter }) => {
  const { data, isLoading } = useDashboardCharts(timeFilter);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="h-64 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Cargando gráficos...</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="h-64 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Cargando gráficos...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Gráfico de Tendencias */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Tendencias de Actividad
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.chartData}>
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line 
                  type="monotone" 
                  dataKey="conversations" 
                  stroke={chartConfig.conversations.color}
                  strokeWidth={2}
                  dot={{ fill: chartConfig.conversations.color, strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: chartConfig.conversations.color }}
                />
                <Line 
                  type="monotone" 
                  dataKey="leads" 
                  stroke={chartConfig.leads.color}
                  strokeWidth={2}
                  dot={{ fill: chartConfig.leads.color, strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: chartConfig.leads.color }}
                />
                <Line 
                  type="monotone" 
                  dataKey="campaigns" 
                  stroke={chartConfig.campaigns.color}
                  strokeWidth={2}
                  dot={{ fill: chartConfig.campaigns.color, strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: chartConfig.campaigns.color }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Gráfico de Leads por Estado */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Distribución de Leads
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.leadsStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="count"
                  nameKey="status"
                >
                  {data?.leadsStatusData?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartTooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-3 border rounded-lg shadow-lg">
                          <p className="font-medium">{data.status}</p>
                          <p className="text-sm text-gray-600">{data.count} leads</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
          
          {/* Leyenda */}
          <div className="flex flex-wrap gap-4 mt-4 justify-center">
            {data?.leadsStatusData?.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.fill }}
                ></div>
                <span className="text-sm text-gray-600">
                  {item.status} ({item.count})
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
