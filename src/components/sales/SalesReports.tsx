import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart3, TrendingUp, Users, Package, Download, Calendar, Loader2 } from 'lucide-react';

interface SalesData {
  period: string;
  revenue: number;
  orders: number;
  customers: number;
  avg_order: number;
}

interface ProductSales {
  id: string;
  name: string;
  category: string;
  quantity: number;
  revenue: number;
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
  const [loading, setLoading] = useState(true);
  const [topProductsLoading, setTopProductsLoading] = useState(true);
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [topProducts, setTopProducts] = useState<ProductSales[]>([]);
  const [summaryData, setSummaryData] = useState({
    total_revenue: 0,
    total_orders: 0,
    total_customers: 0,
    avg_order_value: 0
  });

  const [salespeople] = useState<SalespersonPerformance[]>([
    { id: '1', name: 'John Smith', orders: 45, revenue: 125000, commission: 6250, target: 120000 },
    { id: '2', name: 'Sarah Johnson', orders: 38, revenue: 98000, commission: 4900, target: 100000 },
    { id: '3', name: 'Mike Davis', orders: 52, revenue: 142000, commission: 7100, target: 130000 },
    { id: '4', name: 'Lisa Brown', orders: 41, revenue: 115000, commission: 5750, target: 110000 },
  ]);

  // Fetch top products data from API
  const fetchTopProducts = async (range: string) => {
    try {
      setTopProductsLoading(true);
      
      // Map frontend date range to API operation for top products
      let operation = 3; // Operation 3 for top products
      
      const response = await fetch('http://84.16.235.111:2149/api/sales-dashboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          p_operation: operation
        })
      });

      const result = await response.json();
      console.log('Top Products API Response:', result);
      
      if (result.status === 'success' && result.data && result.data.length > 0) {
        // Transform API data for top products table
        const transformedProducts: ProductSales[] = result.data.map((item: any, index: number) => ({
          id: item.product_id?.toString() || index.toString(),
          name: item.product_name || 'N/A',
          category: item.category_name || 'N/A',
          quantity: parseFloat(item.quantity) || 0,
          revenue: parseFloat(item.total_revenue) || 0
        }));
        
        setTopProducts(transformedProducts);
      } else {
        setTopProducts([]);
      }
    } catch (error) {
      console.error('Error fetching top products data:', error);
      setTopProducts([]);
    } finally {
      setTopProductsLoading(false);
    }
  };

  // Fetch dashboard data from API based on selected date range
  const fetchDashboardData = async (range: string) => {
    try {
      setLoading(true);
      
      // Map frontend date range to API operation
      let operation = 1;
      switch(range) {
        case 'week':
          operation = 2; 
          break;
        case 'month':
          operation = 2; 
          break;
        case 'year':
          operation = 2; 
          break;
        default:
          operation = 1;
      }
      
      const response = await fetch('http://84.16.235.111:2149/api/sales-dashboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          p_operation: operation
        })
      });

      const result = await response.json();
      console.log('API Response for', range, ':', result);
      
      if (result.status === 'success' && result.data && result.data.length > 0) {
        const apiData = result.data[0];
        
        // Update summary data
        setSummaryData({
          total_revenue: parseFloat(apiData.total_revenue) || 0,
          total_orders: parseFloat(apiData.total_orders) || 0,
          total_customers: parseFloat(apiData.total_customers) || 0,
          avg_order_value: parseFloat(apiData.avg_order_value) || 0
        });
        
        // Update table data
        const transformedData: SalesData[] = result.data.map((item: any) => ({
          period: item.periods && item.periods !== null ? item.periods : getPeriodLabel(range),
          revenue: parseFloat(item.total_revenue) || 0,
          orders: parseFloat(item.total_orders) || 0,
          customers: parseFloat(item.total_customers) || 0,
          avg_order: parseFloat(item.avg_order_value) || 0
        }));
        
        setSalesData(transformedData);
      } else {
        // Handle empty response
        setSummaryData({
          total_revenue: 0,
          total_orders: 0,
          total_customers: 0,
          avg_order_value: 0
        });
        setSalesData([]);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setSummaryData({
        total_revenue: 0,
        total_orders: 0,
        total_customers: 0,
        avg_order_value: 0
      });
      setSalesData([]);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get period label
  const getPeriodLabel = (range: string): string => {
    const now = new Date();
    switch(range) {
      case 'week':
        return `Week ${Math.ceil(now.getDate() / 7)} ${now.toLocaleString('default', { month: 'short' })} ${now.getFullYear()}`;
      case 'month':
        return `${now.toLocaleString('default', { month: 'short' })} ${now.getFullYear()}`;
      case 'year':
        return `${now.getFullYear()}`;
      default:
        return `${now.toLocaleString('default', { month: 'short' })} ${now.getFullYear()}`;
    }
  };

  // Fetch data when date range changes
  useEffect(() => {
    fetchDashboardData(dateRange);
    fetchTopProducts(dateRange);
  }, [dateRange]);

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
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
              ) : (
                <span className="text-2xl font-bold">Rs. {summaryData.total_revenue.toLocaleString()}</span>
              )}
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
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
              ) : (
                <span className="text-2xl font-bold">{summaryData.total_orders.toLocaleString()}</span>
              )}
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
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
              ) : (
                <span className="text-2xl font-bold">{summaryData.total_customers.toLocaleString()}</span>
              )}
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
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
              ) : (
                <span className="text-2xl font-bold">Rs. {summaryData.avg_order_value.toLocaleString()}</span>
              )}
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
            <TabsList className="grid w-full grid-cols-2 gap-2 bg-transparent p-1">
              <TabsTrigger 
                value="summary" 
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
              >
                Summary
              </TabsTrigger>
              <TabsTrigger 
                value="products" 
                className="data-[state=active]:bg-purple-600 data-[state=active]:text-white bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors"
              >
                Top Products
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="summary" className="space-y-4">
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : salesData.length > 0 ? (
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
                        <TableCell>Rs. {data.revenue.toLocaleString()}</TableCell>
                        <TableCell>{data.orders.toLocaleString()}</TableCell>
                        <TableCell>{data.customers.toLocaleString()}</TableCell>
                        <TableCell>Rs. {data.avg_order.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No sales data available for selected {dateRange}</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="products" className="space-y-4">
              {topProductsLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : topProducts.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Revenue</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{product.category}</Badge>
                        </TableCell>
                        <TableCell>{product.quantity.toLocaleString()}</TableCell>
                        <TableCell>Rs. {product.revenue.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No top products data available for selected {dateRange}</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesReports;