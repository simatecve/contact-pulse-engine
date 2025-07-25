
import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useWhatsAppConnections } from '@/hooks/useWhatsAppConnections';
import { RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';

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
  const [retryCount, setRetryCount] = useState(0);
  const [imageError, setImageError] = useState(false);
  
  const connection = connections.find(c => c.id === connectionId);
  const qrCode = connectionId ? getQRFromState(connectionId) : null;
  const isLoading = connectionId ? isQRLoading(connectionId) : false;

  console.log('🔄 QRCodeModal render:', { 
    open, 
    connectionId, 
    hasQRCode: !!qrCode, 
    isLoading,
    connectionName: connection?.name,
    qrCodeLength: qrCode?.length,
    qrCodePreview: qrCode?.substring(0, 50),
    retryCount,
    imageError
  });

  // Función simplificada para validar base64
  const isValidQRCode = (base64String: string): boolean => {
    if (!base64String || typeof base64String !== 'string') {
      console.log('❌ QR Code inválido: no es string o está vacío');
      return false;
    }

    // Debe comenzar con data:image y contener base64
    const isValid = base64String.startsWith('data:image/') && 
                   base64String.includes('base64,') && 
                   base64String.length > 100;

    console.log('🧪 Validación QR:', {
      startsWithData: base64String.startsWith('data:image/'),
      includesBase64: base64String.includes('base64,'),
      length: base64String.length,
      isValid
    });

    return isValid;
  };

  // Resetear error de imagen cuando cambia el QR
  useEffect(() => {
    if (qrCode) {
      setImageError(false);
    }
  }, [qrCode]);

  // Solicitar código QR automáticamente cuando se abre el modal
  useEffect(() => {
    if (open && connectionId && !hasRequestedQR && !qrCode && !isLoading && !error) {
      console.log('🚀 Modal abierto - solicitando código QR automáticamente para:', connectionId);
      setHasRequestedQR(true);
      setError(null);
      setRetryCount(0);
      
      getQRCode.mutateAsync(connectionId).catch(error => {
        console.error('❌ Error al obtener QR automáticamente:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        setError(errorMessage);
        setHasRequestedQR(false);
      });
    }
  }, [open, connectionId, hasRequestedQR, qrCode, isLoading, error, getQRCode]);

  // Resetear el estado cuando se cierra el modal
  useEffect(() => {
    if (!open) {
      setHasRequestedQR(false);
      setError(null);
      setRetryCount(0);
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
      console.log('🔄 Refrescando QR manualmente para:', connectionId, 'Intento:', retryCount + 1);
      setHasRequestedQR(true);
      setError(null);
      setImageError(false);
      setRetryCount(prev => prev + 1);
      
      try {
        await getQRCode.mutateAsync(connectionId);
      } catch (error) {
        console.error('❌ Error al refrescar QR:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        setError(errorMessage);
        setHasRequestedQR(false);
      }
    }
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.error('❌ Error al cargar imagen QR:', e);
    if (qrCode) {
      console.log('🔍 QR Code que falló:', {
        length: qrCode.length,
        startsWithData: qrCode.startsWith('data:'),
        preview: qrCode.substring(0, 200)
      });
    }
    setImageError(true);
  };

  const handleImageLoad = () => {
    console.log('✅ Imagen QR cargada correctamente');
    setImageError(false);
  };

  const isCircuitBreakerError = error?.includes('Circuit breaker is open');
  const isGeneratingError = error?.includes('se está generando');

  // Solo usar el QR si es válido
  const validQRCode = qrCode && isValidQRCode(qrCode) ? qrCode : null;

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
            <div className={`border rounded-lg p-4 ${
              isGeneratingError 
                ? 'bg-blue-50 border-blue-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className={`flex items-center justify-center space-x-2 mb-2 ${
                isGeneratingError ? 'text-blue-700' : 'text-red-700'
              }`}>
                <AlertTriangle className="w-5 h-5" />
                <span className="font-medium">
                  {isGeneratingError ? 'QR en proceso' : 'Error al obtener código QR'}
                </span>
              </div>
              <p className={`text-sm mb-3 ${
                isGeneratingError ? 'text-blue-600' : 'text-red-600'
              }`}>
                {error}
              </p>
              {isCircuitBreakerError && (
                <p className="text-xs text-red-500">
                  El sistema ha detectado demasiados intentos fallidos. Por favor espera 30 segundos antes de intentar nuevamente.
                </p>
              )}
              {retryCount > 0 && !isCircuitBreakerError && (
                <p className="text-xs text-gray-500">
                  Intentos: {retryCount}
                </p>
              )}
            </div>
          )}
          
          {/* Mostrar QR si está disponible y es válido */}
          {validQRCode && !imageError && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="relative">
                  <img 
                    src={validQRCode}
                    alt="Código QR de WhatsApp" 
                    className="w-64 h-64 border rounded-lg shadow-md bg-white p-2"
                    onError={handleImageError}
                    onLoad={handleImageLoad}
                    style={{ imageRendering: 'pixelated' }}
                  />
                </div>
              </div>
              
              {/* Success indicator */}
              <div className="flex items-center justify-center space-x-2 text-green-600 bg-green-50 rounded-lg p-3">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm font-medium">
                  Código QR generado correctamente
                </span>
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
          )}

          {/* Mostrar error de imagen si falla la carga */}
          {validQRCode && imageError && (
            <div className="space-y-4">
              <div className="flex justify-center items-center w-64 h-64 mx-auto border-2 border-dashed border-red-300 rounded-lg bg-red-50">
                <div className="text-center">
                  <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                  <p className="text-sm text-red-600 mb-2">
                    Error al mostrar el código QR
                  </p>
                  <p className="text-xs text-gray-500 mb-4">
                    QR recibido pero no se pudo convertir a imagen
                  </p>
                  <Button 
                    onClick={handleRefreshQR}
                    variant="outline"
                    size="sm"
                    disabled={isLoading}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Intentar nuevamente
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Mostrar estado de carga o error cuando no hay QR válido */}
          {!validQRCode && (
            <div className="flex justify-center items-center w-64 h-64 mx-auto border-2 border-dashed border-gray-300 rounded-lg">
              <div className="text-center">
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-sm text-gray-500">Generando código QR...</p>
                    {retryCount > 0 && (
                      <p className="text-xs text-gray-400 mt-1">Intento {retryCount}</p>
                    )}
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
                      {isCircuitBreakerError ? 'Espera 30s...' : 
                       isGeneratingError ? 'Reintentar' : 'Intentar nuevamente'}
                    </Button>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-gray-500 mb-4">
                      Preparando código QR...
                    </p>
                    <Button 
                      onClick={handleRefreshQR}
                      variant="outline"
                      size="sm"
                      disabled={isLoading}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Obtener QR
                    </Button>
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
