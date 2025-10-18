import React, { useEffect, useState } from 'react';
import { ColorfulTabs, ColorfulTabsContent, ColorfulTabsList, ColorfulTabsTrigger } from '@/components/ui/colorful-tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Warehouse, ArrowRightLeft, Calculator, FileText, Settings } from 'lucide-react';
import ItemMaster from '../inventory/ItemMaster';
import WarehouseManagement from '../inventory/WarehouseManagement';
import StockTransactions from '../inventory/StockTransactions';
import StockValuation from '../inventory/StockValuation';
import InventoryReports from '../inventory/InventoryReports';
import { getItems } from '@/api/itemsApi';
import { getWarehouses } from '@/api/getWarehousesApi';
import UOM from '../inventory/UOM';


const InventoryModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');


const inventoryStats = {
    // totalItems: 156,
    totalValue: 485750,
    lowStockItems: 12,
    // warehouses: 3,
    recentTransactions: 45,
    valuationMethod: 'FIFO'
  };

// State to hold items
const [items, setItems] = useState<any[]>([]);
const [warehouses, setWarehouses] = useState<any[]>([]);
 useEffect(() => {
    // Fetch SO list
    const fetchData = async () => {
      const itemsdata = await getItems();
      const warehousesdata = await getWarehouses();
      console.log('Fetched items data:', itemsdata);
      setItems(itemsdata);
      console.log('Fetched warehouses data:', warehousesdata);
      setWarehouses(warehousesdata);
    };
    fetchData();
  }, []);


const totalItems = items.length;
const totalWarehouses = warehouses.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Inventory Management
          </h2>
          <p className="text-gray-600 ">Manage items, warehouses, stock transactions, and valuations</p>
        </div>
      </div>

      <ColorfulTabs value={activeTab} onValueChange={setActiveTab}>
        <ColorfulTabsList className="grid w-full grid-cols-6">
          <ColorfulTabsTrigger value="overview" icon={Package}>
            Overview
          </ColorfulTabsTrigger>
          <ColorfulTabsTrigger value="items" icon={Package}>
            Items
          </ColorfulTabsTrigger>

          <ColorfulTabsTrigger value="warehouses" icon={Warehouse}>
            Warehouses
          </ColorfulTabsTrigger>
          <ColorfulTabsTrigger value="transactions" icon={ArrowRightLeft}>
            Transactions
          </ColorfulTabsTrigger>
          <ColorfulTabsTrigger value="valuation" icon={Calculator}>
            Valuation
          </ColorfulTabsTrigger>
          <ColorfulTabsTrigger value="reports" icon={FileText}>
            Reports
          </ColorfulTabsTrigger>
        </ColorfulTabsList>

        <ColorfulTabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-blue-700">Total Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Package className="h-6 w-6 text-blue-600" />
                  <span className="text-3xl font-bold text-blue-800">{totalItems}</span>
                </div>
                <p className="text-xs text-blue-600 mt-1">Active inventory items</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-green-700">Total Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-bold text-green-800"> Rs.{inventoryStats.totalValue.toLocaleString()}</span>
                </div>
                <p className="text-xs text-green-600 mt-1">Current inventory valuation</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-yellow-700">Low Stock Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-bold text-yellow-800">{inventoryStats.lowStockItems}</span>
                </div>
                <p className="text-xs text-yellow-600 mt-1">Items below reorder level</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-purple-700">Warehouses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Warehouse className="h-6 w-6 text-purple-600" />
                  <span className="text-3xl font-bold text-purple-800">{totalWarehouses}</span>
                </div>
                <p className="text-xs text-purple-600 mt-1">Active warehouse locations</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-indigo-700">Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <ArrowRightLeft className="h-6 w-6 text-indigo-600" />
                  <span className="text-3xl font-bold text-indigo-800">{inventoryStats.recentTransactions}</span>
                </div>
                <p className="text-xs text-indigo-600 mt-1">Last 30 days</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-teal-50 to-teal-100 border-teal-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-teal-700">Valuation Method</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Calculator className="h-6 w-6 text-teal-600" />
                  <span className="text-3xl font-bold text-teal-800">{inventoryStats.valuationMethod}</span>
                </div>
                <p className="text-xs text-teal-600 mt-1">Current costing method</p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8">
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <button 
                    onClick={() => setActiveTab('items')}
                    className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
                  >
                    <Package className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-blue-800">Manage Items</p>
                  </button>
                  <button 
                    onClick={() => setActiveTab('warehouses')}
                    className="p-4 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors"
                  >
                    <Warehouse className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-green-800">Warehouses</p>
                  </button>
                  <button 
                    onClick={() => setActiveTab('transactions')}
                    className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors"
                  >
                    <ArrowRightLeft className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-purple-800">Transactions</p>
                  </button>
                  <button 
                    onClick={() => setActiveTab('reports')}
                    className="p-4 bg-orange-50 hover:bg-orange-100 rounded-lg border border-orange-200 transition-colors"
                  >
                    <FileText className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-orange-800">Reports</p>
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </ColorfulTabsContent>

        <ColorfulTabsContent value="items">
          <ItemMaster />
        </ColorfulTabsContent>

        <ColorfulTabsContent value="warehouses">
          <WarehouseManagement />
        </ColorfulTabsContent>

        <ColorfulTabsContent value="transactions">
          <StockTransactions />
        </ColorfulTabsContent>

        <ColorfulTabsContent value="valuation">
          <StockValuation />
        </ColorfulTabsContent>

        <ColorfulTabsContent value="reports">
          <InventoryReports />
        </ColorfulTabsContent>
      </ColorfulTabs>
    </div>
  );
};

export default InventoryModule;