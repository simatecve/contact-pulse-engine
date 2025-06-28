
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CampaignForm } from '@/components/campaigns/CampaignForm';
import { CampaignStats } from '@/components/campaigns/CampaignStats';
import { CampaignTable } from '@/components/campaigns/CampaignTable';
import { useCampaigns } from '@/hooks/useCampaigns';

export const Campaigns: React.FC = () => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { campaigns, isLoading, deleteCampaign, startCampaign, updateCampaign, sendCampaign } = useCampaigns();

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

  const handleSendCampaign = async (id: string) => {
    await sendCampaign.mutateAsync(id);
  };

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
      <CampaignStats campaigns={campaigns} />

      {/* Campaigns Table */}
      <CampaignTable
        campaigns={campaigns}
        onShowCreateDialog={() => setShowCreateDialog(true)}
        onDeleteCampaign={handleDeleteCampaign}
        onStartCampaign={handleStartCampaign}
        onPauseCampaign={handlePauseCampaign}
        onSendCampaign={handleSendCampaign}
      />
    </div>
  );
};
