
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, X, FileText } from 'lucide-react';
import { useContactLists } from '@/hooks/useContactLists';
import { useCampaigns, CampaignFormData } from '@/hooks/useCampaigns';

interface CampaignFormProps {
  onSuccess?: () => void;
}

export const CampaignForm: React.FC<CampaignFormProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState<CampaignFormData>({
    name: '',
    message: '',
    contact_list_id: '',
    max_delay_seconds: 0,
    ai_enabled: false,
    attachments: []
  });

  const { contactLists } = useContactLists();
  const { createCampaign } = useCampaigns();
  const [attachments, setAttachments] = useState<File[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createCampaign.mutateAsync({
        ...formData,
        attachments
      });
      
      // Reset form
      setFormData({
        name: '',
        message: '',
        contact_list_id: '',
        max_delay_seconds: 0,
        ai_enabled: false
      });
      setAttachments([]);
      
      onSuccess?.();
    } catch (error) {
      console.error('Error creating campaign:', error);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setAttachments(prev => [...prev, ...newFiles]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Nueva Campaña WhatsApp</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre de la Campaña</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ej: Promoción Navideña 2024"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact_list">Lista de Contactos</Label>
            <Select
              value={formData.contact_list_id}
              onValueChange={(value) => setFormData(prev => ({ ...prev, contact_list_id: value }))}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una lista de contactos" />
              </SelectTrigger>
              <SelectContent>
                {contactLists.map((list) => (
                  <SelectItem key={list.id} value={list.id}>
                    {list.name} ({list.contact_count || 0} contactos)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Mensaje</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              placeholder="Escribe tu mensaje aquí..."
              rows={4}
              required
            />
            <p className="text-sm text-gray-500">
              Caracteres: {formData.message.length}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="delay">Delay Máximo entre Mensajes (segundos)</Label>
            <Input
              id="delay"
              type="number"
              min="0"
              max="3600"
              value={formData.max_delay_seconds}
              onChange={(e) => setFormData(prev => ({ ...prev, max_delay_seconds: parseInt(e.target.value) || 0 }))}
              placeholder="0"
            />
            <p className="text-sm text-gray-500">
              Tiempo de espera máximo entre el envío de mensajes (0 = sin delay)
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="ai_enabled"
              checked={formData.ai_enabled}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, ai_enabled: checked }))}
            />
            <Label htmlFor="ai_enabled">Activar IA para personalización de mensajes</Label>
          </div>

          <div className="space-y-2">
            <Label>Archivos Adjuntos</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-2">
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <span className="text-blue-600 hover:text-blue-500">
                      Subir archivos
                    </span>
                    <input
                      id="file-upload"
                      type="file"
                      multiple
                      className="sr-only"
                      onChange={handleFileUpload}
                      accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
                    />
                  </label>
                </div>
                <p className="text-sm text-gray-500">
                  Imágenes, videos, audios, PDF, DOC
                </p>
              </div>
            </div>

            {attachments.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Archivos seleccionados:</h4>
                {attachments.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{file.name}</span>
                      <span className="text-xs text-gray-500">({formatFileSize(file.size)})</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAttachment(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex space-x-4">
            <Button
              type="submit"
              disabled={createCampaign.isPending}
              className="flex-1"
            >
              {createCampaign.isPending ? 'Creando...' : 'Crear Campaña'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
