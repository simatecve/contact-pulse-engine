
import React from 'react';
import { Download, Filter, TrendingUp, Users, Mail, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const Reports: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reportes y Analytics</h1>
          <p className="text-gray-600 mt-1">Analiza el rendimiento de tus campañas y conversaciones</p>
        </div>
        <div className="flex space-x-2">
          <Select defaultValue="30">
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Últimos 7 días</SelectItem>
              <SelectItem value="30">Últimos 30 días</SelectItem>
              <SelectItem value="90">Últimos 3 meses</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Conversaciones Totales</p>
                <p className="text-2xl font-bold text-gray-900">1,456</p>
                <p className="text-sm text-green-600 mt-1">+15% vs mes anterior</p>
              </div>
              <div className="h-12 w-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Emails Enviados</p>
                <p className="text-2xl font-bold text-gray-900">8,924</p>
                <p className="text-sm text-green-600 mt-1">+23% vs mes anterior</p>
              </div>
              <div className="h-12 w-12 bg-purple-50 rounded-lg flex items-center justify-center">
                <Mail className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Nuevos Leads</p>
                <p className="text-2xl font-bold text-gray-900">234</p>
                <p className="text-sm text-green-600 mt-1">+8% vs mes anterior</p>
              </div>
              <div className="h-12 w-12 bg-green-50 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tasa de Conversión</p>
                <p className="text-2xl font-bold text-gray-900">12.4%</p>
                <p className="text-sm text-red-600 mt-1">-2% vs mes anterior</p>
              </div>
              <div className="h-12 w-12 bg-yellow-50 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Rendimiento de Campañas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Gráfico de líneas próximamente</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Canales de Comunicación</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Gráfico de pastel próximamente</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Campañas por Apertura</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: 'Promoción Verano', rate: '45.2%', change: '+12%' },
                { name: 'Bienvenida Nuevos', rate: '38.7%', change: '+8%' },
                { name: 'Newsletter Semanal', rate: '32.1%', change: '-3%' },
                { name: 'Recordatorio Evento', rate: '28.9%', change: '+5%' }
              ].map((campaign, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{campaign.name}</p>
                    <p className="text-sm text-gray-600">Tasa de apertura: {campaign.rate}</p>
                  </div>
                  <div className={`text-sm font-medium ${
                    campaign.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {campaign.change}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fuentes de Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { source: 'Sitio Web', count: 156, percentage: 45 },
                { source: 'Redes Sociales', count: 89, percentage: 26 },
                { source: 'Email Marketing', count: 67, percentage: 19 },
                { source: 'Referidos', count: 34, percentage: 10 }
              ].map((source, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{source.source}</span>
                    <span className="text-sm text-gray-500">{source.count} leads</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${source.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
