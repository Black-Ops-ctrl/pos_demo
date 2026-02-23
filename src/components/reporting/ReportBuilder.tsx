import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FileText, Download, BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';

const ReportBuilder: React.FC = () => {
  const { customers, invoices, employees, items, purchaseOrders, vendors } = useAppContext();
  const [selectedReport, setSelectedReport] = useState('sales');
  const [chartType, setChartType] = useState('bar');

  const generateSalesReport = () => {
    const salesData = invoices.map(invoice => ({
      id: invoice.id.slice(0, 8),
      customer: invoice.customerName,
      amount: invoice.amount,
      status: invoice.status,
      date: invoice.createdAt?.slice(0, 10) || invoice.dueDate
    }));
    
    const chartData = invoices.reduce((acc: any[], invoice) => {
      const month = new Date(invoice.createdAt || invoice.dueDate).toLocaleDateString('en-US', { month: 'short' });
      const existing = acc.find(item => item.month === month);
      if (existing) {
        existing.sales += invoice.amount;
      } else {
        acc.push({ month, sales: invoice.amount });
      }
      return acc;
    }, []);

    return { data: salesData, chart: chartData, total: invoices.reduce((sum, inv) => sum + inv.amount, 0) };
  };

  const generateInventoryReport = () => {
    const inventoryData = items.map(item => ({
      id: item.id.slice(0, 8),
      name: item.name,
      sku: item.sku,
      quantity: item.quantity,
      price: item.price,
      value: item.quantity * item.price,
      status: item.status
    }));
    
    const chartData = items.reduce((acc: any[], item) => {
      const existing = acc.find(cat => cat.category === item.category);
      if (existing) {
        existing.value += item.quantity * item.price;
      } else {
        acc.push({ category: item.category, value: item.quantity * item.price });
      }
      return acc;
    }, []);

    return { data: inventoryData, chart: chartData, total: items.reduce((sum, item) => sum + (item.quantity * item.price), 0) };
  };

  const generateHRReport = () => {
    const hrData = employees.map(emp => ({
      id: emp.id.slice(0, 8),
      name: emp.name,
      department: emp.department,
      position: emp.position,
      salary: emp.salary,
      status: emp.status,
      hireDate: emp.hireDate
    }));
    
    const chartData = employees.reduce((acc: any[], emp) => {
      const existing = acc.find(dept => dept.department === emp.department);
      if (existing) {
        existing.count += 1;
        existing.totalSalary += emp.salary;
      } else {
        acc.push({ department: emp.department, count: 1, totalSalary: emp.salary });
      }
      return acc;
    }, []);

    return { data: hrData, chart: chartData, total: employees.reduce((sum, emp) => sum + emp.salary, 0) };
  };

  const generatePurchaseReport = () => {
    const purchaseData = purchaseOrders.map(po => ({
      id: po.id.slice(0, 8),
      vendor: po.vendorName,
      amount: po.amount,
      status: po.status,
      date: po.orderDate
    }));
    
    const chartData = purchaseOrders.reduce((acc: any[], po) => {
      const month = new Date(po.orderDate).toLocaleDateString('en-US', { month: 'short' });
      const existing = acc.find(item => item.month === month);
      if (existing) {
        existing.purchases += po.amount;
      } else {
        acc.push({ month, purchases: po.amount });
      }
      return acc;
    }, []);

    return { data: purchaseData, chart: chartData, total: purchaseOrders.reduce((sum, po) => sum + po.amount, 0) };
  };

  const getReportData = () => {
    switch (selectedReport) {
      case 'sales': return generateSalesReport();
      case 'inventory': return generateInventoryReport();
      case 'hr': return generateHRReport();
      case 'purchase': return generatePurchaseReport();
      default: return { data: [], chart: [], total: 0 };
    }
  };

  const reportData = getReportData();
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1'];

  const exportReport = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      Object.keys(reportData.data[0] || {}).join(",") + "\n" +
      reportData.data.map(row => Object.values(row).join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${selectedReport}_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              MetaBooks Report Builder
            </CardTitle>
            <div className="flex gap-2">
              <Select value={selectedReport} onValueChange={setSelectedReport}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sales">Sales Report</SelectItem>
                  <SelectItem value="inventory">Inventory Report</SelectItem>
                  <SelectItem value="hr">HR Report</SelectItem>
                  <SelectItem value="purchase">Purchase Report</SelectItem>
                </SelectContent>
              </Select>
              <Select value={chartType} onValueChange={setChartType}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bar">Bar Chart</SelectItem>
                  <SelectItem value="pie">Pie Chart</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={exportReport} className="bg-green-600 hover:bg-green-700">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                {chartType === 'bar' ? <BarChart3 className="h-5 w-5" /> : <PieChartIcon className="h-5 w-5" />}
                {selectedReport.charAt(0).toUpperCase() + selectedReport.slice(1)} Chart
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === 'bar' ? (
                    <BarChart data={reportData.chart}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey={selectedReport === 'inventory' ? 'category' : selectedReport === 'hr' ? 'department' : 'month'} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey={selectedReport === 'hr' ? 'count' : selectedReport === 'inventory' ? 'value' : selectedReport === 'purchase' ? 'purchases' : 'sales'} fill="#8884d8" />
                    </BarChart>
                  ) : (
                    <PieChart>
                      <Pie
                        data={reportData.chart}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey={selectedReport === 'hr' ? 'count' : selectedReport === 'inventory' ? 'value' : selectedReport === 'purchase' ? 'purchases' : 'sales'}
                      >
                        {reportData.chart.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  )}
                </ResponsiveContainer>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Report Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Total Records:</span>
                  <span className="font-semibold">{reportData.data.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Value:</span>
                  <span className="font-semibold">${reportData.total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Report Type:</span>
                  <span className="font-semibold capitalize">{selectedReport}</span>
                </div>
                <div className="flex justify-between">
                  <span>Generated:</span>
                  <span className="font-semibold">{new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">Report Data</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  {Object.keys(reportData.data[0] || {}).map(key => (
                    <TableHead key={key} className="capitalize">{key}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportData.data.slice(0, 10).map((row, index) => (
                  <TableRow key={index}>
                    {Object.values(row).map((value: any, i) => (
                      <TableCell key={i}>
                        {typeof value === 'number' && (Object.keys(row)[i].includes('amount') || Object.keys(row)[i].includes('salary') || Object.keys(row)[i].includes('price') || Object.keys(row)[i].includes('value')) ? 
                          `$${value.toLocaleString()}` : 
                          Object.keys(row)[i] === 'status' ? 
                            <Badge className={value === 'Active' || value === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                              {value}
                            </Badge> : 
                            value
                        }
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {reportData.data.length > 10 && (
              <p className="text-sm text-gray-500 mt-2">Showing first 10 records of {reportData.data.length} total records</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportBuilder;