import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, Calculator, DollarSign, BarChart3 } from 'lucide-react';

interface ValuationItem {
  id: string;
  item: string;
  quantity: number;
  unitCost: number;
  totalValue: number;
  method: 'FIFO' | 'LIFO' | 'WAC';
}

const StockValuation: React.FC = () => {
  const [selectedMethod, setSelectedMethod] = useState<'FIFO' | 'LIFO' | 'WAC'>('FIFO');
  
  const valuationData = {
    FIFO: [
      { id: '1', item: 'Laptop Computer', quantity: 25, unitCost: 950.00, totalValue: 23750.00, method: 'FIFO' as const },
      { id: '2', item: 'Office Chair', quantity: 15, unitCost: 280.00, totalValue: 4200.00, method: 'FIFO' as const },
      { id: '3', item: 'Wireless Mouse', quantity: 50, unitCost: 45.00, totalValue: 2250.00, method: 'FIFO' as const }
    ],
    LIFO: [
      { id: '1', item: 'Laptop Computer', quantity: 25, unitCost: 1050.00, totalValue: 26250.00, method: 'LIFO' as const },
      { id: '2', item: 'Office Chair', quantity: 15, unitCost: 320.00, totalValue: 4800.00, method: 'LIFO' as const },
      { id: '3', item: 'Wireless Mouse', quantity: 50, unitCost: 52.00, totalValue: 2600.00, method: 'LIFO' as const }
    ],
    WAC: [
      { id: '1', item: 'Laptop Computer', quantity: 25, unitCost: 1000.00, totalValue: 25000.00, method: 'WAC' as const },
      { id: '2', item: 'Office Chair', quantity: 15, unitCost: 300.00, totalValue: 4500.00, method: 'WAC' as const },
      { id: '3', item: 'Wireless Mouse', quantity: 50, unitCost: 48.50, totalValue: 2425.00, method: 'WAC' as const }
    ]
  };

  const currentItems = valuationData[selectedMethod];
  const totalValue = currentItems.reduce((sum, item) => sum + item.totalValue, 0);
  const totalQuantity = currentItems.reduce((sum, item) => sum + item.quantity, 0);
  const avgUnitCost = totalQuantity > 0 ? totalValue / totalQuantity : 0;

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'FIFO': return 'bg-blue-100 text-blue-800';
      case 'LIFO': return 'bg-green-100 text-green-800';
      case 'WAC': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Current Method</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-blue-500" />
              <Badge className={getMethodColor(selectedMethod)}>
                {selectedMethod}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              <span className="text-2xl font-bold">${totalValue.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Items Valued</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-purple-500" />
              <span className="text-2xl font-bold">{currentItems.length}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Avg Unit Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-orange-500" />
              <span className="text-2xl font-bold">${avgUnitCost.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Stock Valuation</CardTitle>
            <div className="flex gap-2">
              <Select value={selectedMethod} onValueChange={(value: any) => setSelectedMethod(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FIFO">FIFO</SelectItem>
                  <SelectItem value="LIFO">LIFO</SelectItem>
                  <SelectItem value="WAC">Weighted Average</SelectItem>
                </SelectContent>
              </Select>
              <Button className="bg-gradient-to-r from-green-500 to-green-600">
                <DollarSign className="h-4 w-4 mr-2" />
                Post to GL
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="current" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="current">Current Valuation</TabsTrigger>
              <TabsTrigger value="comparison">Method Comparison</TabsTrigger>
            </TabsList>
            
            <TabsContent value="current" className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Unit Cost</TableHead>
                    <TableHead>Total Value</TableHead>
                    <TableHead>Method</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.item}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>${item.unitCost.toFixed(2)}</TableCell>
                      <TableCell className="font-semibold">${item.totalValue.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge className={getMethodColor(item.method)}>
                          {item.method}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
            
            <TabsContent value="comparison" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(valuationData).map(([key, items]) => {
                  const methodTotal = items.reduce((sum, item) => sum + item.totalValue, 0);
                  return (
                    <Card key={key} className={`border-2 ${selectedMethod === key ? 'border-blue-500' : 'border-gray-200'}`}>
                      <CardHeader>
                        <CardTitle className="text-lg">{key}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                          ${methodTotal.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {items.length} items
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default StockValuation;