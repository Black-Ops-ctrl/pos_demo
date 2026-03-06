import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Download, AlertTriangle, TrendingDown, Package } from 'lucide-react';

interface StockReport {
  id: string;
  item: string;
  sku: string;
  warehouse: string;
  currentStock: number;
  reorderLevel: number;
  unitCost: number;
  totalValue: number;
  status: 'normal' | 'low' | 'critical' | 'overstock';
}

const InventoryReports: React.FC = () => {
  const [selectedWarehouse, setSelectedWarehouse] = useState('all');
  
  const stockReports: StockReport[] = [
    { id: '1', item: 'Laptop Computer', sku: 'LAP-001', warehouse: 'Main Warehouse', currentStock: 25, reorderLevel: 10, unitCost: 950, totalValue: 23750, status: 'normal' },
    { id: '2', item: 'Office Chair', sku: 'CHR-001', warehouse: 'Main Warehouse', currentStock: 3, reorderLevel: 5, unitCost: 280, totalValue: 840, status: 'critical' },
    { id: '3', item: 'Wireless Mouse', sku: 'MSE-001', warehouse: 'Secondary Warehouse', currentStock: 8, reorderLevel: 15, unitCost: 45, totalValue: 360, status: 'low' },
    { id: '4', item: 'Desk Lamp', sku: 'LMP-001', warehouse: 'Main Warehouse', currentStock: 45, reorderLevel: 10, unitCost: 75, totalValue: 3375, status: 'overstock' }
  ];

  const movementHistory = [
    { id: '1', item: 'Laptop Computer', date: '2024-01-20', type: 'in', quantity: 10, reference: 'GRN-001', warehouse: 'Main Warehouse' },
    { id: '2', item: 'Office Chair', date: '2024-01-19', type: 'out', quantity: 5, reference: 'SO-001', warehouse: 'Main Warehouse' },
    { id: '3', item: 'Wireless Mouse', date: '2024-01-18', type: 'transfer', quantity: 15, reference: 'ST-001', warehouse: 'Secondary Warehouse' },
    { id: '4', item: 'Desk Lamp', date: '2024-01-17', type: 'in', quantity: 20, reference: 'GRN-002', warehouse: 'Main Warehouse' }
  ];

  const warehouses = ['all', 'Main Warehouse', 'Secondary Warehouse', 'Retail Store'];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'bg-green-100 text-green-800';
      case 'low': return 'bg-yellow-100 text-yellow-800';
      case 'critical': return 'bg-red-100 text-red-800';
      case 'overstock': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'in': return <TrendingDown className="h-4 w-4 text-green-500 rotate-180" />;
      case 'out': return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'transfer': return <Package className="h-4 w-4 text-blue-500" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const filteredReports = selectedWarehouse === 'all' 
    ? stockReports 
    : stockReports.filter(report => report.warehouse === selectedWarehouse);

  const lowStockItems = stockReports.filter(item => item.status === 'low' || item.status === 'critical');
  const totalValue = filteredReports.reduce((sum, item) => sum + item.totalValue, 0);
  const criticalCount = filteredReports.filter(item => item.status === 'critical').length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-500" />
              <span className="text-2xl font-bold">{filteredReports.length}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">${totalValue.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Low Stock Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <span className="text-2xl font-bold text-yellow-600">{lowStockItems.length}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Critical Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <span className="text-2xl font-bold text-red-600">{criticalCount}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Inventory Reports
            </CardTitle>
            <div className="flex gap-2">
              <Select value={selectedWarehouse} onValueChange={setSelectedWarehouse}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {warehouses.map(warehouse => (
                    <SelectItem key={warehouse} value={warehouse}>
                      {warehouse === 'all' ? 'All Warehouses' : warehouse}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button className="bg-gradient-to-r from-green-500 to-green-600 text-primary">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="current" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="current">Current Stock</TabsTrigger>
              <TabsTrigger value="low-stock">Low Stock</TabsTrigger>
              <TabsTrigger value="movement">Movement History</TabsTrigger>
            </TabsList>
            
            <TabsContent value="current" className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Warehouse</TableHead>
                    <TableHead>Current Stock</TableHead>
                    <TableHead>Reorder Level</TableHead>
                    <TableHead>Unit Cost</TableHead>
                    <TableHead>Total Value</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">{report.item}</TableCell>
                      <TableCell>{report.sku}</TableCell>
                      <TableCell>{report.warehouse}</TableCell>
                      <TableCell>{report.currentStock}</TableCell>
                      <TableCell>{report.reorderLevel}</TableCell>
                      <TableCell>${report.unitCost}</TableCell>
                      <TableCell className="font-semibold">${report.totalValue.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(report.status)}>
                          {report.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
            
            <TabsContent value="low-stock" className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Current Stock</TableHead>
                    <TableHead>Reorder Level</TableHead>
                    <TableHead>Shortage</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lowStockItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.item}</TableCell>
                      <TableCell>{item.currentStock}</TableCell>
                      <TableCell>{item.reorderLevel}</TableCell>
                      <TableCell className="text-red-600">
                        {Math.max(0, item.reorderLevel - item.currentStock)}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(item.status)}>
                          {item.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
            
            <TabsContent value="movement" className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Warehouse</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movementHistory.map((movement) => (
                    <TableRow key={movement.id}>
                      <TableCell>{movement.date}</TableCell>
                      <TableCell className="font-medium">{movement.item}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getMovementIcon(movement.type)}
                          <span className="capitalize">{movement.type}</span>
                        </div>
                      </TableCell>
                      <TableCell className={movement.type === 'out' ? 'text-red-600' : 'text-green-600'}>
                        {movement.type === 'out' ? '-' : '+'}{movement.quantity}
                      </TableCell>
                      <TableCell>{movement.reference}</TableCell>
                      <TableCell>{movement.warehouse}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default InventoryReports;