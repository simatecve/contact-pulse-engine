import React, { useState } from 'react';
import { Search, Plus, Users, Mail, MoreVertical, Edit, Trash2, Upload, Download, UserPlus, Sparkles, Zap } from 'lucide-react';
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
import { QuickAddContact } from '@/components/contacts/QuickAddContact';

export const ContactLists: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'lists' | 'contacts'>('lists');
  const [showContactForm, setShowContactForm] = useState(false);
  const [showListForm, setShowListForm] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [selectedList, setSelectedList] = useState<ContactList | null>(null);

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

  const handleQuickAddContact = (list: ContactList) => {
    setSelectedList(list);
    setShowQuickAdd(true);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Section */}
      <div className="relative">
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">Contactos y Listas</h1>
                <p className="text-indigo-100 text-lg">Gestiona tus contactos y listas para envíos masivos</p>
                <div className="flex items-center mt-2 space-x-4">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                    <span className="text-sm text-indigo-100">Sistema activo</span>
                  </div>
                  <div className="flex items-center">
                    <Zap className="w-4 h-4 text-yellow-300 mr-1" />
                    <span className="text-sm text-indigo-100">Gestión inteligente</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex space-x-3">
              <Button variant="secondary" className="bg-white/10 border-white/20 text-white hover:bg-white/20" onClick={() => setShowImportDialog(true)}>
                <Upload className="w-4 h-4 mr-2" />
                Importar Contactos
              </Button>
              <Button className="bg-white text-indigo-600 hover:bg-gray-100 font-semibold px-6" onClick={() => activeTab === 'lists' ? setShowListForm(true) : setShowContactForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                {activeTab === 'lists' ? 'Nueva Lista' : 'Nuevo Contacto'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card-hover bg-gradient-to-br from-blue-50 to-indigo-50 border-0 shadow-lg rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Contactos</p>
              <p className="text-3xl font-bold text-gray-900">{totalContacts.toLocaleString()}</p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
              <Users className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>

        <div className="card-hover bg-gradient-to-br from-green-50 to-emerald-50 border-0 shadow-lg rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Listas Activas</p>
              <p className="text-3xl font-bold text-gray-900">{activeLists}</p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
              <Mail className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>

        <div className="card-hover bg-gradient-to-br from-yellow-50 to-orange-50 border-0 shadow-lg rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Contactos Activos</p>
              <p className="text-3xl font-bold text-gray-900">{activeContacts.toLocaleString()}</p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
              <Users className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>

        <div className="card-hover bg-gradient-to-br from-purple-50 to-pink-50 border-0 shadow-lg rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Tasa Entregabilidad</p>
              <p className="text-3xl font-bold text-gray-900">94.2%</p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
              <Mail className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50">
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-t-xl">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('lists')}
              className={`py-3 px-6 rounded-xl font-medium text-sm transition-all duration-300 ${
                activeTab === 'lists'
                  ? 'bg-white shadow-md text-indigo-600 border border-indigo-200'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              <Users className="w-4 h-4 mr-2 inline" />
              Listas de Contactos
            </button>
            <button
              onClick={() => setActiveTab('contacts')}
              className={`py-3 px-6 rounded-xl font-medium text-sm transition-all duration-300 ${
                activeTab === 'contacts'
                  ? 'bg-white shadow-md text-indigo-600 border border-indigo-200'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              <Mail className="w-4 h-4 mr-2 inline" />
              Todos los Contactos
            </button>
          </nav>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-gray-100">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder={`Buscar ${activeTab === 'lists' ? 'listas' : 'contactos'}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-50 border-gray-200 focus:bg-white"
            />
          </div>
        </div>

        {/* Content */}
        <CardContent className="p-6">
          {activeTab === 'lists' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listsLoading ? (
                <div className="col-span-full text-center py-12">
                  <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">Cargando listas...</p>
                </div>
              ) : filteredLists.length === 0 ? (
                <div className="col-span-full">
                  <div className="card-hover bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-12 text-center border-2 border-dashed border-indigo-200">
                    <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <Users className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      {searchTerm ? 'No se encontraron listas' : 'No hay listas de contactos'}
                    </h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      {searchTerm ? 'No se encontraron listas con ese término.' : 'Comienza creando tu primera lista de contactos.'}
                    </p>
                    <div className="flex items-center justify-center space-x-2 mb-6">
                      <Sparkles className="w-4 h-4 text-indigo-500" />
                      <span className="text-sm text-indigo-600 font-medium">Gestión organizada</span>
                    </div>
                    {!searchTerm && (
                      <Button 
                        onClick={() => setShowListForm(true)}
                        className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold px-8"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Nueva Lista
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                filteredLists.map((list) => (
                  <Card key={list.id} className="card-hover border-0 shadow-lg bg-gradient-to-br from-white to-gray-50">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-4 h-4 rounded-full shadow-sm" 
                            style={{ backgroundColor: list.color }}
                          ></div>
                          <CardTitle className="text-lg">{list.name}</CardTitle>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="hover:bg-gray-100">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleQuickAddContact(list)}>
                              <UserPlus className="w-4 h-4 mr-2" />
                              Agregar Contactos
                            </DropdownMenuItem>
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
                      
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <div className="flex items-center space-x-2">
                          <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                            <Users className="w-5 h-5 text-white" />
                          </div>
                          <span className="text-sm font-medium">{list.contact_count || 0} contactos</span>
                        </div>
                      </div>

                      <div className="text-xs text-gray-500 space-y-1">
                        <p>Creada: {new Date(list.created_at).toLocaleDateString()}</p>
                      </div>

                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 hover:bg-indigo-50 hover:border-indigo-200"
                          onClick={() => handleQuickAddContact(list)}
                        >
                          <UserPlus className="w-3 h-3 mr-1" />
                          Agregar
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1 hover:bg-green-50 hover:border-green-200">
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
            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50">
              <CardContent>
                {contactsLoading ? (
                  <div className="py-12 text-center">
                    <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando contactos...</p>
                  </div>
                ) : filteredContacts.length === 0 ? (
                  <div className="py-12 text-center">
                    <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <Users className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      {searchTerm ? 'No se encontraron contactos' : 'No hay contactos'}
                    </h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      {searchTerm ? 'No se encontraron contactos con ese término.' : 'Comienza agregando tu primer contacto.'}
                    </p>
                    <div className="flex items-center justify-center space-x-2 mb-6">
                      <Sparkles className="w-4 h-4 text-indigo-500" />
                      <span className="text-sm text-indigo-600 font-medium">CRM inteligente</span>
                    </div>
                    {!searchTerm && (
                      <div className="flex justify-center space-x-3">
                        <Button 
                          onClick={() => setShowContactForm(true)}
                          className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold px-8"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Nuevo Contacto
                        </Button>
                        <Button variant="outline" onClick={() => setShowImportDialog(true)} className="hover:bg-indigo-50 hover:border-indigo-200">
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
        </CardContent>
      </Card>

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

      {selectedList && (
        <QuickAddContact 
          open={showQuickAdd} 
          onOpenChange={setShowQuickAdd}
          contactList={selectedList}
        />
      )}
    </div>
  );
};
