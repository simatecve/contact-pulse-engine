
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useContacts, ContactFormData } from '@/hooks/useContacts';
import { ContactList } from '@/hooks/useContactLists';
import { toast } from '@/hooks/use-toast';

interface QuickAddContactProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contactList: ContactList;
}

interface SingleContactForm {
  name: string;
  phone: string;
}

export const QuickAddContact: React.FC<QuickAddContactProps> = ({ 
  open, 
  onOpenChange, 
  contactList 
}) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<SingleContactForm>();
  const { createContact } = useContacts();
  const [bulkText, setBulkText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const onSubmitSingle = async (data: SingleContactForm) => {
    try {
      const contactData: ContactFormData = {
        first_name: data.name.split(' ')[0],
        last_name: data.name.split(' ').slice(1).join(' ') || undefined,
        phone: data.phone,
        email: `${data.phone}@placeholder.com`, // Email temporal requerido
        listIds: [contactList.id]
      };

      await createContact.mutateAsync(contactData);
      reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating contact:', error);
    }
  };

  const processBulkContacts = async () => {
    if (!bulkText.trim()) return;

    setIsProcessing(true);
    const lines = bulkText.trim().split('\n');
    let processed = 0;
    let errors = 0;

    for (const line of lines) {
      try {
        const trimmedLine = line.trim();
        if (!trimmedLine) continue;

        // Separar por coma
        const parts = trimmedLine.split(',').map(part => part.trim());
        if (parts.length < 2) continue;

        const [name, phone] = parts;
        
        const contactData: ContactFormData = {
          first_name: name.split(' ')[0],
          last_name: name.split(' ').slice(1).join(' ') || undefined,
          phone: phone,
          email: `${phone}@placeholder.com`, // Email temporal requerido
          listIds: [contactList.id]
        };

        await createContact.mutateAsync(contactData);
        processed++;
      } catch (error) {
        errors++;
        console.error('Error processing line:', line, error);
      }
    }

    setIsProcessing(false);
    setBulkText('');
    onOpenChange(false);

    toast({
      title: "Contactos procesados",
      description: `${processed} contactos agregados exitosamente${errors > 0 ? `, ${errors} errores` : ''}.`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Agregar Contactos a "{contactList.name}"</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="single" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="single">Individual</TabsTrigger>
            <TabsTrigger value="bulk">Masivo</TabsTrigger>
          </TabsList>
          
          <TabsContent value="single" className="space-y-4">
            <form onSubmit={handleSubmit(onSubmitSingle)} className="space-y-4">
              <div>
                <Label htmlFor="name">Nombre Completo *</Label>
                <Input
                  id="name"
                  {...register('name', { required: 'El nombre es requerido' })}
                  placeholder="Juan Pérez"
                />
                {errors.name && (
                  <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="phone">Teléfono *</Label>
                <Input
                  id="phone"
                  {...register('phone', { required: 'El teléfono es requerido' })}
                  placeholder="+34 123 456 789"
                />
                {errors.phone && (
                  <p className="text-sm text-red-500 mt-1">{errors.phone.message}</p>
                )}
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createContact.isPending}>
                  {createContact.isPending ? 'Agregando...' : 'Agregar Contacto'}
                </Button>
              </div>
            </form>
          </TabsContent>
          
          <TabsContent value="bulk" className="space-y-4">
            <div>
              <Label htmlFor="bulkText">Contactos (Nombre, Teléfono)</Label>
              <Textarea
                id="bulkText"
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder="Juan Pérez, +34 123 456 789&#10;María García, +34 987 654 321&#10;Carlos López, +34 555 555 555"
                rows={8}
                className="font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                Un contacto por línea. Formato: Nombre, Teléfono
              </p>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={processBulkContacts} 
                disabled={isProcessing || !bulkText.trim()}
              >
                {isProcessing ? 'Procesando...' : 'Agregar Contactos'}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
