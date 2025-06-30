
import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNotifications } from '@/hooks/useNotifications';

interface NotificationPreferencesProps {
  onClose: () => void;
}

export const NotificationPreferences: React.FC<NotificationPreferencesProps> = ({ onClose }) => {
  const { preferences, sounds, updatePreferences, requestNotificationPermission } = useNotifications();

  const handlePreferenceChange = (key: string, value: boolean | string) => {
    updatePreferences.mutate({
      ...preferences,
      [key]: value
    });
  };

  const handleCategoryChange = (category: string, enabled: boolean) => {
    const newCategories = {
      ...preferences?.notification_categories,
      [category]: enabled
    };
    
    updatePreferences.mutate({
      ...preferences,
      notification_categories: newCategories
    });
  };

  const handleRequestPermission = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      handlePreferenceChange('push_notifications', true);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Preferencias de Notificación</span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Notificaciones Push */}
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="push-notifications">Notificaciones Push</Label>
              <p className="text-sm text-gray-500">
                Recibir notificaciones en el navegador
              </p>
            </div>
            <Switch
              id="push-notifications"
              checked={preferences?.push_notifications || false}
              onCheckedChange={(checked) => {
                if (checked) {
                  handleRequestPermission();
                } else {
                  handlePreferenceChange('push_notifications', false);
                }
              }}
            />
          </div>

          {/* Notificaciones por Email */}
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="email-notifications">Notificaciones por Email</Label>
              <p className="text-sm text-gray-500">
                Recibir notificaciones importantes por email
              </p>
            </div>
            <Switch
              id="email-notifications"
              checked={preferences?.email_notifications || false}
              onCheckedChange={(checked) => handlePreferenceChange('email_notifications', checked)}
            />
          </div>

          {/* Sonidos */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="sound-enabled">Sonidos</Label>
                <p className="text-sm text-gray-500">
                  Reproducir sonidos para notificaciones
                </p>
              </div>
              <Switch
                id="sound-enabled"
                checked={preferences?.sound_enabled || false}
                onCheckedChange={(checked) => handlePreferenceChange('sound_enabled', checked)}
              />
            </div>

            {preferences?.sound_enabled && (
              <div>
                <Label htmlFor="sound-type">Tipo de Sonido</Label>
                <Select
                  value={preferences?.sound_type || 'default'}
                  onValueChange={(value) => handlePreferenceChange('sound_type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar sonido" />
                  </SelectTrigger>
                  <SelectContent>
                    {sounds.map((sound) => (
                      <SelectItem key={sound.id} value={sound.name.toLowerCase()}>
                        {sound.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Categorías */}
          <div className="space-y-3">
            <Label>Categorías de Notificación</Label>
            <div className="space-y-2">
              {[
                { key: 'general', label: 'General' },
                { key: 'message', label: 'Mensajes' },
                { key: 'campaign', label: 'Campañas' },
                { key: 'system', label: 'Sistema' }
              ].map((category) => (
                <div key={category.key} className="flex items-center justify-between">
                  <Label htmlFor={`category-${category.key}`}>
                    {category.label}
                  </Label>
                  <Switch
                    id={`category-${category.key}`}
                    checked={preferences?.notification_categories?.[category.key] || false}
                    onCheckedChange={(checked) => handleCategoryChange(category.key, checked)}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={onClose}>
              Cerrar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
