import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { format } from "date-fns";

import { Label } from '@/components/ui/label';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Eye, Check, X, Edit, Trash2, Search, Package, ChevronsUpDown, Truck, CalendarIcon, Printer, RotateCcw, Undo, Loader2, MessageSquare, Users, MapPin, Building } from 'lucide-react';
import { getCustomers } from '@/api/customerApi';
import { getCompanies } from '@/api/getCompaniesApi';
import { getBranches } from '@/api/branchApi';
import { Popover, PopoverContent, PopoverTrigger, } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { getSOs } from '@/api/salesOrdersApi';
import { toast } from '../ui/use-toast';
import { createDC, getDeliveryChallans } from '@/api/deliveryChallansApi';
import { getWarehouses } from '@/api/getWarehousesApi';
import { set } from 'date-fns';
import { getSaleInvoices, createSalesInvoice, deleteSalesInvoice, approveSaleInvoices, unapproveSaleInvoices, updateSalesInvoice, getItemsfordiscount  ,getCompanyimg } from '@/api/salesInvoiceApi';

// New import for Checkbox
import { Checkbox } from '@/components/ui/checkbox';
import { getFlock } from '@/api/flockApi';
//import AhmadPoultryLogo from '@/assets/AhmadPoultryLogo.png';
import { useNavigate } from 'react-router-dom';

import { getbirdsVehicles } from '@/api/birdsVehiclesApi';
import { getItems } from '@/api/itemsApi';
import { date } from 'zod';


interface SalesInvoice {
    sales_invoice_id: number;
    sales_invoice_no: number;
    dc_id: number;
    customer_id: number;
    customer_name: string;
    company_id: number;
    company_name?: string;
    branch_id: number;
    branch_name: string;
    flock_id: number;
    flock_name: string;
    invoice_date: Date;
    sales_person_id: number;
    sales_person_name: string;
    receivable_account_id: number;
    receivable_account_code: string;
    payment_term: string;
    credit_limit: number;
    total_amount: number;
    
    commission_amount: number;
    status: string;
    vehicle_no: string;
    remarks: string;
    created_by: number;
    updated_by: number;
    updated_date: Date;
    items: Array<{
        extra_discount: number;
        item_id: number; item_name: string;
        uom?: string;
        quantity: number; unit_price?: number; rate?: number; amount?: number; 
        discount_percentage: number; discount_amount?: number; tax: number; tax_amount?: number; row_total?: number;
        commission_percentge: number;
    commission_amount: number;
    }>;
}
interface Branch {
  branch_id: number;
  branch_name: string;
  status: string;
}


// Add interface for company data
interface CompanyData {
  company_id: number;
  company_name: string;
  registration_number: string;
  address: string;
  phone: string;
  email: string;
  image: string; // base64 image string
  module_id: number;
}

interface viewingSO {
    sales_invoice_id: number;
    sales_invoice_no: number;
    dc_id: number;
    customer_id: number;
    customer_name: string;
    branch_id: number;
    company_id:number;
    company_name:string;
    branch_name: string;
    flock_id: number;
    flock_name: string;
    invoice_date: Date;
    sales_person_id: number;
    sales_person_name: string;
    receivable_account_id: number;
    receivable_account_code: string;
    payment_term: string;
    credit_limit: number;
    total_amount: number;
    
    commission_amount: number;
    status: string;
    vehicle_no: string;
    remarks: string;
    created_by: number;
    updated_by: number;
    updated_date: Date;
    items: Array<{
        item_id: number; item_name: string;
        uom?: string;
        extra_discount: number;
        quantity: number; unit_price?: number; 
        commission_percentge: number;
    commission_amount: number;
    rate?: number; amount?: number; discount_percentage: number; discount_amount?: number; tax: number; tax_amount?: number; row_total?: number;
    }>;
}

const SalesInvoice: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingInvoice, setEditingInvoice] = useState<SalesInvoice | null>(null);
    const [salesInvoices, setSalesInvoices] = useState<SalesInvoice[]>([]);
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
const [startDate, setStartDate] = useState<string>(() => {
  const today = new Date().toISOString().split('T')[0];
  return today;
});

const [endDate, setEndDate] = useState<string>(() => {
  const today = new Date().toISOString().split('T')[0];
  return today;
});


const [dateFilterApplied, setDateFilterApplied] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [selectedInvoices, setSelectedInvoices] = useState<number[]>([]);
    const [companyData, setCompanyData] = useState<CompanyData | null>(null); // Add this line

    const [viewingSO, setViewingSO] = useState<viewingSO | null>(null);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const navigate = useNavigate();
const permissions = JSON.parse(
  sessionStorage.getItem('role_permissions') || '{}'
);

        const loadCompanyImage = async () => {
        try {
            const data = await getCompanyimg();
            if (data && data.length > 0) {
                setCompanyData(data[0]); // Assuming first item is the company data
            }
        } catch (error) {
            console.error("Error loading company image", error);
            // Keep AhmadPoultryLogo as fallback
        }
    };

    useEffect(() => {
        loadSalesInvoices(startDate, endDate);
                loadCompanyImage(); // Add this line

    }, []);

const loadSalesInvoices = async (from?: string, to?: string) => {
  setIsLoading(true);
  try {
    const data =
      from && to
        ? await getSaleInvoices(from, to)
        : await getSaleInvoices();

    setSalesInvoices(data);
  } catch (error) {
    console.error("Error loading sales invoices", error);
    toast({
      title: "Error",
      description: "Failed to load sales invoices.",
      variant: "destructive",
    });
  } finally {
    setIsLoading(false);
  }
};

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
  const totalSIs = salesInvoices.length;
  const createdSIs = salesInvoices.filter(invoice => invoice.status === 'CREATED').length;
  const totalValue = salesInvoices.reduce((sum, invoice) => sum + Number(invoice.total_amount || 0), 0);
      
    const handleApproveInvoices = async () => {
        if (selectedInvoices.length === 0) return;

        try {
            await approveSaleInvoices(selectedInvoices);
            toast({
                title: "Approved",
                description: `${selectedInvoices.length} invoice(s) approved successfully.`,
                duration: 3000,
            });

            setSelectedInvoices([]);
            loadSalesInvoices();
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



const handleApplyDateFilter = () => {
  if (!startDate || !endDate) {
    toast({
      title: "Warning",
      description: "Please select both start and end dates",
      variant: "destructive",
      duration: 3000,
    });
    return;
  }

  loadSalesInvoices(startDate, endDate); 
};
const handleClearDateFilter = () => {
    setStartDate('');
    setEndDate('');
    setDateFilterApplied(false);
    // Don't load invoices when clearing filter - user needs to apply dates again
    setSalesInvoices([]);
};

  

    const handleUnapproveInvoices = async () => {
        if (selectedInvoices.length === 0) return;

        try {
            await unapproveSaleInvoices(selectedInvoices);
            toast({
                title: "Unapproved",
                description: `${selectedInvoices.length} invoice(s) unapproved successfully.`,
                duration: 3000,
            });

            setSelectedInvoices([]);
            loadSalesInvoices();
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

    const handleViewSI = (sales_invoice_id: number) => {
        const selectedSI = salesInvoices.find(si => si.sales_invoice_id === sales_invoice_id);
        if (selectedSI) {
            setViewingSO(selectedSI);
            setViewDialogOpen(true);
        }
    };

    const handleEditSI = (sales_invoice_id: number) => {
        const selectedSI = salesInvoices.find(si => si.sales_invoice_id === sales_invoice_id);
        if (selectedSI) {
            setEditingInvoice(selectedSI);
            setShowForm(true);
        }
    };

    const handleDeleteSI = async (sales_invoice_id: number) => {
        if (!window.confirm('Are you sure you want to delete this invoice?')) return;
        try {
            const res = await deleteSalesInvoice(sales_invoice_id);
            if (res && (res.success === false)) {
                throw new Error(res.message || 'Delete failed');
            }
            toast({ title: "Deleted", description: res?.message || "Invoice deleted successfully!" });
            loadSalesInvoices();
        } catch (error: any) {
            console.error('Failed to delete invoice', error);
            toast({ title: "Error", description: `Failed to delete invoice. ${error?.message ?? error}`, variant: "destructive" });
        }
    };


const handleSaveSI = async (
  data: Omit<SalesInvoice, "sales_invoice_id">
) => {
  try {
    //  Normalize items for API
    const items = (data.items || []).map(it => ({
      item_id: it.item_id,
      quantity: it.quantity,
      unit_price: it.rate ?? it.unit_price ?? 0,
      discount_percentage: it.discount_percentage ?? 0,
      discount_amount: it.discount_amount ?? 0,
      tax: it.tax ?? 0,
       extra_discount: (it as any).extra_discount ?? 0,
       commission_percentge:it.commission_percentge ?? 0,
       commission_amount:it.commission_amount ?? 0
       
    }));

    if (editingInvoice) {
      //  UPDATE SALES INVOICE
      await updateSalesInvoice(
        editingInvoice.sales_invoice_id,
        data.customer_id,
        data.invoice_date,
        data.remarks,
        data.total_amount,
        data.commission_amount,
        data.company_id,
        data.branch_id,
        items
      );

      toast({
        title: "Updated",
        description: "Sales invoice updated successfully!",
      });
    } else {
      //  CREATE SALES INVOICE
      await createSalesInvoice(
        data.customer_id,
        data.invoice_date,
        data.remarks,
        data.total_amount,
        data.commission_amount,
        data.company_id,
        data.branch_id,
        items
      );

      toast({
        title: "Created",
        description: "Sales invoice created successfully!",
      });
    }

    setShowForm(false);
    loadSalesInvoices(); // reload list
  } catch (error) {
    console.error("Error saving Sales Invoice", error);
    toast({
      title: "Error",
      description: "Failed to save Sales Invoice",
      variant: "destructive",
    });
  }
};

const handlePrint = (invoice: SalesInvoice) => {
    const printWindow = window.open("", "_blank", "width=800,height=1000");
    const invoiceDate = new Date(invoice.invoice_date);
    const formattedDate = `${invoiceDate.getDate()}-${invoiceDate.toLocaleString("default", {
        month: "short",
    })}-${String(invoiceDate.getFullYear()).slice(-2)}`;

    const totalAmount = Number(invoice.total_amount || 0);
    const grandTotal = totalAmount;

    const numberToWords = (num: number) => {
        const a = [
            '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven',
            'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen',
            'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
        ];

        const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

        const convert = (n: number): string => {
            if (n < 20) return a[n];
            if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? ' ' + a[n % 10] : '');
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

    // Dynamic logo source (Assuming these variables are available in the scope where handlePrint is defined)
    const logoSource = companyData?.image;
    const companyName = companyData?.company_name ;
    const companyAddress = companyData?.address || "";
    const companyPhone = companyData?.phone || "";
    const companyEmail = companyData?.email || "";
    const companyReg = companyData?.registration_number || "";

    const printContent = `
        <html>
            <head>
                <title>Sales Invoice #${invoice.sales_invoice_no}</title>
                <style>
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
                        width: 100px;
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
                        margin-top: 5px;
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
                    .signature-section {
                        margin-top: 40px;
                        display: flex;
                        justify-content: space-between;
                    }
                    .signature-box {
                        width: 45%;
                        text-align: center;
                        padding-top: 40px;
                        position: relative;
                    }
                    .signature-line {
                        border-top: 1px solid #000;
                        width: 80%;
                        margin: 0 auto;
                        padding-top: 5px;
                    }
                    .signature-label {
                        font-weight: bold;
                        font-size: 13px;
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
                        <h4>SALES INVOICE</h4>
                    </div>
                </div>

                <div class="top-bar">
                    <div>Date: ${formattedDate}</div>
                    <div>Invoice No: ${invoice.sales_invoice_no}</div>
                </div>

                <table class="details-table">
                    <tr>
                        <td><strong>Customer Name:</strong> ${invoice.customer_name || "N/A"}</td>
                        <td><strong>Branch:</strong> ${invoice.branch_name || "N/A"}</td>
                    </tr>
                   
                    
                    <tr>
                        <td colspan="2"><strong>Narration:</strong> ${invoice.remarks}</td>
                    </tr>
                </table>

                <div class="items-table">
                    <table class="main-table">
                        <thead>
                            <tr>
                                <th>Sr#</th>
                                <th>Item Name</th>
                               
                                <th>Quantity</th>
                                <th>Price</th>
                                
                                <th>Tax</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${invoice.items?.map((item, index) => {
                                const quantity = Number(item.quantity || 0);
                                const unitPrice = Number(item.rate || item.unit_price || 0);
                                const discountPercentage = Number(item.discount_percentage || 0);
                                const discountAmount = Number(item.discount_amount || (quantity * unitPrice * discountPercentage / 100));
                                const tax = Number(item.tax || 0);
                                const rowTotal = Number(item.row_total || (quantity * unitPrice - discountAmount + tax));
                                
                                return `
                                    <tr>
                                        <td>${index + 1}</td>
                                        <td class="text-left">${item.item_name}</td>
                                       
                                        <td>${quantity}</td>
                                        <td>${unitPrice.toLocaleString()}</td>
                                        
                                        <td>${tax.toLocaleString()}</td>
                                        <td>${rowTotal.toLocaleString()}</td>
                                    </tr>
                                `;
                            }).join('')}
                            <tr>
                                <td colspan="5" style="text-align:right; font-weight:bold;">Grand Total:</td>
                                <td style="font-weight:bold;">${grandTotal.toLocaleString()}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="footer">
                    Amount in Words: <span style="font-weight:900;">${numberToWords(Math.round(grandTotal))}</span>
                </div>

                <div class="signature-section">
                    <div class="signature-box">
                        <div class="signature-label">Created by: ${invoice.created_by }</div>
                    </div>
                    <div class="signature-box">
                        <div class="signature-label">Approved by: ${invoice.updated_by || ""}</div>
                    </div>
                </div>

                <div class="footer-note">
                    <p>This is a system generated sales invoice and does not require signature or stamp.</p>
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

    const filteredSI = salesInvoices.filter((si) => {
        const term = (searchTerm || "").toLowerCase();
        const statusMatch = statusFilter === 'ALL' || si.status === statusFilter;
        
        return (
            statusMatch && (
            (si.branch_name || "").toLowerCase().includes(term) ||
            si.sales_invoice_no?.toString().includes(term) ||
            (si.customer_name || "").toLowerCase().includes(term)
            )
        );
    });

    
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'CREATED': return 'bg-gray-100 text-gray-800';
            case 'SENT': return 'bg-blue-100 text-blue-800';
            case 'RECEIVED': return 'bg-green-100 text-green-800';
            case 'CANCELLED': return 'bg-red-100 text-red-800';
            case 'APPROVED': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const handleCheckboxChange = (sales_invoice_id: number, checked: boolean) => {
        const invoice = salesInvoices.find(si => si.sales_invoice_id === sales_invoice_id);

        if (invoice?.status === 'CANCELLED') {
            return;
        }

        if (checked) {
            setSelectedInvoices((prev) => [...prev, sales_invoice_id]);
        } else {
            setSelectedInvoices((prev) => prev.filter(id => id !== sales_invoice_id));
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
                                    <div className="text-2xl font-bold">{totalSIs}</div>
                                </CardContent>
                            </Card>
                            <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-gray-600">Created Invoices</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-green-600">{createdSIs}</div>
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
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Package className="h-5 w-5" />
                            Sales Invoices
                        </CardTitle>

                        <div className="flex gap-4 items-center">
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All Status</SelectItem>
                                    <SelectItem value="CREATED">Created</SelectItem>
                                    <SelectItem value="APPROVED">Approved</SelectItem>
                                    <SelectItem value="CLOSED">Closed</SelectItem>
                                    <SelectItem value="RETURNED">Returned</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex gap-2">
                            {selectedInvoices.some(sales_invoice_id => {
                                const invoice = salesInvoices.find(invoices => invoices.sales_invoice_id === sales_invoice_id);
                                return invoice?.status === 'APPROVED' || invoice?.status === 'CLOSED';
                            }
                            ) && permissions.sales_unapprove === 1 && (
                                <Button
                                    className="bg-gradient-to-r from-orange-500 to-orange-700"
                                    onClick={handleUnapproveInvoices}
                                >
                                    UnApprove ({selectedInvoices.length})
                                </Button>
                            )
                            }
                            {selectedInvoices.some(id =>
                                salesInvoices.find(
                                    invoice => invoice.sales_invoice_id === id
                                )?.status === 'CREATED'
                                ) &&
                                permissions.sales_approve === 1 && (
                                <Button
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                    onClick={handleApproveInvoices}
                                >
                                    Approve ({selectedInvoices.length})
                                </Button>
                                )}

                            {/* <Button
                                className="bg-green-600 hover:bg-green-700 text-white"
                                onClick={handleReturnSaleInvoices}
                            >
                                Returned ({selectedInvoices.length})
                            </Button> */}
                            <Button
                                onClick={() => {
                                    setEditingInvoice(null);
                                    setShowForm(true);
                                }}
                                className="bg-purple-600 hover:bg-purple-700 text-white">
                                <Plus className="h-4 w-4 mr-2" />
                                Create Invoice
                            </Button>
                        </div>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search Invoices..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>



                    <div className="flex gap-4 mt-4">
        <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Start Date:</span>
            <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-40"
                max={endDate}
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
            disabled={!startDate || !endDate || isLoading}
            className="bg-blue-500 hover:bg-blue-600"
        >
            {isLoading ? "Loading..." : "Apply Date Filter"}
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
                                            selectedInvoices.length === filteredSI.filter(si => si.status === 'CREATED').length
                                        }
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedInvoices(filteredSI.filter(si => si.status === 'CREATED').map((si) => si.sales_invoice_id));
                                            } else {
                                                setSelectedInvoices([]);
                                            }
                                        }}
                                        title="Select All CREATED"
                                        className="form-checkbox h-4 w-4 text-purple-600 transition duration-150 ease-in-out"
                                    />
                                </TableHead>
                                <TableHead>Invoice No</TableHead>
                                <TableHead>Invoice Date</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Total Amount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredSI.map((si) => {
                                const isCancelled = si.status === 'CANCELLED';
                                const isApproved = si.status === 'APPROVED';
                                const isClosed = si.status === 'CLOSED';
                                const isEditable = si.status === 'CREATED';

                                return (
                                    <TableRow key={si.sales_invoice_id}>
                                        <TableCell className='w-10'>
                                            <input
                                                type="checkbox"
                                                checked={selectedInvoices.includes(si.sales_invoice_id)}
                                                disabled={si.status !== 'CREATED' && si.status !== 'APPROVED' && si.status !== 'CLOSED'}
                                                onChange={(e) => {
                                                    const currentStatus = si.status;
                                                    
                                                    // Filter selected invoices to get only those that are in the current filtered view
                                                    const filteredSelectedInvoices = selectedInvoices.filter(id => {
                                                        const invoice = salesInvoices.find(inv => inv.sales_invoice_id === id);
                                                        return invoice && filteredSI.some(filteredInv => filteredInv.sales_invoice_id === id);
                                                    });

                                                    const selectedStatuses = filteredSelectedInvoices
                                                        .map(id => salesInvoices.find(inv => inv.sales_invoice_id === id)?.status)
                                                        .filter(Boolean);

                                                    if (
                                                        selectedStatuses.length > 0 &&
                                                        !selectedStatuses.includes(currentStatus)
                                                    ) {
                                                        toast({
                                                            title: "Invalid Selection",
                                                            description: "You can only select invoices with the same status.",
                                                            variant: "destructive",
                                                        });
                                                        return;
                                                    }

                                                    if (e.target.checked) {
                                                        setSelectedInvoices(prev => [...prev, si.sales_invoice_id]);
                                                    } else {
                                                        setSelectedInvoices(prev =>
                                                            prev.filter(id => id !== si.sales_invoice_id)
                                                        );
                                                    }
                                                }}
                                                className="form-checkbox h-4 w-4 text-purple-600 transition duration-150 ease-in-out"
                                            />
                                        </TableCell>
                                        <TableCell className="font-medium">{si.sales_invoice_no}</TableCell>
                                        <TableCell>{si.invoice_date ? new Date(si.invoice_date).toLocaleDateString() : ''}</TableCell>
                                        <TableCell>{si.customer_name}</TableCell>
                                        <TableCell>{si.total_amount}</TableCell>
                                        <TableCell>
                                            <Badge className={getStatusColor(si.status)}>{si.status}</Badge>
                                        </TableCell>
                                        <TableCell className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleViewSI(si.sales_invoice_id)}
                                                title="Show Details"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>

                                            {isEditable && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleEditSI(si.sales_invoice_id)}
                                                    title="Edit Invoice"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            )}

                                            {si.status === "CREATED" && (
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => handleDeleteSI(si.sales_invoice_id)}
                                                    title="Delete Invoice"
                                                    disabled={isApproved || isClosed}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handlePrint(si)}
                                            >
                                                <Printer className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {showForm && (
                    <SalesInvoiceForm 
                        editingInvoice={editingInvoice}
                        onClose={() => setShowForm(false)}
                        onSave={handleSaveSI} 
                    />
                )}

            <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Sales Invoice Details</DialogTitle>
                    </DialogHeader>
                    {viewingSO && (
                        <>
                            <table className="w-full border border-gray-300 mb-4 text-sm">
                                <tbody>
                                    <tr>
                                        <td className="p-2 font-medium text-gray-600 border">
                                            Invoice Number</td>
                                        <td className="p-2 border">{viewingSO.sales_invoice_no}</td>
                                    </tr>
                                    <tr>
                                        <td className="p-2 font-medium text-gray-600 border">Invoice Date</td>
                                        <td className="p-2 border">{viewingSO.invoice_date ? new Date(viewingSO.invoice_date).toLocaleDateString() : ''}</td>
                                    </tr>
                                    <tr>
                                        <td className="p-2 font-medium text-gray-600 border">Customer Name</td>
                                        <td className="p-2 border">{viewingSO.customer_name}</td>
                                    </tr>
                                    <tr>
                                        <td className="p-2 font-medium text-gray-600 border"> Sales Person</td>
                                        <td className="p-2 border">{viewingSO.sales_person_name}</td>
                                    </tr>
                                    <tr>
                                        <td className="p-2 font-medium text-gray-600 border">Vehicle No</td>
                                        <td className="p-2 border">{viewingSO.vehicle_no || "N/A"}</td>
                                    </tr>
                                    <tr>
                                        <td className="p-2 font-medium text-gray-600 border">Account ID</td>
                                        <td className="p-2 border">{viewingSO.receivable_account_code}</td>
                                    </tr>
                                    <tr>
                                        <td className="p-2 font-medium text-gray-600 border">Payment Term</td>
                                        <td className="p-2 border">{viewingSO.payment_term}</td>
                                    </tr>
                                    <tr>
                                        <td className="p-2 font-medium text-gray-600 border">Credit Limit</td>
                                        <td className="p-2 border">{viewingSO.credit_limit}</td>
                                    </tr>
                                    <tr>
                                        <td className="p-2 font-medium text-gray-600 border">Status</td>
                                        <td className="p-2 border">{viewingSO.status}</td>
                                    </tr>
                                </tbody>
                            </table>
                            <h3 className="text-md font-semibold mb-2">Items</h3>
                            <table className="w-full border border-gray-300 text-sm">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="p-2 border text-left">Item Name</th>
                                        <th className="p-2 border text-left">Quantity</th>
                                        <th className="p-2 border text-left">Rate</th>
                                        <th className="p-2 border text-left">Discount %</th>
                                        <th className="p-2 border text-left">Discount Amount</th>
                                        <th className="p-2 border text-left">Row Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {viewingSO.items?.map((item, index) => {
                                        const quantity = Number(item.quantity || 0);
                                        const unitPrice = Number(item.rate || item.unit_price || 0);
                                        const discountPercentage = Number(item.discount_percentage || 0);
                                        const discountAmount = Number(item.discount_amount || (quantity * unitPrice * discountPercentage / 100));
                                        const rowTotal = Number(item.row_total || (quantity * unitPrice - discountAmount + (item.tax || 0)));
                                        
                                        return (
                                            <tr key={index}>
                                                <td className="p-2 border">{item.item_name ?? '-'}</td>
                                                <td className="p-2 border">{quantity}</td>
                                                <td className="p-2 border">{unitPrice.toFixed(2)}</td>
                                                <td className="p-2 border">{discountPercentage.toFixed(2)}%</td>
                                                <td className="p-2 border">{discountAmount.toFixed(2)}</td>
                                                <td className="p-2 border">{rowTotal.toFixed(2)}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                            <div className="mb-4">
                                <p><strong>Remarks:</strong> {viewingSO.remarks || "None"}</p>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

interface SIItem {
    item_id: number;
    uom?: string;
    quantity?: number;
    rate?: number;
    amount?: number;
    discount_percentage?: number;
    discount_amount?: number;
    tax?: number;
    tax_amount?: number;
    row_total?: number;
    extra_discount?: number;
    commission_percentge: number;
    commission_amount: number;
}

interface SalesInvoiceFormProps {
    editingInvoice?: SalesInvoice | null;
    onClose: () => void;
    onSave: (payload: {
      
        customer_id: number;
        company_id: number;
        branch_id: number;
        invoice_date: Date;
       
        remarks: string,
        total_amount: number,
        commission_amount:number,
        items: SIItem[];
    }) => void; 
}

export const SalesInvoiceForm: React.FC<SalesInvoiceFormProps> = ({ editingInvoice, onClose, onSave }) => {
   
    const [customers, setCustomers] = useState<any[]>([]);
    const [companies, setCompanies] = useState<any[]>([]);
       const [isSubmitting, setIsSubmitting] = useState(false);
    const [branches, setBranches] = useState<any[]>([]);
    
    const [items, setItems] = useState<any[]>([]);

    const [companyName, setCompanyName] = useState<string>('');
        const [company_id, setCompany_id] = useState<number | null>(null);

    const [branchName, setBranchName] = useState<string>('');
    const [branch_id, setBranch_id] = useState<number | null>(null);

    const [customer_id, setCustomerId] = useState<number>(0);
    const [invoice_date, setInvoiceDate] = useState<Date>(new Date());
    const [remarks, setRemarks] = useState<string>('');
    const [discount, setDiscount] = useState<number>(0);
    const [tax, setTax] = useState<number>(0);
    const [total_amount, setTotalAmount] = useState<number>(0);
    const [commission_amount, setCommissionAmount] = useState<number>(0);
        const [branchOpen, setBranchOpen] = useState(false);



    const [customerOpen, setCustomerOpen] = useState(false);

    const [itemDropdown, setItemDropdown] = useState<number | null>(null);

    const [siItems, setSiItems] = useState<SIItem[]>([{
        item_id: 0,
        uom: '',
        quantity: 0,
        rate: 0,
        amount: 0,
        discount_percentage: 0, // CHANGED: discount to discount_percentage
        discount_amount: 0,
        tax: 0,
        tax_amount: 0,
        row_total: 0,
        commission_percentge :0,
        commission_amount:0,
    }]);



useEffect(() => {
  if (!editingInvoice) {
    resetForm();
    return;
  }

  setCustomerId(editingInvoice.customer_id);
  setInvoiceDate(
    editingInvoice.invoice_date
      ? new Date(editingInvoice.invoice_date)
      : new Date()
  );
  setRemarks(editingInvoice.remarks ?? "");
  setTotalAmount(Number(editingInvoice.total_amount ?? 0));
  setCommissionAmount(Number(editingInvoice.commission_amount ?? 0));
  setCompanyName(String(editingInvoice.company_id ?? ""));
  setBranch_id(Number(editingInvoice.branch_id ?? 0));
  setBranchName(editingInvoice.branch_name ?? "");
  if (editingInvoice.items?.length) {
    const mappedItems: SIItem[] = editingInvoice.items.map((item) => {
      const quantity = Number(item.quantity ?? 0);
      const rate = Number(item.rate ?? item.unit_price ?? 0);
      const amount = quantity * rate;

      const discountPercentage = Number(item.discount_percentage ?? 0);
      const commission_percentge = Number(item.commission_percentge ?? 0);
      const commission_amount = Number(item.commission_amount ?? 0);
      const discountAmount =
        Number(item.discount_amount) ||
        (amount * discountPercentage) / 100;

      const tax = Number(item.tax ?? 0);
      const rowTotal = amount - discountAmount + tax;

      return {
        item_id: item.item_id,
        uom: item.uom ?? "",
        quantity,
        rate,
        amount,
        discount_percentage: discountPercentage,
        discount_amount: discountAmount,
        tax,
        tax_amount: tax,
        row_total: rowTotal,
        extra_discount: item.extra_discount ?? 0,
        commission_percentge:item.commission_percentge ?? 0,
        commission_amount:commission_amount ?? 0
      };
    });

    setSiItems(mappedItems);

    const { discountSum, taxSum, total } = computeSiItems(mappedItems);
    setDiscount(discountSum);
    setTax(taxSum);
    setTotalAmount(total);
  } else {
    setSiItems([
      {
        item_id: 0,
        uom: "",
        quantity: 0,
        rate: 0,
        amount: 0,
        discount_percentage: 0,
        discount_amount: 0,
        tax: 0,
        tax_amount: 0,
        row_total: 0,
        extra_discount: 0,
        commission_percentge: 0,
        commission_amount: 0
      },
    ]);
  }
}, [editingInvoice]);

 useEffect(() => {
  const load = async () => {
    try {
      const [custRes, compRes, branchRes, itemRes] = await Promise.all([
        getCustomers(),
        getCompanies(),
        getBranches(),
        getItems(),
      ]);

      const customers = Array.isArray(custRes) ? custRes : custRes?.data ?? [];
      const companies = Array.isArray(compRes) ? compRes : compRes?.data ?? [];
      const items = Array.isArray(itemRes) ? itemRes : itemRes?.data ?? [];

       const approvedBranches = branchRes.filter(
        (branch: Branch) =>
          branch.status === "APPROVED" && branch.branch_id === 1
      );

      setBranches(approvedBranches);

      setCustomers(customers);
      setCompanies(companies);
      
      setItems(items);

      // Auto-select company if only one exists
      if (companies.length === 1) {
        setCompanyName(companies[0].company_name ?? "");
        setCompany_id(Number(companies[0].company_id ?? 0));
      }
      if (!editingInvoice && approvedBranches.length > 0) {
        setBranch_id(approvedBranches[0].branch_id); 
      }
    } catch (error) {
      console.error("Failed to load form data", error);
      toast({
        title: "Error",
        description: "Failed to load customers, companies, or branches",
        variant: "destructive",
      });
    }
  };

  load();
}, []);


const resetForm = () => {
    setCustomerId(0);
    setInvoiceDate(new Date());
   
    setRemarks('');
    setTotalAmount(0);
    setCompanyName('');
    
   
    setSiItems([{
        item_id: 0,
        uom: '',
        quantity: 0,
        rate: 0,
        amount: 0,
        discount_percentage: 0,
        discount_amount: 0,
        tax: 0,
        tax_amount: 0,
        row_total: 0,
        commission_percentge:0,
        commission_amount:0
    }]);
    setDiscount(0);
    setTax(0);
};

    useEffect(() => {
    const { discountSum, taxSum, total, commissionAmountSum } = computeSiItems(siItems);
    setDiscount(discountSum);
    setTax(taxSum);
    setTotalAmount(total);
    setCommissionAmount(commissionAmountSum); // Add this line
}, [siItems]);

   const computeSiItems = (items: SIItem[]) => {
    let discountSum = 0;
    let taxSum = 0;
    let commissionAmountSum = 0;
    let total = 0;

    const computed = items.map((row) => {
        const quantity = Number(row.quantity || 0);
        const rate = Number(row.rate || 0);
        const amount = quantity * rate;
        const discountPercentage = Number(row.discount_percentage || 0);
        const discountAmount = amount * discountPercentage / 100;
        
        const netAmount = amount - discountAmount;
        
        const commissionPercentage = Number(row.commission_percentge || 0);
        const commissionAmount = netAmount * commissionPercentage / 100;
        
        const tax_amount = Number(row.tax || 0);
        const row_total = netAmount + tax_amount; // Commission is not added to row total

        discountSum += discountAmount;
        taxSum += tax_amount;
        commissionAmountSum += commissionAmount;
        total += row_total;

        return {
            ...row,
            amount,
            discount_amount: discountAmount,
            commission_amount: commissionAmount, // This was missing
            tax_amount,
            row_total
        } as SIItem;
    });

    return { computed, discountSum, taxSum, total, commissionAmountSum };
};

    const addItemRow = () => {
        const next = [...siItems, {
            item_id: 0,
            uom: '',
            quantity: 0,
            rate: 0,
            amount: 0,
            discount_percentage: 0, 
            discount_amount: 0,
            tax: 0,
            tax_amount: 0,
            row_total: 0,
            commission_percentge: 0,
            commission_amount: 0
        }];
        const { computed, discountSum, taxSum, total } = computeSiItems(next);
        setSiItems(computed);
    };

    const removeItemRow = (index: number) => {
        const next = siItems.filter((_, i) => i !== index);
        const { computed, discountSum, taxSum, total } = computeSiItems(next);
        setSiItems(computed);
    };



const handleSelectItem = (rowIndex: number, itemId: number) => {
    const copy = [...siItems];
    const selectedItem = items.find((it) => Number(it.item_id) === Number(itemId));

    if (!selectedItem) return;

    const uomValue = selectedItem?.uom_name ?? selectedItem?.uom ?? selectedItem?.unit ?? '';
    const rateValue = selectedItem?.branch_specific_rate ?? 
                     selectedItem?.price ?? 
                     selectedItem?.rate ?? 
                     selectedItem?.unit_price ?? 
                     selectedItem?.default_rate ?? 0;
    const discountPercentageValue = selectedItem?.branch_specific_discount ?? 
                                   selectedItem?.discount_percentage ?? 
                                   selectedItem?.discount ?? 0;
    const commissionPercentageValue = selectedItem?.commission_percentage ?? 0; // Get from item
    
    copy[rowIndex] = {
        ...copy[rowIndex],
        item_id: Number(itemId),
        uom: uomValue,
        rate: Number(rateValue),
        discount_percentage: Number(discountPercentageValue),
        commission_percentge: Number(commissionPercentageValue), // Set commission percentage
        quantity: Number(copy[rowIndex]?.quantity ?? 0)
    } as SIItem;

    const { computed } = computeSiItems(copy);
    setSiItems(computed);
    setItemDropdown(null);
};

const handleChangeRow = (index: number, field: keyof SIItem, value: any) => {
    const copy = [...siItems];
    const numericValue = ['quantity', 'rate', 'discount_percentage', 'tax', 'commission_percentge'].includes(field)
        ? (value === '' ? 0 : Number(value))
        : value;

    copy[index] = {
        ...copy[index],
        [field]: numericValue
    } as SIItem;

    const { computed, discountSum, taxSum, total, commissionAmountSum } = computeSiItems(copy);
    setSiItems(computed);
    setCommissionAmount(commissionAmountSum); // Update commission amount
};


const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsSubmitting(true);

  try {
    // VALIDATION
    if (!customer_id || customer_id === 0) {
      toast({
        title: "Customer Required",
        description: "Please select a customer",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    if (!branch_id || branch_id === 0) {
      toast({
        title: "Branch Required",
        description: "Please select a branch",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    if (!siItems.length || siItems.every(it => it.item_id === 0)) {
      toast({
        title: "No Items",
        description: "Please add at least one item",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    // PREPARE ITEMS FOR API
const itemsPayload: SIItem[] = siItems.map(it => ({
    item_id: it.item_id,
    quantity: Number(it.quantity ?? 0),
    unit_price: Number(it.rate ?? 0),
    discount_percentage: Number(it.discount_percentage ?? 0),
    discount_amount: Number(it.discount_amount ?? 0),
    tax: Number(it.tax ?? 0),
    extra_discount: Number(it.extra_discount ?? 0),
    commission_percentge: Number(it.commission_percentge ?? 0),
    commission_amount: Number(it.commission_amount ?? 0) // Make sure this is included
}));

const payload = {
    customer_id,
    company_id: Number(company_id ?? 0),
    branch_id: Number(branch_id ?? 0),
    invoice_date,
    remarks,
    total_amount,
    commission_amount, // This should now have the total commission
    items: itemsPayload,
};

    // SAVE OR UPDATE
    if (editingInvoice) {
      onSave(payload);
      toast({
        title: "Updated",
        description: "Sales invoice updated successfully!",
      });
    } else {
      await onSave(payload);
      toast({
        title: "Created",
        description: "Sales invoice created successfully!",
      });
    }

    onClose(); // close form on success

  } catch (error) {
    console.error("Form submission failed", error);
    toast({
      title: "Error",
      description: "Failed to save sales invoice",
      variant: "destructive",
    });
  } finally {
    setIsSubmitting(false);
  }
};


    

return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 overflow-hidden flex items-center justify-center p-2">
        <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden ">
            {/* Header - Compact */}
           <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-3 py-2 border-b border-blue-800 flex-shrink-0 ">
                    <div className="flex items-center justify-between">
                        <h2 className="text-base md:text-lg font-bold">
                            {editingInvoice ? '✏️ Edit Invoice' : '📄 Create Invoice'}
                        </h2>
                        <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon"
                            onClick={onClose}
                            className="h-7 w-7 text-white hover:bg-white hover:text-black"
                        >
                            <X className="h-3 w-3" />
                        </Button>
                    </div>
                </div>

            {/* Form Container */}
            <div className="flex-1 overflow-hidden p-3">
                <form onSubmit={handleSubmit} className="h-full flex flex-col">
                    <div className="overflow-y-auto pr-1 flex-1 space-y-3">
                        {/* Company & Branch - Compact */}
                        <div className="p-3 border border-blue-100 rounded-lg bg-blue-50 space-y-3">
                            {/* <h3 className="text-sm font-semibold text-blue-800">
                                📋 Company & Branch
                            </h3> */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="block text-xs font-medium text-gray-700">
                                        <span className="flex items-center gap-1">
                                            <Building className="h-3 w-3" /> Company
                                        </span>
                                    </label>
                                    {Array.isArray(companies) && companies.length === 1 ? (
                                        <Input 
                                            readOnly 
                                            value={companyName} 
                                            className="h-8 text-sm bg-gray-50 border border-gray-200"
                                        />
                                    ) : (
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button 
                                                    type="button" 
                                                    variant="outline" 
                                                    className="h-8 w-full justify-between text-sm border hover:border-blue-500"
                                                >
                                                    {companyName || 'Select Company'}
                                                    <ChevronsUpDown className="ml-1 h-3 w-3 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[300px] max-h-[200px] overflow-auto p-0">
                                                <Command>
                                                    <CommandInput placeholder="Search..." className="h-8 text-sm" />
                                                    <CommandEmpty>No company found</CommandEmpty>
                                                    <CommandGroup className="max-h-[150px] overflow-auto">
                                                        {companies.map((comp) => (
                                                            <CommandItem 
                                                                key={comp.id ?? comp.company_id} 
                                                                onSelect={() => setCompanyName(comp.name ?? comp.company_name ?? '')}
                                                                className="text-sm h-8"
                                                            >
                                                                <Building className="mr-2 h-3 w-3" />
                                                                {comp.name ?? comp.company_name}
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                    )}
                                </div>

                                <div className="space-y-1">
                                    <label className="block text-xs font-medium text-gray-700">
                                        <span className="flex items-center gap-1">
                                            <MapPin className="h-3 w-3" /> Branch
                                        </span>
                                    </label>
                                    <Popover open={branchOpen} onOpenChange={setBranchOpen}>
                                        <PopoverTrigger asChild>
                                            <Button 
                                                variant="outline" 
                                                role="combobox" 
                                                className="h-8 w-full justify-between text-sm border hover:border-blue-500"
                                            >
                                                {branch_id
                                                    ? `${branches.find((br) => br.branch_id === branch_id)?.branch_name}`
                                                    : 'Select Branch'}
                                                <ChevronsUpDown className="ml-1 h-3 w-3 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[300px] max-h-[200px] overflow-auto p-0">
                                            <Command>
                                                <CommandInput placeholder='Search...' className="h-8 text-sm" />
                                                <CommandEmpty>No Branch found</CommandEmpty>
                                                <CommandGroup className="max-h-[150px] overflow-auto">
                                                    {branches.map((br) => (
                                                        <CommandItem
                                                            key={br.branch_id}
                                                            className="text-sm h-8"
                                                            onSelect={() => {
                                                                setBranch_id(br.branch_id);
                                                                setBranchOpen(false);
                                                            }}
                                                        >
                                                            <Check
                                                                className={cn(
                                                                    "mr-2 h-3 w-3",
                                                                    branch_id === br.branch_id ? "opacity-100" : "opacity-0"
                                                                )}
                                                            />
                                                            <MapPin className="mr-2 h-3 w-3" />
                                                            {br.branch_name}
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>
                        </div>

                        {/* Invoice Details - Compact */}
                        <div className="p-3 border border-green-100 rounded-lg bg-green-50 space-y-3">
                            {/* <h3 className="text-sm font-semibold text-green-800">
                                📅 Invoice Details
                            </h3> */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div className="space-y-1">
                                    <label className="block text-xs font-medium text-gray-700">
                                        <span className="flex items-center gap-1">
                                            <CalendarIcon className="h-3 w-3" /> Date
                                        </span>
                                    </label>
                                    <DatePicker
                                        selected={invoice_date}
                                        onChange={(date: Date) => setInvoiceDate(date)}
                                        customInput={
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className={cn(
                                                    "h-8 w-full justify-start text-left font-normal text-sm border hover:border-green-500",
                                                    !invoice_date && "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-3 w-3" />
                                                {invoice_date ? format(invoice_date, "PP") : <span>Select date</span>}
                                            </Button>
                                        }
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="block text-xs font-medium text-gray-700">
                                        <span className="flex items-center gap-1">
                                            <Users className="h-3 w-3" /> Customer
                                        </span>
                                    </label>
                                    <Popover open={customerOpen} onOpenChange={setCustomerOpen}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                role="combobox"
                                                className="h-8 w-full justify-between text-sm border hover:border-green-500"
                                            >
                                                {customer_id
                                                    ? customers?.find((c) => String(c.customer_id) === String(customer_id))?.customer_name ?? "Select"
                                                    : "Select Customer"}
                                                <ChevronsUpDown className="ml-1 h-3 w-3 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[300px] max-h-[200px] overflow-auto p-0">
                                            <Command>
                                                <CommandInput placeholder="Search..." className="h-8 text-sm" />
                                                <CommandEmpty>No customer found</CommandEmpty>
                                                <CommandGroup className="max-h-[150px] overflow-auto">
                                                    {customers.map((c) => (
                                                        <CommandItem
                                                            key={c.customer_id}
                                                            className="text-sm h-8"
                                                            onSelect={() => {
                                                                setCustomerId(Number(c.customer_id));
                                                                setCustomerOpen(false);
                                                                try {
                                                                    const sel = {
                                                                        customer_id: c.customer_id,
                                                                        customer_name: c.customer_name,
                                                                        discount: c.discount ?? null,
                                                                    };
                                                                    localStorage.setItem("selectedCustomer", JSON.stringify(sel));
                                                                } catch (e) {
                                                                    console.warn("Failed to save selectedCustomer to localStorage", e);
                                                                }
                                                            }}
                                                        >
                                                            <Check
                                                                className={cn(
                                                                    "mr-2 h-3 w-3",
                                                                    customer_id === Number(c.customer_id) ? "opacity-100" : "opacity-0"
                                                                )}
                                                            />
                                                            <Users className="mr-2 h-3 w-3" />
                                                            {c.customer_name}
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                <div className="space-y-1">
                                    <label className="block text-xs font-medium text-gray-700">
                                        <span className="flex items-center gap-1">
                                            <MessageSquare className="h-3 w-3" /> Remarks
                                        </span>
                                    </label>
                                    <textarea
                                        value={remarks}
                                        onChange={(e) => setRemarks(e.target.value)}
                                        className="w-full p-2 text-sm border border-gray-200 rounded resize-none focus:outline-none focus:ring-1 focus:ring-green-500"
                                        rows={1}
                                        placeholder="Remarks..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Items Table - Compact */}
                        <div className="p-3 border border-purple-100 rounded-lg bg-purple-50 space-y-2">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-semibold text-purple-800">
                                    🛒 Items
                                </h3>
                                <Button 
                                    type="button" 
                                    variant="secondary" 
                                    onClick={addItemRow}
                                    className="h-7 text-xs bg-gradient-to-r from-purple-500 to-purple-600 text-white"
                                >
                                    <Plus className="mr-1 h-3 w-3" /> Add
                                </Button>
                            </div>

                            {/* Table Container */}
                            <div className="border border-gray-200 rounded overflow-hidden">
                                <div className="overflow-auto max-h-[180px]">
                                    <div className="min-w-[1000px]">
                                        {/* Table Header */}
                                        <div className="grid grid-cols-12 gap-1 bg-gray-50 p-2 text-xs font-bold text-gray-700 border-b border-gray-200 sticky top-0 z-10">
                                            <div className="col-span-3 text-xs">Item</div>
                                            <div className="col-span-1 text-center text-xs">Qty</div>
                                            <div className="col-span-1 text-center text-xs">Rate</div>
                                            <div className="col-span-1 text-center text-xs">Disc%</div>
                                            <div className="col-span-1 text-center text-xs">Disc</div>
                                            <div className="col-span-1 text-center text-xs">Tax</div>
                                            <div className="col-span-1 text-center text-xs">Comm%</div>
                                            <div className="col-span-1 text-center text-xs">Comm</div>
                                            <div className="col-span-1 text-center text-xs">Total</div>
                                            <div className="col-span-1 text-center text-xs">Action</div>
                                        </div>

                                        {/* Table Rows */}
                                        <div className="divide-y divide-gray-100">
                                            {siItems.map((row, idx) => (
                                                <div key={idx} className="grid grid-cols-12 gap-1 items-center p-1 hover:bg-gray-50 min-h-[40px]">
                                                    {/* Item Selector */}
                                                    <div className="col-span-3">
                                                        <Popover open={itemDropdown === idx} onOpenChange={(open) => setItemDropdown(open ? idx : null)}>
                                                            <PopoverTrigger asChild>
                                                                <Button 
                                                                    type="button" 
                                                                    variant="outline" 
                                                                    className="h-7 w-full justify-between text-xs border hover:border-purple-500"
                                                                >
                                                                    {row.item_id ? (
                                                                        <span className="truncate text-xs">
                                                                            {items.find(it => it.item_id === row.item_id)?.item_name}
                                                                        </span>
                                                                    ) : (
                                                                        'Select Item'
                                                                    )}
                                                                    <ChevronsUpDown className="ml-1 h-3 w-3 opacity-50" />
                                                                </Button>
                                                            </PopoverTrigger>
                                                            <PopoverContent className="w-[250px] max-h-[200px] overflow-auto p-0">
                                                                <Command>
                                                                    <CommandInput placeholder="Search..." className="h-8 text-sm" />
                                                                    <CommandEmpty>No items found</CommandEmpty>
                                                                    <CommandGroup className="max-h-[150px] overflow-auto">
                                                                        {items.map((it) => (
                                                                            <CommandItem 
                                                                                key={it.item_id} 
                                                                                onSelect={() => handleSelectItem(idx, Number(it.item_id))}
                                                                                className="text-sm h-8"
                                                                            >
                                                                                <Check className={cn("mr-2 h-3 w-3", row.item_id === Number(it.item_id) ? "opacity-100" : "opacity-0")} />
                                                                                <Package className="mr-2 h-3 w-3" />
                                                                                <span className="truncate">{it.item_name}</span>
                                                                            </CommandItem>
                                                                        ))}
                                                                    </CommandGroup>
                                                                </Command>
                                                            </PopoverContent>
                                                        </Popover>
                                                    </div>

                                                    {/* Input Fields */}
                                                    <div className="col-span-1">
                                                        <Input
                                                            type="number"
                                                            min={0}
                                                            step="0.01"
                                                            value={row.quantity}
                                                            onChange={(e) => handleChangeRow(idx, "quantity", Number(e.target.value))}
                                                            className="h-7 text-xs text-center border"
                                                        />
                                                    </div>

                                                    <div className="col-span-1">
                                                        <Input
                                                            type="number"
                                                            min={0}
                                                            step="0.01"
                                                            value={row.rate || 0}
                                                            onChange={(e) => handleChangeRow(idx, "rate", e.target.value)}
                                                            className="h-7 text-xs text-center border"
                                                        />
                                                    </div>

                                                    <div className="col-span-1">
                                                        <Input
                                                            type="number"
                                                            min={0}
                                                            max={100}
                                                            step="0.01"
                                                            value={row.discount_percentage || 0}
                                                            onChange={(e) => handleChangeRow(idx, "discount_percentage", e.target.value)}
                                                            className="h-7 text-xs text-center border"
                                                        />
                                                    </div>

                                                    <div className="col-span-1">
                                                        <div className="h-7 px-1 border border-gray-200 rounded bg-gray-50 flex items-center justify-center text-xs">
                                                            {Number(row.discount_amount || 0).toFixed(2)}
                                                        </div>
                                                    </div>

                                                    <div className="col-span-1">
                                                        <Input
                                                            type="number"
                                                            min={0}
                                                            step="0.01"
                                                            value={row.tax || 0}
                                                            onChange={(e) => handleChangeRow(idx, "tax", e.target.value)}
                                                            className="h-7 text-xs text-center border"
                                                        />
                                                    </div>

                                                    <div className="col-span-1">
                                                        <Input
                                                            type="number"
                                                            min={0}
                                                            max={100}
                                                            step="0.01"
                                                            value={row.commission_percentge || 0}
                                                            onChange={(e) => handleChangeRow(idx, "commission_percentge", e.target.value)}
                                                            className="h-7 text-xs text-center border"
                                                        />
                                                    </div>

                                                    <div className="col-span-1">
                                                        <div className="h-7 px-1 border border-gray-200 rounded bg-gray-50 flex items-center justify-center text-xs">
                                                            {Number(row.commission_amount || 0).toFixed(2)}
                                                        </div>
                                                    </div>

                                                    <div className="col-span-1">
                                                        <div className="h-7 px-1 border border-gray-200 rounded bg-gray-50 flex items-center justify-center text-xs font-medium">
                                                            {Number(row.row_total || 0).toFixed(2)}
                                                        </div>
                                                    </div>

                                                    <div className="col-span-1 text-center">
                                                        {siItems.length > 1 && (
                                                            <Button 
                                                                type="button" 
                                                                variant="destructive" 
                                                                size="icon" 
                                                                onClick={() => removeItemRow(idx)}
                                                                className="h-7 w-7"
                                                            >
                                                                <Trash2 className="h-3 w-3" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Totals Section - Compact */}
                        <div className="p-3 border border-amber-100 rounded-lg bg-amber-50">
                            <h3 className="text-sm font-semibold text-amber-800 mb-2">
                                🧾 Summary
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                <div className="p-2 border border-amber-200 rounded bg-amber-100">
                                    <div className="text-xs text-amber-700 font-medium">Commission</div>
                                    <div className="text-sm font-bold text-amber-900">
                                        {commission_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </div>
                                </div>
                                <div className="p-2 border border-green-200 rounded bg-green-100">
                                    <div className="text-xs text-green-700 font-medium">Total Amount</div>
                                    <div className="text-sm font-bold text-green-900">
                                        {total_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </div>
                                </div>
                                <div className="p-2 border border-blue-200 rounded bg-blue-100">
                                    <div className="text-xs text-blue-700 font-medium">Discount</div>
                                    <div className="text-sm font-bold text-blue-900">
                                        {discount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </div>
                                </div>
                                <div className="p-2 border border-red-200 rounded bg-red-100">
                                    <div className="text-xs text-red-700 font-medium">Tax</div>
                                    <div className="text-sm font-bold text-red-900">
                                        {tax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons - Compact */}
                    <div className="mt-3 pt-2 border-t border-gray-200 flex-shrink-0">
                        <div className="flex gap-2 justify-end">
                            <Button 
                                type="button" 
                                variant="outline" 
                                onClick={onClose}
                                className="h-8 text-sm border hover:border-red-500 hover:bg-red-50"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="h-8 text-sm bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 disabled:opacity-50"
                                disabled={isSubmitting || siItems.length === 0 || !customer_id || !branch_id}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                                        {editingInvoice ? "Updating..." : "Saving..."}
                                    </>
                                ) : (
                                    editingInvoice ? "Update" : "Save"
                                )}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>
);
};
export default SalesInvoice; 