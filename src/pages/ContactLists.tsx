
import React, { useState } from 'react';
import { Search, Plus, Users, Mail, MoreVertical, Edit, Trash2, Upload, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useContacts } from '@/hooks/useContacts';
import { useContactLists, ContactList } from '@/hooks/useContactLists';
import { ContactForm } from '@/components/contacts/ContactForm';
import { ContactListForm } from '@/components/contacts/ContactListForm';
import { ImportContacts } from '@/components/contacts/ImportContacts';

export const ContactLists: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'lists' | 'contacts'>('lists');
  const [showContactForm, setShowContactForm] = useState(false);
  const [showListForm, setShowListForm] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);

  const { contacts, isLoading: contactsLoading } = useContacts();
  const { contactLists, isLoading: listsLoading, deleteList } = useContactLists();

  const filteredContacts = contacts.filter(contact => 
    contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.company?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredLists = contactLists.filter(list =>
    list.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    list.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalContacts = contacts.length;
  const activeLists = contactLists.length;
  const activeContacts = contacts.filter(c => c.status === 'active').length;

  const handleDeleteList = async (listId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta lista?')) {
      await deleteList.mutateAsync(listId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contactos y Listas</h1>
          <p className="text-gray-600 mt-1">Gestiona tus contactos y listas para envíos masivos</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setShowImportDialog(true)}>
            <Upload className="w-4 h-4 mr-2" />
            Importar Contactos
          </Button>
          <Button onClick={() => activeTab === 'lists' ? setShowListForm(true) : setShowContactForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            {activeTab === 'lists' ? 'Nueva Lista' : 'Nuevo Contacto'}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Contactos</p>
                <p className="text-2xl font-bold text-gray-900">{totalContacts.toLocaleString()}</p>
              </div>
              <div className="h-12 w-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Listas Activas</p>
                <p className="text-2xl font-bold text-gray-900">{activeLists}</p>
              </div>
              <div className="h-12 w-12 bg-green-50 rounded-lg flex items-center justify-center">
                <Mail className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Contactos Activos</p>
                <p className="text-2xl font-bold text-gray-900">{activeContacts.toLocaleString()}</p>
              </div>
              <div className="h-12 w-12 bg-yellow-50 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tasa Entregabilidad</p>
                <p className="text-2xl font-bold text-gray-900">94.2%</p>
              </div>
              <div className="h-12 w-12 bg-purple-50 rounded-lg flex items-center justify-center">
                <Mail className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('lists')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'lists'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Listas de Contactos
          </button>
          <button
            onClick={() => setActiveTab('contacts')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'contacts'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Todos los Contactos
          </button>
        </nav>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder={`Buscar ${activeTab === 'lists' ? 'listas' : 'contactos'}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Content */}
      {activeTab === 'lists' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listsLoading ? (
            <div>Cargando listas...</div>
          ) : filteredLists.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay listas</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'No se encontraron listas con ese término.' : 'Comienza creando tu primera lista de contactos.'}
              </p>
              {!searchTerm && (
                <div className="mt-6">
                  <Button onClick={() => setShowListForm(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Nueva Lista
                  </Button>
                </div>
              )}
            </div>
          ) : (
            filteredLists.map((list) => (
              <Card key={list.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: list.color }}
                      ></div>
                      <CardTitle className="text-lg">{list.name}</CardTitle>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="w-4 h-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => handleDeleteList(list.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {list.description && (
                    <p className="text-sm text-gray-600">{list.description}</p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium">{list.contact_count || 0} contactos</span>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 space-y-1">
                    <p>Creada: {new Date(list.created_at).toLocaleDateString()}</p>
                  </div>

                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="w-3 h-3 mr-1" />
                      Editar
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Mail className="w-3 h-3 mr-1" />
                      Enviar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      ) : (
        <Card>
          <CardContent>
            {contactsLoading ? (
              <div className="py-8 text-center">Cargando contactos...</div>
            ) : filteredContacts.length === 0 ? (
              <div className="py-12 text-center">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No hay contactos</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm ? 'No se encontraron contactos con ese término.' : 'Comienza agregando tu primer contacto.'}
                </p>
                {!searchTerm && (
                  <div className="mt-6 space-x-2">
                    <Button onClick={() => setShowContactForm(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Nuevo Contacto
                    </Button>
                    <Button variant="outline" onClick={() => setShowImportDialog(true)}>
                      <Upload className="w-4 h-4 mr-2" />
                      Importar
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Listas</TableHead>
                    <TableHead>Fuente</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContacts.map((contact) => (
                    <TableRow key={contact.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-gray-700">
                              {contact.first_name?.[0] || ''}{contact.last_name?.[0] || ''}
                            </span>
                          </div>
                          <span className="font-medium">
                            {contact.first_name} {contact.last_name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{contact.email}</TableCell>
                      <TableCell>{contact.company}</TableCell>
                      <TableCell>
                        <Badge className={contact.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {contact.status === 'active' ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {contact.lists?.map((list, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {list}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>{contact.source}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit className="w-4 h-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* Dialogs */}
      <ContactForm 
        open={showContactForm} 
        onOpenChange={setShowContactForm} 
      />
      
      <ContactListForm 
        open={showListForm} 
        onOpenChange={setShowListForm} 
      />
      
      <ImportContacts 
        open={showImportDialog} 
        onOpenChange={setShowImportDialog} 
      />
    </div>
  );
};
