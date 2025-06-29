
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useUserRoles, AppRole } from '@/hooks/useUserRoles';
import { Check, X } from 'lucide-react';

const roleLabels: Record<AppRole, string> = {
  admin: 'Admin',
  manager: 'Manager',
  agent: 'Agente',
  viewer: 'Viewer'
};

export const PermissionMatrix: React.FC = () => {
  const { permissions, rolePermissions, isLoadingPermissions, currentUserRole } = useUserRoles();

  const groupedPermissions = permissions.reduce((acc, permission) => {
    if (!acc[permission.module]) {
      acc[permission.module] = [];
    }
    acc[permission.module].push(permission);
    return acc;
  }, {} as Record<string, any[]>);

  const hasRolePermission = (role: AppRole, permissionId: string): boolean => {
    return rolePermissions.some(rp => rp.role === role && rp.permission_id === permissionId);
  };

  if (currentUserRole !== 'admin') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Acceso Denegado</CardTitle>
        </CardHeader>
        <CardContent>
          <p>No tienes permisos para ver la matriz de permisos.</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoadingPermissions) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Matriz de Permisos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Cargando permisos...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Matriz de Permisos</h1>
        <p className="text-gray-600">Visualiza los permisos asignados a cada rol</p>
      </div>

      {Object.entries(groupedPermissions).map(([module, modulePermissions]) => (
        <Card key={module}>
          <CardHeader>
            <CardTitle className="capitalize">{module}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Permiso</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Admin</TableHead>
                  <TableHead>Manager</TableHead>
                  <TableHead>Agente</TableHead>
                  <TableHead>Viewer</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {modulePermissions.map((permission) => (
                  <TableRow key={permission.id}>
                    <TableCell>
                      <Badge variant="outline">{permission.name}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {permission.description}
                    </TableCell>
                    {(['admin', 'manager', 'agent', 'viewer'] as AppRole[]).map((role) => (
                      <TableCell key={role}>
                        {hasRolePermission(role, permission.id) ? (
                          <Check className="w-5 h-5 text-green-600" />
                        ) : (
                          <X className="w-5 h-5 text-red-400" />
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
