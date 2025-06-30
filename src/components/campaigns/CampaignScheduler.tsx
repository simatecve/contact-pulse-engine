
import React, { useState } from 'react';
import { Calendar, Clock, Send, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useCampaignScheduling } from '@/hooks/useCampaignScheduling';
import { useCampaigns } from '@/hooks/useCampaigns';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface CampaignSchedulerProps {
  campaignId?: string;
}

export const CampaignScheduler: React.FC<CampaignSchedulerProps> = ({ campaignId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(campaignId || '');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [timezone, setTimezone] = useState('America/Mexico_City');

  const { campaigns } = useCampaigns();
  const { schedules, scheduleCampaign, cancelSchedule, reschedule } = useCampaignScheduling();

  const timezones = [
    { value: 'America/Mexico_City', label: 'México (GMT-6)' },
    { value: 'America/New_York', label: 'Nueva York (GMT-5)' },
    { value: 'America/Los_Angeles', label: 'Los Ángeles (GMT-8)' },
    { value: 'Europe/Madrid', label: 'Madrid (GMT+1)' },
    { value: 'UTC', label: 'UTC (GMT+0)' }
  ];

  const handleSchedule = async () => {
    if (!selectedCampaign || !scheduledDate || !scheduledTime) return;

    const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
    
    await scheduleCampaign.mutateAsync({
      campaign_id: selectedCampaign,
      scheduled_at: scheduledDateTime.toISOString(),
      timezone
    });

    setIsOpen(false);
    setSelectedCampaign('');
    setScheduledDate('');
    setScheduledTime('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'sent':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Programación de Campañas</h2>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Calendar className="h-4 w-4 mr-2" />
              Programar Campaña
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Programar Campaña</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="campaign">Campaña</Label>
                <Select 
                  value={selectedCampaign} 
                  onValueChange={setSelectedCampaign}
                  disabled={!!campaignId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar campaña" />
                  </SelectTrigger>
                  <SelectContent>
                    {campaigns?.map((campaign) => (
                      <SelectItem key={campaign.id} value={campaign.id}>
                        {campaign.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Fecha</Label>
                  <Input
                    id="date"
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <Label htmlFor="time">Hora</Label>
                  <Input
                    id="time"
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="timezone">Zona Horaria</Label>
                <Select value={timezone} onValueChange={setTimezone}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timezones.map((tz) => (
                      <SelectItem key={tz.value} value={tz.value}>
                        {tz.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={handleSchedule}
                  disabled={!selectedCampaign || !scheduledDate || !scheduledTime || scheduleCampaign.isPending}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Programar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de campañas programadas */}
      <div className="grid gap-4">
        {schedules.map((schedule) => (
          <Card key={schedule.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-medium">
                    {campaigns?.find(c => c.id === schedule.campaign_id)?.name || 'Campaña'}
                  </h3>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(schedule.scheduled_at), 'dd/MM/yyyy', { locale: es })}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {format(new Date(schedule.scheduled_at), 'HH:mm')}
                    </div>
                    <span className="text-xs">
                      {schedule.timezone}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(schedule.status)}`}>
                    {schedule.status === 'scheduled' && 'Programada'}
                    {schedule.status === 'sent' && 'Enviada'}
                    {schedule.status === 'cancelled' && 'Cancelada'}
                    {schedule.status === 'failed' && 'Fallida'}
                  </span>
                  
                  {schedule.status === 'scheduled' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => cancelSchedule.mutate(schedule.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
              
              {schedule.error_message && (
                <div className="mt-2 p-2 bg-red-50 text-red-700 text-sm rounded">
                  Error: {schedule.error_message}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {schedules.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">No hay campañas programadas</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
