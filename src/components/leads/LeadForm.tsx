
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useLeads, LeadFormData } from '@/hooks/useLeads';
import { useLeadColumns } from '@/hooks/useLeadColumns';
import { useLeadTags } from '@/hooks/useLeadTags';

interface LeadFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead?: any;
}

export const LeadForm: React.FC<LeadFormProps> = ({ 
  open, 
  onOpenChange, 
  lead 
}) => {
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<LeadFormData>();
  const { createLead, updateLead } = useLeads();
  const { columns } = useLeadColumns();
  const { tags } = useLeadTags();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Reset form and tags when dialog opens/closes or lead changes
  useEffect(() => {
    if (open) {
      if (lead) {
        // Si estamos editando, establecer los valores del formulario
        setValue('name', lead.name || '');
        setValue('email', lead.email || '');
        setValue('phone', lead.phone || '');
        setValue('company', lead.company || '');
        setValue('priority', lead.priority || '');
        setValue('value', lead.value || '');
        setValue('source', lead.source || '');
        setValue('column_id', lead.column_id || '');
        setValue('notes', lead.notes || '');
        
        // Para las etiquetas, inicializar como array vacío si no hay tagIds
        setSelectedTags(lead.tagIds || []);
      } else {
        // Si estamos creando un nuevo lead, limpiar el formulario
        reset();
        setSelectedTags([]);
        // Establecer la columna por defecto si hay columnas disponibles
        if (columns.length > 0) {
          const defaultColumn = columns.find(col => col.is_default) || columns[0];
          setValue('column_id', defaultColumn.id);
        }
      }
    }
  }, [open, lead, setValue, reset, columns]);

  const onSubmit = async (data: LeadFormData) => {
    try {
      // Asegurar que column_id esté definido antes de crear el objeto
      let columnId = data.column_id;
      if (!columnId && columns.length > 0) {
        const defaultColumn = columns.find(col => col.is_default) || columns[0];
        columnId = defaultColumn.id;
      }

      // Si aún no hay columnId, no podemos crear el lead
      if (!columnId) {
        console.error('No se puede crear el lead sin una columna válida');
        return;
      }

      // Crear el objeto con los datos del lead, manteniendo solo los valores definidos
      const leadData: Partial<LeadFormData> & { name: string; column_id: string; tagIds: string[] } = {
        name: data.name, // Required field, always present
        column_id: columnId, // Required field, ensured above
        tagIds: selectedTags, // Always an array
      };

      // Agregar campos opcionales solo si tienen valores
      if (data.email) leadData.email = data.email;
      if (data.phone) leadData.phone = data.phone;
      if (data.company) leadData.company = data.company;
      if (data.priority) leadData.priority = data.priority;
      if (data.value) leadData.value = Number(data.value);
      if (data.source) leadData.source = data.source;
      if (data.notes) leadData.notes = data.notes;

      if (lead) {
        await updateLead.mutateAsync({ id: lead.id, ...leadData });
      } else {
        await createLead.mutateAsync(leadData);
      }
      
      reset();
      setSelectedTags([]);
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving lead:', error);
    }
  };

  const handleTagToggle = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  // Obtener el valor actual de column_id del formulario
  const currentColumnId = watch('column_id');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {lead ? 'Editar Lead' : 'Nuevo Lead'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                {...register('name', { required: 'El nombre es requerido' })}
                placeholder="Nombre del lead"
              />
              {errors.name && (
                <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="email@ejemplo.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                {...register('phone')}
                placeholder="+34 123 456 789"
              />
            </div>

            <div>
              <Label htmlFor="company">Empresa</Label>
              <Input
                id="company"
                {...register('company')}
                placeholder="Nombre de la empresa"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="priority">Prioridad</Label>
              <Select onValueChange={(value) => setValue('priority', value)} value={watch('priority') || ''}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar prioridad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baja</SelectItem>
                  <SelectItem value="medium">Media</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="value">Valor (€)</Label>
              <Input
                id="value"
                type="number"
                {...register('value')}
                placeholder="0"
              />
            </div>

            <div>
              <Label htmlFor="source">Fuente</Label>
              <Input
                id="source"
                {...register('source')}
                placeholder="Website, LinkedIn, etc."
              />
            </div>
          </div>

          <div>
            <Label htmlFor="column_id">Columna *</Label>
            <Select 
              onValueChange={(value) => setValue('column_id', value)} 
              value={currentColumnId || ''}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar columna" />
              </SelectTrigger>
              <SelectContent>
                {columns.map((column) => (
                  <SelectItem key={column.id} value={column.id}>
                    {column.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Etiquetas</Label>
            <div className="grid grid-cols-2 gap-2 mt-2 max-h-32 overflow-y-auto">
              {tags.map((tag) => (
                <div key={tag.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={tag.id}
                    checked={selectedTags.includes(tag.id)}
                    onCheckedChange={() => handleTagToggle(tag.id)}
                  />
                  <label htmlFor={tag.id} className="text-sm flex items-center">
                    <span 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: tag.color }}
                    />
                    {tag.name}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              {...register('notes')}
              placeholder="Notas adicionales..."
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createLead.isPending || updateLead.isPending}>
              {createLead.isPending || updateLead.isPending ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
