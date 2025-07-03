
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
  Shield,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useUserRoles } from '@/hooks/useUserRoles';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const menuItems = [
  { icon: Home, label: 'Dashboard', path: '/', permission: 'dashboard.view', color: 'text-indigo-600' },
  { icon: MessageSquare, label: 'Conversaciones', path: '/conversations', permission: 'conversations.view', color: 'text-blue-600' },
  { icon: Users, label: 'Contactos & Listas', path: '/contacts', permission: 'contacts.view', color: 'text-green-600' },
  { icon: Target, label: 'Leads', path: '/leads', permission: 'leads.view', color: 'text-purple-600' },
  { icon: Send, label: 'Campañas', path: '/campaigns', permission: 'campaigns.view', color: 'text-pink-600' },
  { icon: Smartphone, label: 'Conexión', path: '/whatsapp-connections', permission: 'whatsapp.view', color: 'text-emerald-600' },
  { icon: PieChart, label: 'Reportes', path: '/reports', permission: 'reports.view', color: 'text-orange-600' },
  { icon: Bot, label: 'Agentes IA', path: '/ai-agents', permission: 'ai.manage', color: 'text-violet-600' },
  { icon: UserCog, label: 'Usuarios', path: '/user-management', permission: 'users.view', color: 'text-cyan-600' },
  { icon: Shield, label: 'Permisos', path: '/permission-matrix', permission: 'users.view', color: 'text-red-600' },
  { icon: Settings, label: 'Configuración', path: '/settings', permission: 'settings.view', color: 'text-gray-600' },
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
      "bg-white border-r border-gray-100 h-screen flex flex-col transition-all duration-300 shadow-sm",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-xl text-gray-900">CRM Pro</h1>
              <div className="flex items-center space-x-1">
                <Sparkles className="w-3 h-3 text-indigo-500" />
                <span className="text-xs text-indigo-600 font-medium">IA Powered</span>
              </div>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3">
        <ul className="space-y-2">
          {visibleMenuItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "flex items-center space-x-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 shadow-sm border border-indigo-100"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon className={cn("w-5 h-5", isActive ? "text-indigo-600" : item.color)} />
                    {!collapsed && <span>{item.label}</span>}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Profile */}
      {!collapsed && (
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-gray-50 to-indigo-50 rounded-xl">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-white">
                {currentUserRole?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Usuario</p>
              <p className="text-xs text-gray-500 capitalize flex items-center">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-1"></div>
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
