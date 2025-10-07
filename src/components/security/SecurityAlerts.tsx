import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, Shield, Settings, Eye, Lock } from 'lucide-react';
import { getAuditDetail } from '@/api/getAuditDetail';

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


const SecurityAlerts: React.FC = () => {
  const [alerts, setSecurityAlerts] = useState<SecurityAlert[]>([]);

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

  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const severities = ['Low', 'Medium', 'High', 'Critical'];
  const statuses = ['Active', 'Acknowledged', 'Resolved'];

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = alert.username.toLowerCase().includes(searchTerm.toLowerCase()) ;
    const matchesSeverity = filterSeverity === 'all' || alert.severity === filterSeverity;
    const matchesStatus = filterStatus === 'all' || alert.status === filterStatus;
    const isFailed = alert.status === 'Failed';
  return matchesSearch && matchesSeverity && matchesStatus && isFailed;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Low': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'High': return 'bg-orange-100 text-orange-800';
      case 'Critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-red-100 text-red-800';
      case 'Acknowledged': return 'bg-yellow-100 text-yellow-800';
      case 'Resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Failed Login': return <Lock className="w-4 h-4" />;
      case 'Suspicious Location': return <Eye className="w-4 h-4" />;
      case 'New Device': return <Shield className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };


  const activeAlerts = alerts.filter(log => log.alert_status === 'Active');
  const criticalAlertsCount = alerts.filter(alert => alert.severity === 'Critical').length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Security Alerts</h2>
        <div className="flex gap-2">
          <Badge variant="destructive" className="px-3 py-1">
            {activeAlerts.length} Active
          </Badge>
          {/*
          <Badge variant="outline" className="px-3 py-1">
            {criticalAlertsCount} Critical
          </Badge>
          */}
        </div>
      </div>

     
        
        
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Security Alerts ({filteredAlerts.length})
                </CardTitle>
                <div className="flex gap-2">
                  <Input
                    placeholder="Search alerts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64"
                  />
                  <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Severity</SelectItem>
                      {severities.map(severity => (
                        <SelectItem key={severity} value={severity}>{severity}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      {statuses.map(status => (
                        <SelectItem key={status} value={status}>{status}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Alert</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAlerts.map((alert) => (
                    <TableRow key={alert.user_id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTypeIcon(alert.action)}
                          <div>
                            <div className="font-medium">{alert.action}</div>
                            <div className="text-sm text-gray-500">{alert.failed_attempts}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{alert.username}</div>
                          <div className="text-sm text-gray-500">ID: {alert.user_id}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          
                          <div className="text-xs text-gray-500">{alert.ip_address}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getSeverityColor(alert.severity)}>
                          {alert.severity}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(alert.status)}>
                          {alert.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                       {new Date(alert.log_time ).toLocaleString('en-PK',
                         {
                            timeZone: 'Asia/Karachi',
                            year: 'numeric',
                            month: 'short',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                            hour12: true,
                          })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
       

       
    
    </div>
  );
};

export default SecurityAlerts;