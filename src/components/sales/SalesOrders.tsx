import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Eye, Check, X, Edit, Trash2, Search, Package, ChevronsUpDown, Truck } from 'lucide-react';
import { getItems } from '@/api/itemsApi';
import { getCustomers } from '@/api/salesOrdersApi';
import {Popover,PopoverContent,PopoverTrigger,} from "@/components/ui/popover";
import {Command,CommandEmpty,CommandGroup,CommandInput,CommandItem,} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { getSOs,getSOById,deleteSO,createSO,updateSO } from '@/api/salesOrdersApi';
import { toast } from '../ui/use-toast';
import { DialogDescription } from '@radix-ui/react-dialog';

interface SO {
  so_id?: number;
  order_number?: number;
  customer_id?: number;
  customer_name?: string;
  total_amount?: number;
  status?: string;
  order_date?: Date;
  delivery_date?: Date;
  shipping_address?: string;
  payment_terms?: string;
  created_by?: number;
  discount?: number;
  tax?: number;
  items?: Array<{ item_id: number; item_name?: string;
    quantity: number; unit_price: number; discount: number; tax: number }>;
}
interface viewingSO {
  so_id?: number;
  order_number?: number;
  customer_id?: number;
  customer_name?: string;
  total_amount?: number;
  status?: string;
  order_date?: Date;
  delivery_date?: Date;
  shipping_address?: string;
  payment_terms?: string;
  created_by?: number;
  discount?: number;
  tax?: number;
  items?: Array<{ item_id: number; item_name?: string;
    quantity: number; unit_price: number; discount: number; tax: number }>;
}

const SalesOrders: React.FC = () => {
 const [searchTerm, setSearchTerm] = useState('');
   const [showForm, setShowForm] = useState(false);
   const [salesOrders, setSalesOrders] = useState<SO[]>([]);
   const [editingSO, setEditingSO] = useState<SO | null>(null);

   const [viewingSO, setViewingSO] = useState<viewingSO | null>(null);
   const [viewDialogOpen, setViewDialogOpen] = useState(false);
   
//Load SOs
useEffect(() => {
  loadSalesOrders();
}, []);

  const loadSalesOrders = async () => {
    try {
      const data = await getSOs();
      console.log("Loaded SOs:", data);
      setSalesOrders(data);
    } catch (error) {
      console.error("Error loading sales orders", error);
    }
  };
const handleViewSO = (so_id) => {
  const selectedSO = filteredSO.find(so => so.so_id === so_id);
  if (selectedSO) {
    setViewingSO(selectedSO);
    console.log("Filter Viewing SO:", selectedSO);
    setViewDialogOpen(true);
  }
};
const handleSaveSO = async (payload: { 
  customer_id: number;
  order_date: Date;
  delivery_date: Date;
  shipping_address: string;
  payment_term: string;
  discount: number;
  tax: number;
  total_amount: number;
  created_by: number;
  items: SOItem[]
}) => {
  try {
    if (editingSO) {
      // UPDATE
      await updateSO(
        editingSO.so_id!,   // pass SO id
        payload.customer_id,
        payload.order_date,
        payload.delivery_date,
        payload.shipping_address,
        payload.payment_term,
        payload.discount,
        payload.tax,
        payload.total_amount,
        payload.created_by,
        payload.items
      );
      toast({ title: "Updated", description: "Sales Order updated successfully!" });
    } else {
      // CREATE
      await createSO(
        payload.customer_id,
        payload.order_date,
        payload.delivery_date,
        payload.shipping_address,
        payload.payment_term,
        payload.discount,
        payload.tax,
        payload.total_amount,
        payload.created_by,
        payload.items
      );
      toast({ title: "Created", description: "Sales Order created successfully!" });
    }

    setShowForm(false);
    setEditingSO(null);   // reset after save
    loadSalesOrders();
  } catch (err) {
    console.error("Save/Update SO failed", err);
  }
};

const handleDeleteSO = async (soId: number) => {
    if (confirm("Are you sure you want to delete this sales order?")) {
      try {
        await deleteSO(soId);
        toast({ title: "Deleted", description: "Sales order deleted successfully!" });
        loadSalesOrders();
      } catch (error) {
        console.error("Error deleting sales order", error);
      }
    }
  };



     const filteredSO = salesOrders.filter((so) =>
    so.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    so.order_number.toString().includes(searchTerm)
  );
  const totalSOs = salesOrders.length;
  const createdSOs = salesOrders.filter(so => so.status === 'CREATED').length;
  const totalValue = salesOrders.reduce((sum, so) => sum + Number(so.total_amount || 0), 0);
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
            <CardTitle className="text-sm font-medium text-gray-600">Total SOs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSOs}</div>
          </CardContent>
        </Card>
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Created SOs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{createdSOs}</div>
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
              Sales Orders
            </CardTitle>
           <Button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-purple-500 to-purple-600">
                  <Plus className="h-4 w-4 mr-2" />
                  Create SO
                </Button>
          </div>
         <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search Sales Orders..."
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
          <TableHead>SO Number</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Order Date</TableHead>
          <TableHead>Delivery Date</TableHead>
          <TableHead>Shipping Address</TableHead>
          <TableHead>Payment Term</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredSO.map((so) => (
          <TableRow key={so.so_id}>
            <TableCell className="font-medium">{so.order_number}</TableCell>
            <TableCell>{so.customer_name}</TableCell>
            <TableCell>{so.order_date ? new Date(so.order_date).toLocaleDateString() : ''}</TableCell>
            <TableCell>{so.delivery_date ? new Date(so.delivery_date).toLocaleDateString() : ''}</TableCell>
            <TableCell>{so.shipping_address}</TableCell>
            <TableCell>{so.payment_terms}</TableCell>
            <TableCell>{so.total_amount}</TableCell>
            <TableCell>
              <Badge className={getStatusColor(so.status)}>{so.status}</Badge>
            </TableCell>
            <TableCell>
              <div className="flex gap-1">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleViewSO(so.so_id)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                {so.status === "CREATED" && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      setEditingSO(so);
                      setShowForm(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
                {so.status === 'DELIVERED' && (
                  <Button 
                    size="sm" 
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    <Truck className="h-4 w-4" />
                  </Button>
                )}
                {so.status === 'CREATED' && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleDeleteSO(so.so_id)}
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

{showForm && (
  <SalesOrderForm 
    so={editingSO} 
    onClose={() => { setShowForm(false); setEditingSO(null); }} 
    onSave={handleSaveSO} 
  />
)}

<Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
  <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle>Sales Order Details</DialogTitle>
    </DialogHeader>
    {viewingSO && (
      <>
        <table className="w-full border border-gray-300 mb-4 text-sm">
          <tbody>
            <tr><td className="p-2 font-medium text-gray-600 border">Order Number</td><td className="p-2 border">{viewingSO.order_number}</td></tr>
            <tr><td className="p-2 font-medium text-gray-600 border">Customer</td><td className="p-2 border">{viewingSO.customer_name}</td></tr>
            <tr><td className="p-2 font-medium text-gray-600 border">Order Date</td><td className="p-2 border">{viewingSO.order_date ? new Date(viewingSO.order_date).toLocaleDateString() : ''}</td></tr>
            <tr><td className="p-2 font-medium text-gray-600 border">Delivery Date</td><td className="p-2 border">{viewingSO.delivery_date ? new Date(viewingSO.delivery_date).toLocaleDateString() : ''}</td></tr>
            <tr><td className="p-2 font-medium text-gray-600 border">Shipping Address</td><td className="p-2 border">{viewingSO.shipping_address}</td></tr>
            <tr><td className="p-2 font-medium text-gray-600 border">Payment Terms</td><td className="p-2 border">{viewingSO.payment_terms}</td></tr>
            <tr><td className="p-2 font-medium text-gray-600 border">Discount</td><td className="p-2 border">{viewingSO.discount}</td></tr>
            <tr><td className="p-2 font-medium text-gray-600 border">Tax</td><td className="p-2 border">{viewingSO.tax}</td></tr>
            <tr><td className="p-2 font-medium text-gray-600 border">Total Amount</td><td className="p-2 border font-semibold text-blue-700">{Number(viewingSO.total_amount).toLocaleString()}</td></tr>
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
            {viewingSO.items?.map((item, index) => (
              <tr key={index}>
                <td className="p-2 border">{item.item_name ?? '-'}</td>
                <td className="p-2 border">{item.quantity}</td>
                <td className="p-2 border">{item.unit_price}</td>
                <td className="p-2 border">{item.discount}</td>
                <td className="p-2 border">{item.tax}</td>
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
interface SOItem {
  item_id: number;
  quantity: number;
  unit_price: number;
  discount: number;
  tax: number;
}

interface SalesOrderFormProps {
  so?: SO | null;
  onClose: () => void;
  onSave: (payload: { 
    so_id?: number;  // ✅ added so_id for update
    customer_id: number; 
    order_date: Date;
    delivery_date: Date;
    shipping_address: string;
    payment_term: string;
    discount: number;
    tax: number;
    total_amount: number;
    created_by: number;
    items: SOItem[];
  }) => void;
}

export const SalesOrderForm: React.FC<SalesOrderFormProps> = ({ so, onClose, onSave }) => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);

  // ✅ Prefilled values if editing
  const [order_date, setOrderDate] = useState<string>(() => new Date().toISOString().split("T")[0]);
  const [delivery_date, setDeliveryDate] = useState<string>(() => new Date().toISOString().split("T")[0]);
  const [shipping_address, setShippingAddress] = useState<string>("");
  const [payment_term, setPaymentTerm] = useState<string>("");
  const [discount, setDiscount] = useState<number>(0);
  const [tax, setTax] = useState<number>(0);
  const [total_amount, setTotalAmount] = useState<number>(0);
  const [created_by, setCreatedBy] = useState<number>(1);

  const [customerOpen, setCustomerOpen] = useState(false);
  const [itemDropdown, setItemDropdown] = useState<number | null>(null);

  const [customer_id, setCustomerId] = useState<number>(0);
  const [soItems, setSoItems] = useState<SOItem[]>([{ item_id: 0, quantity: 1, unit_price: 0 ,discount:0,tax:0}]);

  // 🔹 Load customers + items + prefill form when editing
  useEffect(() => {
    (async () => {
      try {
        const [customerRes, itemsRes] = await Promise.all([getCustomers(), getItems()]);

        const customerList = (customerRes as any)?.data ?? (customerRes as any) ?? [];
        setCustomers(customerList);

        const rawItems = ((itemsRes as any)?.data ?? (itemsRes as any) ?? []) as any[];
        setItems(rawItems.map((r) => ({
          item_id: Number(r.item_id),
          item_name: String(r.item_name ?? r.name ?? ""),
        })));

        if (so) {
          // ✅ Prefill all fields when editing
          setCustomerId(Number(so.customer_id ?? 0));
          setOrderDate(so.order_date ? new Date(so.order_date).toISOString().split("T")[0] : "");
          setDeliveryDate(so.delivery_date ? new Date(so.delivery_date).toISOString().split("T")[0] : "");
          setShippingAddress(so.shipping_address ?? "");
          setPaymentTerm(so.payment_terms ?? "");
          setTotalAmount(Number(so.total_amount ?? 0));
          setDiscount(Number(so.discount ?? 0));
          setTax(Number(so.tax ?? 0));

          setSoItems(
            (so.items ?? []).length
              ? so.items.map((it: any) => ({
                  item_id: Number(it.item_id),
                  quantity: Number(it.quantity),
                  unit_price: Number(it.unit_price ?? 0),
                  discount: Number(it.discount ?? 0),
                  tax: Number(it.tax ?? 0),
                }))
              : [{ item_id: 0, quantity: 1, unit_price: 0, discount: 0, tax: 0 }]
          );
        } else {
          // reset for new form
          setCustomerId(0);
          setSoItems([{ item_id: 0, quantity: 1, unit_price: 0, discount: 0, tax: 0 }]);
        }
      } catch (err) {
        console.error("Failed loading customers/items:", err);
      }
    })();
  }, [so]); 

  // 🔹 Auto-calc total_amount whenever soItems change
  useEffect(() => {
    const total = soItems.reduce(
      (sum, row) => sum + (row.quantity * row.unit_price) - row.discount + row.tax,
      0
    );
    const discount= soItems.reduce((sum, row) => sum + row.discount, 0);
    const tax= soItems.reduce((sum, row) => sum + row.tax, 0);

    setTotalAmount(total);
    setDiscount(discount);
    setTax(tax);
  }, [soItems]);

  const addItemRow = () => setSoItems((p) => [...p, { item_id: 0, quantity: 1, unit_price: 0, discount: 0, tax: 0 }]);
  const removeItemRow = (index: number) => setSoItems((p) => p.filter((_, i) => i !== index));

  const handleSelectItem = (rowIndex: number, itemId: number) => {
    setSoItems((prev) => {
      const copy = [...prev];
      copy[rowIndex] = { ...copy[rowIndex], item_id: Number(itemId) };
      return copy;
    });
    setItemDropdown(null);
  };

  const handleChangeRow = (index: number, field: keyof SOItem, value: number) => {
    setSoItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer_id || customer_id === 0) {
      alert("Select customer");
      return;
    }
    if (soItems.length === 0 || soItems.some((r) => !r.item_id || r.item_id === 0 || r.quantity <= 0)) {
      alert("Add at least one item and ensure item and quantity are valid.");
      return;
    }

    onSave({
      so_id: so?.so_id,   // ✅ pass so_id if editing
      customer_id,
      order_date: new Date(order_date),
      delivery_date: new Date(delivery_date),
      shipping_address,
      payment_term,
      discount,
      tax,
      total_amount,
      created_by,
      items: soItems
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-[900px] max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">{so ? "Edit Sales Order" : "Create Sales Order"}</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col md:flex-row md:space-x-4 space-y-2 md:space-y-0">
          {/* Customer selector */}
          <Popover open={customerOpen} onOpenChange={setCustomerOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" role="combobox" className="w-full justify-between">
                {customer_id ? customers.find((c) => Number(c.customer_id) === customer_id)?.customer_name ?? "Select Customer" : "Select Customer"}
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
                      <Check className={cn("mr-2 h-4 w-4", customer_id === Number(c.customer_id) ? "opacity-100" : "opacity-0")} />
                      {c.customer_name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
          <Input
              value={shipping_address}
              onChange={(e) => setShippingAddress(e.target.value)}
              placeholder="Shipping Address"
              />
          </div>
          {/* Order + Delivery Date */}
          <div className="flex gap-4">
            <div className="flex flex-col flex-1">
              <span className="text-xs text-gray-700">Order Date</span>
              <Input
                type="date"
                      value={order_date}
                      onChange={(e) => setOrderDate(e.target.value)}
                        />
            </div>
            <div className="flex flex-col flex-1">
              <span className="text-xs text-gray-500">Delivery Date</span>
              <Input
                  type="date"
                    value={delivery_date}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  />
            </div>
            <div className="flex flex-col flex-1">
              <span className="text-xs text-gray-500">Payment Term</span>
              <Input
                type="text"
                value={payment_term}
                onChange={(e) => setPaymentTerm(e.target.value.toUpperCase())}
                placeholder="Payment Term"
              />
            </div>
          </div>

          {/* Items rows */}
          <div className="space-y-3">
            {soItems.map((row, idx) => {
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
                      {/* Quantity */}
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

                  {/* Unit Price */}
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
                  {/* Discount */}
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500">Discount</span>
                    <Input
                      type="number"
                      className="w-28"
                      min={0}
                      step="0.01"
                      value={row.discount}
                      onChange={(e) => handleChangeRow(idx, "discount", Number(e.target.value || 0))}
                    />
                  </div>
                  {/* Tax */}
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500">Tax</span>
                    <Input
                      type="number"
                      className="w-28"
                      min={0}
                      step="0.01"
                      value={row.tax}
                      onChange={(e) => handleChangeRow(idx, "tax", Number(e.target.value || 0))}
                    />
                  </div>

                  {/* Remove row */}
                  {soItems.length > 1 && (
                    <Button type="button" variant="destructive" size="icon" onClick={() => removeItemRow(idx)}>
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
            {/* Total Amount */}
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
          {/* Actions */}
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="flex-2 bg-gradient-to-r from-blue-500 to-blue-600">
              Save
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};


export default SalesOrders;