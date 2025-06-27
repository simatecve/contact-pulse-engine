
import React from 'react';
import { Plus, MoreVertical, Play, Pause, Trash2, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Campaign } from '@/hooks/useCampaigns';
import { getStatusColor, getStatusText } from '@/utils/campaignUtils';

interface CampaignTableProps {
  campaigns: Campaign[];
  onShowCreateDialog: () => void;
  onDeleteCampaign: (id: string) => void;
  onStartCampaign: (id: string) => void;
  onPauseCampaign: (id: string) => void;
}

export const CampaignTable: React.FC<CampaignTableProps> = ({
  campaigns,
  onShowCreateDialog,
  onDeleteCampaign,
  onStartCampaign,
  onPauseCampaign
}) => {
  return (
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
              <Button onClick={onShowCreateDialog}>
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
                          <DropdownMenuItem onClick={() => onStartCampaign(campaign.id)}>
                            <Play className="w-4 h-4 mr-2" />
                            Iniciar
                          </DropdownMenuItem>
                        )}
                        {campaign.status === 'active' && (
                          <DropdownMenuItem onClick={() => onPauseCampaign(campaign.id)}>
                            <Pause className="w-4 h-4 mr-2" />
                            Pausar
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem 
                          onClick={() => onDeleteCampaign(campaign.id)}
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
  );
};
