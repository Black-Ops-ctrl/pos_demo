import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, BarChart3, FileText, Bell, Settings, Download, Play, Users, DollarSign } from 'lucide-react';
import ReportBuilder from '../reporting/ReportBuilder';
import DashboardManagement from '../reporting/DashboardManagement';
import AlertsNotifications from '../reporting/AlertsNotifications';
import FarmReports from '../reporting/FarmReports';
import CustomerLedger from '../reporting/CustomerLedger';
import VendorLedger from '../reporting/Vendorsledger';
import StockReport from '../reporting/StockReport';
import ItemProfitLossReport from '../reporting/ItemProfitLossReport';
import VehicleProfitLossReport from '../reporting/Vehicleprofitlossresport';
import BirdsVehicle from '../reporting/Birdsvehicle';
import FeedReports from '../reporting/Feedreports';
import ChicksReports from '../reporting/Chicksreports'; // Add this import
import AllCustomersLedger from '../reporting/AllCustomersLedger';

interface KPIData {
    title: string;
    value: string;
    change: string;
    trend: 'up' | 'down';
    icon: React.ReactNode;
}

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

const ReportsModule: React.FC = () => {
    
    // Initialize activeTab from Session Storage or default to 'overview'
    const [activeTab, setActiveTab] = useState(() => {
        return sessionStorage.getItem('reportsActiveTab') || 'overview';
    });

    // Save activeTab to Session Storage whenever it changes
    useEffect(() => {
        sessionStorage.setItem('reportsActiveTab', activeTab);
    }, [activeTab]);

    // Check if FarmReports should be shown
    const shouldShowFarmReports = module_id !== 3;

    // Check if CustomerLedger should be shown (hidden when module_id is 2)
    const shouldShowCustomerLedger = module_id !== 2;

    // Check if VendorLedger should be shown
    const shouldShowVendorLedger = true;

    // Check if VehicleProfitLossReport should be shown (only for module_id 2)
    const shouldShowVehicleProfitLoss = module_id === 2;

    // Check if BirdsVehicle should be shown (only for module_id 3)
    const shouldShowBirdsVehicle = module_id === 3;

    // Check if FeedReports should be shown (only for module_id 3 - same as BirdsVehicle)
    const shouldShowFeedReports = module_id === 3;

    // Check if ChicksReports should be shown (only for module_id 3 - same as BirdsVehicle)
    const shouldShowChicksReports = module_id === 3;

    const kpiData: KPIData[] = [
        {
            title: 'Total Reports',
            value: '47',
            change: '+3 this month',
            trend: 'up',
            icon: <FileText className="h-6 w-6" />
        },
        {
            title: 'Active Dashboards',
            value: '12',
            change: '+2 this week',
            trend: 'up',
            icon: <BarChart3 className="h-6 w-6" />
        },
        {
            title: 'Scheduled Reports',
            value: '23',
            change: 'No change',
            trend: 'up',
            icon: <Settings className="h-6 w-6" />
        },
        {
            title: 'Active Alerts',
            value: '8',
            change: '+1 today',
            trend: 'up',
            icon: <Bell className="h-6 w-6" />
        }
    ];

    const reportUsageData = [
        { name: 'Financial', count: 15, percentage: 32 },
        { name: 'Sales', count: 12, percentage: 26 },
        { name: 'Inventory', count: 8, percentage: 17 },
        { name: 'HR', count: 7, percentage: 15 },
        { name: 'CRM', count: 5, percentage: 10 }
    ];

    const monthlyReportData = [
        { month: 'Jan', generated: 120, scheduled: 45 },
        { month: 'Feb', generated: 135, scheduled: 52 },
        { month: 'Mar', generated: 148, scheduled: 48 },
        { month: 'Apr', generated: 162, scheduled: 55 },
        { month: 'May', generated: 178, scheduled: 58 },
        { month: 'Jun', generated: 195, scheduled: 62 }
    ];

    const recentActivities = [
        {
            id: 1,
            type: 'report_generated',
            description: 'Monthly Sales Report generated',
            user: 'John Doe',
            time: '2 hours ago',
            status: 'completed'
        },
        {
            id: 2,
            type: 'dashboard_created',
            description: 'New Financial Dashboard created',
            user: 'Jane Smith',
            time: '4 hours ago',
            status: 'completed'
        },
        {
            id: 3,
            type: 'alert_triggered',
            description: 'Low Stock Alert triggered',
            user: 'System',
            time: '6 hours ago',
            status: 'active'
        },
        {
            id: 4,
            type: 'report_scheduled',
            description: 'Weekly Inventory Report scheduled',
            user: 'Mike Johnson',
            time: '1 day ago',
            status: 'scheduled'
        }
    ];

    const KPIWidget: React.FC<{ data: KPIData }> = ({ data }) => (
        <Card>
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-600">{data.title}</p>
                        <p className="text-2xl font-bold">{data.value}</p>
                        <p className="text-sm text-gray-500">{data.change}</p>
                    </div>
                    <div className="text-blue-600">
                        {data.icon}
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'report_generated':
                return <FileText className="h-4 w-4" />;
            case 'dashboard_created':
                return <BarChart3 className="h-4 w-4" />;
            case 'alert_triggered':
                return <Bell className="h-4 w-4" />;
            case 'report_scheduled':
                return <Settings className="h-4 w-4" />;
            default:
                return <FileText className="h-4 w-4" />;
        }
    };

    const getStatusBadge = (status: string) => {
        const colors = {
            completed: 'bg-green-100 text-green-800',
            active: 'bg-yellow-100 text-yellow-800',
            scheduled: 'bg-blue-100 text-blue-800',
            error: 'bg-red-100 text-red-800'
        };

        return (
            <Badge className={colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
        );
    };

    // Calculate grid columns based on which tabs should be shown
    const getTabGridCols = () => {
        let count = 5; // Base count: dashboards, stock, item-profit-loss, alerts, analytics
        
        if (shouldShowFarmReports) count++;
        if (shouldShowCustomerLedger) count++;
        if (shouldShowVendorLedger) count++;
        if (shouldShowVehicleProfitLoss) count++;
        if (shouldShowBirdsVehicle) count++;
        if (shouldShowFeedReports) count++;
        if (shouldShowChicksReports) count++; // Add ChicksReports to count
        
        // Return appropriate grid class based on count
        if (count <= 5) return 'grid-cols-5';
        if (count === 6) return 'grid-cols-6';
        if (count === 7) return 'grid-cols-7';
        if (count === 8) return 'grid-cols-8';
        if (count === 9) return 'grid-cols-9';
        return 'grid-cols-10';
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Reporting & Analytics</h1>
                <div className="flex gap-2">
                    <Badge variant="outline" className="bg-blue-50">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        Analytics Active
                    </Badge>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className={`grid w-full ${getTabGridCols()}`}>
                    <TabsTrigger value="dashboards">Dashboards</TabsTrigger>
                    
                    {/* {shouldShowFarmReports && (
                        <TabsTrigger value="FarmReports">Farm Reports</TabsTrigger>
                    )} */}
                    {shouldShowCustomerLedger && (
                        <TabsTrigger value="CustomerLedger">Customer Ledger</TabsTrigger>
                    )}
                    {shouldShowVendorLedger && (
                        <TabsTrigger value="VendorLedger">Vendor Ledger</TabsTrigger>
                    )}
                    {/* <TabsTrigger value="stock">Stock Report</TabsTrigger> */}
                    <TabsTrigger value="item-profit-loss">Item Profit & Loss</TabsTrigger>
                    
                    {/* {shouldShowVehicleProfitLoss && (
                        <TabsTrigger value="vehicle-profit-loss">Vehicle Profit & Loss</TabsTrigger>
                    )} */}
                    
                    {shouldShowBirdsVehicle && (
                        <TabsTrigger value="birds-vehicle">Birds Vehicle</TabsTrigger>
                    )}
                    
                    {/* {shouldShowFeedReports && (
                        <TabsTrigger value="feed-reports">Feed Reports</TabsTrigger>
                    )} */}
                    
                    {/* {shouldShowChicksReports && (
                        <TabsTrigger value="chicks-reports">Chicks Reports</TabsTrigger>
                    )} */}
                    <TabsTrigger value="customer-balance">Customers Balance</TabsTrigger>
                    <TabsTrigger value="alerts">Alerts</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {kpiData.map((kpi, index) => (
                            <KPIWidget key={index} data={kpi} />
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Report Usage by Module</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={reportUsageData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percentage }) => `${name} ${percentage}%`}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="count"
                                        >
                                            {reportUsageData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={`hsl(${index * 45}, 70%, 50%)`} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Monthly Report Generation</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={monthlyReportData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="month" />
                                        <YAxis />
                                        <Tooltip />
                                        <Line type="monotone" dataKey="generated" stroke="#3b82f6" strokeWidth={2} />
                                        <Line type="monotone" dataKey="scheduled" stroke="#10b981" strokeWidth={2} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Activities</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {recentActivities.map((activity) => (
                                    <div key={activity.id} className="flex items-center justify-between p-3 border rounded">
                                        <div className="flex items-center gap-3">
                                            <div className="text-blue-600">
                                                {getActivityIcon(activity.type)}
                                            </div>
                                            <div>
                                                <p className="font-medium">{activity.description}</p>
                                                <p className="text-sm text-gray-600">by {activity.user} • {activity.time}</p>
                                            </div>
                                        </div>
                                        {getStatusBadge(activity.status)}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="dashboards">
                    <DashboardManagement />
                </TabsContent>

                {shouldShowCustomerLedger && (
                    <TabsContent value="CustomerLedger">
                        <CustomerLedger />
                    </TabsContent>
                )}

                {shouldShowVendorLedger && (
                    <TabsContent value="VendorLedger">
                        <VendorLedger />
                    </TabsContent>
                )}

                {shouldShowFarmReports && (
                    <TabsContent value="FarmReports">
                        <FarmReports />
                    </TabsContent>
                )}
                
                <TabsContent value="stock">
                    <StockReport />
                </TabsContent>
                
                <TabsContent value="item-profit-loss">
                    <ItemProfitLossReport />
                </TabsContent>

                {shouldShowVehicleProfitLoss && (
                    <TabsContent value="vehicle-profit-loss">
                        <VehicleProfitLossReport />
                    </TabsContent>
                )}

                {shouldShowBirdsVehicle && (
                    <TabsContent value="birds-vehicle">
                        <BirdsVehicle />
                    </TabsContent>
                )}

                {shouldShowFeedReports && (
                    <TabsContent value="feed-reports">
                        <FeedReports />
                    </TabsContent>
                )}

                {shouldShowChicksReports && (
                    <TabsContent value="chicks-reports">
                        <ChicksReports />
                    </TabsContent>
                )}
                <TabsContent value="customer-balance">
                    <AllCustomersLedger />
                </TabsContent>

                <TabsContent value="alerts">
                    <AlertsNotifications />
                </TabsContent>

                <TabsContent value="analytics" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Business Intelligence & Analytics</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Performance Metrics</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <span>Report Generation Speed</span>
                                                <Badge className="bg-green-100 text-green-800">Excellent</Badge>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span>Data Accuracy</span>
                                                <Badge className="bg-green-100 text-green-800">99.8%</Badge>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span>System Uptime</span>
                                                <Badge className="bg-green-100 text-green-800">99.9%</Badge>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Integration Status</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <span>Power BI</span>
                                                <Badge className="bg-green-100 text-green-800">Connected</Badge>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span>Tableau</span>
                                                <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span>API Access</span>
                                                <Badge className="bg-green-100 text-green-800">Active</Badge>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default ReportsModule;