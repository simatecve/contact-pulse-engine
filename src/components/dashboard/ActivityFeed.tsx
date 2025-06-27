
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Users, Send, TrendingUp } from 'lucide-react';

const activities = [
  {
    id: 1,
    type: 'message',
    description: 'Nuevo mensaje de Juan Pérez',
    time: 'Hace 2 minutos',
    icon: MessageSquare,
    color: 'text-blue-600 bg-blue-50'
  },
  {
    id: 2,
    type: 'lead',
    description: 'Nuevo lead capturado: María González',
    time: 'Hace 15 minutos',
    icon: Users,
    color: 'text-green-600 bg-green-50'
  },
  {
    id: 3,
    type: 'campaign',
    description: 'Campaña "Promo Verano" enviada a 1,250 contactos',
    time: 'Hace 1 hora',
    icon: Send,
    color: 'text-purple-600 bg-purple-50'
  },
  {
    id: 4,
    type: 'analytics',
    description: 'Tasa de apertura mejoró 15% esta semana',
    time: 'Hace 2 horas',
    icon: TrendingUp,
    color: 'text-orange-600 bg-orange-50'
  }
];

export const ActivityFeed: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Actividad Reciente</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${activity.color}`}>
                <activity.icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                <p className="text-xs text-gray-500">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
