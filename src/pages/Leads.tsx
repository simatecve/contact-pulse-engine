import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, MoreVertical, Tag, DollarSign, Settings, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useLeads } from '@/hooks/useLeads';
import { useLeadColumns } from '@/hooks/useLeadColumns';
import { useLeadTags } from '@/hooks/useLeadTags';
import { LeadForm } from '@/components/leads/LeadForm';
import { LeadColumnForm } from '@/components/leads/LeadColumnForm';
import { LeadTagForm } from '@/components/leads/LeadTagForm';
import { ConvertToContactListDialog } from '@/components/leads/ConvertToContactListDialog';

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
  const [leadFormOpen, setLeadFormOpen] = useState(false);
  const [columnFormOpen, setColumnFormOpen] = useState(false);
  const [tagFormOpen, setTagFormOpen] = useState(false);
  const [convertDialogOpen, setConvertDialogOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [selectedColumn, setSelectedColumn] = useState(null);
  const [selectedTag, setSelectedTag] = useState(null);
  const [selectedColumnForConvert, setSelectedColumnForConvert] = useState(null);
  const [draggedLead, setDraggedLead] = useState(null);

  const { leads, isLoading, updateLeadColumn, deleteLead } = useLeads();
  const { columns, initializeDefaultColumn, deleteColumn } = useLeadColumns();
  const { tags, deleteTag, fetchLeadTags } = useLeadTags();

  // Inicializar columna por defecto al cargar
  useEffect(() => {
    if (columns.length === 0) {
      initializeDefaultColumn.mutate();
    }
  }, [columns.length, initializeDefaultColumn]);

  const filteredLeads = leads.filter(lead =>
    lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.company?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLeadMove = async (leadId: string, newColumnId: string) => {
    try {
      await updateLeadColumn.mutateAsync({ leadId, columnId: newColumnId });
    } catch (error) {
      console.error('Error moving lead:', error);
    }
  };

  // Drag & Drop functions
  const handleDragStart = (e: React.DragEvent, lead: any) => {
    setDraggedLead(lead);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    if (draggedLead && draggedLead.column_id !== columnId) {
      await handleLeadMove(draggedLead.id, columnId);
    }
    setDraggedLead(null);
  };

  const handleDragEnd = () => {
    setDraggedLead(null);
  };

  const handleDeleteLead = async (leadId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este lead?')) {
      try {
        await deleteLead.mutateAsync(leadId);
      } catch (error) {
        console.error('Error deleting lead:', error);
      }
    }
  };

  const handleDeleteColumn = async (columnId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta columna? Los leads se moverán a la columna por defecto.')) {
      try {
        await deleteColumn.mutateAsync(columnId);
      } catch (error) {
        console.error('Error deleting column:', error);
      }
    }
  };

  const handleDeleteTag = async (tagId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta etiqueta?')) {
      try {
        await deleteTag.mutateAsync(tagId);
      } catch (error) {
        console.error('Error deleting tag:', error);
      }
    }
  };

  const handleConvertToContactList = (column: any) => {
    const columnLeads = filteredLeads.filter(lead => lead.column_id === column.id);
    setSelectedColumnForConvert({ ...column, leads: columnLeads });
    setConvertDialogOpen(true);
  };

  const totalValue = leads.reduce((sum, lead) => sum + (lead.value || 0), 0);
  const totalLeads = leads.length;
  const highPriorityLeads = leads.filter(lead => lead.priority === 'high').length;
  const conversionRate = totalLeads > 0 ? ((leads.filter(lead => lead.column_id === columns.find(c => c.name.toLowerCase().includes('gan'))?.id).length / totalLeads) * 100).toFixed(1) : '0';

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Cargando...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Leads</h1>
          <p className="text-gray-600 mt-1">Organiza tus oportunidades de venta en formato Kanban</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setTagFormOpen(true)}>
            <Tag className="w-4 h-4 mr-2" />
            Gestionar Etiquetas
          </Button>
          <Button variant="outline" onClick={() => setColumnFormOpen(true)}>
            <Settings className="w-4 h-4 mr-2" />
            Gestionar Columnas
          </Button>
          <Button onClick={() => setLeadFormOpen(true)}>
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
                <p className="text-2xl font-bold text-gray-900">{totalLeads}</p>
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
                <p className="text-2xl font-bold text-gray-900">€{totalValue.toLocaleString()}</p>
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
                <p className="text-2xl font-bold text-gray-900">{conversionRate}%</p>
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
                <p className="text-sm font-medium text-gray-600">Alta Prioridad</p>
                <p className="text-2xl font-bold text-gray-900">{highPriorityLeads}</p>
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
      <div className="flex gap-6 overflow-x-auto min-h-[600px] pb-4">
        {columns.map((column) => {
          const columnLeads = filteredLeads.filter(lead => lead.column_id === column.id);
          
          return (
            <Card 
              key={column.id} 
              className="min-w-[320px] border-0 shadow-sm"
              style={{ backgroundColor: column.color + '20' }}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-700 flex items-center">
                    <span 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: column.color }}
                    />
                    {column.name}
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {columnLeads.length}
                    </Badge>
                  </CardTitle>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="p-1 h-6 w-6">
                        <MoreVertical className="w-3 h-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => handleConvertToContactList(column)}>
                        <Download className="w-4 h-4 mr-2" />
                        Convertir a Lista
                      </DropdownMenuItem>
                      {!column.is_default && (
                        <>
                          <DropdownMenuItem onClick={() => {
                            setSelectedColumn(column);
                            setColumnFormOpen(true);
                          }}>
                            Editar Columna
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteColumn(column.id)}
                            className="text-red-600"
                          >
                            Eliminar Columna
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {columnLeads.map((lead) => (
                  <Card 
                    key={lead.id} 
                    className={`bg-white border shadow-sm hover:shadow-md transition-shadow cursor-move ${
                      draggedLead?.id === lead.id ? 'opacity-50' : ''
                    }`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, lead)}
                    onDragEnd={handleDragEnd}
                  >
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <h3 className="font-medium text-sm text-gray-900 line-clamp-2">
                            {lead.name}
                          </h3>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="p-1 h-6 w-6">
                                <MoreVertical className="w-3 h-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => {
                                setSelectedLead(lead);
                                setLeadFormOpen(true);
                              }}>
                                Editar
                              </DropdownMenuItem>
                              {columns.map((col) => (
                                col.id !== lead.column_id && (
                                  <DropdownMenuItem 
                                    key={col.id}
                                    onClick={() => handleLeadMove(lead.id, col.id)}
                                  >
                                    Mover a {col.name}
                                  </DropdownMenuItem>
                                )
                              ))}
                              <DropdownMenuItem 
                                onClick={() => handleDeleteLead(lead.id)}
                                className="text-red-600"
                              >
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        
                        <div className="space-y-2 text-xs text-gray-600">
                          {lead.email && <p>{lead.email}</p>}
                          {lead.company && <p>{lead.company}</p>}
                        </div>

                        <div className="flex items-center justify-between">
                          {lead.priority && (
                            <Badge className={getPriorityColor(lead.priority)}>
                              {getPriorityText(lead.priority)}
                            </Badge>
                          )}
                          {lead.value && (
                            <span className="text-sm font-medium text-gray-900">
                              €{lead.value.toLocaleString()}
                            </span>
                          )}
                        </div>

                        {lead.notes && (
                          <p className="text-xs text-gray-500 line-clamp-2">
                            {lead.notes}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {/* Add New Lead Button */}
                <button 
                  onClick={() => {
                    setSelectedLead({ column_id: column.id });
                    setLeadFormOpen(true);
                  }}
                  className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors"
                >
                  <Plus className="w-4 h-4 mx-auto mb-1" />
                  <span className="text-xs">Agregar Lead</span>
                </button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Dialogs */}
      <LeadForm
        open={leadFormOpen}
        onOpenChange={setLeadFormOpen}
        lead={selectedLead}
      />

      <LeadColumnForm
        open={columnFormOpen}
        onOpenChange={setColumnFormOpen}
        column={selectedColumn}
      />

      <LeadTagForm
        open={tagFormOpen}
        onOpenChange={setTagFormOpen}
        tag={selectedTag}
      />

      {selectedColumnForConvert && (
        <ConvertToContactListDialog
          open={convertDialogOpen}
          onOpenChange={setConvertDialogOpen}
          leads={selectedColumnForConvert.leads}
          columnName={selectedColumnForConvert.name}
        />
      )}
    </div>
  );
};
