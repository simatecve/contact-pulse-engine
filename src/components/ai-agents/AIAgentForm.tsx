
import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useWhatsAppConnections } from '@/hooks/useWhatsAppConnections';
import { AIAgent, AIAgentFormData } from '@/hooks/useAIAgents';

interface AIAgentFormProps {
  agent?: AIAgent;
  onSubmit: (data: AIAgentFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const AIAgentForm: React.FC<AIAgentFormProps> = ({
  agent,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const { connections } = useWhatsAppConnections();
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<AIAgentFormData>({
    defaultValues: {
      name: agent?.name || '',
      description: agent?.description || '',
      is_active: agent?.is_active || false,
      whatsapp_connection_id: agent?.whatsapp_connection_id || '',
      prompt_template: agent?.prompt_template || '',
      response_settings: {
        max_tokens: agent?.response_settings?.max_tokens || 150,
        temperature: agent?.response_settings?.temperature || 0.7,
      }
    }
  });

  const isActive = watch('is_active');
  const whatsappConnectionId = watch('whatsapp_connection_id');

  const handleFormSubmit = async (data: AIAgentFormData) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="name">Nombre del Agente</Label>
          <Input
            id="name"
            {...register('name', { required: 'El nombre es requerido' })}
            placeholder="Ej: Asistente de Ventas"
          />
          {errors.name && (
            <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="whatsapp_connection">Conexión WhatsApp</Label>
          <Select value={whatsappConnectionId} onValueChange={(value) => setValue('whatsapp_connection_id', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar conexión..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Sin conexión</SelectItem>
              {connections.map((connection) => (
                <SelectItem key={connection.id} value={connection.id}>
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: connection.color }}
                    />
                    <span>{connection.name}</span>
                    <span className={`text-xs ${
                      connection.status === 'connected' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      ({connection.status === 'connected' ? 'Conectado' : 'Desconectado'})
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          {...register('description')}
          placeholder="Describe la función de este agente..."
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="prompt_template">Template de Prompt</Label>
        <Textarea
          id="prompt_template"
          {...register('prompt_template')}
          placeholder="Eres un asistente especializado en..."
          rows={4}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="max_tokens">Máximo de Tokens</Label>
          <Input
            id="max_tokens"
            type="number"
            {...register('response_settings.max_tokens', { 
              valueAsNumber: true,
              min: { value: 1, message: 'Debe ser mayor a 0' },
              max: { value: 4000, message: 'Debe ser menor a 4000' }
            })}
            placeholder="150"
          />
          {errors.response_settings?.max_tokens && (
            <p className="text-sm text-red-600 mt-1">{errors.response_settings.max_tokens.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="temperature">Temperatura (0-1)</Label>
          <Input
            id="temperature"
            type="number"
            step="0.1"
            {...register('response_settings.temperature', { 
              valueAsNumber: true,
              min: { value: 0, message: 'Debe ser mayor o igual a 0' },
              max: { value: 1, message: 'Debe ser menor o igual a 1' }
            })}
            placeholder="0.7"
          />
          {errors.response_settings?.temperature && (
            <p className="text-sm text-red-600 mt-1">{errors.response_settings.temperature.message}</p>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="is_active"
          checked={isActive}
          onCheckedChange={(checked) => setValue('is_active', checked)}
        />
        <Label htmlFor="is_active">Agente Activo</Label>
      </div>

      <div className="flex justify-end space-x-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Guardando...' : (agent ? 'Actualizar' : 'Crear')} Agente
        </Button>
      </div>
    </form>
  );
};
