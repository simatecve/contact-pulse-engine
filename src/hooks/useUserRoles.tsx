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
    phone: string | null;
    company: string | null;
  };
}

export interface Permission {
  id: string;
  name: string;
  description: string | null;
  module: string;
  action: string;
}

export interface UserPermission {
  id: string;
  user_id: string;
  permission_id: string;
  granted_by: string | null;
  granted_at: string;
  is_active: boolean;
  permissions?: Permission;
}

export interface CreateUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  company?: string;
  role: AppRole;
  permissions?: string[];
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
      .rpc('has_permission_enhanced', { 
        _user_id: user.id, 
        _permission_name: permission 
      });

    if (error) {
      console.error('Error checking permission:', error);
      return false;
    }
    
    return data || false;
  };

  // Obtener todos los usuarios con sus roles
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
            .select('first_name, last_name, email, phone, company')
            .eq('id', userRole.user_id)
            .single();

          return {
            ...userRole,
            profiles: profile || { 
              first_name: null, 
              last_name: null, 
              email: null,
              phone: null,
              company: null
            }
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

  // Obtener permisos individuales de un usuario
  const getUserPermissions = useQuery({
    queryKey: ['user-permissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_permissions')
        .select(`
          *,
          permissions (
            name,
            description,
            module,
            action
          )
        `)
        .eq('is_active', true);

      if (error) throw error;
      return data as UserPermission[];
    },
    enabled: !!user && currentUserRole === 'admin'
  });

  // Crear nuevo usuario completo - MEJORADO
  const createUser = useMutation({
    mutationFn: async (userData: CreateUserData) => {
      console.log('Creating user with data:', userData);
      
      const { data, error } = await supabase.functions.invoke('admin-create-user', {
        body: userData
      });

      console.log('Function response:', { data, error });

      if (error) {
        console.error('Function invocation error:', error);
        throw new Error(error.message || 'Error al invocar la función');
      }

      if (!data?.success) {
        const errorMessage = data?.error || 'Error desconocido al crear usuario';
        console.error('User creation failed:', errorMessage);
        throw new Error(errorMessage);
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['all-users-roles'] });
      toast({
        title: "Usuario creado",
        description: data.message || "El usuario se creó exitosamente.",
      });
    },
    onError: (error: any) => {
      console.error('CreateUser mutation error:', error);
      
      let errorMessage = "No se pudo crear el usuario.";
      
      if (error.message) {
        if (error.message.includes('ya existe') || error.message.includes('already')) {
          errorMessage = "Ya existe un usuario con este email.";
        } else if (error.message.includes('permisos') || error.message.includes('permission')) {
          errorMessage = "No tienes permisos para crear usuarios.";
        } else if (error.message.includes('campos requeridos')) {
          errorMessage = "Faltan campos requeridos.";
        } else {
          errorMessage = error.message;
        }
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  });

  // Crear nuevo usuario (invitación) - mantener método anterior para compatibilidad
  const inviteUser = useMutation({
    mutationFn: async ({ email, role }: { email: string; role: AppRole }) => {
      const { data: inviteData, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(
        email,
        {
          redirectTo: `${window.location.origin}/login`
        }
      );

      if (inviteError) throw inviteError;

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

  // Asignar permiso individual a usuario
  const assignPermissionToUser = useMutation({
    mutationFn: async ({ userId, permissionId }: { userId: string; permissionId: string }) => {
      const { error } = await supabase
        .from('user_permissions')
        .insert({
          user_id: userId,
          permission_id: permissionId,
          granted_by: user?.id
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-permissions'] });
      toast({
        title: "Permiso asignado",
        description: "El permiso se asignó correctamente al usuario.",
      });
    }
  });

  // Revocar permiso individual de usuario
  const revokePermissionFromUser = useMutation({
    mutationFn: async ({ userId, permissionId }: { userId: string; permissionId: string }) => {
      const { error } = await supabase
        .from('user_permissions')
        .update({ is_active: false })
        .eq('user_id', userId)
        .eq('permission_id', permissionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-permissions'] });
      toast({
        title: "Permiso revocado",
        description: "El permiso se revocó correctamente del usuario.",
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
    userPermissions: getUserPermissions.data || [],
    hasPermission,
    createUser,
    inviteUser,
    updateUserRole,
    assignPermissionToUser,
    revokePermissionFromUser,
    deactivateUser
  };
};
