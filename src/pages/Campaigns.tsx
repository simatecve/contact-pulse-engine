
import React, { useState } from 'react';
import { Plus, Send, Eye, MoreVertical, Users, MessageSquare, Play, Pause, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { CampaignForm } from '@/components/campaigns/CampaignForm';
import { useCampaigns } from '@/hooks/useCampaigns';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-800';
    case 'completed': return 'bg-blue-100 text-blue-800';
    case 'draft': return 'bg-yellow-100 text-yellow-800';
    case 'paused': return 'bg-orange-100 text-orange-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'active': return 'Activa';
    case 'completed': return 'Completada';
    case 'draft': return 'Borrador';
    case 'paused': return 'Pausada';
    default: return status;
  }
};

export const Campaigns: React.FC = () => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { campaigns, isLoading, deleteCampaign, startCampaign, updateCampaign } = useCampaigns();

  const handleDeleteCampaign = async (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta campaña?')) {
      await deleteCampaign.mutateAsync(id);
    }
  };

  const handleStartCampaign = async (id: string) => {
    await startCampaign.mutateAsync(id);
  };

  const handlePauseCampaign = async (id: string) => {
    await updateCampaign.mutateAsync({ id, status: 'paused' });
  };

  const calculateStats = () => {
    const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
    const totalMessages = campaigns.reduce((sum, campaign) => 
      sum + (campaign.campaign_messages?.length || 0), 0
    );
    const sentMessages = campaigns.reduce((sum, campaign) => 
      sum + (campaign.campaign_messages?.filter(m => m.status === 'sent').length || 0), 0
    );
    const openRate = totalMessages > 0 ? ((sentMessages / totalMessages) * 100).toFixed(1) : '0';
    const totalContacts = campaigns.reduce((sum, campaign) => 
      sum + (campaign.contact_lists?.contact_count || 0), 0
    );

    return { activeCampaigns, totalMessages, sentMessages, openRate, totalContacts };
  };

  const stats = calculateStats();

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Cargando campañas...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Campañas WhatsApp</h1>
          <p className="text-gray-600 mt-1">Gestiona tus campañas de marketing por WhatsApp</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nueva Campaña
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Crear Nueva Campaña</DialogTitle>
            </DialogHeader>
            <CampaignForm onSuccess={() => setShowCreateDialog(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Campañas Activas</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeCampaigns}</p>
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
                <p className="text-2xl font-bold text-gray-900">{stats.sentMessages.toLocaleString()}</p>
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
                <p className="text-sm font-medium text-gray-600">Tasa de Entrega</p>
                <p className="text-2xl font-bold text-gray-900">{stats.openRate}%</p>
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
                <p className="text-2xl font-bold text-gray-900">{stats.totalContacts.toLocaleString()}</p>
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
          {campaigns.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay campañas</h3>
              <p className="mt-1 text-sm text-gray-500">Comienza creando tu primera campaña de WhatsApp.</p>
              <div className="mt-6">
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva Campaña
                </Button>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Lista de Contactos</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Mensajes</TableHead>
                  <TableHead>IA Activa</TableHead>
                  <TableHead>Delay Máx.</TableHead>
                  <TableHead>Adjuntos</TableHead>
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
                        <p className="text-sm text-gray-500 truncate max-w-xs" title={campaign.message}>
                          {campaign.message}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{campaign.contact_lists?.name}</p>
                        <p className="text-sm text-gray-500">
                          {campaign.contact_lists?.contact_count || 0} contactos
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(campaign.status)}>
                        {getStatusText(campaign.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{campaign.campaign_messages?.length || 0}</p>
                        <p className="text-sm text-gray-500">
                          {campaign.campaign_messages?.filter(m => m.status === 'sent').length || 0} enviados
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={campaign.ai_enabled ? "default" : "secondary"}>
                        {campaign.ai_enabled ? 'Sí' : 'No'}
                      </Badge>
                    </TableCell>
                    <TableCell>{campaign.max_delay_seconds}s</TableCell>
                    <TableCell>{campaign.campaign_attachments?.length || 0}</TableCell>
                    <TableCell>{new Date(campaign.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {campaign.status === 'draft' && (
                            <DropdownMenuItem onClick={() => handleStartCampaign(campaign.id)}>
                              <Play className="w-4 h-4 mr-2" />
                              Iniciar
                            </DropdownMenuItem>
                          )}
                          {campaign.status === 'active' && (
                            <DropdownMenuItem onClick={() => handlePauseCampaign(campaign.id)}>
                              <Pause className="w-4 h-4 mr-2" />
                              Pausar
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem 
                            onClick={() => handleDeleteCampaign(campaign.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
