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
import { getSaleInvoices, createSalesInvoice, deleteSalesInvoice, approveSaleInvoices, unapproveSaleInvoices, updateSalesInvoice, ReturnSaleInvoices, getItemsfordiscount,getCompanyimg } from '@/api/farmsinvoicesApi';

// New import for Checkbox
import { Checkbox } from '@/components/ui/checkbox';
import { getFlock } from '@/api/flockApi';
import AhmadPoultryLogo from '@/assets/AhmadPoultryLogo.png';
import { useNavigate } from 'react-router-dom';

interface SalesInvoice {
    sales_invoice_id: number;
    sales_invoice_no: number;
    dc_id: number;
    branch_id: number;
    branch_name: string;
    flock_id: number;
    flock_name: string;
    invoice_date: Date;
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
        discount_percentage: number;
        item_id: number; item_name: string;
        uom?: string;
        quantity: number; unit_price?: number; rate?: number; amount?: number; discount: number; discount_amount?: number; tax: number; tax_amount?: number; row_total?: number;
    }>;
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
    branch_id: number;
    branch_name: string;
    flock_id: number;
    flock_name: string;
    invoice_date: Date;
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
        item_id: number; item_name: string;
        uom?: string;
        quantity: number; unit_price?: number; rate?: number; amount?: number; discount: number; discount_amount?: number; tax: number; tax_amount?: number; row_total?: number;
    }>;
}

const SalesInvoice: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingInvoice, setEditingInvoice] = useState<SalesInvoice | null>(null);
    const [salesInvoices, setSalesInvoices] = useState<SalesInvoice[]>([]);
    const [selectedInvoices, setSelectedInvoices] = useState<number[]>([]);
    const [statusFilter, setStatusFilter] = useState<string>('CREATED');
    const [companyData, setCompanyData] = useState<CompanyData | null>(null);
    const [viewingSO, setViewingSO] = useState<viewingSO | null>(null);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
   
const [startDate, setStartDate] = useState<string>(() => {
  const today = new Date().toISOString().split('T')[0];
  return today;
});
const [endDate, setEndDate] = useState<string>(() => {
  const today = new Date().toISOString().split('T')[0];
  return today;
});    
const permissions = JSON.parse(
  sessionStorage.getItem('role_permissions') || '{}'
);
const [dateError, setDateError] = useState<string>('');
    const [farmFilter, setFarmFilter] = useState<string>('ALL');
    const [flockFilter, setFlockFilter] = useState<string>('ALL');
    const [farmSearchTerm, setFarmSearchTerm] = useState<string>('');
    const [allBranches, setAllBranches] = useState<any[]>([]);
    const [allFlocks, setAllFlocks] = useState<any[]>([]);
    const [filteredFlocks, setFilteredFlocks] = useState<any[]>([]);
    const navigate = useNavigate();

    // Search state for farm filter

    // Filter branches based on search term
    const filteredBranches = allBranches.filter(branch => {
        const branchName = branch.branch_name || branch.name || '';
        return branchName.toLowerCase().includes(farmSearchTerm.toLowerCase());
    });

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

    const loadBranches = async () => {
        try {
            const data = await getBranches();
            const approvedBranches = data.filter((branch: any) => branch.status === 'APPROVED');
            setAllBranches(approvedBranches);
        } catch (error) {
            console.error("Error loading branches", error);
        }
    };

    const loadFlocks = async () => {
        try {
            const data = await getFlock();
            const flockList = Array.isArray(data) ? data : (data?.data ?? []);
            setAllFlocks(flockList);
        } catch (error) {
            console.error("Error loading flocks", error);
        }
    };

    const loadSalesInvoices = async (branchId?: number) => {
        // Check if both dates are selected
        if (!startDate || !endDate) {
            setSalesInvoices([]); // Clear data if dates not selected
            setDateError('Please select both start and end dates');
            return;
        }

        // Validate date range
        if (startDate > endDate) {
            setDateError('Start date cannot be after end date');
            setSalesInvoices([]);
            return;
        }

        setDateError('');
        
        try {
            // Format dates as YYYY-MM-DD
            const formattedStartDate = format(startDate, 'yyyy-MM-dd');
            const formattedEndDate = format(endDate, 'yyyy-MM-dd');
            
            const data = await getSaleInvoices(formattedStartDate, formattedEndDate, branchId);
            setSalesInvoices(data);
            console.log(data);
        } catch (error) {
            console.error("Error loading sales invoices", error);
            toast({
                title: "Error",
                description: "Failed to load sales invoices",
                variant: "destructive",
                duration: 3000,
            });
        }
    };

    const handleDateFilter = () => {
        if (farmFilter === 'ALL') {
            loadSalesInvoices();
        } else {
            const selectedBranch = allBranches.find(branch => 
                branch.branch_name === farmFilter || branch.name === farmFilter
            );
            if (selectedBranch) {
                const branchId = selectedBranch.id || selectedBranch.branch_id;
                loadSalesInvoices(branchId);
            }
        }
    };

    const clearDateFilter = () => {
        setStartDate(null);
        setEndDate(null);
        setSalesInvoices([]);
        setDateError('');
    };

    useEffect(() => {
        loadCompanyImage();
        loadBranches();
        loadFlocks();
    }, []);

    // Update filtered flocks when farm filter changes
    useEffect(() => {
        if (farmFilter === 'ALL') {
            setFilteredFlocks([]);
            setFlockFilter('ALL');
        } else {
            const selectedBranch = allBranches.find(branch => 
                branch.branch_name === farmFilter || branch.name === farmFilter
            );
            if (selectedBranch) {
                const branchId = selectedBranch.id || selectedBranch.branch_id;
                const flocksForBranch = allFlocks.filter(flock => 
                    Number(flock.branch_id) === Number(branchId)
                );
                setFilteredFlocks(flocksForBranch);
                // Reset flock filter when farm changes
                setFlockFilter('ALL');
            }
        }
    }, [farmFilter, allBranches, allFlocks]);

    // Load invoices when farm filter changes
    useEffect(() => {
        if (startDate && endDate) {
            if (farmFilter === 'ALL') {
                loadSalesInvoices();
            } else {
                const selectedBranch = allBranches.find(branch => 
                    branch.branch_name === farmFilter || branch.name === farmFilter
                );
                if (selectedBranch) {
                    const branchId = selectedBranch.id || selectedBranch.branch_id;
                    loadSalesInvoices(branchId);
                }
            }
        }
    }, [farmFilter]);

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

    // Filter sales invoices based on both farm and flock filters
    const filteredSI = salesInvoices.filter((si) => {
        const term = (searchTerm || "").toLowerCase();
        const statusMatch = statusFilter === 'ALL' || si.status === statusFilter;
        const farmMatch = farmFilter === 'ALL' || si.branch_name === farmFilter;
        const flockMatch = flockFilter === 'ALL' || si.flock_name === flockFilter;
        
        return (
            statusMatch && farmMatch && flockMatch && (
            (si.branch_name || "").toLowerCase().includes(term) ||
            si.sales_invoice_no?.toString().includes(term) ||
             (si.flock_name || "").toLowerCase().includes(term)
            )
        );
    });
    
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
            handleDateFilter();
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

    const handleReturnSaleInvoices = async () => {
        if (selectedInvoices.length === 0) return;

        try {
            await ReturnSaleInvoices(selectedInvoices);
            toast({
                title: "Returned",
                description: `${selectedInvoices.length} invoice(s) Returned successfully.`,
                duration: 3000,
            });

            setSelectedInvoices([]);
            handleDateFilter();
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to Returned selected invoices.",
                variant: "destructive",
                duration: 3000,
            });
            console.error("Error Returning invoices:", error);
        }
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
            handleDateFilter();
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


const handleEditSI = async (sales_invoice_id: number) => {
    const selectedSI = salesInvoices.find(si => si.sales_invoice_id === sales_invoice_id);
    if (selectedSI) {
        try {
            // Fetch items for the branch to get UOM and stock info
            const branchItems = await getItemsfordiscount(selectedSI.branch_id);
            
            // Map the existing items with additional details
            const enrichedItems = selectedSI.items.map(item => {
                const matchingItem = branchItems.find((branchItem: any) => 
                    Number(branchItem.item_id) === Number(item.item_id)
                );
                
                // Check if the original item has discount data
                const originalDiscount = item.discount_percentage || item.discount || 0;
                
                return {
                    ...item,
                    item_name: item.item_name || matchingItem?.item_name,
                    uom: matchingItem?.uom_name || matchingItem?.uom || '',
                    discount: originalDiscount, // IMPORTANT: Map discount_percentage to discount
                    stock_quantity: matchingItem?.stock_quantity || 
                                   matchingItem?.available_quantity || 
                                   matchingItem?.qty_on_hand || 
                                   0
                };
            });

            // Create the enriched invoice object
            const enrichedSI = {
                ...selectedSI,
                items: enrichedItems
            };

            // Store in local storage
            localStorage.setItem('editingSalesInvoice', JSON.stringify(enrichedSI));
            
            setEditingInvoice(enrichedSI);
            setShowForm(true);
        } catch (error) {
            console.error("Error fetching item details for editing:", error);
            toast({
                title: "Error",
                description: "Failed to load item details for editing",
                variant: "destructive",
                duration: 3000,
            });
        }
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
            handleDateFilter();
        } catch (error: any) {
            console.error('Failed to delete invoice', error);
            toast({ title: "Error", description: `Failed to delete invoice. ${error?.message ?? error}`, variant: "destructive" });
        }
    };

    const handleSaveSI = async (payload: {
        dc_id?: number,
        company_id: number,
        branch_id: number,
        flock_id: number,
        invoice_date: Date,
        status: string,
        vehicle_no: string,
        remarks: string,
        created_by: number,
        total_amount: number,
        items: SIItem[]
    }) => {
        try {
            const apiItems = (payload.items || []).map(it => ({
                item_id: it.item_id,
                quantity: it.quantity,
                unit_price: it.rate ?? it.amount ?? 0,
                discount_percentage: it.discount ?? 0,
                discount_amount: it.discount_amount ?? 0,
                tax: it.tax ?? 0,
            }));

            await createSalesInvoice(
                payload.invoice_date,
                payload.status,
                payload.vehicle_no,
                payload.remarks,
                payload.created_by,
                payload.total_amount,
                payload.company_id,
                payload.branch_id,
                payload.flock_id,
                apiItems
            );
            toast({ title: "Created", description: "Sales Invoice created successfully!" });
            setShowForm(false);
            handleDateFilter();
        } catch (err) {
            console.error("Save SI failed", err);
            toast({ title: "Error", description: "Failed to create Sales Invoice.", variant: "destructive" });
            throw err;
        }
    };

    const handleUpdateSI = async (payload: {
        sales_invoice_id: number,
        dc_id?: number,
        company_id: number,
        branch_id: number,
        flock_id: number,
        invoice_date: Date,
        status: string,
        vehicle_no: string,
        remarks: string,
        updated_by: number,
        total_amount: number,
        items: SIItem[]
    }) => {
        try {
            const apiItems = (payload.items || []).map(it => ({
                item_id: it.item_id,
                quantity: it.quantity,
                unit_price: it.rate ?? it.amount ?? 0,
                discount_percentage: it.discount ?? 0,
                discount_amount: it.discount_amount ?? 0,
                tax: it.tax ?? 0,
            }));

            await updateSalesInvoice(
                payload.sales_invoice_id,
                payload.invoice_date,
                payload.status,
                payload.vehicle_no,
                payload.remarks,
                payload.updated_by,
                payload.total_amount,
                payload.company_id,
                payload.branch_id,
                payload.flock_id,
                apiItems
            );
            toast({ title: "Updated", description: "Sales Invoice updated successfully!" });
            setShowForm(false);
            setEditingInvoice(null);
            handleDateFilter();
        } catch (err) {
            console.error("Update SI failed", err);
            toast({ title: "Error", description: "Failed to update Sales Invoice.", variant: "destructive" });
            throw err;
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

    const logoSource = companyData?.image || AhmadPoultryLogo;
    const companyName = companyData?.company_name || "Ahmad Poultry Farm";
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
                        display: flex;
                        justify-content: space-between;
                        margin-top: 40px;
                        padding-top: 20px;
                        border-top: 1px solid #000;
                    }
                    .signature-box {
                        text-align: center;
                        width: 45%;
                    }
                    .signature-line {
                        width: 80%;
                        height: 1px;
                        background-color: #000;
                        margin: 40px auto 5px auto;
                    }
                    .signature-label {
                        font-weight: bold;
                        margin-top: 5px;
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
                            ${companyReg ? `<div>Reg: ${companyReg}</div>` : ''}
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
                        <td><strong>Farm:</strong> ${invoice.branch_name || "N/A"}</td>
                        <td><strong>Flock:</strong> ${invoice.flock_name || "N/A"}</td>
                    </tr>
                    <tr>
                        <td><strong>Vehicle No:</strong> ${invoice.vehicle_no || "N/A"}</td>
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
                                <th>Quantity</th>
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
                                    <td>${item.quantity}</td>
                                    <td>${(item.rate || item.unit_price || 0).toLocaleString()}</td>
                                    <td>${(item.discount_percentage || 0).toLocaleString()}</td>
                                    <td>${(item.tax || 0).toLocaleString()}</td>
                                    <td>${(item.row_total || (item.quantity * (item.rate || item.unit_price || 0) - (item.discount || 0) + (item.tax || 0))).toLocaleString()}</td>
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

                <div class="signature-section">
                    <div class="signature-box">
                        <div class="signature-line"></div>
                        <div class="signature-label">Created By: ${invoice.created_by || "N/A"}</div>
                    </div>
                    <div class="signature-box">
                        <div class="signature-line"></div>
                        <div class="signature-label">Received By</div>
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
                            Farm Invoices
                        </CardTitle>

                        <div className="flex gap-4 items-center">

                            {/* Status Filter Dropdown */}
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
                                salesInvoices.find(invoice => invoice.sales_invoice_id === id)?.status === 'CREATED'
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
                    
                    {/* Date Filter Section */}
                    <div className="flex flex-col md:flex-row gap-4 mt-4 mb-4 p-4 border rounded-lg bg-gray-50">
                        <div className="flex-1">
                            <Label htmlFor="start-date">Start Date</Label>
                            <DatePicker
                                id="start-date"
                                selected={startDate}
                                onChange={(date: Date | null) => setStartDate(date)}
                                selectsStart
                                startDate={startDate}
                                endDate={endDate}
                                maxDate={endDate || new Date()}
                                customInput={
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full justify-start text-left font-normal"
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {startDate ? format(startDate, "PPP") : "Select start date"}
                                    </Button>
                                }
                            />
                        </div>
                        <div className="flex-1">
                            <Label htmlFor="end-date">End Date</Label>
                            <DatePicker
                                id="end-date"
                                selected={endDate}
                                onChange={(date: Date | null) => setEndDate(date)}
                                selectsEnd
                                startDate={startDate}
                                endDate={endDate}
                                minDate={startDate}
                                maxDate={new Date()}
                                customInput={
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full justify-start text-left font-normal"
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {endDate ? format(endDate, "PPP") : "Select end date"}
                                    </Button>
                                }
                            />
                        </div>
                        <div className="flex items-end gap-2">
                            <Button
                                onClick={handleDateFilter}
                                disabled={!startDate || !endDate}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                <Search className="h-4 w-4 mr-2" />
                                Filter
                            </Button>
                            <Button
                                onClick={clearDateFilter}
                                variant="outline"
                                className="border-gray-300"
                            >
                                <RotateCcw className="h-4 w-4 mr-2" />
                                Clear
                            </Button>
                        </div>
                    </div>
                    
                    {dateError && (
                        <div className="mb-4 p-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded">
                            {dateError}
                        </div>
                    )}
                    
                    <div className="relative mt-4">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search Invoices..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    {startDate && endDate ? (
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
                                    <TableHead>Farm</TableHead>
                                    <TableHead>Flock</TableHead>
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
                                                        const selectedStatuses = selectedInvoices
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
                                            <TableCell>{si.branch_name}</TableCell>
                                            <TableCell>{si.flock_name || "N/A"}</TableCell>
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
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                            <p>Please select start and end dates to view invoices</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {showForm && (
                <SalesInvoiceForm
                    onClose={() => {
                        setShowForm(false);
                        setEditingInvoice(null);
                    }}
                    onSave={handleSaveSI}
                    onUpdate={handleUpdateSI}
                    editingInvoice={editingInvoice}
                    module_id={module_id}
                />
            )}

            <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Farm Invoice Details</DialogTitle>
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
                                        <td className="p-2 font-medium text-gray-600 border">Farm Name</td>
                                        <td className="p-2 border">{viewingSO.branch_name}</td>
                                    </tr>
                                    <tr>
                                        <td className="p-2 font-medium text-gray-600 border">Flock Name</td>
                                        <td className="p-2 border">{viewingSO.flock_name || "N/A"}</td>
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
                                        <th className="p-2 border text-left">Row Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {viewingSO.items?.map((item, index) => (
                                        <tr key={index}>
                                            <td className="p-2 border">{item.item_name ?? '-'}</td>
                                            <td className="p-2 border">{item.quantity}</td>
                                            <td className="p-2 border">{(item.rate ?? item.unit_price ?? 0).toFixed ? (item.rate ?? item.unit_price ?? 0).toFixed(2) : (item.rate ?? item.unit_price ?? 0)}</td>
                                            <td className="p-2 border">{(item.row_total ?? ((item.quantity || 0) * (item.rate ?? item.unit_price ?? 0) - (item.discount || 0) + (item.tax || 0))).toFixed ? (item.row_total ?? ((item.quantity || 0) * (item.rate ?? item.unit_price ?? 0) - (item.discount || 0) + (item.tax || 0))).toFixed(2) : (item.row_total ?? ((item.quantity || 0) * (item.rate ?? item.unit_price ?? 0) - (item.discount || 0) + (item.tax || 0)))}</td>
                                        </tr>
                                    ))}
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
    item_name?: string; // Add this
    uom?: string;
    quantity?: number;
    rate?: number;
    amount?: number;
    discount?: number;
    discount_amount?: number;
    tax?: number;
    tax_amount?: number;
    row_total?: number;
    stock_quantity?: number;
}

interface SalesInvoiceFormProps {
    onClose: () => void;
    onSave: (payload: {
        dc_id?: number;
        company_id: number;
        branch_id: number;
        flock_id: number;
        invoice_date: Date;
        status: string,
        vehicle_no: string,
        remarks: string,
        created_by: number,
        total_amount: number,
        items: SIItem[];
    }) => void;
    onUpdate: (payload: {
        sales_invoice_id: number;
        dc_id?: number;
        company_id: number;
        branch_id: number;
        flock_id: number;
        invoice_date: Date;
        status: string;
        vehicle_no: string;
        remarks: string;
        updated_by: number;
        total_amount: number;
        items: SIItem[];
    }) => void;
    editingInvoice: SalesInvoice | null;
    module_id: number | null;
}



export const SalesInvoiceForm: React.FC<SalesInvoiceFormProps> = ({ onClose, onSave, onUpdate, editingInvoice, module_id }) => {
    const [deliveryChallans, setDeliveryChallans] = useState<any[]>([]);
    const [companies, setCompanies] = useState<any[]>([]);
    const [branches, setBranches] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [flocks, setFlock] = useState<any[]>([]);
    const [filteredFlocks, setFilteredFlocks] = useState<any[]>([]);
    const [items, setItems] = useState<any[]>([]);
    const [companyName, setCompanyName] = useState<string>('');
    const [branchName, setBranchName] = useState<string>('');
    const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);
    const [dc_id, setDcId] = useState<number | null>(null);
    const [flock_id, setFlockid] = useState<any>(null);
    const [invoice_date, setInvoiceDate] = useState<Date>(new Date());
    const [status, setStatus] = useState<string>('CREATED');
    const [vehicle_no, setVehicleNo] = useState<string>('');
    const [remarks, setRemarks] = useState<string>('');
    const [created_by, setCreatedBy] = useState<number>(1);
    const [discount, setDiscount] = useState<number>(0);
    const [tax, setTax] = useState<number>(0);
    const [total_amount, setTotalAmount] = useState<number>(0);
    const [dcOpen, setDcOpen] = useState(false);
    const [openFlock, setOpenFlock] = useState(false);
    const [itemDropdown, setItemDropdown] = useState<number | null>(null);
    const [stockErrors, setStockErrors] = useState<{[key: number]: string}>({}); // Track stock errors per row

    const [siItems, setSiItems] = useState<SIItem[]>([{
        item_id: 0,
        uom: '',
        quantity: 0,
        rate: 0,
        amount: 0,
        discount: 0,
        discount_amount: 0,
        tax: 0,
        tax_amount: 0,
        row_total: 0,
        stock_quantity: 0 // Initialize with 0
    }]);

    // Load companies, branches and flocks when the form mounts
    useEffect(() => {
        const load = async () => {
            try {
                const [compRes, branchRes, flockRes] = await Promise.all([
                    getCompanies(),
                    getBranches(),
                    getFlock()
                ]);

                const approvedBranches = branchRes.filter((branch: any) =>
                    branch.status === 'APPROVED'
                );

                const compList = Array.isArray(compRes) ? compRes : (compRes?.data ?? []);
                const flockList = Array.isArray(flockRes) ? flockRes : (flockRes?.data ?? []);

                setCompanies(compList);
                setBranches(approvedBranches);
                setFlock(flockList);
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

    // Load items when branch is selected using getItemsfordiscount
    useEffect(() => {
        const loadItemsForBranch = async () => {
            if (selectedBranchId) {
                try {
                    const itemsRes = await getItemsfordiscount(selectedBranchId);
                    const itemList = Array.isArray(itemsRes) ? itemsRes : (itemsRes?.data ?? []);
                    setItems(itemList);
                    console.log("Loaded items for branch:", selectedBranchId, itemList);
                } catch (err) {
                    console.error('Failed to load items for branch', err);
                    toast({ title: 'Error', description: 'Failed to load items for selected branch', variant: 'destructive' });
                }
            }
        };

        loadItemsForBranch();
    }, [selectedBranchId]);

    // Filter flocks when branch is selected
    useEffect(() => {
        if (selectedBranchId && flocks.length > 0) {
            const filtered = flocks.filter(flock => 
                Number(flock.branch_id) === Number(selectedBranchId)
            );
            setFilteredFlocks(filtered);
            console.log("Filtered flocks for branch:", selectedBranchId, filtered);
            
            if (filtered.length === 1 && !flock_id) {
                setFlockid(Number(filtered[0].flock_id));
            }
        } else {
            setFilteredFlocks([]);
            setFlockid(null);
        }
    }, [selectedBranchId, flocks, flock_id]);

    // Handle branch selection
    const handleSelectBranch = (branchName: string) => {
        setBranchName(branchName);
        const selectedBranch = branches.find(b => b.branch_name === branchName || b.name === branchName);
        if (selectedBranch) {
            const branchId = selectedBranch.id || selectedBranch.branch_id;
            setSelectedBranchId(branchId);
            console.log("Selected branch ID:", branchId);
        }
    };

    // Handle flock selection
    const handleSelectFlock = (flock: any) => {
        setFlockid(Number(flock.flock_id));
        setOpenFlock(false);
    };

    // Load editing invoice data when editingInvoice changes
useEffect(() => {
    if (editingInvoice) {
        // First try to get enriched data from localStorage
        const storedData = localStorage.getItem('editingSalesInvoice');
        let invoiceData;
        
        if (storedData) {
            try {
                invoiceData = JSON.parse(storedData);
                console.log('Loaded enriched invoice data from localStorage:', invoiceData);
            } catch (e) {
                console.error('Failed to parse localStorage data:', e);
                invoiceData = editingInvoice;
            }
        } else {
            invoiceData = editingInvoice;
        }

        console.log('Loading editing invoice:', invoiceData);
        
        setInvoiceDate(new Date(invoiceData.invoice_date));
        setStatus(invoiceData.status);
        setVehicleNo(invoiceData.vehicle_no || '');
        setRemarks(invoiceData.remarks || '');
        setTotalAmount(invoiceData.total_amount);
        setCompanyName(invoiceData.branch_name || '');
        setBranchName(invoiceData.branch_name || '');
        setSelectedBranchId(invoiceData.branch_id);
        setFlockid(invoiceData.flock_id || null);
// Inside the useEffect that loads editingInvoice
if (invoiceData.items && invoiceData.items.length > 0) {
    const mappedItems = invoiceData.items.map(item => {
        console.log('Processing item with enriched data:', item);

        const quantity = Number(item.quantity || 0);
        const rate = Number(item.rate || item.unit_price || 0);
        const amount = Number(item.amount || (quantity * rate));
        
        // Get discount - prioritize discount_percentage if available
        const discountPercentage = Number(item.discount_percentage || item.discount || 0);
        const discount_amount = (amount * discountPercentage) / 100;
        
        const tax = Number(item.tax || 0);
        const tax_amount = Number(item.tax_amount || tax);
        const row_total = Number(item.row_total || (amount - discount_amount + tax));

        return {
            item_id: item.item_id,
            item_name: item.item_name, // Preserve item name
            uom: item.uom || '', // Use stored UOM
            quantity: quantity,
            rate: rate,
            amount: amount,
            discount: discountPercentage, // This is the key fix - use discount_percentage
            discount_amount: discount_amount,
            tax: tax,
            tax_amount: tax_amount,
            row_total: row_total,
            stock_quantity: item.stock_quantity || 0 // Use stored stock quantity
        } as SIItem;
    });

    console.log('Mapped items with UOM and stock:', mappedItems);
    setSiItems(mappedItems);

    const { discountSum, taxSum, total } = computeSiItems(mappedItems);
    setDiscount(discountSum);
    setTax(taxSum);
    setTotalAmount(total);
} else {
    setSiItems([{
        item_id: 0,
        uom: '',
        quantity: 0,
        rate: 0,
        amount: 0,
        discount: 0, // Initialize discount to 0
        discount_amount: 0,
        tax: 0,
        tax_amount: 0,
        row_total: 0,
        stock_quantity: 0
    }]);
}
    } else {
        resetForm();
    }
}, [editingInvoice]);

    const resetForm = () => {
        setInvoiceDate(new Date());
        setStatus('CREATED');
        setVehicleNo('');
        setRemarks('');
        setTotalAmount(0);
        setCompanyName('');
        setBranchName('');
        setSelectedBranchId(null);
        setFlockid(null);
        setFilteredFlocks([]);
        setSiItems([{
            item_id: 0,
            uom: '',
            quantity: 0,
            rate: 0,
            amount: 0,
            discount: 0,
            discount_amount: 0,
            tax: 0,
            tax_amount: 0,
            row_total: 0,
            stock_quantity: 0
        }]);
        setDiscount(0);
        setTax(0);
        setStockErrors({});
    };

    useEffect(() => {
        const { discountSum, taxSum, total } = computeSiItems(siItems);
        setDiscount(discountSum);
        setTax(taxSum);
        setTotalAmount(total);
    }, [siItems]);

    const computeSiItems = (items: SIItem[]) => {
        let discountSum = 0;
        let taxSum = 0;
        let total = 0;

        const computed = items.map((row) => {
            const quantity = Number(row.quantity || 0);
            const rate = Number(row.rate || 0);
            const amount = quantity * rate;
            
            const discountPercentage = Number(row.discount || 0);
            const discount_amount = (amount * discountPercentage) / 100;
            
            const tax_amount = Number(row.tax || 0);
            const row_total = amount - discount_amount + tax_amount;

            discountSum += discount_amount;
            taxSum += tax_amount;
            total += row_total;

            return {
                ...row,
                amount,
                discount_amount,
                tax_amount,
                row_total
            } as SIItem;
        });

        return { computed, discountSum, taxSum, total };
    };

    const addItemRow = () => {
        const next = [...siItems, {
            item_id: 0,
            uom: '',
            quantity: 0,
            rate: 0,
            amount: 0,
            discount: 0,
            discount_amount: 0,
            tax: 0,
            tax_amount: 0,
            row_total: 0,
            stock_quantity: 0
        }];
        const { computed, discountSum, taxSum, total } = computeSiItems(next);
        setSiItems(computed);
    };

    const removeItemRow = (index: number) => {
        const next = siItems.filter((_, i) => i !== index);
        const { computed, discountSum, taxSum, total } = computeSiItems(next);
        setSiItems(computed);
        
        // Remove stock error for this row if exists
        const newErrors = { ...stockErrors };
        delete newErrors[index];
        setStockErrors(newErrors);
    };

const handleSelectItem = (rowIndex: number, itemId: number) => {
    const copy = [...siItems];
    const selectedItem = items.find((it) => Number(it.item_id) === Number(itemId));

    if (!selectedItem) return;

    // Get item details with branch-specific pricing from getItemsfordiscount
    const uomValue = selectedItem?.uom_name ?? selectedItem?.uom ?? selectedItem?.unit ?? '';
    
    // Get branch-specific rate if available, otherwise use default
    const rateValue = selectedItem?.branch_specific_rate ?? 
                     selectedItem?.price ?? 
                     selectedItem?.rate ?? 
                     selectedItem?.unit_price ?? 
                     selectedItem?.default_rate ?? 0;

    // Get branch-specific discount if available - check multiple possible fields
    const discountValue = selectedItem?.discount_percentage ?? 
                         selectedItem?.branch_specific_discount ?? 
                         selectedItem?.discount ?? 0;

    // Get available stock quantity
    const stockQty = selectedItem?.stock_quantity ?? 
                    selectedItem?.available_quantity ?? 
                    selectedItem?.qty_on_hand ?? 
                    0;

    const qty = Number(copy[rowIndex]?.quantity ?? 0);

    copy[rowIndex] = {
        ...copy[rowIndex],
        item_id: Number(itemId),
        uom: uomValue,
        rate: Number(rateValue),
        discount: Number(discountValue), // This should now get discount properly
        quantity: qty,
        stock_quantity: Number(stockQty) // Store stock quantity locally
    } as SIItem;

    // Validate quantity against stock if quantity exists
    if (qty > 0 && qty > Number(stockQty)) {
        setStockErrors(prev => ({
            ...prev,
            [rowIndex]: `Quantity exceeds available stock (${stockQty})`
        }));
    } else {
        // Clear error if quantity is valid
        const newErrors = { ...stockErrors };
        delete newErrors[rowIndex];
        setStockErrors(newErrors);
    }

    const { computed, discountSum, taxSum, total } = computeSiItems(copy);
    setSiItems(computed);
    setItemDropdown(null);
};

    const handleChangeRow = (index: number, field: keyof SIItem, value: any) => {
        const copy = [...siItems];
        const numericValue = ['quantity', 'rate', 'discount', 'tax'].includes(field)
            ? (value === '' ? 0 : Number(value))
            : value;

        copy[index] = {
            ...copy[index],
            [field]: numericValue
        } as SIItem;

        // Validate quantity against stock if field is quantity
        if (field === 'quantity') {
            const stockQty = copy[index].stock_quantity || 0;
            const enteredQty = Number(numericValue);
            
            if (enteredQty > stockQty) {
                setStockErrors(prev => ({
                    ...prev,
                    [index]: `Quantity exceeds available stock (${stockQty})`
                }));
            } else {
                // Clear error if quantity is valid
                const newErrors = { ...stockErrors };
                delete newErrors[index];
                setStockErrors(newErrors);
            }
        }

        const { computed, discountSum, taxSum, total } = computeSiItems(copy);
        setSiItems(computed);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Check if there are any stock validation errors
        if (Object.keys(stockErrors).length > 0) {
            toast({
                title: "Validation Error",
                description: "Please fix all stock quantity errors before submitting",
                variant: "destructive",
                duration: 3000,
            });
            return;
        }
        
        // Check if any quantity exceeds stock
        const hasStockExceeded = siItems.some((item, index) => {
            const quantity = Number(item.quantity || 0);
            const stock = Number(item.stock_quantity || 0);
            return quantity > stock;
        });
        
        if (hasStockExceeded) {
            toast({
                title: "Validation Error",
                description: "Some items have quantity greater than available stock",
                variant: "destructive",
                duration: 3000,
            });
            return;
        }

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

            if (siItems.length === 0 || siItems.some((r) => !r.item_id || r.item_id === 0 || r.quantity === undefined || r.quantity <= 0)) {
                alert("Add at least one item and ensure item and quantity are valid.");
                return;
            }

            // Prepare items without stock_quantity (not sent to API)
            const itemsForApi = siItems.map(it => ({
                item_id: it.item_id,
                uom: it.uom,
                quantity: it.quantity,
                rate: it.rate,
                unit_price: it.rate,
                amount: it.amount,
                discount: it.discount,
                discount_amount: it.discount_amount,
                tax: it.tax,
                tax_amount: it.tax_amount,
                row_total: it.row_total,
                // Note: stock_quantity is NOT included here
            }));

            if (editingInvoice) {
                await onUpdate({
                    sales_invoice_id: editingInvoice.sales_invoice_id,
                    company_id: selectedCompany?.id || selectedCompany?.company_id || 0,
                    branch_id: selectedBranch?.id || selectedBranch?.branch_id || 0,
                    flock_id: module_id === 3 ? 0 : flock_id,
                    invoice_date,
                    status,
                    vehicle_no,
                    remarks,
                    updated_by: 1,
                    total_amount,
                    items: itemsForApi
                });
            } else {
                await onSave({
                    company_id: selectedCompany?.id || selectedCompany?.company_id || 0,
                    branch_id: selectedBranch?.id || selectedBranch?.branch_id || 0,
                    flock_id: module_id === 3 ? 0 : flock_id,
                    invoice_date,
                    status,
                    vehicle_no,
                    remarks,
                    created_by,
                    total_amount,
                    items: itemsForApi
                });
            }
        } catch (error) {
            console.error("Form submission error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
            <div className="p-6 pt-2 max-w-6xl mx-auto">
                <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center">
                    {editingInvoice ? 'Edit Farm Invoice' : 'Farm Invoice'}
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
                                                        onSelect={() => handleSelectBranch(b.branch_name ?? b.name ?? '')}
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
                                                    {!selectedBranchId ? 'Select a farm first' : 'No flocks found for this farm'}
                                                </CommandEmpty>
                                                <CommandGroup>
                                                    {filteredFlocks.map((f) => (
                                                        <CommandItem
                                                            key={f.flock_id}
                                                            onSelect={() => handleSelectFlock(f)}
                                                        >
                                                            <Check className={cn("mr-2 h-4 w-4", flock_id === Number(f.flock_id) ? "opacity-100" : "opacity-0")} />
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

                        <div className="flex items-end space-x-4 w-full">
                            <div className="flex flex-col w-1/2">
                                <label className="block text-sm font-medium mb-1">Invoice Date</label>
                                <DatePicker
                                    id="invoice-date"
                                    selected={invoice_date}
                                    onChange={(date: Date) => setInvoiceDate(date)}
                                    customInput={
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !invoice_date && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {invoice_date ? format(invoice_date, "PPP") : <span>Pick a date</span>}
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
                        {/* Updated header to include Stock column */}
                        <div className="flex items-center gap-2 w-full text-xs font-bold text-gray-600 border-b pb-2">
                            <div className="w-1/4">Item</div>
                            <div className="w-[60px] text-center">UOM</div>
                            <div className="w-[70px] text-center">Stock</div>
                            <div className="w-[70px] text-center">Quantity</div>
                            <div className="w-[70px] text-center">Rate</div>
                            <div className="w-[70px] text-center">Discount%</div>
                            <div className="w-[80px] text-center">Discount Amt</div>
                            <div className="w-[70px] text-center">Tax</div>
                            <div className="w-[80px] text-center">Row Total</div>
                            <div className="w-[30px] text-center">Action</div>
                        </div>

                        {siItems.map((row, idx) => {
                            const selected = items.find((it) => Number(it.item_id) === Number(row.item_id));
                            const displayName = selected?.item_name || selected?.display_name || 'Selected item';
                            const hasError = stockErrors[idx];

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

                                        <PopoverContent className="w-[450px] max-h-[300px] overflow-auto">
                                            <Command>
                                                <CommandInput placeholder="Search items..." />
                                                <CommandEmpty>No items</CommandEmpty>

                                                <CommandGroup>
                                                    {items.map((it) => {
                                                        const price = it.branch_specific_rate ?? it.price ?? it.rate ?? it.unit_price ?? it.default_rate ?? 0;
                                                        const discount = it.branch_specific_discount ?? it.discount_percentage ?? it.discount ?? 0;
                                                        const stock = it.stock_quantity ?? it.available_quantity ?? it.qty_on_hand ?? 0;

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
                                                                    <div className="flex flex-col">
                                                                        <span className="truncate">{it.item_name}</span>
                                                                        <span className="text-xs text-gray-500">
                                                                            Stock: {Number(stock).toLocaleString()}
                                                                        </span>
                                                                    </div>

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

                                    {/* UOM Field */}
                                    <div className="flex flex-col w-[60px]">
                                        <div className={`p-2 border rounded-md text-center ${hasError ? 'border-red-500' : ''}`}>
                                            {row.uom || '-'}
                                        </div>
                                    </div>

                                    {/* Stock Quantity Field (Read-only) */}
                                    <div className="flex flex-col w-[70px]">
                                        <div className={`p-2 border rounded-md bg-gray-50 text-center ${hasError ? 'border-red-500' : ''}`}>
                                            {Number(row.stock_quantity || 0).toLocaleString()}
                                        </div>
                                    </div>

                                    {/* Quantity Field with validation */}
                                    <div className="flex flex-col w-[70px] relative">
                                        <Input
                                            type="number"
                                            className={`w-full text-center ${hasError ? 'border-red-500' : ''}`}
                                            min={0}
                                            step="0.01"
                                            value={row.quantity || 0}
                                            onChange={(e) => handleChangeRow(idx, "quantity", e.target.value)}
                                            disabled={!row.item_id || row.item_id === 0}
                                        />
                                        {hasError && (
                                            <div className="absolute -bottom-5 left-0 text-xs text-red-500 whitespace-nowrap">
                                                {hasError}
                                            </div>
                                        )}
                                    </div>

                                    {/* Rate Field */}
                                    <div className="flex flex-col w-[70px]">
                                        <Input
                                            type="number"
                                            className="w-full text-center"
                                            min={0}
                                            step="0.01"
                                            value={row.rate || 0}
                                            onChange={(e) => handleChangeRow(idx, "rate", e.target.value)}
                                            disabled={!row.item_id || row.item_id === 0}
                                        />
                                    </div>

                                    {/* Discount Field */}
                                    <div className="flex flex-col w-[70px]">
                                        <Input
                                            type="number"
                                            className="w-full text-center"
                                            min={0}
                                            step="0.01"
                                            value={row.discount || 0}
                                            onChange={(e) => handleChangeRow(idx, "discount", e.target.value)}
                                            disabled={!row.item_id || row.item_id === 0}
                                        />
                                    </div>

                                    {/* Discount Amount Field (Read-only) */}
                                    <div className="flex flex-col w-[80px]">
                                        <div className="p-2 border rounded-md bg-gray-50 text-center">
                                            {Number(row.discount_amount || 0).toFixed(2)}
                                        </div>
                                    </div>

                                    {/* Tax Field */}
                                    <div className="flex flex-col w-[70px]">
                                        <Input
                                            type="number"
                                            className="w-full text-center"
                                            min={0}
                                            step="0.01"
                                            value={row.tax || 0}
                                            onChange={(e) => handleChangeRow(idx, "tax", e.target.value)}
                                            disabled={!row.item_id || row.item_id === 0}
                                        />
                                    </div>

                                    {/* Row Total Field (Read-only) */}
                                    <div className="flex flex-col w-[80px]">
                                        <div className="p-2 border rounded-md bg-gray-50 text-center">
                                            {Number(row.row_total || 0).toFixed(2)}
                                        </div>
                                    </div>

                                    {/* Remove Button */}
                                    {siItems.length > 1 && (
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

                    {/* Summary Section */}
                    <div className="flex flex-col md:flex-row md:space-x-6 space-y-2 md:space-y-0 items-center justify-center text-gray-700 font-semibold">
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

                    {/* Submit Buttons */}
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
                            disabled={loading || Object.keys(stockErrors).length > 0}
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

export default SalesInvoice;