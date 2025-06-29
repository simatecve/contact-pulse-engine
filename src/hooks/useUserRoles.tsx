
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

export type AppRole = 'admin' | 'manager' | 'agent' | 'viewer';

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  assigned_by: string | null;
  assigned_at: string;
  is_active: boolean;
  profiles?: {
    first_name: string | null;
    last_name: string | null;
    email: string | null;
  };
}

export interface Permission {
  id: string;
  name: string;
  description: string | null;
  module: string;
  action: string;
}

export const useUserRoles = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Obtener el rol del usuario actual
  const { data: currentUserRole, isLoading: isLoadingCurrentRole } = useQuery({
    queryKey: ['current-user-role', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .rpc('get_user_role', { _user_id: user.id });

      if (error) throw error;
      return data as AppRole;
    },
    enabled: !!user
  });

  // Verificar si el usuario tiene un permiso específico
  const hasPermission = async (permission: string): Promise<boolean> => {
    if (!user) return false;
    
    const { data, error } = await supabase
      .rpc('has_permission', { 
        _user_id: user.id, 
        _permission_name: permission 
      });

    if (error) {
      console.error('Error checking permission:', error);
      return false;
    }
    
    return data || false;
  };

  // Obtener todos los usuarios con sus roles (solo para admins)
  const { data: allUsers = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: ['all-users-roles'],
    queryFn: async () => {
      // Primero obtenemos los user_roles
      const { data: userRoles, error: userRolesError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('is_active', true)
        .order('assigned_at', { ascending: false });

      if (userRolesError) throw userRolesError;

      // Luego obtenemos los profiles para cada usuario
      const usersWithProfiles = await Promise.all(
        userRoles.map(async (userRole) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('first_name, last_name, email')
            .eq('id', userRole.user_id)
            .single();

          return {
            ...userRole,
            profiles: profile || { first_name: null, last_name: null, email: null }
          };
        })
      );

      return usersWithProfiles as UserRole[];
    },
    enabled: !!user && currentUserRole === 'admin'
  });

  // Obtener todos los permisos
  const { data: permissions = [], isLoading: isLoadingPermissions } = useQuery({
    queryKey: ['permissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('permissions')
        .select('*')
        .order('module', { ascending: true });

      if (error) throw error;
      return data as Permission[];
    },
    enabled: !!user
  });

  // Obtener permisos de un rol específico
  const { data: rolePermissions = [], refetch: refetchRolePermissions } = useQuery({
    queryKey: ['role-permissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('role_permissions')
        .select(`
          role,
          permission_id,
          permissions (
            name,
            description,
            module,
            action
          )
        `);

      if (error) throw error;
      return data;
    },
    enabled: !!user && currentUserRole === 'admin'
  });

  // Crear nuevo usuario (invitación)
  const inviteUser = useMutation({
    mutationFn: async ({ email, role }: { email: string; role: AppRole }) => {
      // Primero invitamos al usuario
      const { data: inviteData, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(
        email,
        {
          redirectTo: `${window.location.origin}/login`
        }
      );

      if (inviteError) throw inviteError;

      // Luego asignamos el rol
      if (inviteData.user) {
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: inviteData.user.id,
            role,
            assigned_by: user?.id
          });

        if (roleError) throw roleError;
      }

      return inviteData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-users-roles'] });
      toast({
        title: "Usuario invitado",
        description: "Se ha enviado una invitación al usuario.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo invitar al usuario.",
        variant: "destructive",
      });
    }
  });

  // Actualizar rol de usuario
  const updateUserRole = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: AppRole }) => {
      const { error } = await supabase
        .from('user_roles')
        .update({ 
          role: newRole,
          assigned_by: user?.id 
        })
        .eq('user_id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-users-roles'] });
      toast({
        title: "Rol actualizado",
        description: "El rol del usuario se actualizó correctamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "No se pudo actualizar el rol del usuario.",
        variant: "destructive",
      });
    }
  });

  // Desactivar usuario
  const deactivateUser = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('user_roles')
        .update({ is_active: false })
        .eq('user_id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-users-roles'] });
      toast({
        title: "Usuario desactivado",
        description: "El usuario ha sido desactivado correctamente.",
      });
    }
  });

  return {
    currentUserRole,
    isLoadingCurrentRole,
    allUsers,
    isLoadingUsers,
    permissions,
    isLoadingPermissions,
    rolePermissions,
    refetchRolePermissions,
    hasPermission,
    inviteUser,
    updateUserRole,
    deactivateUser
  };
};
