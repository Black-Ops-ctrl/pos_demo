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
import { Plus, Eye, Check, X, Edit, Trash2, Search, Package, ChevronsUpDown, Truck, CalendarIcon, Printer, RotateCcw, Undo } from 'lucide-react';
import { getCompanies } from '@/api/getCompaniesApi';
import { getBranches } from '@/api/branchApi';
import { Popover, PopoverContent, PopoverTrigger, } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { toast } from '../ui/use-toast';
import { getWarehouses } from '@/api/getWarehousesApi';
import { set } from 'date-fns';
import { getSaleInvoices } from '@/api/farmsinvoicesApi';

// Import return farm invoice APIs - ADD updateReturnFarmInvoice
import { getReturnFarmInvoices, createReturnFarmInvoice, approveFarmInvoicesReturn, getItemsfordiscount, updateReturnFarmInvoice } from '@/api/ReturnFarmInvoicesApi';

// New import for Checkbox
import { Checkbox } from '@/components/ui/checkbox';
import { getFlock } from '@/api/flockApi';
import { useNavigate } from 'react-router-dom';

interface ReturnFarmInvoice {
    tax: number;
    discount: number;
    sales_return_id: number;
    sales_return_no: number;
    sales_invoice_id: number;
    sales_invoice_no: number;
    branch_id: number;
    branch_name: string;
    flock_id: number;
    flock_name: string;
    invoice_date: Date; 
    return_date: Date;
    return_qty: number;
    total_qty: number;
    total_amount: number;
    status: string;
    remarks: string;
    created_by: number;
    updated_by: number;
    updated_date: Date;
    items: Array<{
        item_id: number; 
        item_name: string;
        uom?: string;
        returned_qty: number; 
        unit_price?: number; 
        rate?: number; 
        amount?: number; 
        discount: number; 
        discount_amount?: number; 
        tax: number; 
        tax_amount?: number; 
        row_total?: number;
        sales_return_item_id?: number;
        uom_name?: string;
    }>;
}

interface viewingReturn {
    sales_return_id: number;
    sales_return_no: number;
    sales_invoice_id: number;
    sales_invoice_no: number;
    branch_id: number;
    branch_name: string;
    flock_id: number;
    flock_name: string;
    invoice_date: Date;
    return_date: Date;
    return_qty: number;
    total_qty: number;
    total_amount: number;
    status: string;
    remarks: string;
    created_by: number;
    updated_by: number;
    updated_date: Date;
    items: Array<{
        item_id: number; 
        item_name: string;
        uom?: string;
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

const ReturnFarmInvoices: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingInvoice, setEditingInvoice] = useState<ReturnFarmInvoice | null>(null);
    const [returnInvoices, setReturnInvoices] = useState<ReturnFarmInvoice[]>([]);
    const [selectedInvoices, setSelectedInvoices] = useState<number[]>([]);
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [companyData, setCompanyData] = useState<any | null>(null);
    const [viewingReturn, setViewingReturn] = useState<viewingReturn | null>(null);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const navigate = useNavigate();

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
        loadReturnInvoices();
        loadCompanyImage(); 
    }, []);

    const loadReturnInvoices = async () => {
        try {
            const data = await getReturnFarmInvoices();
            setReturnInvoices(data);
            console.log(data);
        } catch (error) {
            console.error("Error loading return invoices", error);
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

    const handleApproveReturnInvoices = async () => {
        if (selectedInvoices.length === 0) return;

        try {
            await approveFarmInvoicesReturn(selectedInvoices);
            toast({
                title: "Approved",
                description: `${selectedInvoices.length} return invoice(s) approved successfully.`,
                duration: 3000,
            });

            setSelectedInvoices([]);
            loadReturnInvoices();
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to approve selected return invoices.",
                variant: "destructive",
                duration: 3000,
            });
            console.error("Error approving return invoices:", error);
        }
    };

    const handleViewReturn = (sales_return_id: number) => {
        const selectedReturn = returnInvoices.find(ri => ri.sales_return_id === sales_return_id);
        if (selectedReturn) {
            setViewingReturn(selectedReturn);
            setViewDialogOpen(true);
        }
    };

    const handleEditReturn = (sales_return_id: number) => {
        const selectedReturn = returnInvoices.find(ri => ri.sales_return_id === sales_return_id);
        if (selectedReturn) {
            setEditingInvoice(selectedReturn);
            setShowForm(true);
        }
    };

    const handleDeleteReturn = async (sales_return_id: number) => {
        if (!window.confirm('Are you sure you want to delete this return invoice?')) return;
        try {
            // Note: You'll need to implement deleteReturnFarmInvoice in your API if needed
            // const res = await deleteReturnFarmInvoice(sales_return_id);
            toast({ title: "Deleted", description: "Return invoice deleted successfully!" });
            loadReturnInvoices();
        } catch (error: any) {
            console.error('Failed to delete return invoice', error);
            toast({ title: "Error", description: `Failed to delete return invoice. ${error?.message ?? error}`, variant: "destructive" });
        }
    };

    const handleSaveReturn = async (payload: {
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
                unit_price: it.rate ?? it.amount ?? 0,
                discount: it.discount ?? 0,
                tax: it.tax ?? 0,
                uom: it.uom ? parseInt(it.uom) : 0
            }));

            await createReturnFarmInvoice(
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
            toast({ title: "Created", description: "Return Invoice created successfully!" });
            setShowForm(false);
            loadReturnInvoices();
        } catch (err) {
            console.error("Save Return failed", err);
            toast({ title: "Error", description: "Failed to create Return Invoice.", variant: "destructive" });
            throw err;
        }
    };

    // NEW FUNCTION: Handle Update Return Invoice
    const handleUpdateReturn = async (payload: {
        sales_return_id: number,
        sales_return_no: number,
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
                unit_price: it.rate ?? it.amount ?? 0,
                discount: it.discount ?? 0,
                tax: it.tax ?? 0,
                uom: it.uom ? parseInt(it.uom) : 0
            }));

            await updateReturnFarmInvoice(
                payload.sales_return_id,
                payload.sales_return_no,
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
            
            toast({ title: "Updated", description: "Return Invoice updated successfully!" });
            setShowForm(false);
            setEditingInvoice(null);
            loadReturnInvoices();
        } catch (err) {
            console.error("Update Return failed", err);
            toast({ title: "Error", description: "Failed to update Return Invoice.", variant: "destructive" });
            throw err;
        }
    };

const handlePrint = (invoice: ReturnFarmInvoice) => {
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

    const logoSource = companyData?.image ;
    const companyName = companyData?.company_name || "Yasin Poultry Farm & Broker";
    const companyAddress = companyData?.address || "";
    const companyPhone = companyData?.phone || "";
    const companyEmail = companyData?.email || "";
    const companyReg = companyData?.registration_number || "";

    const printContent = `
        <html>
            <head>
                <title>Return Invoice #${invoice.sales_return_no}</title>
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
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="title">
                        <h2>${companyName}</h2>
                        <div class="company-details">
                            ${companyAddress ? `<div>${companyAddress}</div>` : ''}
                            ${companyPhone ? `<div>${companyPhone} ${companyEmail ? '| ' + companyEmail : ''}</div>` : ''}
                            ${companyReg ? `<div>Reg: ${companyReg}</div>` : ''}
                        </div>
                        <h4>RETURN INVOICE</h4>
                    </div>
                </div>

                <div class="top-bar">
                    <div>Invoice Date: ${formattedInvoiceDate}</div>
                    <div>Return Date: ${formattedReturnDate}</div>
                    <div>Return No: ${invoice.sales_return_no}</div>
                </div>

                <table class="details-table">
                    <tr>
                        <td><strong>Original Invoice No:</strong> ${invoice.sales_invoice_no || "N/A"}</td>
                        <td><strong>Farm:</strong> ${invoice.branch_name || "N/A"}</td>
                    </tr>
                    <tr>
                        <td><strong>Flock:</strong> ${invoice.flock_name || "N/A"}</td>
                        <td><strong>Status:</strong> ${invoice.status || "N/A"}</td>
                    </tr>
                    <tr>
                        <td colspan="2"><strong>Remarks:</strong> ${invoice.remarks || "N/A"}</td>
                    </tr>
                </table>

                <div class="items-table">
                    <table class="main-table">
                        <thead>
                            <tr>
                                <th>Sr#</th>
                                <th>Item Name</th>
                                <th>Unit</th>
                                <th>Return Qty</th>
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
                            
                            <tr>
                                <td colspan="7" style="text-align:right; font-weight:bold;">Grand Total:</td>
                                <td style="font-weight:bold;">${grandTotal.toLocaleString()}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="footer">
                    Amount in Words: <span style="font-weight:900;">${numberToWords(Math.round(grandTotal))}</span>
                </div>

                <div class="footer-note">
                    <p>This is a system generated return invoice and does not require signature or stamp.</p>
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

    const filteredReturns = returnInvoices.filter((ri) => {
        const term = (searchTerm || "").toLowerCase();
        const statusMatch = statusFilter === 'ALL' || ri.status === statusFilter;
        
        return (
            statusMatch && (
            (ri.branch_name || "").toLowerCase().includes(term) ||
            ri.sales_return_no?.toString().includes(term) ||
            ri.sales_invoice_no?.toString().includes(term)
            )
        );
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'CREATED': return 'bg-gray-100 text-gray-800';
            case 'APPROVED': return 'bg-green-100 text-green-800';
            case 'CLOSED': return 'bg-blue-100 text-blue-800';
            case 'RETURNED': return 'bg-orange-100 text-orange-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const handleCheckboxChange = (sales_return_id: number, checked: boolean) => {
        const invoice = returnInvoices.find(ri => ri.sales_return_id === sales_return_id);

        if (invoice?.status === 'CANCELLED') {
            return;
        }

        if (checked) {
            setSelectedInvoices((prev) => [...prev, sales_return_id]);
        } else {
            setSelectedInvoices((prev) => prev.filter(id => id !== sales_return_id));
        }
    };

    return (
        <div className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <RotateCcw className="h-5 w-5" />
                            Return Farm Invoices
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
                            {selectedInvoices.some(sales_return_id => {
                                const invoice = returnInvoices.find(invoices => invoices.sales_return_id === sales_return_id);
                                return invoice?.status === 'CREATED';
                            }) && (
                                <Button
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                    onClick={handleApproveReturnInvoices}
                                >
                                    Approve ({selectedInvoices.length})
                                </Button>
                            )}

                            <Button
                                onClick={() => {
                                    setEditingInvoice(null);
                                    setShowForm(true);
                                }}
                                className="bg-purple-600 hover:bg-purple-700 text-white">
                                <Plus className="h-4 w-4 mr-2" />
                                Create Return
                            </Button>
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
                                <TableHead className='w-10'>
                                    <input
                                        type="checkbox"
                                        checked={
                                            selectedInvoices.length > 0 &&
                                            selectedInvoices.length === filteredReturns.filter(ri => ri.status === 'CREATED').length
                                        }
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedInvoices(filteredReturns.filter(ri => ri.status === 'CREATED').map((ri) => ri.sales_return_id));
                                            } else {
                                                setSelectedInvoices([]);
                                            }
                                        }}
                                        title="Select All CREATED"
                                        className="form-checkbox h-4 w-4 text-purple-600 transition duration-150 ease-in-out"
                                    />
                                </TableHead>
                                <TableHead>Return No</TableHead>
                                <TableHead>Invoice No</TableHead>
                                <TableHead>Return Date</TableHead>
                                <TableHead>Farm</TableHead>
                                <TableHead>Total Amount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredReturns.map((ri) => {
                                const isCancelled = ri.status === 'CANCELLED';
                                const isApproved = ri.status === 'APPROVED';
                                const isClosed = ri.status === 'CLOSED';
                                const isEditable = ri.status === 'CREATED';

                                return (
                                    <TableRow key={ri.sales_return_id}>
                                        <TableCell className='w-10'>
                                            <input
                                                type="checkbox"
                                                checked={selectedInvoices.includes(ri.sales_return_id)}
                                                disabled={ri.status !== 'CREATED'}
                                                onChange={(e) => {
                                                    const currentStatus = ri.status;
                                                    const selectedStatuses = selectedInvoices
                                                        .map(id => returnInvoices.find(inv => inv.sales_return_id === id)?.status)
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
                                                        setSelectedInvoices(prev => [...prev, ri.sales_return_id]);
                                                    } else {
                                                        setSelectedInvoices(prev =>
                                                            prev.filter(id => id !== ri.sales_return_id)
                                                        );
                                                    }
                                                }}
                                                className="form-checkbox h-4 w-4 text-purple-600 transition duration-150 ease-in-out"
                                            />
                                        </TableCell>
                                        <TableCell className="font-medium">{ri.sales_return_no}</TableCell>
                                        <TableCell>{ri.sales_invoice_no}</TableCell>
                                        <TableCell>{ri.return_date ? new Date(ri.return_date).toLocaleDateString() : ''}</TableCell>
                                        <TableCell>{ri.branch_name}</TableCell>
                                        <TableCell>{ri.total_amount}</TableCell>
                                        <TableCell>
                                            <Badge className={getStatusColor(ri.status)}>{ri.status}</Badge>
                                        </TableCell>
                                        <TableCell className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleViewReturn(ri.sales_return_id)}
                                                title="Show Details"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>

                                            {isEditable && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleEditReturn(ri.sales_return_id)}
                                                    title="Edit Return"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            )}

                                            {isEditable && (
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => handleDeleteReturn(ri.sales_return_id)}
                                                    title="Delete Return"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handlePrint(ri)}
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
                <ReturnFarmInvoiceForm
                    onClose={() => {
                        setShowForm(false);
                        setEditingInvoice(null);
                    }}
                    onSave={handleSaveReturn}
                    onUpdate={handleUpdateReturn} // ADDED: Pass update function
                    editingInvoice={editingInvoice}
                    module_id={module_id}
                />
            )}

            <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Return Farm Invoice Details</DialogTitle>
                    </DialogHeader>
                    {viewingReturn && (
                        <>
                            <table className="w-full border border-gray-300 mb-4 text-sm">
                                <tbody>
                                    <tr>
                                        <td className="p-2 font-medium text-gray-600 border">Return Number</td>
                                        <td className="p-2 border">{viewingReturn.sales_return_no}</td>
                                    </tr>
                                    <tr>
                                        <td className="p-2 font-medium text-gray-600 border">Original Invoice No</td>
                                        <td className="p-2 border">{viewingReturn.sales_invoice_no}</td>
                                    </tr>
                                    <tr>
                                        <td className="p-2 font-medium text-gray-600 border">Return Date</td>
                                        <td className="p-2 border">{viewingReturn.return_date ? new Date(viewingReturn.return_date).toLocaleDateString() : ''}</td>
                                    </tr>
                                    <tr>
                                        <td className="p-2 font-medium text-gray-600 border">Farm Name</td>
                                        <td className="p-2 border">{viewingReturn.branch_name}</td>
                                    </tr>
                                    <tr>
                                        <td className="p-2 font-medium text-gray-600 border">Status</td>
                                        <td className="p-2 border">{viewingReturn.status}</td>
                                    </tr>
                                    <tr>
                                        <td className="p-2 font-medium text-gray-600 border">Total Return Qty</td>
                                        <td className="p-2 border">{viewingReturn.return_qty}</td>
                                    </tr>
                                    <tr>
                                        <td className="p-2 font-medium text-gray-600 border">Total Amount</td>
                                        <td className="p-2 border">{viewingReturn.total_amount}</td>
                                    </tr>
                                </tbody>
                            </table>
                            <h3 className="text-md font-semibold mb-2">Return Items</h3>
                            <table className="w-full border border-gray-300 text-sm">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="p-2 border text-left">Item Name</th>
                                        <th className="p-2 border text-left">Return Qty</th>
                                        <th className="p-2 border text-left">Rate</th>
                                        <th className="p-2 border text-left">Row Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {viewingReturn.items?.map((item, index) => (
                                        <tr key={index}>
                                            <td className="p-2 border">{item.item_name ?? '-'}</td>
                                            <td className="p-2 border">{item.returned_qty}</td>
                                            <td className="p-2 border">{(item.rate ?? item.unit_price ?? 0).toFixed ? (item.rate ?? item.unit_price ?? 0).toFixed(2) : (item.rate ?? item.unit_price ?? 0)}</td>
                                            <td className="p-2 border">{(item.row_total ?? ((item.returned_qty || 0) * (item.rate ?? item.unit_price ?? 0) - (item.discount || 0) + (item.tax || 0))).toFixed ? (item.row_total ?? ((item.returned_qty || 0) * (item.rate ?? item.unit_price ?? 0) - (item.discount || 0) + (item.tax || 0))).toFixed(2) : (item.row_total ?? ((item.returned_qty || 0) * (item.rate ?? item.unit_price ?? 0) - (item.discount || 0) + (item.tax || 0)))}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className="mb-4">
                                <p><strong>Remarks:</strong> {viewingReturn.remarks || "None"}</p>
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
    returned_qty?: number;
    rate?: number;
    amount?: number;
    discount?: number;
    discount_amount?: number;
    tax?: number;
    tax_amount?: number;
    row_total?: number;
    sales_return_item_id?: number;
}

interface ReturnFarmInvoiceFormProps {
    onClose: () => void;
    onSave: (payload: {
        sales_invoice_id: number;
        invoice_date: Date;
        return_date: Date;
        return_qty: number;
        discount: number;
        tax: number;
        company_id: number;
        branch_id: number;
        flock_id: number;
        total_qty: number;
        total_amount: number;
        remarks: string;
        created_by: number;
        items: ReturnItem[];
    }) => void;
    onUpdate: (payload: { // ADDED: Update function prop
        sales_return_id: number;
        sales_return_no: number;
        sales_invoice_id: number;
        invoice_date: Date;
        return_date: Date;
        return_qty: number;
        discount: number;
        tax: number;
        company_id: number;
        branch_id: number;
        flock_id: number;
        total_qty: number;
        total_amount: number;
        remarks: string;
        created_by: number;
        items: ReturnItem[];
    }) => void;
    editingInvoice: ReturnFarmInvoice | null;
    module_id: number | null;
}

export const ReturnFarmInvoiceForm: React.FC<ReturnFarmInvoiceFormProps> = ({ 
    onClose, 
    onSave, 
    onUpdate, // ADDED: Receive update function
    editingInvoice, 
    module_id 
}) => {
    const [companies, setCompanies] = useState<any[]>([]);
    const [branches, setBranches] = useState<any[]>([]);
    const [flocks, setFlock] = useState<any[]>([]);
    const [filteredFlocks, setFilteredFlocks] = useState<any[]>([]);
    const [items, setItems] = useState<any[]>([]);
    const [saleInvoices, setSaleInvoices] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const [companyName, setCompanyName] = useState<string>('');
    const [branchName, setBranchName] = useState<string>('');
    const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);

    const [sales_invoice_id, setSalesInvoiceId] = useState<number | null>(null);
    const [invoice_date, setInvoiceDate] = useState<Date>(new Date());
    const [return_date, setReturnDate] = useState<Date>(new Date());
    const [return_qty, setReturnQty] = useState<number>(0);
    const [discount, setDiscount] = useState<number>(0);
    const [tax, setTax] = useState<number>(0);
    const [flock_id, setFlockid] = useState<any>(null);
    const [total_qty, setTotalQty] = useState<number>(0);
    const [total_amount, setTotalAmount] = useState<number>(0);
    const [remarks, setRemarks] = useState<string>('');
    const [created_by, setCreatedBy] = useState<number>(1);

    const [openFlock, setOpenFlock] = useState(false);
    const [itemDropdown, setItemDropdown] = useState<number | null>(null);

    const [returnItems, setReturnItems] = useState<ReturnItem[]>([{
        item_id: 0,
        uom: '',
        returned_qty: 0,
        rate: 0,
        amount: 0,
        discount: 0,
        discount_amount: 0,
        tax: 0,
        tax_amount: 0,
        row_total: 0
    }]);

    // Load companies, branches, flocks and sale invoices when the form mounts
    useEffect(() => {
        const load = async () => {
            try {
                const [compRes, branchRes, flockRes, invoicesRes] = await Promise.all([
                    getCompanies(),
                    getBranches(),
                    getFlock(),
                    getSaleInvoices()
                ]);

                const approvedBranches = branchRes.filter((branch: any) =>
                    branch.status === 'APPROVED'
                );

                const compList = Array.isArray(compRes) ? compRes : (compRes?.data ?? []);
                const flockList = Array.isArray(flockRes) ? flockRes : (flockRes?.data ?? []);
                const invoiceList = Array.isArray(invoicesRes) ? invoicesRes : (invoicesRes?.data ?? []);

                setCompanies(compList);
                setBranches(approvedBranches);
                setFlock(flockList);
                setSaleInvoices(invoiceList);
                setFilteredFlocks([]);

                try {
                    if (Array.isArray(compList) && compList.length === 1) {
                        const only = compList[0];
                        setCompanyName(only.name ?? only.company_name ?? '');
                    }
                } catch (e) {
                    // ignore
                }

            } catch (err) {
                console.error('Failed to load form data', err);
                toast({ title: 'Error', description: 'Failed to load companies/branches', variant: 'destructive' });
            }
        };

        load();
    }, []);

    // Load items when branch is selected
    useEffect(() => {
        const loadItemsForBranch = async () => {
            if (selectedBranchId) {
                try {
                    console.log("Loading items for branch:", selectedBranchId);
                    const itemsData = await getItemsfordiscount(selectedBranchId);
                    console.log("Items loaded:", itemsData);
                    setItems(Array.isArray(itemsData) ? itemsData : []);
                } catch (error) {
                    console.error("Failed to load items for branch:", selectedBranchId, error);
                    toast({ 
                        title: 'Error', 
                        description: 'Failed to load items for selected farm', 
                        variant: 'destructive' 
                    });
                    setItems([]);
                }
            } else {
                setItems([]);
            }
        };

        loadItemsForBranch();
    }, [selectedBranchId]);

    // Farm change hone par flocks update hone ke liye
    useEffect(() => {
        if (selectedBranchId) {
            // Flocks ko selected farm ke hisab se filter karo
            const farmSpecificFlocks = flocks.filter(flock => 
                Number(flock.branch_id) === Number(selectedBranchId)
            );
            setFilteredFlocks(farmSpecificFlocks);
            
            // Agar currently selected flock is farm ka nahi hai to reset karo
            if (flock_id && !farmSpecificFlocks.some(f => Number(f.flock_id) === Number(flock_id))) {
                setFlockid(null);
            }
            
            console.log(`Filtered flocks for branch ${selectedBranchId}:`, farmSpecificFlocks);
        } else {
            setFilteredFlocks([]);
            setFlockid(null);
        }
    }, [selectedBranchId, flocks, flock_id]);

    // Load editing invoice data when editingInvoice changes
    useEffect(() => {
        if (editingInvoice) {
            console.log('Loading editing return invoice:', editingInvoice);

            setSalesInvoiceId(editingInvoice.sales_invoice_id);
            setInvoiceDate(new Date(editingInvoice.invoice_date));
            setReturnDate(new Date(editingInvoice.return_date));
            setReturnQty(editingInvoice.return_qty);
            setDiscount(editingInvoice.discount || 0);
            setTax(editingInvoice.tax || 0);
            setTotalQty(editingInvoice.total_qty);
            setTotalAmount(editingInvoice.total_amount);
            setRemarks(editingInvoice.remarks || '');

            setCompanyName(editingInvoice.branch_name || '');
            setBranchName(editingInvoice.branch_name || '');
            setSelectedBranchId(editingInvoice.branch_id);
            setFlockid(editingInvoice.flock_id || null);

            // Farm select karne par automatically flocks load ho jayenge upar wale useEffect se

            if (editingInvoice.items && editingInvoice.items.length > 0) {
                const mappedItems = editingInvoice.items.map(item => {
                    console.log('Processing return item:', item);

                    const returned_qty = Number(item.returned_qty || 0);
                    const rate = Number(item.rate || item.unit_price || 0);
                    const amount = Number(item.amount || (returned_qty * rate));
                    const discount = Number(item.discount || 0);
                    const tax = Number(item.tax || 0);
                    const row_total = Number(item.row_total || (amount - discount + tax));

                    return {
                        item_id: item.item_id,
                        uom: item.uom || item.uom_name || '',
                        returned_qty: returned_qty,
                        rate: rate,
                        amount: amount,
                        discount: discount,
                        discount_amount: discount,
                        tax: tax,
                        tax_amount: tax,
                        row_total: row_total,
                        sales_return_item_id: item.sales_return_item_id,
                    } as ReturnItem;
                });

                console.log('Mapped return items for editing:', mappedItems);
                setReturnItems(mappedItems);
            } else {
                setReturnItems([{
                    item_id: 0,
                    uom: '',
                    returned_qty: 0,
                    rate: 0,
                    amount: 0,
                    discount: 0,
                    discount_amount: 0,
                    tax: 0,
                    tax_amount: 0,
                    row_total: 0
                }]);
            }
        } else {
            resetForm();
        }
    }, [editingInvoice]);

    const resetForm = () => {
        setSalesInvoiceId(null);
        setInvoiceDate(new Date());
        setReturnDate(new Date());
        setReturnQty(0);
        setDiscount(0);
        setTax(0);
        setTotalQty(0);
        setTotalAmount(0);
        setRemarks('');
        setCompanyName('');
        setBranchName('');
        setSelectedBranchId(null);
        setFlockid(null);
        setFilteredFlocks([]);
        setReturnItems([{
            item_id: 0,
            uom: '',
            returned_qty: 0,
            rate: 0,
            amount: 0,
            discount: 0,
            discount_amount: 0,
            tax: 0,
            tax_amount: 0,
            row_total: 0
        }]);
    };

    useEffect(() => {
        const { totalReturnQty, discountSum, taxSum, total } = computeReturnItems(returnItems);
        setReturnQty(totalReturnQty);
        setDiscount(discountSum);
        setTax(taxSum);
        setTotalAmount(total);
        setTotalQty(totalReturnQty);
    }, [returnItems]);

    const computeReturnItems = (items: ReturnItem[]) => {
        let totalReturnQty = 0;
        let discountSum = 0;
        let taxSum = 0;
        let total = 0;

        const computed = items.map((row) => {
            const returned_qty = Number(row.returned_qty || 0);
            const rate = Number(row.rate || 0);
            const amount = returned_qty * rate;
            
            // Calculate discount amount: (amount * discount_percentage) / 100
            const discountPercentage = Number(row.discount || 0);
            const discount_amount = (amount * discountPercentage) / 100;
            
            const tax_amount = Number(row.tax || 0);
            const row_total = amount - discount_amount + tax_amount;

            totalReturnQty += returned_qty;
            discountSum += discount_amount;
            taxSum += tax_amount;
            total += row_total;

            return {
                ...row,
                amount,
                discount_amount,
                tax_amount,
                row_total
            } as ReturnItem;
        });

        return { computed, totalReturnQty, discountSum, taxSum, total };
    };

    const addItemRow = () => {
        const next = [...returnItems, {
            item_id: 0,
            uom: '',
            returned_qty: 0,
            rate: 0,
            amount: 0,
            discount: 0,
            discount_amount: 0,
            tax: 0,
            tax_amount: 0,
            row_total: 0
        }];
        const { computed, totalReturnQty, discountSum, taxSum, total } = computeReturnItems(next);
        setReturnItems(computed);
    };

    const removeItemRow = (index: number) => {
        const next = returnItems.filter((_, i) => i !== index);
        const { computed, totalReturnQty, discountSum, taxSum, total } = computeReturnItems(next);
        setReturnItems(computed);
    };

    const handleSelectItem = (rowIndex: number, itemId: number) => {
        const copy = [...returnItems];
        const selectedItem = items.find((it) => Number(it.item_id) === Number(itemId));

        if (!selectedItem) return;

        const uomValue = selectedItem?.uom_name ?? selectedItem?.uom ?? selectedItem?.unit ?? '';
        const rateValue = selectedItem?.branch_specific_rate ?? 
                         selectedItem?.price ?? 
                         selectedItem?.rate ?? 
                         selectedItem?.unit_price ?? 
                         selectedItem?.default_rate ?? 0;
        const discountValue = selectedItem?.branch_specific_discount ?? 
                             selectedItem?.discount_percentage ?? 
                             selectedItem?.discount ?? 0;

        const qty = Number(copy[rowIndex]?.returned_qty ?? 0);

        copy[rowIndex] = {
            ...copy[rowIndex],
            item_id: Number(itemId),
            uom: uomValue,
            rate: Number(rateValue),
            discount: Number(discountValue),
            returned_qty: qty,
        } as ReturnItem;

        const { computed, totalReturnQty, discountSum, taxSum, total } = computeReturnItems(copy);
        setReturnItems(computed);
        setItemDropdown(null);
    };

    const handleChangeRow = (index: number, field: keyof ReturnItem, value: any) => {
        const copy = [...returnItems];
        const numericValue = ['returned_qty', 'rate', 'discount', 'tax'].includes(field)
            ? (value === '' ? 0 : Number(value))
            : value;

        copy[index] = {
            ...copy[index],
            [field]: numericValue
        } as ReturnItem;

        const { computed, totalReturnQty, discountSum, taxSum, total } = computeReturnItems(copy);
        setReturnItems(computed);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const selectedCompany = companies.find(c => c.name === companyName || c.company_name === companyName);
            const selectedBranch = branches.find(b => b.branch_name === branchName || b.name === branchName);

            if (!selectedCompany?.id && !selectedCompany?.company_id) {
                alert("Please select a company");
                return;
            }

            if (!selectedBranch?.id && !selectedBranch?.branch_id) {
                alert("Please select a farm");
                return;
            }

            if (returnItems.length === 0 || returnItems.some((r) => !r.item_id || r.item_id === 0 || r.returned_qty === undefined || r.returned_qty <= 0)) {
                alert("Add at least one item and ensure item and return quantity are valid.");
                return;
            }

            if (editingInvoice) {
                // UPDATE operation
                await onUpdate({
                    sales_return_id: editingInvoice.sales_return_id,
                    sales_return_no: editingInvoice.sales_return_no,
                    sales_invoice_id: sales_invoice_id || 0,
                    invoice_date,
                    return_date,
                    return_qty,
                    discount,
                    tax,
                    company_id: selectedCompany?.id || selectedCompany?.company_id || 0,
                    branch_id: selectedBranch?.id || selectedBranch?.branch_id || 0,
                    flock_id: module_id === 3 ? 0 : flock_id,
                    total_qty,
                    total_amount,
                    remarks,
                    created_by: editingInvoice.created_by || 1,
                    items: returnItems.map(it => ({
                        item_id: it.item_id,
                        uom: it.uom,
                        returned_qty: it.returned_qty,
                        rate: it.rate,
                        unit_price: it.rate,
                        amount: it.amount,
                        discount: it.discount,
                        discount_amount: it.discount_amount,
                        tax: it.tax,
                        tax_amount: it.tax_amount,
                        row_total: it.row_total,
                        sales_return_item_id: it.sales_return_item_id,
                    }))
                });
            } else {
                // CREATE operation
                await onSave({
                    sales_invoice_id: sales_invoice_id || 0,
                    invoice_date,
                    return_date,
                    return_qty,
                    discount,
                    tax,
                    company_id: selectedCompany?.id || selectedCompany?.company_id || 0,
                    branch_id: selectedBranch?.id || selectedBranch?.branch_id || 0,
                    flock_id: module_id === 3 ? 0 : flock_id,
                    total_qty,
                    total_amount,
                    remarks,
                    created_by,
                    items: returnItems.map(it => ({
                        item_id: it.item_id,
                        uom: it.uom,
                        returned_qty: it.returned_qty,
                        rate: it.rate,
                        unit_price: it.rate,
                        amount: it.amount,
                        discount: it.discount,
                        discount_amount: it.discount_amount,
                        tax: it.tax,
                        tax_amount: it.tax_amount,
                        row_total: it.row_total,
                    }))
                });
            }
        } catch (error) {
            console.error("Form submission error:", error);
            toast({ 
                title: 'Error', 
                description: 'Failed to submit form. Please try again.', 
                variant: 'destructive' 
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
            <div className="p-6 pt-2 max-w-6xl mx-auto">
                <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center">
                    {editingInvoice ? 'Edit Return Farm Invoice' : 'Create Return Farm Invoice'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="p-4 border border-gray-200 rounded-lg bg-white/50 space-y-4">
                        <div className={`grid ${module_id === 3 ? 'grid-cols-2' : 'grid-cols-3'} gap-4`}>
                            <div className="flex flex-col">
                                <span className="text-xs text-gray-500">Company Name</span>
                                {Array.isArray(companies) && companies.length === 1 ? (
                                    <Input readOnly value={companyName} />
                                ) : (
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button type="button" variant="outline" className="w-full justify-between">
                                                {companyName || 'Select Company'}
                                                <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="max-h-[300px] overflow-auto">
                                            <Command>
                                                <CommandInput placeholder="Search companies..." />
                                                <CommandEmpty>No company</CommandEmpty>
                                                <CommandGroup>
                                                    {companies.map((comp) => (
                                                        <CommandItem key={comp.id ?? comp.company_id} onSelect={() => setCompanyName(comp.name ?? comp.company_name ?? '')}>
                                                            {comp.name ?? comp.company_name}
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                )}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs text-gray-500">Farm Name</span>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button type="button" variant="outline" className="w-full justify-between">
                                            {branchName || 'Select Farm'}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="max-h-[300px] overflow-auto">
                                        <Command>
                                            <CommandInput placeholder="Search farms..." />
                                            <CommandEmpty>No farm</CommandEmpty>
                                            <CommandGroup>
                                                {branches.map((b) => (
                                                    <CommandItem 
                                                        key={b.id ?? b.branch_id} 
                                                        onSelect={() => {
                                                            setBranchName(b.branch_name ?? b.name ?? '');
                                                            const branchId = b.id || b.branch_id;
                                                            setSelectedBranchId(branchId);
                                                        }}
                                                    >
                                                        {b.branch_name ?? b.name}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </div>

                            {module_id !== 3 && (
                                <div className="flex flex-col">
                                    <span className="text-xs text-gray-500">Flock</span>
                                    <Popover open={openFlock} onOpenChange={setOpenFlock}>
                                        <PopoverTrigger asChild>
                                            <Button 
                                                variant="outline" 
                                                role="combobox" 
                                                className="w-full justify-between"
                                                disabled={!selectedBranchId}
                                            >
                                                {!selectedBranchId ? (
                                                    'Select Farm First'
                                                ) : filteredFlocks.length === 0 ? (
                                                    'No Flocks Available'
                                                ) : flock_id ? (
                                                    filteredFlocks.find((f) => Number(f.flock_id) === flock_id)?.flock_name ?? "Select Flock"
                                                ) : (
                                                    'Select Flock'
                                                )}
                                                <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="max-h-[300px] overflow-auto p-0">
                                            <Command>
                                                <CommandInput placeholder="Search flock..." />
                                                <CommandEmpty>
                                                    {!selectedBranchId 
                                                        ? 'Select a farm first' 
                                                        : filteredFlocks.length === 0 
                                                        ? 'No flocks found for this farm' 
                                                        : 'No matching flocks found'
                                                    }
                                                </CommandEmpty>
                                                <CommandGroup>
                                                    {filteredFlocks.map((f) => (
                                                        <CommandItem
                                                            key={f.flock_id}
                                                            onSelect={() => {
                                                                setFlockid(Number(f.flock_id));
                                                                setOpenFlock(false);
                                                            }}
                                                        >
                                                            <Check className={cn(
                                                                "mr-2 h-4 w-4", 
                                                                flock_id === Number(f.flock_id) ? "opacity-100" : "opacity-0"
                                                            )} />
                                                            {f.flock_name}
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="flex flex-col">
                                <label className="block text-sm font-medium mb-1">Return Date</label>
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

                        <div className="flex flex-col">
                            <span className="text-xs text-gray-500">Remarks</span>
                            <textarea
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                                className="p-2 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows={2}
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center gap-2 w-full text-xs font-bold text-gray-600 border-b pb-2">
                            <div className="w-1/4">Item</div>
                            <div className="w-1/12 text-center">UOM</div>
                            <div className="w-1/12 text-center">Return Qty</div>
                            <div className="w-1/12 text-center">Rate</div>
                            <div className="w-1/12 text-center">Discount%</div>
                            <div className="w-1/12 text-center">Discount Amount</div>
                            <div className="w-1/12 text-center">Tax</div>
                            <div className="w-1/12 text-center">Row Total</div>
                            <div className="w-[30px] text-center">Action</div>
                        </div>

                        {returnItems.map((row, idx) => {
                            const selected = items.find((it) => Number(it.item_id) === Number(row.item_id));
                            const displayName = selected?.item_name || selected?.display_name || 'Selected item';

                            return (
                                <div key={idx} className="flex items-center gap-2 w-full">
                                    <Popover open={itemDropdown === idx} onOpenChange={(open) => setItemDropdown(open ? idx : null)}>
                                        <PopoverTrigger asChild>
                                            <Button 
                                                type="button" 
                                                variant="outline" 
                                                className="w-1/4 justify-between"
                                                disabled={!selectedBranchId}
                                            >
                                                {!selectedBranchId ? (
                                                    'Select Farm First'
                                                ) : row.item_id ? (
                                                    <div className="flex items-center justify-between w-full">
                                                        <span className="truncate">{displayName}</span>
                                                        <span className="ml-2 text-sm text-gray-500">
                                                            {Number(row.rate || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    'Select Item'
                                                )}
                                                <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>

                                        <PopoverContent className="w-[420px] max-h-[300px] overflow-auto">
                                            <Command>
                                                <CommandInput placeholder="Search items..." />
                                                <CommandEmpty>No items found{!selectedBranchId ? ' - Select a farm first' : ''}</CommandEmpty>

                                                <CommandGroup>
                                                    {items.map((it) => {
                                                        const price = it.branch_specific_rate ?? it.price ?? it.rate ?? it.unit_price ?? it.default_rate ?? 0;
                                                        const discount = it.branch_specific_discount ?? it.discount_percentage ?? it.discount ?? 0;

                                                        return (
                                                            <CommandItem
                                                                key={it.item_id}
                                                                onSelect={() => handleSelectItem(idx, Number(it.item_id))}
                                                            >
                                                                <Check
                                                                    className={cn(
                                                                        "mr-2 h-4 w-4",
                                                                        row.item_id === Number(it.item_id) ? "opacity-100" : "opacity-0"
                                                                    )}
                                                                />

                                                                <div className="flex justify-between items-center w-full">
                                                                    <span className="truncate">{it.item_name}</span>

                                                                    <div className="flex flex-col text-xs text-gray-500 ml-2 text-right">
                                                                        <span>
                                                                            Price: {Number(price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                                        </span>
                                                                        <span>Discount: {Number(discount).toFixed(2)}%</span>
                                                                    </div>
                                                                </div>
                                                            </CommandItem>
                                                        );
                                                    })}
                                                </CommandGroup>
                                            </Command>
                                        </PopoverContent>
                                    </Popover> 

                                    <div className="flex flex-col w-1/12">
                                        <Input
                                            type="text"
                                            className="w-full text-center"
                                            value={row.uom || ''}
                                            readOnly
                                            placeholder="UOM"
                                        />
                                    </div>

                                    <div className="flex flex-col w-1/12">
                                        <Input
                                            type="number"
                                            className="w-full text-center"
                                            min={0}
                                            step="1"
                                            value={row.returned_qty || 0}
                                            onChange={(e) => handleChangeRow(idx, "returned_qty", e.target.value)}
                                        />
                                    </div>

                                    <div className="flex flex-col w-1/12">
                                        <Input
                                            type="number"
                                            className="w-full text-center"
                                            min={0}
                                            step="0.01"
                                            value={row.rate || 0}
                                            onChange={(e) => handleChangeRow(idx, "rate", e.target.value)}
                                        />
                                    </div>

                                    <div className="flex flex-col w-1/12">
                                        <Input
                                            type="number"
                                            className="w-full text-center"
                                            min={0}
                                            step="0.01"
                                            value={row.discount || 0}
                                            onChange={(e) => handleChangeRow(idx, "discount", e.target.value)}
                                        />
                                    </div>

                                    <div className="flex flex-col w-1/12">
                                        <div className="p-2 border rounded-md bg-gray-50 text-center">
                                            {Number(row.discount_amount || 0).toFixed(2)}
                                        </div>
                                    </div>

                                    <div className="flex flex-col w-1/12">
                                        <Input
                                            type="number"
                                            className="w-full text-center"
                                            min={0}
                                            step="0.01"
                                            value={row.tax || 0}
                                            onChange={(e) => handleChangeRow(idx, "tax", e.target.value)}
                                        />
                                    </div>

                                    <div className="flex flex-col w-1/12">
                                        <div className="p-2 border rounded-md bg-gray-50 text-center">
                                            {Number(row.row_total || 0).toFixed(2)}
                                        </div>
                                    </div>

                                    {returnItems.length > 1 && (
                                        <Button type="button" variant="destructive" size="icon" onClick={() => removeItemRow(idx)} className="w-[30px]">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            );
                        })}
                        <Button type="button" variant="secondary" onClick={addItemRow}>
                            + Add Item
                        </Button>
                    </div>

                    <div className="flex flex-col md:flex-row md:space-x-6 space-y-2 md:space-y-0 items-center justify-center text-gray-700 font-semibold">
                        <div className="flex justify-end font-semibold text-gray-700">
                            Total Return Qty: {return_qty.toLocaleString()}
                        </div>
                        <div className="flex justify-end font-semibold text-gray-700">
                            Total Amount: {total_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div className="flex justify-end font-semibold text-gray-700">
                            Total Discount: {discount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div className="flex justify-end font-semibold text-gray-700">
                            Total Tax: {tax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                    </div>

                    <div className="flex gap-2 justify-end">
                        <Button 
                            type="button" 
                            variant="outline" 
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button 
                            type="submit" 
                            className="flex-2 bg-gradient-to-r from-blue-500 to-blue-600"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    {editingInvoice ? 'Updating...' : 'Saving...'}
                                </>
                            ) : (
                                editingInvoice ? 'Update' : 'Save'
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReturnFarmInvoices;