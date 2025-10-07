import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Shield, Users, FileText, Settings, AlertTriangle, Lock } from 'lucide-react';
import UserManagement from '../security/UserManagement';
import RoleManagement from '../security/RoleManagement';
import AuditLogs from '../security/AuditLogs';
import AuthenticationSettings from '../security/AuthenticationSettings';
import SecurityAlerts from '../security/SecurityAlerts';
import { getUsers } from '@/api/usersApi';
import { getRoles } from '@/api/rolesApi';
import { getAuditDetail } from '@/api/getAuditDetail';


interface User {
  user_id: number;
  user_name: string;
  email: string;
  full_name: string;
  password:string;
  dep_id: number,
  dep_name: string,
  branch_id:number,
  branch_name:string,
  role_id:number,
  role_name :string,
  status:string,
  created_by:number,
  creation_date:Date,
  updated_by:number,
  updated_date: Date,
  mfaEnabled :boolean
}
interface Role {
  role_id: number | null;
  role_name: string;
  description: string;
  created_by: number;
  updated_by: number | null;

  // Permissions (int 0/1)
  sales_read: number;
  sales_write: number;
  sales_delete: number;
  sales_export: number;
  sales_approve: number;

  accounting_read: number;
  accounting_write: number;
  accounting_delete: number;
  accounting_export: number;
  accounting_approve: number;

  hr_read: number;
  hr_write: number;
  hr_delete: number;
  hr_export: number;
  hr_approve: number;

  inventory_read: number;
  inventory_write: number;
  inventory_delete: number;
  inventory_export: number;
  inventory_approve: number;

  crm_read: number;
  crm_write: number;
  crm_delete: number;
  crm_export: number;
  crm_approve: number;

  purchasing_read: number;
  purchasing_write: number;
  purchasing_delete: number;
  purchasing_export: number;
  purchasing_approve: number;

  reports_read: number;
  reports_write: number;
  reports_delete: number;
  reports_export: number;
  reports_approve: number;

  security_read: number;
  security_write: number;
  security_delete: number;
  security_export: number;
  security_approve: number;
}
interface SecurityAlert {
  log_id: number;
  log_time: Date;
  user_id: number;
  username: string;
  action: string;
  module: string;
  object: string;
  ip_address: string;
  details: string;
  severity: string;
  failed_attempts:number;
  status: string ;
   alert_status: string;
 
}

const SecurityModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
   const [alerts, setSecurityAlerts] = useState<SecurityAlert[]>([]);
  

  const securityStats = {
   // totalUsers: 156,
   // activeUsers: 142,
   // lockedUsers: 3,
    //totalRoles: 8,
   // activeAlerts: 5,
   // criticalAlerts: 2,
    auditLogs: 1247,
    mfaEnabled: 89
  };

  const recentActivities = [
    { id: '1', action: 'User Login', user: 'john.doe', timestamp: '2024-01-15 10:30:00', status: 'Success' },
    { id: '2', action: 'Role Assignment', user: 'admin', timestamp: '2024-01-15 10:25:00', status: 'Success' },
    { id: '3', action: 'Failed Login', user: 'jane.smith', timestamp: '2024-01-15 10:20:00', status: 'Failed' },
    { id: '4', action: 'Password Change', user: 'mike.wilson', timestamp: '2024-01-15 10:15:00', status: 'Success' },
    { id: '5', action: 'Account Locked', user: 'system', timestamp: '2024-01-15 10:10:00', status: 'Warning' }
  ];

   //  Fetch users list
   const loadusers = async () => {
       try {
         const res = await getUsers();
         setUsers(res.data || res);
       } catch (error) {
         console.error("Error loading users", error);
       }
     };
     useEffect(() => {
       loadusers();
     }, []);
      const loadRoles = async () => {
            try {
              const res = await getRoles();
              setRoles(res.data || res);
            } catch (error) {
              console.error("Error loading users", error);
            }
          };
          useEffect(() => {
            loadRoles();
          }, []);

           const loadDetail = async () => {
                   try {
                     const res = await getAuditDetail();
                     setSecurityAlerts(res);
                     console.log(alerts);
                   } catch (error) {
                     console.error("Error loading users", error);
                   }
                 };
                 useEffect(() => {
                   loadDetail();
                 }, []);
       const activeAlerts = alerts.filter(log => log.alert_status === 'Active');
     const activeUsers = users.filter(user => user.status === "ACTIVE");
      const lockedUsers = users.filter(user => user.status === "LOCKED");

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Success': return 'bg-green-100 text-green-800';
      case 'Failed': return 'bg-red-100 text-red-800';
      case 'Warning': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Access Control & Security</h1>
        <Badge variant="outline" className="px-3 py-1">
          <Shield className="w-4 h-4 mr-1" />
          Security Module
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
        {/*  <TabsTrigger value="auth">Authentication</TabsTrigger> */}
          <TabsTrigger value="alerts">Security Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{users.length}</div>
                <p className="text-xs text-muted-foreground">
                  {activeUsers.length} active, {lockedUsers.length} locked
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Security Roles</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{roles.length}</div>
                <p className="text-xs text-muted-foreground">
                  Including system and custom roles
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{activeAlerts.length}</div>
                
              </CardContent>
            </Card>
{/* 
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">MFA Enabled</CardTitle>
                <Lock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{securityStats.mfaEnabled}%</div>
                <p className="text-xs text-muted-foreground">
                  Of active users have MFA enabled
                </p>
              </CardContent>
            </Card>
            */}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Recent Security Activities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{activity.action}</div>
                        <div className="text-sm text-gray-500">
                          User: {activity.user} • {activity.timestamp}
                        </div>
                      </div>
                      <Badge className={getStatusColor(activity.status)}>
                        {activity.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Security Configuration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">Password Policy</div>
                      <div className="text-sm text-gray-500">Minimum 8 characters, complexity required</div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">Multi-Factor Authentication</div>
                      <div className="text-sm text-gray-500">TOTP, SMS, Email methods available</div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">Session Timeout</div>
                      <div className="text-sm text-gray-500">30 minutes of inactivity</div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Configured</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">Audit Logging</div>
                      <div className="text-sm text-gray-500">{securityStats.auditLogs} events logged</div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users">
          <UserManagement />
        </TabsContent>

        <TabsContent value="roles">
          <RoleManagement />
        </TabsContent>

        <TabsContent value="audit">
          <AuditLogs />
        </TabsContent>

        <TabsContent value="auth">
          <AuthenticationSettings />
        </TabsContent>

        <TabsContent value="alerts">
          <SecurityAlerts />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SecurityModule;