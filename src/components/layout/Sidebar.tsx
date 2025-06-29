
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  BarChart3, 
  MessageSquare, 
  Users, 
  Send, 
  PieChart, 
  Settings, 
  Bot,
  Home,
  ChevronLeft,
  ChevronRight,
  Target,
  Smartphone,
  UserCog,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useUserRoles } from '@/hooks/useUserRoles';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const menuItems = [
  { icon: Home, label: 'Dashboard', path: '/', permission: 'dashboard.view' },
  { icon: MessageSquare, label: 'Conversaciones', path: '/conversations', permission: 'conversations.view' },
  { icon: Users, label: 'Contactos & Listas', path: '/contacts', permission: 'contacts.view' },
  { icon: Target, label: 'Leads', path: '/leads', permission: 'leads.view' },
  { icon: Send, label: 'Campañas', path: '/campaigns', permission: 'campaigns.view' },
  { icon: Smartphone, label: 'Conexión', path: '/whatsapp-connections', permission: 'whatsapp.view' },
  { icon: PieChart, label: 'Reportes', path: '/reports', permission: 'reports.view' },
  { icon: Bot, label: 'Agentes IA', path: '/ai-agents', permission: 'ai.manage' },
  { icon: UserCog, label: 'Usuarios', path: '/user-management', permission: 'users.view' },
  { icon: Shield, label: 'Permisos', path: '/permission-matrix', permission: 'users.view' },
  { icon: Settings, label: 'Configuración', path: '/settings', permission: 'settings.view' },
];

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const { hasPermission, currentUserRole } = useUserRoles();
  const [permissions, setPermissions] = React.useState<Record<string, boolean>>({});

  React.useEffect(() => {
    const checkPermissions = async () => {
      const permissionChecks = await Promise.all(
        menuItems.map(async (item) => ({
          [item.permission]: await hasPermission(item.permission)
        }))
      );
      
      const permissionMap = permissionChecks.reduce((acc, curr) => ({ ...acc, ...curr }), {});
      setPermissions(permissionMap);
    };

    if (currentUserRole) {
      checkPermissions();
    }
  }, [currentUserRole, hasPermission]);

  const visibleMenuItems = menuItems.filter(item => permissions[item.permission]);

  return (
    <div className={cn(
      "bg-white border-r border-gray-200 h-screen flex flex-col transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <h1 className="font-bold text-xl text-gray-900">CRM Pro</h1>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="p-2"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2">
        <ul className="space-y-1">
          {visibleMenuItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )
                }
              >
                <item.icon className="w-5 h-5" />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Profile */}
      {!collapsed && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-gray-700">
                {currentUserRole?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Usuario</p>
              <p className="text-xs text-gray-500 capitalize">
                {currentUserRole === 'admin' ? 'Administrador' : 
                 currentUserRole === 'manager' ? 'Gerente' :
                 currentUserRole === 'agent' ? 'Agente' : 'Visualizador'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
