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
import { getCustomers } from '@/api/customerApi';
import { getCompanies } from '@/api/getCompaniesApi';
import { getBranches } from '@/api/branchApi';
import { Popover, PopoverContent, PopoverTrigger, } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { toast } from '../ui/use-toast';
import { getWarehouses } from '@/api/getWarehousesApi';
import { set } from 'date-fns';

// Updated imports for Sales Invoice Return APIs
import { getSalesInvoicesReturn, createSalesInvoiceReturn, updateSalesInvoiceReturn, approveSalesInvoicesReturn } from '@/api/SalesInvoiceReturnApi';

// Import for getItemsfordiscount API
import { getItemsfordiscount } from '@/api/itemsApi'; // Make sure this path is correct

// New import for Checkbox
import { Checkbox } from '@/components/ui/checkbox';
import { getFlock } from '@/api/flockApi';
import AhmadPoultryLogo from '@/assets/AhmadPoultryLogo.png';
import { useNavigate } from 'react-router-dom';

import { getbirdsVehicles } from '@/api/birdsVehiclesApi';
import axios from 'axios';

interface SalesInvoiceReturn {
  sales_return_id: number;
  customer_id: number;
  customer_name: string;
  company_id: number;
  company_name: string;
  branch_id: number;
  branch_name: string;
  invoice_date: Date;
  return_date: Date;
  return_qty: number;
  discount: number;
  tax: number;
  total_qty: number;
  total_amount: number;
  remarks: string;
  status: string;
  created_by: number;
  created_by_name: string;
  updated_by: number;
  created_at: Date;
  updated_at: Date;
  items: Array<{
    item_id: number;
    item_name: string;
    uom?: string;
    returned_qty: number;
    unit_price: number;
    discount: number;
    tax: number;
    row_total?: number;
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

interface BirdsVehicle {
  vehicle_id: number;
  vehicle_name: string;
  vehicle_no?: string; 
  status?: string; 
}

interface viewingReturn {
  sales_return_id: number;

  customer_id: number;
  customer_name: string;
  company_id: number;
  company_name: string;
  branch_id: number;
  branch_name: string;
  flock_id: number;
  flock_name: string;
  invoice_date: Date;
  return_date: Date;
  return_qty: number;
  discount: number;
  tax: number;
  total_qty: number;
  total_amount: number;
  remarks: string;
  status: string;
  created_by: number;
  created_by_name: string;
  updated_by: number;
  created_at: Date;
  updated_at: Date;
  items: Array<{
    item_id: number;
    item_name: string;
    uom?: string;
    returned_qty: number;
    unit_price: number;
    discount: number;
    tax: number;
    row_total?: number;
  }>;
}

const SalesInvoiceReturn: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingReturn, setEditingReturn] = useState<SalesInvoiceReturn | null>(null);
  const [salesInvoiceReturns, setSalesInvoiceReturns] = useState<SalesInvoiceReturn[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [dateFilterApplied, setDateFilterApplied] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedReturns, setSelectedReturns] = useState<number[]>([]);
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [viewingReturn, setViewingReturn] = useState<viewingReturn | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const navigate = useNavigate();

  const loadCompanyImage = async () => {
    try {
      const data = await getCompanies();
      if (data && data.length > 0) {
        setCompanyData(data[0]); // Assuming first item is the company data
      }
    } catch (error) {
      console.error("Error loading company image", error);
      // Keep AhmadPoultryLogo as fallback
    }
  };

  useEffect(() => {
    loadSalesInvoiceReturns();
    loadCompanyImage();
  }, []);

  const loadSalesInvoiceReturns = async () => {
    setIsLoading(true);
    try {
      const data = await getSalesInvoicesReturn();
      setSalesInvoiceReturns(data);
    } catch (error) {
      console.error("Error loading sales invoice returns", error);
      toast({
        title: "Error",
        description: "Failed to load sales invoice returns.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getSelectedBranchId = (): string | null => {
    return sessionStorage.getItem("selectedBranchId");
  };
  const permissions = JSON.parse(
  sessionStorage.getItem('role_permissions') || '{}'
);

  const getModuleId = () => {
    const selectedBranchId = getSelectedBranchId();
    const module_id = selectedBranchId && selectedBranchId !== 'N/A'
      ? parseInt(selectedBranchId, 10)
      : null;
    return module_id;
  }

  const module_id = getModuleId();
  const totalReturns = salesInvoiceReturns.length;
  const createdReturns = salesInvoiceReturns.filter(invoice => invoice.status === 'CREATED').length;
  const totalValue = salesInvoiceReturns.reduce((sum, invoice) => sum + Number(invoice.total_amount || 0), 0);

  const handleApproveReturns = async () => {
    if (selectedReturns.length === 0) return;

    try {
      await approveSalesInvoicesReturn(selectedReturns);
      toast({
        title: "Approved",
        description: `${selectedReturns.length} return(s) approved successfully.`,
        duration: 3000,
      });

      setSelectedReturns([]);
      loadSalesInvoiceReturns();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve selected returns.",
        variant: "destructive",
        duration: 3000,
      });
      console.error("Error approving returns:", error);
    }
  };

  const handleApplyDateFilter = () => {
    if (startDate && endDate) {
      setDateFilterApplied(true);
      // Note: Your API might need to support date filtering
      // For now, we'll filter client-side
      loadSalesInvoiceReturns();
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
    loadSalesInvoiceReturns();
  };

  const handleEditReturn = (sales_return_id: number) => {
    const selectedReturn = salesInvoiceReturns.find(ret => ret.sales_return_id === sales_return_id);
    if (selectedReturn) {
      setEditingReturn(selectedReturn);
      setShowForm(true);
    }
  };

  const handleDeleteReturn = async (sales_return_id: number) => {
    if (!window.confirm('Are you sure you want to delete this return?')) return;
    try {
      // Note: You'll need to add a delete operation to your API if needed
      toast({ 
        title: "Info", 
        description: "Delete functionality needs to be implemented in API" 
      });
      loadSalesInvoiceReturns();
    } catch (error: any) {
      console.error('Failed to delete return', error);
      toast({ 
        title: "Error", 
        description: `Failed to delete return. ${error?.message ?? error}`, 
        variant: "destructive" 
      });
    }
  };

const handleSaveReturn = async (payload: {
  customer_id: number;
  company_id: number;
  branch_id: number;
  invoice_date: string;
  return_date: string;
  return_qty: number;
  discount: number;
  tax: number;
  total_qty: number;
  total_amount: number;
  remarks: string;
  items: ReturnItem[]
}) => {
  try {
    const apiItems = (payload.items || []).map(it => ({
      item_id: it.item_id,
      returned_qty: it.returned_qty,
      unit_price: it.unit_price,
      discount: it.discount,
      tax: it.tax,
      uom: it.uom || 0
    }));

    // REMOVED flock_id parameter and sales_return_id is not needed for create
    await createSalesInvoiceReturn(
      payload.customer_id,
      payload.invoice_date,
      payload.return_date,
      payload.return_qty,
      payload.discount,
      payload.tax,
      payload.company_id,
      payload.branch_id,
      payload.total_qty,
      payload.total_amount,
      payload.remarks,
      apiItems
    );
    toast({ title: "Created", description: "Sales Invoice Return created successfully!" });
    setShowForm(false);
    loadSalesInvoiceReturns();
  } catch (err) {
    console.error("Save Return failed", err);
    toast({ 
      title: "Error", 
      description: "Failed to create Sales Invoice Return.", 
      variant: "destructive" 
    });
  }
};

  const handleUpdateReturn = async (payload: {
    sales_return_id: number;
    customer_id: number;
    company_id: number;
    branch_id: number;
    invoice_date: string;
    return_date: string;
    return_qty: number;
    discount: number;
    tax: number;
    total_qty: number;
    total_amount: number;
    remarks: string;
    items: ReturnItem[]
  }) => {
    try {
      const apiItems = (payload.items || []).map(it => ({
        item_id: it.item_id,
        returned_qty: it.returned_qty,
        unit_price: it.unit_price,
        discount: it.discount,
        tax: it.tax,
        uom: it.uom || 0
      }));

      await updateSalesInvoiceReturn(
        payload.sales_return_id,
        payload.customer_id,
        payload.invoice_date,
        payload.return_date,
        payload.return_qty,
        payload.discount,
        payload.tax,
        payload.company_id,
        payload.branch_id,
        payload.total_qty,
        payload.total_amount,
        payload.remarks,
        apiItems
      );
      toast({ title: "Updated", description: "Sales Invoice Return updated successfully!" });
      setShowForm(false);
      setEditingReturn(null);
      loadSalesInvoiceReturns();
    } catch (err) {
      console.error("Update Return failed", err);
      toast({ title: "Error", description: "Failed to update Sales Invoice Return.", variant: "destructive" });
    }
  };

  const handlePrint = (returnInvoice: SalesInvoiceReturn) => {
    const printWindow = window.open("", "_blank", "width=800,height=1000");
    const returnDate = new Date(returnInvoice.return_date);
    const formattedDate = `${returnDate.getDate()}-${returnDate.toLocaleString("default", {
      month: "short",
    })}-${String(returnDate.getFullYear()).slice(-2)}`;

    const totalAmount = Number(returnInvoice.total_amount || 0);
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

    const logoSource = companyData?.image || AhmadPoultryLogo;
    const companyName = companyData?.company_name || "Ahmad Poultry Farm";
    const companyAddress = companyData?.address || "";
    const companyPhone = companyData?.phone || "";
    const companyEmail = companyData?.email || "";
    const companyReg = companyData?.registration_number || "";

    const printContent = `
      <html>
        <head>
          <title>Sales Invoice Return #${returnInvoice.sales_return_id}</title>
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
              <h4>SALES INVOICE RETURN</h4>
            </div>
          </div>

          <div class="top-bar">
            <div>Return Date: ${formattedDate}</div>
            <div>Return ID: ${returnInvoice.sales_return_id}</div>
            <div>Invoice No: ${returnInvoice.sales_invoice_no}</div>
          </div>

          <table class="details-table">
            <tr>
              <td><strong>Customer Name:</strong> ${returnInvoice.customer_name || "N/A"}</td>
              <td><strong>Branch:</strong> ${returnInvoice.branch_name || "N/A"}</td>
            </tr>
            <tr>
              <td><strong>Original Invoice Date:</strong> ${new Date(returnInvoice.invoice_date).toLocaleDateString()}</td>
              <td><strong>Flock:</strong> ${returnInvoice.flock_name || "N/A"}</td>
            </tr>
            <tr>
              <td><strong>Total Return Qty:</strong> ${returnInvoice.return_qty}</td>
              <td><strong>Status:</strong> ${returnInvoice.status || "N/A"}</td>
            </tr>
            <tr>
              <td colspan="2"><strong>Remarks:</strong> ${returnInvoice.remarks || "N/A"}</td>
            </tr>
          </table>

          <div class="items-table">
            <table class="main-table">
              <thead>
                <tr>
                  <th>Sr#</th>
                  <th>Item Name</th>
                  <th>UOM</th>
                  <th>Return Qty</th>
                  <th>Unit Price</th>
                  <th>Discount</th>
                  <th>Tax</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${returnInvoice.items?.map((item, index) => {
                  const returnedQty = Number(item.returned_qty || 0);
                  const unitPrice = Number(item.unit_price || 0);
                  const discount = Number(item.discount || 0);
                  const tax = Number(item.tax || 0);
                  const rowTotal = Number(item.row_total || (returnedQty * unitPrice - discount + tax));
                  
                  return `
                    <tr>
                      <td>${index + 1}</td>
                      <td class="text-left">${item.item_name || "N/A"}</td>
                      <td>${item.uom || "N/A"}</td>
                      <td>${returnedQty}</td>
                      <td>${unitPrice.toLocaleString()}</td>
                      <td>${discount.toLocaleString()}</td>
                      <td>${tax.toLocaleString()}</td>
                      <td>${rowTotal.toLocaleString()}</td>
                    </tr>
                  `;
                }).join('')}
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
            <p>This is a system generated sales invoice return document and does not require signature or stamp.</p>
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

  const filteredReturns = salesInvoiceReturns.filter((ret) => {
    const term = (searchTerm || "").toLowerCase();
    const statusMatch = statusFilter === 'ALL' || ret.status === statusFilter;
    
    return (
      statusMatch && (
        (ret.branch_name || "").toLowerCase().includes(term) ||
        ret.sales_return_id?.toString().includes(term) ||
        ret.sales_invoice_no?.toString().includes(term) ||
        (ret.customer_name || "").toLowerCase().includes(term)
      )
    );
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CREATED': return 'bg-gray-100 text-gray-800';
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'RETURNED': return 'bg-blue-100 text-blue-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCheckboxChange = (sales_return_id: number, checked: boolean) => {
    const returnInv = salesInvoiceReturns.find(ret => ret.sales_return_id === sales_return_id);

    if (returnInv?.status === 'CANCELLED') {
      return;
    }

    if (checked) {
      setSelectedReturns((prev) => [...prev, sales_return_id]);
    } else {
      setSelectedReturns((prev) => prev.filter(id => id !== sales_return_id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Returns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalReturns}</div>
          </CardContent>
        </Card>
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Created Returns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{createdReturns}</div>
          </CardContent>
        </Card>
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Return Value</CardTitle>
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
              <RotateCcw className="h-5 w-5" />
              Sales Invoice Returns
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
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              {selectedReturns.some(sales_return_id => {
                const returnInv = salesInvoiceReturns.find(ret => ret.sales_return_id === sales_return_id);
                return returnInv?.status === 'APPROVED';
              }) && permissions.sales_unapprove === 1 && (
                <Button
                  className="bg-gradient-to-r from-orange-500 to-orange-700"
                  onClick={() => {
                    // Handle unapprove if needed
                    toast({ title: "Info", description: "Unapprove functionality needs to be implemented" });
                  }}
                >
                  UnApprove ({selectedReturns.length})
                </Button>
              )}
              
              {selectedReturns.some(id =>
                salesInvoiceReturns.find(ret => ret.sales_return_id === id)?.status === 'CREATED'
              ) && permissions.sales_approve === 1 && (
                <Button
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={handleApproveReturns}
                >
                  Approve ({selectedReturns.length})
                </Button>
              )}

              <Button
                onClick={() => {
                  setEditingReturn(null);
                  setShowForm(true);
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Return
              </Button>
            </div>
          </div>
          
          <div className="relative mt-4">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search Returns..."
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
                      selectedReturns.length > 0 &&
                      selectedReturns.length === filteredReturns.filter(ret => ret.status === 'CREATED').length
                    }
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedReturns(filteredReturns.filter(ret => ret.status === 'CREATED').map((ret) => ret.sales_return_id));
                      } else {
                        setSelectedReturns([]);
                      }
                    }}
                    title="Select All CREATED"
                    className="form-checkbox h-4 w-4 text-purple-600 transition duration-150 ease-in-out"
                  />
                </TableHead>
                <TableHead>Return ID</TableHead>
                <TableHead>Invoice No</TableHead>
                <TableHead>Return Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            
            <TableBody>
              {filteredReturns.map((ret) => {
                const isCancelled = ret.status === 'CANCELLED';
                const isApproved = ret.status === 'APPROVED';
                const isEditable = ret.status === 'CREATED';

                return (
                  <TableRow key={ret.sales_return_id}>
                    <TableCell className='w-10'>
                      <input
                        type="checkbox"
                        checked={selectedReturns.includes(ret.sales_return_id)}
                        disabled={ret.status !== 'CREATED' && ret.status !== 'APPROVED'}
                        onChange={(e) => {
                          const currentStatus = ret.status;
                          
                          const filteredSelectedReturns = selectedReturns.filter(id => {
                            const returnInv = salesInvoiceReturns.find(inv => inv.sales_return_id === id);
                            return returnInv && filteredReturns.some(filteredRet => filteredRet.sales_return_id === id);
                          });

                          const selectedStatuses = filteredSelectedReturns
                            .map(id => salesInvoiceReturns.find(inv => inv.sales_return_id === id)?.status)
                            .filter(Boolean);

                          if (
                            selectedStatuses.length > 0 &&
                            !selectedStatuses.includes(currentStatus)
                          ) {
                            toast({
                              title: "Invalid Selection",
                              description: "You can only select returns with the same status.",
                              variant: "destructive",
                            });
                            return;
                          }

                          if (e.target.checked) {
                            setSelectedReturns(prev => [...prev, ret.sales_return_id]);
                          } else {
                            setSelectedReturns(prev =>
                              prev.filter(id => id !== ret.sales_return_id)
                            );
                          }
                        }}
                        className="form-checkbox h-4 w-4 text-purple-600 transition duration-150 ease-in-out"
                      />
                    </TableCell>
                    <TableCell className="font-medium">{ret.sales_return_id}</TableCell>
                    <TableCell>{ret.sales_invoice_no}</TableCell>
                    <TableCell>{ret.return_date ? new Date(ret.return_date).toLocaleDateString() : ''}</TableCell>
                    <TableCell>{ret.customer_name}</TableCell>
                    <TableCell>{ret.total_amount}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(ret.status)}>{ret.status}</Badge>
                    </TableCell>
                    <TableCell className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewReturn(ret.sales_return_id)}
                        title="Show Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>

                      {isEditable && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditReturn(ret.sales_return_id)}
                          title="Edit Return"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}

                      {ret.status === "CREATED" && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteReturn(ret.sales_return_id)}
                          title="Delete Return"
                          disabled={isApproved}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handlePrint(ret)}
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
        <SalesInvoiceReturnForm
          onClose={() => {
            setShowForm(false);
            setEditingReturn(null);
          }}
          onSave={handleSaveReturn}
          onUpdate={handleUpdateReturn}
          editingReturn={editingReturn}
          module_id={module_id}
        />
      )}

      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Sales Invoice Return Details</DialogTitle>
          </DialogHeader>
          {viewingReturn && (
            <>
              <table className="w-full border border-gray-300 mb-4 text-sm">
                <tbody>
                  <tr>
                    <td className="p-2 font-medium text-gray-600 border">Return ID</td>
                    <td className="p-2 border">{viewingReturn.sales_return_id}</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-medium text-gray-600 border">Invoice Number</td>
                    <td className="p-2 border">{viewingReturn.sales_invoice_no}</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-medium text-gray-600 border">Customer Name</td>
                    <td className="p-2 border">{viewingReturn.customer_name}</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-medium text-gray-600 border">Company</td>
                    <td className="p-2 border">{viewingReturn.company_name}</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-medium text-gray-600 border">Branch</td>
                    <td className="p-2 border">{viewingReturn.branch_name}</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-medium text-gray-600 border">Original Invoice Date</td>
                    <td className="p-2 border">{new Date(viewingReturn.invoice_date).toLocaleDateString()}</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-medium text-gray-600 border">Return Date</td>
                    <td className="p-2 border">{new Date(viewingReturn.return_date).toLocaleDateString()}</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-medium text-gray-600 border">Total Return Qty</td>
                    <td className="p-2 border">{viewingReturn.return_qty}</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-medium text-gray-600 border">Total Amount</td>
                    <td className="p-2 border">{viewingReturn.total_amount}</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-medium text-gray-600 border">Status</td>
                    <td className="p-2 border">{viewingReturn.status}</td>
                  </tr>
                </tbody>
              </table>
              
              <h3 className="text-md font-semibold mb-2">Returned Items</h3>
              <table className="w-full border border-gray-300 text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 border text-left">Item Name</th>
                    <th className="p-2 border text-left">Return Qty</th>
                    <th className="p-2 border text-left">Unit Price</th>
                    <th className="p-2 border text-left">Discount</th>
                    <th className="p-2 border text-left">Tax</th>
                    <th className="p-2 border text-left">Row Total</th>
                  </tr>
                </thead>
                <tbody>
                  {viewingReturn.items?.map((item, index) => {
                    const returnedQty = Number(item.returned_qty || 0);
                    const unitPrice = Number(item.unit_price || 0);
                    const discount = Number(item.discount || 0);
                    const tax = Number(item.tax || 0);
                    const rowTotal = Number(item.row_total || (returnedQty * unitPrice - discount + tax));
                    
                    return (
                      <tr key={index}>
                        <td className="p-2 border">{item.item_name ?? '-'}</td>
                        <td className="p-2 border">{returnedQty}</td>
                        <td className="p-2 border">{unitPrice.toFixed(2)}</td>
                        <td className="p-2 border">{discount.toFixed(2)}</td>
                        <td className="p-2 border">{tax.toFixed(2)}</td>
                        <td className="p-2 border">{rowTotal.toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              
              <div className="mb-4 mt-4">
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
  item_name?: string;
  uom?: number;
  returned_qty: number;
  unit_price: number;
  discount: number;
  tax: number;
  row_total?: number;
}

interface SalesInvoiceReturnFormProps {
  onClose: () => void;
  onSave: (payload: {
    customer_id: number;
    company_id: number;
    branch_id: number;
    invoice_date: string;
    return_date: string;
    return_qty: number;
    discount: number;
    tax: number;
    total_qty: number;
    total_amount: number;
    remarks: string;
    items: ReturnItem[];
  }) => void;
  onUpdate: (payload: {
    sales_return_id: number;
    customer_id: number;
    company_id: number;
    branch_id: number;
    invoice_date: string;
    return_date: string;
    return_qty: number;
    discount: number;
    tax: number;
    total_qty: number;
    total_amount: number;
    remarks: string;
    items: ReturnItem[];
  }) => void;
  editingReturn: SalesInvoiceReturn | null;
  module_id: number | null;
}

export const SalesInvoiceReturnForm: React.FC<SalesInvoiceReturnFormProps> = ({ 
  onClose, 
  onSave, 
  onUpdate, 
  editingReturn, 
  module_id 
}) => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [branches, setBranches] = useState<any[]>([]);
  const [flocks, setFlock] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(false);

  const [companyName, setCompanyName] = useState<string>('');
  const [branchName, setBranchName] = useState<string>('');
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);

  const [customer_id, setCustomerId] = useState<number>(0);
  const [flock_id, setFlockid] = useState<any>(null);
  const [invoice_date, setInvoiceDate] = useState<string>('');
  const [return_date, setReturnDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [return_qty, setReturnQty] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);
  const [tax, setTax] = useState<number>(0);
  const [total_qty, setTotalQty] = useState<number>(0);
  const [total_amount, setTotalAmount] = useState<number>(0);
  const [remarks, setRemarks] = useState<string>('');

  const [customerOpen, setCustomerOpen] = useState(false);
  const [openFlock, setOpenFlock] = useState(false);
  const [itemDropdown, setItemDropdown] = useState<number | null>(null);

  const [returnItems, setReturnItems] = useState<ReturnItem[]>([{
    item_id: 0,
    returned_qty: 0,
    unit_price: 0,
    discount: 0,
    tax: 0,
    uom: 0,
    row_total: 0
  }]);

  useEffect(() => {
    if (editingReturn) {
      console.log('Loading editing return:', editingReturn);
      
      setCustomerId(editingReturn.customer_id);
      setInvoiceDate(format(new Date(editingReturn.invoice_date), 'yyyy-MM-dd'));
      setReturnDate(format(new Date(editingReturn.return_date), 'yyyy-MM-dd'));
      setReturnQty(editingReturn.return_qty);
      setDiscount(editingReturn.discount);
      setTax(editingReturn.tax);
      setTotalQty(editingReturn.total_qty);
      setTotalAmount(editingReturn.total_amount);
      setRemarks(editingReturn.remarks || '');

      setCompanyName(editingReturn.company_name || '');
      setBranchName(editingReturn.branch_name || '');
      setSelectedBranchId(editingReturn.branch_id);
      setFlockid(editingReturn.flock_id || null);

      if (editingReturn.items && editingReturn.items.length > 0) {
        const mappedItems = editingReturn.items.map(item => {
          return {
            item_id: item.item_id,
            item_name: item.item_name,
            returned_qty: item.returned_qty,
            unit_price: item.unit_price,
            discount: item.discount,
            tax: item.tax,
            uom: item.uom || 0,
            row_total: item.row_total || (item.returned_qty * item.unit_price - item.discount + item.tax)
          } as ReturnItem;
        });

        console.log('Mapped items for editing:', mappedItems);
        setReturnItems(mappedItems);
      } else {
        setReturnItems([{
          item_id: 0,
          returned_qty: 0,
          unit_price: 0,
          discount: 0,
          tax: 0,
          uom: 0,
          row_total: 0
        }]);
      }
    } else {
      resetForm();
    }
  }, [editingReturn]);

  // Load customers, companies, branches, flocks
  useEffect(() => {
    const load = async () => {
      try {
        const [custRes, compRes, branchRes, flockRes] = await Promise.all([
          getCustomers(),
          getCompanies(),
          getBranches(),
          getFlock()
        ]);

        const approvedBranches = branchRes.filter((branch: any) =>
          branch.status === 'APPROVED'
        );

        const custList = Array.isArray(custRes) ? custRes : (custRes?.data ?? []);
        const compList = Array.isArray(compRes) ? compRes : (compRes?.data ?? []);
        const flockList = Array.isArray(flockRes) ? flockRes : (flockRes?.data ?? []);

        setCustomers(custList);
        setCompanies(compList);
        setBranches(approvedBranches);
        setFlock(flockList);

        try {
          if (Array.isArray(compList) && compList.length === 1) {
            const only = compList[0];
            setCompanyName(only.name ?? only.company_name ?? '');
          }
        } catch (e) {
          // ignore
        }

        // For module_id 3, find and set "Head Office" as default branch
        if (module_id === 3) {
          const headOfficeBranch = approvedBranches.find((br: any) => 
            br.branch_name.toLowerCase().includes('head office') || 
            br.branch_name.toLowerCase().includes('headoffice') ||
            br.branch_name.toLowerCase().includes('ho')
          );
          
          if (headOfficeBranch) {
            setBranchName(headOfficeBranch.branch_name);
            setSelectedBranchId(headOfficeBranch.branch_id);
            console.log("Auto-selected Head Office branch:", headOfficeBranch);
          } else {
            // Fallback: if no "Head Office" found, select the first branch
            if (approvedBranches.length > 0) {
              setBranchName(approvedBranches[0].branch_name);
              setSelectedBranchId(approvedBranches[0].branch_id);
              console.log("Head Office not found, selected first branch:", approvedBranches[0]);
            }
          }
        }

      } catch (err) {
        console.error('Failed to load form data', err);
        toast({ title: 'Error', description: 'Failed to load customers/companies/branches', variant: 'destructive' });
      }
    };

    load();
  }, [module_id]);

  // Load items when branch is selected
  useEffect(() => {
    const loadItemsForBranch = async () => {
      if (!selectedBranchId) {
        setItems([]);
        return;
      }

      setIsLoadingItems(true);
      try {
        console.log('Loading items for branch ID:', selectedBranchId);
        const itemsData = await getItemsfordiscount(selectedBranchId);
        
        if (itemsData && Array.isArray(itemsData)) {
          // Transform the data to match expected format
          const formattedItems = itemsData.map((item: any) => ({
            item_id: item.item_id || item.id,
            item_name: item.item_name || item.name,
            price: item.price || item.unit_price || 0,
            unit_price: item.price || item.unit_price || 0,
            uom_id: item.uom_id || item.uom || 0,
            uom_name: item.uom_name || item.uom
          }));
          
          console.log('Loaded items:', formattedItems);
          setItems(formattedItems);
        } else {
          console.log('No items data received or invalid format:', itemsData);
          setItems([]);
        }
      } catch (error) {
        console.error('Failed to load items for branch:', error);
        toast({ 
          title: 'Error', 
          description: 'Failed to load items for selected branch', 
          variant: 'destructive' 
        });
        setItems([]);
      } finally {
        setIsLoadingItems(false);
      }
    };

    loadItemsForBranch();
  }, [selectedBranchId]);

  const handleSelectBranch = (branchName: string) => {
    setBranchName(branchName);
    const selectedBranch = branches.find(b => b.branch_name === branchName || b.name === branchName);
    if (selectedBranch) {
      const branchId = selectedBranch.id || selectedBranch.branch_id;
      setSelectedBranchId(branchId);
      console.log("Selected branch ID:", branchId);
      
      // Items will be loaded automatically via useEffect
    }
    
    // For module_id 3, also reset flock_id to 0
    if (module_id === 3) {
      setFlockid(0);
    }
  };

  const handleSelectFlock = (flock: any) => {
    setFlockid(Number(flock.flock_id));
    setOpenFlock(false);
  };

  const resetForm = () => {
    setCustomerId(0);
    setInvoiceDate('');
    setReturnDate(format(new Date(), 'yyyy-MM-dd'));
    setReturnQty(0);
    setDiscount(0);
    setTax(0);
    setTotalQty(0);
    setTotalAmount(0);
    setRemarks('');
    setCompanyName('');
    
    if (module_id === 3) {
      const headOfficeBranch = branches.find((br: any) => 
        br.branch_name.toLowerCase().includes('head office') || 
        br.branch_name.toLowerCase().includes('headoffice') ||
        br.branch_name.toLowerCase().includes('ho')
      );
      
      if (headOfficeBranch) {
        setBranchName(headOfficeBranch.branch_name);
        setSelectedBranchId(headOfficeBranch.branch_id);
      } else {
        setBranchName('');
        setSelectedBranchId(null);
      }
    } else {
      setBranchName('');
      setSelectedBranchId(null);
    }
    
    setFlockid(null);
    setReturnItems([{
      item_id: 0,
      returned_qty: 0,
      unit_price: 0,
      discount: 0,
      tax: 0,
      uom: 0,
      row_total: 0
    }]);
  };

  // Calculate totals when items change
  useEffect(() => {
    let totalQty = 0;
    let totalAmount = 0;
    let totalDiscount = 0;
    let totalTax = 0;

    returnItems.forEach(item => {
      totalQty += Number(item.returned_qty || 0);
      const itemTotal = (item.returned_qty * item.unit_price) - item.discount + item.tax;
      totalAmount += itemTotal;
      totalDiscount += item.discount;
      totalTax += item.tax;
    });

    setTotalQty(totalQty);
    setTotalAmount(totalAmount);
    setDiscount(totalDiscount);
    setTax(totalTax);
    setReturnQty(totalQty);
  }, [returnItems]);

  const addItemRow = () => {
    setReturnItems([...returnItems, {
      item_id: 0,
      returned_qty: 0,
      unit_price: 0,
      discount: 0,
      tax: 0,
      uom: 0,
      row_total: 0
    }]);
  };

  const removeItemRow = (index: number) => {
    const next = returnItems.filter((_, i) => i !== index);
    setReturnItems(next);
  };

  const handleSelectItem = (rowIndex: number, itemId: number) => {
    const copy = [...returnItems];
    // Find the selected item from loaded items
    const selectedItem = items.find((it) => Number(it.item_id) === Number(itemId));

    if (!selectedItem) {
      toast({
        title: "Error",
        description: "Selected item not found in items list",
        variant: "destructive",
      });
      return;
    }

    copy[rowIndex] = {
      ...copy[rowIndex],
      item_id: Number(itemId),
      item_name: selectedItem.item_name,
      unit_price: selectedItem.price || selectedItem.unit_price || 0,
      uom: selectedItem.uom_id || 0
    };

    // Recalculate row total
    copy[rowIndex].row_total = (copy[rowIndex].returned_qty * copy[rowIndex].unit_price) - copy[rowIndex].discount + copy[rowIndex].tax;

    setReturnItems(copy);
    setItemDropdown(null);
  };

  const handleChangeRow = (index: number, field: keyof ReturnItem, value: any) => {
    const copy = [...returnItems];
    const numericValue = ['returned_qty', 'unit_price', 'discount', 'tax'].includes(field)
      ? (value === '' ? 0 : Number(value))
      : value;

    copy[index] = {
      ...copy[index],
      [field]: numericValue
    } as ReturnItem;

    // Calculate row total
    const rowTotal = (copy[index].returned_qty * copy[index].unit_price) - copy[index].discount + copy[index].tax;
    copy[index].row_total = rowTotal;

    setReturnItems(copy);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    
    try {
      // Validation
      if (!customer_id || customer_id === 0) {
        toast({
          title: "Customer Required",
          description: "Please select a customer",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      const selectedCompany = companies.find(c => c.name === companyName || c.company_name === companyName);
      if (!selectedCompany?.id && !selectedCompany?.company_id) {
        toast({
          title: "Company Required",
          description: "Please select a company",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      const selectedBranch = branches.find(b => b.branch_name === branchName || b.name === branchName);
      if (!selectedBranch?.id && !selectedBranch?.branch_id) {
        toast({
          title: "Branch Required",
          description: "Please select a branch",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      if (returnItems.length === 0 || returnItems.every(item => item.item_id === 0)) {
        toast({
          title: "No Items",
          description: "Please add at least one returned item",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      const invalidItems = returnItems.filter((r) => {
        return !r.item_id || r.item_id === 0 || !r.returned_qty || r.returned_qty <= 0;
      });

      if (invalidItems.length > 0) {
        toast({
          title: "Item Validation Failed",
          description: "Please ensure all items have valid quantities",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      const itemsPayload = returnItems.map(it => ({
        item_id: it.item_id,
        returned_qty: it.returned_qty,
        unit_price: it.unit_price,
        discount: it.discount,
        tax: it.tax,
        uom: it.uom || 0
      }));

      if (editingReturn) {
        await onUpdate({
          sales_return_id: editingReturn.sales_return_id,
          customer_id,
          company_id: selectedCompany?.id || selectedCompany?.company_id || 0,
          branch_id: selectedBranch?.id || selectedBranch?.branch_id || 0,
          invoice_date,
          return_date,
          return_qty,
          discount,
          tax,
          total_qty,
          total_amount,
          remarks,
          items: itemsPayload
        });
      } else {
        await onSave({
          customer_id,
          company_id: selectedCompany?.id || selectedCompany?.company_id || 0,
          branch_id: selectedBranch?.id || selectedBranch?.branch_id || 0,
          invoice_date,
          return_date,
          return_qty,
          discount,
          tax,
          total_qty,
          total_amount,
          remarks,
          items: itemsPayload
        });
      }

    } catch (error) {
      console.error("Form submission failed", error);
      toast({ 
        title: "Error", 
        description: "Failed to save sales invoice return", 
        variant: "destructive" 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
      <div className="p-6 pt-2 max-w-6xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center">
          {editingReturn ? 'Edit Sales Invoice Return' : 'Sales Invoice Return'}
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
                <span className="text-xs text-gray-500">Branch Name</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button type="button" variant="outline" className="w-full justify-between">
                      {branchName || 'Select Branch'}
                      <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="max-h-[300px] overflow-auto">
                    <Command>
                      <CommandInput placeholder="Search branches..." />
                      <CommandEmpty>No branch</CommandEmpty>
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
                {isLoadingItems && selectedBranchId && (
                  <span className="text-xs text-blue-500 mt-1">Loading items...</span>
                )}
              </div>

              {module_id !== 3 && (
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500">Flock</span>
                  <Popover open={openFlock} onOpenChange={setOpenFlock}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" role="combobox" className="w-full justify-between">
                        {flock_id
                          ? flocks.find((f) => Number(f.flock_id) === flock_id)?.flock_name ?? "Select Flock"
                          : "Select Flock"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="max-h-[300px] overflow-auto p-0">
                      <Command>
                        <CommandInput placeholder="Search flock..." />
                        <CommandEmpty>No flock</CommandEmpty>
                        <CommandGroup>
                          {flocks.map((f) => (
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

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="block text-sm font-medium mb-1">Original Invoice Date</label>
                <Input
                  type="date"
                  value={invoice_date}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                  max={return_date}
                />
              </div>

              <div className="flex flex-col">
                <label className="block text-sm font-medium mb-1">Return Date</label>
                <Input
                  type="date"
                  value={return_date}
                  onChange={(e) => setReturnDate(e.target.value)}
                  min={invoice_date}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="block text-sm font-medium mb-1">Customer</label>
                <Popover open={customerOpen} onOpenChange={setCustomerOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      role="combobox"
                      className="w-full justify-between"
                    >
                      {customer_id
                        ? customers?.find((c) => String(c.customer_id) === String(customer_id))?.customer_name ?? "Select Customer"
                        : "Select Customer"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="max-h-[300px] overflow-auto">
                    <Command>
                      <CommandInput placeholder="Search customers..." />
                      <CommandEmpty>No customer</CommandEmpty>
                      <CommandGroup>
                        {customers.map((c) => (
                          <CommandItem
                            key={c.customer_id}
                            onSelect={() => {
                              setCustomerId(Number(c.customer_id));
                              setCustomerOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                customer_id === Number(c.customer_id) ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {c.customer_name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="flex flex-col">
              <span className="text-xs text-gray-500">Remarks</span>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="p-2 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
                placeholder="Enter return reason or remarks..."
              />
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Returned Items</h3>
            
            {!selectedBranchId ? (
              <div className="text-center p-4 border border-dashed border-gray-300 rounded-lg">
                <Package className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-500">Please select a branch to load items</p>
              </div>
            ) : items.length === 0 ? (
              <div className="text-center p-4 border border-dashed border-gray-300 rounded-lg">
                {isLoadingItems ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin h-6 w-6 mr-2 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Loading items...</span>
                  </div>
                ) : (
                  <>
                    <Package className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-500">No items available for the selected branch</p>
                  </>
                )}
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 w-full text-xs font-bold text-gray-600 border-b pb-2">
                  <div className="w-2/5">Item</div>
                  <div className="w-1/5 text-center">Return Qty</div>
                  <div className="w-1/5 text-center">Unit Price</div>
                  <div className="w-1/5 text-center">Discount</div>
                  <div className="w-1/5 text-center">Tax</div>
                  <div className="w-1/5 text-center">Row Total</div>
                  <div className="w-[30px] text-center">Action</div>
                </div>

                {returnItems.map((row, idx) => {
                  const selected = items.find((it) => Number(it.item_id) === Number(row.item_id));
                  const displayName = selected?.item_name || row.item_name || 'Select Item';

                  return (
                    <div key={idx} className="flex items-center gap-2 w-full">
                      <Popover open={itemDropdown === idx} onOpenChange={(open) => setItemDropdown(open ? idx : null)}>
                        <PopoverTrigger asChild>
                          <Button 
                            type="button" 
                            variant="outline" 
                            className="w-2/5 justify-between"
                            disabled={!selectedBranchId || isLoadingItems}
                          >
                            <div className="flex items-center justify-between w-full">
                              <span className="truncate">{displayName}</span>
                            </div>
                            <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="max-h-[300px] overflow-auto">
                          <Command>
                            <CommandInput placeholder="Search items..." />
                            <CommandEmpty>No items found</CommandEmpty>
                            <CommandGroup>
                              {items.map((it) => (
                                <CommandItem key={it.item_id} onSelect={() => handleSelectItem(idx, Number(it.item_id))}>
                                  <Check className={cn("mr-2 h-4 w-4", row.item_id === Number(it.item_id) ? "opacity-100" : "opacity-0")} />
                                  <div className="flex justify-between items-center w-full">
                                    <span className="truncate">{it.item_name}</span>
                                    <div className="flex flex-col text-xs text-gray-500 ml-2 text-right">
                                      <span>Price: {Number(it.price || 0).toLocaleString()}</span>
                                      {it.uom_name && <span>UOM: {it.uom_name}</span>}
                                    </div>
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </Command>
                        </PopoverContent>
                      </Popover>

                      <div className="flex flex-col w-1/5">
                        <Input
                          type="number"
                          className="w-full text-center"
                          min={0}
                          step="0.01"
                          value={row.returned_qty || 0}
                          onChange={(e) => handleChangeRow(idx, "returned_qty", e.target.value)}
                          disabled={!row.item_id || row.item_id === 0}
                        />
                      </div>

                      <div className="flex flex-col w-1/5">
                        <Input
                          type="number"
                          className="w-full text-center"
                          min={0}
                          step="0.01"
                          value={row.unit_price || 0}
                          onChange={(e) => handleChangeRow(idx, "unit_price", e.target.value)}
                          disabled={!row.item_id || row.item_id === 0}
                        />
                      </div>

                      <div className="flex flex-col w-1/5">
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

                      <div className="flex flex-col w-1/5">
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

                      <div className="flex flex-col w-1/5">
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
                
                <Button type="button" variant="secondary" onClick={addItemRow} disabled={!selectedBranchId || isLoadingItems}>
                  + Add Item
                </Button>
              </>
            )}
          </div>

          <div className="flex flex-col md:flex-row md:space-x-6 space-y-2 md:space-y-0 items-center justify-center text-gray-700 font-semibold">
            <div className="flex justify-end font-semibold text-gray-700">
              Total Return Qty: {total_qty.toLocaleString()}
            </div>
            <div className="flex justify-end font-semibold text-gray-700">
              Total Discount: {discount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="flex justify-end font-semibold text-gray-700">
              Total Tax: {tax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="flex justify-end font-semibold text-gray-700">
              Total Amount: {total_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-2 bg-gradient-to-r from-blue-500 to-blue-600"
              disabled={isSubmitting || !selectedBranchId || items.length === 0}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <svg className="animate-spin h-4 w-4 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {editingReturn ? 'Updating...' : 'Saving...'}
                </div>
              ) : (
                editingReturn ? 'Update' : 'Save'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SalesInvoiceReturn;