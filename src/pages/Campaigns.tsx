
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, BarChart3, FlaskConical, Sparkles, Send, Target, Zap } from 'lucide-react';
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
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Section */}
      <div className="relative">
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <Send className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">Campañas de Marketing</h1>
                <p className="text-indigo-100 text-lg">Gestiona tus campañas de marketing y programación</p>
                <div className="flex items-center mt-2 space-x-4">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                    <span className="text-sm text-indigo-100">Sistema activo</span>
                  </div>
                  <div className="flex items-center">
                    <Zap className="w-4 h-4 text-yellow-300 mr-1" />
                    <span className="text-sm text-indigo-100">Automatización IA</span>
                  </div>
                </div>
              </div>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-white text-indigo-600 hover:bg-gray-100 font-semibold px-6">
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
        </div>
      </div>

      <CampaignStats />

      <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-t-xl">
            <TabsList className="grid w-full grid-cols-4 bg-white/70 backdrop-blur-sm">
              <TabsTrigger value="campaigns" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-md">
                <Target className="h-4 w-4" />
                Campañas
              </TabsTrigger>
              <TabsTrigger value="scheduling" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-md">
                <Calendar className="h-4 w-4" />
                Programación
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-md">
                <BarChart3 className="h-4 w-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="ab-testing" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-md">
                <FlaskConical className="h-4 w-4" />
                A/B Testing
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="p-6">
            <TabsContent value="campaigns" className="space-y-4 mt-0">
              <CampaignTable onShowCreateDialog={() => setIsCreateDialogOpen(true)} />
            </TabsContent>

            <TabsContent value="scheduling" className="space-y-4 mt-0">
              <CampaignScheduler />
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4 mt-0">
              <CampaignAnalytics />
            </TabsContent>

            <TabsContent value="ab-testing" className="space-y-4 mt-0">
              <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-50 to-purple-50">
                <CardContent className="text-center py-12">
                  <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <FlaskConical className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Próximamente: A/B Testing</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Prueba diferentes versiones de tus mensajes para optimizar el rendimiento y maximizar conversiones
                  </p>
                  <div className="flex items-center justify-center space-x-2 mb-6">
                    <Sparkles className="w-4 h-4 text-indigo-500" />
                    <span className="text-sm text-indigo-600 font-medium">Powered by AI</span>
                  </div>
                  <Button variant="outline" disabled className="px-8">
                    Crear Prueba A/B
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </Card>
    </div>
  );
};
