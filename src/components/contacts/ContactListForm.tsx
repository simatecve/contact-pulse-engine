
import React from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useContactLists } from '@/hooks/useContactLists';

interface ContactListFormData {
  name: string;
  description?: string;
  color?: string;
}

interface ContactListFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const colors = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', 
  '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
];

export const ContactListForm: React.FC<ContactListFormProps> = ({ open, onOpenChange }) => {
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<ContactListFormData>();
  const { createList } = useContactLists();
  const selectedColor = watch('color', '#3B82F6');

  const onSubmit = async (data: ContactListFormData) => {
    try {
      await createList.mutateAsync(data);
      reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating list:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nueva Lista de Contactos</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Nombre de la lista *</Label>
            <Input
              id="name"
              {...register('name', { required: 'El nombre es requerido' })}
              placeholder="Newsletter Suscriptores"
            />
            {errors.name && (
              <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Descripción de la lista..."
              rows={3}
            />
          </div>

          <div>
            <Label>Color de la lista</Label>
            <div className="flex gap-2 mt-2">
              {colors.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`w-8 h-8 rounded-full border-2 ${
                    selectedColor === color ? 'border-gray-800' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setValue('color', color)}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createList.isPending}>
              {createList.isPending ? 'Creando...' : 'Crear Lista'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
