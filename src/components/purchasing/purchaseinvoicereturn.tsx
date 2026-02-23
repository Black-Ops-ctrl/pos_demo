import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Search, Package, ChevronsUpDown, Check, Eye, Edit, Trash2, Loader2, ArrowUp, Printer, Calendar } from 'lucide-react';
import { toast, useToast } from '@/hooks/use-toast';
import { approvePurchaseInvoices, getPODetails } from '@/api/purchaseInvoiceApi';
import { getItemsfordiscount, getPurchaseOrdersinvoice } from '@/api/poApi';
import { 
    createPurchasereturnInvoice, 
    getPurchasereturninvoices, 
    getCompanyimg,
    getVehicles,
    updatePurchaseReturnInvoice,deleteReturnInvoice,approvePurchaseReturn,
    unApprovePurchaseReturn
} from '@/api/purchasereturninvoiceApi';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";

import { getVendors } from '@/api/vendorsApi';
import { getBranches } from '@/api/branchApi';
import { getFlock } from '@/api/flockApi';
import AhmadPoultryLogo from '@/assets/AhmadPoultryLogo.png';
import { getbirdsVehicles } from '@/api/birdsVehiclesApi';

// --- Interface Definitions ---
interface InvoiceItem {
    item_id: number;
    item_name: string;
    item_code: string;
   
   
    returned_qty: number; // NEW: Add return quantity field
    unit_price: number;
    discount: number;
    discount_percentage: number;
    uom_id: number;
    uom_name:string;
}

interface CompanyData {
  company_id: number;
  company_name: string;
  registration_number: string;
  address: string;
  phone: string;
  email: string;
  image: string;
  module_id: number;
}

interface Vehicle {
  vehicle_id: number;
  vehicle_name: string;
  vehicle_no?: string; 
  status?: string; 
}
interface BirdsVehicle {
  vehicle_id: number;
  vehicle_name: string;
  vehicle_no?: string; 
  status?: string; 
}

interface InvoiceReturn {
    purchase_return_id: number;
   
    vendor_id: number;
    vendor_name: string;
    branch_id: number;
    branch_name: string;
    flock_id: number;
    flock_name: string;
    return_date: Date;
   
    total_amount: number;
    created_date: string;
    created_by: string;
    remarks: string;
    freight: number;
    vehicle_no?: string; // Make optional
    vehicle_feed_check: string;
    items: InvoiceItem[];
    status: string;
}

interface viewingInvoice extends InvoiceReturn { }

// --- PurchaseInvoice Component ---
const PurchaseInvoiceReturn: React.FC = () => {
    const [Returns, setReturns] = useState<InvoiceReturn[]>([]);
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [dateFilterApplied, setDateFilterApplied] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingInvoice, setEditingInvoice] = useState<InvoiceReturn | null>(null);
    const [showScrollToTop, setShowScrollToTop] = useState(false);
    const [viewingInvoice, setViewingInvoice] = useState<viewingInvoice | null>(null);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [selectedInvoices, setSelectedInvoices] = useState<number[]>([]);
    const [filterStatus, setFilterStatus] = useState<string>('ALL');
    const [companyData, setCompanyData] = useState<CompanyData | null>(null);
    const [openStatus, setOpenStatus] = useState(false);
    const [isLoading, setIsLoading] = useState<boolean>(false); // Add loading state

    const { toast } = useToast();
    const permissions = JSON.parse(
  sessionStorage.getItem('role_permissions') || '{}'
);


    const loadCompanyImage = async () => {
        try {
            const data = await getCompanyimg();
            if (data && data.length > 0) {
                setCompanyData(data[0]);
            }
        } catch (error) {
            console.error("Error loading company image", error);
        }
    };

    const loadInvoices = async () => {
        setIsLoading(true);
        try {
            let data;
            if (dateFilterApplied && startDate && endDate) {
                // Date filter 
                data = await getPurchasereturninvoices(startDate, endDate);
            } else {
                // Date filter 
                data = await getPurchasereturninvoices();
            }
            // Ensure data is always an array
            setReturns(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error loading Invoice Returns', error);
            toast({
                title: "Error",
                description: "Failed to load invoice Returns.",
                variant: "destructive",
                duration: 3000,
            });
            setReturns([]); // Set empty array on error
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadInvoices();
        loadCompanyImage();
    }, []);

    useEffect(() => {
        if (dateFilterApplied && startDate && endDate) {
            loadInvoices();
        }
    }, [dateFilterApplied, startDate, endDate]);

    const checkScrollTop = useCallback(() => {
        if (!showScrollToTop && window.scrollY > 400) {
            setShowScrollToTop(true);
        } else if (showScrollToTop && window.scrollY <= 400) {
            setShowScrollToTop(false);
        }
    }, [showScrollToTop]);

    useEffect(() => {
        window.addEventListener('scroll', checkScrollTop);
        return () => {
            window.removeEventListener('scroll', checkScrollTop);
        };
    }, [checkScrollTop]);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    const handleApplyDateFilter = () => {
        if (startDate && endDate) {
            setDateFilterApplied(true);
            loadInvoices();
        } else {
            toast({
                title: "Warning",
                description: "Please select both start and end dates",
                variant: "destructive",
                duration: 3000,
            });
        }
    };

    const handleClearDateFilter = () => {
        setStartDate('');
        setEndDate('');
        setDateFilterApplied(false);
        loadInvoices();
    };

    const handleViewInvoice = (purchase_return_id: number) => {
        const selectedinvoice = Returns.find(invoice => invoice.purchase_return_id === purchase_return_id);
        if (selectedinvoice) {
            setViewingInvoice(selectedinvoice);
            console.log("Filter Viewing invoice:", selectedinvoice);
            setViewDialogOpen(true);
        }
    };

    const handleAddInvoice = () => {
        setEditingInvoice(null);
        setShowForm(true);
    };

    const handleEditInvoice = (invoice: InvoiceReturn) => {
        setEditingInvoice(invoice);
        setShowForm(true);
    };

   const handleSaveInvoice = async (payload: {
    vendor_id: number;
    branch_id: number;
    return_date: string;
    items: InvoiceItem[];
    total_amount: number;
    total_discount: number;
    total_tax: number;
    purchase_return_id?: number;
    remarks: string;
}) => {
    try {
        if (editingInvoice) {
            // 🔹 UPDATE RETURN INVOICE
            await updatePurchaseReturnInvoice(
                editingInvoice.purchase_return_id,
                payload.vendor_id,
                payload.return_date,
                payload.total_amount,
                payload.total_discount,
                payload.total_tax,
                payload.branch_id,
                payload.remarks,
                payload.items
            );

            toast({
                title: "Updated",
                description: "Invoice updated successfully!",
                duration: 3000,
            });

        } else {
            // 🔹 CREATE NEW RETURN INVOICE
            await createPurchasereturnInvoice(
                payload.vendor_id,
                payload.return_date,
                payload.total_amount,
                payload.total_discount,
                payload.total_tax,
                payload.branch_id,
                payload.remarks,
                payload.items
            );

            toast({
                title: "Created",
                description: "Invoice created successfully!",
                duration: 3000,
            });
        }

        setShowForm(false);
        setEditingInvoice(null);
        loadInvoices();

    } catch (error: any) {
        toast({
            title: "Error",
            description: "Failed to save invoice. " + error.message,
            variant: "destructive",
            duration: 3000,
        });
        console.error("Error saving Invoice", error);
    }
};


 



    const handleApproveInvoices = async () => {
        if (selectedInvoices.length === 0) return;

        try {
            await approvePurchaseReturn(selectedInvoices);
            toast({
                title: "Approved",
                description: `${selectedInvoices.length} invoice(s) approved successfully.`,
                duration: 3000,
            });

            setSelectedInvoices([]);
            loadInvoices();
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to approve selected invoices.",
                variant: "destructive",
                duration: 3000,
            });
            console.error("Error approving invoices:", error);
        }
    };
 const handleUnApproveInvoices = async () => {
        if (selectedInvoices.length === 0) return;

        try {
            await unApprovePurchaseReturn(selectedInvoices);
            toast({
                title: "UnApproved",
                description: `${selectedInvoices.length} Invoice(s) UnApproved Successfully.`,
                duration: 3000,
            });

            setSelectedInvoices([]);
            loadInvoices();
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to Unapprove selected invoices.",
                variant: "destructive",
                duration: 3000,
            });
            console.error("Error Unapproving invoices:", error);
        }
    };

 

    const handleDeleteInvoice = async (purchase_return_id: number) => {
        try {
            await deleteReturnInvoice(purchase_return_id);
            toast({
                title: "Deleted",
                description: `Invoice deleted successfully!.`,
                duration: 3000,
            });
            loadInvoices();
        } catch (error) {
            console.error("Error deleting invoice:", error);
        }
    };

    const handlePrint = (invoice: InvoiceReturn) => {
        const printWindow = window.open("", "_blank", "width=900,height=1000");
        const invoiceDate = new Date(invoice.return_date);
        const formattedDate = `${invoiceDate.getDate()}-${invoiceDate.toLocaleString("default", {
            month: "short",
        })}-${String(invoiceDate.getFullYear()).slice(-2)}`;
        
        // NEW: Format return date
        const returnDate = invoice.return_date ? new Date(invoice.return_date) : null;
        const formattedReturnDate = returnDate ? `${returnDate.getDate()}-${returnDate.toLocaleString("default", {
            month: "short",
        })}-${String(returnDate.getFullYear()).slice(-2)}` : "N/A";

        // Assuming totalAmount is the sum of all item totals (excluding freight)
        const totalAmount = Number(invoice.total_amount || 0);
        // Keeping your original Grand Total calculation logic: total amount minus freight
        const grandTotal = totalAmount;

        const freight = (invoice.freight || 0);

        const graannndtotal = (grandTotal - freight );

        const numberToWords = (num: number) => {
            const a = [
                '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven',
                'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen',
                'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
            ];

            const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

            const convert = (n: number): string => {
                if (n < 20) return a[n];

                if (n < 100)
                    return b[Math.floor(n / 10)] + (n % 10 ? ' ' + a[n % 10] : '');

                if (n < 1000)
                    return a[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' and ' + convert(n % 100) : '');

                // Thousand
                if (n < 1_000_000)
                    return convert(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + convert(n % 1000) : '');

                // Million
                if (n < 1_000_000_000)
                    return convert(Math.floor(n / 1_000_000)) + ' Million' + (n % 1_000_000 ? ' ' + convert(n % 1_000_000) : '');

                // Billion
                return convert(Math.floor(n / 1_000_000_000)) + ' Billion' + (n % 1_000_000_000 ? ' ' + convert(n % 1_000_000_000) : '');
            };

            return convert(num) + ' Only /-';
        };

        const logoSource = companyData?.image || AhmadPoultryLogo;
        const companyName = companyData?.company_name || "Ahmad Poultry Farm";
        const companyAddress = companyData?.address || "";
        const companyPhone = companyData?.phone || "";
        const companyEmail = companyData?.email || "";
        const companyReg = companyData?.registration_number || "";

        const printContent = `
            <html>
                <head>
                    <title>Purchase Invoice #${invoice.purchase_return_id}</title>
                    <style>
                        @page {
                            margin-top: 0;
                            margin-bottom:0;
                        }
                        body {
                            font-family: 'Times New Roman', serif;
                            font-size: 12px;
                            margin: 30px;
                            color: #000;
                        }
                        .header {
                            display: flex;
                            align-items: flex-start;
                            justify-content: space-between;
                            margin-bottom: 10px;
                        }
                        .logo img {
                            width: 120px;
                        }
                        .title {
                            text-align: center;
                            flex: 1;
                        }
                        .title h2 {
                            margin: 0;
                        }
                        .title h4 {
                            margin: 2px 0;
                            text-decoration: underline;
                        }
                        .company-details {
                            font-size: 11px;
                            color: #666;
                            margin-bottom: 4px;
                        }
                        .top-bar {
                            display: flex;
                            justify-content: space-between;
                            margin: 10px 0 4px 0;
                            font-size: 13px;
                            font-weight: bold;
                        }
                        table {
                            width: 100%;
                            border-collapse: collapse;
                        }
                        .details-table td {
                            font-size: 12px;
                            border: 1px solid #000;
                            padding: 4px;
                        }
                        .main-table th,
                        .main-table td {
                            border: 1px solid #000;
                            padding: 8px;
                            text-align: center;
                            font-size: 12px;
                            height: 28px; 
                        }
                        .text-left {
                            text-align: left;
                        }
                        .footer {
                            margin-top: 24px;
                            font-size: 15px;
                            font-weight: bold;
                        }
                        .footer-note {
                            margin-top: 18px;
                            font-style: italic;
                            font-size: 13px;
                        }
                        .items-table {
                            margin-top: 10px;
                        }
                        .items-table th, .items-table td {
                            border: 1px solid #000;
                            padding: 6px;
                            text-align: center;
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div class="logo">
                            <img src="${logoSource}" alt="Company Logo" />
                        </div>
                        <div class="title">
                            <h2>${companyName}</h2>
                            <div class="company-details">
                                ${companyAddress ? `<div>${companyAddress}</div>` : ''}
                                ${companyPhone ? `<div>${companyPhone} ${companyEmail ? '| ' + companyEmail : ''}</div>` : ''}
                            </div>
                            <h4>PURCHASE INVOICE</h4>
                        </div>
                    </div>

                    <div class="top-bar">
                        <div>Invoice Date: ${formattedDate}</div>
                        <div>Invoice No: ${invoice.purchase_return_id}</div>
                        <div>Return Date: ${formattedReturnDate}</div>
                    </div>

                    <table class="details-table">
                        <tr>
                            <td><strong>Vendor Name:</strong> ${invoice.vendor_name || "N/A"}</td>
                            <td><strong>Branch:</strong> ${invoice.branch_name || "N/A"}</td>
                        </tr>
                        
                        <tr>
                            <td><strong>Status:</strong> ${invoice.status || "N/A"}</td>
                            <td><strong>Narration:</strong> ${invoice.remarks || "N/A"}</td>
                        </tr>
                    </table>

                    <div class="items-table">
                        <table class="main-table">
                            <thead>
                                <tr>
                                    <th>Sr#</th>
                                    <th>Item Name</th>
                                    <th>Unit</th>
                                    <th>Item Code</th>
                                    <th>Return Qty</th>
                                    <th>Unit Price</th>
                                    <th>Discount</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${(invoice.items || []).map((item, index) => {
                                    // Net price is calculated per unit.
                                    const netUnitPrice = (item.unit_price || 0) - (item.discount || 0);
                                    // Item total is (Received Quantity * Unit Price) - Discount
                                    const itemTotal = (item.returned_qty || 0) * (item.unit_price || 0);
                                    const discount = item.discount || 0;
                                    // The item row total should be calculated excluding the 'Freight' which should be a one-time charge (Handled in Grand Total)
                                    const rowTotal = (itemTotal - discount);
                                    
                                    return `
                                        <tr>
                                            <td>${index + 1}</td>
                                            <td class="text-left">${item.item_name || "N/A"}</td>
                                            <td>${item.uom_name || "N/A"}</td>
                                            <td>${item.item_code || "N/A"}</td>
                                            <td>${item.returned_qty || 0}</td>
                                            <td>${(item.unit_price || 0).toLocaleString()}</td>
                                            <td>${discount.toLocaleString()}</td>
                                            <td>${rowTotal.toLocaleString()}</td>
                                        </tr>
                                        `;
                                }).join('')}
                                
                                <tr>
                                    <td colspan="9" style="text-align:right; font-weight:bold;">Total:</td>
                                    <td style="font-weight:bold;">${totalAmount.toLocaleString()}</td>
                                </tr>
                                
                                <tr>
                                    <td colspan="9" style="text-align:right; font-weight:bold;">Grand Total:</td>
                                    <td style="font-weight:bold;">${graannndtotal.toLocaleString()}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div class="footer">
                        Amount in Words: <span style="font-weight:900;">${numberToWords(Math.round(grandTotal))}</span>
                    </div>

                    <div class="footer-note">
                        <p>This is a system generated purchase invoice and does not require signature or stamp.</p>
                    </div>

                    <script>
                        window.onload = function () {
                            window.print();
                            setTimeout(() => window.close(), 500);
                        };
                    </script>
                </body>
            </html>
        `;

        if (printWindow) {
            printWindow.document.open();
            printWindow.document.write(printContent);
            printWindow.document.close();
        }
    };

    const allSelectedInvoicesApproved = selectedInvoices.length > 0 && 
        selectedInvoices.every(invoiceId => {
            const invoice = Returns.find(inv => inv.purchase_return_id === invoiceId);
            return invoice?.status === 'CLOSED';
        });

    const allSelectedInvoicesCreated = selectedInvoices.length > 0 && 
        selectedInvoices.every(invoiceId => {
            const invoice = Returns.find(inv => inv.purchase_return_id === invoiceId);
               console.log(`Invoice ${invoiceId}: status = ${invoice?.status}`); // Debug log
            return invoice?.status === 'CREATED';
        });
console.log(`Approve button should show: ${allSelectedInvoicesCreated}`); // Debug log

    // FIXED: Ensure Invoices is always an array before filtering
    const filteredInvoices = (Returns || []).filter(
        (Invoice) => 
            (Invoice.purchase_return_id.toString().includes(searchTerm) ||
               
                Invoice.vendor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (Invoice.vehicle_no && Invoice.vehicle_no.toLowerCase().includes(searchTerm.toLowerCase()))) &&
            (filterStatus === 'ALL' || Invoice.status === filterStatus)
    );

    const totalInvoices = Returns.length;
    const completedInvoices = Returns.filter((Invoice) => Invoice.status === 'APPROVED').length;
    const totalValue = Returns.reduce((sum, Invoice) => sum + Number(Invoice.total_amount || 0), 0);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'CREATED': return 'bg-red-100 text-red-800';
            case 'SENT': return 'bg-blue-100 text-blue-800';
            case 'APPROVED': return 'bg-green-100 text-green-800';
            case 'CANCELLED': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Total Invoices</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalInvoices}</div>
                    </CardContent>
                </Card>
                <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Approved Invoices</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{completedInvoices}</div>
                    </CardContent>
                </Card>
                <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Total Value</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalValue.toLocaleString()}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Invoice Table */}
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
                <CardHeader>
                    <div className="flex justify-between items-center mb-4">
                        <CardTitle className="flex items-center gap-2">
                            <Package className="h-5 w-5" /> Purchase Invoices Return
                        </CardTitle>
                        <div className="flex justify-end gap-2 mt-2">
                            {selectedInvoices.length > 0 && allSelectedInvoicesCreated 
                            && permissions.purchasing_approve === 1 && (
                                <Button
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                    onClick={handleApproveInvoices}
                                >
                                    Approve ({selectedInvoices.length})
                                </Button>
                            )}
                            {selectedInvoices.length > 0 && allSelectedInvoicesApproved  
                            && permissions.purchasing_unapprove === 1 && (
                                <Button
                                    className="bg-orange-600 hover:bg-orange-700 text-white"
                                    onClick={handleUnApproveInvoices}
                                >
                                    Unapprove ({selectedInvoices.length})
                                </Button>
                            )}
                            <Button onClick={handleAddInvoice} className="bg-gradient-to-r from-purple-500 to-purple-600">
                                <Plus className="h-4 w-4 mr-2" /> Create Invoice
                            </Button>
                        </div>
                    </div>
                    
                    <div className="flex gap-4 mt-4">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">Start Date:</span>
                            <Input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-40"
                            />
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">End Date:</span>
                            <Input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-40"
                                min={startDate}
                            />
                        </div>
                        
                        <Button
                            onClick={handleApplyDateFilter}
                            disabled={!startDate || !endDate}
                            className="bg-blue-500 hover:bg-blue-600"
                        >
                            Apply Date Filter
                        </Button>
                        
                        {dateFilterApplied && (
                            <Button
                                onClick={handleClearDateFilter}
                                variant="outline"
                                className="border-red-500 text-red-500 hover:bg-red-50"
                            >
                                Clear Filter
                            </Button>
                        )}
                    </div>

                    <div className="flex gap-4 mt-2">
                        <div className="relative w-2/3">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search Invoice No, PO, or Vendor or Vehicle No..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        <div className="w-1/3">
                            <Popover open={openStatus} onOpenChange={setOpenStatus}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={openStatus}
                                        className="w-full justify-between"
                                    >
                                        {filterStatus === "ALL"
                                            ? "Filter by Status..."
                                            : filterStatus}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-full p-0">
                                    <Command>
                                        <CommandInput placeholder="Search status..." />
                                        <CommandEmpty>No status found.</CommandEmpty>
                                        <CommandGroup>
                                            {[
                                                { label: "All Statuses", value: "ALL" },
                                                { label: "CREATED", value: "CREATED" },
                                                { label: "CLOSED", value: "CLOSED" },
                                            ].map((statusOption) => (
                                                <CommandItem
                                                    key={statusOption.value}
                                                    onSelect={() => {
                                                        setFilterStatus(statusOption.value);
                                                        setOpenStatus(false);
                                                    }}
                                                    value={statusOption.value}
                                                >
                                                    <Check
                                                        className={cn(
                                                            "mr-2 h-4 w-4",
                                                            filterStatus === statusOption.value ? "opacity-100" : "opacity-0"
                                                        )}
                                                    />
                                                    {statusOption.label}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                            <span className="ml-2">Loading invoices...</span>
                        </div>
                    ) : filteredInvoices.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            No invoices found
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className='w-10'>
                                        <input
                                            type="checkbox"
                                            checked={
                                                selectedInvoices.length > 0 &&
                                                selectedInvoices.length === filteredInvoices.filter(inv => 
                                                    inv.status === 'CREATED' || inv.status === 'APPROVED'
                                                ).length
                                            }
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedInvoices(
                                                        filteredInvoices
                                                            .filter(inv => inv.status === 'CREATED' || inv.status === 'APPROVED')
                                                            .map((inv) => inv.purchase_return_id)
                                                    );
                                                } else {
                                                    setSelectedInvoices([]);
                                                }
                                            }}
                                            title="Select All"
                                            className="form-checkbox h-4 w-4 text-purple-600 transition duration-150 ease-in-out"
                                        />
                                    </TableHead>
                                    <TableHead>Invoice No</TableHead>
                                    {/* <TableHead> Vehicle No</TableHead> */}
                                    
                                    <TableHead>Vendor</TableHead>
                                    <TableHead>Branch Name</TableHead>
                                   
                                    <TableHead>Return Date</TableHead>
                                    <TableHead>Total Amount</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredInvoices.map((Invoice) => (
                                    <TableRow key={Invoice.purchase_return_id}>
                                        <TableCell className='w-10'>
                                            <input
                                                type="checkbox"
                                                checked={selectedInvoices.includes(Invoice.purchase_return_id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedInvoices((prev) => [...prev, Invoice.purchase_return_id]);
                                                    } else {
                                                        setSelectedInvoices((prev) =>
                                                            prev.filter((id) => id !== Invoice.purchase_return_id)
                                                        );
                                                    }
                                                }}
                                                className="form-checkbox h-4 w-4 text-purple-600 transition duration-150 ease-in-out"
                                            />
                                        </TableCell>
                                        <TableCell className="font-medium">{Invoice.purchase_return_id}</TableCell>
                                        {/* <TableCell>{Invoice.vehicle_no}</TableCell> */}
                                        
                                        <TableCell>{Invoice.vendor_name}</TableCell>
                                        <TableCell>{Invoice.branch_name}</TableCell>
                                        <TableCell>
                                            {new Date(Invoice.return_date).toLocaleString("en-PK", {
                                                timeZone: "Asia/Karachi",
                                                year: "numeric",
                                                month: "short",
                                                day: "2-digit",
                                            })}
                                        </TableCell>
                                        
                                        <TableCell>
                                            {new Intl.NumberFormat('en-US').format(Invoice.total_amount)}
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={getStatusColor(Invoice.status)}>{Invoice.status}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-1">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleViewInvoice(Invoice.purchase_return_id)}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handlePrint(Invoice)}
                                                >
                                                    <Printer className="h-4 w-4" />
                                                </Button>
                                                {Invoice.status === "CREATED" && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleEditInvoice(Invoice)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                {Invoice.status === "CREATED" && (
                                                    <Button
                                                        onClick={() => handleDeleteInvoice(Invoice.purchase_return_id)}
                                                        size="sm"
                                                        variant="outline"
                                                        className="text-red-600 hover:text-red-700"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {showScrollToTop && (
                <Button
                    onClick={scrollToTop}
                    size="icon"
                    className="fixed bottom-6 right-6 z-50 rounded-full shadow-lg 
                               bg-blue-500 hover:bg-blue-600 transition-opacity duration-300"
                    aria-label="Scroll to top"
                >
                    <ArrowUp className="h-5 w-5" />
                </Button>
            )}

           {showForm && (
    <InvoiceReturnForm
        invoice={editingInvoice}     // Correct prop name
        onClose={() => setShowForm(false)}
        onSave={handleSaveInvoice}   // Correct function
    />
)}

            <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
                <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Purchase Invoice return Details</DialogTitle>
                    </DialogHeader>
                    {viewingInvoice && (
                        <>
                            <table className="w-full border border-gray-300 mb-4 text-sm">
                                <tbody>
                                    <tr><td className="p-2 font-medium text-gray-600 border">Invoice Number</td><td className="p-2 border">{viewingInvoice.purchase_return_id}</td></tr>
                                   <tr><td className="p-2 font-medium text-gray-600 border">Branch Name</td><td className="p-2 border">{viewingInvoice.branch_name}</td></tr>
                                    <tr><td className="p-2 font-medium text-gray-600 border">Return Date</td><td className="p-2 border">{viewingInvoice.return_date ? new Date(viewingInvoice.return_date).toLocaleDateString() : 'N/A'}</td></tr>
                                    <tr><td className="p-2 font-medium text-gray-600 border">Total Amount</td><td className="p-2 border">{viewingInvoice.total_amount}</td></tr>
                                    <tr><td className="p-2 font-medium text-gray-600 border">Vendor</td><td className="p-2 border">{viewingInvoice.vendor_name}</td></tr>
                                    
                                    {/* <tr><td className="p-2 font-medium text-gray-600 border">Vehicle No</td><td className="p-2 border">{viewingInvoice.vehicle_no}</td></tr> */}
                                    {/* <tr><td className="p-2 font-medium text-gray-600 border">Vehicle Feed Check</td><td className="p-2 border">{viewingInvoice.vehicle_feed_check}</td></tr> */}
                                    <tr><td className="p-2 font-medium text-gray-600 border">Status</td><td className="p-2 border">{viewingInvoice.status}</td></tr>
                                </tbody>
                            </table>

                            <h3 className="text-md font-semibold mb-2">Items</h3>
                            <table className="w-full border border-gray-300 text-sm">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="p-2 border text-left">Item Name</th>
                                        <th className="p-2 border text-left">Item Code</th>
                                        <th className="p-2 border text-left">Return Qty</th>
                                        <th className="p-2 border text-left">Unit Price</th>
                                        <th className="p-2 border text-left">Discount</th>
                                        <th className="p-2 border text-left">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(viewingInvoice.items || []).map((item, index) => {
                                        const netPrice = item.unit_price - (item.discount || 0);
                                        const itemTotal = item.returned_qty * item.unit_price - (item.discount || 0);
                                        
                                        return (
                                            <tr key={index}>
                                                <td className="p-2 border">{item.item_name ?? '-'}</td>
                                                <td className="p-2 border">{item.item_code ?? '-'}</td>
                                                <td className="p-2 border">{item.returned_qty || 0}</td>
                                                <td className="p-2 border">{item.unit_price}</td>
                                                <td className="p-2 border">{item.discount || 0}</td>
                                                <td className="p-2 border">{itemTotal}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};
export interface PurchaseInvoiceFormProps {
  invoice: InvoiceReturn | null;
  onClose: () => void;
  onSave: (payload: {
    vendor_id: number;
    branch_id: number;
    return_date: string;
    items: InvoiceItem[];
    total_amount: number;
    total_discount: number;
    total_tax: number;
    purchase_return_id?: number; 
    remarks: string;
  }) => void;
}

// --- InvoiceForm Component ---
export const InvoiceReturnForm: React.FC<PurchaseInvoiceFormProps> = ({  
    invoice,
    onClose,
    onSave, }) => {
  const [vendors, setVendors] = useState<any[]>([]);
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [vehicles, setVehicles] = useState<BirdsVehicle[]>([]);
  
  const [vendorOpen, setVendorOpen] = useState(false);
  const [itemDropdown, setItemDropdown] = useState<number | null>(null);
  const [vehicleOpen, setVehicleOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [vendor_id, setVendorId] = useState<number>(0);
  const [birdsVehicles, setBirdsVehicles] = useState<BirdsVehicle[]>([]);
  const [selectedBirdVehicle, setSelectedBirdVehicle] = useState<BirdsVehicle | null>(null);
  const [openbirdsVehicle, setOpenbirdsVehicle] = useState(false);
  const [returnItems, setReturnItems] = useState<InvoiceItem[]>([{
      item_id: 0,
      returned_qty: 1,
      unit_price: 0,
      discount: 0,
      discount_percentage: 0,
      uom_id: 0,
      item_name: '',
      item_code: '',
      uom_name: ''
  }]);

  const [branch_id, setBranchId] = useState<number>(0);
  const [branches, setBranches] = useState([]);
  const [branchOpen, setBranchOpen] = useState(false);
  const [return_date, setReturnDate] = useState<string>('');
  const [vehicle_number, setVehicleNumber] = useState<string>('');
  


  
  const totalAmount = useMemo(() => {
    return returnItems.reduce((total, item) => {
      const lineTotal = (item.returned_qty || 0) * (item.unit_price || 0) - (item.discount || 0);
      return total + lineTotal;
    }, 0);
  }, [returnItems]);

 useEffect(() => {
        const fetchData = async () => {
            try {
                const [branchData, vendorData, vehicleData, birdsVehicleData] = await Promise.all([
                   
                    getBranches(),
                    getVendors(),
                    
                    getVehicles(),
                    getbirdsVehicles()
                ]);

                console.log("Vehicle Data:", vehicleData);

                const approvedBranches = branchData.filter((branch: any) => branch.status === 'APPROVED');
                
                const approvedVehicles = vehicleData.filter((vehicle: Vehicle) => 
                    vehicle.status === 'APPROVED' || !vehicle.status
                );

               
                setBranches(approvedBranches || []);
                setVendors(vendorData || []);
               
                setVehicles(approvedVehicles || []);
                setBirdsVehicles(birdsVehicleData || []);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        fetchData();
    }, []);
  useEffect(() => {
    if (invoice) {
      const dateString = invoice.return_date instanceof Date 
        ? invoice.return_date.toISOString().split('T')[0]
        : typeof invoice.return_date === 'string'
        ? invoice.return_date.split('T')[0]
        : '';
      setReturnDate(dateString);
      setVendorId(invoice.vendor_id || 0);
      setBranchId(invoice.branch_id || 0);
    setReturnItems(
      invoice.items?.map((item) => ({
        item_id: item.item_id || 0,
        item_name: item.item_name || '',
        item_code: item.item_code || '',
        returned_qty: item.returned_qty || 0,
        unit_price: item.unit_price || 0,
        discount: item.discount || 0,
        discount_percentage: item.discount_percentage || 0,
        uom_id: item.uom_id || 0,
        uom_name: item.uom_name || '',
      })) || []
    );

    // Optional: if vehicle info exists
    if ((invoice as any).vehicle_number) {
      setVehicleNumber((invoice as any).vehicle_number);
    }
  }
}, [invoice]);

  useEffect(() => {
    if (branch_id) {
      const loadItems = async () => {
        try {
          const itemsRes = await getItemsfordiscount(branch_id);
          const rawItems = ((itemsRes as any)?.data ?? (itemsRes as any) ?? []) as any[];
          const normalizedItems: InvoiceItem[] = rawItems.map((r) => ({
            item_id: Number(r.item_id),
            item_name: String(r.item_name ?? r.name ?? ""),
            item_code: String(r.item_code ?? r.code ?? ""),
            returned_qty: 0,
            unit_price: Number(r.price ?? r.unit_price ?? 0),
            discount: Number(r.discount ?? 0),
            discount_percentage: 0,
            uom_id: Number(r.uom_id ?? 0),
            uom_name: String(r.uom_name ?? r.uom ?? ""),
          }));
          setItems(normalizedItems);
        } catch (err) {
          console.error("Failed loading items for branch:", err);
        }
      };
      loadItems();
    }
  }, [branch_id]);




  const addItemRow = () => setReturnItems((p) => [...p, { 
    item_id: 0,
    item_name: '',
    item_code: '',
    returned_qty: 1, 
    unit_price: 0, 
    uom_id: 0, 
    uom_name: '', 
    discount: 0,
    discount_percentage: 0
  }]);
  
  const removeItemRow = (index: number) => setReturnItems((p) => p.filter((_, i) => i !== index));

  const handleSelectItem = (rowIndex: number, itemId: number) => {
    const selectedItem = items.find(item => item.item_id === itemId);
    if (selectedItem) {
      setReturnItems((prev) => {
        const copy = [...prev];
        copy[rowIndex] = { 
          ...copy[rowIndex], 
          item_id: Number(itemId),
          unit_price: selectedItem.unit_price || 0,
          uom_id: selectedItem.uom_id || 0,
          uom_name: selectedItem.uom_name || '',
          discount: selectedItem.discount || 0,
          discount_percentage: 0
        };
        return copy;
      });
    }
    setItemDropdown(null);
  };

  const handleChangeRow = (index: number, field: keyof InvoiceItem, value: string | number) => {
    setReturnItems((prev) => {
      const copy = [...prev];
      
      if (field === 'discount_percentage') {
        const numericValue = value === "" ? 0 : 
                           typeof value === 'string' ? parseFloat(value) || 0 : value;
        const returned_qty = copy[index].returned_qty || 0;
        const unitPrice = copy[index].unit_price || 0;
        const discountAmount = (returned_qty * unitPrice * numericValue) / 100;
        
        copy[index] = {
          ...copy[index],
          discount_percentage: numericValue,
          discount: discountAmount
        };
      } else if (field === 'returned_qty' || field === 'unit_price') {
        const numericValue = value === "" ? 0 : 
                           typeof value === 'string' ? parseFloat(value) || 0 : value;
        
        copy[index] = {
          ...copy[index],
          [field]: numericValue,
        };
        
        const returned_qty = field === 'returned_qty' ? numericValue : copy[index].returned_qty || 0;
        const unitPrice = field === 'unit_price' ? numericValue : copy[index].unit_price || 0;
        const discount = copy[index].discount || 0;
        
        if (returned_qty > 0 && unitPrice > 0) {
          const discountPercentage = (discount / (returned_qty * unitPrice)) * 100;
          copy[index].discount_percentage = discountPercentage;
        } else {
          copy[index].discount_percentage = 0;
        }
      } else if (field === 'discount') {
        const numericValue = value === "" ? 0 : 
                           typeof value === 'string' ? parseFloat(value) || 0 : value;
        const returned_qty = copy[index].returned_qty || 0;
        const unitPrice = copy[index].unit_price || 0;
        const discountPercentage = returned_qty > 0 && unitPrice > 0 
          ? (numericValue / (returned_qty * unitPrice)) * 100 
          : 0;
        
        copy[index] = {
          ...copy[index],
          discount: numericValue,
          discount_percentage: discountPercentage
        };
      } else {
        copy[index] = {
          ...copy[index],
          [field]: value,
        };
      }
      
      return copy;
    });
  };

  const handleSelectVehicle = (vehicleId: string) => {
    const selectedVehicle = vehicles.find(v => v.vehicle_id === Number(vehicleId));
    if (selectedVehicle) {
      setVehicleNumber(selectedVehicle.vehicle_name);
    }
    setVehicleOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!branch_id || branch_id === 0) {
    alert("Select branch");
    return;
  }

  if (!vendor_id || vendor_id === 0) {
    alert("Select vendor");
    return;
  }

  if (
    returnItems.length === 0 ||
    returnItems.some(
      (r) => !r.item_id || r.item_id === 0 || r.returned_qty <= 0 || r.unit_price <= 0
    )
  ) {
    alert("Add at least one valid item.");
    return;
  }

  // Compute total discount & total tax if needed
  const total_discount = returnItems.reduce((a, b) => a + (b.discount || 0), 0);
  const total_tax = 0; // If tax not used, set 0

  setIsLoading(true);

  try {
    onSave({
          vendor_id,
          branch_id,
          return_date,
          items: returnItems,
          total_amount: totalAmount,
          total_discount,
          total_tax,
          remarks: "", // You can add remarks field if needed
          purchase_return_id: invoice?.purchase_return_id ?? undefined,
      });
  } catch (error) {
    console.error("Submission error caught in form:", error);
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white p-6 rounded-lg w-[90%] md:w-[70%] max-w-[1000px] overflow-y-auto border-2 border-blue-700 rounded-xl">
        <h2 className="text-lg font-semibold mb-4">{invoice ? "Edit Purchase Return" : "Create Purchase Return"}</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Main Selectors with Border */}
          <div className="border p-4 rounded-lg space-y-4 md:space-y-0 md:space-x-4 md:flex">
            {/* Order Date */}
            <div className="flex flex-col flex-1">
              <span className="text-sm font-medium text-gray-700">Return Date</span>
              <Input
                type="date"
                value={return_date}
                onChange={(e) => setReturnDate(e.target.value)}
                className="w-full"
                required
              />
            </div>

            {/* Branch selector */}
            <div className="flex flex-col flex-1">
              <span className="text-sm font-medium text-gray-700">
                 Branch Name
              </span>
              <Popover open={branchOpen} onOpenChange={setBranchOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" className="w-full justify-between">
                    {branch_id
                      ? `${branches.find((br: any) => br.branch_id === branch_id)?.branch_name}`
                      :"Select Branch"
                      }
                    <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="max-h-[300px] overflow-auto">
                  <Command>
                    <CommandInput placeholder={"Search branches..."} className="text-black" />
                    <CommandEmpty>{"No branch found."}</CommandEmpty>
                    <CommandGroup>
                      {branches.map((br: any) => (
                        <CommandItem 
                          key={br.branch_id}
                          className="hover:bg-gray-100"
                          onSelect={() => {
                            setBranchId(br.branch_id);
                            setBranchOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              branch_id === br.branch_id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {br.branch_name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            
            {/* Vehicle Number - Only for module_id 2, replaced with select dropdown */}
             
              {/* <div className="flex flex-col flex-1">
                <span className="text-sm font-medium text-gray-700">Vehicle Number</span>
                <Popover open={vehicleOpen} onOpenChange={setVehicleOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" className="w-full justify-between">
                      {vehicle_number
                        ? vehicles.find((v) => v.vehicle_name === vehicle_number)?.vehicle_name
                        : "Select Vehicle"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="max-h-[300px] overflow-auto">
                    <Command>
                      <CommandInput placeholder="Search vehicles..." className="text-black" />
                      <CommandEmpty>No vehicle found.</CommandEmpty>
                      <CommandGroup>
                        {vehicles.map((vehicle) => (
                          <CommandItem
                            key={vehicle.vehicle_id}
                            value={vehicle.vehicle_name.toString()}
                            className="hover:bg-gray-100"
                            onSelect={() => handleSelectVehicle(vehicle.vehicle_id.toString())}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                vehicle_number === vehicle.vehicle_name ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {vehicle.vehicle_name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div> */}
          
            {/* Vendor selector - Conditionally rendered */}
            
              <div className="flex flex-col flex-1">
                <span className="text-sm font-medium text-gray-700">
                    Vendor
                    </span>
                <Popover open={vendorOpen} onOpenChange={setVendorOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" className="w-full justify-between">
                      {vendor_id ? vendors.find((v) => Number(v.vendor_id) === vendor_id)?.vendor_name ?? "Select Vendor" : "Select Vendor"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="max-h-[300px] overflow-auto">
                    <Command>
                      <CommandInput placeholder="Search vendors..." />
                      <CommandEmpty>No approved vendors found</CommandEmpty>
                      <CommandGroup>
                        {vendors.map((v) => (
                          <CommandItem
                            key={v.vendor_id}
                            onSelect={() => {
                              setVendorId(Number(v.vendor_id));
                              setVendorOpen(false);
                            }}
                          >
                            <Check className={cn("mr-2 h-4 w-4", vendor_id === Number(v.vendor_id) ? "opacity-100" : "opacity-0")} />
                            {v.vendor_name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            
          </div>

          {/* Items rows */}
          <div className="space-y-1">
            <h3 className="text-md font-semibold mt-4 mb-2">Items</h3>
            <div className="flex items-center gap-2 text-xs font-bold text-gray-600 border-b pb-1">
              <span className="w-1/3">Item</span>
              <span className="w-[100px] text-center">Unit</span>
              <span className="w-[100px] text-center">Quantity</span>
              <span className="w-[100px] text-center">Unit Price</span>
              <span className="w-[100px] text-center">Discount %</span>
              <span className="w-[100px] text-center">Discount Amount</span>
              <span className="w-[100px] text-center">Line Total</span>
              <span className="w-[30px] text-center">Remove</span>
            </div>
            {returnItems.map((row, idx) => {
              const selectedItem = items.find((it) => Number(it.item_id) === Number(row.item_id));
              const lineTotal = (row.returned_qty || 0) * (row.unit_price || 0) - (row.discount || 0);
              return (
                <div key={idx} className="flex items-center gap-2">
                  <Popover open={itemDropdown === idx} onOpenChange={(open) => setItemDropdown(open ? idx : null)}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-1/3 justify-between">
                        {row.item_id ? selectedItem?.item_name ?? "Selected item" : "Select Item"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="max-h-[300px] overflow-auto">
                      <Command>
                        <CommandInput placeholder="Search items..." />
                        <CommandEmpty>No items</CommandEmpty>
                        <CommandGroup>
                          {items.map((it) => (
                            <CommandItem 
                              key={it.item_id} 
                              onSelect={() => handleSelectItem(idx, Number(it.item_id))}
                            >
                              <Check className={cn("mr-2 h-4 w-4", row.item_id === Number(it.item_id) ? "opacity-100" : "opacity-0")} />
                              {it.item_name} - {it.unit_price} ({it.uom_name}) {it.discount ? `- Discount: ${it.discount}` : ''}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>

                  <div className="flex flex-col w-[100px]">
                    <Input
                      value={row.uom_name || ''}
                      readOnly
                      placeholder="Unit"
                      className="bg-gray-50"
                    />
                  </div>

                  <div className="flex flex-col w-[100px]">
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={row.returned_qty === 0 ? "" : row.returned_qty}
                      onChange={(e) => handleChangeRow(idx, "returned_qty", e.target.value)}
                      placeholder="0.00"
                    />
                  </div>

                  <div className="flex flex-col w-[100px]">
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={row.unit_price === 0 ? "" : row.unit_price}
                      onChange={(e) => handleChangeRow(idx, "unit_price", e.target.value)}
                      placeholder="0.00"
                    />
                  </div>

                  <div className="flex flex-col w-[100px]">
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={row.discount_percentage === 0 ? "" : row.discount_percentage}
                      onChange={(e) => handleChangeRow(idx, "discount_percentage", e.target.value)}
                      placeholder="0.00%"
                    />
                  </div>

                  <div className="w-[100px] text-right font-medium text-sm border p-2 bg-gray-50 rounded">
                    {row.discount?.toFixed(2) || '0.00'}
                  </div>

                  <div className="w-[100px] text-right font-medium text-sm border p-2 bg-gray-50 rounded">
                    {lineTotal.toFixed(2)}
                  </div>

                  {returnItems.length > 1 && (
                    <Button
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => removeItemRow(idx)}
                      className="w-[30px] p-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              );
            })}

            <Button type="button" variant="secondary" onClick={addItemRow}>
              <Plus className="h-4 w-4 mr-1" /> Add Item
            </Button>
          </div>
          
          <div className="flex justify-end mt-4 pt-4 border-t">
            <div className="flex flex-col w-full max-w-[350px] space-y-2">
              <div className="flex justify-between items-center text-lg font-bold p-2 border-2 border-blue-500 rounded-lg bg-blue-50">
                <span>Total Amount:</span>
                <span className="text-blue-700">{totalAmount.toLocaleString('en-PK', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-blue-500 to-blue-600"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Inserting...
                </>
              ) : (
                "Save Purchase Return "
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PurchaseInvoiceReturn;