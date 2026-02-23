import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Users, DollarSign, Package, ShoppingCart, Plus, Settings, Filter } from 'lucide-react';

interface Widget {
  id: string;
  type: 'kpi' | 'chart' | 'table';
  title: string;
  dataSource: string;
  config: any;
  position: { x: number; y: number; w: number; h: number };
}

interface KPIData {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: React.ReactNode;
}

const DashboardManagement: React.FC = () => {
  const [selectedDashboard, setSelectedDashboard] = useState('financial');
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);

  const dashboards = [
    { value: 'financial', label: 'Financial Dashboard' },
    { value: 'operational', label: 'Operational Dashboard' },
    { value: 'hr', label: 'HR Dashboard' },
    { value: 'sales', label: 'Sales Dashboard' },
    { value: 'inventory', label: 'Inventory Dashboard' }
  ];

  const kpiData: KPIData[] = [
    {
      title: 'Total Revenue',
      value: '$2,456,789',
      change: '+12.5%',
      trend: 'up',
      icon: <DollarSign className="h-6 w-6" />
    },
    {
      title: 'Active Customers',
      value: '1,234',
      change: '+8.2%',
      trend: 'up',
      icon: <Users className="h-6 w-6" />
    },
    {
      title: 'Inventory Value',
      value: '$456,123',
      change: '-2.1%',
      trend: 'down',
      icon: <Package className="h-6 w-6" />
    },
    {
      title: 'Orders',
      value: '892',
      change: '+15.3%',
      trend: 'up',
      icon: <ShoppingCart className="h-6 w-6" />
    }
  ];

  const chartData = [
    { name: 'Jan', revenue: 4000, expenses: 2400 },
    { name: 'Feb', revenue: 3000, expenses: 1398 },
    { name: 'Mar', revenue: 2000, expenses: 9800 },
    { name: 'Apr', revenue: 2780, expenses: 3908 },
    { name: 'May', revenue: 1890, expenses: 4800 },
    { name: 'Jun', revenue: 2390, expenses: 3800 }
  ];

  const pieData = [
    { name: 'Sales', value: 400, color: '#0088FE' },
    { name: 'Marketing', value: 300, color: '#00C49F' },
    { name: 'Operations', value: 300, color: '#FFBB28' },
    { name: 'HR', value: 200, color: '#FF8042' }
  ];

  const addWidget = (type: 'kpi' | 'chart' | 'table') => {
    const newWidget: Widget = {
      id: Date.now().toString(),
      type,
      title: `New ${type} Widget`,
      dataSource: 'sales',
      config: {},
      position: { x: 0, y: 0, w: 4, h: 3 }
    };
    setWidgets([...widgets, newWidget]);
  };

  const KPIWidget: React.FC<{ data: KPIData }> = ({ data }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{data.title}</p>
            <p className="text-2xl font-bold">{data.value}</p>
            <div className="flex items-center mt-1">
              {data.trend === 'up' ? (
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm ${data.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                {data.change}
              </span>
            </div>
          </div>
          <div className="text-blue-600">
            {data.icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold">Dashboard Management</h2>
          <Select value={selectedDashboard} onValueChange={setSelectedDashboard}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {dashboards.map(dashboard => (
                <SelectItem key={dashboard.value} value={dashboard.value}>
                  {dashboard.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button
            variant={isEditMode ? "default" : "outline"}
            onClick={() => setIsEditMode(!isEditMode)}
          >
            <Settings className="h-4 w-4 mr-2" />
            {isEditMode ? 'Save Layout' : 'Edit Layout'}
          </Button>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      {isEditMode && (
        <Card>
          <CardHeader>
            <CardTitle>Add Widgets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button onClick={() => addWidget('kpi')} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                KPI Widget
              </Button>
              <Button onClick={() => addWidget('chart')} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Chart Widget
              </Button>
              <Button onClick={() => addWidget('table')} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Table Widget
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="operational">Operational</TabsTrigger>
          <TabsTrigger value="custom">Custom</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {kpiData.map((kpi, index) => (
              <KPIWidget key={index} data={kpi} />
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue vs Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="revenue" fill="#3b82f6" />
                    <Bar dataKey="expenses" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Department Budget</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Monthly Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} />
                  <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <KPIWidget data={kpiData[0]} />
            <KPIWidget data={{
              title: 'Profit Margin',
              value: '23.5%',
              change: '+2.1%',
              trend: 'up',
              icon: <TrendingUp className="h-6 w-6" />
            }} />
            <KPIWidget data={{
              title: 'Cash Flow',
              value: '$123,456',
              change: '+5.7%',
              trend: 'up',
              icon: <DollarSign className="h-6 w-6" />
            }} />
          </div>
        </TabsContent>

        <TabsContent value="operational">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {kpiData.map((kpi, index) => (
              <KPIWidget key={index} data={kpi} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="custom">
          <Card>
            <CardHeader>
              <CardTitle>Custom Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Create your own custom dashboard by adding widgets.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {widgets.map(widget => (
                  <Card key={widget.id} className="border-dashed">
                    <CardContent className="p-4 text-center">
                      <p className="text-sm text-gray-500">{widget.title}</p>
                      <Badge variant="outline">{widget.type}</Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DashboardManagement;