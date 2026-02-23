import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart3, TrendingUp, Users, Package, Download, Calendar } from 'lucide-react';

interface SalesData {
  period: string;
  revenue: number;
  orders: number;
  customers: number;
}

interface ProductSales {
  id: string;
  name: string;
  category: string;
  quantity: number;
  revenue: number;
  profit: number;
}

interface SalespersonPerformance {
  id: string;
  name: string;
  orders: number;
  revenue: number;
  commission: number;
  target: number;
}

const SalesReports: React.FC = () => {
  const [dateRange, setDateRange] = useState('month');
  const [reportType, setReportType] = useState('summary');

  const [salesData] = useState<SalesData[]>([
    { period: 'Jan 2024', revenue: 45000, orders: 120, customers: 85 },
    { period: 'Feb 2024', revenue: 52000, orders: 140, customers: 92 },
    { period: 'Mar 2024', revenue: 48000, orders: 135, customers: 88 },
    { period: 'Apr 2024', revenue: 58000, orders: 155, customers: 105 },
  ]);

  const [topProducts] = useState<ProductSales[]>([
    { id: '1', name: 'Laptop Computer', category: 'Electronics', quantity: 45, revenue: 44995, profit: 9000 },
    { id: '2', name: 'Office Chair', category: 'Furniture', quantity: 32, revenue: 6398, profit: 1920 },
    { id: '3', name: 'Wireless Mouse', category: 'Electronics', quantity: 120, revenue: 3599, profit: 1200 },
    { id: '4', name: 'Desk Lamp', category: 'Furniture', quantity: 28, revenue: 1400, profit: 420 },
  ]);

  const [salespeople] = useState<SalespersonPerformance[]>([
    { id: '1', name: 'John Smith', orders: 45, revenue: 125000, commission: 6250, target: 120000 },
    { id: '2', name: 'Sarah Johnson', orders: 38, revenue: 98000, commission: 4900, target: 100000 },
    { id: '3', name: 'Mike Davis', orders: 52, revenue: 142000, commission: 7100, target: 130000 },
    { id: '4', name: 'Lisa Brown', orders: 41, revenue: 115000, commission: 5750, target: 110000 },
  ]);

  const totalRevenue = salesData.reduce((sum, data) => sum + data.revenue, 0);
  const totalOrders = salesData.reduce((sum, data) => sum + data.orders, 0);
  const totalCustomers = salesData.reduce((sum, data) => sum + data.customers, 0);
  const avgOrderValue = totalRevenue / totalOrders;

  const getPerformanceColor = (actual: number, target: number) => {
    const percentage = (actual / target) * 100;
    if (percentage >= 100) return 'bg-green-100 text-green-800';
    if (percentage >= 80) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <span className="text-2xl font-bold">${totalRevenue.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-500" />
              <span className="text-2xl font-bold">{totalOrders}</span>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-500" />
              <span className="text-2xl font-bold">{totalCustomers}</span>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Avg Order Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-orange-500" />
              <span className="text-2xl font-bold">${avgOrderValue.toFixed(0)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reports */}
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Sales Reports</CardTitle>
            <div className="flex gap-2">
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="summary" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="products">Top Products</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="trends">Trends</TabsTrigger>
            </TabsList>
            
            <TabsContent value="summary" className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Period</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Orders</TableHead>
                    <TableHead>Customers</TableHead>
                    <TableHead>Avg Order</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salesData.map((data, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{data.period}</TableCell>
                      <TableCell>${data.revenue.toLocaleString()}</TableCell>
                      <TableCell>{data.orders}</TableCell>
                      <TableCell>{data.customers}</TableCell>
                      <TableCell>${(data.revenue / data.orders).toFixed(0)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
            
            <TabsContent value="products" className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Profit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{product.category}</Badge>
                      </TableCell>
                      <TableCell>{product.quantity}</TableCell>
                      <TableCell>${product.revenue.toLocaleString()}</TableCell>
                      <TableCell className="text-green-600">${product.profit.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
            
            <TabsContent value="performance" className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Salesperson</TableHead>
                    <TableHead>Orders</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Achievement</TableHead>
                    <TableHead>Commission</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salespeople.map((person) => (
                    <TableRow key={person.id}>
                      <TableCell className="font-medium">{person.name}</TableCell>
                      <TableCell>{person.orders}</TableCell>
                      <TableCell>${person.revenue.toLocaleString()}</TableCell>
                      <TableCell>${person.target.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge className={getPerformanceColor(person.revenue, person.target)}>
                          {((person.revenue / person.target) * 100).toFixed(0)}%
                        </Badge>
                      </TableCell>
                      <TableCell>${person.commission.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
            
            <TabsContent value="trends" className="space-y-4">
              <div className="text-center py-8 text-gray-500">
                <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Sales trend charts would be displayed here</p>
                <p className="text-sm">Integration with charting library needed</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesReports;