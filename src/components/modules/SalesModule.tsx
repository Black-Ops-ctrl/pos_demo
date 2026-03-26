import React, { useState, useEffect } from 'react'; // 👈 Import useEffect
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ColorfulTabs, ColorfulTabsContent, ColorfulTabsList, ColorfulTabsTrigger } from '@/components/ui/colorful-tabs';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '../ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DollarSign, ShoppingCart, TrendingUp, FileText, CreditCard, BarChart3 } from 'lucide-react';
import QuotationManagement from '@/components/sales/QuotationManagement';
import SalesOrders from '@/components/sales/SalesOrders';
import InvoiceManagement from '@/components/sales/InvoiceManagement';
import POSSystem from '@/components/sales/POSSystem';
import SalesReports from '@/components/sales/SalesReports';
import QuotationForm from '@/components/forms/QuotationForm';
import SalesOrderForm from '@/components/forms/SalesOrderForm';
import InvoiceForm from '@/components/forms/InvoiceForm';
import SalesPerson from '@/components/sales/SalesPerson';
import Customers from '@/components/sales/Customers';
import DeliveryChallans from '@/components/sales/DeliveryChallans';
import SalesInvoiceReturn from '@/components/sales/InvoiceReturn';
import Dashboard from '@/pages/dashboard';



const SalesModule: React.FC = () => {
    
    // Initialize activeTab from Session Storage or default to 'invoices'
    const [activeTab, setActiveTab] = useState(() => {
        // Use a unique key for the sales module tab
        return sessionStorage.getItem('salesActiveTab') || 'invoices';
    });

    // Save activeTab to Session Storage whenever it changes
    useEffect(() => {
        sessionStorage.setItem('salesActiveTab', activeTab);
    }, [activeTab]);


    const [showQuotationForm, setShowQuotationForm] = useState(false);
    const [showSalesOrderForm, setShowSalesOrderForm] = useState(false);
    const [showInvoiceForm, setShowInvoiceForm] = useState(false);
    const [showPOSDialog, setShowPOSDialog] = useState(false);

    const overviewData = {
        totalSales: 203500,
        // completedOrders: 45,
        pendingOrders: 12,
        activeQuotations: 8,
        outstandingInvoices: 15,
        posTransactions: 127
    };

    const handleSelect = (value: string) => {
        setActiveTab(value);
    };
    const handleQuickSale = () => {
        setShowPOSDialog(true);
    };

    const handleNewQuote = () => {
        setShowQuotationForm(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Sales & POS Management</h2>
                {/* <div className="flex gap-2">
                    <Button 
                        className="bg-gradient-to-r from-green-500 to-green-600"
                        onClick={handleQuickSale}
                    >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Quick Sale
                    </Button>
                    <Button variant="outline" onClick={handleNewQuote}>
                        <FileText className="h-4 w-4 mr-2" />  
                        New Quote
                    </Button>
                    
                </div> */}
            </div>

            <ColorfulTabs value={activeTab} onValueChange={setActiveTab}>
                <ColorfulTabsList className="grid w-full grid-cols-3 overflow-hidden">
                    {/* <ColorfulTabsTrigger value="overview">Overview</ColorfulTabsTrigger> */}
                    {/* <ColorfulTabsTrigger value="SalesInvoiceReturn">SalesInvoiceReturn</ColorfulTabsTrigger> */}

                    
                    {/* <ColorfulTabsTrigger value="orders">Sales Orders</ColorfulTabsTrigger> */}
                            {/* <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="bg-cyan-50  text-cyan-700 transform hover:bg-cyan-600 hover:text-white hover:scale-105  active:scale-95 min-w-fit">
                            Maintainance
                            </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-white border border-gray-300 rounded-lg p-2">
                        <DropdownMenuItem hoverColor="bg-red-500"
                            onClick={() => handleSelect("salesperson")}
                            >
                            Sales Persons
                        </DropdownMenuItem>
                       <div className="border-t-2 border-dashed my-1"></div>
                        <DropdownMenuItem className="hover:bg-cyan-500 p-2 rounded"
                            onClick={() => handleSelect("customer")}
                            >
                            Customers
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu> */}
                    {/* <ColorfulTabsTrigger value="delivery-challans">Delivery Challans</ColorfulTabsTrigger> */}
                    <ColorfulTabsTrigger value="invoices">Invoices</ColorfulTabsTrigger>
                    <ColorfulTabsTrigger value="dashboard">POS System</ColorfulTabsTrigger>
                    <ColorfulTabsTrigger value="reports">Reports</ColorfulTabsTrigger>
                    {/* <ColorfulTabsTrigger value="salesperson">Sales Persons</ColorfulTabsTrigger> */}
                    {/* <ColorfulTabsTrigger value="customer">Customers</ColorfulTabsTrigger> */}
                </ColorfulTabsList>

                {/* <ColorfulTabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-gray-600">Total Sales</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-2">
                                    <DollarSign className="h-5 w-5 text-green-500" />
                                    <span className="text-2xl font-bold"> Rs.{overviewData.totalSales.toLocaleString()}</span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">+12% from last month</p>
                            </CardContent>
                        </Card>

                        <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-gray-600">POS Transactions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-2">
                                    <CreditCard className="h-5 w-5 text-purple-500" />
                                    <span className="text-2xl font-bold">{overviewData.posTransactions}</span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Today's transactions</p>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <Button 
                                    className="h-20 flex-col gap-2" 
                                    variant="outline"
                                    onClick={() => setShowQuotationForm(true)}
                                >
                                    <FileText className="h-6 w-6" />
                                    <span>New Quotation</span>
                                </Button>
                                <Button 
                                    className="h-20 flex-col gap-2" 
                                    variant="outline"
                                    onClick={() => setShowSalesOrderForm(true)}
                                >
                                    <ShoppingCart className="h-6 w-6" />
                                    <span>Sales Order</span>
                                </Button>
                                <Button 
                                    className="h-20 flex-col gap-2" 
                                    variant="outline"
                                    onClick={() => setShowInvoiceForm(true)}
                                >
                                    <CreditCard className="h-6 w-6" />
                                    <span>Create Invoice</span>
                                </Button>
                                <Button 
                                    className="h-20 flex-col gap-2" 
                                    variant="outline"
                                    onClick={() => setActiveTab('reports')}
                                >
                                    <BarChart3 className="h-6 w-6" />
                                    <span>View Reports</span>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </ColorfulTabsContent> */}

                

                {/* <ColorfulTabsContent value="orders">
                    <SalesOrders />
                </ColorfulTabsContent> */}
                {/* <ColorfulTabsContent value="delivery-challans">
                    <DeliveryChallans />
                </ColorfulTabsContent> */}
                <ColorfulTabsContent value="invoices">
                    <InvoiceManagement />
                </ColorfulTabsContent>

                <ColorfulTabsContent value="dashboard" className="!p-0 !m-0">
                {activeTab === 'dashboard' && (
                    <div className="fixed inset-0 z-50 overflow-auto bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
                        {/* Header with Back Button and Centered Text - REDUCED HEIGHT */}
                        <div className="sticky top-0 z-10 bg-gradient-to-br from-teal-900 via-teal-700 to-black shadow-lg">
                            <div className="relative flex items-center justify-center py-2 px-4">
                                {/* Back Button - Left */}
                                <Button 
                                    variant="ghost" 
                                    onClick={() => setActiveTab('invoices')}
                                    className="absolute left-4 bg-white/20 text-white hover:bg-white/30 hover:text-white border-0 text-sm py-1 h-auto"
                                >
                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                    </svg>
                                    Back
                                </Button>
                                
                                {/* Centered Title - REDUCED TEXT SIZE */}
                                <h2 className="text-xl font-bold text-primary tracking-wide">
                                    POS System
                                </h2>                    
                            </div>
                        </div>
                        
                        {/* Content Area with Gradient Background */}
                        <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 min-h-screen">
                            <Dashboard />
                        </div>
                    </div>
                )}
            </ColorfulTabsContent>


            <ColorfulTabsContent value="SalesInvoiceReturn">
                <SalesInvoiceReturn />
            </ColorfulTabsContent>

            <ColorfulTabsContent value="reports">
                <SalesReports />
            </ColorfulTabsContent>
            
            <ColorfulTabsContent value="salesperson">
                <SalesPerson />
            </ColorfulTabsContent>
            
            <ColorfulTabsContent value="customer">
                <Customers />
            </ColorfulTabsContent>
            </ColorfulTabs>

            {/* Dialog Forms */}
            <Dialog open={showQuotationForm} onOpenChange={setShowQuotationForm}>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>New Quotation</DialogTitle>
                    </DialogHeader>
                    <QuotationForm onClose={() => setShowQuotationForm(false)} />
                </DialogContent>
            </Dialog>

            <Dialog open={showSalesOrderForm} onOpenChange={setShowSalesOrderForm}>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>New Sales Order</DialogTitle>
                    </DialogHeader>
                    <SalesOrderForm onClose={() => setShowSalesOrderForm(false)} />
                </DialogContent>
            </Dialog>

            <Dialog open={showInvoiceForm} onOpenChange={setShowInvoiceForm}>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Create Invoice</DialogTitle>
                    </DialogHeader>
                    <InvoiceForm onClose={() => setShowInvoiceForm(false)} />
                </DialogContent>
            </Dialog>

            <Dialog open={showPOSDialog} onOpenChange={setShowPOSDialog}>
                <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Quick Sale - POS System</DialogTitle>
                    </DialogHeader>
                    <POSSystem />
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default SalesModule;