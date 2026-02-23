import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import DatePicker from "react-datepicker";  // Import DatePicker
import "react-datepicker/dist/react-datepicker.css"; // Import DatePicker styles

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
import { getSOs } from '@/api/salesOrdersApi';
import { toast } from '../ui/use-toast';
import { createDC, getDeliveryChallans } from '@/api/deliveryChallansApi';
import { getWarehouses } from '@/api/getWarehousesApi';
import { set } from 'date-fns';

interface DC {
  dc_id: number;
  dc_no?: number;
  so_id: number;
  customer_id: number;
  customer_name: string;
  status: string;
  dc_date: Date;
  warehouse_id: number;
  warehouse_name: string;
  remarks: string;
  created_by: number;
  items: Array<{ item_id: number; item_name: string;
    quantity: number; unit_price: number; discount: number; tax: number }>;
}
interface viewingSO {
   dc_id?: number;
  dc_no?: number;
  so_id?: number;
  customer_id?: number;
  customer_name?: string;
  status?: string;
  dc_date?: Date;
  warehouse_id?: number;
  warehouse_name?: string;
  remarks?: string;
  created_by?: number;
  items?: Array<{ item_id: number; item_name?: string;
    quantity: number; unit_price: number; discount: number; tax: number }>;
}

const DeliveryChallans: React.FC = () => {
 const [searchTerm, setSearchTerm] = useState('');
   const [showForm, setShowForm] = useState(false);
   const [deliveryChallans, setDeliveryChallans] = useState<DC[]>([]);
 

   const [viewingSO, setViewingSO] = useState<viewingSO | null>(null);
   const [viewDialogOpen, setViewDialogOpen] = useState(false);

   //Load DCs
useEffect(() => {
  loadDeliveryChallans();
}, []);

  const loadDeliveryChallans = async () => {
    try {
      const data = await getDeliveryChallans();
      
      setDeliveryChallans(data);
    } catch (error) {
      console.error("Error loading delivery challans", error);
    }
  };
const handleViewDC = (dc_id) => {
  const selectedDC = filteredDC.find(dc => dc.dc_id === dc_id);
  if (selectedDC) {
    setViewingSO(selectedDC);
    
    setViewDialogOpen(true);
  }
};
const handleSaveDC = async (payload: { 
 so_id:number,
  customer_id: number,
  dc_date: Date,
  warehouse_id: number,
  status: string,
  remarks: string,
  created_by: number,
  items: DCItem[]
}) => {
  try {
      // CREATE
      await createDC(
        payload.so_id,
        payload.customer_id,
        payload.dc_date,
        payload.warehouse_id,
        payload.status,
        payload.remarks,
        payload.created_by,
        payload.items
      );
      toast({ title: "Created", description: "Sales Order created successfully!" });
    setShowForm(false);
    loadDeliveryChallans();
  } catch (err) {
    console.error("Save DC failed", err);
  }
};

     const filteredDC = deliveryChallans.filter((dc) =>
    dc.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dc.dc_no.toString().includes(searchTerm)
  );
  const totalDCs = deliveryChallans.length;
  const createdDCs = deliveryChallans.filter(dc => dc.status === 'CREATED').length;
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
            <CardTitle className="text-sm font-medium text-gray-600">Total DCs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDCs}</div>
          </CardContent>
        </Card>
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Created DCs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{createdDCs}</div>
          </CardContent>
        </Card>
      </div>
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Delivery Challans
            </CardTitle>
           <Button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-purple-500 to-purple-600">
                  <Plus className="h-4 w-4 mr-2" />
                  Create DC
                </Button>
          </div>
         <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search DCs..."
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
          <TableHead>DC Number</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>DC Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Show Detail</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredDC.map((dc) => (
          
          <TableRow key={dc.dc_id}>
            <TableCell className="font-medium">{dc.dc_no}</TableCell>
            <TableCell>{dc.customer_name}</TableCell>
            <TableCell>{dc.dc_date ? new Date(dc.dc_date).toLocaleDateString() : ''}</TableCell>
            <TableCell>
              <Badge className={getStatusColor(dc.status)}>{dc.status}</Badge>
            </TableCell>
            <TableCell>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleViewDC(dc.dc_id)}
                >
                  <Eye className="h-4 w-4" />
                </Button>          
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </CardContent>
</Card>

{showForm && (
  <SalesOrderForm 
   
    onClose={() => { setShowForm(false); }} 
    onSave={handleSaveDC} 
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
            <tr><td className="p-2 font-medium text-gray-600 border">DC Number</td><td className="p-2 border">{viewingSO.dc_no}</td></tr>
            <tr><td className="p-2 font-medium text-gray-600 border">Customer</td><td className="p-2 border">{viewingSO.customer_name}</td></tr>
            <tr><td className="p-2 font-medium text-gray-600 border">DC Date</td><td className="p-2 border">{viewingSO.dc_date ? new Date(viewingSO.dc_date).toLocaleDateString() : ''}</td></tr>
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
interface DCItem {
  item_id: number;
  quantity: number;
  unit_price: number;
  discount: number;
  tax: number;
}

interface SalesOrderFormProps {
  //so?: SO | null;
  onClose: () => void;
  onSave: (payload: { 
    so_id?: number;  
    customer_id: number; 
    dc_date: Date;
    warehouse_id: number,
    status: string,
    remarks: string,
    created_by: number,
    items: DCItem[];
  }) => void;
}

export const SalesOrderForm: React.FC<SalesOrderFormProps> = ({ onClose, onSave }) => {
  const [salesOrders,setSalesOrders] = useState<any[]>([]); 
  const [customers, setCustomers] = useState<any[]>([]);
    const [warehouses, setWarehouses] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);

  const [so_id, setSoId] = useState<number | null>(null);
  const [customer_id, setCustomerId] = useState<number>(0);
  const [dc_date, setDcDate] = useState<Date | null>(new Date());
  const [warehouse_id, setWarehouseId] = useState<number>(0);
  const [status, setStatus] = useState<string>('CREATED');
  const [remarks, setRemarks] = useState<string>('');
  const [created_by, setCreatedBy] = useState<number>(1);

  const [customerOpen, setCustomerOpen] = useState(false);
  const [warehouseOpen, setWarehouseOpen] = useState(false);
  const [soOpen, setSoOpen] = useState(false);
  const [itemDropdown, setItemDropdown] = useState<number | null>(null);


const [dcItems, setDcItems] = useState<DCItem[]>([{ item_id: 0, quantity: 1, unit_price: 0, discount: 0, tax: 0 }]);
//  Fetch SO list
  useEffect(() => {
    const fetchSOs = async () => {
      try {
        const data = await getSOs();
        setSalesOrders(data);
        const custData = await getCustomers();
        setCustomers(custData);
        const itemData = await getItems();
        setItems(itemData);
        const whData = await getWarehouses();
        setWarehouses(whData);
      } catch (error) {
        console.error("Error fetching sales orders:", error);
      }
    };
    fetchSOs();
  }, []);

  // 🔹 When SO changes → prefill details
  useEffect(() => {
    if (!so_id) return;

    const so = salesOrders.find((s) => s.so_id === so_id);
    if (so) {
      setCustomerId(Number(so.customer_id));
      setDcDate(so.dc_date ?? "");
     // setWarehouseId(Number(dc.warehouse_id));
      setDcItems(
        (so.items ?? []).map((it: any) => ({
          item_id: Number(it.item_id),
          quantity: Number(it.quantity),
          unit_price: Number(it.unit_price ?? 0),
          discount: Number(it.discount ?? 0),
          tax: Number(it.tax ?? 0),
        }))
      );
    }
  }, [so_id, salesOrders]);
  // 🔹 Handlers
   const handleDateChange = (date: Date) => {
    setDcDate(date);
  };
   const addItemRow = () => setDcItems((p) => [...p, { item_id: 0, quantity: 1, unit_price: 0, discount: 0, tax: 0 }]);
    const removeItemRow = (index: number) => setDcItems((p) => p.filter((_, i) => i !== index));

    const handleSelectItem = (rowIndex: number, itemId: number) => {
      setDcItems((prev) => {
        const copy = [...prev];
        copy[rowIndex] = { ...copy[rowIndex], item_id: Number(itemId) };
        return copy;
      });
      setItemDropdown(null);
    };
  
    const handleChangeRow = (index: number, field: keyof DCItem, value: number) => {
      setDcItems((prev) => {
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
      if (dcItems.length === 0 || dcItems.some((r) => !r.item_id || r.item_id === 0 || r.quantity <= 0)) {
        alert("Add at least one item and ensure item and quantity are valid.");
        return;
      }
  

    onSave({
      so_id: so_id ?? undefined,
      customer_id,
      dc_date: new Date(dc_date),
      warehouse_id,
      status,
      remarks,
      created_by,
      items: dcItems
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white p-6 rounded-lg w-[800px] max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">Create Delivery Challan</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* SO */}
           <Popover open={soOpen} onOpenChange={setSoOpen}>
                      <PopoverTrigger asChild>
                        <Button variant="outline" role="combobox" className="w-full justify-between">
                          {so_id ? salesOrders.find((so) => Number(so.so_id) === so_id)?.order_number ?? "Select Sales Order" : "Select Sales Order"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="max-h-[300px] overflow-auto">
                        <Command>
                          <CommandInput placeholder="Search SOs..." />
                          <CommandEmpty>No SO</CommandEmpty>
                          <CommandGroup>
                                  {salesOrders.filter(so => so.status === 'APPROVED').length === 0 ? (
                                    <div>No approved SOs available</div>
                                  ) : (
                                    salesOrders
                                      .filter(so => so.status === 'APPROVED') // Filter to show only approved SOs
                                      .map((so) => (
                                        <CommandItem
                                          key={so.so_id}
                                          onSelect={() => {
                                            setSoId(Number(so.so_id));
                                            setSoOpen(false);
                                          }}
                                        >
                                          <Check
                                            className={cn(
                                              "mr-2 h-4 w-4",
                                              so_id === Number(so.so_id) ? "opacity-100" : "opacity-0"
                                            )}
                                          />
                                          {so.order_number} - {so.customer_name}
                                        </CommandItem>
                                      ))
                                  )}
                                </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
          {/* Customer (prefilled from SO) */}
           <div className="flex space-x-4">
  {/* Customer Popover */}
  <Popover open={customerOpen} onOpenChange={setCustomerOpen}>
    <PopoverTrigger asChild>
      <Button variant="outline" role="combobox" className="w-full justify-between">
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
              <Check className={cn("mr-2 h-4 w-4", customer_id === Number(c.customer_id) ? "opacity-100" : "opacity-0")} />
              {c.customer_name}
            </CommandItem>
          ))}
        </CommandGroup>
      </Command>
    </PopoverContent>
  </Popover>

  {/* Warehouse Popover */}
  <Popover open={warehouseOpen} onOpenChange={setWarehouseOpen}>
    <PopoverTrigger asChild>
      <Button variant="outline" role="combobox" className="w-full justify-between">
        {warehouse_id ? warehouses.find((w) => Number(w.warehouse_id) === warehouse_id)?.warehouse_name ?? "Select Warehouse" : "Select Warehouse"}
        <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
      </Button>
    </PopoverTrigger>
    <PopoverContent className="max-h-[300px] overflow-auto">
      <Command>
        <CommandInput placeholder="Search warehouses..." />
        <CommandEmpty>No warehouse</CommandEmpty>
        <CommandGroup>
          {warehouses.map((w) => (
            <CommandItem
              key={w.warehouse_id}
              onSelect={() => {
                setWarehouseId(Number(w.warehouse_id));
                setWarehouseOpen(false);
              }}
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

                          <div className="flex space-x-4">
  {/* DC Date */}
  <div className="flex space-x-4">
            <div className="flex flex-col flex-1">
              <span className="text-xs text-gray-700">DC Date</span>
              <DatePicker
                selected={dc_date}  // Binding the date to the state
                onChange={handleDateChange} // Update state when the date is changed
                dateFormat="yyyy-MM-dd"  // Format the date as required
                className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholderText="Select Date" // Placeholder text
              />
            </div>
          </div>

  {/* Remarks */}
  <div className="flex flex-col flex-1">
    <span className="text-xs text-gray-500">Remarks</span>
    <textarea
      value={remarks}
      onChange={(e) => setRemarks(e.target.value)}
      className="p-2 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
      rows={2} // Set rows for height of textarea
    />
  </div>
</div>

{/* Items rows */}
<div className="space-y-3">
  {dcItems.map((row, idx) => {
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
                            {dcItems.length > 1 && (
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

export default DeliveryChallans;