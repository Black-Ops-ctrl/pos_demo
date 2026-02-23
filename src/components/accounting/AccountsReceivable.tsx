import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Clock, AlertTriangle, CheckCircle, Edit, Trash2, ChevronsUpDown, Check, Package, Eye } from 'lucide-react';
import {Popover,PopoverContent,PopoverTrigger,} from "@/components/ui/popover";
import {Command,CommandEmpty,CommandGroup,CommandInput,CommandItem,} from "@/components/ui/command";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from "@/lib/utils";
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

import { Textarea } from '../ui/textarea';
import { getCustomers } from '@/api/salesOrdersApi';
import { getItems } from '@/api/itemsApi';
import { createSalesInvoice, getSaleInvoices } from '@/api/salesInvoiceApi';
import { toast } from '../ui/use-toast';
import { Invoice } from '@/contexts/AppContext';



interface ARInvoice {
  sales_invoice_id: number;
  sales_invoice_no: number;
  dc_id: number;
  customer_id: number;
  customer_name: string;
  invoice_date: Date;
  due_date :Date;
  sales_person_id: number;
  sales_person_name: string;
  receivable_account_id: number;
  receivable_account_code: string;
  payment_term: string;
  credit_limit: number;
  total_amount: number;
  status: string;
  remarks: string;
  created_by: number;
  updated_by: number;
  updated_date: Date;
  items: Array<{ item_id: number; item_name: string;
    quantity: number; unit_price: number; discount: number; tax: number }>;
}
interface viewingSO {
  sales_invoice_id: number;
  sales_invoice_no: number;
  dc_id: number;
  customer_id: number;
  customer_name: string;
  invoice_date: Date;
  sales_person_id: number;
  sales_person_name: string;
  receivable_account_id: number;
  receivable_account_code: string;
  payment_term: string;
  credit_limit: number;
  total_amount: number;
  status: string;
  remarks: string;
  created_by: number;
  updated_by: number;
  updated_date: Date;
  items: Array<{ item_id: number; item_name: string;
    quantity: number; unit_price: number; discount: number; tax: number }>;
}

const ARInvoices: React.FC = () => {
 const [searchTerm, setSearchTerm] = useState('');
   const [showForm, setShowForm] = useState(false);
   const [salesInvoices, setSalesInvoices] = useState<ARInvoice[]>([]);

   const [viewingSO, setViewingSO] = useState<viewingSO | null>(null);
   const [viewDialogOpen, setViewDialogOpen] = useState(false);

   //Load Sales Invoices
useEffect(() => {
  loadSalesInvoices();
}, []);

  const loadSalesInvoices = async () => {
    try {
      const data = await getSaleInvoices();

      setSalesInvoices(data);
    } catch (error) {
      console.error("Error loading sales invoices", error);
    }
  };
const handleViewSI = (sales_invoice_id) => {
  const selectedSI = salesInvoices.find(si => si.sales_invoice_id === sales_invoice_id);
  if (selectedSI) {
    setViewingSO(selectedSI);
    setViewDialogOpen(true);
  }
};
const handleSaveSI = async (payload: {
  dc_id: number,
  customer_id: number,
  status: string,
  remarks: string,
  created_by: number,
  discount: number,
  tax: number,
  total_amount: number,
  items: SIItem[]
}) => {
  try {
      // CREATE
      await createSalesInvoice(
        payload.dc_id,
        payload.customer_id,
       
        payload.status,
        payload.remarks,
        payload.created_by,
        payload.discount,
        payload.tax,
        payload.total_amount,
        payload.items
      );
      toast({ title: "Created", description: "Sales Invoice created successfully!" });
    setShowForm(false);
    loadSalesInvoices();
  } catch (err) {
    console.error("Save SI failed", err);
  }
};

     const filteredSI = salesInvoices.filter((si) =>
    si.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    si.sales_invoice_no.toString().includes(searchTerm)
  );
  const totalSIs = salesInvoices.length;
  const createdSIs = salesInvoices.filter(si => si.status === 'CREATED').length;
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
            <CardTitle className="text-sm font-medium text-gray-600">Total SIs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSIs}</div>
          </CardContent>
        </Card>
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Created SIs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{createdSIs}</div>
          </CardContent>
        </Card>
      </div>
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Accounts Receivables
            </CardTitle>
           <Button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-purple-500 to-purple-600">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Invoice
                </Button>
          </div>
         <div className="relative">
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
 <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Invoice No</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Invoice Date</TableHead>
          <TableHead>Total Amount</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Show Detail</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredSI.map((si) => (

          <TableRow key={si.sales_invoice_id}>
            <TableCell className="font-medium">{si.sales_invoice_no}</TableCell>
            <TableCell>{si.customer_name}</TableCell>
            <TableCell>{si.invoice_date ? new Date(si.invoice_date).toLocaleDateString() : ''}</TableCell>
            <TableCell>{si.total_amount}</TableCell>
            <TableCell>
              <Badge className={getStatusColor(si.status)}>{si.status}</Badge>
            </TableCell>
            <TableCell>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleViewSI(si.sales_invoice_id)}
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
  <InvoiceForm
   
    onClose={() => { setShowForm(false); }} 
    onSave={handleSaveSI} 
  />
)}

<Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
  <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle>Sales Invoice Details</DialogTitle>
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
              <td className="p-2 font-medium text-gray-600 border">Customer Name</td>
              <td className="p-2 border">{viewingSO.customer_name}</td>
            </tr>
            <tr>
              <td className="p-2 font-medium text-gray-600 border"> Sales Person</td>
              <td className="p-2 border">{viewingSO.sales_person_name}</td>
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
         {/* Remarks */}
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
  quantity: number;
  unit_price: number;
  discount: number;
  tax: number;
}

interface SalesInvoiceFormProps {
  //so?: SO | null;
  onClose: () => void;
  onSave: (payload: { 
    sales_invoice_id?: number;  
    customer_id: number; 
    status: string,
    remarks: string,
    created_by: number,
    discount: number,
    tax: number,
    total_amount: number,
    
    items: SIItem[];
  }) => void;
}

export const InvoiceForm: React.FC<SalesInvoiceFormProps> = ({ onClose, onSave }) => {
  const [salesInvoices, setSalesInvoices] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
    
  const [items, setItems] = useState<any[]>([]);

  const [sales_invoice_id, setSalesInvoiceId] = useState<number | null>(null);
  const [customer_id, setCustomerId] = useState<number>(0);
  const [status, setStatus] = useState<string>('CREATED');
  const [remarks, setRemarks] = useState<string>('');
  const [created_by, setCreatedBy] = useState<number>(1);
  const [discount, setDiscount] = useState<number>(0);
  const [tax, setTax] = useState<number>(0);
  const [total_amount, setTotalAmount] = useState<number>(0);
  const [payment_term, setPaymentTerm]= useState<string>("") ;
  const [invoice_date,setInvoiceDate]=useState<Date | Invoice>(new Date());
  const [due_date,setDueDate]=useState<Date >(new Date());
 

  const [customerOpen, setCustomerOpen] = useState(false);
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [itemDropdown, setItemDropdown] = useState<number | null>(null);


const [siItems, setSiItems] = useState<SIItem[]>([{ item_id: 0, quantity: 1, unit_price: 0, discount: 0, tax: 0 }]);
//  Fetch DC list
  useEffect(() => {
    const fetchDCs = async () => {
      try {
        const data = await getSaleInvoices();
        setSalesInvoices(data);
        console.log("Fetched SIs:", data);
        const custData = await getCustomers();
        setCustomers(custData);
        const itemData = await getItems();
        setItems(itemData);
       
      } catch (error) {
        console.error("Error fetching delivery challans:", error);
      }
    };
    fetchDCs();
  }, []);


  // 🔹 When SO changes → prefill details
  useEffect(() => {
    if (!sales_invoice_id) return;

     const si = salesInvoices.find((invoice) => invoice.sales_invoice_id === sales_invoice_id);
    if (si) {
      setCustomerId(Number(si.customer_id));
      setRemarks(si.remarks);
        setPaymentTerm(si.payment_term);
        setInvoiceDate(new Date(si.invoice_date));
      setDueDate(si.invoice_date);
      setSiItems(
        (si.items ?? []).map((it: any) => ({
          item_id: Number(it.item_id),
          quantity: Number(it.quantity),
          unit_price: Number(it.unit_price ?? 0),
          discount: Number(it.discount ?? 0),
          tax: Number(it.tax ?? 0),
        }))
      );
    }
  }, [sales_invoice_id, salesInvoices]);
      // Handle invoice selection from the dropdown
  const handleInvoiceSelect = (invoiceId: number) => {
    setSalesInvoiceId(invoiceId);
  };
  
  // 🔹 Auto-calc total_amount whenever siItems change
   useEffect(() => {
     
     const discount= siItems.reduce((sum, row) => sum + row.discount, 0);
     const tax= siItems.reduce((sum, row) => sum + row.tax, 0);
     const total = siItems.reduce(
       (sum, row) => sum + (row.quantity * row.unit_price) - row.discount + row.tax,
       0
     );
     
     setDiscount(discount);
     setTax(tax);
     setTotalAmount(total);
   }, [siItems]);
 
   const addItemRow = () => setSiItems((p) => [...p, { item_id: 0, quantity: 1, unit_price: 0, discount: 0, tax: 0 }]);
    const removeItemRow = (index: number) => setSiItems((p) => p.filter((_, i) => i !== index));

    const handleSelectItem = (rowIndex: number, itemId: number) => {
      setSiItems((prev) => {
        const copy = [...prev];
        copy[rowIndex] = { ...copy[rowIndex], item_id: Number(itemId) };
        return copy;
      });
      setItemDropdown(null);
    };

    const handleChangeRow = (index: number, field: keyof SIItem, value: number) => {
      setSiItems((prev) => {
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
      if (siItems.length === 0 || siItems.some((r) => !r.item_id || r.item_id === 0 || r.quantity <= 0)) {
        alert("Add at least one item and ensure item and quantity are valid.");
        return;
      }
  

    onSave({
      sales_invoice_id: sales_invoice_id ?? undefined,
      customer_id,
      status,
      remarks,
      created_by,
      discount,
      tax,
      total_amount,
      items: siItems
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg w-[800px] max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">Create Sales Invoice</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="flex space-x-4">
           {/* Delivery Challan */}
          <Popover open={invoiceOpen} onOpenChange={setInvoiceOpen}>
  <PopoverTrigger asChild>
    <Button variant="outline" role="combobox" className="w-full justify-between">
      {sales_invoice_id ? salesInvoices.find((si) => Number(si.sales_invoice_id) === sales_invoice_id)?.sales_invoice_no ?? "Select Sales Invoices" : "Select Sales Invoices"}
      <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
    </Button>
  </PopoverTrigger>
  <PopoverContent className="max-h-[300px] overflow-auto p-4">
    <Command>
      <CommandInput placeholder="Search Invoices..." />
      <CommandEmpty>No invoice</CommandEmpty>
      <CommandGroup>
        {salesInvoices.filter(si => si.status === 'APPROVED').length === 0 ? (
          <div>No approved Invoices available</div>
        ) : (
          salesInvoices
            .filter(si => si.status === 'APPROVED') // Filter to show only approved DCs
            .map((si) => (
              <CommandItem
                key={si.sales_invoice_id}
                onSelect={() => {
                  setSalesInvoiceId(Number(si.sales_invoice_id));
                  setInvoiceOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    sales_invoice_id === Number(si.sales_invoice_id) ? "opacity-100" : "opacity-0"
                  )}
                />
                {si.sales_invoice_id}
              </CommandItem>
            ))
        )}
      </CommandGroup>
    </Command>
  </PopoverContent>
</Popover>

         
          
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
</div>
<div className='grid grid-cols-3 gap-4'>
            <div className='flex flex-col'>
            <Label htmlFor="date">Invoice Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={invoice_date instanceof Date ? invoice_date.toISOString().substring(0, 10) : ""}
                  onChange={(e) => setInvoiceDate(e.target.value ? new Date(e.target.value) : null)}
                  required
                />
                </div>
                  <div className='flex flex-col'>
            <Label htmlFor="date">Due Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={due_date instanceof Date ? due_date.toISOString().substring(0, 10) : ""}
                  onChange={(e) => setDueDate(e.target.value ? new Date(e.target.value) : null)}
                  required
                />
                </div>
                 
                 {/* Payment Terms */}
          <div>
             <Label htmlFor="terms">Payment Terms</Label>
            <Select value={payment_term} onValueChange={(value) => setPaymentTerm(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ADVANCE">ADVANCE</SelectItem>
                <SelectItem value="15 Days">15 Days</SelectItem>
                <SelectItem value="30 Days">30 Days</SelectItem>
                <SelectItem value="45 Days">45 Days</SelectItem>
                <SelectItem value="60 Days">60 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>

                          
</div>
  {/* Remarks */}
  <div className="flex flex-col">
    <span className="text-xs text-gray-500">Remarks</span>
    <textarea
      value={remarks}
      onChange={(e) => setRemarks(e.target.value)}
      className="p-2 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
      rows={2} // Set rows for height of textarea
    />
  </div>


{/* Items rows */}
<div className="space-y-3">
  {siItems.map((row, idx) => {
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
                            {items.length > 1 && (
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

export default ARInvoices;