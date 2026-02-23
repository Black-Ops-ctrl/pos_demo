import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Search, Package, ChevronsUpDown, Check, Eye, Edit, Trash2, Loader2, ArrowUp, Printer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getPODetails } from '@/api/purchaseInvoiceApi';
import { getPurchaseOrdersinvoice } from '@/api/poApi';
import { 
    approvePurchaseInvoices, 
    createPurchaseInvoice, 
    deletePurchaseInvoice, 
    getPurchaseinvoices, 
    updatePurchaseInvoice,
    getCompanyimg,
    unapprovePurchaseInvoices,
    getVehicles
} from '@/api/purchaseInvoiceApi'
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
    ordered_qty: number;
    received_qty: number;
    unit_price: number;
    discount: number;
    discount_percentage: number;
    uom_name?: string;
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

interface Invoice {
    purchase_invoice_id: number;
    po_id: number;
    vendor_id: number;
    vendor_name: string;
    branch_id: number;
    branch_name: string;
    flock_id: number;
    flock_name: string;
    invoice_date: Date;
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

interface viewingInvoice extends Invoice { }

// --- PurchaseInvoice Component ---
const PurchaseInvoice: React.FC = () => {
    const [Invoices, setInvoices] = useState<Invoice[]>([]);
const [startDate, setStartDate] = useState<string>(() => {
  const today = new Date().toISOString().split('T')[0];
  return today;
});
const [endDate, setEndDate] = useState<string>(() => {
  const today = new Date().toISOString().split('T')[0];
  return today;
});const [dateFilterApplied, setDateFilterApplied] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
    const [showScrollToTop, setShowScrollToTop] = useState(false);
    const [viewingInvoice, setViewingInvoice] = useState<viewingInvoice | null>(null);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [selectedInvoices, setSelectedInvoices] = useState<number[]>([]);
    const [filterStatus, setFilterStatus] = useState<string>('ALL');
    const [companyData, setCompanyData] = useState<CompanyData | null>(null);
    const [openStatus, setOpenStatus] = useState(false);

    const { toast } = useToast();

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
    const permissions = JSON.parse(
  sessionStorage.getItem('role_permissions') || '{}'
);

    useEffect(() => {
        loadInvoices();
        loadCompanyImage();
    }, []);



    useEffect(() => {
  if (!dateFilterApplied) {
    loadInvoices();
  }
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


const loadInvoices = async () => {
  try {
    let data;
    if (dateFilterApplied && startDate && endDate) {
      // Date filter के साथ load करें
      data = await getPurchaseinvoices(startDate, endDate);
    } else {
      // Date filter के बिना load करें
      data = await getPurchaseinvoices();
    }
    setInvoices(data);
  } catch (error) {
    console.error('Error loading Invoices', error);
    toast({
      title: "Error",
      description: "Failed to load invoices.",
      variant: "destructive",
      duration: 3000,
    });
  }
};



    const handleViewInvoice = (purchase_invoice_id: number) => {
        const selectedinvoice = filteredInvoices.find(invoice => invoice.purchase_invoice_id === purchase_invoice_id);
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

    const handleEditInvoice = (invoice: Invoice) => {
        setEditingInvoice(invoice);
        setShowForm(true);
    };

    const handleSaveInvoice = async (
        po_id: number,
        vendor_id: number,
        branch_id: number,
        flock_id: number,
        remarks: string,
        freight: number,
        vehicle_feed_check: string,
        vehicle_no: string,
        items: InvoiceItem[],
        invoice_date: Date,
        total_amount: number
    ) => {
        try {
            if (editingInvoice) {
                await updatePurchaseInvoice(
                    editingInvoice.purchase_invoice_id,
                    po_id,
                    vendor_id,
                    branch_id,
                    flock_id,
                    remarks,
                    freight,
                    vehicle_feed_check,
                    vehicle_no,
                    invoice_date,
                    total_amount,
                    items
                );
                toast({
                    title: "Updated",
                    description: "Invoice updated successfully!",
                    duration: 3000,
                });
            } else {
                await createPurchaseInvoice(
                    po_id, 
                    vendor_id, 
                    branch_id, 
                    flock_id, 
                    remarks, 
                    freight, 
                    vehicle_feed_check, 
                    vehicle_no, 
                    invoice_date, 
                    total_amount, 
                    items
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
    }

    const handleApproveInvoices = async () => {
        if (selectedInvoices.length === 0) return;

        try {
            await approvePurchaseInvoices(selectedInvoices);
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

    const handleUnapproveInvoices = async () => {
        if (selectedInvoices.length === 0) return;

        try {
            await unapprovePurchaseInvoices(selectedInvoices);
            toast({
                title: "Unapproved",
                description: `${selectedInvoices.length} invoice(s) unapproved successfully.`,
                duration: 3000,
            });

            setSelectedInvoices([]);
            loadInvoices();
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to unapprove selected invoices.",
                variant: "destructive",
                duration: 3000,
            });
            console.error("Error unapproving invoices:", error);
        }
    };

    const handleDeleteInvoice = async (purchase_invoice_id: number) => {
        try {
            await deletePurchaseInvoice(purchase_invoice_id);
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

const handlePrint = (invoice: Invoice) => {
    const printWindow = window.open("", "_blank", "width=900,height=1000");
    const invoiceDate = new Date(invoice.invoice_date);
    const formattedDate = `${invoiceDate.getDate()}-${invoiceDate.toLocaleString("default", {
        month: "short",
    })}-${String(invoiceDate.getFullYear()).slice(-2)}`;

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

    // --- Removed fixed row logic and blankRowsHtml generation ---
    // Removed: maxVisibleRows, currentItemCount, blankRowCount, blankRowsHtml initialization and loop.

    const logoSource = companyData?.image || AhmadPoultryLogo;
    const companyName = companyData?.company_name || "Ahmad Poultry Farm";
    const companyAddress = companyData?.address || "";
    const companyPhone = companyData?.phone || "";
    const companyEmail = companyData?.email || "";
    const companyReg = companyData?.registration_number || "";

    const printContent = `
        <html>
            <head>
                <title>Purchase Invoice #${invoice.purchase_invoice_id}</title>
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
                    /* Removed .main-table .blank-row td style as blank rows are removed */
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
                    <div>Date: ${formattedDate}</div>
                    <div>Invoice No: ${invoice.purchase_invoice_id}</div>
                </div>

                <table class="details-table">
                    <tr>
                        <td><strong>Vendor Name:</strong> ${invoice.vendor_name || "N/A"}</td>
                        <td><strong>Branch:</strong> ${invoice.branch_name || "N/A"}</td>
                    </tr>
                    <tr>
                        <td><strong>Vehicle No:</strong> ${invoice.vehicle_no || "N/A"}</td>
                        <td><strong>PO Number:</strong> ${invoice.po_id || "N/A"}</td>
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
                                <th>Ordered Qty</th>
                                <th>Received Qty</th>
                                <th>Unit Price</th>
                                <th>Discount</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${invoice.items?.map((item, index) => {
                                // Net price is calculated per unit.
                                const netUnitPrice = (item.unit_price || 0) - (item.discount || 0);
                                // Item total is (Received Quantity * Unit Price) - Discount
                                const itemTotal = (item.received_qty || 0) * (item.unit_price || 0);
                                const discount = item.discount || 0;
                                // The item row total should be calculated excluding the 'Freight' which should be a one-time charge (Handled in Grand Total)
                                const rowTotal = (itemTotal - discount);
                                
                                return `
                                    <tr>
                                        <td>${index + 1}</td>
                                        <td class="text-left">${item.item_name || "N/A"}</td>
                                        <td>${item.uom_name || "N/A"}</td>
                                        <td>${item.item_code || "N/A"}</td>
                                        <td>${item.ordered_qty || 0}</td>
                                        <td>${item.received_qty || 0}</td>
                                        <td>${(item.unit_price || 0).toLocaleString()}</td>
                                        <td>${discount.toLocaleString()}</td>
                                        <td>${rowTotal.toLocaleString()}</td>
                                    </tr>
                                    `;
                            }).join('')}
                            
                            <tr>
                                <td colspan="8" style="text-align:right; font-weight:bold;">Total:</td>
                                <td style="font-weight:bold;">${totalAmount.toLocaleString()}</td>
                            </tr>
                                                        <tr>
                                <td colspan="8" style="text-align:right; font-weight:bold;">Freight:</td>
                                <td style="font-weight:bold;">${freight}</td>
                            </tr>

                                                                                    <tr>
                                <td colspan="8" style="text-align:right; font-weight:bold;">Grand Total:</td>
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
            const invoice = Invoices.find(inv => inv.purchase_invoice_id === invoiceId);
            return invoice?.status === 'CLOSED';
        });

    const allSelectedInvoicesCreated = selectedInvoices.length > 0 && 
        selectedInvoices.every(invoiceId => {
            const invoice = Invoices.find(inv => inv.purchase_invoice_id === invoiceId);
            return invoice?.status === 'CREATED';
        });

const filteredInvoices = Invoices.filter(
    (Invoice) => 
        (Invoice.purchase_invoice_id.toString().includes(searchTerm) ||
            Invoice.po_id.toString().includes(searchTerm) ||
            Invoice.vendor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (Invoice.vehicle_no && Invoice.vehicle_no.toLowerCase().includes(searchTerm.toLowerCase()))) &&
        (filterStatus === 'ALL' || Invoice.status === filterStatus)
);

    const totalInvoices = Invoices.length;
    const completedInvoices = Invoices.filter((Invoice) => Invoice.status === 'APPROVED').length;
    const totalValue = Invoices.reduce((sum, Invoice) => sum + Number(Invoice.total_amount || 0), 0);

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
                            <Package className="h-5 w-5" /> Purchase Invoices
                        </CardTitle>
                        <div className="flex justify-end gap-2 mt-2">
                            {selectedInvoices.length > 0 && allSelectedInvoicesCreated &&  permissions.purchasing_approve === 1 &&(
                                <Button
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                    onClick={handleApproveInvoices}
                                >
                                    Approve ({selectedInvoices.length})
                                </Button>
                            )}
                            {selectedInvoices.length > 0 && allSelectedInvoicesApproved &&  permissions.purchasing_unapprove === 1 && (
                                <Button
                                    className="bg-orange-600 hover:bg-orange-700 text-white"
                                    onClick={handleUnapproveInvoices}
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
                                                        .map((inv) => inv.purchase_invoice_id)
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
                                                                <TableHead> Vehicle No</TableHead>

                                <TableHead>PO Number</TableHead>
                                <TableHead>Vendor</TableHead>
                                <TableHead>Branch Name</TableHead>
                                <TableHead>Invoice Date</TableHead>
                                <TableHead>Total Amount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredInvoices.map((Invoice) => (
                                <TableRow key={Invoice.purchase_invoice_id}>
                                    <TableCell className='w-10'>
                                        <input
                                            type="checkbox"
                                            checked={selectedInvoices.includes(Invoice.purchase_invoice_id)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedInvoices((prev) => [...prev, Invoice.purchase_invoice_id]);
                                                } else {
                                                    setSelectedInvoices((prev) =>
                                                        prev.filter((id) => id !== Invoice.purchase_invoice_id)
                                                    );
                                                }
                                            }}
                                            className="form-checkbox h-4 w-4 text-purple-600 transition duration-150 ease-in-out"
                                        />
                                    </TableCell>
                                    <TableCell className="font-medium">{Invoice.purchase_invoice_id}</TableCell>
                                                                        <TableCell>{Invoice.vehicle_no}</TableCell>

                                    <TableCell>{Invoice.po_id}</TableCell>
                                    <TableCell>{Invoice.vendor_name}</TableCell>
                                    <TableCell>{Invoice.branch_name}</TableCell>
                                    <TableCell>
                                        {new Date(Invoice.invoice_date).toLocaleString("en-PK", {
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
                                                onClick={() => handleViewInvoice(Invoice.purchase_invoice_id)}
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
                                                    onClick={() => handleDeleteInvoice(Invoice.purchase_invoice_id)}
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

            {showForm && <InvoiceForm
                invoice={editingInvoice}
                onClose={() => setShowForm(false)}
                onSave={handleSaveInvoice} />}

            <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
                <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Purchase Invoice Details</DialogTitle>
                    </DialogHeader>
                    {viewingInvoice && (
                        <>
                            <table className="w-full border border-gray-300 mb-4 text-sm">
                                <tbody>
                                    <tr><td className="p-2 font-medium text-gray-600 border">Invoice Number</td><td className="p-2 border">{viewingInvoice.purchase_invoice_id}</td></tr>
                                    <tr><td className="p-2 font-medium text-gray-600 border">PO Number</td><td className="p-2 border">{viewingInvoice.po_id}</td></tr>
                                    <tr><td className="p-2 font-medium text-gray-600 border">Invoice Date</td><td className="p-2 border">{viewingInvoice.created_date ? new Date(viewingInvoice.created_date).toLocaleDateString() : ''}</td></tr>
                                    <tr><td className="p-2 font-medium text-gray-600 border">Total Amount</td><td className="p-2 border">{viewingInvoice.total_amount}</td></tr>
                                    <tr><td className="p-2 font-medium text-gray-600 border">Vendor</td><td className="p-2 border">{viewingInvoice.vendor_name}</td></tr>
                                    <tr><td className="p-2 font-medium text-gray-600 border">Branch Name</td><td className="p-2 border">{viewingInvoice.branch_name}</td></tr>
                                    <tr><td className="p-2 font-medium text-gray-600 border">Vehicle No</td><td className="p-2 border">{viewingInvoice.vehicle_no}</td></tr>
                                    <tr><td className="p-2 font-medium text-gray-600 border">Vehicle Feed Check</td><td className="p-2 border">{viewingInvoice.vehicle_feed_check}</td></tr>
                                    <tr><td className="p-2 font-medium text-gray-600 border">Status</td><td className="p-2 border">{viewingInvoice.status}</td></tr>
                                </tbody>
                            </table>

                            <h3 className="text-md font-semibold mb-2">Items</h3>
                            <table className="w-full border border-gray-300 text-sm">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="p-2 border text-left">Item Name</th>
                                        <th className="p-2 border text-left">Item Code</th>
                                        <th className="p-2 border text-left">Ordered Qty</th>
                                        <th className="p-2 border text-left">Received Qty</th>
                                        <th className="p-2 border text-left">Unit Price</th>
                                        <th className="p-2 border text-left">Discount</th>
                                        <th className="p-2 border text-left">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {viewingInvoice.items?.map((item, index) => {
                                        const netPrice = item.unit_price - (item.discount || 0);
                                        const itemTotal = item.received_qty * item.unit_price - (item.discount || 0);
                                        
                                        return (
                                            <tr key={index}>
                                                <td className="p-2 border">{item.item_name ?? '-'}</td>
                                                <td className="p-2 border">{item.item_code ?? '-'}</td>
                                                <td className="p-2 border">{item.ordered_qty}</td>
                                                <td className="p-2 border">{item.received_qty}</td>
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

// --- InvoiceForm Component ---
const InvoiceForm: React.FC<{
    invoice?: Invoice | null;
    onClose: () => void;
    onSave: (
        po_id: number,
        vendor_id: number,
        branch_id: number,
        flock_id: number,
        remarks: string,
        freight: number,
        vehicle_feed_check: string,
        vehicle_no: string,
        items: InvoiceItem[],
        invoice_date: Date,
        total_amount: number
    ) => void;
}> = ({ invoice, onClose, onSave }) => {
    const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
    const [branches, setBranches] = useState<any[]>([]);
    const [flocks, setFlock] = useState<any[]>([]);
    const [vendors, setVendors] = useState<any[]>([]);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);

    const [selectedPO, setSelectedPO] = useState<any>(null);
    const [branch_id, setBranchid] = useState<any>(null);
    const [flock_id, setFlockid] = useState<any>(null);
    const [vendor_id, setVendorid] = useState<any>(null);
    const [poItems, setPoItems] = useState<InvoiceItem[]>([]);
    const [openPO, setOpenPO] = useState(false);
    const [openBranch, setOpenBranch] = useState(false);
    const [openFlock, setOpenFlock] = useState(false);
    const [openVendor, setOpenVendor] = useState(false);
    const [openVehicle, setOpenVehicle] = useState(false);
    
    const [isLoading, setIsLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [remarks, setRemarks] = useState("");
    const [freight, setfreight] = useState("");
    const [vehicle_no, setvehicle_no] = useState<string>("");
    const [vehicle_feed_check, setVehicleFeedCheck] = useState<string>("N");
    const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
    const [manualVehicleNo, setManualVehicleNo] = useState<string>("");
    const [invoice_date, setInvoiceDate] = useState<string>(() => new Date().toISOString().split("T")[0]);
    const [total_amount, setTotalAmount] = useState<number>(0);
    const [birdsVehicles, setBirdsVehicles] = useState<BirdsVehicle[]>([]);
    const [selectedBirdVehicle, setSelectedBirdVehicle] = useState<BirdsVehicle | null>(null);
    const [openbirdsVehicle, setOpenbirdsVehicle] = useState(false);
    const [othersVehicleCheck, setOthersVehicleCheck] = useState<boolean>(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [poData, branchData, vendorData, flockData, vehicleData, birdsVehicleData] = await Promise.all([
                    getPurchaseOrdersinvoice(),
                    getBranches(),
                    getVendors(),
                    getFlock(),
                    getVehicles(),
                    getbirdsVehicles()
                ]);

                console.log("Vehicle Data:", vehicleData);

                const approvedBranches = branchData.filter((branch: any) => branch.status === 'APPROVED');
                
                const approvedVehicles = vehicleData.filter((vehicle: Vehicle) => 
                    vehicle.status === 'APPROVED' || !vehicle.status
                );

                setPurchaseOrders(poData || []);
                setBranches(approvedBranches || []);
                setVendors(vendorData || []);
                setFlock(flockData || []);
                setVehicles(approvedVehicles || []);
                setBirdsVehicles(birdsVehicleData || []);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        fetchData();
    }, []);

    const fetchPODetails = async (po_id: number) => {
        try {
            const response = await getPODetails(po_id);
            const poArray = response?.data;
            const data = Array.isArray(poArray) ? poArray[0] : null;

            console.log("Fetched PO Details:", data);

            if (!data || !Array.isArray(data.items)) {
                console.warn("Expected array but got:", data?.items);
                setPoItems([]);
                return;
            }

            const formattedItems: InvoiceItem[] = data.items.map((item: any) => ({
                item_id: Number(item.item_id),
                item_name: String(item.item_name ?? ""),
                item_code: String(item.item_code ?? ""),
                ordered_qty: Number(item.ordered_qty),
                received_qty: Number(item.ordered_qty), // Default to ordered quantity
                unit_price: Number(item.unit_price),
                discount: Number(item.discount) || 0,
                discount_percentage: Number(item.discount_percentage) || 0,
            }));

            setPoItems(formattedItems);
        } catch (error) {
            console.error("Error fetching PO details:", error);
            setPoItems([]);
        }
    };

    const handleSelectPO = (po: any) => {
        setSelectedPO(po);
        setVendorid(po.vendor_id);
        setBranchid(po.branch_id);
        setFlockid(po.flock_id);
        setOpenPO(false);
        fetchPODetails(po.po_id);
    };

    const handleSelectVendor = (vendor: any) => {
        setVendorid(Number(vendor.vendor_id));
        setOpenVendor(false);
    }

    const handleSelectBranch = (branch: any) => {
        setBranchid(Number(branch.branch_id));
        setOpenBranch(false);
    }

    const handleSelectFlock = (flock: any) => {
        setFlockid(Number(flock.flock_id));
        setOpenFlock(false);
    }

    const handleSelectVehicle = (vehicle: Vehicle) => {
        setSelectedVehicle(vehicle);
        setvehicle_no(vehicle.vehicle_name);
        setOpenVehicle(false);
    }

    const calculateTotalAmount = () => {
        return poItems.reduce((total, item) => {
            const itemTotal = item.received_qty * item.unit_price - (item.discount || 0);
            return total + itemTotal;
        }, 0);
    };

const handleItemChange = (
    index: number,
    field: "received_qty" | "unit_price",  // Add "unit_price" here
    value: number
) => {
    const updated = [...poItems];
    updated[index][field] = value;  // Remove the if condition
    setPoItems(updated);
};

    // Fix: Add this useEffect to handle PO selection when data loads
    useEffect(() => {
        if (invoice && purchaseOrders.length > 0) {
            const matchedPO = purchaseOrders.find(
                (p) => p.po_id === invoice.po_id
            );
            if (matchedPO) {
                setSelectedPO(matchedPO);
                console.log("PO found and set:", matchedPO);
            } else {
                console.warn("PO not found in purchaseOrders list");
            }
        }
    }, [invoice, purchaseOrders]);

    useEffect(() => {
        if (invoice) {
            setIsEditing(true);
            setRemarks(invoice.remarks || "");
            setfreight(invoice.freight?.toString() || '0');
            // Safe handling for vehicle_no
            setvehicle_no(invoice.vehicle_no ? invoice.vehicle_no.toString() : "");
            setVehicleFeedCheck(invoice.vehicle_feed_check || "N");
            
            setBranchid(invoice.branch_id || null);
            setFlockid(invoice.flock_id || null);
            setVendorid(invoice.vendor_id || null);
            setInvoiceDate(
                invoice.invoice_date
                    ? new Date(invoice.invoice_date).toLocaleDateString("en-CA")
                    : ""
            );
            setTotalAmount(invoice.total_amount || 0);
            
            // Don't set selectedPO here if purchaseOrders hasn't loaded yet
            // It will be set in the separate useEffect above

            if (invoice.items && invoice.items.length > 0) {
                setPoItems(
                    invoice.items.map((item: any) => ({
                        item_id: item.item_id,
                        item_name: item.item_name,
                        item_code: item.item_code,
                        ordered_qty: item.ordered_qty,
                        received_qty: item.received_qty,
                        unit_price: item.unit_price,
                        discount: item.discount || 0,
                        discount_percentage: item.discount_percentage || 0,
                    }))
                );
            }

            // Vehicle initialization logic
            const vehicleNum = invoice.vehicle_no ? invoice.vehicle_no.toString() : "";
            
            if (invoice.vehicle_feed_check === "Y") {
                // Vehicle Feed Check was selected
                setOthersVehicleCheck(false);
                
                // Try to find vehicle by ID or name
                const vehicle = vehicles.find(v => 
                    v.vehicle_id === Number(invoice.vehicle_no) || 
                    v.vehicle_name === vehicleNum
                );
                
                if (vehicle) {
                    setSelectedVehicle(vehicle);
                } else {
                    // If vehicle not found in list, use as manual input
                    setOthersVehicleCheck(true);
                    setManualVehicleNo(vehicleNum);
                    setVehicleFeedCheck("N");
                }
            } else {
                // Check if it's a birds vehicle
                const birdVehicle = birdsVehicles.find(bv => bv.vehicle_name === vehicleNum);
                
                if (birdVehicle) {
                    // It's a birds vehicle
                    setOthersVehicleCheck(false);
                    setSelectedBirdVehicle(birdVehicle);
                } else {
                    // It's a manual/others vehicle
                    setOthersVehicleCheck(true);
                    setManualVehicleNo(vehicleNum);
                }
            }
        } else {
            // Reset form for new invoice
            setIsEditing(false);
            setSelectedPO(null);
            setVendorid(null);
            setBranchid(null);
            setFlockid(null);
            setRemarks("");
            setfreight("");
            setvehicle_no(""); // Changed from invoice.vehicle_no.toString()
            setVehicleFeedCheck("N");
            setOthersVehicleCheck(false);
            setSelectedVehicle(null);
            setSelectedBirdVehicle(null);
            setManualVehicleNo("");
            setPoItems([]);
            setInvoiceDate(new Date().toISOString().split("T")[0]);
            setTotalAmount(0);
        }
    }, [invoice, vehicles, birdsVehicles]);

    // Fetch PO details when selectedPO changes
    useEffect(() => {
        if (selectedPO && selectedPO.po_id) {
            fetchPODetails(selectedPO.po_id);
        }
    }, [selectedPO]);

    useEffect(() => {
        const total = poItems.reduce(
            (sum, row) => sum + ((row.unit_price * row.received_qty - (row.discount || 0))),
            0
        );
        setTotalAmount(total);
    }, [poItems]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validation
        if (!selectedPO) {
            alert("Please select a Purchase Order");
            return;
        }
        
        if (!vendor_id) {
            alert("Please select a Vendor");
            return;
        }
        
        if (!branch_id) {
            alert("Please select a Branch");
            return;
        }
        
        if (poItems.length === 0) {
            alert("Please add items to the invoice");
            return;
        }
        
        setIsLoading(true);

        try {
            // Vehicle number determination based on selected option
            let finalVehicleNo = "";
            
            if (vehicle_feed_check === "Y" && selectedVehicle) {
                // Vehicle Feed Check selected
                finalVehicleNo = selectedVehicle.vehicle_name;
            } else if (othersVehicleCheck) {
                // Others checkbox selected - use manual input
                finalVehicleNo = manualVehicleNo;
            } else if (selectedBirdVehicle) {
                // Birds Vehicle selected (default)
                finalVehicleNo = selectedBirdVehicle.vehicle_name;
            } else {
                // Fallback
                finalVehicleNo = manualVehicleNo || "";
            }

            // Call parent's onSave function - WAIT for it to complete
            await onSave(
                selectedPO.po_id,
                vendor_id,
                branch_id,
                flock_id,
                remarks,
                Number(freight),
                vehicle_feed_check,
                finalVehicleNo,
                poItems.map(item => ({
                    ...item,
                    received_qty: Number(item.received_qty),
                })),
                new Date(invoice_date),
                total_amount
            );
            
            console.log("Vehicle No being sent:", finalVehicleNo);
            
            // Form will close automatically when parent's onSave completes
            // No need to call onClose here
            
        } catch (error) {
            console.error("Submission error caught in form:", error);
            // Keep the form open so user can fix errors
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-[1000px] max-h-[90vh] overflow-auto">
                <h2 className="text-lg font-semibold mb-2">
                    {isEditing ? "Edit Invoice" : "Add Invoice"}
                </h2>

                <form onSubmit={handleSubmit}>
                    {/* Top row with 4 fields */}
                    <div className="flex space-x-4 mb-4">
                        <div className="flex flex-col flex-1">
                            <label className="block text-sm font-medium mb-0">Purchase Order</label>
                            <Popover open={openPO} onOpenChange={setOpenPO}>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" role="combobox" className="w-full justify-between">
                                        {selectedPO
                                            ? `PO-${selectedPO.po_id} (${selectedPO.vendor_name || "Vendor"})`
                                            : "Select Purchase Order"}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[400px] max-h-[300px] overflow-y-auto p-0 z-[100]">
                                    <Command>
                                        <CommandInput placeholder="Search purchase orders..." />
                                        <CommandEmpty>No purchase order found.</CommandEmpty>
                                        <CommandGroup>
                                            {purchaseOrders
                                                .filter(po => po.status === "APPROVED")
                                                .map((po) => (
                                                    <CommandItem
                                                        key={po.po_id}
                                                        onSelect={() => handleSelectPO(po)}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                selectedPO?.po_id === po.po_id ? "opacity-100" : "opacity-0"
                                                            )}
                                                        />
                                                        PO-{po.po_id} ({po.vendor_name})
                                                    </CommandItem>
                                                ))}
                                        </CommandGroup>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="flex flex-col flex-1">
                            <label className="block text-sm font-medium mb-1">Branch</label>
                            <Popover open={openBranch} onOpenChange={setOpenBranch}>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" role="combobox" className="w-full justify-between" disabled={!!selectedPO}>
                                        {branch_id
                                            ? branches.find((b) => Number(b.branch_id) === branch_id)?.branch_name ?? "Select Branch"
                                            : "Select Branch"}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="max-h-[300px] overflow-auto p-0">
                                    <Command>
                                        <CommandInput placeholder="Search vendors..." />
                                        <CommandEmpty>No branch</CommandEmpty>
                                        <CommandGroup>
                                            {branches.map((b) => (
                                                <CommandItem
                                                    key={b.branch_id}
                                                    onSelect={() => handleSelectBranch(b)}
                                                >
                                                    <Check className={cn("mr-2 h-4 w-4", branch_id === Number(b.branch_id) ? "opacity-100" : "opacity-0")} />
                                                    {b.branch_name}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                            {selectedPO && <p className="text-xs text-gray-500 mt-1">Branch selected automatically from PO.</p>}
                        </div>

                        <div className="flex flex-col flex-1">
                            <label className="block text-sm font-medium mb-1">Invoice Date</label>
                            <Input
                                type="date"
                                value={invoice_date}
                                onChange={(e) => setInvoiceDate(e.target.value)}
                            />
                        </div>

                        <div className="flex flex-col flex-1">
                            <label className="block text-sm font-medium mb-1">Vendor</label>
                            <Popover open={openVendor} onOpenChange={setOpenVendor}>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" role="combobox" className="w-full justify-between" disabled={!!selectedPO}>
                                        {vendor_id
                                            ? vendors.find((v) => Number(v.vendor_id) === vendor_id)?.vendor_name ?? "Select Vendor"
                                            : "Select Vendor"}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="max-h-[300px] overflow-auto p-0">
                                    <Command>
                                        <CommandInput placeholder="Search vendors..." />
                                        <CommandEmpty>No vendors</CommandEmpty>
                                        <CommandGroup>
                                            {vendors.map((v) => (
                                                <CommandItem
                                                    key={v.vendor_id}
                                                    onSelect={() => handleSelectVendor(v)}
                                                >
                                                    <Check className={cn("mr-2 h-4 w-4", vendor_id === Number(v.vendor_id) ? "opacity-100" : "opacity-0")} />
                                                    {v.vendor_name}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                            {selectedPO && <p className="text-xs text-gray-500 mt-1">Vendor selected automatically from PO.</p>}
                        </div>
                    </div>

                    {/* Second row with Remarks, Vehicle No, and Freight in one line */}
                    <div className="flex space-x-4 mb-4">
                        <div className="flex flex-col flex-1">
                            <label className="block text-sm font-medium mb-1">Remarks</label>
                            <Input
                                type="text"
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                            />
                        </div>

                        <div className="flex flex-col flex-1">
                            <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center space-x-4">
                                    {/* Vehicle Feed Check */}
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="vehicle_feed_check"
                                            checked={vehicle_feed_check === "Y"}
                                            onCheckedChange={(checked) => {
                                                setVehicleFeedCheck(checked ? "Y" : "N");
                                                if (checked) {
                                                    setOthersVehicleCheck(false);
                                                }
                                            }}
                                        />
                                        <label htmlFor="vehicle_feed_check" className="text-sm font-medium">
                                            Vehicle Feed Check
                                        </label>
                                    </div>
                                    
                                    {/* Others Checkbox */}
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="others_vehicle"
                                            checked={othersVehicleCheck}
                                            onCheckedChange={(checked) => {
                                                setOthersVehicleCheck(!!checked);
                                                if (checked) {
                                                    setVehicleFeedCheck("N");
                                                    setSelectedVehicle(null);
                                                    setSelectedBirdVehicle(null);
                                                }
                                            }}
                                        />
                                        <label htmlFor="others_vehicle" className="text-sm font-medium">
                                            Others
                                        </label>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Vehicle Selection/Input Fields */}
                            {vehicle_feed_check === "Y" ? (
                                <Popover open={openVehicle} onOpenChange={setOpenVehicle}>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" role="combobox" className="w-full justify-between">
                                            {selectedVehicle
                                                ? `${selectedVehicle.vehicle_name} ${selectedVehicle.vehicle_no ? `(${selectedVehicle.vehicle_no})` : ''}`
                                                : "Select Vehicle"}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="max-h-[300px] overflow-auto p-0">
                                        <Command>
                                            <CommandInput placeholder="Search vehicles..." />
                                            <CommandEmpty>No vehicle found.</CommandEmpty>
                                            <CommandGroup>
                                                {vehicles.map((vehicle) => (
                                                    <CommandItem
                                                        key={vehicle.vehicle_id}
                                                        onSelect={() => handleSelectVehicle(vehicle)}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                selectedVehicle?.vehicle_id === vehicle.vehicle_id ? "opacity-100" : "opacity-0"
                                                            )}
                                                        />
                                                        {vehicle.vehicle_name} {vehicle.vehicle_no ? `(${vehicle.vehicle_no})` : ''}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            ) : othersVehicleCheck ? (
                                // Simple manual input for Others
                                <Input
                                    type="text"
                                    placeholder="Enter Vehicle Number"
                                    value={manualVehicleNo}
                                    onChange={(e) => setManualVehicleNo(e.target.value)}
                                    className="w-full"
                                />
                            ) : (
                                // Birds Vehicle selection (default when neither checkbox is checked)
                                <Popover open={openbirdsVehicle} onOpenChange={setOpenbirdsVehicle}>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className="w-full justify-between">
                                            {selectedBirdVehicle 
                                                ? `${selectedBirdVehicle.vehicle_name}${selectedBirdVehicle.vehicle_no ? ` (${selectedBirdVehicle.vehicle_no})` : ""}` 
                                                : "Select Birds Vehicle"}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="max-h-[300px] overflow-auto">
                                        <Command>
                                            <CommandInput placeholder="Search vehicles..." />
                                            <CommandEmpty>No vehicle found.</CommandEmpty>
                                            <CommandGroup>
                                                {birdsVehicles.map((bv) => (
                                                    <CommandItem
                                                        key={bv.vehicle_id}
                                                        onSelect={() => {
                                                            setSelectedBirdVehicle(bv);
                                                            setOpenbirdsVehicle(false);
                                                        }}
                                                    >
                                                        <Check className={`mr-2 h-4 w-4 ${selectedBirdVehicle?.vehicle_id === bv.vehicle_id ? "opacity-100" : "opacity-0"}`} />
                                                        {bv.vehicle_name}{bv.vehicle_no ? ` (${bv.vehicle_no})` : ""}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            )}
                        </div>

                        <div className="flex flex-col flex-1">
                            <label className="block text-sm font-medium mb-1">Freight</label>
                            <Input
                                type="number"
                                value={freight}
                                onChange={(e) => setfreight(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Items</label>
                        <div className="overflow-auto">
                            <table className="w-full border-collapse">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="border px-2 py-1 text-center w-[150px]">Item Name</th>
                                        <th className="border px-2 py-1 text-center w-[100px]">Item Code</th>
                                        <th className="border px-2 py-1 text-center w-[100px]">Ordered Qty</th>
                                        <th className="border px-2 py-1 text-center w-[100px]">Received Qty</th>
                                        <th className="border px-2 py-1 text-center w-[100px]">Unit Price</th>
                                        <th className="border px-2 py-1 text-center w-[100px]">Discount</th>
                                        <th className="border px-2 py-1 text-center w-[100px]">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {poItems.map((item, index) => {
                                        const itemTotal = item.received_qty * item.unit_price - (item.discount || 0);
                                        
                                        return (
                                            <tr key={item.item_id}>
                                                <td className="border px-2 py-1 text-center">{item.item_name}</td>
                                                <td className="border px-2 py-1 text-center">{item.item_code}</td>
                                                <td className="border px-2 py-1 text-center">{Number(item.ordered_qty)}</td>
                                                <td className="border px-2 py-1 text-center">
                                                    <Input
                                                        type="number"
                                                        value={item.received_qty}
                                                        onChange={(e) =>
                                                            handleItemChange(index, "received_qty", Number(e.target.value))
                                                        }
                                                        className="w-full text-center"
                                                    />
                                                </td>
                <td className="border px-2 py-1 text-center">
                    <Input
                        type="number"
                        value={item.unit_price}
                        onChange={(e) =>
                            handleItemChange(index, "unit_price", Number(e.target.value))
                        }
                        className="w-full text-center"
                    />
                </td>                                                <td className="border px-2 py-1 text-center">{item.discount}</td>
<td className="border px-2 py-1 text-center">{itemTotal.toFixed(2)}</td>                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="flex justify-center mt-4">
                        <span className="font-semibold text-lg text-gray-800">
                            Total Amount: {calculateTotalAmount().toLocaleString()}
                        </span>
                    </div>

                    <div className="flex gap-2 justify-end mt-3">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
<Button
    type="submit"
    className="bg-gradient-to-r from-blue-500 to-blue-600"
    disabled={isLoading || !selectedPO || !branch_id || !vendor_id || poItems.length === 0}
>
    {isLoading ? (
        <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {isEditing ? "Updating..." : "Saving..."}
        </>
    ) : (
        isEditing ? "Update Invoice" : "Save Invoice"
    )}
</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PurchaseInvoice;