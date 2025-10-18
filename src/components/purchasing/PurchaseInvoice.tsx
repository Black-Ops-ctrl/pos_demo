import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Search, Package, AlertTriangle, CheckCircle, ChevronsUpDown, Check ,Loader2, Eye, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getGRNs, createGRN, getPODetails } from '@/api/grnApi';
import { getPurchaseOrders } from '@/api/poApi';
import {approvePurchaseInvoices, createPurchaseInvoice, deletePurchaseInvoice, getPurchaseinvoices, updatePurchaseInvoice} from '@/api/purchaseInvoiceApi'
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
import { useNavigate } from 'react-router-dom';
import { getWarehouses } from '@/api/getWarehousesApi';
import { getVendors } from '@/api/vendorsApi';





interface InvoiceItem {
  item_id: number;
  item_name: string;
  item_code: string;
  
  ordered_qty: number;
  received_qty: number;
  
  unit_price: number;

}
interface Invoice {
  purchase_invoice_id: number; 
  po_id: number;
  vendor_id:number;
   vendor_name: string;
  warehouse_id:number;
 warehouse_name:string;
 invoice_date:Date;
 total_amount:number;
  created_date: string;
  created_by: string;
  remarks: string;
  items: InvoiceItem[];
  status: string;
 
}
interface viewingInvoice {
  purchase_invoice_id: number; 
  po_id: number;
  vendor_id:number;
   vendor_name: string;
  warehouse_id:number;
 warehouse_name:string;
 invoice_date:Date;
 total_amount:number;
  created_date: string;
  created_by: string;
  remarks: string;
  items: InvoiceItem[];
  status: string;
 
}


const PurchaseInvoice: React.FC = () => {
  const [Invoices, setInvoices] = useState<Invoice[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
 const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
     const [viewingInvoice, setViewingInvoice] = useState<viewingInvoice | null>(null);
     const [viewDialogOpen, setViewDialogOpen] = useState(false);
     const [selectedInvoices, setSelectedInvoices] = useState<number[]>([]);

  const { toast } = useToast();

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      const data = await getPurchaseinvoices();
      setInvoices(data);
    } catch (error) {
      console.error('Error loading Invoices', error);
    }
  };

const handleViewInvoice = (purchase_invoice_id) => {
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
  const handleEditInvoice = (invoice: any) => {
  setEditingInvoice(invoice);
  setShowForm(true);
};

 const handleSaveInvoice = async (
    
  po_id: number,
  vendor_id: number,
  warehouse_id: number,
  remarks: string,
  items: InvoiceItem[],
  invoice_date: Date,
  total_amount:number
) => {
  try {
    if (editingInvoice) {
      //  UPDATE existing invoice
      await updatePurchaseInvoice(
        editingInvoice.purchase_invoice_id!, // existing invoice id
        po_id,
        vendor_id,
        warehouse_id,
        remarks,
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
      //  CREATE new invoice
      await createPurchaseInvoice(po_id, vendor_id, warehouse_id, remarks,invoice_date, total_amount,items);
      toast({
        title: "Created",
        description: "Invoice created successfully!",
        duration: 3000,
      });
    }

    setShowForm(false);
    setEditingInvoice(null); // reset after save
    loadInvoices(); // refresh list
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

    setSelectedInvoices([]); // Clear selection
    loadInvoices(); // Refresh list
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
  const filteredInvoices = Invoices.filter(
    (Invoice) =>
         Invoice.purchase_invoice_id.toString().includes(searchTerm) ||
      Invoice.po_id.toString().includes(searchTerm) ||
      Invoice.vendor_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

 

  const totalInvoices = Invoices.length;
  const completedInvoices = Invoices.filter((Invoice) => Invoice.status === 'Completed').length;
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
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalInvoices}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Completed Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedInvoices}</div>
          </CardContent>
        </Card>
       
      </div>

      {/* Invoice Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" /> Purchase Invoices
            </CardTitle>
                                <div className="flex justify-end gap-2 mt-2">
                    {selectedInvoices.length > 0 && (
                        <Button
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={handleApproveInvoices}
                        >
                        Approve  ({selectedInvoices.length})
                        </Button>
                    )}
                    </div>
            <Button onClick={handleAddInvoice} className="bg-gradient-to-r from-purple-500 to-purple-600">
              <Plus className="h-4 w-4 mr-2" /> Create Invoice
            </Button>
          </div>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search Invoice..."
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
                        <TableHead>
                        <input
                            type="checkbox"
                            checked={
                            selectedInvoices.length > 0 &&
                            selectedInvoices.length === filteredInvoices.length
                            }
                            onChange={(e) => {
                            if (e.target.checked) {
                                setSelectedInvoices(filteredInvoices.map((inv) => inv.purchase_invoice_id));
                            } else {
                                setSelectedInvoices([]);
                            }
                            }}
                        />
                        </TableHead>
                        <TableHead>Invoice No</TableHead>
                        <TableHead>PO Number</TableHead>
                        <TableHead>Vendor</TableHead>
                        <TableHead>Warehouse Name</TableHead>
                        <TableHead>Invoice Date</TableHead>
                        <TableHead>Total Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                    </TableHeader>
                                    <TableBody>
                        {filteredInvoices.map((Invoice) => (
                            <TableRow key={Invoice.purchase_invoice_id}>
                            <TableCell>
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
                                />
                            </TableCell>
                            <TableCell>{Invoice.purchase_invoice_id}</TableCell>
                            <TableCell>{Invoice.po_id}</TableCell>
                            <TableCell>{Invoice.vendor_name}</TableCell>
                            <TableCell>{Invoice.warehouse_name}</TableCell>
                            <TableCell>
                                {new Date(Invoice.invoice_date).toLocaleString("en-PK", {
                                timeZone: "Asia/Karachi",
                                year: "numeric",
                                month: "short",
                                day: "2-digit",
                                })}
                            </TableCell>
                             <TableCell>{Invoice.total_amount}</TableCell>
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

      {showForm && <InvoiceForm
      invoice={editingInvoice} 
       onClose={() => setShowForm(false)} 
       onSave={handleSaveInvoice} />}

        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
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
                    <tr><td className="p-2 font-medium text-gray-600 border">Vendor</td><td className="p-2 border">{viewingInvoice.vendor_name }</td></tr>
                    <tr><td className="p-2 font-medium text-gray-600 border">Warehouse Name</td><td className="p-2 border">{viewingInvoice.warehouse_name}</td></tr>
                    <tr><td className="p-2 font-medium text-gray-600 border">Status</td><td className="p-2 border">{viewingInvoice.status}</td></tr>
                    {/* <tr><td className="p-2 font-medium text-gray-600 border">Discount</td><td className="p-2 border">{viewingSO.discount}</td></tr>
                    <tr><td className="p-2 font-medium text-gray-600 border">Tax</td><td className="p-2 border">{viewingSO.tax}</td></tr>
                    <tr><td className="p-2 font-medium text-gray-600 border">Total Amount</td><td className="p-2 border font-semibold text-blue-700">{Number(viewingSO.total_amount).toLocaleString()}</td></tr> */}
                  </tbody>
                </table>
        
                <h3 className="text-md font-semibold mb-2">Items</h3>
                <table className="w-full border border-gray-300 text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      
                      <th className="p-2 border text-left">Item Name</th>
                      <th className="p-2 border text-left">Item Code</th>
                      <th className="p-2 border text-left">Quantity</th>
                      <th className="p-2 border text-left">Unit Price</th>
                      {/* <th className="p-2 border text-left">Discount</th>
                      <th className="p-2 border text-left">Tax</th> */}
                    </tr>
                  </thead>
                  <tbody>
                    {viewingInvoice.items?.map((item, index) => (
                      <tr key={index}>
                        <td className="p-2 border">{item.item_name ?? '-'}</td>
                         <td className="p-2 border">{item.item_code ?? '-'}</td>
                        <td className="p-2 border">{item.received_qty}</td>
                        <td className="p-2 border">{item.unit_price}</td>
                        {/* <td className="p-2 border">{item.discount}</td>
                        <td className="p-2 border">{item.tax}</td> */}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </DialogContent>
        </Dialog>
           </div>
         
  );
};

const InvoiceForm: React.FC<{
  invoice?: Invoice | null;
  onClose: () => void;
  onSave: (
    po_id: number,
    vendor_id: number,
    warehouse_id:number,
    remarks: string,
    items: InvoiceItem[],
    invoice_date:Date,
    total_amount:number
  ) => void;
}> = ({ invoice, onClose, onSave }) => {
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
  const [warehouses,setWarehouses]=useState<any[]>([]);
   const [vendors,setVendors]=useState<any[]>([]);
  const [selectedPO, setSelectedPO] = useState<any>(null); // PO info
  const [warehouse_id, setWarehouseid] = useState<any>(null);
  const [vendor_id, setVendorid] = useState<any>(null);
  const [poItems, setPoItems] = useState<InvoiceItem[]>([]); // Table items
  const [openPO, setOpenPO] = useState(false);
  const [openWarehouse, setOpenWarehouse] = useState(false);
    const [openVendor, setOpenVendor] = useState(false);
    const [isLoading, setIsLoading] = useState(false); 
     const [isEditing, setIsEditing] = useState(false);
 
  const [remarks, setRemarks] = useState("");
  const [invoice_date, setInvoiceDate] =  useState<string>(() => new Date().toISOString().split("T")[0]);
    
    const [discount, setDiscount] = useState<number>(0);
    const [tax, setTax] = useState<number>(0);
    const [total_amount, setTotalAmount] = useState<number>(0);

  //  Fetch PO list
  useEffect(() => {
    const fetchPOs = async () => {
      try {
        const poData = await getPurchaseOrders();
        const warehouseData = await getWarehouses();
        const vendorData = await getVendors(); // Correctly fetch vendors

        setPurchaseOrders(poData || []);
        setWarehouses(warehouseData || []);
        setVendors(vendorData || []); 
      } catch (error) {
        console.error("Error fetching purchase orders:", error);
      }
    };
    fetchPOs();
  }, []);

  //  Fetch PO details (only update items)
  const fetchPODetails = async (po_id: number) => {
    try {
      const data = await getPODetails(po_id);
      const formattedItems: InvoiceItem[] = data.items.map((item: any) => ({
       item_id: item.item_id,
          item_name: item.item_name ,
      item_code: item.item_code ,
    
        ordered_qty: Number(item.quantity),
        received_qty: 0,
       
        unit_price: item.unit_price,
      }));
      setPoItems(formattedItems);
      console.log("Sending to backend:", JSON.stringify(formattedItems));
    } catch (error) {
      console.error("Error fetching PO details:", error);
    }
  };

  //  Handle PO selection
  const handleSelectPO = (po: any) => {
    setSelectedPO(po); // Keep vendor_name, po_id, vendor_id, etc.
    setVendorid(po.vendor_id);
    setOpenPO(false);
    fetchPODetails(po.po_id); // Load table separately
  };
  // Handle Vendor Selection (Keep separate for flexibility)
  const handleSelectVendor = (vendor: any) => {
    setVendorid(Number(vendor.vendor_id));
    setOpenVendor(false);
  }

  // Handle Warehouse Selection (Keep separate for flexibility)
  const handleSelectWarehouse = (warehouse: any) => {
    setWarehouseid(Number(warehouse.warehouse_id));
    setOpenWarehouse(false);
  }
  const handleItemChange = (
    index: number,
    field: "received_qty" | "rejected_qty",
    value: number
  ) => {
    const updated = [...poItems];
    updated[index][field] = value;
    setPoItems(updated);
  };
useEffect(() => {
  if (invoice) {
    // --- Editing existing invoice ---
    setIsEditing(true);
    setRemarks(invoice.remarks || "");
    setWarehouseid(invoice.warehouse_id || null);
    setVendorid(invoice.vendor_id || null);
   setInvoiceDate(
    invoice.invoice_date
        ? new Date(invoice.invoice_date).toLocaleDateString("en-CA")
        : ""
    );
        setTotalAmount(invoice.total_amount || null);
    // Load PO info
    const matchedPO = purchaseOrders.find(
      (p) => p.po_id === invoice.po_id
    );
    if (matchedPO) setSelectedPO(matchedPO);

    // Load existing items if available
    if (invoice.items && invoice.items.length > 0) {
     setPoItems(
    invoice.items.map((item: any) => ({
      item_id: item.item_id,
      item_name: item.item_name,
      item_code: item.item_code,
      
      ordered_qty: item.ordered_qty,
      received_qty: item.received_qty,
      unit_price: item.unit_price,
    }))
  );
  
    }
  } else {
    // --- Adding new invoice → Reset all fields ---
    setIsEditing(false);
    setSelectedPO(null);
    setVendorid(null);
    setWarehouseid(null);
    setRemarks("");
    setPoItems([]);
   setInvoiceDate(new Date().toISOString().split("T")[0]);
  }
}, [invoice, purchaseOrders]);
// 🔹 Auto-calc total_amount whenever soItems change
  useEffect(() => {
    const total = poItems.reduce(
      (sum, row) => sum + (row.received_qty * row.unit_price) ,
      0
    );
   

    setTotalAmount(total);
   
   
  }, [poItems]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPO) {
      alert("Please select a Purchase Order");
      return;
    }
    setIsLoading(true);

   try {
      onSave(
           selectedPO.po_id,
           vendor_id,
           warehouse_id,
           remarks,
           poItems,
           new Date(invoice_date),
           total_amount
       );
      console.log("Sending to backend:", JSON.stringify(poItems));
     } catch (error) {
      // The error is already handled and toasted by the parent component's handleSaveInvoice
      console.error("Submission error caught in form:", error);
    } finally {
      //  STOP LOADING, regardless of success or failure
      setIsLoading(false);
    }
  };
 const hasInvalidReceivedQty = poItems.some(item => item.received_qty < 0);
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-[1000px] max-h-[90vh] overflow-auto">
        <h2 className="text-lg font-semibold mb-2">
          {isEditing ? "Edit Invoice" : "Add Invoice"}
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Purchase Order Selection */}
          <div className="flex space-x-4">
            <div className="flex flex-col flex-1">
            <label className="block text-sm font-medium mb-0">Purchase Order</label>
            <Popover open={openPO} onOpenChange={setOpenPO}>
              <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" className="w-full justify-between">
                  {selectedPO
                    ? `PO-${selectedPO.po_id} (${selectedPO.vendor_name})`
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

            {/* Vendor Popover */}
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
         {/* Warehouse Popover */}
           <div className="flex space-x-2">
             <div className="flex flex-col flex-1">
            <label className="block text-sm font-medium mb-1">Warehouse</label>
            <Popover open={openWarehouse} onOpenChange={setOpenWarehouse}>
              <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" className="w-full justify-between">
                  {warehouse_id
                    ? warehouses.find((w) => Number(w.warehouse_id) === warehouse_id)?.warehouse_name ?? "Select Warehouse"
                    : "Select Warehouse"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
             <PopoverContent className="w-[400px] max-h-[300px] overflow-y-auto p-0 z-[100]">
                <Command>
                  <CommandInput placeholder="Search warehouses..." />
                  <CommandEmpty>No warehouse</CommandEmpty>
                  <CommandGroup>
                    {warehouses.map((w) => (
                      <CommandItem
                        key={w.warehouse_id}
                        onSelect={() => handleSelectWarehouse(w)}
                      >
                        <Check className={cn("mr-2 h-4 w-4", warehouse_id === Number(w.warehouse_id) ? "opacity-100" : "opacity-0")} />
                        {w.warehouse_name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
            </div>
              {/* Invoice Date */}
            <div className="flex flex-col flex-1">
            <label className="block text-sm font-medium mb-1">Invoice Date</label>
           <Input
                type="date"
                value={invoice_date }
                onChange={(e) => setInvoiceDate(e.target.value)}
                />

            </div>
             <div className="flex flex-col flex-1">
                     {/* Remarks */}
                     <label className="block text-sm font-medium mb-1">Remarks</label>
            <Input
              type="text"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
          </div>
        
          </div>

         
          <div>
            
          </div>

          {/* Items Table */}
          <div>
            <label  className="block text-sm font-medium mb-2">Items</label>
            <div className="overflow-auto">
              <table className="w-full border-collapse"> {/* Use a smaller font size */}
      <thead className="bg-gray-100">
        <tr>
          <th className="border px-2 py-1 text-center w-[150px]">Item Name</th> {/* Adjusted width */}
          <th className="border px-2 py-1 text-center w-[100px]">Item Code</th> {/* Adjusted width */}
          <th className="border px-2 py-1 text-center w-[100px]">Ordered Qty</th> {/* Adjusted width */}
          <th className="border px-2 py-1 text-center w-[100px]">Received Qty</th> {/* Adjusted width */}
          <th className="border px-2 py-1 text-center w-[100px]">Unit Price</th> {/* Adjusted width */}
        </tr>
      </thead>
      <tbody>
        {poItems.map((item, index) => (
          <tr key={item.item_id}>
            <td className="border px-2 py-1 text-center">{item.item_name}</td> {/* Adjusted padding */}
            <td className="border px-2 py-1 text-center">{item.item_code}</td> {/* Adjusted padding */}
            <td className="border px-2 py-1 text-center">{Number(item.ordered_qty)}</td> {/* Adjusted padding */}
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
            <td className="border px-2 py-1 text-center">{item.unit_price}</td> {/* Adjusted padding */}
          </tr>
        ))}
      </tbody>
    </table>

            </div>
          </div>
            {/** Total Row */}
                        <div className="flex justify-center mt-4">
           <span className="font-semibold text-lg text-gray-800">
                Total Amount: {total_amount}
            </span> 
            </div>
          {/* Actions */}
          <div className="flex gap-2 justify-end mt-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
            type="submit" 
            className="bg-gradient-to-r from-blue-500 to-blue-600" 
            //  UPDATE 1: Disable button while loading
            disabled={isLoading || !selectedPO || !warehouse_id || !vendor_id || poItems.length === 0 ||
            hasInvalidReceivedQty }
            
          >
            
            {/*  UPDATE 2: Show loader icon and text */}
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Inserting...
              </>
            ) : (
              "Save Invoice"
            )}
          </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PurchaseInvoice;
