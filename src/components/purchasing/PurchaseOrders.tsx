import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Eye, Check, X, Edit, Trash2, Search, Package, ChevronsUpDown, CheckSquare, ArrowUp, Printer, Loader2 } from 'lucide-react';
import { useAppContext, Vendor } from '@/contexts/AppContext';
import { getPurchaseOrders, createPurchaseOrder, UpdatePOStatus, updatePurchaseOrder, UpdateNewPOStatus, getItemsfordiscount,deletePurchaseOrder } from '@/api/poApi';
import { getVendors } from '@/api/vendorsApi';
import { getCurrentUserId } from "@/components/security/LoginPage";
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
import { toast } from '@/hooks/use-toast';
import { getBranches } from '@/api/branchApi';
import { getFlockByBranch } from '@/api/flockApi';
import { getbirdsVehicles } from '@/api/birdsVehiclesApi';
import { getCompanyimg } from '@/api/purchaseInvoiceApi';

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
const permissions = JSON.parse(
  sessionStorage.getItem('role_permissions') || '{}'
);
// --- Interfaces ---
interface POItem {
  item_id: number;
  quantity: number;
  unit_price: number;
  uom_id?: number;
  uom_name?: string;
  discount: number;
  discount_percentage: number;
}

interface PO {
  po_id?: number;
  branch_id: number;
  branch_name: string;
  flock_id: number;
  flock_name: string;
  vendor_id?: number;
  vendor_name?: string;
  total_price?: number;
  status: string;
  vehicle_no:string;
  order_date?: string;
  updated_by: number;
  created_by: number;
  items?: POItem & Array<{
    vehicle_no: any; 
    item_id: number; 
    item_name?: string; 
    item_code: string; 
    quantity: number; 
    unit_price: number; 
    uom_id?: number; 
    uom_name?: string;
    discount: number;
    discount_percentage?: number;
  }>;
}

interface ViewingPO {
  po_id?: number;
  branch_id: number;
  branch_name: string;
  flock_id: number;
  flock_name: string;
  vendor_id?: number;
  vendor_name?: string;
  total_price?: number;
  status: string;
  vehicle_no:string;
  order_date?: string;
  updated_by: number;
  created_by: number;
  items?: Array<{ 
    item_id: number; 
    item_name?: string; 
    item_code: string; 
    quantity: number; 
    unit_price: number; 
    uom_id?: number; 
    uom_name?: string;
    discount: number;
    discount_percentage?: number;
  }>;
}

interface BirdsVehicle {
  vehicle_id: number;
  vehicle_name: string;
  vehicle_no?: string; 
  status?: string; 
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

interface Item {
  item_id: number;
  item_name: string;
  item_code: string;
  price?: number;
  uom_id?: number;
  uom_name?: string;
  discount?: number;
  discount_percentage?: number;
}

// --- PurchaseOrders Component ---
const PurchaseOrders: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'CREATED' | 'APPROVED'>('ALL');
const [startDate, setStartDate] = useState<string>(() => {
  const today = new Date().toISOString().split('T')[0];
  return today;
});

const [endDate, setEndDate] = useState<string>(() => {
  const today = new Date().toISOString().split('T')[0];
  return today;
});  const [showForm, setShowForm] = useState(false);
  const [purchaseOrders, setPurchaseOrders] = useState<PO[]>([]);
  const [editingPO, setEditingPO] = useState<PO | null>(null);
  const [selectedPOs, setSelectedPOs] = useState<number[]>([]);
  const [viewingPO, setViewingPO] = useState<ViewingPO | null>(null);
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Load purchase orders with date filters
  const loadPurchaseOrders = async (filterStartDate?: string, filterEndDate?: string) => {
    setIsLoading(true);
    try {
      const data = await getPurchaseOrders(filterStartDate, filterEndDate);
      console.log("Loaded POs:", data);
      setPurchaseOrders(data);
    } catch (error) {
      console.error("Error loading purchase orders", error);
      toast({ title: 'Error', description: 'Failed to load purchase orders', duration: 4000 });
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadPurchaseOrders();
    loadCompanyImage();
  }, []);

  // Apply date filter
  const handleApplyDateFilter = () => {
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      toast({ title: 'Error', description: 'Start date cannot be greater than end date', duration: 4000 });
      return;
    }
    loadPurchaseOrders(startDate, endDate);
  };
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
  // Clear date filter
  const handleClearDateFilter = () => {
    setStartDate('');
    setEndDate('');
    loadPurchaseOrders(); // Load without date filters
  };

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
const handlePrint = (po: PO) => {
    const printWindow = window.open("", "_blank", "width=900,height=1000");
    const orderDate = new Date(po.order_date);
    const formattedDate = `${orderDate.getDate()}-${orderDate.toLocaleString("default", {
        month: "short",
    })}-${String(orderDate.getFullYear()).slice(-2)}`;

    // Assuming totalAmount is the sum of all item totals (excluding freight)
    const totalAmount = Number(po.total_price || 0);
    // Keeping your original Grand Total calculation logic: total amount minus freight
    const grandTotal = totalAmount;


        


        //const graannndtotal = (grandTotal - freight );

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

    const logoSource = companyData?.image ;
    const companyName = companyData?.company_name || "Ahmad Poultry Farm";
    const companyAddress = companyData?.address || "";
    const companyPhone = companyData?.phone || "";
    const companyEmail = companyData?.email || "";
    const companyReg = companyData?.registration_number || "";

    const printContent = `
        <html>
            <head>
                <title>Purchase Invoice #${po.po_id}</title>
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
                        <h4>PURCHASE ORDER</h4>
                    </div>
                </div>

                <div class="top-bar">
                    <div>Date: ${formattedDate}</div>
                    <div>Order No: ${po.po_id}</div>
                </div>

                <table class="details-table">
                    <tr>
                    <td><strong>${module_id === 2 ? "Farm Name" : "Branch Name"}: </strong> ${po.branch_name || "N/A"}</td>
                    <td><strong>${module_id === 2 ? "Flock Name" : "Vendor Name"}: </strong> ${module_id === 2 ? po.flock_name || "N/A" : po.vendor_name || "N/A"}</td>

                        

                    </tr>
                   
                    <tr>
                    <td><strong>Status: </strong> ${po.status || "N/A"}</td>
                     <td><strong>Vehicle No:</strong> ${module_id === 2 ? (po.vehicle_no || "N/A") : "N/A"}</td>

                        
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
                              <th>Unit Price</th>
                              <th>Discount</th>
                              <th>Total</th>
                          </tr>
                      </thead>

                      <tbody>
                          ${
                              po.items?.map((item, index) => {
                                  const itemTotal = (item.quantity || 0) * (item.unit_price || 0);
                                  const discount = item.discount || 0;
                                  const rowTotal = itemTotal - discount;

                                  return `
                                      <tr>
                                          <td>${index + 1}</td>
                                          <td class="text-left">${item.item_name || "N/A"}</td>
                                          <td>${item.uom_name || "N/A"}</td>
                                          <td>${item.item_code || "N/A"}</td>
                                          <td>${item.quantity || 0}</td>
                                          <td>${(item.unit_price || 0).toLocaleString()}</td>
                                          <td>${discount.toLocaleString()}</td>
                                          <td>${rowTotal.toLocaleString()}</td>
                                      </tr>
                                  `;
                              }).join('')
                          }

                          <!-- TOTAL ROW -->
                          <tr>
                              <td colspan="7" style="text-align:right; font-weight:bold;">Total:</td>
                              <td style="font-weight:bold;">${totalAmount.toLocaleString()}</td>
                          </tr>

                          <!-- GRAND TOTAL ROW -->
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

  const handleViewPO = (po_id: number) => {
    const selectedPO = filteredPO.find(po => po.po_id === po_id);
    if (selectedPO) {
      setViewingPO(selectedPO as ViewingPO);
      console.log("Filter Viewing PO:", selectedPO);
      setViewDialogOpen(true);
    }
  };

  const user = JSON.parse(sessionStorage.getItem("user") || "{}");
  const userId = user.user_id || user.id;

  const toggleSelectPO = (po_id: number) => {
    setSelectedPOs((prev) =>
      prev.includes(po_id) ? prev.filter((id) => id !== po_id) : [...prev, po_id]
    );
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (selectedPOs.length === 0) {
      toast({ title: 'No PO Selected', description: 'Please select at least one Purchase Order.' ,duration: 4000});
      return;
    }

    try {
      await UpdatePOStatus(selectedPOs, newStatus);
      toast({ title: 'Status Updated', description: `Status changed to ${newStatus} successfully.` ,duration: 3000});
      setSelectedPOs([]);
      loadPurchaseOrders();
    } catch (err) {
      console.error('Status Update failed', err);
      toast({ title: 'Error', description: 'Failed to update PO status.',duration: 3000 });
    }
  };

  const handleNewStatusUpdate = async (newStatus: string) => {
    if (selectedPOs.length === 0) {
      toast({ title: 'No PO Selected', description: 'Please select at least one Purchase Order.' ,duration: 3000});
      return;
    }

    try {
      await UpdateNewPOStatus(selectedPOs, newStatus);
      toast({ title: 'Status Updated', description: `Status changed to ${newStatus} successfully.`,duration: 3000 });
      setSelectedPOs([]);
      loadPurchaseOrders();
    } catch (err) {
      console.error('Status Update failed', err);
      toast({ title: 'Error', description: 'Failed to update PO status.',duration: 3000 });
    }
  };

  const handleSavePO = async (payload: { 
    vendor_id: number;
    branch_id: number;
    flock_id: number;
    items: POItem[];
    total_amount: number;
    order_date: string;
    vehicle_number?: string;
  }) => {
    try {
      if (editingPO) {
        await updatePurchaseOrder(
          editingPO.po_id!,
          payload.branch_id,
          payload.flock_id,
          payload.vendor_id,
          editingPO.status,
          payload.total_amount,
          payload.items,
          payload.order_date,
          payload.vehicle_number
        );
        toast({ title: "Updated", description: "Purchase Order updated successfully!",duration: 3000 });
      } else {
        await createPurchaseOrder(
          payload.branch_id,
          payload.flock_id,
          payload.vendor_id,
          payload.total_amount,
          payload.items,
          payload.order_date,
          payload.vehicle_number
        );
        toast({ title: "Created", description: "Purchase Order created successfully!" ,duration: 3000});
      }

      setShowForm(false);
      setEditingPO(null);
      loadPurchaseOrders();

    } catch (err) {
      console.error("Save/Update PO failed", err);
      toast({ title: "Error", description: "Failed to save or update Purchase Order." ,duration: 3000});
    }
  };
const handleDeletePO = async (po_id: number) => {
        try {
            await deletePurchaseOrder(po_id);
            toast({
                title: "Deleted",
                description: `PO deleted successfully!.`,
                duration: 3000,
            });
            loadPurchaseOrders();
        } catch (error) {
            console.error("Error deleting PO:", error);
        }
    };
  const filteredPO = purchaseOrders.filter((po) => {
    const matchesSearch = po.vendor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         po.po_id?.toString().includes(searchTerm);
    const matchesStatus = statusFilter === 'ALL' || po.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPOs = purchaseOrders.length;
  const createdPOs = purchaseOrders.filter(po => po.status === 'CREATED').length;
  const totalValue = purchaseOrders.reduce((sum, po) => sum + Number(po.total_price || 0), 0);

  const branchFieldLabel = module_id === 3 ? "Branch" : "Farm";

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CREATED': return 'bg-yellow-100 text-yellow-800';
      case 'CLOSED': return 'bg-purple-600 text-white';
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* --- Stat Cards --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total POs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPOs}</div>
          </CardContent>
        </Card>
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Created POs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{createdPOs}</div>
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

      {/* --- Purchase Orders Table Card --- */}
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Purchase Orders
            </CardTitle>
            <div className="flex items-center gap-2">
             {module_id === 3 && permissions.purchasing_approve === 1 && (
                  <Button
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => handleStatusUpdate('APPROVED')}
                    disabled={selectedPOs.length === 0}
                    variant="outline"
                  >
                    Approve ({selectedPOs.length})
                  </Button>
                )}
                              
              {module_id === 2 && (
                <Button
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => handleNewStatusUpdate('APPROVED')}
                  disabled={selectedPOs.length === 0}
                  variant="outline"
                >
                  Approved ({selectedPOs.length})
                </Button>
              )}
              
              <Button
                onClick={() => setShowForm(true)}
                className="bg-gradient-to-r from-purple-500 to-indigo-400 text-primary">
                <Plus className="h-4 w-4 mr-1" />
                Create PO
              </Button>
            </div>
          </div>
          
          {/* Search and Filter Controls */}
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Date Filters */}
              <div className="flex flex-col md:flex-row gap-2">
                <div className="flex flex-col">
                  <Label htmlFor="startDate" className="text-sm mb-1">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full md:w-auto"
                  />
                </div>
                <div className="flex flex-col">
                  <Label htmlFor="endDate" className="text-sm mb-1">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full md:w-auto"
                  />
                </div>
                <div className="flex items-end gap-2">
                  <Button
                    onClick={handleApplyDateFilter}
                    disabled={isLoading}
                    className="bg-gradient-to-r from-purple-500 to-indigo-400 text-primary"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      'Apply Filter'
                    )}
                  </Button>
                  <Button
                    onClick={handleClearDateFilter}
                    variant="outline"
                    disabled={!startDate && !endDate}
                  >
                    Clear
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              {/* Search Input */}
              <div className="relative w-full md:w-1/3 min-w-[200px]">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search POs/Vendor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Status Filter */}
              <Select onValueChange={(value: 'ALL' | 'CREATED' | 'APPROVED') => setStatusFilter(value)} value={statusFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  <SelectItem value="CREATED">Created</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <span className="ml-2">Loading purchase orders...</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>PO NO</TableHead>
                  <TableHead>PO Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>
                    {module_id === 3 ? "Branch Name" : "Farm Name"}
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPO.length > 0 ? (
                  filteredPO.map((po) => (
                    <TableRow key={po.po_id}> 
                      <TableCell className="font-medium">{po.po_id}</TableCell>
                      <TableCell>
                        {new Date(po.order_date!).toLocaleString('en-PK', {
                          timeZone: 'Asia/Karachi',
                          year: 'numeric',
                          month: 'short',
                          day: '2-digit',
                        })}
                      </TableCell>
                      <TableCell>
                        {new Intl.NumberFormat('en-US').format(po.total_price)}
                      </TableCell>   
                      <TableCell className="font-medium">{po.branch_name}</TableCell>
                      <TableCell><Badge className={getStatusColor(po.status)}>{po.status}</Badge></TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 justify-end">
                          <input
                            type="checkbox"
                            checked={selectedPOs.includes(po.po_id!)}
                            onChange={() => toggleSelectPO(po.po_id!)}
                            title={`Select PO ${po.po_id}`}
                          />
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleViewPO(po.po_id!)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                             variant="outline"
                             onClick={() => handlePrint(po)}
                           >
                             <Printer className="h-4 w-4" />
                        </Button>
                          {po.status === "CREATED" && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                setEditingPO(po);
                                setShowForm(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          {po.status === "CREATED" && (
                            <Button
                            onClick={() => handleDeletePO(po.po_id)}
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
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">
                      No purchase orders found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {showForm && (
        <PurchaseOrderForm 
          po={editingPO} 
          onClose={() => { setShowForm(false); setEditingPO(null); }} 
          onSave={handleSavePO} 
        />
      )}

      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Purchase Order Details</DialogTitle>
          </DialogHeader>
          {viewingPO && (
            <>
              <table className="w-full border border-gray-300 mb-4 text-sm">
                <tbody>
                  <tr><td className="p-2 font-medium text-gray-600 border">PO Number</td><td className="p-2 border">{viewingPO.po_id}</td></tr>
                  <tr><td className="p-2 font-medium text-gray-600 border">Vehicle No</td><td className="p-2 border">{viewingPO.vehicle_no}</td></tr>
                  <tr><td className="p-2 font-medium text-gray-600 border">Order Date</td><td className="p-2 border">{viewingPO.order_date}</td></tr>
                  <tr><td className="p-2 font-medium text-gray-600 border">Status</td><td className="p-2 border">{viewingPO.status}</td></tr>
                  <tr><td className="p-2 font-medium text-gray-600 border">Total Amount</td><td className="p-2 border font-semibold text-blue-700">{Number(viewingPO.total_price).toLocaleString()}</td></tr>
                </tbody>
              </table>
      
              <h3 className="text-md font-semibold mb-2">Items</h3>
              <table className="w-full border border-gray-300 text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 border text-left">Item Name</th>
                    <th className="p-2 border text-left">Item Code</th>
                    <th className="p-2 border text-left">Quantity</th>
                    <th className="p-2 border text-left">Unit</th>
                    <th className="p-2 border text-left">Unit Price</th>
                    <th className="p-2 border text-left">Discount %</th>
                    <th className="p-2 border text-left">Discount Amount</th>
                    <th className="p-2 border text-left">Line Total</th>
                  </tr>
                </thead>
                <tbody>
                  {viewingPO.items?.map((item, index) => {
                    const discountPercentage = item.unit_price > 0 
                      ? ((item.discount || 0) / (item.unit_price * (item.quantity || 0))) * 100 
                      : 0;
                    const lineTotal = (item.quantity || 0) * (item.unit_price || 0) - (item.discount || 0);
                    return (
                      <tr key={index}>
                        <td className="p-2 border">{item.item_name ?? '-'}</td>
                        <td className="p-2 border">{item.item_code ?? '-'}</td>
                        <td className="p-2 border">{item.quantity}</td>
                        <td className="p-2 border">{item.uom_name ?? '-'}</td>
                        <td className="p-2 border">{item.unit_price}</td>
                        <td className="p-2 border">{discountPercentage.toFixed(2)}%</td>
                        <td className="p-2 border">{item.discount || 0}</td>
                        <td className="p-2 border font-semibold">{lineTotal.toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </>
          )}
        </DialogContent>
      </Dialog>

      {showScrollToTop && (
        <Button
          onClick={scrollToTop}
          size="icon"
          className="fixed bottom-6 right-6 z-50 rounded-full shadow-lg bg-blue-500 hover:bg-blue-600 transition-opacity duration-300"
          aria-label="Scroll to top"
        >
          <ArrowUp className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
};

interface PurchaseOrderFormProps {
  po: PO | null;
  onClose: () => void;
  onSave: (payload: {
    po_id?: number;
    branch_id: number;
    flock_id: number;
    vendor_id: number;
    items: POItem[];
    total_amount: number;
    order_date: string;
    vehicle_number?: string;
  }) => void;
}

export const PurchaseOrderForm: React.FC<PurchaseOrderFormProps> = ({ po, onClose, onSave }) => {
  const [vendors, setVendors] = useState<any[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [vehicles, setVehicles] = useState<BirdsVehicle[]>([]);
  
  const [vendorOpen, setVendorOpen] = useState(false);
  const [itemDropdown, setItemDropdown] = useState<number | null>(null);
  const [vehicleOpen, setVehicleOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [vendor_id, setVendorId] = useState<number>(0);
  const [poItems, setPoItems] = useState<POItem[]>([{ 
    item_id: 0, 
    quantity: 1, 
    unit_price: 0, 
    uom_id: 0, 
    uom_name: '', 
    discount: 0,
    discount_percentage: 0
  }]);
  const [flock_id, setFlockId] = useState<number>(0);
  const [flocks, setFlock] = useState([]);
  const [flockOpen, setFlockOpen] = useState(false);
  const [branch_id, setBranchId] = useState<number>(0);
  const [branches, setBranches] = useState([]);
  const [branchOpen, setBranchOpen] = useState(false);
  const [order_date, setOrderDate] = useState<string>('');
  const [vehicle_number, setVehicleNumber] = useState<string>('');
  const userId = getCurrentUserId();
  
  const showFlockField = module_id !== 3;
  const showVendorField = module_id !== 2;
  const showVehicleNumberField = module_id === 2;
  
  const totalAmount = useMemo(() => {
    return poItems.reduce((total, item) => {
      const lineTotal = (item.quantity || 0) * (item.unit_price || 0) - (item.discount || 0);
      return total + lineTotal;
    }, 0);
  }, [poItems]);

  useEffect(() => {
    (async () => {
      try {
        const [vendorsRes, branchData] = await Promise.all([getVendors(), getBranches()]);
        
        const approvedBranches = branchData.filter((branch: any) => 
          branch.status === 'APPROVED'
        );
        
        const vendorList = (vendorsRes as any)?.data ?? (vendorsRes as any) ?? [];
        const approvedVendors = vendorList.filter((vendor: any) => 
          vendor.status === 'APPROVED'
        );
        
        setVendors(approvedVendors);
        setBranches(approvedBranches);

        // Load vehicles if module_id is 2
        if (module_id === 2) {
          try {
            const vehiclesData = await getbirdsVehicles();
            console.log("Loaded vehicles:", vehiclesData);
            
            // Handle different response formats
            if (Array.isArray(vehiclesData)) {
              setVehicles(vehiclesData);
            } else if (vehiclesData && vehiclesData.data && Array.isArray(vehiclesData.data)) {
              setVehicles(vehiclesData.data);
            } else if (vehiclesData && typeof vehiclesData === 'object') {
              // If it's a single vehicle object, wrap it in array
              setVehicles([vehiclesData]);
            }
          } catch (vehicleErr) {
            console.error("Failed to load vehicles:", vehicleErr);
            setVehicles([]);
          }
        }

        if (po) {
          setBranchId(po.branch_id);
          setFlockId(po.flock_id);
          setVendorId(Number(po.vendor_id ?? 0));
          
          // Set vehicle number if it exists in PO
          if (po.items?.[0]?.vehicle_no) {
            setVehicleNumber(po.items[0].vehicle_no);
          }
          
          if (po.order_date) {
            const date = new Date(po.order_date);
            const formattedDate = date.toISOString().split('T')[0];
            setOrderDate(formattedDate);
          }
          
          setPoItems(
            (po.items ?? []).length
              ? po.items.map((it: any) => {
                  const discountPercentage = it.unit_price > 0 && it.quantity > 0 
                    ? ((it.discount || 0) / (it.unit_price * it.quantity)) * 100 
                    : 0;
                  
                  return {
                    item_id: Number(it.item_id),
                    quantity: Number(it.quantity),
                    unit_price: Number(it.unit_price ?? 0),
                    uom_id: Number(it.uom_id ?? 0),
                    uom_name: String(it.uom_name ?? ""),
                    discount: Number(it.discount ?? 0),
                    discount_percentage: discountPercentage
                  };
                })
              : [{ 
                  item_id: 0, 
                  quantity: 1, 
                  unit_price: 0, 
                  uom_id: 0, 
                  uom_name: '', 
                  discount: 0,
                  discount_percentage: 0
                }]
          );
        } else {
          // Set default values for new PO
          setVendorId(0);
          setPoItems([{ 
            item_id: 0, 
            quantity: 1, 
            unit_price: 0, 
            uom_id: 0, 
            uom_name: '', 
            discount: 0,
            discount_percentage: 0
          }]);
          const today = new Date().toISOString().split('T')[0];
          setOrderDate(today);
          
          // For module_id 3, find and set "Head Office" as default branch
          if (module_id === 3) {
            const headOfficeBranch = approvedBranches.find((br: any) => 
              br.branch_name.toLowerCase().includes('head office') || 
              br.branch_name.toLowerCase().includes('headoffice') ||
              br.branch_name.toLowerCase().includes('ho')
            );
            
            if (headOfficeBranch) {
              setBranchId(headOfficeBranch.branch_id);
              console.log("Auto-selected Head Office branch:", headOfficeBranch);
            } else {
              // Fallback: if no "Head Office" found, select the first branch
              if (approvedBranches.length > 0) {
                setBranchId(approvedBranches[0].branch_id);
                console.log("Head Office not found, selected first branch:", approvedBranches[0]);
              }
            }
          } else {
            // For other modules, set branch_id to 0
            setBranchId(0);
          }
          
          // Set flock_id to 0
          setFlockId(0);
        }
      } catch (err) {
        console.error("Failed loading vendors/items:", err);
      }
    })();
  }, [po]);

  useEffect(() => {
    if (branch_id) {
      const loadItems = async () => {
        try {
          const itemsRes = await getItemsfordiscount(branch_id);
          const rawItems = ((itemsRes as any)?.data ?? (itemsRes as any) ?? []) as any[];
          const normalizedItems: Item[] = rawItems.map((r) => ({
            item_id: Number(r.item_id),
            item_name: String(r.item_name ?? r.name ?? ""),
            item_code: String(r.item_code ?? r.code ?? ""),
            price: Number(r.price ?? r.unit_price ?? 0),
            uom_id: Number(r.uom_id ?? 0),
            uom_name: String(r.uom_name ?? r.uom ?? ""),
            discount: Number(r.discount ?? 0),
          }));
          setItems(normalizedItems);
        } catch (err) {
          console.error("Failed loading items for branch:", err);
        }
      };
      loadItems();
    }
  }, [branch_id]);

  useEffect(() => {
    if (!branch_id) {
      setFlock([]);
      setFlockId(0);
      return;
    }

    const loadFlocks = async () => {
      try {
        console.log(`Loading flocks for branch_id: ${branch_id}`);
        const flockData = await getFlockByBranch(branch_id);
        const validFlocks = Array.isArray(flockData) ? flockData : [];
        setFlock(validFlocks);

        if (!po) {
          if (validFlocks.length > 0) {
            setFlockId(0);
          } else {
            setFlockId(0);
          }
        } else {
          const currentFlockExists = validFlocks.some((fl: any) => fl.flock_id === po.flock_id);
          if (!currentFlockExists && validFlocks.length > 0) {
            setFlockId(validFlocks[0].flock_id);
          }
        }

        console.log(`Loaded ${validFlocks.length} flocks for branch ${branch_id}`);
        
      } catch (err) {
        console.error("Failed to load flocks for branch:", err);
        setFlock([]);
        setFlockId(0);
        
        toast({
          title: "Error",
          description: "Failed to load flocks for selected branch",
          variant: "destructive",
          duration: 3000
        });
      }
    };

    loadFlocks();
  }, [branch_id, po]);

  const addItemRow = () => setPoItems((p) => [...p, { 
    item_id: 0, 
    quantity: 1, 
    unit_price: 0, 
    uom_id: 0, 
    uom_name: '', 
    discount: 0,
    discount_percentage: 0
  }]);
  
  const removeItemRow = (index: number) => setPoItems((p) => p.filter((_, i) => i !== index));

  const handleSelectItem = (rowIndex: number, itemId: number) => {
    const selectedItem = items.find(item => item.item_id === itemId);
    if (selectedItem) {
      setPoItems((prev) => {
        const copy = [...prev];
        copy[rowIndex] = { 
          ...copy[rowIndex], 
          item_id: Number(itemId),
          unit_price: selectedItem.price || 0,
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

  const handleChangeRow = (index: number, field: keyof POItem, value: string | number) => {
    setPoItems((prev) => {
      const copy = [...prev];
      
      if (field === 'discount_percentage') {
        const numericValue = value === "" ? 0 : 
                           typeof value === 'string' ? parseFloat(value) || 0 : value;
        const quantity = copy[index].quantity || 0;
        const unitPrice = copy[index].unit_price || 0;
        const discountAmount = (quantity * unitPrice * numericValue) / 100;
        
        copy[index] = {
          ...copy[index],
          discount_percentage: numericValue,
          discount: discountAmount
        };
      } else if (field === 'quantity' || field === 'unit_price') {
        const numericValue = value === "" ? 0 : 
                           typeof value === 'string' ? parseFloat(value) || 0 : value;
        
        copy[index] = {
          ...copy[index],
          [field]: numericValue,
        };
        
        const quantity = field === 'quantity' ? numericValue : copy[index].quantity || 0;
        const unitPrice = field === 'unit_price' ? numericValue : copy[index].unit_price || 0;
        const discount = copy[index].discount || 0;
        
        if (quantity > 0 && unitPrice > 0) {
          const discountPercentage = (discount / (quantity * unitPrice)) * 100;
          copy[index].discount_percentage = discountPercentage;
        } else {
          copy[index].discount_percentage = 0;
        }
      } else if (field === 'discount') {
        const numericValue = value === "" ? 0 : 
                           typeof value === 'string' ? parseFloat(value) || 0 : value;
        const quantity = copy[index].quantity || 0;
        const unitPrice = copy[index].unit_price || 0;
        const discountPercentage = quantity > 0 && unitPrice > 0 
          ? (numericValue / (quantity * unitPrice)) * 100 
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
    
    if (showVendorField && (!vendor_id || vendor_id === 0)) {
      alert("Select vendor");
      return;
    }
    
    const finalFlockId = showFlockField ? flock_id : 0;
    const finalVendorId = showVendorField ? vendor_id : 0;
    
    if (poItems.length === 0 || poItems.some((r) => !r.item_id || r.item_id === 0 || r.quantity <= 0 || r.unit_price <= 0)) {
      alert("Add at least one item and ensure item, quantity, and unit price are valid (greater than 0).");
      return;
    }
    
    setIsLoading(true);
    try {
      await onSave({
        branch_id,
        flock_id: finalFlockId,
        vendor_id: finalVendorId,
        items: poItems,
        total_amount: totalAmount,
        po_id: po?.po_id,
        order_date,
        vehicle_number: showVehicleNumberField ? vehicle_number : undefined
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
        <h2 className="text-lg font-semibold mb-4">{po ? "Edit Purchase Order" : "Create Purchase Order"}</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Main Selectors with Border */}
          <div className="border p-4 rounded-lg space-y-4 md:space-y-0 md:space-x-4 md:flex">
            {/* Order Date */}
            <div className="flex flex-col flex-1">
              <span className="text-sm font-medium text-gray-700">PO Date</span>
              <Input
                type="date"
                value={order_date}
                onChange={(e) => setOrderDate(e.target.value)}
                className="w-full"
                required
              />
            </div>

            {/* Branch selector */}
            <div className="flex flex-col flex-1">
              <span className="text-sm font-medium text-gray-700">
                {module_id === 2 ? "Farms" : "Branch"}
              </span>
              <Popover open={branchOpen} onOpenChange={setBranchOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" className="w-full justify-between">
                    {branch_id
                      ? `${branches.find((br: any) => br.branch_id === branch_id)?.branch_name}`
                      : module_id === 2 ? "Select Farm" : "Select Branch"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="max-h-[300px] overflow-auto">
                  <Command>
                    <CommandInput placeholder={module_id === 2 ? "Search farms..." : "Search branches..."} className="text-black" />
                    <CommandEmpty>{module_id === 2 ? "No farm found." : "No branch found."}</CommandEmpty>
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

            {/* Flock selector - Conditionally rendered */}
            {showFlockField && (
              <div className="flex flex-col flex-1">
                <span className="text-sm font-medium text-gray-700">Flock</span>
                <Popover open={flockOpen} onOpenChange={setFlockOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" className="w-full justify-between">
                      {flock_id
                        ? `${flocks.find((fl: any) => fl.flock_id === flock_id)?.flock_name}`
                        : "Select Flock"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="max-h-[300px] overflow-auto">
                    <Command>
                      <CommandInput placeholder="Search flocks..." className="text-black" />
                      <CommandEmpty>No flock found.</CommandEmpty>
                      <CommandGroup>
                        {flocks.map((fl: any) => (
                          <CommandItem
                            key={fl.flock_id}
                            className="hover:bg-gray-100"
                            onSelect={() => {
                              setFlockId(fl.flock_id);
                              setFlockOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                flock_id === fl.flock_id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {fl.flock_name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            )}


            

            {/* Vehicle Number - Only for module_id 2, replaced with select dropdown */}
            {showVehicleNumberField && (
              <div className="flex flex-col flex-1">
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
              </div>
            )}




            {/* Vendor selector - Conditionally rendered */}
            {showVendorField && (
              <div className="flex flex-col flex-1">
                <span className="text-sm font-medium text-gray-700">Vendor</span>
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
            )}
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
              <span className="w-[40px] text-center"></span>
            </div>
            {poItems.map((row, idx) => {
              const selectedItem = items.find((it) => Number(it.item_id) === Number(row.item_id));
              const lineTotal = (row.quantity || 0) * (row.unit_price || 0) - (row.discount || 0);
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
                              {it.item_name} - {it.price} ({it.uom_name}) {it.discount ? `- Discount: ${it.discount}` : ''}
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
                      value={row.quantity === 0 ? "" : row.quantity}
                      onChange={(e) => handleChangeRow(idx, "quantity", e.target.value)}
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

                  {/* Always render the button container, but conditionally show/hide the button */}
                  <div className="w-[40px] flex justify-center">
                    {poItems.length > 1 && (
                      <Button
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => removeItemRow(idx)}
                        className="p-0 h-8 w-8"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}

            <Button type="button" variant="default" onClick={addItemRow}>
              <Plus className="h-4 w-4 mr-1" /> Add Item
            </Button>
          </div>
          
          <div className="flex justify-end mt-4 pt-4 border-t">
            <div className="flex flex-col w-full max-w-[350px] space-y-2">
              <div className="flex justify-between items-center text-base font-semibold p-2 border border-purple-500 rounded-lg bg-lightGreyColor">
                <span>Total Amount:</span>
                <span className="text-secondary">{totalAmount.toLocaleString('en-PK', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-purple-500 to-indigo-400 text-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Inserting...
                </>
              ) : (
                "Save PO"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PurchaseOrders;