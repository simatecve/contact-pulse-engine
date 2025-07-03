
import React from 'react';
import { Download, Filter, TrendingUp, Users, Mail, MessageSquare, Sparkles, BarChart3, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const Reports: React.FC = () => {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Section */}
      <div className="relative">
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">Reportes y Analytics</h1>
                <p className="text-indigo-100 text-lg">Analiza el rendimiento de tus campañas y conversaciones</p>
                <div className="flex items-center mt-2 space-x-4">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                    <span className="text-sm text-indigo-100">Datos actualizados</span>
                  </div>
                  <div className="flex items-center">
                    <Sparkles className="w-4 h-4 text-yellow-300 mr-1" />
                    <span className="text-sm text-indigo-100">IA Analytics</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex space-x-3">
              <Select defaultValue="30">
                <SelectTrigger className="w-40 bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Últimos 7 días</SelectItem>
                  <SelectItem value="30">Últimos 30 días</SelectItem>
                  <SelectItem value="90">Últimos 3 meses</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="secondary" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                <Filter className="w-4 h-4 mr-2" />
                Filtros
              </Button>
              <Button className="bg-white text-indigo-600 hover:bg-gray-100">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="metric-card card-hover bg-gradient-to-br from-blue-50 to-indigo-50 border-0 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Conversaciones Totales</p>
              <p className="text-3xl font-bold text-gray-900">1,456</p>
              <p className="text-sm text-green-600 mt-1 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                +15% vs mes anterior
              </p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
              <MessageSquare className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>

        <div className="metric-card card-hover bg-gradient-to-br from-purple-50 to-pink-50 border-0 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Emails Enviados</p>
              <p className="text-3xl font-bold text-gray-900">8,924</p>
              <p className="text-sm text-green-600 mt-1 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                +23% vs mes anterior
              </p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
              <Mail className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>

        <div className="metric-card card-hover bg-gradient-to-br from-green-50 to-emerald-50 border-0 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Nuevos Leads</p>
              <p className="text-3xl font-bold text-gray-900">234</p>
              <p className="text-sm text-green-600 mt-1 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                +8% vs mes anterior
              </p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
              <Users className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>

        <div className="metric-card card-hover bg-gradient-to-br from-orange-50 to-yellow-50 border-0 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Tasa de Conversión</p>
              <p className="text-3xl font-bold text-gray-900">12.4%</p>
              <p className="text-sm text-red-600 mt-1 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1 rotate-180" />
                -2% vs mes anterior
              </p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-xl flex items-center justify-center shadow-lg">
              <Target className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="card-hover border-0 shadow-lg bg-gradient-to-br from-white to-gray-50">
          <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-t-xl">
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Rendimiento de Campañas
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-64 bg-gradient-to-br from-gray-50 to-indigo-50 rounded-xl flex items-center justify-center border-2 border-dashed border-indigo-200">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <p className="text-gray-600 font-medium">Gráfico de líneas próximamente</p>
                <p className="text-sm text-gray-500 mt-1">Análisis detallado de rendimiento</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover border-0 shadow-lg bg-gradient-to-br from-white to-gray-50">
          <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-t-xl">
            <CardTitle className="flex items-center">
              <MessageSquare className="w-5 h-5 mr-2" />
              Canales de Comunicación
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-64 bg-gradient-to-br from-gray-50 to-green-50 rounded-xl flex items-center justify-center border-2 border-dashed border-green-200">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-8 h-8 text-white" />
                </div>
                <p className="text-gray-600 font-medium">Gráfico de pastel próximamente</p>
                <p className="text-sm text-gray-500 mt-1">Distribución por canales</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="card-hover border-0 shadow-lg bg-gradient-to-br from-white to-purple-50">
          <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-xl">
            <CardTitle className="flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Top Campañas por Apertura
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[
                { name: 'Promoción Verano', rate: '45.2%', change: '+12%' },
                { name: 'Bienvenida Nuevos', rate: '38.7%', change: '+8%' },
                { name: 'Newsletter Semanal', rate: '32.1%', change: '-3%' },
                { name: 'Recordatorio Evento', rate: '28.9%', change: '+5%' }
              ].map((campaign, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-white to-purple-50 rounded-xl border border-purple-100 hover:shadow-md transition-all duration-300">
                  <div>
                    <p className="font-semibold text-gray-900">{campaign.name}</p>
                    <p className="text-sm text-gray-600">Tasa de apertura: {campaign.rate}</p>
                  </div>
                  <div className={`text-sm font-bold px-3 py-1 rounded-full ${
                    campaign.change.startsWith('+') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {campaign.change}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover border-0 shadow-lg bg-gradient-to-br from-white to-blue-50">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-t-xl">
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Fuentes de Leads
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[
                { source: 'Sitio Web', count: 156, percentage: 45, color: 'bg-blue-500' },
                { source: 'Redes Sociales', count: 89, percentage: 26, color: 'bg-purple-500' },
                { source: 'Email Marketing', count: 67, percentage: 19, color: 'bg-green-500' },
                { source: 'Referidos', count: 34, percentage: 10, color: 'bg-orange-500' }
              ].map((source, index) => (
                <div key={index} className="space-y-3 p-3 bg-gradient-to-r from-white to-blue-50 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-800">{source.source}</span>
                    <span className="text-sm font-bold text-gray-600">{source.count} leads</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div 
                      className={`${source.color} h-3 rounded-full transition-all duration-500 ease-out`}
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
