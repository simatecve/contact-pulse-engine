
import React, { useState } from 'react';
import { Plus, Smartphone, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CreateConnectionForm } from '@/components/whatsapp/CreateConnectionForm';
import { QRCodeModal } from '@/components/whatsapp/QRCodeModal';
import { useWhatsAppConnections } from '@/hooks/useWhatsAppConnections';

export const WhatsAppConnections: React.FC = () => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedConnection, setSelectedConnection] = useState<string | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  
  const { connections, isLoading, checkConnectionStatus } = useWhatsAppConnections();

  const handleConnectQR = async (connectionId: string) => {
    setSelectedConnection(connectionId);
    setShowQRModal(true);
    // Ya no llamamos getQRCode aquí, se hace automáticamente en el modal
  };

  const handleVerifyConnection = async (connectionId: string) => {
    await checkConnectionStatus.mutateAsync(connectionId);
  };

  const getStatusIcon = (status: string) => {
    return status === 'connected' ? (
      <Wifi className="w-4 h-4 text-green-600" />
    ) : (
      <WifiOff className="w-4 h-4 text-red-600" />
    );
  };

  const getStatusText = (status: string) => {
    return status === 'connected' ? 'Conectado' : 'Desconectado';
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Cargando conexiones...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Conexiones WhatsApp</h1>
          <p className="text-gray-600 mt-1">Gestiona tus conexiones de WhatsApp Business</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nueva Conexión
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Nueva Conexión</DialogTitle>
            </DialogHeader>
            <CreateConnectionForm onSuccess={() => setShowCreateDialog(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Connections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {connections.map((connection) => (
          <div
            key={connection.id}
            className="bg-white rounded-lg border shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: connection.color }}
                ></div>
                <h3 className="font-semibold text-gray-900">{connection.name}</h3>
              </div>
              <Smartphone className="w-5 h-5 text-gray-400" />
            </div>
            
            <div className="flex items-center space-x-2 mb-4">
              {getStatusIcon(connection.status)}
              <span className={`text-sm font-medium ${
                connection.status === 'connected' ? 'text-green-600' : 'text-red-600'
              }`}>
                {getStatusText(connection.status)}
              </span>
            </div>

            <div className="space-y-2">
              {connection.status !== 'connected' && (
                <Button
                  onClick={() => handleConnectQR(connection.id)}
                  className="w-full"
                  variant="outline"
                >
                  Conectar con Código QR
                </Button>
              )}

              <Button
                onClick={() => handleVerifyConnection(connection.id)}
                className="w-full"
                variant="secondary"
                disabled={checkConnectionStatus.isPending}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${checkConnectionStatus.isPending ? 'animate-spin' : ''}`} />
                Verificar Conexión
              </Button>
            </div>

            <div className="mt-3 text-xs text-gray-500">
              Creada: {new Date(connection.created_at).toLocaleDateString()}
            </div>
          </div>
        ))}

        {connections.length === 0 && (
          <div className="col-span-full text-center py-12">
            <Smartphone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay conexiones de WhatsApp
            </h3>
            <p className="text-gray-600 mb-4">
              Crea tu primera conexión para empezar a usar WhatsApp Business
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Crear Primera Conexión
            </Button>
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      <QRCodeModal
        open={showQRModal}
        onOpenChange={setShowQRModal}
        connectionId={selectedConnection}
      />
    </div>
  );
};
