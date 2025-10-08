import React, { useState } from 'react';
// 1. Import useNavigate (Assuming react-router-dom is used)
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ColorfulTabs, ColorfulTabsList, ColorfulTabsTrigger, ColorfulTabsContent } from '@/components/ui/colorful-tabs';
import { BarChart3, Package, ShoppingCart, Users, DollarSign, TrendingUp, Truck, UserCheck, Shield, Bell, Moon, Sun, FileText, CreditCard, BarChart, LogOut, User } from 'lucide-react'; // Added User icon
import { useAppContext } from '@/contexts/AppContext';
import StatsCard from './dashboard/StatsCard';
import DonutChart from './dashboard/DonutChart';
import CustomLineChart from './dashboard/LineChart';
import CustomBarChart from './dashboard/BarChart';
import InventoryModule from './modules/InventoryModule';
import SalesModule from './modules/SalesModule';
import CRMModule from './modules/CRMModule';
import AccountingModule from './modules/AccountingModule';
import ReportsModule from './modules/ReportsModule';
import PurchasingModule from './modules/PurchasingModule';
import HRModule from './modules/HRModule';
import SecurityModule from './modules/SecurityModule';
import QuotationForm from './forms/QuotationForm';
import SalesOrderForm from './forms/SalesOrderForm';
import InvoiceForm from './forms/InvoiceForm';

const ERPDashboard: React.FC = () => {
  // 2. Initialize useNavigate
  const navigate = useNavigate();

  const [activeModule, setActiveModule] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(false);
  const [activeQuickAction, setActiveQuickAction] = useState<string | null>(null);

  // Destructure 'user' from useAppContext
  const { customers, invoices, employees, items, user } = useAppContext();

  // --- 🛠️ FIX APPLIED: Consolidated User Name Logic 🛠️ ---
  // Get username from context (priority), or sessionStorage as a fallback.
const userNameFromStorage =
  localStorage.getItem("userNameForDashboard") ||
  sessionStorage.getItem("userNameForDashboard") ||
  "John Doe";

const userName = user?.name || user?.username || userNameFromStorage;

  // --------------------------------------------------------

  // Updated function for handling logout
  const handleLogout = () => {
    localStorage.removeItem('userToken');
    sessionStorage.clear(); // Session storage bhi clear karein
    console.log('User logged out. Redirecting to login.');
    navigate('/login');
  };

  const modules = [
    { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
    { id: 'sales', name: 'Sales & POS', icon: ShoppingCart },
    { id: 'inventory', name: 'Inventory', icon: Package },
    { id: 'purchasing', name: 'Purchases', icon: Truck },
    { id: 'hr', name: 'HR & Payroll', icon: UserCheck },
    { id: 'accounting', name: 'Accounting', icon: DollarSign },
    { id: 'reports', name: 'Reports', icon: TrendingUp },
    { id: 'crm', name: 'CRM', icon: Users },
    { id: 'security', name: 'Security', icon: Shield },
  ];

  const quickActions = [
    { id: 'quotation', title: 'New Quotation', icon: FileText },
    { id: 'sales-order', title: 'Sales Order', icon: ShoppingCart },
    { id: 'invoice', title: 'Create Invoice', icon: CreditCard },
    { id: 'reports', title: 'View Reports', icon: BarChart },
  ];

  const handleQuickAction = (actionId: string) => {
    if (actionId === 'reports') {
      setActiveModule('reports');
    } else {
      setActiveQuickAction(actionId);
    }
  };

  const closeQuickActionDialog = () => {
    setActiveQuickAction(null);
  };

  const totalSales = invoices.reduce((sum, inv) => sum + inv.amount, 0);
  const totalInventoryValue = items.reduce((sum, item) => sum + (item.quantity * item.price), 0); // Note: totalInventoryValue is not currently used in stats
  const lowStockItems = items.filter(item => item.quantity <= item.minStock).length;

  const stats = [
    { title: 'Total Sales', value: `$${totalSales.toLocaleString()}`, change: '+12%', trend: 'up' as const, icon: DollarSign, color: 'from-blue-500 to-blue-600' },
    { title: 'Inventory Items', value: items.length.toString(), change: '+5%', trend: 'up' as const, icon: Package, color: 'from-green-500 to-green-600' },
    { title: 'Active Employees', value: employees.filter(e => e.status === 'Active').length.toString(), change: '+3%', trend: 'up' as const, icon: UserCheck, color: 'from-purple-500 to-purple-600' },
    { title: 'Low Stock Alerts', value: lowStockItems.toString(), change: '+2', trend: 'up' as const, icon: Bell, color: 'from-red-500 to-red-600' },
  ];

  const salesData = [
    { name: 'Electronics', value: 4500, color: '#2F80ED' },
    { name: 'Clothing', value: 3200, color: '#EB5757' },
    { name: 'Food', value: 2800, color: '#27AE60' },
    { name: 'Books', value: 1500, color: '#9B51E0' },
    { name: 'Sports', value: 1200, color: '#F2C94C' },
  ];

  const revenueData = [
    { name: 'Jan', value: 4000 },
    { name: 'Feb', value: 3000 },
    { name: 'Mar', value: 5000 },
    { name: 'Apr', value: 4500 },
    { name: 'May', value: 6000 },
    { name: 'Jun', value: 5500 },
    { name: 'Jul', value: 7000 },
    { name: 'Aug', value: 6500 },
    { name: 'Sep', value: 8000 },
    { name: 'Oct', value: 7500 },
    { name: 'Nov', value: 9000 },
    { name: 'Dec', value: 8500 },
  ];

  const expenseData = [
    { name: 'HR', value: 45 },
    { name: 'Marketing', value: 32 },
    { name: 'IT', value: 28 },
    { name: 'Operations', value: 38 },
    { name: 'Finance', value: 25 },
  ];

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-indigo-100'}`}>
      <div className="container mx-auto p-6 ">
        <div className="mb-8 flex items-center justify-between no-print">
          <div>
            <h1 className={`text-4xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>MetaBooks</h1>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Smarter Operations, Faster Growth</p>
          </div>
          <div className="flex items-center gap-4">
            {/* Display Username/User Profile Button */}
            <Card className="p-2 border-none shadow-sm bg-white/70 backdrop-blur-md">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-blue-600" />
                <span className="font-semibold text-sm text-gray-800 hidden sm:inline">{userName}</span>
              </div>
            </Card>

            {/* --- LOGOUT BUTTON --- */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="text-red-500 hover:text-red-600 hover:bg-red-50"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </Button>
            {/* -------------------------------- */}

            <Button variant="outline" size="sm" className="relative">
              <Bell className="h-4 w-4" />
              <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs">3</Badge>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDarkMode(!darkMode)}
            >
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <ColorfulTabs value={activeModule} onValueChange={setActiveModule}>
          <div className="flex justify-center mb-6 no-print">
            <ColorfulTabsList className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-2 p-2">
              {modules.map((module) => (
                <ColorfulTabsTrigger
                  key={module.id}
                  value={module.id}
                  icon={module.icon}
                  className="min-w-[100px] sm:min-w-[120px]"
                >
                  <span className="hidden sm:inline">{module.name}</span>
                </ColorfulTabsTrigger>
              ))}
            </ColorfulTabsList>
          </div>

          <ColorfulTabsContent value="dashboard">
            <div className="space-y-6">
              <Card className="bg-white/90 backdrop-blur-sm shadow-lg">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {quickActions.map((action) => {
                      const IconComponent = action.icon;
                      return (
                        <Button
                          key={action.id}
                          variant="outline"
                          className="h-20 flex flex-col items-center justify-center gap-2 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                          onClick={() => handleQuickAction(action.id)}
                        >
                          <IconComponent className="h-6 w-6" />
                          <span className="text-sm font-medium">{action.title}</span>
                        </Button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                  <StatsCard key={index} {...stat} />
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <DonutChart title="Sales by Category" data={salesData} />
                <CustomLineChart
                  title="Monthly Revenue Trends"
                  data={revenueData}
                  color="#2F80ED"
                  gradientId="revenueGradient"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <CustomBarChart
                  title="Expenses by Department"
                  data={expenseData}
                  color="#EB5757"
                />

                <Card className="bg-white/90 backdrop-blur-sm shadow-lg">
                  <CardHeader>
                    <CardTitle>Recent Activities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <span className="text-sm">New sale order #SO-001</span>
                        <Badge>New</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <span className="text-sm">User role updated</span>
                        <Badge variant="secondary">Security</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                        <span className="text-sm">Failed login detected</span>
                        <Badge variant="outline">Alert</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                        <span className="text-sm">Audit log exported</span>
                        <Badge variant="secondary">Compliance</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </ColorfulTabsContent>

          <ColorfulTabsContent value="sales"><SalesModule /></ColorfulTabsContent>
          <ColorfulTabsContent value="inventory"><InventoryModule /></ColorfulTabsContent>
          <ColorfulTabsContent value="purchasing"><PurchasingModule /></ColorfulTabsContent>
          <ColorfulTabsContent value="hr"><HRModule /></ColorfulTabsContent>
          <ColorfulTabsContent value="accounting"><AccountingModule /></ColorfulTabsContent>
          <ColorfulTabsContent value="reports"><ReportsModule /></ColorfulTabsContent>
          <ColorfulTabsContent value="crm"><CRMModule /></ColorfulTabsContent>
          <ColorfulTabsContent value="security"><SecurityModule /></ColorfulTabsContent>
        </ColorfulTabs>

        <Dialog open={activeQuickAction === 'quotation'} onOpenChange={closeQuickActionDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>New Quotation</DialogTitle>
            </DialogHeader>
            <QuotationForm onClose={closeQuickActionDialog} />
          </DialogContent>
        </Dialog>

        <Dialog open={activeQuickAction === 'sales-order'} onOpenChange={closeQuickActionDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>New Sales Order</DialogTitle>
            </DialogHeader>
            <SalesOrderForm onClose={closeQuickActionDialog} />
          </DialogContent>
        </Dialog>

        <Dialog open={activeQuickAction === 'invoice'} onOpenChange={closeQuickActionDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Invoice</DialogTitle>
            </DialogHeader>
            <InvoiceForm onClose={closeQuickActionDialog} onSave={function (invoice: any): void {
              throw new Error('Function not implemented.');
            } } />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ERPDashboard;