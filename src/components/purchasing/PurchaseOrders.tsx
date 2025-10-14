import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Eye, Check, X, Edit, Trash2, Search, Package, ChevronsUpDown, CheckSquare } from 'lucide-react';
import { useAppContext, Vendor } from '@/contexts/AppContext';
import { getPurchaseOrders,createPurchaseOrder,UpdatePOStatus,updatePurchaseOrder } from '@/api/poApi';
import { getVendors } from '@/api/vendorsApi';
import { getItems } from '@/api/itemsApi';
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

interface PO {
  po_id?: number;
  vendor_id?: number;
  vendor_name?: string;
  total_price?: number;
  status: string;
  order_date?: string;
  updated_by :number;
  created_by:number;
  items?: Array<{ item_id: number; item_name?: string; quantity: number; unit_price: number }>;
}
interface viewingPO {
  po_id?: number;
  vendor_id?: number;
  vendor_name?: string;
  total_price?: number;
  status: string;
  order_date?: string;
  updated_by :number;
  created_by:number;
  items?: Array<{ item_id: number; item_name?: string; quantity: number; unit_price: number }>;
}

const PurchaseOrders: React.FC = () => {
 const [searchTerm, setSearchTerm] = useState('');
   const [showForm, setShowForm] = useState(false);
   const [purchaseOrders, setPurchaseOrders] = useState<PO[]>([]);
   const [editingPO, setEditingPO] = useState<PO | null>(null);
     const [selectedPOs, setSelectedPOs] = useState<number[]>([]);
    
      const [viewingPO, setViewingPO] = useState<viewingPO | null>(null);
        const [viewDialogOpen, setViewDialogOpen] = useState(false);
    
     useEffect(() => {
      loadPurchaseOrders();
    }, []);

  const loadPurchaseOrders = async () => {
    try {
      const data = await getPurchaseOrders();
      console.log("Loaded SOs:", data);
      setPurchaseOrders(data);
    } catch (error) {
      console.error("Error loading sales orders", error);
    }
  };
const handleViewPO = (po_id) => {
  const selectedPO = filteredPO.find(po => po.po_id === po_id);
  if (selectedPO) {
    setViewingPO(selectedPO);
    console.log("Filter Viewing PO:", selectedPO);
    setViewDialogOpen(true);
  }
};
  const user = JSON.parse(sessionStorage.getItem("user") || "{}");
const userId = user.user_id || user.id;

  // 🆕 Handle checkbox selection
  const toggleSelectPO = (po_id: number) => {
    setSelectedPOs((prev) =>
      prev.includes(po_id) ? prev.filter((id) => id !== po_id) : [...prev, po_id]
    );
  };

  // 🆕 Handle  status update
  const handleStatusUpdate = async (newStatus: string) => {
    if (selectedPOs.length === 0) {
      toast({ title: 'No PO Selected', description: 'Please select at least one Purchase Order.' });
      return;
    }

    try {
      await UpdatePOStatus(selectedPOs, newStatus);
      toast({ title: 'Status Updated', description: `Status changed to ${newStatus} successfully.` });
      setSelectedPOs([]);
     // fetchOrders();
    } catch (err) {
      console.error(' Status Update failed', err);
      toast({ title: 'Error', description: 'Failed to update PO status.' });
    }
  };

const handleSavePO = async (payload: { 
    vendor_id: number;
    
     
     items: POItem[] 

    }) => {
  try {
     if (editingPO){
     await updatePurchaseOrder(
        editingPO.po_id!, // required PO ID
        payload.vendor_id,
        editingPO.status , // keep existing or default
       
        payload.items
      );
            toast({ title: "Updated", description: "Sales Order updated successfully!" });
     }
     else {
           // CREATE
           await createPurchaseOrder(
            
            payload.vendor_id,
           
             payload.items
           );
           toast({ title: "Created", description: "Sales Order created successfully!" });
         }
          setShowForm(false);
    setEditingPO(null);   // reset after save
    loadPurchaseOrders();
    } catch (err) {
    console.error("Save/Update SO failed", err);
  }

};

     const filteredPO = purchaseOrders.filter((po) =>
    po.vendor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    po.po_id.toString().includes(searchTerm)
  );
  const totalPOs = purchaseOrders.length;
  const createdPOs = purchaseOrders.filter(po => po.status === 'CREATED').length;
  const totalValue = purchaseOrders.reduce((sum, po) => sum + Number(po.total_price || 0), 0);
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CREATED': return 'bg-gray-100 text-gray-800';
      case 'SENT': return 'bg-blue-100 text-blue-800';
      case 'RECEIVED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
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
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Purchase Orders
            </CardTitle>
             <Button
                onClick={() => handleStatusUpdate('APPROVED')}
                disabled={selectedPOs.length === 0}
                variant="outline"
              >
                Mark as Received
              </Button>
           <Button
               onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-purple-500 to-purple-600">
                  <Plus className="h-4 w-4 mr-2" />
                  Create PO
                </Button>
                
          </div>
         <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search items..."
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
                  <CheckSquare className="h-4 w-4" />
                </TableHead>
                <TableHead>PO ID</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Order Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPO.map((po) => (
                <TableRow key={po.po_id}>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedPOs.includes(po.po_id!)}
                      onChange={() => toggleSelectPO(po.po_id!)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{po.po_id}</TableCell>
                  <TableCell>{po.vendor_name}</TableCell>
                  <TableCell>{new Date(po.order_date).toLocaleString('en-PK',
                         {
                            timeZone: 'Asia/Karachi',
                            year: 'numeric',
                            month: 'short',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                            hour12: true,
                          })}</TableCell>
                  <TableCell>{po.total_price}</TableCell>
                  <TableCell>{po.status}</TableCell>
                   <TableCell>
              <div className="flex gap-1">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleViewPO(po.po_id)}
                >
                  <Eye className="h-4 w-4" />
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
                {/* {po.status === 'DELIVERED' && (
                  <Button 
                    size="sm" 
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    <Truck className="h-4 w-4" />
                  </Button>
                )} */}
                {/* {po.status === 'CREATED' && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleDeleteSO(so.so_id)}
                  > 
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )} */}
              </div>
            </TableCell>
                  
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
        <DialogTitle>Sales Order Details</DialogTitle>
      </DialogHeader>
      {viewingPO && (
        <>
          <table className="w-full border border-gray-300 mb-4 text-sm">
            <tbody>
              <tr><td className="p-2 font-medium text-gray-600 border">PO Number</td><td className="p-2 border">{viewingPO.po_id}</td></tr>
             
              <tr><td className="p-2 font-medium text-gray-600 border">Vednor Name</td><td className="p-2 border">{viewingPO.vendor_name}</td></tr>
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
                <th className="p-2 border text-left">Quantity</th>
                <th className="p-2 border text-left">Unit Price</th>
                <th className="p-2 border text-left">Discount</th>
                <th className="p-2 border text-left">Tax</th>
              </tr>
            </thead>
            <tbody>
              {viewingPO.items?.map((item, index) => (
                <tr key={index}>
                  <td className="p-2 border">{item.item_name ?? '-'}</td>
                  <td className="p-2 border">{item.quantity}</td>
                  <td className="p-2 border">{item.unit_price}</td>
                 
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


interface POItem {
  item_id: number;
  quantity: number;
  unit_price: number;
}

// Duplicate PO interface removed to avoid conflicting declarations.

interface PurchaseOrderFormProps {
  po: PO | null;
  onClose: () => void;
  onSave: (payload: {
     po_id:number;
     vendor_id: number;
     
     items: POItem[] }) => void;
}

export const PurchaseOrderForm: React.FC<PurchaseOrderFormProps> = ({ po, onClose, onSave }) => {
  const [vendors, setVendors] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);

  const [vendorOpen, setVendorOpen] = useState(false);
  const [itemDropdown, setItemDropdown] = useState<number | null>(null);

  const [vendor_id, setVendorId] = useState<number>(0);
  const [poItems, setPoItems] = useState<POItem[]>([{ item_id: 0, quantity: 1, unit_price: 0 }]);

  const userId = getCurrentUserId();
  // normalize API responses and load lists
  useEffect(() => {
    (async () => {
      try {
        const [vendorsRes, itemsRes] = await Promise.all([getVendors(), getItems()]);

        // normalize vendor list (support .data or raw array)
        const vendorList = (vendorsRes as any)?.data ?? (vendorsRes as any) ?? [];
        setVendors(vendorList);

        // normalize item list
      const rawItems = ((itemsRes as any)?.data ?? (itemsRes as any) ?? []) as any[];
        setItems(rawItems.map((r) => ({
          item_id: Number(r.item_id),
          item_name: String(r.item_name ?? r.name ?? ""),
        })));

        // prefill when editing
        if (po) {
         setVendorId(Number(po.vendor_id ?? 0));
          setPoItems(
            (po.items ?? []).length
              ? po.items.map((it: any) => ({
                  item_id: Number(it.item_id),
                  quantity: Number(it.quantity),
                  unit_price: Number(it.unit_price ?? 0),
                  discount: Number(it.discount ?? 0),
                  tax: Number(it.tax ?? 0),
                }))
              : [{ item_id: 0, quantity: 1, unit_price: 0, discount: 0, tax: 0 }]
          );
        } else {
          // new form: reset
          setVendorId(0);
          setPoItems([{ item_id: 0, quantity: 1, unit_price: 0 }]);
        }
      } catch (err) {
        console.error("Failed loading vendors/items:", err);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [po]); // reload when `po` changes (prefill or reset)

  const addItemRow = () => setPoItems((p) => [...p, { item_id: 0, quantity: 1, unit_price: 0 }]);
  const removeItemRow = (index: number) => setPoItems((p) => p.filter((_, i) => i !== index));

  // IMPORTANT: this sets ONLY item_id. price remains manual.
  const handleSelectItem = (rowIndex: number, itemId: number) => {
    setPoItems((prev) => {
      const copy = [...prev];
      copy[rowIndex] = { ...copy[rowIndex], item_id: Number(itemId) };
      return copy;
    });
    setItemDropdown(null);
  };

  const handleChangeRow = (index: number, field: keyof POItem, value: number) => {
    setPoItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendor_id || vendor_id === 0) {
      alert("Select vendor");
      return;
    }
    if (poItems.length === 0 || poItems.some((r) => !r.item_id || r.item_id === 0 || r.quantity <= 0)) {
      alert("Add at least one item and ensure item and quantity are valid.");
      return;
    }
    onSave({
      vendor_id, items: poItems,
      po_id: 0
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white p-6 rounded-lg w-[600px] overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">{po ? "Edit Purchase Order" : "Create Purchase Order"}</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Vendor selector */}
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
                <CommandEmpty>No vendors</CommandEmpty>
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

          {/* Items rows */}
          <div className="space-y-3">
            {poItems.map((row, idx) => {
              const selected = items.find((it) => Number(it.item_id) === Number(row.item_id));
              return (
                <div key={idx} className="flex items-center gap-2">
                  {/* Item dropdown */}
                  <Popover open={itemDropdown === idx} onOpenChange={(open) => setItemDropdown(open ? idx : null)}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-1/3 justify-between">
                        {row.item_id ? selected?.item_name ?? "Selected item" : "Select Item"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="max-h-[300px] overflow-auto">
                      <Command>
                        <CommandInput placeholder="Search items..." />
                        <CommandEmpty>No items</CommandEmpty>
                        <CommandGroup>
                          {items.map((it) => (
                            <CommandItem key={it.item_id} onSelect={() => handleSelectItem(idx, Number(it.item_id))}>
                              <Check className={cn("mr-2 h-4 w-4", row.item_id === Number(it.item_id) ? "opacity-100" : "opacity-0")} />
                              {it.item_name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>

                  {/* Quantity (manual) */}
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500">Qty</span>
                    <Input
                      type="number"
                      className="w-24"
                      min={1}
                      value={row.quantity}
                      onChange={(e) => handleChangeRow(idx, "quantity", Number(e.target.value || 0))}
                    />
                  </div>

                  {/* Unit Price (manual) */}
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500">Price</span>
                    <Input
                      type="number"
                      className="w-28"
                      min={0}
                      step="0.01"
                      value={row.unit_price}
                      onChange={(e) => handleChangeRow(idx, "unit_price", Number(e.target.value || 0))}
                    />
                  </div>

                  {/* remove */}
                  {poItems.length > 1 && (
                    <Button
                     type="button" 
                     variant="ghost" 
                     size="sm" 
                     onClick={() => removeItemRow(idx)}>
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

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600"
           
            >
              Save
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};



export default PurchaseOrders;

