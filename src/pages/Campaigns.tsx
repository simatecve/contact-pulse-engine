
import React from 'react';
import { Plus, Send, Eye, MoreVertical, Users, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const campaigns = [
  {
    id: 1,
    name: 'Promoción Verano 2024',
    type: 'email',
    status: 'active',
    sent: 1250,
    opened: 425,
    clicked: 89,
    date: '2024-01-15',
    openRate: '34%',
    clickRate: '7.1%'
  },
  {
    id: 2,
    name: 'Bienvenida Nuevos Clientes',
    type: 'whatsapp',
    status: 'completed',
    sent: 89,
    opened: 76,
    clicked: 23,
    date: '2024-01-14',
    openRate: '85%',
    clickRate: '26%'
  },
  {
    id: 3,
    name: 'Recordatorio Webinar',
    type: 'email',
    status: 'draft',
    sent: 0,
    opened: 0,
    clicked: 0,
    date: '2024-01-16',
    openRate: '-',
    clickRate: '-'
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-800';
    case 'completed': return 'bg-blue-100 text-blue-800';
    case 'draft': return 'bg-yellow-100 text-yellow-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'active': return 'Activa';
    case 'completed': return 'Completada';
    case 'draft': return 'Borrador';
    default: return status;
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'email': return 'bg-purple-100 text-purple-800';
    case 'whatsapp': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const Campaigns: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Campañas</h1>
          <p className="text-gray-600 mt-1">Gestiona tus campañas de marketing multicanal</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Nueva Campaña
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Campañas Activas</p>
                <p className="text-2xl font-bold text-gray-900">8</p>
              </div>
              <div className="h-12 w-12 bg-green-50 rounded-lg flex items-center justify-center">
                <Send className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Mensajes Enviados</p>
                <p className="text-2xl font-bold text-gray-900">12,456</p>
              </div>
              <div className="h-12 w-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <Mail className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tasa de Apertura</p>
                <p className="text-2xl font-bold text-gray-900">42.3%</p>
              </div>
              <div className="h-12 w-12 bg-purple-50 rounded-lg flex items-center justify-center">
                <Eye className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Contactos Alcanzados</p>
                <p className="text-2xl font-bold text-gray-900">3,892</p>
              </div>
              <div className="h-12 w-12 bg-yellow-50 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Campañas</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Enviados</TableHead>
                <TableHead>Abiertos</TableHead>
                <TableHead>Clics</TableHead>
                <TableHead>Tasa Apertura</TableHead>
                <TableHead>Tasa Clics</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-gray-900">{campaign.name}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getTypeColor(campaign.type)}>
                      {campaign.type === 'email' ? 'Email' : 'WhatsApp'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(campaign.status)}>
                      {getStatusText(campaign.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>{campaign.sent.toLocaleString()}</TableCell>
                  <TableCell>{campaign.opened.toLocaleString()}</TableCell>
                  <TableCell>{campaign.clicked.toLocaleString()}</TableCell>
                  <TableCell>{campaign.openRate}</TableCell>
                  <TableCell>{campaign.clickRate}</TableCell>
                  <TableCell>{campaign.date}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                <Mail className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Campaña de Email</h3>
                <p className="text-sm text-gray-600">Crea una nueva campaña de email marketing</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <Send className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Campaña WhatsApp</h3>
                <p className="text-sm text-gray-600">Envía mensajes masivos por WhatsApp</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
