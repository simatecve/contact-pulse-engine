
import React, { useState } from 'react';
import { Search, Plus, Filter, MoreVertical, Tag, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const leadColumns = [
  { id: 'new', title: 'Nuevos', color: 'bg-gray-100' },
  { id: 'contacted', title: 'Contactados', color: 'bg-blue-100' },
  { id: 'qualified', title: 'Calificados', color: 'bg-yellow-100' },
  { id: 'proposal', title: 'Propuesta', color: 'bg-orange-100' },
  { id: 'won', title: 'Ganados', color: 'bg-green-100' },
  { id: 'lost', title: 'Perdidos', color: 'bg-red-100' }
];

const sampleLeads = [
  {
    id: 1,
    name: 'Juan Pérez - Tech Solutions',
    email: 'juan@techsolutions.com',
    phone: '+34 123 456 789',
    company: 'Tech Solutions',
    status: 'new',
    priority: 'high',
    value: 15000,
    source: 'Website',
    tags: ['Tecnología', 'Enterprise'],
    notes: 'Interesado en solución completa CRM'
  },
  {
    id: 2,
    name: 'María González - StartupXYZ',
    email: 'maria@startupxyz.com',
    phone: '+34 987 654 321',
    company: 'StartupXYZ',
    status: 'contacted',
    priority: 'medium',
    value: 8500,
    source: 'LinkedIn',
    tags: ['Startup', 'SaaS'],
    notes: 'Reunión programada para la próxima semana'
  },
  {
    id: 3,
    name: 'Carlos Rodríguez - Marketing Pro',
    email: 'carlos@marketingpro.com',
    phone: '+34 555 123 456',
    company: 'Marketing Pro',
    status: 'qualified',
    priority: 'high',
    value: 22000,
    source: 'Referido',
    tags: ['Marketing', 'Agencia'],
    notes: 'Necesita integración con herramientas actuales'
  }
];

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high': return 'bg-red-100 text-red-800';
    case 'medium': return 'bg-yellow-100 text-yellow-800';
    case 'low': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getPriorityText = (priority: string) => {
  switch (priority) {
    case 'high': return 'Alta';
    case 'medium': return 'Media';
    case 'low': return 'Baja';
    default: return priority;
  }
};

export const Leads: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Leads</h1>
          <p className="text-gray-600 mt-1">Organiza tus oportunidades de venta en formato Kanban</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Tag className="w-4 h-4 mr-2" />
            Gestionar Etiquetas
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Lead
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Leads</p>
                <p className="text-2xl font-bold text-gray-900">247</p>
              </div>
              <div className="h-12 w-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <Tag className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Valor Pipeline</p>
                <p className="text-2xl font-bold text-gray-900">€458K</p>
              </div>
              <div className="h-12 w-12 bg-green-50 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tasa Conversión</p>
                <p className="text-2xl font-bold text-gray-900">18.5%</p>
              </div>
              <div className="h-12 w-12 bg-purple-50 rounded-lg flex items-center justify-center">
                <Filter className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cerrados Este Mes</p>
                <p className="text-2xl font-bold text-gray-900">12</p>
              </div>
              <div className="h-12 w-12 bg-yellow-50 rounded-lg flex items-center justify-center">
                <Tag className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar leads..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="w-4 h-4 mr-2" />
          Filtros
        </Button>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 lg:grid-cols-6 gap-6 min-h-[600px]">
        {leadColumns.map((column) => (
          <Card key={column.id} className={`${column.color} border-0`}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-700 flex items-center justify-between">
                {column.title}
                <Badge variant="secondary" className="text-xs">
                  {sampleLeads.filter(lead => lead.status === column.id).length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {sampleLeads
                .filter(lead => lead.status === column.id)
                .map((lead) => (
                  <Card key={lead.id} className="bg-white border shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <h3 className="font-medium text-sm text-gray-900 line-clamp-2">
                            {lead.name}
                          </h3>
                          <Button variant="ghost" size="sm" className="p-1 h-6 w-6">
                            <MoreVertical className="w-3 h-3" />
                          </Button>
                        </div>
                        
                        <div className="space-y-2 text-xs text-gray-600">
                          <p>{lead.email}</p>
                          <p>{lead.company}</p>
                        </div>

                        <div className="flex items-center justify-between">
                          <Badge className={getPriorityColor(lead.priority)}>
                            {getPriorityText(lead.priority)}
                          </Badge>
                          <span className="text-sm font-medium text-gray-900">
                            €{lead.value.toLocaleString()}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {lead.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        <p className="text-xs text-gray-500 line-clamp-2">
                          {lead.notes}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              
              {/* Add New Lead Button */}
              <button className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors">
                <Plus className="w-4 h-4 mx-auto mb-1" />
                <span className="text-xs">Agregar Lead</span>
              </button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
