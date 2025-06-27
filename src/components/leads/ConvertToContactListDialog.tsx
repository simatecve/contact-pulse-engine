
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useContactLists } from '@/hooks/useContactLists';
import { useContacts } from '@/hooks/useContacts';
import { Lead } from '@/hooks/useLeads';
import { toast } from '@/hooks/use-toast';

interface ConvertToContactListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leads: Lead[];
  columnName: string;
}

export const ConvertToContactListDialog: React.FC<ConvertToContactListDialogProps> = ({
  open,
  onOpenChange,
  leads,
  columnName
}) => {
  const [listName, setListName] = useState(`Lista de ${columnName}`);
  const [description, setDescription] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { createContactList } = useContactLists();
  const { createContact } = useContacts();

  const handleConvert = async () => {
    if (!listName.trim()) {
      toast({
        title: "Error",
        description: "El nombre de la lista es requerido.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      // Crear la lista de contactos
      const contactList = await createContactList.mutateAsync({
        name: listName,
        description: description || `Lista creada desde leads de la columna "${columnName}"`,
        color: '#3B82F6',
      });

      // Convertir leads a contactos
      let successCount = 0;
      let errorCount = 0;

      for (const lead of leads) {
        try {
          // Solo convertir leads que tengan email o teléfono
          if (lead.email || lead.phone) {
            await createContact.mutateAsync({
              first_name: lead.name.split(' ')[0],
              last_name: lead.name.split(' ').slice(1).join(' ') || undefined,
              email: lead.email || `${lead.phone || 'lead'}@placeholder.com`,
              phone: lead.phone,
              company: lead.company,
              notes: lead.notes,
              source: lead.source || 'Convertido desde leads',
              listIds: [contactList.id],
            });
            successCount++;
          }
        } catch (error) {
          errorCount++;
          console.error('Error converting lead:', lead.name, error);
        }
      }

      toast({
        title: "Conversión completada",
        description: `${successCount} leads convertidos exitosamente${errorCount > 0 ? `, ${errorCount} errores` : ''}.`,
      });

      onOpenChange(false);
      setListName(`Lista de ${columnName}`);
      setDescription('');
    } catch (error) {
      console.error('Error creating contact list:', error);
      toast({
        title: "Error",
        description: "Error al crear la lista de contactos.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Convertir a Lista de Contactos</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-4">
              Se convertirán {leads.length} leads de la columna "{columnName}" en una lista de contactos.
            </p>
          </div>

          <div>
            <Label htmlFor="listName">Nombre de la Lista *</Label>
            <Input
              id="listName"
              value={listName}
              onChange={(e) => setListName(e.target.value)}
              placeholder="Nombre de la lista"
            />
          </div>

          <div>
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción opcional de la lista"
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handleConvert} disabled={isProcessing}>
              {isProcessing ? 'Convirtiendo...' : 'Convertir'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
