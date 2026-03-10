/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { getPurchaseOrders, createPurchaseOrder, UpdatePOStatus, updatePurchaseOrder, UpdateNewPOStatus, getItemsfordiscount, deletePurchaseOrder } from '@/api/poApi';
import { getVendors } from '@/api/vendorsApi';
import { getCurrentUserId } from "@/components/security/LoginPage";
import { fetchProducts } from '@/core/services/api/fetchProducts'; 
import { getUOM } from '@/api/departmentApi';
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
  item_name?: string;
  item_code?: string;
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
  vehicle_no: string;
  order_date?: string;
  updated_by: number;
  created_by: number;
  items?: Array<{
    item_id: number;
    item_name?: string;
    item_code?: string;
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
  vehicle_no: string;
  order_date?: string;
  updated_by: number;
  created_by: number;
  items?: Array<{ 
    item_id: number; 
    item_name?: string; 
    item_code?: string; 
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
  uom_id?: number;
  uom_name?: string;
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
  });
  const [showForm, setShowForm] = useState(false);
  const [purchaseOrders, setPurchaseOrders] = useState<PO[]>([]);
  const [editingPO, setEditingPO] = useState<PO | null>(null);
  const [selectedPOs, setSelectedPOs] = useState<number[]>([]);
  const [viewingPO, setViewingPO] = useState<ViewingPO | null>(null);
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Add these state variables for items cache
  const [itemsCache, setItemsCache] = useState<Item[]>([]);
  const [productsCache, setProductsCache] = useState<Item[]>([]);
  
  // Load purchase orders with date filters
 // Load purchase orders with date filters - FIXED VERSION
const loadPurchaseOrders = async (filterStartDate?: string, filterEndDate?: string) => {
  setIsLoading(true);
  try {
    const data = await getPurchaseOrders(filterStartDate, filterEndDate);
    console.log("Loaded POs - Raw data:", data);
    
    // Fetch product details for each item
    const enrichedData = await Promise.all(
      data.map(async (po: PO) => {
        if (po.items && po.items.length > 0) {
          const enrichedItems = await Promise.all(
            po.items.map(async (item) => {
              // Product details fetch karein
              const productDetails = await fetchItemDetails(item.item_id);
              if (productDetails) {
                return {
                  ...item,
                  item_name: productDetails.item_name,
                  item_code: productDetails.item_code,
                  uom_name: productDetails.uom_name || item.uom_name
                };
              }
              return item;
            })
          );
          return { ...po, items: enrichedItems };
        }
        return po;
      })
    );
    
    console.log("Enriched POs:", enrichedData);
    setPurchaseOrders(enrichedData);
  } catch (error) {
    console.error("Error loading purchase orders", error);
    toast({ title: 'Error', description: 'Failed to load purchase orders', duration: 4000 });
  } finally {
    setIsLoading(false);
  }
};

  // Load items cache on component mount
  useEffect(() => {
    loadItemsCache();
    loadProductsCache();
  }, []);

  const loadItemsCache = async () => {
    try {
      // You might want to load items for a default branch or all branches
      // For now, we'll just set an empty array
      setItemsCache([]);
    } catch (error) {
      console.error("Failed to load items cache:", error);
    }
  };

  const loadProductsCache = async () => {
    try {
      const productsData = await fetchProducts();
      let productsList = [];
      if (Array.isArray(productsData)) {
        productsList = productsData;
      } else if (productsData?.data && Array.isArray(productsData.data)) {
        productsList = productsData.data;
      } else if (productsData?.products && Array.isArray(productsData.products)) {
        productsList = productsData.products;
      }
      
      const transformedProducts: Item[] = productsList.map((p: any) => ({
        item_id: Number(p.id || p.product_id || p.item_id || 0),
        item_name: String(p.name || p.product_name || p.item_name || ''),
        item_code: String(p.code || p.product_code || p.item_code || ''),
        uom_id: Number(p.uom_id || p.unit_id || 0),
        uom_name: String(p.uom_name || p.unit_name || p.uom || ''),
      }));
      
      setProductsCache(transformedProducts);
    } catch (error) {
      console.error("Failed to load products cache:", error);
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
    loadPurchaseOrders();
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

  const totalAmount = Number(po.total_price || 0);
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
          if (n < 100)
              return b[Math.floor(n / 10)] + (n % 10 ? ' ' + a[n % 10] : '');
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
  const companyName = companyData?.company_name || "Ahmad Poultry Farm";
  const companyAddress = companyData?.address || "";
  const companyPhone = companyData?.phone || "";
  const companyEmail = companyData?.email || "";
  const companyReg = companyData?.registration_number || "";

  // Generate items HTML with product details from cache
  const itemsHtml = po.items && po.items.length > 0 
    ? po.items.map((item, index) => {
        // Pehle PO item se lene ki koshish karein, nahi to cache se
        let itemName = item.item_name || item.itemName;
        let itemCode = item.item_code || item.itemCode;
        let uomName = item.uom_name || item.uomName;
        
        // Agar PO item mein nahi hai to cache se lein
        if ((!itemName || itemName === '') && item.item_id) {
          const cachedItem = productsCache.find(p => p.item_id === item.item_id);
          if (cachedItem) {
            itemName = cachedItem.item_name;
            itemCode = cachedItem.item_code;
            uomName = cachedItem.uom_name || uomName;
          }
        }
        
        // Final fallback
        itemName = itemName || `Item #${item.item_id}`;
        itemCode = itemCode || '-';
        uomName = uomName || '-';
        
        const quantity = Number(item.quantity || 0);
        const unitPrice = Number(item.unit_price || item.unitPrice || 0);
        const discount = Number(item.discount || 0);
        const itemTotal = quantity * unitPrice;
        const rowTotal = itemTotal - discount;

        return `
          <tr>
              <td>${index + 1}</td>
              <td class="text-left">${itemName}</td>
              <td>${uomName}</td>
              <td>${itemCode}</td>
              <td>${quantity}</td>
              <td>${unitPrice.toLocaleString()}</td>
              <td>${discount.toLocaleString()}</td>
              <td>${rowTotal.toLocaleString()}</td>
          </tr>
        `;
      }).join('')
    : '<tr><td colspan="8" class="text-center">No items found</td></tr>';

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
                            <th>Product Name</th>
                            <th>Unit</th>
                            <th>Product Code</th>
                            <th>Ordered Qty</th>
                            <th>Unit Price</th>
                            <th>Discount</th>
                            <th>Total</th>
                        </tr>
                    </thead>

                    <tbody>
                        ${itemsHtml}

                        <tr>
                            <td colspan="7" style="text-align:right; font-weight:bold;">Total:</td>
                            <td style="font-weight:bold;">${totalAmount.toLocaleString()}</td>
                        </tr>

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

  // Updated fetchItemDetails to use productsCache properly
const fetchItemDetails = async (itemId: number) => {
  try {
    console.log("Fetching details for item ID:", itemId);
    
    // Pehle productsCache mein dekhein
    if (productsCache.length > 0) {
      const found = productsCache.find(item => item.item_id === itemId);
      if (found) {
        console.log("Found in productsCache:", found);
        return found;
      }
    }
    
    // Agar cache mein nahi mila to products fetch karein
    try {
      const productsData = await fetchProducts();
      let productsList = [];
      if (Array.isArray(productsData)) {
        productsList = productsData;
      } else if (productsData?.data && Array.isArray(productsData.data)) {
        productsList = productsData.data;
      } else if (productsData?.products && Array.isArray(productsData.products)) {
        productsList = productsData.products;
      }
      
      // Transform all products to cache
      const transformedProducts = productsList.map((p: any) => ({
        item_id: Number(p.id || p.product_id || p.item_id || 0),
        item_name: String(p.name || p.product_name || p.item_name || ''),
        item_code: String(p.code || p.product_code || p.item_code || ''),
        uom_id: Number(p.uom_id || p.unit_id || 0),
        uom_name: String(p.uom_name || p.unit_name || p.uom || ''),
      }));
      
      // Update cache
      setProductsCache(transformedProducts);
      
      // Find the specific item
      const found = transformedProducts.find(p => p.item_id === itemId);
      if (found) {
        return found;
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
    
    console.log("Item not found in products:", itemId);
    return null;
  } catch (error) {
    console.error("Failed to fetch item details:", error);
    return null;
  }
};
  // Updated handleViewPO
const handleViewPO = async (po_id: number) => {
  const selectedPO = filteredPO.find(po => po.po_id === po_id);
  if (selectedPO) {
    console.log("Original PO items:", selectedPO.items);
    
    // Create a deep copy
    const enrichedPO = { ...selectedPO };
    
    // If items exist, ensure they have proper UOM names
    if (enrichedPO.items && enrichedPO.items.length > 0) {
      const enrichedItems = await Promise.all(
        enrichedPO.items.map(async (item) => {
          // Create a copy of the item
          const enrichedItem = { ...item };
          
          // If uom_id exists but uom_name is missing, try to get it from uomList
          if (enrichedItem.uom_id && (!enrichedItem.uom_name || enrichedItem.uom_name === '')) {
            const foundUOM = uomList.find(u => u.uom_id === enrichedItem.uom_id);
            if (foundUOM) {
              enrichedItem.uom_name = foundUOM.uom_name;
            }
          }
          
          // If item_name is missing, try to fetch it
          if (enrichedItem.item_id && (!enrichedItem.item_name || enrichedItem.item_name === '')) {
            const itemDetails = await fetchItemDetails(enrichedItem.item_id);
            if (itemDetails) {
              enrichedItem.item_name = itemDetails.item_name;
              enrichedItem.item_code = itemDetails.item_code;
              if (!enrichedItem.uom_name && itemDetails.uom_name) {
                enrichedItem.uom_name = itemDetails.uom_name;
              }
            }
          }
          
          return enrichedItem;
        })
      );
      enrichedPO.items = enrichedItems;
    }
    
    setViewingPO(enrichedPO as ViewingPO);
    console.log("Enriched PO for viewing:", enrichedPO);
    setViewDialogOpen(true);
  }
};

  const user = JSON.parse(sessionStorage.getItem("user") || "{}");
  const userId = user.user_id || user.id;

  // Updated toggleSelectPO function
  const toggleSelectPO = (po_id: number) => {
    setSelectedPOs((prev) =>
      prev.includes(po_id) ? prev.filter((id) => id !== po_id) : [...prev, po_id]
    );
  };

  // Add select all functionality
  const toggleSelectAll = () => {
    if (selectedPOs.length === filteredPO.length) {
      setSelectedPOs([]);
    } else {
      setSelectedPOs(filteredPO.map(po => po.po_id!).filter(id => id !== undefined));
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (selectedPOs.length === 0) {
      toast({ title: 'No PO Selected', description: 'Please select at least one Purchase Order.', duration: 4000 });
      return;
    }

    try {
      await UpdatePOStatus(selectedPOs, newStatus);
      toast({ title: 'Status Updated', description: `Status changed to ${newStatus} successfully.`, duration: 3000 });
      setSelectedPOs([]);
      loadPurchaseOrders();
    } catch (err) {
      console.error('Status Update failed', err);
      toast({ title: 'Error', description: 'Failed to update PO status.', duration: 3000 });
    }
  };

  const handleNewStatusUpdate = async (newStatus: string) => {
    if (selectedPOs.length === 0) {
      toast({ title: 'No PO Selected', description: 'Please select at least one Purchase Order.', duration: 3000 });
      return;
    }

    try {
      await UpdateNewPOStatus(selectedPOs, newStatus);
      toast({ title: 'Status Updated', description: `Status changed to ${newStatus} successfully.`, duration: 3000 });
      setSelectedPOs([]);
      loadPurchaseOrders();
    } catch (err) {
      console.error('Status Update failed', err);
      toast({ title: 'Error', description: 'Failed to update PO status.', duration: 3000 });
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
  // ADD THIS CONSOLE LOG
  console.log("Saving PO with items:", payload.items.map(item => ({
    item_id: item.item_id,
    item_name: item.item_name,
    uom_id: item.uom_id,
    uom_name: item.uom_name
  })));
  
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
      toast({ title: "Updated", description: "Purchase Order updated successfully!", duration: 3000 });
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
      toast({ title: "Created", description: "Purchase Order created successfully!", duration: 3000 });
    }

    setShowForm(false);
    setEditingPO(null);
    loadPurchaseOrders();

  } catch (err) {
    console.error("Save/Update PO failed", err);
    toast({ title: "Error", description: "Failed to save or update Purchase Order.", duration: 3000 });
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
      {/* Stat Cards */}
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

      {/* Purchase Orders Table Card */}
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Purchase Orders
            </CardTitle>
            <div className="flex items-center gap-2">
              {/* Approve and Unapprove buttons - only show when items are selected */}
              {selectedPOs.length > 0 && (
                <div className="flex items-center gap-2 mr-2 border-r pr-2">
                  {/* Approve Button */}
                  <Button
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => {
                      if (module_id === 2) {
                        handleNewStatusUpdate('APPROVED');
                      } else {
                        handleStatusUpdate('APPROVED');
                      }
                    }}
                    size="sm"
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Approve ({selectedPOs.length})
                  </Button>
                  
                  {/* Unapprove Button - This will change status back to CREATED */}
                  {/* <Button
                    className="bg-red-600 hover:bg-red-700 text-white"
                    onClick={() => {
                      if (module_id === 2) {
                        handleNewStatusUpdate('CREATED');
                      } else {
                        handleStatusUpdate('CREATED');
                      }
                    }}
                    size="sm"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Unapprove ({selectedPOs.length})
                  </Button> */}
                </div>
              )}
              
              <Button
                onClick={() => setShowForm(true)}
                className="bg-gradient-to-r from-purple-500 to-indigo-400 text-primary"
              >
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
                  <TableHead className="w-[50px]">
                    <input
                      type="checkbox"
                      checked={selectedPOs.length === filteredPO.length && filteredPO.length > 0}
                      onChange={toggleSelectAll}
                      title="Select all POs"
                      className="cursor-pointer"
                    />
                  </TableHead>
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
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedPOs.includes(po.po_id!)}
                          onChange={() => toggleSelectPO(po.po_id!)}
                          title={`Select PO ${po.po_id}`}
                          className="cursor-pointer"
                        />
                      </TableCell>
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
                        {new Intl.NumberFormat('en-US').format(po.total_price || 0)}
                      </TableCell>   
                      <TableCell className="font-medium">{po.branch_name}</TableCell>
                      <TableCell><Badge className={getStatusColor(po.status)}>{po.status}</Badge></TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 justify-end">
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
                          {/* Only show Edit and Delete buttons when status is CREATED */}
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

                          {/* Delete button for both CREATED and APPROVED status */}
                          {(po.status === "CREATED" || po.status === "APPROVED") && (
                            <Button
                              onClick={() => handleDeletePO(po.po_id!)}
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
                    <TableCell colSpan={8} className="text-center py-4">
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
                  <tr>
                    <td className="p-2 font-medium text-gray-600 border">PO Number</td>
                    <td className="p-2 border">{viewingPO.po_id}</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-medium text-gray-600 border">Order Date</td>
                    <td className="p-2 border">{new Date(viewingPO.order_date || '').toLocaleDateString()}</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-medium text-gray-600 border">Status</td>
                    <td className="p-2 border">{viewingPO.status}</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-medium text-gray-600 border">Total Amount</td>
                    <td className="p-2 border font-semibold text-blue-700">{Number(viewingPO.total_price).toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
      
              <h3 className="text-md font-semibold mb-2">Products</h3>
              <table className="w-full border border-gray-300 text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 border text-left">Product Name</th>
                    <th className="p-2 border text-left">Product Code</th>
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
                    const quantity = Number(item.quantity || 0);
                    const unitPrice = Number(item.unit_price || 0);
                    const discount = Number(item.discount || 0);
                    const discountPercentage = quantity > 0 && unitPrice > 0 
                      ? (discount / (quantity * unitPrice)) * 100 
                      : 0;
                    const lineTotal = (quantity * unitPrice) - discount;
                    
                    return (
                      <tr key={index}>
                        <td className="p-2 border">{item.item_name || `Item #${item.item_id}`}</td>
                        <td className="p-2 border">{item.item_code || '-'}</td>
                        <td className="p-2 border">{quantity}</td>
                        <td className="p-2 border">{item.uom_name || '-'}</td>
                        <td className="p-2 border">{unitPrice.toFixed(2)}</td>
                        <td className="p-2 border">{discountPercentage.toFixed(2)}%</td>
                        <td className="p-2 border">{discount.toFixed(2)}</td>
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
  const [products, setProducts] = useState<Item[]>([]); // Products from API
  const [vehicles, setVehicles] = useState<BirdsVehicle[]>([]);
  // ADDED: UOM state variables
  const [uomList, setUomList] = useState<any[]>([]);
  const [uomLoading, setUomLoading] = useState(false);
  
  const [vendorOpen, setVendorOpen] = useState(false);
  const [itemDropdown, setItemDropdown] = useState<number | null>(null);
  const [vehicleOpen, setVehicleOpen] = useState(false);
  // ADDED: UOM dropdown state
  const [uomDropdown, setUomDropdown] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);

  const [vendor_id, setVendorId] = useState<number>(0);
  // UPDATED: Added item_name and item_code to initial state
  const [poItems, setPoItems] = useState<POItem[]>([{ 
    item_id: 0, 
    item_name: '',
    item_code: '',
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

  // ADDED: Fetch UOMs on component mount
  useEffect(() => {
  const loadUOMs = async () => {
    try {
      const response = await getUOM();
      let uomData = [];
      if (response?.data && Array.isArray(response.data)) {
        uomData = response.data;
      } else if (Array.isArray(response)) {
        uomData = response;
      }
      setUomList(uomData);
    } catch (error) {
      console.error("Failed to load UOMs:", error);
    }
  };
  
  loadUOMs();
}, []);

  useEffect(() => {
    const loadProducts = async () => {
      setProductsLoading(true);
      try {
        const productsData = await fetchProducts();
        console.log("Raw products data:", productsData);
        
        // Handle different response formats
        let productsList = [];
        if (Array.isArray(productsData)) {
          productsList = productsData;
        } else if (productsData?.data && Array.isArray(productsData.data)) {
          productsList = productsData.data;
        } else if (productsData?.products && Array.isArray(productsData.products)) {
          productsList = productsData.products;
        }
        
        // Transform to match Item interface - ONLY item details, NO price/discount
        const transformedProducts: Item[] = productsList.map((p: any) => ({
          item_id: Number(p.id || p.product_id || p.item_id || 0),
          item_name: String(p.name || p.product_name || p.item_name || ''),
          item_code: String(p.code || p.product_code || p.item_code || ''),
          uom_id: Number(p.uom_id || p.unit_id || 0),
          uom_name: String(p.uom_name || p.unit_name || p.uom || ''),
        }));
        
        console.log("Transformed products (without price):", transformedProducts);
        setProducts(transformedProducts);
        
      } catch (error) {
        console.error("Failed to load products:", error);
        toast({
          title: "Error",
          description: "Failed to load products",
          variant: "destructive",
        });
      } finally {
        setProductsLoading(false);
      }
    };

    loadProducts();
  }, []);

  useEffect(() => {
  (async () => {
    try {
      const [vendorsRes, branchData] = await Promise.all([getVendors(), getBranches()]);
      
      // Show both CREATED and APPROVED branches
      const availableBranches = branchData.filter((branch: any) => 
        branch.status === 'APPROVED' || branch.status === 'CREATED'
      );
      
      // Show both CREATED and APPROVED vendors
      const vendorList = (vendorsRes as any)?.data ?? (vendorsRes as any) ?? [];
      const availableVendors = vendorList.filter((vendor: any) => 
        vendor.status === 'APPROVED' || vendor.status === 'CREATED'
      );
      
      console.log("Available vendors:", availableVendors);
      console.log("Available branches:", availableBranches);
      
      setVendors(availableVendors);
      setBranches(availableBranches);

      // Load vehicles if module_id is 2
      if (module_id === 2) {
        try {
          const vehiclesData = await getbirdsVehicles();
          console.log("Loaded vehicles:", vehiclesData);
          
          if (Array.isArray(vehiclesData)) {
            setVehicles(vehiclesData);
          } else if (vehiclesData && vehiclesData.data && Array.isArray(vehiclesData.data)) {
            setVehicles(vehiclesData.data);
          } else if (vehiclesData && typeof vehiclesData === 'object') {
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
                  item_name: it.item_name || '',
                  item_code: it.item_code || '',
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
                item_name: '',
                item_code: '',
                quantity: 1, 
                unit_price: 0, 
                uom_id: 0, 
                uom_name: '', 
                discount: 0,
                discount_percentage: 0
              }]
        );
      } else {
        setVendorId(0);
        setPoItems([{ 
          item_id: 0, 
          item_name: '',
          item_code: '',
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
          const headOfficeBranch = availableBranches.find((br: any) => 
            br.branch_name?.toLowerCase().includes('head office') || 
            br.branch_name?.toLowerCase().includes('headoffice') ||
            br.branch_name?.toLowerCase().includes('ho')
          );
          
          if (headOfficeBranch) {
            setBranchId(headOfficeBranch.branch_id);
            console.log("Auto-selected Head Office branch:", headOfficeBranch);
          } else {
            if (availableBranches.length > 0) {
              setBranchId(availableBranches[0].branch_id);
              console.log("Head Office not found, selected first branch:", availableBranches[0]);
            }
          }
        } else {
          setBranchId(0);
        }
        
        setFlockId(0);
      }
    } catch (err) {
      console.error("Failed loading vendors/items:", err);
      toast({
        title: "Error",
        description: "Failed to load vendors or branches",
        variant: "destructive",
      });
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
        
        // toast({
        //   title: "Error",
        //   description: "Failed to load flocks for selected branch",
        //   variant: "destructive",
        //   duration: 3000
        // });
      }
    };

    loadFlocks();
  }, [branch_id, po]);

  // UPDATED: Added item_name and item_code to addItemRow
  const addItemRow = () => setPoItems((p) => [...p, { 
    item_id: 0, 
    item_name: '',
    item_code: '',
    quantity: 1, 
    unit_price: 0, 
    uom_id: 0, 
    uom_name: '', 
    discount: 0,
    discount_percentage: 0
  }]);
  
  const removeItemRow = (index: number) => setPoItems((p) => p.filter((_, i) => i !== index));

  // UPDATED: Added item_name and item_code to handleSelectItem
  const handleSelectItem = (rowIndex: number, itemId: number) => {
    // Search in both items and products
    const allItems = [...items, ...products];
    const selectedItem = allItems.find(item => item.item_id === itemId);
    
    if (selectedItem) {
      setPoItems((prev) => {
        const copy = [...prev];
        copy[rowIndex] = { 
          ...copy[rowIndex], 
          item_id: Number(itemId),
          item_name: selectedItem.item_name,
          item_code: selectedItem.item_code,
          unit_price: copy[rowIndex].unit_price || 0,
          uom_id: selectedItem.uom_id || 0,
          uom_name: selectedItem.uom_name || '',
          discount: copy[rowIndex].discount || 0,
          discount_percentage: copy[rowIndex].discount_percentage || 0
        };
        return copy;
      });
    }
    setItemDropdown(null);
  };

  // ADDED: UOM selection handler
  const handleSelectUOM = (rowIndex: number, uomId: number, uomName: string) => {
    setPoItems((prev) => {
      const copy = [...prev];
      copy[rowIndex] = {
        ...copy[rowIndex],
        uom_id: uomId,
        uom_name: uomName
      };
      return copy;
    });
    setUomDropdown(null);
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
              // Combine items and products for display
              const allItems = [...items, ...products];
              const selectedItem = allItems.find((it) => Number(it.item_id) === Number(row.item_id));
              const lineTotal = (row.quantity || 0) * (row.unit_price || 0) - (row.discount || 0);
              return (
                <div key={idx} className="flex items-center gap-2">
                  <Popover open={itemDropdown === idx} onOpenChange={(open) => setItemDropdown(open ? idx : null)}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-1/3 justify-between" disabled={productsLoading}>
                        {productsLoading ? (
                          "Loading products..."
                        ) : row.item_id ? (
                          selectedItem?.item_name ?? "Selected item"
                        ) : (
                          "Select Item"
                        )}
                        <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="max-h-[300px] overflow-auto">
                      <Command>
                        <CommandInput placeholder="Search items..." />
                        <CommandEmpty>
                          {productsLoading ? "Loading products..." : "No items found"}
                        </CommandEmpty>
                        <CommandGroup>
                          {productsLoading ? (
                            <div className="flex items-center justify-center p-4">
                              <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
                              <span className="ml-2">Loading products...</span>
                            </div>
                          ) : (
                            // Combine both items and products, remove duplicates
                            [...new Map([...items, ...products].map(item => [item.item_id, item])).values()]
                              .map((it) => (
                                <CommandItem 
                                  key={it.item_id} 
                                  onSelect={() => handleSelectItem(idx, Number(it.item_id))}
                                >
                                  <Check className={cn("mr-2 h-4 w-4", row.item_id === Number(it.item_id) ? "opacity-100" : "opacity-0")} />
                                  {it.item_name} ({it.item_code}) - {it.uom_name || 'N/A'}
                                </CommandItem>
                              ))
                          )}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>

                  {/* REPLACED: Unit input with UOM dropdown */}
                  <Popover open={uomDropdown === idx} onOpenChange={(open) => setUomDropdown(open ? idx : null)}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-[100px] justify-between" disabled={uomLoading}>
                        {uomLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : row.uom_name ? (
                          row.uom_name
                        ) : (
                          "Unit"
                        )}
                        <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="max-h-[300px] overflow-auto">
                      <Command>
                        <CommandInput placeholder="Search units..." />
                        <CommandEmpty>
                          {uomLoading ? "Loading units..." : "No units found"}
                        </CommandEmpty>
                        <CommandGroup>
                          {uomLoading ? (
                            <div className="flex items-center justify-center p-4">
                              <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
                              <span className="ml-2">Loading units...</span>
                            </div>
                          ) : (
                            uomList.map((uom) => (
                              <CommandItem 
                                key={uom.uom_id} 
                                onSelect={() => handleSelectUOM(idx, uom.uom_id, uom.uom_name)}
                              >
                                <Check className={cn("mr-2 h-4 w-4", row.uom_id === uom.uom_id ? "opacity-100" : "opacity-0")} />
                                {uom.uom_name}
                              </CommandItem>
                            ))
                          )}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>

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
              disabled={isLoading || productsLoading || uomLoading}
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