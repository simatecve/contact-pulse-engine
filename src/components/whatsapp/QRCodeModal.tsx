
import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useWhatsAppConnections } from '@/hooks/useWhatsAppConnections';
import { RefreshCw, AlertTriangle } from 'lucide-react';

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
  const { connections, markAsConnected, getQRCode, getQRFromState, isQRLoading } = useWhatsAppConnections();
  const [hasRequestedQR, setHasRequestedQR] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const connection = connections.find(c => c.id === connectionId);
  const qrCode = connectionId ? getQRFromState(connectionId) : null;
  const isLoading = connectionId ? isQRLoading(connectionId) : false;

  // Solicitar código QR automáticamente cuando se abre el modal (solo una vez)
  useEffect(() => {
    if (open && connectionId && !hasRequestedQR && !qrCode && !isLoading && !error) {
      console.log('Modal abierto, solicitando código QR para:', connectionId);
      setHasRequestedQR(true);
      setError(null);
      
      getQRCode.mutateAsync(connectionId).catch(error => {
        console.error('Error al obtener QR automáticamente:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        setError(errorMessage);
        setHasRequestedQR(false); // Allow retry
      });
    }
  }, [open, connectionId, hasRequestedQR, qrCode, isLoading, error]);

  // Resetear el estado cuando se cierra el modal
  useEffect(() => {
    if (!open) {
      setHasRequestedQR(false);
      setError(null);
    }
  }, [open]);

  const handleConnected = async () => {
    if (connectionId) {
      await markAsConnected.mutateAsync(connectionId);
      onOpenChange(false);
    }
  };

  const handleRefreshQR = async () => {
    if (connectionId) {
      setHasRequestedQR(true);
      setError(null);
      
      try {
        await getQRCode.mutateAsync(connectionId);
      } catch (error) {
        console.error('Error al refrescar QR:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        setError(errorMessage);
        setHasRequestedQR(false);
      }
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

  const isCircuitBreakerError = error?.includes('Circuit breaker is open');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" aria-describedby="qr-modal-description">
        <DialogHeader>
          <DialogTitle>Conectar WhatsApp</DialogTitle>
          <DialogDescription id="qr-modal-description">
            Escanea el código QR con tu WhatsApp para conectar la instancia "{connection?.name}"
          </DialogDescription>
        </DialogHeader>
        
        <div className="text-center space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center justify-center space-x-2 text-red-700 mb-2">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-medium">Error al obtener código QR</span>
              </div>
              <p className="text-sm text-red-600 mb-3">{error}</p>
              {isCircuitBreakerError && (
                <p className="text-xs text-red-500">
                  El sistema ha detectado demasiados intentos fallidos. Por favor espera 30 segundos antes de intentar nuevamente.
                </p>
              )}
            </div>
          )}
          
          {qrImageSrc ? (
            <div className="space-y-4">
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
              
              <Button 
                onClick={handleRefreshQR}
                variant="outline"
                size="sm"
                disabled={isLoading || isCircuitBreakerError}
                className="w-full"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Actualizar QR
              </Button>
            </div>
          ) : (
            <div className="flex justify-center items-center w-64 h-64 mx-auto border-2 border-dashed border-gray-300 rounded-lg">
              <div className="text-center">
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-sm text-gray-500">Generando código QR...</p>
                  </>
                ) : error ? (
                  <>
                    <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 mb-4">
                      No se pudo obtener el código QR
                    </p>
                    <Button 
                      onClick={handleRefreshQR}
                      variant="outline"
                      size="sm"
                      disabled={isLoading || isCircuitBreakerError}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      {isCircuitBreakerError ? 'Espera 30s...' : 'Intentar nuevamente'}
                    </Button>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-gray-500 mb-4">
                      Preparando código QR...
                    </p>
                  </>
                )}
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
