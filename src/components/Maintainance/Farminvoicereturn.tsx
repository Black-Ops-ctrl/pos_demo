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
import { Plus, Eye, Check, X, Edit, Trash2, Search, Package, ChevronsUpDown, Truck, CalendarIcon, Printer, RotateCcw } from 'lucide-react';
import { getItems } from '@/api/itemsApi';
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
import { getreturnFarmInvoices, createreturnFarmInvoice, approveFarmInvoicesReturn } from '@/api/farmsinvoicesApiReturnApi';

// Import the correct function for getting sale invoices
import {  getReturnSaleInvoices } from '@/api/farmsinvoicesApi'; // Adjust import path as needed

// New import for Checkbox
import { Checkbox } from '@/components/ui/checkbox';
import { getFlock } from '@/api/flockApi';
import AhmadPoultryLogo from '@/assets/AhmadPoultryLogo.png';

interface SalesInvoice {
    sales_invoice_id: number;
    sales_invoice_no: number;
    dc_id: number;
    customer_id: number;
    customer_name: string;
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
        quantity: number; 
        unit_price?: number; 
        rate?: number; 
        amount?: number; 
        discount: number; 
        discount_amount?: number; 
        tax: number; 
        tax_amount?: number; 
        row_total?: number;
        returned_qty?: number; // Added for return functionality
    }>;
}

interface ReturnInvoice {
    sales_return_id: number;
    sales_invoice_id: number;
    sales_invoice_no: number;
    return_no: number;
    customer_id: number;
    customer_name: string;
    branch_id: number;
    branch_name: string;
    flock_id: number;
    flock_name: string;
    invoice_date: Date;
    return_date: Date;
    sales_person_id: number;
    sales_person_name: string;
    total_amount: number;
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
        quantity: number; 
        returned_qty: number;
        unit_price?: number; 
        rate?: number; 
        amount?: number; 
        discount: number; 
        discount_amount?: number; 
        tax: number; 
        tax_amount?: number; 
        row_total?: number;
    }>;
}

interface viewingSO {
    sales_invoice_id: number;
    sales_invoice_no: number;
    dc_id: number;
    customer_id: number;
    customer_name: string;
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
        quantity: number; 
        unit_price?: number; 
        rate?: number; 
        amount?: number; 
        discount: number; 
        discount_amount?: number; 
        tax: number; 
        tax_amount?: number; 
        row_total?: number;
        returned_qty?: number; // Added for return functionality
    }>;
}

const SalesInvoice: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState(''); 
    const [showForm, setShowForm] = useState(false);
    const [salesInvoices, setSalesInvoices] = useState<ReturnInvoice[]>([]);
    const [selectedInvoices, setSelectedInvoices] = useState<number[]>([]);
    const [editingInvoice, setEditingInvoice] = useState<ReturnInvoice | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [selectAll, setSelectAll] = useState(false);

    const [viewingSO, setViewingSO] = useState<viewingSO | null>(null);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);

    useEffect(() => {
        loadSalesInvoices();
    }, []);

    const loadSalesInvoices = async () => {
        try {
            const data = await getreturnFarmInvoices();
            setSalesInvoices(data);
            console.log(data);
        } catch (error) {
            console.error("Error loading sales invoices", error);
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

    const handleViewSI = (sales_return_id: number) => {
        const selectedSI = salesInvoices.find(si => si.sales_return_id === sales_return_id);
        if (selectedSI) {
            // Convert ReturnInvoice to viewingSO format if needed, or create a new viewing interface
            setViewingSO({
                sales_invoice_id: selectedSI.sales_invoice_id,
                sales_invoice_no: selectedSI.sales_invoice_no,
                dc_id: 0,
                customer_id: selectedSI.customer_id,
                customer_name: selectedSI.customer_name,
                branch_id: selectedSI.branch_id,
                branch_name: selectedSI.branch_name,
                flock_id: selectedSI.flock_id,
                flock_name: selectedSI.flock_name,
                invoice_date: selectedSI.invoice_date,
                sales_person_id: selectedSI.sales_person_id,
                sales_person_name: selectedSI.sales_person_name,
                receivable_account_id: 0,
                receivable_account_code: '',
                payment_term: '',
                credit_limit: 0,
                total_amount: selectedSI.total_amount,
                status: selectedSI.status,
                vehicle_no: selectedSI.vehicle_no || '',
                remarks: selectedSI.remarks,
                created_by: selectedSI.created_by,
                updated_by: selectedSI.updated_by,
                updated_date: selectedSI.updated_date,
                items: selectedSI.items.map(item => ({
                    item_id: item.item_id,
                    item_name: item.item_name,
                    uom: item.uom,
                    quantity: item.returned_qty, // Show returned quantity
                    unit_price: item.unit_price,
                    rate: item.rate,
                    amount: item.amount,
                    discount: item.discount,
                    discount_amount: item.discount_amount,
                    tax: item.tax,
                    tax_amount: item.tax_amount,
                    row_total: item.row_total,
                    returned_qty: item.returned_qty
                }))
            });
            setViewDialogOpen(true);
        }
    };

    // Handle individual checkbox selection
    const handleInvoiceSelect = (invoiceId: number, isSelected: boolean) => {
        if (isSelected) {
            setSelectedInvoices(prev => [...prev, invoiceId]);
        } else {
            setSelectedInvoices(prev => prev.filter(id => id !== invoiceId));
        }
    };

    // Handle select all checkbox
    const handleSelectAll = (isSelected: boolean) => {
        setSelectAll(isSelected);
        if (isSelected) {
            // Select all filtered invoices that are not already approved
            const allFilteredIds = filteredSI
                .filter(si => si.status !== 'APPROVED')
                .map(si => si.sales_return_id); // Use sales_return_id instead of sales_invoice_id
            setSelectedInvoices(allFilteredIds);
        } else {
            setSelectedInvoices([]);
        }
    };

    // Handle approve functionality - UPDATED to use sales_return_ids
    const handleApproveFarmInvoices = async () => {
        if (selectedInvoices.length === 0) {
            toast({
                title: "No Selection",
                description: "Please select at least one invoice to approve.",
                variant: "destructive",
                duration: 3000,
            });
            return;
        }

        try {
            await approveFarmInvoicesReturn(selectedInvoices);
            toast({
                title: "Approved",
                description: `${selectedInvoices.length} invoice(s) approved successfully.`,
                duration: 3000,
            });

            setSelectedInvoices([]); // Clear selection
            setSelectAll(false); // Uncheck select all
            loadSalesInvoices(); // Refresh list
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

    const handleSaveSI = async (payload: {
        sales_invoice_id: number,
        invoice_date: Date,
        return_date: Date,
        return_qty: number,
        discount: number,
        tax: number,
        company_id: number,
        branch_id: number,
        flock_id: number,
        total_qty: number,
        total_amount: number,
        remarks: string,
        created_by: number,
        items: ReturnItem[]
    }) => {
        try {
            const apiItems = (payload.items || []).map(it => ({
                item_id: it.item_id,
                returned_qty: it.returned_qty,
                unit_price: it.unit_price,
                discount: it.discount,
                tax: it.tax,
                uom: it.uom_id || 0 // You might need to adjust this based on your UOM structure
            }));

            await createreturnFarmInvoice(
                payload.sales_invoice_id,
                payload.invoice_date.toISOString().split('T')[0],
                payload.return_date.toISOString().split('T')[0],
                payload.return_qty,
                payload.discount,
                payload.tax,
                module_id || 0,
                payload.company_id,
                payload.branch_id,
                payload.flock_id,
                payload.total_qty,
                payload.total_amount,
                payload.remarks,
                payload.created_by,
                apiItems
            );
            toast({ title: "Created", description: "Sales Return Invoice created successfully!" });
            setShowForm(false);
            loadSalesInvoices();
        } catch (err) {
            console.error("Save Return SI failed", err);
            toast({ title: "Error", description: "Failed to create Sales Return Invoice.", variant: "destructive" });
        }
    };

    const handlePrint = (invoice: ReturnInvoice) => {
        const printWindow = window.open("", "_blank", "width=800,height=1000");
        const invoiceDate = new Date(invoice.invoice_date);
        const returnDate = new Date(invoice.return_date);
        const formattedInvoiceDate = `${invoiceDate.getDate()}-${invoiceDate.toLocaleString("default", {
            month: "short",
        })}-${String(invoiceDate.getFullYear()).slice(-2)}`;
        const formattedReturnDate = `${returnDate.getDate()}-${returnDate.toLocaleString("default", {
            month: "short",
        })}-${String(returnDate.getFullYear()).slice(-2)}`;

        const totalAmount = Number(invoice.total_amount || 0);
        const grandTotal = totalAmount;

        const numberToWords = (num: number) => {
            const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven',
                'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen',
                'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
            const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

            const convert = (n: number): string => {
                if (n < 20) return a[n];
                if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? ' ' + a[n % 10] : '');
                if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' and ' + convert(n % 100) : '');
                if (n < 100000) return convert(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + convert(n % 1000) : '');
                if (n < 10000000) return convert(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + convert(n % 100000) : '');
                return convert(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + convert(n % 10000000) : '');
            };

            return convert(num) + ' Only /-';
        };

        // --- Dynamic blank rows ---
        const maxVisibleRows = 12;
        const currentItemCount = invoice.items?.length || 0;
        const blankRowCount = Math.max(0, maxVisibleRows - currentItemCount);

        let blankRowsHtml = '';
        for (let i = 0; i < blankRowCount; i++) {
            blankRowsHtml += `
                <tr class="blank-row">
                    <td></td><td></td><td></td><td></td>
                    <td></td><td></td><td></td><td></td>
                </tr>
            `;
        }

        const printContent = `
            <html>
                <head>
                    <title>Sales Return Invoice #${invoice.return_no}</title>
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
                        .main-table .blank-row td {
                            border-top: none;
                            border-bottom: none;
                            border-left: 1px solid #000;
                            border-right: 1px solid #000;
                            height: 36px;
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
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div class="title">
                            <h2>Yasin Poultry Farm</h2>
                            <h4>Farm RETURN INVOICE</h4>
                        </div>
                    </div>

                    <div class="top-bar">
                        <div>Original Invoice Date: ${formattedInvoiceDate}</div>
                        <div>Return Invoice No: ${invoice.return_no}</div>
                    </div>
                    <div class="top-bar">
                        <div>Return Date: ${formattedReturnDate}</div>
                        <div>Original Invoice No: ${invoice.sales_invoice_no}</div>
                    </div>

                    <table class="details-table">
                        <tr>
                            <td><strong>Customer Name:</strong> ${invoice.customer_name || "N/A"}</td>
                            <td><strong>Farm:</strong> ${invoice.branch_name || "N/A"}</td>
                        </tr>
                        <tr>
                            <td><strong>Flock:</strong> ${invoice.flock_name || "N/A"}</td>
                            <td><strong>Sales Person:</strong> ${invoice.sales_person_name || "N/A"}</td>
                        </tr>
                        <tr>
                            <td><strong>Vehicle No:</strong> ${invoice.vehicle_no || "N/A"}</td>
                            <td><strong>Status:</strong> ${invoice.status || "N/A"}</td>
                        </tr>
                        <tr>
                            <td colspan="2"><strong>Return Remarks:</strong> ${invoice.remarks || "N/A"}</td>
                        </tr>
                    </table>

                    <div class="items-table">
                        <table class="main-table">
                            <thead>
                                <tr>
                                    <th>Sr#</th>
                                    <th>Item Name</th>
                                    <th>Unit</th>
                                    <th>Returned Quantity</th>
                                    <th>Unit Price</th>
                                    <th>Discount</th>
                                    <th>Tax</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${invoice.items?.map((item, index) => `
                                    <tr>
                                        <td>${index + 1}</td>
                                        <td class="text-left">${item.item_name || "N/A"}</td>
                                        <td>${item.uom || "N/A"}</td>
                                        <td>${item.returned_qty}</td>
                                        <td>${(item.rate || item.unit_price || 0).toLocaleString()}</td>
                                        <td>${(item.discount || 0).toLocaleString()}</td>
                                        <td>${(item.tax || 0).toLocaleString()}</td>
                                        <td>${(item.row_total || (item.returned_qty * (item.rate || item.unit_price || 0) - (item.discount || 0) + (item.tax || 0))).toLocaleString()}</td>
                                    </tr>
                                `).join('')}
                                ${blankRowsHtml}
                                <tr>
                                    <td colspan="7" style="text-align:right; font-weight:bold;">Grand Total:</td>
                                    <td style="font-weight:bold;">${grandTotal.toLocaleString()}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div class="footer">
                        Amount in Words: <span style="font-weight:900;+">${numberToWords(Math.round(grandTotal))}</span>
                    </div>

                    <div class="footer-note">
                        <p>This is a system generated sales return invoice and does not require signature or stamp.</p>
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
        const term = (searchTerm || "").toLowerCase(); // ensure not null
        return (
            (si.customer_name || "").toLowerCase().includes(term) ||
            si.return_no?.toString().includes(term) ||
            si.sales_invoice_no?.toString().includes(term)
        );
    });

    const totalSIs = salesInvoices.length;
    const createdSIs = salesInvoices.filter(si => si.status === 'CREATED').length;
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

    const handleFormClose = () => {
        setShowForm(false);
        setIsEditing(false);
        setEditingInvoice(null);
    };

    return (
        <div className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Package className="h-5 w-5" />
                            Farm Return Invoices
                        </CardTitle>
                        
                         {/* Action Buttons - Now includes Approve button */}
                            <div className="flex gap-2">
                            <Button
                            onClick={() => setShowForm(true)}
                            className="bg-purple-600 hover:bg-purple-700 text-white">
                            <Plus className="h-4 w-4 mr-2" />
                            Create Return Invoice
                            </Button>
                            
                            {/* Approve Button - Only show if there are selected invoices */}
                            {selectedInvoices.length > 0 && (
                                <Button
                                    onClick={handleApproveFarmInvoices}
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                    <Check className="h-4 w-4 mr-2" />
                                    Approve Selected ({selectedInvoices.length})
                                </Button>
                            )}
                            </div>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search Return Invoices..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-12">
                                    <Checkbox
                                        checked={selectAll}
                                        onCheckedChange={handleSelectAll}
                                        aria-label="Select all invoices"
                                    />
                                </TableHead>
                                {/* <TableHead>Return No</TableHead> */}
                                <TableHead>Original Invoice No</TableHead>
                                <TableHead>Return Date</TableHead>
                                <TableHead>Farm Name</TableHead>
                                <TableHead>Total Amount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredSI.map((si) => {
                                const isApproved = si.status === 'APPROVED';
                                const isSelected = selectedInvoices.includes(si.sales_return_id); // Use sales_return_id for selection
                                
                                return (
                                    <TableRow key={si.sales_return_id}>
                                        <TableCell>
                                            <Checkbox
                                                checked={isSelected}
                                                onCheckedChange={(checked) => 
                                                    handleInvoiceSelect(si.sales_return_id, checked as boolean) // Use sales_return_id
                                                }
                                                disabled={isApproved} // Disable checkbox for approved invoices
                                                aria-label={`Select invoice ${si.return_no}`}
                                            />
                                        </TableCell>
                                        {/* <TableCell className="font-medium">{si.return_no}</TableCell> */}
                                        <TableCell className="font-medium">{si.sales_invoice_no}</TableCell>
                                        <TableCell>{si.return_date ? new Date(si.return_date).toLocaleDateString() : ''}</TableCell>
                                        <TableCell className="font-medium">{si.branch_name}</TableCell>
                                        <TableCell>
                                        {Number(si.total_amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={getStatusColor(si.status)}>{si.status}</Badge>
                                        </TableCell>
                                        <TableCell className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleViewSI(si.sales_return_id)} // Use sales_return_id
                                                title="Show Details"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>

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
                    onClose={handleFormClose}
                    onSave={handleSaveSI}
                    module_id={module_id}
                    editingInvoice={null}
                    isEditing={false}
                />
            )}

            <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Sales Return Invoice Details</DialogTitle>
                    </DialogHeader>
                    {viewingSO && (
                        <>
                            <table className="w-full border border-gray-300 mb-4 text-sm">
                                <tbody>
                                    <tr>
                                        <td className="p-2 font-medium text-gray-600 border">
                                            Return Invoice Number</td>
                                        <td className="p-2 border">{viewingSO.sales_invoice_no}</td>
                                    </tr>
                                    <tr>
                                        <td className="p-2 font-medium text-gray-600 border">Original Invoice Date</td>
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
                                        <td className="p-2 font-medium text-gray-600 border">Status</td>
                                        <td className="p-2 border">{viewingSO.status}</td>
                                    </tr>
                                </tbody>
                            </table>
                            <h3 className="text-md font-semibold mb-2">Returned Items</h3>
                            <table className="w-full border border-gray-300 text-sm">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="p-2 border text-left">Item Name</th>
                                        <th className="p-2 border text-left">Returned Quantity</th>
                                        <th className="p-2 border text-left">Rate</th>
                                        <th className="p-2 border text-left">Row Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {viewingSO.items?.map((item, index) => (
                                        <tr key={index}>
                                            <td className="p-2 border">{item.item_name ?? '-'}</td>
                                            <td className="p-2 border">{item.quantity}</td>
                                            <td className="p-2 border">{(item.rate ?? item.unit_price ?? 0).toFixed ? (item.rate ?? item.unit_price ?? 0).toFixed(2) : (item.rate ?? item.unit_price ?? 0)}</td>
                                            <td className="p-2 border">{(item.row_total ?? ((item.quantity||0) * (item.rate ?? item.unit_price ?? 0) - (item.discount ?? 0) + (item.tax ?? 0))).toFixed ? (item.row_total ?? ((item.quantity||0) * (item.rate ?? item.unit_price ?? 0) - (item.discount ?? 0) + (item.tax ?? 0))).toFixed(2) : (item.row_total ?? ((item.quantity||0) * (item.rate ?? item.unit_price ?? 0) - (item.discount ?? 0) + (item.tax ?? 0)))}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {/* Remarks */}
                            <div className="mb-4">
                                <p><strong>Return Remarks:</strong> {viewingSO.remarks || "None"}</p>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );

};

interface ReturnItem {
    item_id: number;
    uom?: string;
    uom_id?: number;
    quantity?: number;
    returned_qty: number;
    rate?: number;
    unit_price?: number;
    amount?: number;
    discount?: number;
    discount_amount?: number;
    tax?: number;
    tax_amount?: number;
    row_total?: number;
    max_returnable?: number; // Maximum quantity that can be returned
}

interface SalesInvoiceFormProps {
    onClose: () => void;
    onSave: (payload: {
        sales_invoice_id: number;
        company_id: number;
        branch_id: number;
        flock_id: number;
        invoice_date: Date;
        return_date: Date;
        return_qty: number;
        discount: number;
        tax: number;
        total_qty: number;
        total_amount: number;
        remarks: string;
        created_by: number;
        items: ReturnItem[];
    }) => void;
    module_id: number | null;
    editingInvoice?: SalesInvoice | null;
    isEditing?: boolean;
}

export const SalesInvoiceForm: React.FC<SalesInvoiceFormProps> = ({ 
    onClose, 
    onSave, 
    module_id, 
    editingInvoice = null, 
    isEditing = false 
}) => {
    const [saleInvoices, setSaleInvoices] = useState<SalesInvoice[]>([]); // Original sales invoices for selection
    const [selectedInvoice, setSelectedInvoice] = useState<SalesInvoice | null>(null);
    const [companies, setCompanies] = useState<any[]>([]);
    const [branches, setBranches] = useState<any[]>([]);
    const [flocks, setFlock] = useState<any[]>([]);

    const [companyName, setCompanyName] = useState<string>('Ahmad Poultry');
    const [branchName, setBranchName] = useState<string>('');
    const [invoiceOpen, setInvoiceOpen] = useState(false);
    const [openFlock, setOpenFlock] = useState(false);

    const [sales_invoice_id, setSalesInvoiceId] = useState<number>(0);
    const [flock_id, setFlockid] = useState<any>(null);
    const [invoice_date, setInvoiceDate] = useState<Date>(new Date());
    const [return_date, setReturnDate] = useState<Date>(new Date());
    const [return_qty, setReturnQty] = useState<number>(0);
    const [discount, setDiscount] = useState<number>(0);
    const [tax, setTax] = useState<number>(0);
    const [total_qty, setTotalQty] = useState<number>(0);
    const [total_amount, setTotalAmount] = useState<number>(0);
    const [remarks, setRemarks] = useState<string>('');
    const [created_by, setCreatedBy] = useState<number>(1);

    const [returnItems, setReturnItems] = useState<ReturnItem[]>([]);

    // Load ORIGINAL sales invoices (not return invoices) for selection
    useEffect(() => {
        const load = async () => {
            try {
                const [invoicesRes, compRes, branchRes, flockRes] = await Promise.all([
                    getReturnSaleInvoices(), // Use getSaleInvoices instead of getreturnFarmInvoices
                    getCompanies(),
                    getBranches(),
                    getFlock()
                ]);

                // Filter only approved branches
                const approvedBranches = branchRes.filter((branch: any) => 
                    branch.status === 'APPROVED'
                );

                console.log("Original Sales Invoices:", invoicesRes); // Debug log
                console.log("Companies:", compRes); // Debug log to see company names

                setSaleInvoices(invoicesRes);
                setCompanies(compRes);
                setBranches(approvedBranches);
                setFlock(flockRes);

                // Auto-select "Ahmad Poultry" company if it exists
                const ahmadPoultryCompany = compRes.find(company => 
                    company.name?.toLowerCase().includes('ahmad poultry') || 
                    company.company_name?.toLowerCase().includes('ahmad poultry')
                );

                if (ahmadPoultryCompany) {
                    setCompanyName(ahmadPoultryCompany.name || ahmadPoultryCompany.company_name || 'Ahmad Poultry');
                } else if (compRes.length > 0) {
                    // If Ahmad Poultry not found, use the first company
                    const firstCompany = compRes[0];
                    setCompanyName(firstCompany.name || firstCompany.company_name || '');
                }

            } catch (err) {
                console.error('Failed to load form data', err);
                toast({ title: 'Error', description: 'Failed to load sales invoices/companies/branches', variant: 'destructive' });
            }
        };

        load();
    }, []);

    // When an invoice is selected, populate all fields with its data
    useEffect(() => {
        if (selectedInvoice) {
            setSalesInvoiceId(selectedInvoice.sales_invoice_id);
            setInvoiceDate(new Date(selectedInvoice.invoice_date));
            setReturnDate(new Date());
            setFlockid(selectedInvoice.flock_id);
            
            // Set company and branch names from the selected invoice
            // Keep the default company name "Ahmad Poultry" unless specifically overridden
            if (selectedInvoice.customer_name && !selectedInvoice.customer_name.toLowerCase().includes('ahmad poultry')) {
                // Only update if the customer name is different from our default
                setCompanyName(selectedInvoice.customer_name);
            }
            setBranchName(selectedInvoice.branch_name || '');
            
            // Calculate total returnable quantity and set up return items
            const totalReturnQty = selectedInvoice.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
            setTotalQty(totalReturnQty);
            setReturnQty(0); // Start with 0, will be calculated as user enters returned quantities
            
            const totalAmount = selectedInvoice.total_amount || 0;
            setTotalAmount(totalAmount);

            // Initialize return items with original item data and max returnable quantities
            const initialReturnItems: ReturnItem[] = selectedInvoice.items?.map(item => ({
                item_id: item.item_id,
                uom: item.uom,
                quantity: item.quantity,
                returned_qty: 0, // Start with 0 returned quantity
                rate: item.rate || item.unit_price || 0,
                unit_price: item.rate || item.unit_price || 0,
                discount: item.discount || 0,
                tax: item.tax || 0,
                amount: item.amount || 0,
                row_total: item.row_total || 0,
                max_returnable: item.quantity // Maximum that can be returned is the original quantity
            })) || [];

            setReturnItems(initialReturnItems);
        }
    }, [selectedInvoice]);

    // Calculate totals whenever return items change
    useEffect(() => {
        const { totalReturnQty, totalReturnAmount, totalDiscount, totalTax } = computeReturnTotals(returnItems);
        setReturnQty(totalReturnQty);
        setTotalAmount(totalReturnAmount);
        setDiscount(totalDiscount);
        setTax(totalTax);
    }, [returnItems]);

    // Helper to compute return totals
    const computeReturnTotals = (items: ReturnItem[]) => {
        let totalReturnQty = 0;
        let totalReturnAmount = 0;
        let totalDiscount = 0;
        let totalTax = 0;

        items.forEach(item => {
            const returnedQty = Number(item.returned_qty || 0);
            const rate = Number(item.rate || item.unit_price || 0);
            const itemAmount = returnedQty * rate;
            const itemDiscount = Number(item.discount || 0) * (returnedQty / (item.quantity || 1));
            const itemTax = Number(item.tax || 0) * (returnedQty / (item.quantity || 1));
            const itemTotal = itemAmount - itemDiscount + itemTax;

            totalReturnQty += returnedQty;
            totalReturnAmount += itemTotal;
            totalDiscount += itemDiscount;
            totalTax += itemTax;
        });

        return { totalReturnQty, totalReturnAmount, totalDiscount, totalTax };
    };

    const handleReturnQtyChange = (index: number, value: number) => {
        const copy = [...returnItems];
        const item = copy[index];
        
        // Ensure returned quantity doesn't exceed maximum returnable
        const maxReturnable = item.max_returnable || item.quantity || 0;
        const validValue = Math.min(Math.max(0, value), maxReturnable);
        
        copy[index] = { 
            ...item, 
            returned_qty: validValue 
        };
        
        setReturnItems(copy);
    };

    const handleSelectInvoice = (invoice: SalesInvoice) => {
        setSelectedInvoice(invoice);
        setInvoiceOpen(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedInvoice) {
            alert("Please select a sales invoice to return");
            return;
        }

        if (returnItems.length === 0 || returnItems.every(item => item.returned_qty === 0)) {
            alert("Please enter returned quantities for at least one item");
            return;
        }

        // Get the selected company and branch IDs
        const selectedCompany = companies.find(c => 
            c.name === companyName || 
            c.company_name === companyName
        );
        
        const selectedBranch = branches.find(b => 
            b.branch_name === branchName || 
            b.name === branchName
        );

        if (!selectedCompany?.id && !selectedCompany?.company_id) {
            alert("Please select a company");
            return;
        }
        
        if (!selectedBranch?.id && !selectedBranch?.branch_id) {
            alert("Please select a branch");
            return;
        }

        onSave({
            sales_invoice_id: selectedInvoice.sales_invoice_id,
            company_id: selectedCompany?.id || selectedCompany?.company_id || 0,
            branch_id: selectedBranch?.id || selectedBranch?.branch_id || 0,
            flock_id: module_id === 3 ? 0 : flock_id,
            invoice_date,
            return_date,
            return_qty,
            discount,
            tax,
            total_qty,
            total_amount,
            remarks,
            created_by,
            items: returnItems
        });
    };

    return (
        <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
            <div className="p-6 pt-2 max-w-6xl mx-auto">
                <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center">
                    Create Sales Return Invoice
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Top info box: Company / Branch / Date / Remarks */}
                    <div className="p-4 border border-gray-200 rounded-lg bg-white/50 space-y-4">
                        {/* Sales Invoice Selection */}
                        <div className="flex flex-col">
                            <span className="text-xs text-gray-500">Select Sales Invoice to Return *</span>
                            <Popover open={invoiceOpen} onOpenChange={setInvoiceOpen}>
                                <PopoverTrigger asChild>
                                    <Button type="button" variant="outline" className="w-full justify-between">
                                        {selectedInvoice ? `Invoice #${selectedInvoice.sales_invoice_no} - ${selectedInvoice.customer_name}` : 'Select Sales Invoice to Return'}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="max-h-[300px] overflow-auto">
                                    <Command>
                                        <CommandInput placeholder="Search invoices..." />
                                        <CommandEmpty>No invoices found</CommandEmpty>
                                        <CommandGroup>
                                            {saleInvoices.map((invoice) => (
                                                <CommandItem 
                                                    key={invoice.sales_invoice_id} 
                                                    onSelect={() => handleSelectInvoice(invoice)}
                                                >
                                                    <Check className={cn("mr-2 h-4 w-4", selectedInvoice?.sales_invoice_id === invoice.sales_invoice_id ? "opacity-100" : "opacity-0")} />
                                                    <div className="flex flex-col">
                                                        <span>Invoice #{invoice.sales_invoice_no}</span>
                                                        <span className="text-xs text-gray-500">
                                                            {invoice.customer_name} - {new Date(invoice.invoice_date).toLocaleDateString()} - Total: {invoice.total_amount}
                                                        </span>
                                                    </div>
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>

                        {/* Company and Branch fields (read-only when invoice is selected) */}
                        <div className={`grid ${module_id === 3 ? 'grid-cols-2' : 'grid-cols-3'} gap-4`}>
                            <div className="flex flex-col">
                                <span className="text-xs text-gray-500">Company Name</span>
                                <Input 
                                    readOnly 
                                    value={companyName} 
                                    className="bg-gray-100"
                                    placeholder="Ahmad Poultry"
                                />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs text-gray-500">Farm Name</span>
                                <Input 
                                    readOnly 
                                    value={branchName} 
                                    className="bg-gray-100"
                                />
                            </div>
                            
                            {/* Conditionally render Flock field based on module_id */}
                            {module_id !== 3 && (
                                <div className="flex flex-col">
                                    <span className="text-xs text-gray-500">Flock</span>
                                    <Input 
                                        readOnly 
                                        value={flocks.find(f => Number(f.flock_id) === flock_id)?.flock_name || ''} 
                                        className="bg-gray-100"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Dates */}
                        <div className="flex items-end space-x-4 w-full">
                            <div className="flex flex-col w-1/2">
                                <label className="block text-sm font-medium mb-1">Original Invoice Date</label>
                                <DatePicker
                                    selected={invoice_date}
                                    onChange={(date: Date) => setInvoiceDate(date)}
                                    customInput={
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className={cn(
                                                "w-full justify-start text-left font-normal bg-gray-100",
                                                !invoice_date && "text-muted-foreground"
                                            )}
                                            disabled
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {invoice_date ? format(invoice_date, "PPP") : <span>Pick a date</span>}
                                        </Button>
                                    }
                                />
                            </div>
                            <div className="flex flex-col w-1/2">
                                <label className="block text-sm font-medium mb-1">Return Date *</label>
                                <DatePicker
                                    selected={return_date}
                                    onChange={(date: Date) => setReturnDate(date)}
                                    customInput={
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !return_date && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {return_date ? format(return_date, "PPP") : <span>Pick a date</span>}
                                        </Button>
                                    }
                                />
                            </div>
                        </div>

                        {/* Remarks */}
                        <div className="flex flex-col">
                            <span className="text-xs text-gray-500">Return Remarks</span>
                            <textarea
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                                placeholder="Enter reason for return..."
                                className="p-2 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows={2}
                            />
                        </div>
                    </div>

                    {/* Items Section */}
                    {selectedInvoice && (
                        <div className="space-y-3">
                            <h3 className="text-lg font-semibold">Return Items</h3>
                            <p className="text-sm text-gray-600">
                                Enter returned quantities for each item. Maximum returnable quantity is shown for reference.
                            </p>
                            
                            {/* Table Headers */}
                            <div className="flex items-center gap-2 w-full text-xs font-bold text-gray-600 border-b pb-2">
                                <div className="w-2/5">Item</div>
                                <div className="w-1/12 text-center">UOM</div>
                                <div className="w-1/12 text-center">Original Qty</div>
                                <div className="w-1/12 text-center">Rate</div>
                                <div className="w-1/12 text-center">Return Qty *</div>
                                <div className="w-1/12 text-center">Max Returnable</div>
                                <div className="w-1/12 text-center">Return Amount</div>
                            </div>

                            {returnItems.map((item, idx) => {
                                const returnAmount = (item.returned_qty || 0) * (item.rate || item.unit_price || 0);
                                const maxReturnable = item.max_returnable || item.quantity || 0;
                                
                                return (
                                    <div key={idx} className="flex items-center gap-2 w-full">
                                        {/* Item Name (read-only) */}
                                        <div className="flex flex-col w-2/5">
                                            <Input
                                                type="text"
                                                className="w-full bg-gray-100"
                                                value={selectedInvoice.items?.find(i => i.item_id === item.item_id)?.item_name || ''}
                                                readOnly
                                            />
                                        </div>

                                        {/* UOM (read-only) */}
                                        <div className="flex flex-col w-1/12">
                                            <Input
                                                type="text"
                                                className="w-full text-center bg-gray-100"
                                                value={item.uom || ''}
                                                readOnly
                                            />
                                        </div>

                                        {/* Original Quantity (read-only) */}
                                        <div className="flex flex-col w-1/12">
                                            <Input
                                                type="number"
                                                className="w-full text-center bg-gray-100"
                                                value={item.quantity || 0}
                                                readOnly
                                            />
                                        </div>

                                        {/* Rate (read-only) */}
                                        <div className="flex flex-col w-1/12">
                                            <Input
                                                type="number"
                                                className="w-full text-center bg-gray-100"
                                                value={item.rate || item.unit_price || 0}
                                                readOnly
                                            />
                                        </div>

                                        {/* Return Quantity (editable) */}
                                        <div className="flex flex-col w-1/12">
                                            <Input
                                                type="number"
                                                className="w-full text-center"
                                                min={0}
                                                max={maxReturnable}
                                                step="0.01"
                                                value={item.returned_qty || 0}
                                                onChange={(e) => handleReturnQtyChange(idx, Number(e.target.value))}
                                                title={`Maximum returnable: ${maxReturnable}`}
                                            />
                                        </div>

                                        {/* Max Returnable (read-only) */}
                                        <div className="flex flex-col w-1/12">
                                            <Input
                                                type="number"
                                                className="w-full text-center bg-gray-100"
                                                value={maxReturnable}
                                                readOnly
                                            />
                                        </div>

                                        {/* Return Amount (computed, read-only) */}
                                        <div className="flex flex-col w-1/12">
                                            <div className="p-2 border rounded-md bg-gray-50 text-center">
                                                {returnAmount.toFixed(2)}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Totals Section */}
                    <div className="flex flex-col md:flex-row md:space-x-6 space-y-2 md:space-y-0 items-center justify-center text-gray-700 font-semibold">
                        <div className="flex justify-end font-semibold text-gray-700">
                            Total Return Qty: {return_qty}
                        </div>
                        <div className="flex justify-end font-semibold text-gray-700">
                            Total Return Amount: {total_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div className="flex justify-end font-semibold text-gray-700">
                            Total Discount: {discount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div className="flex justify-end font-semibold text-gray-700">
                            Total Tax: {tax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 justify-end">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button 
                            type="submit" 
                            className="flex-2 bg-gradient-to-r from-purple-500 to-purple-600"
                            disabled={!selectedInvoice || return_qty === 0}
                        >
                            Create Return
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SalesInvoice;