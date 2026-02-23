import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Bell, Plus, Edit, Trash2, Mail, MessageSquare, AlertTriangle } from 'lucide-react';

interface Alert {
  id: string;
  name: string;
  condition: string;
  threshold: string;
  frequency: string;
  recipients: string[];
  status: 'active' | 'inactive';
  lastTriggered?: string;
  deliveryMethod: 'email' | 'sms' | 'in-app';
}

const AlertsNotifications: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: '1',
      name: 'Low Stock Alert',
      condition: 'Stock Quantity < 10',
      threshold: '10',
      frequency: 'immediate',
      recipients: ['inventory@company.com'],
      status: 'active',
      lastTriggered: '2024-01-15 10:30',
      deliveryMethod: 'email'
    },
    {
      id: '2',
      name: 'High Expenses Alert',
      condition: 'Monthly Expenses > Budget',
      threshold: '100000',
      frequency: 'daily',
      recipients: ['finance@company.com'],
      status: 'active',
      deliveryMethod: 'email'
    }
  ]);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newAlert, setNewAlert] = useState<Partial<Alert>>({
    name: '',
    condition: '',
    threshold: '',
    frequency: 'daily',
    recipients: [],
    status: 'active',
    deliveryMethod: 'email'
  });

  const conditions = [
    { value: 'stock_low', label: 'Stock Quantity Low' },
    { value: 'sales_target', label: 'Sales Below Target' },
    { value: 'expenses_high', label: 'Expenses Above Budget' },
    { value: 'overdue_invoices', label: 'Overdue Invoices' }
  ];

  const frequencies = [
    { value: 'immediate', label: 'Immediate' },
    { value: 'hourly', label: 'Hourly' },
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' }
  ];

  const deliveryMethods = [
    { value: 'email', label: 'Email', icon: <Mail className="h-4 w-4" /> },
    { value: 'sms', label: 'SMS', icon: <MessageSquare className="h-4 w-4" /> },
    { value: 'in-app', label: 'In-App', icon: <Bell className="h-4 w-4" /> }
  ];

  const createAlert = () => {
    if (newAlert.name && newAlert.condition && newAlert.threshold) {
      const alert: Alert = {
        id: Date.now().toString(),
        name: newAlert.name,
        condition: newAlert.condition,
        threshold: newAlert.threshold,
        frequency: newAlert.frequency || 'daily',
        recipients: newAlert.recipients || [],
        status: newAlert.status || 'active',
        deliveryMethod: newAlert.deliveryMethod || 'email'
      };
      setAlerts([...alerts, alert]);
      setNewAlert({
        name: '',
        condition: '',
        threshold: '',
        frequency: 'daily',
        recipients: [],
        status: 'active',
        deliveryMethod: 'email'
      });
      setShowCreateForm(false);
    }
  };

  const toggleAlertStatus = (id: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === id 
        ? { ...alert, status: alert.status === 'active' ? 'inactive' : 'active' }
        : alert
    ));
  };

  const deleteAlert = (id: string) => {
    setAlerts(alerts.filter(alert => alert.id !== id));
  };

  const getStatusBadge = (status: string) => {
    return (
      <Badge className={status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Alerts & Notifications</h2>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Alert
        </Button>
      </div>

      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Alert</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="alertName">Alert Name</Label>
                <Input
                  id="alertName"
                  value={newAlert.name || ''}
                  onChange={(e) => setNewAlert({...newAlert, name: e.target.value})}
                  placeholder="Enter alert name"
                />
              </div>
              <div>
                <Label htmlFor="condition">Condition</Label>
                <Select value={newAlert.condition} onValueChange={(value) => setNewAlert({...newAlert, condition: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    {conditions.map(condition => (
                      <SelectItem key={condition.value} value={condition.value}>
                        {condition.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="threshold">Threshold Value</Label>
                <Input
                  id="threshold"
                  value={newAlert.threshold || ''}
                  onChange={(e) => setNewAlert({...newAlert, threshold: e.target.value})}
                  placeholder="Enter threshold value"
                />
              </div>
              <div>
                <Label htmlFor="frequency">Frequency</Label>
                <Select value={newAlert.frequency} onValueChange={(value) => setNewAlert({...newAlert, frequency: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {frequencies.map(freq => (
                      <SelectItem key={freq.value} value={freq.value}>
                        {freq.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
              <Button onClick={createAlert}>
                Create Alert
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Active Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Condition</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {alerts.map((alert) => (
                <TableRow key={alert.id}>
                  <TableCell className="font-medium">{alert.name}</TableCell>
                  <TableCell>{alert.condition}</TableCell>
                  <TableCell>{alert.frequency}</TableCell>
                  <TableCell>{getStatusBadge(alert.status)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleAlertStatus(alert.id)}
                      >
                        {alert.status === 'active' ? 'Disable' : 'Enable'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteAlert(alert.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Recent Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="p-2 bg-yellow-50 rounded border-l-4 border-yellow-400">
                <p className="text-sm font-medium">Low Stock Alert</p>
                <p className="text-xs text-gray-600">Item ABC123 below threshold</p>
                <p className="text-xs text-gray-500">2 hours ago</p>
              </div>
              <div className="p-2 bg-red-50 rounded border-l-4 border-red-400">
                <p className="text-sm font-medium">High Expenses</p>
                <p className="text-xs text-gray-600">Monthly budget exceeded</p>
                <p className="text-xs text-gray-500">1 day ago</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alert Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Total Alerts:</span>
                <span className="font-medium">{alerts.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Active:</span>
                <span className="font-medium text-green-600">
                  {alerts.filter(a => a.status === 'active').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Inactive:</span>
                <span className="font-medium text-gray-600">
                  {alerts.filter(a => a.status === 'inactive').length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AlertsNotifications;