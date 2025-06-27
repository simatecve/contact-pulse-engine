
import React, { useState } from 'react';
import { Search, Plus, Filter, MoreVertical, Mail, Phone, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const contacts = [
  {
    id: 1,
    name: 'Juan Pérez',
    email: 'juan.perez@email.com',
    phone: '+34 123 456 789',
    company: 'Tech Solutions',
    status: 'lead',
    tags: ['Interesado', 'Tecnología'],
    lastContact: '2024-01-15',
    source: 'Web'
  },
  {
    id: 2,
    name: 'María González',
    email: 'maria.gonzalez@email.com',
    phone: '+34 987 654 321',
    company: 'Marketing Pro',
    status: 'customer',
    tags: ['Cliente', 'Marketing'],
    lastContact: '2024-01-14',
    source: 'Referido'
  },
  {
    id: 3,
    name: 'Carlos Rodriguez',
    email: 'carlos.rodriguez@email.com',
    phone: '+34 555 123 456',
    company: 'Startup Inc',
    status: 'prospect',
    tags: ['Prospecto', 'Startup'],
    lastContact: '2024-01-13',
    source: 'LinkedIn'
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'lead': return 'bg-yellow-100 text-yellow-800';
    case 'customer': return 'bg-green-100 text-green-800';
    case 'prospect': return 'bg-blue-100 text-blue-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'lead': return 'Lead';
    case 'customer': return 'Cliente';
    case 'prospect': return 'Prospecto';
    default: return status;
  }
};

export const Contacts: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contactos & Leads</h1>
          <p className="text-gray-600 mt-1">Gestiona tu base de datos de contactos</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Contacto
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Contactos</p>
                <p className="text-2xl font-bold text-gray-900">1,234</p>
              </div>
              <div className="h-12 w-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <Mail className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Nuevos Leads</p>
                <p className="text-2xl font-bold text-gray-900">89</p>
              </div>
              <div className="h-12 w-12 bg-yellow-50 rounded-lg flex items-center justify-center">
                <Tag className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Clientes Activos</p>
                <p className="text-2xl font-bold text-gray-900">456</p>
              </div>
              <div className="h-12 w-12 bg-green-50 rounded-lg flex items-center justify-center">
                <Phone className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tasa Conversión</p>
                <p className="text-2xl font-bold text-gray-900">12.5%</p>
              </div>
              <div className="h-12 w-12 bg-purple-50 rounded-lg flex items-center justify-center">
                <Filter className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lista de Contactos</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar contactos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-80"
                />
              </div>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filtros
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Etiquetas</TableHead>
                <TableHead>Último Contacto</TableHead>
                <TableHead>Fuente</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contacts.map((contact) => (
                <TableRow key={contact.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-700">
                          {contact.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{contact.name}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{contact.company}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-900">{contact.email}</p>
                      <p className="text-sm text-gray-500">{contact.phone}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(contact.status)}>
                      {getStatusText(contact.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {contact.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{contact.lastContact}</TableCell>
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
    </div>
  );
};
