
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useUserRoles, AppRole } from '@/hooks/useUserRoles';
import { CreateUserForm } from './CreateUserForm';
import { UserPlus, Settings, Trash2, UserCheck } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const roleLabels: Record<AppRole, string> = {
  admin: 'Administrador',
  manager: 'Gerente',
  agent: 'Agente',
  viewer: 'Visualizador'
};

const roleColors: Record<AppRole, string> = {
  admin: 'bg-red-100 text-red-800',
  manager: 'bg-blue-100 text-blue-800',
  agent: 'bg-green-100 text-green-800',
  viewer: 'bg-gray-100 text-gray-800'
};

export const UserManagement: React.FC = () => {
  const {
    currentUserRole,
    allUsers,
    isLoadingUsers,
    inviteUser,
    updateUserRole,
    deactivateUser
  } = useUserRoles();

  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<AppRole>('viewer');

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inviteEmail.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa un email válido.",
        variant: "destructive",
      });
      return;
    }

    try {
      await inviteUser.mutateAsync({
        email: inviteEmail.trim(),
        role: inviteRole
      });
      
      setInviteEmail('');
      setInviteRole('viewer');
      setIsInviteDialogOpen(false);
    } catch (error) {
      console.error('Error inviting user:', error);
    }
  };

  const handleRoleChange = async (userId: string, newRole: AppRole) => {
    try {
      await updateUserRole.mutateAsync({ userId, newRole });
    } catch (error) {
      console.error('Error updating role:', error);
    }
  };

  const handleDeactivateUser = async (userId: string) => {
    if (window.confirm('¿Estás seguro de que quieres desactivar este usuario?')) {
      try {
        await deactivateUser.mutateAsync(userId);
      } catch (error) {
        console.error('Error deactivating user:', error);
      }
    }
  };

  if (currentUserRole !== 'admin') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Acceso Denegado</CardTitle>
        </CardHeader>
        <CardContent>
          <p>No tienes permisos para ver la gestión de usuarios.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <p className="text-gray-600">Administra usuarios y roles del sistema</p>
        </div>
        
        <div className="flex space-x-2">
          {/* Botón para crear usuario completo */}
          <Button onClick={() => setIsCreateUserOpen(true)}>
            <UserCheck className="w-4 h-4 mr-2" />
            Crear Usuario
          </Button>

          {/* Botón para invitar usuario (método anterior) */}
          <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <UserPlus className="w-4 h-4 mr-2" />
                Invitar Usuario
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invitar Nuevo Usuario</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleInviteUser} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="usuario@empresa.com"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="role">Rol</Label>
                  <Select value={inviteRole} onValueChange={(value: AppRole) => setInviteRole(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="viewer">Visualizador</SelectItem>
                      <SelectItem value="agent">Agente</SelectItem>
                      <SelectItem value="manager">Gerente</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsInviteDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={inviteUser.isPending}>
                    {inviteUser.isPending ? 'Invitando...' : 'Invitar'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Formulario de creación de usuario */}
      <CreateUserForm 
        open={isCreateUserOpen} 
        onOpenChange={setIsCreateUserOpen} 
      />

      <Card>
        <CardHeader>
          <CardTitle>Usuarios del Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingUsers ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Cargando usuarios...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Fecha Asignación</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allUsers.map((userRole) => (
                  <TableRow key={userRole.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {userRole.profiles?.first_name || userRole.profiles?.last_name 
                            ? `${userRole.profiles.first_name || ''} ${userRole.profiles.last_name || ''}`.trim()
                            : 'Sin nombre'}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{userRole.profiles?.email || 'Sin email'}</TableCell>
                    <TableCell>{userRole.profiles?.phone || '-'}</TableCell>
                    <TableCell>{userRole.profiles?.company || '-'}</TableCell>
                    <TableCell>
                      <Badge className={roleColors[userRole.role]}>
                        {roleLabels[userRole.role]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(userRole.assigned_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Select
                          value={userRole.role}
                          onValueChange={(newRole: AppRole) => 
                            handleRoleChange(userRole.user_id, newRole)
                          }
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="viewer">Visualizador</SelectItem>
                            <SelectItem value="agent">Agente</SelectItem>
                            <SelectItem value="manager">Gerente</SelectItem>
                            <SelectItem value="admin">Administrador</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeactivateUser(userRole.user_id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
