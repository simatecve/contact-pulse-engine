
import React, { useState } from 'react';
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
  const [selectedTags, setSelectedTags] = useState<string[]>(lead?.tagIds || []);

  const onSubmit = async (data: LeadFormData) => {
    try {
      const leadData = {
        ...data,
        value: data.value ? Number(data.value) : undefined,
        tagIds: selectedTags,
      };

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
                defaultValue={lead?.name}
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
                defaultValue={lead?.email}
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
                defaultValue={lead?.phone}
                placeholder="+34 123 456 789"
              />
            </div>

            <div>
              <Label htmlFor="company">Empresa</Label>
              <Input
                id="company"
                {...register('company')}
                defaultValue={lead?.company}
                placeholder="Nombre de la empresa"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="priority">Prioridad</Label>
              <Select onValueChange={(value) => setValue('priority', value)} defaultValue={lead?.priority}>
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
                defaultValue={lead?.value}
                placeholder="0"
              />
            </div>

            <div>
              <Label htmlFor="source">Fuente</Label>
              <Input
                id="source"
                {...register('source')}
                defaultValue={lead?.source}
                placeholder="Website, LinkedIn, etc."
              />
            </div>
          </div>

          <div>
            <Label htmlFor="column_id">Columna</Label>
            <Select onValueChange={(value) => setValue('column_id', value)} defaultValue={lead?.column_id}>
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
              defaultValue={lead?.notes}
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
