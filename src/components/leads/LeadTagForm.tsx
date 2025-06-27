
import React from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLeadTags, LeadTagFormData } from '@/hooks/useLeadTags';

interface LeadTagFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tag?: any;
}

const colorOptions = [
  { value: '#3B82F6', label: 'Azul' },
  { value: '#EF4444', label: 'Rojo' },
  { value: '#10B981', label: 'Verde' },
  { value: '#F59E0B', label: 'Amarillo' },
  { value: '#8B5CF6', label: 'Púrpura' },
  { value: '#06B6D4', label: 'Cian' },
  { value: '#84CC16', label: 'Lima' },
  { value: '#F97316', label: 'Naranja' },
];

export const LeadTagForm: React.FC<LeadTagFormProps> = ({ 
  open, 
  onOpenChange, 
  tag 
}) => {
  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<LeadTagFormData>();
  const { createTag, updateTag } = useLeadTags();
  const selectedColor = watch('color', tag?.color || '#3B82F6');

  const onSubmit = async (data: LeadTagFormData) => {
    try {
      if (tag) {
        await updateTag.mutateAsync({ id: tag.id, ...data });
      } else {
        await createTag.mutateAsync(data);
      }
      
      reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving tag:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {tag ? 'Editar Etiqueta' : 'Nueva Etiqueta'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Nombre *</Label>
            <Input
              id="name"
              {...register('name', { required: 'El nombre es requerido' })}
              defaultValue={tag?.name}
              placeholder="Nombre de la etiqueta"
            />
            {errors.name && (
              <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label>Color</Label>
            <div className="grid grid-cols-4 gap-2 mt-2">
              {colorOptions.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setValue('color', color.value)}
                  className={`w-12 h-12 rounded-lg border-2 ${
                    selectedColor === color.value 
                      ? 'border-gray-900 ring-2 ring-gray-300' 
                      : 'border-gray-200'
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.label}
                />
              ))}
            </div>
            <input type="hidden" {...register('color')} value={selectedColor} />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createTag.isPending || updateTag.isPending}>
              {createTag.isPending || updateTag.isPending ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
