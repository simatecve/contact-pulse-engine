
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, BarChart3, FlaskConical } from 'lucide-react';
import { CampaignTable } from '@/components/campaigns/CampaignTable';
import { CampaignForm } from '@/components/campaigns/CampaignForm';
import { CampaignStats } from '@/components/campaigns/CampaignStats';
import { CampaignScheduler } from '@/components/campaigns/CampaignScheduler';
import { CampaignAnalytics } from '@/components/campaigns/CampaignAnalytics';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export const Campaigns = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('campaigns');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Campañas</h1>
          <p className="text-muted-foreground">
            Gestiona tus campañas de marketing y programación
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Campaña
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Crear Nueva Campaña</DialogTitle>
            </DialogHeader>
            <CampaignForm onSuccess={() => setIsCreateDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <CampaignStats />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="campaigns" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Campañas
          </TabsTrigger>
          <TabsTrigger value="scheduling" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Programación
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="ab-testing" className="flex items-center gap-2">
            <FlaskConical className="h-4 w-4" />
            A/B Testing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="space-y-4">
          <CampaignTable onShowCreateDialog={() => setIsCreateDialogOpen(true)} />
        </TabsContent>

        <TabsContent value="scheduling" className="space-y-4">
          <CampaignScheduler />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <CampaignAnalytics />
        </TabsContent>

        <TabsContent value="ab-testing" className="space-y-4">
          <Card>
            <CardContent className="text-center py-8">
              <FlaskConical className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium mb-2">Próximamente: A/B Testing</h3>
              <p className="text-gray-500 mb-4">
                Prueba diferentes versiones de tus mensajes para optimizar el rendimiento
              </p>
              <Button variant="outline" disabled>
                Crear Prueba A/B
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
