
import React, { useState } from 'react';
import { Plus, Smartphone, Wifi, WifiOff, RefreshCw, Trash2, Sparkles, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CreateConnectionForm } from '@/components/whatsapp/CreateConnectionForm';
import { QRCodeModal } from '@/components/whatsapp/QRCodeModal';
import { useWhatsAppConnections } from '@/hooks/useWhatsAppConnections';

export const WhatsAppConnections: React.FC = () => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedConnection, setSelectedConnection] = useState<string | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  
  const { connections, isLoading, checkConnectionStatus, deleteConnection } = useWhatsAppConnections();

  const handleConnectQR = async (connectionId: string) => {
    setSelectedConnection(connectionId);
    setShowQRModal(true);
  };

  const handleVerifyConnection = async (connectionId: string) => {
    await checkConnectionStatus.mutateAsync(connectionId);
  };

  const handleDeleteConnection = async (connectionId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta conexión?')) {
      await deleteConnection.mutateAsync(connectionId);
    }
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
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando conexiones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Section */}
      <div className="relative">
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <Smartphone className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">Conexiones WhatsApp</h1>
                <p className="text-indigo-100 text-lg">Gestiona tus conexiones de WhatsApp Business</p>
                <div className="flex items-center mt-2 space-x-4">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                    <span className="text-sm text-indigo-100">Sistema activo</span>
                  </div>
                  <div className="flex items-center">
                    <Zap className="w-4 h-4 text-yellow-300 mr-1" />
                    <span className="text-sm text-indigo-100">Conexión segura</span>
                  </div>
                </div>
              </div>
            </div>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="bg-white text-indigo-600 hover:bg-gray-100 font-semibold px-6">
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
        </div>
      </div>

      {/* Connections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {connections.map((connection) => (
          <div
            key={connection.id}
            className="card-hover bg-white rounded-xl border-0 shadow-lg p-6 bg-gradient-to-br from-white to-gray-50"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-4 h-4 rounded-full shadow-sm" 
                  style={{ backgroundColor: connection.color }}
                ></div>
                <h3 className="font-bold text-gray-900 text-lg">{connection.name}</h3>
              </div>
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-white" />
              </div>
            </div>
            
            <div className="flex items-center space-x-3 mb-6 p-3 bg-gray-50 rounded-xl">
              {getStatusIcon(connection.status)}
              <span className={`text-sm font-semibold ${
                connection.status === 'connected' ? 'text-green-600' : 'text-red-600'
              }`}>
                {getStatusText(connection.status)}
              </span>
              {connection.status === 'connected' && (
                <div className="ml-auto flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                </div>
              )}
            </div>

            <div className="space-y-3">
              {connection.status !== 'connected' && (
                <Button
                  onClick={() => handleConnectQR(connection.id)}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-medium"
                >
                  <Smartphone className="w-4 h-4 mr-2" />
                  Conectar con Código QR
                </Button>
              )}

              <Button
                onClick={() => handleVerifyConnection(connection.id)}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-medium"
                disabled={checkConnectionStatus.isPending}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${checkConnectionStatus.isPending ? 'animate-spin' : ''}`} />
                Verificar Conexión
              </Button>

              <Button
                onClick={() => handleDeleteConnection(connection.id)}
                className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-medium"
                disabled={deleteConnection.isPending}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {deleteConnection.isPending ? 'Eliminando...' : 'Eliminar Instancia'}
              </Button>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center text-xs text-gray-500">
                <Sparkles className="w-3 h-3 mr-1" />
                Creada: {new Date(connection.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}

        {connections.length === 0 && (
          <div className="col-span-full">
            <div className="card-hover bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-12 text-center border-2 border-dashed border-indigo-200">
              <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Smartphone className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                No hay conexiones de WhatsApp
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Crea tu primera conexión para empezar a usar WhatsApp Business y automatizar tus conversaciones
              </p>
              <div className="flex items-center justify-center space-x-2 mb-6">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                <span className="text-sm text-indigo-600 font-medium">Conexión segura y confiable</span>
              </div>
              <Button 
                onClick={() => setShowCreateDialog(true)}
                className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold px-8"
              >
                <Plus className="w-4 h-4 mr-2" />
                Crear Primera Conexión
              </Button>
            </div>
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
