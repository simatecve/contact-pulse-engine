
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Download, FileText } from 'lucide-react';
import { useContacts, ContactFormData } from '@/hooks/useContacts';
import { useContactLists } from '@/hooks/useContactLists';
import { toast } from '@/hooks/use-toast';

interface ImportContactsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ImportContacts: React.FC<ImportContactsProps> = ({ open, onOpenChange }) => {
  const [file, setFile] = useState<File | null>(null);
  const [selectedListId, setSelectedListId] = useState<string>('');
  const { importContacts } = useContacts();
  const { contactLists } = useContactLists();

  const downloadTemplate = () => {
    const csvContent = 'first_name,last_name,email,phone,company,source,notes\nJuan,Pérez,juan@ejemplo.com,+34123456789,Mi Empresa SL,Website,Contacto de prueba\nMaría,González,maria@ejemplo.com,+34987654321,Otra Empresa,LinkedIn,Otro contacto';
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'plantilla_contactos.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const downloadExcelTemplate = () => {
    // Create a simple HTML table that Excel can import
    const htmlContent = `
      <table>
        <tr>
          <th>first_name</th>
          <th>last_name</th>
          <th>email</th>
          <th>phone</th>
          <th>company</th>
          <th>source</th>
          <th>notes</th>
        </tr>
        <tr>
          <td>Juan</td>
          <td>Pérez</td>
          <td>juan@ejemplo.com</td>
          <td>+34123456789</td>
          <td>Mi Empresa SL</td>
          <td>Website</td>
          <td>Contacto de prueba</td>
        </tr>
        <tr>
          <td>María</td>
          <td>González</td>
          <td>maria@ejemplo.com</td>
          <td>+34987654321</td>
          <td>Otra Empresa</td>
          <td>LinkedIn</td>
          <td>Otro contacto</td>
        </tr>
      </table>
    `;
    
    const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'plantilla_contactos.xls');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const parseCSV = (text: string): ContactFormData[] => {
    const lines = text.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const contacts: ContactFormData[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = line.split(',').map(v => v.trim());
      const contact: ContactFormData = { email: '' };

      headers.forEach((header, index) => {
        const value = values[index] || '';
        switch (header.toLowerCase()) {
          case 'first_name':
          case 'nombre':
            contact.first_name = value;
            break;
          case 'last_name':
          case 'apellido':
            contact.last_name = value;
            break;
          case 'email':
          case 'correo':
            contact.email = value;
            break;
          case 'phone':
          case 'telefono':
          case 'teléfono':
            contact.phone = value;
            break;
          case 'company':
          case 'empresa':
            contact.company = value;
            break;
          case 'source':
          case 'fuente':
            contact.source = value;
            break;
          case 'notes':
          case 'notas':
            contact.notes = value;
            break;
        }
      });

      if (contact.email) {
        contacts.push(contact);
      }
    }

    return contacts;
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      const allowedTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
      if (allowedTypes.includes(selectedFile.type) || selectedFile.name.endsWith('.csv')) {
        setFile(selectedFile);
      } else {
        toast({
          title: "Archivo no válido",
          description: "Solo se permiten archivos CSV y Excel.",
          variant: "destructive",
        });
      }
    }
  };

  const handleImport = async () => {
    if (!file) {
      toast({
        title: "Error",
        description: "Selecciona un archivo para importar.",
        variant: "destructive",
      });
      return;
    }

    try {
      const text = await file.text();
      const contacts = parseCSV(text);

      if (contacts.length === 0) {
        toast({
          title: "Error",
          description: "No se encontraron contactos válidos en el archivo.",
          variant: "destructive",
        });
        return;
      }

      await importContacts.mutateAsync({
        contacts,
        listId: selectedListId || undefined
      });

      setFile(null);
      setSelectedListId('');
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al procesar el archivo.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Importar Contactos</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Descargar Plantillas</h4>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={downloadTemplate}
              >
                <Download className="w-4 h-4 mr-2" />
                CSV
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={downloadExcelTemplate}
              >
                <FileText className="w-4 h-4 mr-2" />
                Excel
              </Button>
            </div>
            <p className="text-sm text-blue-700 mt-2">
              Descarga una plantilla para ver el formato correcto
            </p>
          </div>

          <div>
            <Label htmlFor="file">Seleccionar archivo</Label>
            <Input
              id="file"
              type="file"
              accept=".csv,.xls,.xlsx"
              onChange={handleFileChange}
              className="mt-1"
            />
            {file && (
              <p className="text-sm text-green-600 mt-1">
                Archivo seleccionado: {file.name}
              </p>
            )}
          </div>

          {contactLists.length > 0 && (
            <div>
              <Label htmlFor="list">Agregar a lista (opcional)</Label>
              <Select value={selectedListId} onValueChange={setSelectedListId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar lista" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Sin lista</SelectItem>
                  {contactLists.map((list) => (
                    <SelectItem key={list.id} value={list.id}>
                      {list.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handleImport} disabled={!file || importContacts.isPending}>
              <Upload className="w-4 h-4 mr-2" />
              {importContacts.isPending ? 'Importando...' : 'Importar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
