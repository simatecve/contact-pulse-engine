
import React, { useState } from 'react';
import { Search, Plus, Filter, MoreVertical, Mail, Phone, Tag, Sparkles, Users } from 'lucide-react';
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
                <h1 className="text-3xl font-bold mb-2">Contactos & Leads</h1>
                <p className="text-indigo-100 text-lg">Gestiona tu base de datos de contactos</p>
                <div className="flex items-center mt-2 space-x-4">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                    <span className="text-sm text-indigo-100">Sistema activo</span>
                  </div>
                  <div className="flex items-center">
                    <Sparkles className="w-4 h-4 text-yellow-300 mr-1" />
                    <span className="text-sm text-indigo-100">CRM inteligente</span>
                  </div>
                </div>
              </div>
            </div>
            <Button className="bg-white text-indigo-600 hover:bg-gray-100 font-semibold px-6">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Contacto
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card-hover bg-gradient-to-br from-blue-50 to-indigo-50 border-0 shadow-lg rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Contactos</p>
              <p className="text-3xl font-bold text-gray-900">1,234</p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
              <Mail className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>

        <div className="card-hover bg-gradient-to-br from-yellow-50 to-orange-50 border-0 shadow-lg rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Nuevos Leads</p>
              <p className="text-3xl font-bold text-gray-900">89</p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
              <Tag className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>

        <div className="card-hover bg-gradient-to-br from-green-50 to-emerald-50 border-0 shadow-lg rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Clientes Activos</p>
              <p className="text-3xl font-bold text-gray-900">456</p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
              <Phone className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>

        <div className="card-hover bg-gradient-to-br from-purple-50 to-pink-50 border-0 shadow-lg rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Tasa Conversión</p>
              <p className="text-3xl font-bold text-gray-900">12.5%</p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
              <Filter className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50">
        <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-t-xl">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Lista de Contactos
            </CardTitle>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70 w-4 h-4" />
                <Input
                  placeholder="Buscar contactos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-80 bg-white/10 border-white/20 text-white placeholder:text-white/70"
                />
              </div>
              <Button variant="secondary" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                <Filter className="w-4 h-4 mr-2" />
                Filtros
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
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
                <TableRow key={contact.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-sm font-medium text-white">
                          {contact.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{contact.name}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{contact.company}</TableCell>
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
                  <TableCell>
                    <Badge variant="outline">{contact.source}</Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" className="hover:bg-gray-100">
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
