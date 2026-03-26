import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ColorfulTabs, ColorfulTabsContent, ColorfulTabsList, ColorfulTabsTrigger } from '@/components/ui/colorful-tabs';
import { Users, FileText, Package, Receipt, DollarSign, BarChart3, RefreshCw, Loader2 } from 'lucide-react';
import VendorMaster from '../purchasing/VendorMaster';
import RFQManagement from '../purchasing/RFQManagement';
import PurchaseOrders from '../purchasing/PurchaseOrders';
import GoodsReceipt from '../purchasing/GoodsReceipt';
import PurchaseRequisition from '../purchasing/PurchaseRequisition';
import PurchaseInvoice from '../purchasing/PurchaseInvoice'; 
import PurchaseInvoiceReturn from '../purchasing/purchaseinvoicereturn';
import BirdsVehicle from '../purchasing/BirdsVehicles';
import axios from 'axios';

const getSelectedBranchId = (): string | null => {
    return sessionStorage.getItem("selectedBranchId");
};

const getModuleId = () => {
    const selectedBranchId = getSelectedBranchId();
    const module_id = selectedBranchId && selectedBranchId !== 'N/A'
        ? parseInt(selectedBranchId, 10)
        : null;
    return module_id;
}

const module_id = getModuleId();

interface DashboardData {
    active_vendors?: string | number;
    pending_invoices?: string | number;
    pending_invoices_amount?: string | number;
    monthly_spend?: string | number;
}

const PurchasingModule: React.FC = () => {
    
    const [activeTab, setActiveTab] = useState(() => {
        if (module_id === 2) {
            return 'purchase-orders';   // default for module 2
        }
        return sessionStorage.getItem('purchasingActiveTab') || 'overview';
    });

    // State for API data
    const [dashboardData, setDashboardData] = useState<DashboardData>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        sessionStorage.setItem('purchasingActiveTab', activeTab);
    }, [activeTab]);

    // Fetch dashboard data from API
    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axios.post('http://84.16.235.111:2149/api/purchase-dashboard', {
                    p_operation: 1
                }, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                console.log('Purchase Dashboard API Response:', response.data);

                if (response.data && response.data.status === 'success') {
                    const data = response.data.data;
                    setDashboardData({
                        active_vendors: data.active_vendors || 0,
                        pending_invoices: data.pending_invoices || 0,
                        pending_invoices_amount: data.pending_invoices_amount || 0,
                        monthly_spend: data.monthly_spend || 0
                    });
                } else {
                    console.error('Invalid API response structure:', response.data);
                    setDashboardData({
                        active_vendors: 0,
                        pending_invoices: 0,
                        pending_invoices_amount: 0,
                        monthly_spend: 0
                    });
                }
            } catch (err) {
                console.error('Error fetching purchase dashboard data:', err);
                setError('Failed to load dashboard data');
                setDashboardData({
                    active_vendors: 0,
                    pending_invoices: 0,
                    pending_invoices_amount: 0,
                    monthly_spend: 0
                });
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    // Hide purchase invoice tab if module_id is 2
    const shouldShowPurchaseInvoice = module_id !== 2;
    
    // Check if module_id is 2 to hide overview, vendors, and reports
    const isModuleId2 = module_id === 2;

    // Use data from API
    const activeVendors = dashboardData.active_vendors || 0;
    const pendingInvoices = dashboardData.pending_invoices || 0;
    const pendingInvoicesAmount = parseFloat(dashboardData.pending_invoices_amount?.toString() || '0');
    const monthlySpend = parseFloat(dashboardData.monthly_spend?.toString() || '0');

    const stats = [
        { title: 'Active Vendors', value: activeVendors.toString(), icon: Users, color: 'text-blue-600' },
        { title: 'Pending Invoice', value: pendingInvoices.toString(), icon: Package, color: 'text-orange-600' },
        { title: 'Pending Invoices Amount', value: `Rs. ${pendingInvoicesAmount.toLocaleString()}`, icon: FileText, color: 'text-green-600' },
        { title: 'This Month Spend', value: `Rs. ${monthlySpend.toLocaleString()}`, icon: () => null, color: 'text-purple-600' }
    ];

    const recentActivities = [
        { action: 'Recent Created Invoice', details: 'PO003 for ABC Suppliers Ltd', time: '2 hours ago', type: 'po' },
        { action: 'Recent Invoice Approved', details: 'GRN002 for Steel Rods', time: '4 hours ago', type: 'grn' },
        // { action: 'RFQ sent', details: 'RFQ005 to 3 vendors', time: '1 day ago', type: 'rfq' },
        { action: 'Recent Vendor approved', details: 'New vendor XYZ Industries', time: '2 days ago', type: 'vendor' }
    ];

    const quickActions = [
        { label: 'Add Vendor', action: () => setActiveTab('vendors'), color: 'bg-blue-500' },
        // { label: 'Create PR', action: () => setActiveTab('purchase-requisition'), color: 'bg-green-500' },
        { label: 'Purchase Invoice', action: () => setActiveTab('purchase-orders'), color: 'bg-orange-500' },
        // { label: 'Process GRN', action: () => setActiveTab('goods-receipt'), color: 'bg-purple-500' }
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Purchases & Vendor Management</h1>
                    <p className="text-gray-600">Manage procurement lifecycle from RFQ to payment</p>
                </div>
            </div>

            <ColorfulTabs value={activeTab} onValueChange={setActiveTab}>
                {!isModuleId2 ? (
                    <ColorfulTabsList className={`grid mb-6 ${
                        shouldShowPurchaseInvoice 
                            ? 'grid-cols-3 overflow-hidden' 
                            : 'grid-cols-2 overflow-hidden'
                    }`}>
                        <ColorfulTabsTrigger value="overview" icon={BarChart3}>Overview</ColorfulTabsTrigger>
                        <ColorfulTabsTrigger value="vendors" icon={Users}>Vendors</ColorfulTabsTrigger>
                        <ColorfulTabsTrigger value="purchase-orders" icon={Package}>Purchase Invoice</ColorfulTabsTrigger>
                        {/* <ColorfulTabsTrigger value="birds-vehicles" icon={Package}>Birds Vehicles</ColorfulTabsTrigger> */}
                        {shouldShowPurchaseInvoice && (
                            <>
                                {/* <ColorfulTabsTrigger value="purchase-invoice" icon={Receipt}>Purchase Invoice</ColorfulTabsTrigger> */}
                                {/* <ColorfulTabsTrigger value="purchase-invoice-return" icon={RefreshCw}>Purchase Return</ColorfulTabsTrigger> */}
                            </>
                        )}
                        {/* <ColorfulTabsTrigger value="reports" icon={BarChart3}>Reports</ColorfulTabsTrigger> */}
                    </ColorfulTabsList>
                ) : (
                    <ColorfulTabsList className="grid mb-6 grid-cols-2 overflow-hidden">
                        <ColorfulTabsTrigger value="birds-vehicles" icon={Package}>Birds Vehicles</ColorfulTabsTrigger>
                        <ColorfulTabsTrigger value="purchase-orders" icon={Package}>Purchase Orders</ColorfulTabsTrigger>
                    </ColorfulTabsList>
                )}

                {!isModuleId2 && (
                    <ColorfulTabsContent value="overview" className="space-y-6">
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
                                                        className={`h-20 ${action.color} hover:${action.color} text-white transition-colors`}
                                                    >
                                                        {action.label}
                                                    </Button>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </>
                        )}
                    </ColorfulTabsContent>
                )}

                {!isModuleId2 && (
                    <ColorfulTabsContent value="vendors">
                        <VendorMaster />
                    </ColorfulTabsContent>
                )}
                <ColorfulTabsContent value="birds-vehicles">
                    <BirdsVehicle />
                </ColorfulTabsContent>

                <ColorfulTabsContent value="rfq">
                    <RFQManagement />
                </ColorfulTabsContent>

                <ColorfulTabsContent value="purchase-orders">
                    <PurchaseOrders />
                </ColorfulTabsContent>
                
                {shouldShowPurchaseInvoice && (
                    <ColorfulTabsContent value="purchase-invoice">
                        <PurchaseInvoice />
                    </ColorfulTabsContent>
                )}

                {shouldShowPurchaseInvoice && (
                    <ColorfulTabsContent value="purchase-invoice-return">
                        <PurchaseInvoiceReturn />
                    </ColorfulTabsContent>
                )}

                {!isModuleId2 && (
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
                )}
            </ColorfulTabs>
        </div>
    );
};

export default PurchasingModule;