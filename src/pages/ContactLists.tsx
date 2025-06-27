
import React, { useState } from 'react';
import { Search, Plus, Users, Mail, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const contactLists = [
  {
    id: 1,
    name: 'Newsletter Suscriptores',
    description: 'Lista principal de suscriptores del newsletter',
    contactCount: 1250,
    color: '#3B82F6',
    created: '2024-01-15',
    lastUsed: '2024-01-20'
  },
  {
    id: 2,
    name: 'Clientes Premium',
    description: 'Clientes con plan premium activo',
    contactCount: 89,
    color: '#F59E0B',
    created: '2024-01-10',
    lastUsed: '2024-01-18'
  },
  {
    id: 3,
    name: 'Leads Calificados',
    description: 'Leads que pasaron el proceso de calificación',
    contactCount: 234,
    color: '#10B981',
    created: '2024-01-12',
    lastUsed: '2024-01-19'
  }
];

const sampleContacts = [
  {
    id: 1,
    firstName: 'Juan',
    lastName: 'Pérez',
    email: 'juan.perez@email.com',
    phone: '+34 123 456 789',
    company: 'Tech Solutions',
    status: 'active',
    source: 'Website',
    lists: ['Newsletter Suscriptores', 'Leads Calificados']
  },
  {
    id: 2,
    firstName: 'María',
    lastName: 'González',
    email: 'maria.gonzalez@email.com',
    phone: '+34 987 654 321',
    company: 'Marketing Pro',
    status: 'active',
    source: 'LinkedIn',
    lists: ['Newsletter Suscriptores', 'Clientes Premium']
  }
];

export const ContactLists: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'lists' | 'contacts'>('lists');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contactos y Listas</h1>
          <p className="text-gray-600 mt-1">Gestiona tus contactos y listas para envíos masivos</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Users className="w-4 h-4 mr-2" />
            Importar Contactos
          </Button>
          <Button>
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
                <p className="text-2xl font-bold text-gray-900">2,847</p>
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
                <p className="text-2xl font-bold text-gray-900">12</p>
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
                <p className="text-2xl font-bold text-gray-900">2,645</p>
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
          {contactLists.map((list) => (
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
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">{list.description}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium">{list.contactCount} contactos</span>
                  </div>
                </div>

                <div className="text-xs text-gray-500 space-y-1">
                  <p>Creada: {list.created}</p>
                  <p>Último uso: {list.lastUsed}</p>
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
          ))}
        </div>
      ) : (
        <Card>
          <CardContent>
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
                {sampleContacts.map((contact) => (
                  <TableRow key={contact.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-gray-700">
                            {contact.firstName[0]}{contact.lastName[0]}
                          </span>
                        </div>
                        <span className="font-medium">{contact.firstName} {contact.lastName}</span>
                      </div>
                    </TableCell>
                    <TableCell>{contact.email}</TableCell>
                    <TableCell>{contact.company}</TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-800">
                        Activo
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {contact.lists.map((list, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {list}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>{contact.source}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
