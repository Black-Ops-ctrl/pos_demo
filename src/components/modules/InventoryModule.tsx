import React, { useEffect, useState } from 'react';
import { ColorfulTabs, ColorfulTabsContent, ColorfulTabsList, ColorfulTabsTrigger } from '@/components/ui/colorful-tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Warehouse, ArrowRightLeft, Calculator, FileText, Settings, Loader2 } from 'lucide-react';
import ItemMaster from '../inventory/ItemMaster';
import WarehouseManagement from '../inventory/WarehouseManagement';
import StockTransactions from '../inventory/StockTransactions';
import StockValuation from '../inventory/StockValuation';
import InventoryReports from '../inventory/InventoryReports';
import { getItems } from '@/api/itemsApi';
import { getWarehouses } from '@/api/getWarehousesApi';
import UOM from '../inventory/UOM';
import axios from 'axios';

interface DashboardData {
  total_products?: string | number;
  total_value?: string | number;
  low_stock_alert?: string | number;
  warehouses?: string | number;
  recent_transcations?: string | number;
  valuation_method?: string;
}

const InventoryModule: React.FC = () => {
    
    // Initialize activeTab from Session Storage or default to 'overview'
    const [activeTab, setActiveTab] = useState(() => {
        return sessionStorage.getItem('inventoryActiveTab') || 'overview';
    });

    // Save activeTab to Session Storage whenever it changes
    useEffect(() => {
        sessionStorage.setItem('inventoryActiveTab', activeTab);
    }, [activeTab]);

    // State for API data
    const [dashboardData, setDashboardData] = useState<DashboardData>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // State to hold items and warehouses from existing APIs
    const [items, setItems] = useState<any[]>([]);
    const [warehouses, setWarehouses] = useState<any[]>([]);
    
    // Fetch inventory dashboard data from API
    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axios.post('http://84.16.235.111:2149/api/inv-dashboard', {
                    p_operation: 1
                }, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                console.log('Inventory Dashboard API Response:', response.data);

                if (response.data && response.data.status === 'success') {
                    const data = response.data.data;
                    setDashboardData({
                        total_products: data.total_products || 0,
                        total_value: data.total_value || 0,
                        low_stock_alert: data.low_stock_alert || 0,
                        warehouses: data.warehouses || 0,
                        recent_transcations: data.recent_transcations || 0,
                        valuation_method: data.valuation_method || 'FIFO'
                    });
                } else {
                    console.error('Invalid API response structure:', response.data);
                    setDashboardData({
                        total_products: 0,
                        total_value: 0,
                        low_stock_alert: 0,
                        warehouses: 0,
                        recent_transcations: 0,
                        valuation_method: 'FIFO'
                    });
                }
            } catch (err) {
                console.error('Error fetching inventory dashboard data:', err);
                setError('Failed to load dashboard data');
                setDashboardData({
                    total_products: 0,
                    total_value: 0,
                    low_stock_alert: 0,
                    warehouses: 0,
                    recent_transcations: 0,
                    valuation_method: 'FIFO'
                });
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    // Fetch items and warehouses from existing APIs
    useEffect(() => {
        const fetchData = async () => {
            try {
                const itemsdata = await getItems();
                const warehousesdata = await getWarehouses();
                console.log('Fetched items data:', itemsdata);
                setItems(itemsdata);
                console.log('Fetched warehouses data:', warehousesdata);
                setWarehouses(warehousesdata);
            } catch (err) {
                console.error('Error fetching items/warehouses:', err);
            }
        };
        fetchData();
    }, []);

    // Use data from API first, fallback to existing data
    const totalItems = dashboardData.total_products || items.length;
    const totalWarehouses = dashboardData.warehouses || warehouses.length;
    const totalValue = parseFloat(dashboardData.total_value?.toString() || '0');
    const lowStockAlerts = dashboardData.low_stock_alert || 0;
    const recentTransactions = dashboardData.recent_transcations || 0;
    const valuationMethod = dashboardData.valuation_method || 'FIFO';

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-semibold tracking-tight text-secondary">
                        Inventory Management
                    </h2>
                    <p className="text-gray-600 ">Manage items, warehouses, stock transactions, and valuations</p>
                </div>
            </div>

            <ColorfulTabs value={activeTab} onValueChange={setActiveTab}>
                <ColorfulTabsList className="grid w-full grid-cols-3 overflow-hidden">
                    <ColorfulTabsTrigger value="overview" icon={Package}>
                        Overview
                    </ColorfulTabsTrigger>
                    <ColorfulTabsTrigger value="items" icon={Package}>
                        Items
                    </ColorfulTabsTrigger>

                    <ColorfulTabsTrigger value="warehouses" icon={Warehouse}>
                        Warehouses
                    </ColorfulTabsTrigger>
                    {/* <ColorfulTabsTrigger value="transactions" icon={ArrowRightLeft}>
                        Transactions
                    </ColorfulTabsTrigger>
                    <ColorfulTabsTrigger value="valuation" icon={Calculator}>
                        Valuation
                    </ColorfulTabsTrigger> */}
                    {/* <ColorfulTabsTrigger value="reports" icon={FileText}>
                        Reports
                    </ColorfulTabsTrigger> */}
                </ColorfulTabsList>

                <ColorfulTabsContent value="overview" className="mt-6">
                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                            <span className="ml-2 text-gray-600">Loading dashboard data...</span>
                        </div>
                    ) : error ? (
                        <div className="text-center py-12">
                            <p className="text-red-500">{error}</p>
                            <button 
                                onClick={() => window.location.reload()} 
                                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                            >
                                Retry
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ">
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
                                            <span className="text-3xl font-bold text-green-800"> Rs.{totalValue.toLocaleString()}</span>
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
                                            <span className="text-3xl font-bold text-yellow-800">{lowStockAlerts}</span>
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
                                            <span className="text-3xl font-bold text-indigo-800">{recentTransactions}</span>
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
                                            <span className="text-3xl font-bold text-teal-800">{valuationMethod}</span>
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
                                        <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
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
                                            {/* <button 
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
                                            </button> */}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </>
                    )}
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