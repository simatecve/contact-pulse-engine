
import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useWhatsAppConnections, ConnectionFormData } from '@/hooks/useWhatsAppConnections';

const predefinedColors = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1',
  '#14B8A6', '#F43F5E', '#8B5A2B', '#64748B', '#DC2626'
];

interface CreateConnectionFormProps {
  onSuccess: () => void;
}

export const CreateConnectionForm: React.FC<CreateConnectionFormProps> = ({ onSuccess }) => {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ConnectionFormData>({
    defaultValues: {
      color: predefinedColors[0]
    }
  });

  const { createConnection } = useWhatsAppConnections();
  const selectedColor = watch('color');

  const onSubmit = async (data: ConnectionFormData) => {
    try {
      await createConnection.mutateAsync(data);
      onSuccess();
    } catch (error) {
      console.error('Error creating connection:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <Label htmlFor="name">Nombre de la Conexión</Label>
        <Input
          id="name"
          {...register('name', { required: 'El nombre es requerido' })}
          placeholder="Mi WhatsApp Business"
        />
        {errors.name && (
          <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
        )}
      </div>

      <div>
        <Label>Color</Label>
        <div className="grid grid-cols-5 gap-3 mt-2">
          {predefinedColors.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setValue('color', color)}
              className={`w-10 h-10 rounded-lg border-2 ${
                selectedColor === color ? 'border-gray-900' : 'border-gray-200'
              } hover:border-gray-400 transition-colors`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <Button type="button" variant="outline" onClick={onSuccess}>
          Cancelar
        </Button>
        <Button type="submit" disabled={createConnection.isPending}>
          {createConnection.isPending ? 'Creando...' : 'Crear Conexión'}
        </Button>
      </div>
    </form>
  );
};
