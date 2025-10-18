import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { format } from "date-fns";

import { Label } from '@/components/ui/label';
import DatePicker from "react-datepicker"; // Import DatePicker
import "react-datepicker/dist/react-datepicker.css"; // Import DatePicker styles

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Eye, Check, X, Edit, Trash2, Search, Package, ChevronsUpDown, Truck, CalendarIcon } from 'lucide-react';
import { getItems } from '@/api/itemsApi';
import { getCustomers } from '@/api/customerApi';
import { getCompanies } from '@/api/getCompaniesApi';
import { getBranches } from '@/api/getBranchesApi';
import { Popover, PopoverContent, PopoverTrigger, } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { getSOs } from '@/api/salesOrdersApi';
import { toast } from '../ui/use-toast';
import { createDC, getDeliveryChallans } from '@/api/deliveryChallansApi';
import { getWarehouses } from '@/api/getWarehousesApi';
import { set } from 'date-fns';
import { getSaleInvoices, createSalesInvoice } from '@/api/salesInvoiceApi';

// New import for Checkbox
import { Checkbox } from '@/components/ui/checkbox';


interface SalesInvoice {
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
    items: Array<{
        item_id: number; item_name: string;
        uom?: string;
        quantity: number; unit_price?: number; rate?: number; amount?: number; discount: number; discount_amount?: number; tax: number; tax_amount?: number; row_total?: number;
    }>;
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
    items: Array<{
        item_id: number; item_name: string;
        uom?: string;
        quantity: number; unit_price?: number; rate?: number; amount?: number; discount: number; discount_amount?: number; tax: number; tax_amount?: number; row_total?: number;
    }>;
}

const SalesInvoice: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [salesInvoices, setSalesInvoices] = useState<SalesInvoice[]>([]);
    const [selectedInvoices, setSelectedInvoices] = useState<number[]>([]);

    const [viewingSO, setViewingSO] = useState<viewingSO | null>(null);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);

    useEffect(() => {
        loadSalesInvoices();
    }, []);

    const loadSalesInvoices = async () => {
        try {
            const data = await getSaleInvoices();

            setSalesInvoices(data);
            console.log(data);
        } catch (error) {
            console.error("Error loading sales invoices", error);
        }
    };
    
    const handleApproveInvoices = async () => {
        if (selectedInvoices.length === 0) {
            toast({ title: "Warning", description: "Please select at least one invoice to approve.", variant: "destructive" });
            return;
        }

        if (!window.confirm(`Are you sure you want to approve ${selectedInvoices.length} selected invoice(s)? This will update their status.`)) {
            return;
        }

        try {
            const approvalPromises = selectedInvoices.map(sales_invoice_id => {
                const url = "http://84.16.235.111:2091/api/invoices-status";
                const payload = {
                    operation: 1, // 1 for 'Approved'
                    sales_invoice_id: sales_invoice_id
                };

                return fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
                }).then(response => {
                    if (!response.ok) {
                        throw new Error(`Invoice ${sales_invoice_id} failed with status ${response.status}`);
                    }
                    return response.json();
                });
            });
            await Promise.all(approvalPromises);

            // Success Feedback and UI Reset
            toast({ 
                title: "Success", 
                description: `${selectedInvoices.length} Sales Invoice(s) approved successfully! ✅` 
            });
            setSelectedInvoices([]); // Clear the selection
            loadSalesInvoices(); // Reload the list to show updated statuses

        } catch (error: any) {
            console.error("Approval failed:", error);
            toast({ 
                title: "Error", 
                description: `Failed to approve one or more invoices. Details: ${error.message}`, 
                variant: "destructive" 
            });
        }
    };

    const handleViewSI = (sales_invoice_id: number) => {
        const selectedSI = salesInvoices.find(si => si.sales_invoice_id === sales_invoice_id);
        if (selectedSI) {
            setViewingSO(selectedSI);
            setViewDialogOpen(true);
        }
    };

    const handleSaveSI = async (payload: {
        dc_id?: number,
        customer_id: number,
        invoice_date: Date, // 🆕 Added invoice_date
        status: string,
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
                discount: it.discount ?? 0,
                tax: it.tax ?? 0,
            }));

            await createSalesInvoice(
                payload.customer_id,
                payload.invoice_date, // 🆕 Passed invoice_date
                payload.status,
                payload.remarks,
                payload.created_by,
                payload.total_amount,
                apiItems
            );
            toast({ title: "Created", description: "Sales Invoice created successfully!" });
            setShowForm(false);
            loadSalesInvoices();
        } catch (err) {
            console.error("Save SI failed", err);
            toast({ title: "Error", description: "Failed to create Sales Invoice.", variant: "destructive" });
        }
    };

  const filteredSI = salesInvoices.filter((si) => {
  const term = (searchTerm || "").toLowerCase(); // ensure not null
  return (
    (si.customer_name || "").toLowerCase().includes(term) ||
    si.sales_invoice_no?.toString().includes(term)
  );
});
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
    const handleCheckboxChange = (sales_invoice_id: number, checked: boolean) => {
        if (checked) {
            setSelectedInvoices((prev) => [...prev, sales_invoice_id]);
        } else {
            setSelectedInvoices((prev) => prev.filter(id => id !== sales_invoice_id));
        }
    };
    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            const allIds = filteredSI.map(si => si.sales_invoice_id);
            setSelectedInvoices(allIds);
        } else {
            setSelectedInvoices([]);
        }
    };

    const isAllSelected = filteredSI.length > 0 && selectedInvoices.length === filteredSI.length;
    const isIndeterminate = selectedInvoices.length > 0 && selectedInvoices.length < filteredSI.length;


    return (
        <div className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Package className="h-5 w-5" />
                            Sales Invoices
                        </CardTitle>
                        <Button
                            onClick={handleApproveInvoices}
                            disabled={selectedInvoices.length === 0}
                            className="bg-gradient-to-r from-red-500 to-purple-700">
                            <Check className="h-4 w-4 mr-2" />
                            Approve Selected ({selectedInvoices.length})
                        </Button>


                        <Button
                            onClick={() => setShowForm(true)}
                            className="bg-gradient-to-r from-red-500 to-purple-600">
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
                                {/* Checkbox column header */}
                                <TableHead className="w-10">
                                    <Checkbox
                                        checked={isAllSelected}
                                        onCheckedChange={(checked) => handleSelectAll(!!checked)}
                                        // A simple way to visually indicate indeterminate state in Tailwind/Shadcn UI
                                        {...(isIndeterminate && { 'data-state': 'indeterminate' })} 
                                    />
                                </TableHead>
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
                                    {/* Checkbox column cell */}
                                    <TableCell>
                                        <Checkbox
                                            checked={selectedInvoices.includes(si.sales_invoice_id)}
                                            onCheckedChange={(checked) => handleCheckboxChange(si.sales_invoice_id, !!checked)}
                                        />
                                    </TableCell>
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
                <SalesInvoiceForm

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
                                            <td className="p-2 border">{(item.row_total ?? ((item.quantity||0) * (item.rate ?? item.unit_price ?? 0) - (item.discount ?? 0) + (item.tax ?? 0))).toFixed ? (item.row_total ?? ((item.quantity||0) * (item.rate ?? item.unit_price ?? 0) - (item.discount ?? 0) + (item.tax ?? 0))).toFixed(2) : (item.row_total ?? ((item.quantity||0) * (item.rate ?? item.unit_price ?? 0) - (item.discount ?? 0) + (item.tax ?? 0)))}</td>
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
    uom?: string;
    quantity: number;
    rate: number; // renamed from unit_price
    amount?: number; // computed: quantity * rate
    discount: number; // discount amount
    discount_amount?: number; // computed (for clarity, here equal to discount)
    tax: number; // tax amount
    tax_amount?: number; // computed (for clarity, here equal to tax)
    row_total?: number; // computed: amount - discount + tax
}

interface SalesInvoiceFormProps {
    onClose: () => void;
    onSave: (payload: {
        dc_id?: number;
        customer_id: number;
        invoice_date: Date; // 🆕 Added invoice_date
        status: string,
        remarks: string,
        created_by: number,
        total_amount: number,
        items: SIItem[];
    }) => void;
}

export const SalesInvoiceForm: React.FC<SalesInvoiceFormProps> = ({ onClose, onSave }) => {
    const [deliveryChallans, setDeliveryChallans] = useState<any[]>([]);
    const [customers, setCustomers] = useState<any[]>([]);
    const [companies, setCompanies] = useState<any[]>([]);
    const [branches, setBranches] = useState<any[]>([]);
    const [selectedCustomerDetails, setSelectedCustomerDetails] = useState<any | null>(null);
    const [items, setItems] = useState<any[]>([]);

    const [companyName, setCompanyName] = useState<string>('');
    const [branchName, setBranchName] = useState<string>('');

    const [dc_id, setDcId] = useState<number | null>(null);
    const [customer_id, setCustomerId] = useState<number>(0);
    const [invoice_date, setInvoiceDate] = useState<Date>(new Date()); // 🆕 New state for Invoice Date
    const [status, setStatus] = useState<string>('CREATED');
    const [remarks, setRemarks] = useState<string>('');
    const [created_by, setCreatedBy] = useState<number>(1);
    // These states are kept for calculation but are no longer passed to the root API payload
    const [discount, setDiscount] = useState<number>(0);
    const [tax, setTax] = useState<number>(0);
    const [total_amount, setTotalAmount] = useState<number>(0);

    const [customerOpen, setCustomerOpen] = useState(false);
    const [dcOpen, setDcOpen] = useState(false);
    const [itemDropdown, setItemDropdown] = useState<number | null>(null);


    const [siItems, setSiItems] = useState<SIItem[]>([{ item_id: 0, uom: undefined, quantity: 1, rate: 0, amount: 0, discount: 0, discount_amount: 0, tax: 0, tax_amount: 0, row_total: 0 }]);

    // Load customers, items and delivery challans when the form mounts
    useEffect(() => {
        const load = async () => {
            try {
                const [custRes, itemsRes, dcRes, compRes, branchRes] = await Promise.all([
                    getCustomers(),
                    getItems(),
                    getDeliveryChallans(),
                    getCompanies(),
                    getBranches(),
                ]);

                // Some APIs return objects with data, others arrays directly. Normalize defensively.
                const custList = Array.isArray(custRes) ? custRes : (custRes?.data ?? []);
                const itemList = Array.isArray(itemsRes) ? itemsRes : (itemsRes?.data ?? []);
                const dcList = Array.isArray(dcRes) ? dcRes : (dcRes?.data ?? []);
                const compList = Array.isArray(compRes) ? compRes : (compRes?.data ?? []);
                const branchList = Array.isArray(branchRes) ? branchRes : (branchRes?.data ?? []);

                setCustomers(custList);
                setItems(itemList);
                setDeliveryChallans(dcList);
                setCompanies(compList);
                setBranches(branchList);

                // If there is exactly one company, auto-select it
                try {
                    if (Array.isArray(compList) && compList.length === 1) {
                        const only = compList[0];
                        setCompanyName(only.name ?? only.company_name ?? '');
                    }
                } catch (e) {
                    // ignore
                }

                // persist customers list locally so it can be reused
                try {
                    localStorage.setItem('customers', JSON.stringify(custList));
                } catch (e) {
                    console.warn('Unable to persist customers to localStorage', e);
                }

                // If there is a previously selected customer in localStorage, preselect it
                try {
                    const sel = localStorage.getItem('selectedCustomer');
                    if (sel) {
                        const parsed = JSON.parse(sel);
                        if (parsed?.customer_id) setCustomerId(Number(parsed.customer_id));
                    }
                } catch (e) {
                    // ignore JSON parse errors
                }

            } catch (err) {
                console.error('Failed to load form data', err);
                toast({ title: 'Error', description: 'Failed to load customers/items/delivery challans/companies/branches', variant: 'destructive' });
                // fallback: try to load customers from localStorage if API failed
                try {
                    const cached = localStorage.getItem('customers');
                    if (cached) setCustomers(JSON.parse(cached));
                } catch (e) {
                    // ignore
                }
            }
        };

        load();
    }, []);
    useEffect(() => {
        if (!dc_id) return;

        const dc = deliveryChallans.find((d) => d.dc_id === dc_id);
        if (dc) {
            setCustomerId(Number(dc.customer_id));
            const mapped = (dc.items ?? []).map((it: any) => {
                // Try to use price/uom from DC; if missing, fall back to preloaded items catalog
                const catalog = items.find((i) => Number(i.item_id) === Number(it.item_id));
                const fallbackUom = catalog?.uom ?? catalog?.unit ?? catalog?.default_uom ?? undefined;
                const fallbackRate = Number(catalog?.default_rate ?? catalog?.unit_price ?? catalog?.rate ?? 0);

                const rateValue = Number(it.unit_price ?? it.rate ?? fallbackRate);
                const uomValue = it.uom ?? it.unit ?? fallbackUom;
                const qty = Number(it.quantity ?? 0);
                const amountVal = Number(qty * (rateValue || 0));
                const discountVal = Number(it.discount ?? 0);
                const taxVal = Number(it.tax ?? 0);
                const rowTotalVal = amountVal - discountVal + taxVal;

                return {
                    item_id: Number(it.item_id),
                    uom: uomValue,
                    quantity: qty,
                    rate: rateValue,
                    amount: amountVal,
                    discount: discountVal,
                    discount_amount: discountVal,
                    tax: taxVal,
                    tax_amount: taxVal,
                    row_total: rowTotalVal,
                } as SIItem;
            });

            const { computed, discountSum, taxSum, total } = computeSiItems(mapped);
            setSiItems(computed);
            // If the dc payload contains customer extended info, persist it
            try {
                const cust = dc.customer ?? dc.customer_info ?? null;
                if (cust && cust.customer_id) {
                    const sel = {
                        customer_id: cust.customer_id,
                        customer_name: cust.customer_name ?? cust.name ?? null,
                        ntn: cust.ntn ?? null,
                        reg_no: cust.reg_no ?? null,
                        discount: cust.discount ?? null,
                    };
                    localStorage.setItem('selectedCustomer', JSON.stringify(sel));
                }
            } catch (e) {
                // ignore localStorage errors
            }
        }
    }, [dc_id, deliveryChallans]);

    // 🔹 Auto-calc per-row amounts and invoice totals whenever siItems change
    useEffect(() => {
        let discountSum = 0;
        let taxSum = 0;
        let total = 0;

        const computed = siItems.map((row) => {
            const amount = Number((row.quantity || 0) * (row.rate || 0));
            const discount_amount = Number(row.discount || 0); // assuming discount is amount
            const tax_amount = Number(row.tax || 0); // assuming tax is amount
            const row_total = amount - discount_amount + tax_amount;

            discountSum += discount_amount;
            taxSum += tax_amount;
            total += row_total;

            return { ...row, amount, discount_amount, tax_amount, row_total } as SIItem;
        });

        // update siItems with computed fields without changing references unexpectedly
        setSiItems(computed);

        setDiscount(discountSum);
        setTax(taxSum);
        setTotalAmount(total);
    }, []); // will be triggered manually in handlers to avoid infinite loop

    // Helper to compute per-row fields and totals without causing update loops
    const computeSiItems = (items: SIItem[]) => {
        let discountSum = 0;
        let taxSum = 0;
        let total = 0;

        const computed = items.map((row) => {
            const amount = Number((row.quantity || 0) * (row.rate || 0));
            const discount_amount = Number(row.discount || 0);
            const tax_amount = Number(row.tax || 0);
            const row_total = amount - discount_amount + tax_amount;

            discountSum += discount_amount;
            taxSum += tax_amount;
            total += row_total;

            return { ...row, amount, discount_amount, tax_amount, row_total } as SIItem;
        });

        return { computed, discountSum, taxSum, total };
    };

    // initialize computed values on mount
    useEffect(() => {
        const { computed, discountSum, taxSum, total } = computeSiItems(siItems);
        setSiItems(computed);
        setDiscount(discountSum);
        setTax(taxSum);
        setTotalAmount(total);
    }, []);

    const addItemRow = () => {
        const next = [...siItems, { item_id: 0, uom: undefined, quantity: 1, rate: 0, amount: 0, discount: 0, discount_amount: 0, tax: 0, tax_amount: 0, row_total: 0 }];
        const { computed, discountSum, taxSum, total } = computeSiItems(next);
        setSiItems(computed);
        setDiscount(discountSum);
        setTax(taxSum);
        setTotalAmount(total);
    };

    const removeItemRow = (index: number) => {
        const next = siItems.filter((_, i) => i !== index);
        const { computed, discountSum, taxSum, total } = computeSiItems(next);
        setSiItems(computed);
        setDiscount(discountSum);
        setTax(taxSum);
        setTotalAmount(total);
    };

    const handleSelectItem = (rowIndex: number, itemId: number) => {
        const copy = [...siItems];
        const selectedItem = items.find((it) => Number(it.item_id) === Number(itemId));

        // Determine UOM and Rate from selected item (fallbacks included)
        const uomValue = selectedItem?.uom ?? selectedItem?.unit ?? selectedItem?.default_uom ?? '';
        const rateValue = Number(selectedItem?.default_rate ?? selectedItem?.unit_price ?? selectedItem?.rate ?? 0);

        // Ensure quantity defaults to 1 if not present
        const qty = copy[rowIndex]?.quantity ?? 1;

        // Compute amount/row totals for the selected item row
        const amountVal = Number(qty * (rateValue || 0));
        const discountVal = Number(copy[rowIndex]?.discount ?? 0);
        const taxVal = Number(copy[rowIndex]?.tax ?? 0);
        const rowTotalVal = amountVal - discountVal + taxVal;

        copy[rowIndex] = {
            ...copy[rowIndex],
            item_id: Number(itemId),
            uom: uomValue,
            rate: rateValue,
            quantity: qty,
            amount: amountVal,
            discount: discountVal,
            discount_amount: discountVal,
            tax: taxVal,
            tax_amount: taxVal,
            row_total: rowTotalVal,
        } as SIItem;

        const { computed, discountSum, taxSum, total } = computeSiItems(copy);
        setSiItems(computed);
        setDiscount(discountSum);
        setTax(taxSum);
        setTotalAmount(total);
        setItemDropdown(null);
    };

    const handleChangeRow = (index: number, field: keyof SIItem, value: any) => {
        const copy = [...siItems];
        copy[index] = { ...copy[index], [field]: value } as SIItem;
        const { computed, discountSum, taxSum, total } = computeSiItems(copy);
        setSiItems(computed);
        setDiscount(discountSum);
        setTax(taxSum);
        setTotalAmount(total);
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
            customer_id,
            invoice_date, // 🆕 Passed invoice_date
            status,
            remarks,
            created_by,
            total_amount,
            items: siItems.map(it => ({
                item_id: it.item_id,
                uom: it.uom,
                quantity: it.quantity,
                rate: it.rate,
                unit_price: it.rate, // backward compatible
                amount: it.amount,
                discount: it.discount,
                discount_amount: it.discount_amount,
                tax: it.tax,
                tax_amount: it.tax_amount,
                row_total: it.row_total,
            }))
        });
    };

    return (
<div className="fixed inset-0 bg-white z-50 overflow-y-auto">
    <div className="p-6 pt-2 max-w-6xl mx-auto">


                                <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center">Sales Invoice</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Top info box: Company / Branch / Date / Customer / Remarks */}
                            <div className="p-4 border border-gray-200 rounded-lg bg-white/50 space-y-4">
                    {/* Company and Branch fields (above date & customer) */}
                    <div className="grid grid-cols-2 gap-4">
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
                                                <CommandItem key={b.id ?? b.branch_id} onSelect={() => setBranchName(b.branch_name ?? b.name ?? '')}>
                                                    {b.branch_name ?? b.name}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>

                    <div className="flex space-x-4">
                        
                        {/* 🆕 Invoice Date Picker */}
                        <div className="flex flex-col space-y-1 w-full">
                            <span className="text-xs text-gray-500">Invoice Date</span>
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

                        <div className="flex flex-col w-full">
                            <span className="text-xs text-gray-500">Customer</span>
                            <Popover open={customerOpen} onOpenChange={setCustomerOpen}>
                            <PopoverTrigger asChild>
                                <Button type="button" variant="outline" role="combobox" className="w-full justify-between">
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

                                                                    // store selected customer's details (ntn, reg_no, discount) in localStorage
                                                                    try {
                                                                        const sel = {
                                                                            customer_id: c.customer_id,
                                                                            customer_name: c.customer_name,
                                                                            ntn: c.ntn ?? null,
                                                                            reg_no: c.reg_no ?? null,
                                                                            discount: c.discount ?? null,
                                                                        };
                                                                        localStorage.setItem('selectedCustomer', JSON.stringify(sel));
                                                                    } catch (e) {
                                                                        console.warn('Failed to save selectedCustomer to localStorage', e);
                                                                    }
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

                     </div>

                    <div className="space-y-3">
                        {siItems.map((row, idx) => {
                            const selected = items.find((it) => Number(it.item_id) === Number(row.item_id));
                            return (
                                <div key={idx} className="flex items-center gap-2 w-full">
                                    {/* Item dropdown */}
                                    <Popover open={itemDropdown === idx} onOpenChange={(open) => setItemDropdown(open ? idx : null)}>
                                        <PopoverTrigger asChild>
                                            <Button type="button" variant="outline" className="w-1/4 justify-between">
                                                {row.item_id ? (
                                                    <div className="flex items-center justify-between w-full">
                                                        <span className="truncate">{selected?.item_name ?? 'Selected item'}</span>
                                                        <span className="ml-2 text-sm text-gray-500">{Number(selected?.default_rate ?? selected?.unit_price ?? selected?.rate ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                                    </div>
                                                ) : (
                                                    'Select Item'
                                                )}
                                                <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="max-h-[300px] overflow-auto">
                                            <Command>
                                                <CommandInput placeholder="Search items..." />
                                                <CommandEmpty>No items</CommandEmpty>
                                                <CommandGroup>
                                                    {items.map((it) => {
                                                        const price = Number(it.default_rate ?? it.unit_price ?? it.rate ?? 0);
                                                        return (
                                                            <CommandItem key={it.item_id} onSelect={() => handleSelectItem(idx, Number(it.item_id))}>
                                                                <Check className={cn("mr-2 h-4 w-4", row.item_id === Number(it.item_id) ? "opacity-100" : "opacity-0")} />
                                                                <div className="flex justify-between items-center w-full">
                                                                    <span className="truncate">{it.display_name}</span>
                                                                    {/* <span className="text-sm text-gray-500">{price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span> */}
                                                                </div>
                                                            </CommandItem>
                                                        );
                                                    })}
                                                </CommandGroup>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>

                                    {/* UOM */}
                                    <div className="flex flex-col w-1/12">
                                        <span className="text-xs text-gray-500">UOM</span>
                                        <Input
                                            type="text"
                                            className="w-full"
                                            value={row.uom ?? ''}
                                            onChange={(e) => handleChangeRow(idx, 'uom', e.target.value)}
                                        />
                                    </div>

                                    <div className="flex flex-col w-1/12">
                                        <span className="text-xs text-gray-500">Qty</span>
                                        <Input
                                            type="number"
                                            className="w-full"
                                            min={1}
                                            value={row.quantity}
                                            onChange={(e) => handleChangeRow(idx, "quantity", Number(e.target.value || 0))}
                                        />
                                    </div>

                                    <div className="flex flex-col w-1/12">
                                        <span className="text-xs text-gray-500">Rate</span>
                                        <Input
                                            type="number"
                                            className="w-full"
                                            min={0}
                                            step="0.01"
                                            value={row.rate}
                                            onChange={(e) => handleChangeRow(idx, "rate", Number(e.target.value || 0))}
                                        />
                                    </div>

                                    {/* Amount (computed) */}
                                    <div className="flex flex-col w-1/12">
                                        <span className="text-xs text-gray-500">Amount</span>
                                        <div className="p-2 border rounded-md bg-gray-50">{(row.amount ?? 0).toFixed(2)}</div>
                                    </div>

                                    {/* Discount (input) and Discount Amount (computed) */}
                                    <div className="flex flex-col w-1/12">
                                        <span className="text-xs text-gray-500">Discount</span>
                                        <Input
                                            type="number"
                                            className="w-full"
                                            min={0}
                                            step="0.01"
                                            value={row.discount}
                                            onChange={(e) => handleChangeRow(idx, "discount", Number(e.target.value || 0))}
                                        />
                                    </div>

                                    {/* Tax (input) and Tax Amount (computed) */}
                                    <div className="flex flex-col w-1/12">
                                        <span className="text-xs text-gray-500">Tax</span>
                                        <Input
                                            type="number"
                                            className="w-full"
                                            min={0}
                                            step="0.01"
                                            value={row.tax}
                                            onChange={(e) => handleChangeRow(idx, "tax", Number(e.target.value || 0))}
                                        />
                                    </div>

                                    {/* Row Total (computed) */}
                                    <div className="flex flex-col w-1/12">
                                        <span className="text-xs text-gray-500">Row Total</span>
                                        <div className="p-2 border rounded-md bg-gray-50">{(row.row_total ?? 0).toFixed(2)}</div>
                                    </div>


                                    {/* Remove row */}
                                    {siItems.length > 1 && (
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

export default SalesInvoice;