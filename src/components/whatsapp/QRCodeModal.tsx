
import React from 'react';
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
  const { connections, markAsConnected } = useWhatsAppConnections();
  
  const connection = connections.find(c => c.id === connectionId);

  const handleConnected = async () => {
    if (connectionId) {
      await markAsConnected.mutateAsync(connectionId);
      onOpenChange(false);
    }
  };

  const getQRImageSrc = (qrCode: string) => {
    try {
      // Intentar parsear como JSON primero
      const parsed = JSON.parse(qrCode);
      if (parsed && parsed[0] && parsed[0].data && parsed[0].data.base64) {
        return parsed[0].data.base64;
      }
    } catch (error) {
      // Si no es JSON válido, procesar como string
    }

    // Si la respuesta viene en formato "base64:data:image/png;base64,<datos>"
    if (qrCode.startsWith('base64:data:image/png;base64,')) {
      // Extraer solo la parte después de "base64:", que ya incluye "data:image/png;base64,"
      return qrCode.substring(7); // Remueve "base64:" del inicio
    }
    // Si viene en formato "base64:data:image/" genérico
    if (qrCode.startsWith('base64:data:image/')) {
      // Extraer la parte después de "base64:"
      return qrCode.substring(7);
    }
    // Si viene en formato "base64:" genérico
    if (qrCode.startsWith('base64:')) {
      // Extraer la parte después de "base64:"
      const withoutPrefix = qrCode.substring(7);
      // Si ya tiene el prefijo data:image, usarlo directamente
      if (withoutPrefix.startsWith('data:image/')) {
        return withoutPrefix;
      }
      // Si es solo base64, agregar el prefijo
      return `data:image/png;base64,${withoutPrefix}`;
    }
    // Si ya tiene el prefijo data:image, usarlo directamente
    if (qrCode.startsWith('data:image/')) {
      return qrCode;
    }
    // Si es solo base64, agregar el prefijo
    return `data:image/png;base64,${qrCode}`;
  };

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
          
          {connection?.qr_code ? (
            <div className="flex justify-center">
              <img 
                src={getQRImageSrc(connection.qr_code)}
                alt="Código QR de WhatsApp" 
                className="w-64 h-64 border rounded-lg"
              />
            </div>
          ) : (
            <div className="flex justify-center items-center w-64 h-64 mx-auto border-2 border-dashed border-gray-300 rounded-lg">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-sm text-gray-500">Generando código QR...</p>
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
