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
        item_id: number; 
        item_name: string;
        uom?: string;
        extra_discount: number;
        quantity: number; 
        unit_price?: number; 
        commission_percentge: number;
        commission_amount: number;
        rate?: number; 
        amount?: number; 
        discount_percentage: number; 
        discount_amount?: number; 
        tax: number; 
        tax_amount?: number; 
        row_total?: number;
    }>;
}

const SalesInvoice: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingInvoice, setEditingInvoice] = useState<SalesInvoice | null>(null);
    const [salesInvoices, setSalesInvoices] = useState<SalesInvoice[]>([]); 
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
    const [companyData, setCompanyData] = useState<CompanyData | null>(null);

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
                setCompanyData(data[0]);
            }
        } catch (error) {
            console.error("Error loading company image", error);
        }
    };

    useEffect(() => {
        loadSalesInvoices(startDate, endDate);
        loadCompanyImage();
    }, []);

    const loadSalesInvoices = async (from?: string, to?: string) => {
        setIsLoading(true);
        try {
            const data = from && to
                ? await getSaleInvoices(from, to)
                : await getSaleInvoices();
            
            console.log("📦 Loaded invoices:", data);
            if (data.length > 0) {
                console.log("Sample invoice customer:", data[0].customer_name);
            }
            
            setSalesInvoices(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error loading sales invoices", error);
            setSalesInvoices([]); 
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
    
    const totalSIs = Array.isArray(salesInvoices) ? salesInvoices.length : 0;
    const createdSIs = Array.isArray(salesInvoices) 
        ? salesInvoices.filter(invoice => invoice?.status === 'CREATED').length 
        : 0;
    const totalValue = Array.isArray(salesInvoices) 
        ? salesInvoices.reduce((sum, invoice) => sum + Number(invoice?.total_amount || 0), 0)
        : 0;
      
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

        setDateFilterApplied(true);
        loadSalesInvoices(startDate, endDate); 
    };
    
    const handleClearDateFilter = () => {
        setStartDate('');
        setEndDate('');
        setDateFilterApplied(false);
        loadSalesInvoices();
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
        const selectedSI = Array.isArray(salesInvoices) 
            ? salesInvoices.find(si => si?.sales_invoice_id === sales_invoice_id)
            : undefined;
        if (selectedSI) {
            setViewingSO(selectedSI);
            setViewDialogOpen(true);
        }
    };

    const handleEditSI = (sales_invoice_id: number) => {
        const selectedSI = Array.isArray(salesInvoices)
            ? salesInvoices.find(si => si?.sales_invoice_id === sales_invoice_id)
            : undefined;
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

    const handleSaveSI = async (data: Omit<SalesInvoice, "sales_invoice_id">) => {
        try {
            const items = (data.items || []).map(it => ({
                item_id: it.item_id,
                quantity: it.quantity,
                unit_price: it.rate ?? it.unit_price ?? 0,
                discount_percentage: it.discount_percentage ?? 0,
                discount_amount: it.discount_amount ?? 0,
                tax: it.tax ?? 0,
                extra_discount: (it as any).extra_discount ?? 0,
                commission_percentge: it.commission_percentge ?? 0,
                commission_amount: it.commission_amount ?? 0
            }));

            if (editingInvoice) {
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
            loadSalesInvoices();
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
    if (!invoice) return;
    
    const printWindow = window.open("", "_blank", "width=800,height=1000");
    const invoiceDate = new Date(invoice.invoice_date);
    const formattedDate = `${invoiceDate.getDate()}-${invoiceDate.toLocaleString("default", {
        month: "short",
    })}-${String(invoiceDate.getFullYear()).slice(-2)}`;

    const totalAmount = Number(invoice.total_amount || 0);
    const grandTotal = totalAmount;
    
    // Get customer name for display
    const customerDisplay = invoice.customer_name || 'Walk In Customer';
    
    // Fixed payment term extraction - handles "POS Sale - card payment" format
    let paymentMethod = 'Not Specified';
    
    // First check if payment_term exists and has a value
    if (invoice.payment_term && invoice.payment_term.trim() !== '') {
        paymentMethod = invoice.payment_term.charAt(0).toUpperCase() + invoice.payment_term.slice(1).toLowerCase();
    } 
    // Then check remarks for payment information
    else if (invoice.remarks) {
        const remarksLower = invoice.remarks.toLowerCase();
        
        // Check for common payment patterns in remarks
        if (remarksLower.includes('cash')) {
            paymentMethod = 'Cash';
        } else if (remarksLower.includes('card')) {
            paymentMethod = 'Card';
        } else if (remarksLower.includes('bank')) {
            paymentMethod = 'Bank Transfer';
        } else if (remarksLower.includes('pos')) {
            paymentMethod = 'POS';
        } else if (remarksLower.includes('cheque') || remarksLower.includes('check')) {
            paymentMethod = 'Cheque';
        } else {
            // If we can't identify a specific method, use the whole remark
            // but remove "POS Sale - " prefix if present
            let remark = invoice.remarks;
            if (remark.includes(' - ')) {
                const parts = remark.split(' - ');
                if (parts.length > 1) {
                    paymentMethod = parts[1].charAt(0).toUpperCase() + parts[1].slice(1);
                } else {
                    paymentMethod = remark;
                }
            } else {
                paymentMethod = remark;
            }
        }
    }

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
            if (n < 1_000_000)
                return convert(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + convert(n % 1000) : '');
            if (n < 1_000_000_000)
                return convert(Math.floor(n / 1_000_000)) + ' Million' + (n % 1_000_000 ? ' ' + convert(n % 1_000_000) : '');
            return convert(Math.floor(n / 1_000_000_000)) + ' Billion' + (n % 1_000_000_000 ? ' ' + convert(n % 1_000_000_000) : '');
        };

        return convert(num) + ' Only /-';
    };

    const logoSource = companyData?.image;
    const companyName = companyData?.company_name;
    const companyAddress = companyData?.address || "";
    const companyPhone = companyData?.phone || "";
    const companyEmail = companyData?.email || "";

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
                        <td><strong>Customer:</strong> ${customerDisplay}</td>
                        <td><strong>Payment Method:</strong> ${paymentMethod}</td>
                    </tr>
                    <tr>
                        <td colspan="2"><strong>Narration:</strong> ${invoice.remarks || ""}</td>
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
                            ${(invoice.items || []).map((item, index) => {
                                const quantity = Number(item.quantity || 0);
                                const unitPrice = Number(item.rate || item.unit_price || 0);
                                const discountPercentage = Number(item.discount_percentage || 0);
                                const discountAmount = Number(item.discount_amount || (quantity * unitPrice * discountPercentage / 100));
                                const tax = Number(item.tax || 0);
                                const rowTotal = Number(item.row_total || (quantity * unitPrice - discountAmount + tax));
                                
                                return `
                                    <tr>
                                        <td>${index + 1}</td>
                                        <td class="text-left">${item.item_name || ''}</td>
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
                        <div class="signature-label">Created by: ${invoice.created_by || ''}</div>
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

    // Safe filtering with null checks
    const filteredSI = Array.isArray(salesInvoices) 
        ? salesInvoices.filter((si) => {
            if (!si) return false;
            const term = (searchTerm || "").toLowerCase();
            
            // Ensure customer_name has a default value for searching
            const customerName = si.customer_name || 'Walk In Customer';
            
            return (
                customerName.toLowerCase().includes(term) ||
                (si.branch_name || "").toLowerCase().includes(term) ||
                (si.sales_invoice_no?.toString() || "").includes(term)
            );
        })
        : [];

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
        const invoice = Array.isArray(salesInvoices) 
            ? salesInvoices.find(si => si?.sales_invoice_id === sales_invoice_id)
            : undefined;

        if (invoice?.status === 'CANCELLED') {
            return;
        }

        if (checked) {
            setSelectedInvoices((prev) => [...prev, sales_invoice_id]);
        } else {
            setSelectedInvoices((prev) => prev.filter(id => id !== sales_invoice_id));
        }
    };

    // Show loading state
    if (isLoading && !salesInvoices.length) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading invoices...</p>
                </div>
            </div>
        );
    }

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

                        <div className="flex gap-2">
                            {selectedInvoices.some(sales_invoice_id => {
                                const invoice = Array.isArray(salesInvoices) 
                                    ? salesInvoices.find(invoices => invoices?.sales_invoice_id === sales_invoice_id)
                                    : undefined;
                                return invoice?.status === 'APPROVED' || invoice?.status === 'CLOSED';
                            }) && permissions.sales_unapprove === 1 && (
                                <Button
                                    className="bg-gradient-to-r from-orange-500 to-orange-700"
                                    onClick={handleUnapproveInvoices}
                                >
                                    UnApprove ({selectedInvoices.length})
                                </Button>
                            )}
                            {selectedInvoices.some(id => {
                                const invoice = Array.isArray(salesInvoices)
                                    ? salesInvoices.find(invoice => invoice?.sales_invoice_id === id)
                                    : undefined;
                                return invoice?.status === 'CREATED';
                            }) && permissions.sales_approve === 1 && (
                                <Button
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                    onClick={handleApproveInvoices}
                                >
                                    Approve ({selectedInvoices.length})
                                </Button>
                            )}
                        </div>
                    </div>
                    
                    <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search by Customer, Branch or Invoice No..."
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
                            className="bg-blue-500 hover:bg-blue-600 text-primary"
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
                                <TableHead>Invoice No</TableHead>
                                <TableHead>Invoice Date</TableHead>
                                <TableHead>Customer Name</TableHead>
                                <TableHead>Total Amount</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredSI.length > 0 ? (
                                filteredSI.map((si) => {
                                    if (!si) return null;
                                    
                                    const isCancelled = si.status === 'CANCELLED';
                                    const isApproved = si.status === 'APPROVED';
                                    const isClosed = si.status === 'CLOSED';
                                    const isEditable = si.status === 'CREATED';

                                    // Default to "Walk In Customer" if customer_name is empty
                                    const customerDisplay = si.customer_name || 'Walk In Customer';

                                    return (
                                        <TableRow key={si.sales_invoice_id}>
                                            <TableCell className="font-medium">{si.sales_invoice_no}</TableCell>
                                            <TableCell>{si.invoice_date ? new Date(si.invoice_date).toLocaleDateString() : ''}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    <Users className="h-3 w-3 text-gray-400" />
                                                    <span className="font-medium">{customerDisplay}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-medium">Rs {si.total_amount?.toLocaleString() || '0'}</TableCell>
                                            <TableCell className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleViewSI(si.sales_invoice_id)}
                                                    title="Show Details"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>

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
                                })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                                        {isLoading ? "Loading..." : "No invoices found"}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

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
                                    <td className="p-2 font-medium text-gray-600 border">Invoice Number</td>
                                    <td className="p-2 border">{viewingSO.sales_invoice_no}</td>
                                </tr>
                                <tr>
                                    <td className="p-2 font-medium text-gray-600 border">Invoice Date</td>
                                    <td className="p-2 border">{viewingSO.invoice_date ? new Date(viewingSO.invoice_date).toLocaleDateString() : ''}</td>
                                </tr>
                                <tr>
                                    <td className="p-2 font-medium text-gray-600 border">Customer Name</td>
                                    <td className="p-2 border font-medium">
                                        {viewingSO.customer_name || 'Walk In Customer'}
                                    </td>
                                </tr>
                                {/* Extract from remarks if payment_term is null */}
                                {!viewingSO.payment_term && viewingSO.remarks && viewingSO.remarks.includes('payment') && (
                                    <tr>
                                        <td className="p-2 font-medium text-gray-600 border">Payment Method</td>
                                        <td className="p-2 border">
                                            {viewingSO.remarks.includes('cash') ? 'Cash' : 
                                            viewingSO.remarks.includes('card') ? 'Card' : 
                                            viewingSO.remarks}
                                        </td>
                                    </tr>
                                )}
                                {/* Get discount from first item */}
                                <tr>
                                    <td className="p-2 font-medium text-gray-600 border">Discount %</td>
                                    <td className="p-2 border">
                                        {viewingSO.items && viewingSO.items.length > 0 
                                            ? `${viewingSO.items[0].discount_percentage || 0}%` 
                                            : '0%'}
                                    </td>
                                </tr>
                                {/* Get tax from first item */}
                                <tr>
                                    <td className="p-2 font-medium text-gray-600 border">Tax %</td>
                                    <td className="p-2 border">
                                        {viewingSO.items && viewingSO.items.length > 0 && viewingSO.items[0].tax
                                            ? `${viewingSO.items[0].tax}%` 
                                            : '0%'}
                                    </td>
                                </tr>
                                {/* Calculate total discount amount */}
                                <tr>
                                    <td className="p-2 font-medium text-gray-600 border">Total Discount Amount</td>
                                    <td className="p-2 border">
                                        {viewingSO.items 
                                            ? viewingSO.items.reduce((sum, item) => 
                                                sum + Number(item.discount_amount || 0), 0).toFixed(2)
                                            : '0.00'}
                                    </td>
                                </tr>
                                {/* Calculate total tax amount */}
                                <tr>
                                    <td className="p-2 font-medium text-gray-600 border">Total Tax Amount</td>
                                    <td className="p-2 border">
                                        {viewingSO.items 
                                            ? viewingSO.items.reduce((sum, item) => 
                                                sum + Number(item.tax || 0), 0).toFixed(2)
                                            : '0.00'}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="p-2 font-medium text-gray-600 border">Total Amount</td>
                                    <td className="p-2 border font-bold text-blue-600">
                                        Rs {Number(viewingSO.total_amount || 0).toFixed(2)}
                                    </td>
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
                                    <th className="p-2 border text-left">Tax</th>
                                    <th className="p-2 border text-left">Row Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(viewingSO.items || []).map((item, index) => {
                                    const quantity = Number(item.quantity || 0);
                                    const unitPrice = Number(item.rate || item.unit_price || 0);
                                    const discountPercentage = Number(item.discount_percentage || 0);
                                    const discountAmount = Number(item.discount_amount || 0);
                                    const tax = Number(item.tax || 0);
                                    const rowTotal = Number(item.row_total || (quantity * unitPrice - discountAmount + tax));
                                    
                                    return (
                                        <tr key={index}>
                                            <td className="p-2 border">{item.item_name ?? '-'}</td>
                                            <td className="p-2 border">{quantity}</td>
                                            <td className="p-2 border">{unitPrice.toFixed(2)}</td>
                                            <td className="p-2 border">{discountPercentage.toFixed(2)}%</td>
                                            <td className="p-2 border">{discountAmount.toFixed(2)}</td>
                                            <td className="p-2 border">{tax.toFixed(2)}</td>
                                            <td className="p-2 border">{rowTotal.toFixed(2)}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                            <tfoot>
                                <tr className="bg-gray-50 font-semibold">
                                    <td colSpan={4} className="p-2 border text-right">Totals:</td>
                                    <td className="p-2 border">
                                        {viewingSO.items 
                                            ? viewingSO.items.reduce((sum, item) => 
                                                sum + Number(item.discount_amount || 0), 0).toFixed(2)
                                            : '0.00'}
                                    </td>
                                    <td className="p-2 border">
                                        {viewingSO.items 
                                            ? viewingSO.items.reduce((sum, item) => 
                                                sum + Number(item.tax || 0), 0).toFixed(2)
                                            : '0.00'}
                                    </td>
                                    <td className="p-2 border font-bold">
                                        Rs {Number(viewingSO.total_amount || 0).toFixed(2)}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </>
                )}
            </DialogContent>
        </Dialog>
        </div>
    );
};

export default SalesInvoice;