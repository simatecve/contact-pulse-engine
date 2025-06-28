
import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useWhatsAppConnections } from '@/hooks/useWhatsAppConnections';

interface QRCodeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  connectionId: string | null;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({ 
  open, 
  onOpenChange, 
  connectionId 
}) => {
  const { connections, markAsConnected, getQRCode, getQRFromState } = useWhatsAppConnections();
  
  const connection = connections.find(c => c.id === connectionId);
  const qrCode = connectionId ? getQRFromState(connectionId) : null;

  // Solicitar código QR automáticamente cuando se abre el modal
  useEffect(() => {
    if (open && connectionId && !getQRCode.isPending) {
      console.log('Modal abierto, solicitando código QR para:', connectionId);
      getQRCode.mutateAsync(connectionId).catch(error => {
        console.error('Error al obtener QR automáticamente:', error);
      });
    }
  }, [open, connectionId, getQRCode]);

  const handleConnected = async () => {
    if (connectionId) {
      await markAsConnected.mutateAsync(connectionId);
      onOpenChange(false);
    }
  };

  const getQRImageSrc = (qrCode: string) => {
    console.log('Procesando QR para mostrar:', qrCode ? qrCode.substring(0, 50) + '...' : 'null');
    
    if (!qrCode) return null;

    // Si ya tiene el prefijo data:image, usarlo directamente  
    if (qrCode.startsWith('data:image/')) {
      return qrCode;
    }
    
    // Si es solo base64, agregar el prefijo
    if (qrCode.match(/^[A-Za-z0-9+/=]+$/)) {
      return `data:image/png;base64,${qrCode}`;
    }
    
    // Para cualquier otro formato, intentar usarlo directamente
    return qrCode;
  };

  const qrImageSrc = qrCode ? getQRImageSrc(qrCode) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Conectar WhatsApp</DialogTitle>
        </DialogHeader>
        
        <div className="text-center space-y-4">
          <p className="text-gray-600">
            Escanea el código QR con tu WhatsApp para conectar
          </p>
          
          {qrImageSrc ? (
            <div className="flex justify-center">
              <img 
                src={qrImageSrc}
                alt="Código QR de WhatsApp" 
                className="w-64 h-64 border rounded-lg"
                onError={(e) => {
                  console.error('Error al cargar imagen QR:', e);
                  console.log('URL de imagen que falló:', qrImageSrc);
                }}
                onLoad={() => {
                  console.log('Imagen QR cargada correctamente');
                }}
              />
            </div>
          ) : (
            <div className="flex justify-center items-center w-64 h-64 mx-auto border-2 border-dashed border-gray-300 rounded-lg">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-sm text-gray-500">
                  {getQRCode.isPending ? 'Generando código QR...' : 'Obteniendo código QR...'}
                </p>
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <p className="text-sm text-gray-500">
              1. Abre WhatsApp en tu teléfono
            </p>
            <p className="text-sm text-gray-500">
              2. Ve a Configuración → Dispositivos conectados
            </p>
            <p className="text-sm text-gray-500">
              3. Toca "Conectar un dispositivo" y escanea este código
            </p>
          </div>
          
          <Button 
            onClick={handleConnected} 
            className="w-full"
            disabled={markAsConnected.isPending}
          >
            {markAsConnected.isPending ? 'Verificando...' : 'Ya conecté mi WhatsApp'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
