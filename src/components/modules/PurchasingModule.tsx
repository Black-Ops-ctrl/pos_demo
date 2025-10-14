import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ColorfulTabs, ColorfulTabsContent, ColorfulTabsList, ColorfulTabsTrigger } from '@/components/ui/colorful-tabs';
import { Users, FileText, Package, Receipt, DollarSign, BarChart3 } from 'lucide-react';
import VendorMaster from '../purchasing/VendorMaster';
import RFQManagement from '../purchasing/RFQManagement';
import PurchaseOrders from '../purchasing/PurchaseOrders';
import GoodsReceipt from '../purchasing/GoodsReceipt';
import PurchaseRequisition from '../purchasing/PurchaseRequisition';

const PurchasingModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const stats = [
    { title: 'Active Vendors', value: '24', icon: Users, color: 'text-blue-600' },
    { title: 'Open RFQs', value: '8', icon: FileText, color: 'text-green-600' },
    { title: 'Pending POs', value: '12', icon: Package, color: 'text-orange-600' },
    { title: 'This Month Spend', value: '$125K', icon: DollarSign, color: 'text-purple-600' }
  ];

  const recentActivities = [
    { action: 'New PO created', details: 'PO003 for ABC Suppliers Ltd', time: '2 hours ago', type: 'po' },
    { action: 'GRN processed', details: 'GRN002 for Steel Rods', time: '4 hours ago', type: 'grn' },
    { action: 'RFQ sent', details: 'RFQ005 to 3 vendors', time: '1 day ago', type: 'rfq' },
    { action: 'Vendor approved', details: 'New vendor XYZ Industries', time: '2 days ago', type: 'vendor' }
  ];

  const quickActions = [
    { label: 'Add Vendor', action: () => setActiveTab('vendors'), color: 'bg-blue-500' },
    { label: 'Create PR', action: () => setActiveTab('purchase-requisition'), color: 'bg-green-500' },
    { label: 'New PO', action: () => setActiveTab('purchase-orders'), color: 'bg-orange-500' },
    { label: 'Process GRN', action: () => setActiveTab('goods-receipt'), color: 'bg-purple-500' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Purchasing & Vendor Management</h1>
          <p className="text-gray-600">Manage procurement lifecycle from RFQ to payment</p>
        </div>
      </div>

      <ColorfulTabs value={activeTab} onValueChange={setActiveTab}>
        <ColorfulTabsList className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-5 mb-6">
          <ColorfulTabsTrigger value="overview" icon={BarChart3}>Overview</ColorfulTabsTrigger>
          <ColorfulTabsTrigger value="vendors" icon={Users}>Vendors</ColorfulTabsTrigger>
          {/*
          <ColorfulTabsTrigger value="rfq" icon={FileText}>RFQ</ColorfulTabsTrigger>
          */}
          {/* <ColorfulTabsTrigger value="purchase-requisition" icon={DollarSign}>Purchase Requisition</ColorfulTabsTrigger> */}
          <ColorfulTabsTrigger value="purchase-orders" icon={Package}>Purchase Orders</ColorfulTabsTrigger>
          <ColorfulTabsTrigger value="goods-receipt" icon={Receipt}>Purchase Invoices</ColorfulTabsTrigger>
          <ColorfulTabsTrigger value="reports" icon={BarChart3}>Reports</ColorfulTabsTrigger>
          
        </ColorfulTabsList>

        <ColorfulTabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      </div>
                      <Icon className={`h-8 w-8 ${stat.color}`} />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.map((activity, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className={`w-2 h-2 rounded-full ${
                        activity.type === 'po' ? 'bg-orange-500' :
                        activity.type === 'grn' ? 'bg-purple-500' :
                        activity.type === 'rfq' ? 'bg-green-500' : 'bg-blue-500'
                      }`}></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.action}</p>
                        <p className="text-xs text-gray-500">{activity.details}</p>
                      </div>
                      <span className="text-xs text-gray-400">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {quickActions.map((action, index) => (
                    <Button
                      key={index}
                      onClick={action.action}
                      className={`h-20 ${action.color} hover:opacity-90 text-white`}
                    >
                      {action.label}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </ColorfulTabsContent>

        <ColorfulTabsContent value="vendors">
          <VendorMaster />
        </ColorfulTabsContent>
        {/* <ColorfulTabsContent value="purchase-requisition">
          <PurchaseRequisition />
          
        </ColorfulTabsContent> */}
        <ColorfulTabsContent value="rfq">
          <RFQManagement />
        </ColorfulTabsContent>

        <ColorfulTabsContent value="purchase-orders">
          <PurchaseOrders />
        </ColorfulTabsContent>

        <ColorfulTabsContent value="goods-receipt">
          <GoodsReceipt />
        </ColorfulTabsContent>

        <ColorfulTabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Purchasing Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="text-center">
                    <Users className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                    <h3 className="font-medium">Vendor Performance</h3>
                    <p className="text-sm text-gray-600">Analyze vendor ratings and delivery performance</p>
                  </div>
                </Card>
                <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="text-center">
                    <Package className="h-8 w-8 mx-auto mb-2 text-green-600" />
                    <h3 className="font-medium">Purchase Analysis</h3>
                    <p className="text-sm text-gray-600">Track spending by vendor, category, and period</p>
                  </div>
                </Card>
                <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="text-center">
                    <Receipt className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                    <h3 className="font-medium">GRN Summary</h3>
                    <p className="text-sm text-gray-600">Review goods receipt and discrepancy reports</p>
                  </div>
                </Card>
              </div>
            </CardContent>
          </Card>
        </ColorfulTabsContent>
      </ColorfulTabs>
    </div>
  );
};

export default PurchasingModule;