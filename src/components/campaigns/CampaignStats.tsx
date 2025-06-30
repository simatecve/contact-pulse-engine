
import React from 'react';
import { Send, MessageSquare, Eye, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useCampaigns } from '@/hooks/useCampaigns';

export const CampaignStats: React.FC = () => {
  const { campaigns } = useCampaigns();

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

  return (
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
  );
};
