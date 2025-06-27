
import React from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ContactFormData, useContacts } from '@/hooks/useContacts';
import { useContactLists } from '@/hooks/useContactLists';

interface ContactFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ContactForm: React.FC<ContactFormProps> = ({ open, onOpenChange }) => {
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<ContactFormData>();
  const { createContact } = useContacts();
  const { contactLists } = useContactLists();
  const [selectedLists, setSelectedLists] = React.useState<string[]>([]);

  const onSubmit = async (data: ContactFormData) => {
    try {
      await createContact.mutateAsync({
        ...data,
        listIds: selectedLists
      });
      reset();
      setSelectedLists([]);
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating contact:', error);
    }
  };

  const handleListToggle = (listId: string, checked: boolean) => {
    if (checked) {
      setSelectedLists([...selectedLists, listId]);
    } else {
      setSelectedLists(selectedLists.filter(id => id !== listId));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nuevo Contacto</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="first_name">Nombre</Label>
              <Input
                id="first_name"
                {...register('first_name')}
                placeholder="Juan"
              />
            </div>
            <div>
              <Label htmlFor="last_name">Apellido</Label>
              <Input
                id="last_name"
                {...register('last_name')}
                placeholder="Pérez"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              {...register('email', { required: 'El email es requerido' })}
              placeholder="juan@ejemplo.com"
            />
            {errors.email && (
              <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
            )}
          </div>

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
              placeholder="Mi Empresa SL"
            />
          </div>

          <div>
            <Label htmlFor="source">Fuente</Label>
            <Select onValueChange={(value) => setValue('source', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar fuente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Website">Website</SelectItem>
                <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                <SelectItem value="Facebook">Facebook</SelectItem>
                <SelectItem value="Referido">Referido</SelectItem>
                <SelectItem value="Evento">Evento</SelectItem>
                <SelectItem value="Otro">Otro</SelectItem>
              </SelectContent>
            </Select>
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

          {contactLists.length > 0 && (
            <div>
              <Label>Agregar a listas</Label>
              <div className="space-y-2 mt-2 max-h-32 overflow-y-auto">
                {contactLists.map((list) => (
                  <div key={list.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`list-${list.id}`}
                      checked={selectedLists.includes(list.id)}
                      onCheckedChange={(checked) => handleListToggle(list.id, checked as boolean)}
                    />
                    <Label htmlFor={`list-${list.id}`} className="text-sm">
                      {list.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createContact.isPending}>
              {createContact.isPending ? 'Creando...' : 'Crear Contacto'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
