
import React from 'react';
import { Save, Key, Bell, Users, Shield, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';

export const Settings: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
        <p className="text-gray-600 mt-1">Administra la configuración de tu cuenta y sistema</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>Configuración General</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="company">Nombre de la Empresa</Label>
                  <Input id="company" placeholder="Mi Empresa SA" />
                </div>
                <div>
                  <Label htmlFor="domain">Dominio</Label>
                  <Input id="domain" placeholder="miempresa.com" />
                </div>
              </div>
              
              <div>
                <Label htmlFor="timezone">Zona Horaria</Label>
                <Input id="timezone" value="Europe/Madrid" readOnly />
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Modo Oscuro</Label>
                    <p className="text-sm text-gray-600">Activar tema oscuro</p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Autoguardado</Label>
                    <p className="text-sm text-gray-600">Guardar cambios automáticamente</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Integrations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="w-5 h-5" />
                <span>Integraciones</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="whatsapp">WhatsApp Cloud API Token</Label>
                <Input id="whatsapp" type="password" placeholder="••••••••••••••••" />
                <p className="text-sm text-gray-600 mt-1">Token para integración con WhatsApp Business</p>
              </div>

              <div>
                <Label htmlFor="email">Resend API Key</Label>
                <Input id="email" type="password" placeholder="••••••••••••••••" />
                <p className="text-sm text-gray-600 mt-1">Clave API para envío de emails</p>
              </div>

              <div>
                <Label htmlFor="openai">OpenAI API Key</Label>
                <Input id="openai" type="password" placeholder="••••••••••••••••" />
                <p className="text-sm text-gray-600 mt-1">Clave API para funciones de IA</p>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="w-5 h-5" />
                <span>Notificaciones</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Nuevos Mensajes</Label>
                    <p className="text-sm text-gray-600">Recibir notificaciones de nuevos mensajes</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Campañas Completadas</Label>
                    <p className="text-sm text-gray-600">Notificar cuando termine una campaña</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Reportes Semanales</Label>
                    <p className="text-sm text-gray-600">Recibir resumen semanal por email</p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Alertas de IA</Label>
                    <p className="text-sm text-gray-600">Notificar cuando IA necesite intervención</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Account Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Información de Cuenta</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="w-20 h-20 bg-gray-300 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <span className="text-xl font-medium text-gray-700">AD</span>
                </div>
                <h3 className="font-medium text-gray-900">Admin User</h3>
                <p className="text-sm text-gray-600">admin@crmpro.com</p>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Plan:</span>
                  <span className="font-medium">Professional</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Usuarios:</span>
                  <span className="font-medium">3/10</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Mensajes/mes:</span>
                  <span className="font-medium">1,256/5,000</span>
                </div>
              </div>

              <Button variant="outline" className="w-full">
                Actualizar Plan
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Key className="w-4 h-4 mr-2" />
                Resetear API Keys
              </Button>
              
              <Button variant="outline" className="w-full justify-start">
                <Shield className="w-4 h-4 mr-2" />
                Exportar Datos
              </Button>
              
              <Button variant="outline" className="w-full justify-start">
                <Users className="w-4 h-4 mr-2" />
                Gestionar Usuarios
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button>
          <Save className="w-4 h-4 mr-2" />
          Guardar Cambios
        </Button>
      </div>
    </div>
  );
};
