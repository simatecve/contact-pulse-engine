
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
import { Bot, Settings, Zap, MessageSquare } from 'lucide-react';

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
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold">
              {agent ? 'Editar Agente IA' : 'Nuevo Agente IA'}
            </h2>
            <p className="text-indigo-100">Configura tu asistente inteligente</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-8">
        {/* Basic Information */}
        <div className="space-y-6">
          <div className="flex items-center space-x-2 mb-4">
            <MessageSquare className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-semibold text-gray-900">Información Básica</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="name" className="text-sm font-medium text-gray-700 mb-2 block">
                Nombre del Agente
              </Label>
              <Input
                id="name"
                {...register('name', { required: 'El nombre es requerido' })}
                placeholder="Ej: Asistente de Ventas"
                className="h-12 rounded-xl border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
              />
              {errors.name && (
                <p className="text-sm text-red-600 mt-1 flex items-center">
                  <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="whatsapp_connection" className="text-sm font-medium text-gray-700 mb-2 block">
                Conexión WhatsApp
              </Label>
              <Select value={whatsappConnectionId || 'no-connection'} onValueChange={(value) => setValue('whatsapp_connection_id', value === 'no-connection' ? '' : value)}>
                <SelectTrigger className="h-12 rounded-xl border-gray-200 focus:border-indigo-500">
                  <SelectValue placeholder="Seleccionar conexión..." />
                </SelectTrigger>
                <SelectContent className="rounded-xl shadow-lg border-gray-100">
                  <SelectItem value="no-connection" className="rounded-lg">Sin conexión</SelectItem>
                  {connections.map((connection) => (
                    <SelectItem key={connection.id} value={connection.id} className="rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-3 h-3 rounded-full shadow-sm" 
                          style={{ backgroundColor: connection.color }}
                        />
                        <span className="font-medium">{connection.name}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          connection.status === 'connected' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {connection.status === 'connected' ? 'Conectado' : 'Desconectado'}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description" className="text-sm font-medium text-gray-700 mb-2 block">
              Descripción
            </Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Describe la función de este agente..."
              rows={3}
              className="rounded-xl border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 resize-none"
            />
          </div>
        </div>

        {/* AI Configuration */}
        <div className="space-y-6">
          <div className="flex items-center space-x-2 mb-4">
            <Zap className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">Configuración de IA</h3>
          </div>

          <div>
            <Label htmlFor="prompt_template" className="text-sm font-medium text-gray-700 mb-2 block">
              Template de Prompt
            </Label>
            <Textarea
              id="prompt_template"
              {...register('prompt_template')}
              placeholder="Eres un asistente especializado en..."
              rows={4}
              className="rounded-xl border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="max_tokens" className="text-sm font-medium text-gray-700 mb-2 block">
                Máximo de Tokens
              </Label>
              <Input
                id="max_tokens"
                type="number"
                {...register('response_settings.max_tokens', { 
                  valueAsNumber: true,
                  min: { value: 1, message: 'Debe ser mayor a 0' },
                  max: { value: 4000, message: 'Debe ser menor a 4000' }
                })}
                placeholder="150"
                className="h-12 rounded-xl border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
              />
              {errors.response_settings?.max_tokens && (
                <p className="text-sm text-red-600 mt-1 flex items-center">
                  <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
                  {errors.response_settings.max_tokens.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="temperature" className="text-sm font-medium text-gray-700 mb-2 block">
                Temperatura (0-1)
              </Label>
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
                className="h-12 rounded-xl border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
              />
              {errors.response_settings?.temperature && (
                <p className="text-sm text-red-600 mt-1 flex items-center">
                  <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
                  {errors.response_settings.temperature.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="space-y-6">
          <div className="flex items-center space-x-2 mb-4">
            <Settings className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Estado</h3>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <Label htmlFor="is_active" className="text-sm font-medium text-gray-900">
                Agente Activo
              </Label>
              <p className="text-xs text-gray-500 mt-1">
                Activa o desactiva el agente para responder automáticamente
              </p>
            </div>
            <Switch
              id="is_active"
              checked={isActive}
              onCheckedChange={(checked) => setValue('is_active', checked)}
              className="data-[state=checked]:bg-indigo-600"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-100">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            className="px-6 py-2 h-12 rounded-xl border-gray-200 hover:bg-gray-50"
          >
            Cancelar
          </Button>
          <Button 
            type="submit" 
            disabled={isLoading}
            className="px-6 py-2 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl"
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Guardando...
              </div>
            ) : (
              `${agent ? 'Actualizar' : 'Crear'} Agente`
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};
