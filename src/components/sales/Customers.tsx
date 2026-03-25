import React, { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// XCircle added for Inactive button icon
import { Plus, Search, Edit, Trash2, Building2, ChevronsUpDown, Check, XCircle, ArrowUp } from "lucide-react"; 
import { useToast } from "@/hooks/use-toast";

import { getCurrentUserId } from "@/components/security/LoginPage";
// const user_id = getCurrentUserId(); // user_id is declared but not used in the provided snippet. Keeping commented for safety.
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select"
import { getCustomerAccounts } from "@/api/getAccountsApi";
import { getRegions } from "@/api/regionApi";
import { getCity } from "@/api/cityApi";

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
// handleInactive function is imported from customerApi
import { getCustomers, addCustomer, updateCustomer, deleteCustomer } from "@/api/customerApi"; 
import { getSalesPersons } from "@/api/salesPersonApi";
import { Checkbox } from "@/components/ui/checkbox"; 
import axios from "axios";


// --- API Constants ---
const CUSTOMER_STATUS_API_URL = "http://84.16.235.111:2149/api/customer-status";
const USER_ID = getCurrentUserId(); // Assuming getCurrentUserId is a valid hook/function to get the user ID for API payloads

// --- Interfaces (unchanged) ---
export interface Customer {
    customer_id: number;
    customer_name: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    status: string;
    country: string;
    ntn?: string;
    reg_no?: string;
    credit_limit: number;
    allow_commission?: string;       
    payment_term?: string;
    sales_person_id?: number;
    sales_person_name?: string;
    account_id?: number;
    account_code?: string;
    region_id?: number;
    region_name?: string;
    agreement_start_date?: string;    
    agreement_end_date?: string;      
    module_id?: number;
    created_by?: number;
    creation_date?: string;          
    updated_date?: string;           
    updated_by?: number;
}

// =========================================================================
//                               Customers Component
// =========================================================================
const Customers: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
    const [showScrollToTop, setShowScrollToTop] = useState(false); 

    const [Customers, setCustomers] = useState<Customer[]>([]);
    // State to track selected customer IDs for batch actions
    const [selectedCustomerIds, setSelectedCustomerIds] = useState<number[]>([]); 
    const { toast } = useToast();

    // Load customers
    const loadCustomers = async () => {
        try {
            const res = await getCustomers();
            
            setCustomers(res);
            
            setSelectedCustomerIds([]); 
        } catch (error) {
            console.error("Error loading customers", error);
        }
    };

    useEffect(() => {
        loadCustomers();
    }, []);

    // --- Scroll to Top Logic (unchanged) ---
    const checkScrollTop = useCallback(() => {
        // Show button if page is scrolled down more than 400px
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
    // ----------------------------------------

    const handleAddCustomer = () => {
        setEditCustomer(null);
        setShowForm(true);
    };

    const handleEditCustomer = (customer: Customer) => {
        setEditCustomer(customer);
        setShowForm(true);
    };

const handleSaveCustomer = async (data: Omit<Customer, "customer_id">) => {
    try {
        // Prepare values with defaults
        const allowCommission = data.allow_commission ; 
        const creditLimit = data.credit_limit || 0;
        const agreementStartDate = data.agreement_start_date || "";
        const agreementEndDate = data.agreement_end_date || "";

        if (editCustomer) {
            // Update existing customer
            await updateCustomer(
                editCustomer.customer_id,
                data.customer_name,
                data.phone,
                data.email,
                data.address,
                data.city,
                data.status,
                data.payment_term,
                data.sales_person_id || 0,
                data.account_id || 0,
                data.ntn || "",
                data.reg_no || "",
                allowCommission,
                creditLimit,
                agreementStartDate,
                agreementEndDate
            );

            toast({ title: "Updated", description: "Customer updated successfully!" });
        } else {
            // Add new customer
            await addCustomer(
                data.customer_name,
                data.phone,
                data.email,
                data.address,
                data.city,
                data.status,
                data.payment_term,
                data.sales_person_id || 0,
                data.account_id || 0,
                data.ntn || "",
                data.reg_no || "",
                allowCommission,
                creditLimit,
                agreementStartDate,
                agreementEndDate
            );

            toast({ title: "Created", description: "Customer created successfully!" });
        }

        setShowForm(false);
        loadCustomers();
    } catch (error) {
        console.error("Error saving Customer", error);
        toast({ title: "Error", description: "Failed to save Customer", variant: "destructive" });
    }
};


    const handleDeleteCustomer = async (customer_id: number) => {
        if (confirm("Are you sure you want to delete this Customer?")) {
            try {
                await deleteCustomer(customer_id);
                loadCustomers();
                toast({ title: "Deleted", description: "Customer deleted successfully!" });
            } catch (error) {
                console.error("Error deleting Customer", error);
                toast({ title: "Error", description: "Failed to delete Customer", variant: "destructive" });
            }
        }
    };

    // --- NEW: Handle checkbox toggle for a single customer ---
    const handleCheckboxChange = (customerId: number, checked: boolean | 'indeterminate') => {
        if (checked === true) {
            setSelectedCustomerIds((prev) => [...prev, customerId]);
        } else if (checked === false) {
            setSelectedCustomerIds((prev) => prev.filter((id) => id !== customerId));
        }
    };

    // --- NEW: Handle toggle for all visible customers ---
    const handleSelectAll = (checked: boolean | 'indeterminate') => {
        if (checked === true) {
            const allVisibleIds = filteredCustomers.map(c => c.customer_id);
            setSelectedCustomerIds(allVisibleIds);
        } else if (checked === false) {
            setSelectedCustomerIds([]);
        }
    };

    // --- NEW: API call to set selected customers as INACTIVE ---
    const handleInactiveSelected = async () => {
        if (selectedCustomerIds.length === 0) {
            toast({ title: "No Selection", description: "Please select at least one customer to mark as Inactive.", variant: "destructive" });
            return;
        }

        if (!confirm(`Are you sure you want to set ${selectedCustomerIds.length} selected customer(s) to INACTIVE?`)) {
            return;
        }

        try {
            // Using the new API endpoint and body structure
            const updatePromises = selectedCustomerIds.map(id => 
                axios.post(CUSTOMER_STATUS_API_URL, {
                    operation: 1, // 1 is for INACTIVE status
                    customer_id: id,
                    updated_by: USER_ID // Pass the current user's ID
                })
            );

            await Promise.all(updatePromises);

            toast({ 
                title: "Success", 
                description: `${selectedCustomerIds.length} customer(s) set to INACTIVE!`,
                className: "bg-green-500 text-white" 
            });

            loadCustomers(); // Reload data to show updated statuses
        } catch (error) {
            console.error("Error setting customers to INACTIVE", error);
            toast({ title: "Error", description: "Failed to update customer status.", variant: "destructive" });
        }
    };

    const filteredCustomers = Customers.filter(
        (c) =>
            c.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (c.phone || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Determine if all visible customers are selected for the Select All checkbox
    const isAllSelected = filteredCustomers.length > 0 && 
                         selectedCustomerIds.length === filteredCustomers.length &&
                         filteredCustomers.every(c => selectedCustomerIds.includes(c.customer_id));
    const isSomeSelected = selectedCustomerIds.length > 0 && !isAllSelected;

    return (
        <>
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Building2 className="h-5 w-5" />
                            Customers
                        </CardTitle>
                        <div className="flex gap-2">
                            {/* --- NEW: Inactive Selected Button --- */}
                            {selectedCustomerIds.length > 0 && (
                                <Button
                                    onClick={handleInactiveSelected}
                                    className="bg-red-500 hover:bg-red-600"
                                >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Inactive Selected ({selectedCustomerIds.length})
                                </Button>
                            )}
                            {/* ------------------------------------- */}
                            <Button
                                onClick={handleAddCustomer}
                                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-primary"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                New Customer
                            </Button>
                        </div>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search Customers..."
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
                                {/* --- UPDATED: Select All Checkbox Header --- */}
                                <TableHead className="w-[40px] p-4">
                                    <Checkbox
                                        checked={isAllSelected ? true : isSomeSelected ? "indeterminate" : false}
                                        onCheckedChange={handleSelectAll}
                                        aria-label="Select all customers"
                                    />
                                </TableHead> 
                                {/* -------------------------------------------- */}
                                <TableHead>Name</TableHead>
                                <TableHead>Sale person</TableHead>
                                <TableHead>Phone</TableHead>
                                {/* <TableHead>Region</TableHead> */}
                                <TableHead>City</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Credit Limit</TableHead>
                                <TableHead>Payment Term</TableHead>
                                {/* <TableHead>Country</TableHead> */}
                                <TableHead>NTN</TableHead>
                                <TableHead>Reg. No</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredCustomers.map((c) => (
                                <TableRow key={c.customer_id}>
                                    {/* --- NEW: Checkbox Cell for selection --- */}
                                    <TableCell className="w-[40px] p-4">
                                        <Checkbox
                                            checked={selectedCustomerIds.includes(c.customer_id)}
                                            onCheckedChange={(checked) => handleCheckboxChange(c.customer_id, checked)}
                                            aria-label={`Select customer ${c.customer_name}`}
                                        />
                                    </TableCell>
                                    {/* ------------------------------------------- */}
                                    <TableCell className="font-medium">{c.customer_name}</TableCell>
                                    <TableCell>{c.sales_person_name || "N/A"}</TableCell>
                                    <TableCell>{c.phone}</TableCell>
                                    {/* <TableCell>{c.region_name}</TableCell> */}
                                    <TableCell>{c.city}</TableCell>
                                    <TableCell>
                                        <span className={`font-semibold ${c.status === 'ACTIVE' ? 'text-green-600' : 'text-red-600'}`}>
                                            {c.status}
                                        </span>
                                    </TableCell>
                                    <TableCell>{c.credit_limit}</TableCell>
                                    <TableCell>{c.payment_term}</TableCell>
                                    {/* <TableCell>{c.country}</TableCell> */}
                                    <TableCell>{c.ntn || "N/A"}</TableCell>
                                    <TableCell>{c.reg_no || "N/A"}</TableCell>
                                    <TableCell>
                                        <div className="flex gap-1">
                                            <Button size="sm" variant="outline" onClick={() => handleEditCustomer(c)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                              {c.status === 'INACTIVE' && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="text-red-600 hover:text-red-700"
                                                onClick={() => handleDeleteCustomer(c.customer_id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                              )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filteredCustomers.length === 0 && (
                                <TableRow>
                                    {/* Colspan increased by 1 for the new checkbox column */}
                                    <TableCell colSpan={15} className="text-center text-sm text-gray-500"> 
                                        No customers found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {showScrollToTop && (
                <Button
                    onClick={scrollToTop}
                    size="icon"
                    className="fixed bottom-6 right-6 z-50 rounded-full shadow-lg 
                                bg-blue-500 hover:bg-blue-600 transition-opacity duration-300"
                    aria-label="Scroll to top"
                >
                    <ArrowUp className="h-5 w-5" />
                </Button>
            )}

            {
                showForm && (
                    <CustomerForm 
                        customer={editCustomer}
                        onClose={() => setShowForm(false)}
                        onSave={handleSaveCustomer} 
                    />
                )
            }
        </>
    );
};

// =========================================================================
//                               CustomerForm Component (unchanged)
// =========================================================================
const CustomerForm: React.FC<{
    customer: Customer | null;
    onClose: () => void;
    onSave: (data: Omit<Customer, "customer_id" | "discount"> & { allow_commission: string; agreement_start_date: string; agreement_end_date: string }) => void;
}> = ({ customer, onClose, onSave }) => {
    const [customer_name, setCustomerName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [address, setAddress] = useState("");
    const [city, setCity] = useState("");
    const [cities, setCities] = useState<any[]>([]);
    const [status, setStatus] = useState("");
    const [country, setCountry] = useState("");
    const [credit_limit, setCreditLimit] = useState<number>(0);
    const [payment_term, setPaymentTerm] = useState("");
    const [account_id, setAccountId] = useState<number>(0);
    const [accounts, setAccounts] = useState<any[]>([]);
    const [accountOpen, setAccountOpen] = useState(false);
    const [sales_person_id, setSalesPersonId] = useState<number>(0);
    const [salespersons, setSalesPersons] = useState<any[]>([]);
    const [salespersonOpen, setSalesPersonOpen] = useState(false);
    const [ntn, setNtn] = useState("");
    const [reg_no, setRegNo] = useState("");
    const [allow_commission, setAllowCommision] = useState("");
    const [agreement_start_date, setAgreementStartDate] = useState("");
    const [agreement_end_date, setAgreementEndDate] = useState("");

const formatDateForInput = (date: string | Date | null | undefined) => {
    if (!date) return "";
    const d = new Date(date);
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${d.getFullYear()}-${month}-${day}`;
};
    useEffect(() => {
        const fetchData = async () => {
            try {
                const accountsData = await getCustomerAccounts();
                setAccounts(accountsData);
                setSalesPersons(await getSalesPersons());
                const cityData = await getCity();
                setCities(cityData || []);

                if (customer) {
                    setCustomerName(customer.customer_name || "");
                    setPhone(customer.phone || "");
                    setEmail(customer.email || "");
                    setAddress(customer.address || "");
                    setCity(customer.city || "");
                    setStatus(customer.status || "");
                    setCountry(customer.country || "");
                    setCreditLimit(customer.credit_limit || 0);
                    setPaymentTerm(customer.payment_term || "");
                    setAccountId(customer.account_id || 0);
                    setSalesPersonId(customer.sales_person_id || 0);
                    setNtn(customer.ntn || "");
                    setRegNo(customer.reg_no || "");
                    setAllowCommision(customer.allow_commission || "");
                    setAgreementStartDate(formatDateForInput(customer.agreement_start_date));
                    setAgreementEndDate(formatDateForInput(customer.agreement_end_date));
                } else {
                    setCustomerName("");
                    setPhone("");
                    setEmail("");
                    setAddress("");
                    setCity("");
                    setStatus("");
                    setCountry("");
                    setCreditLimit(0);
                    setPaymentTerm("");
                    setAccountId(0);
                    setSalesPersonId(0);
                    setNtn("");
                    setRegNo("");
                    setAllowCommision("");
                    setAgreementStartDate("");
                    setAgreementEndDate("");
                }
            } catch (err) {
                console.error("Error loading dependencies for customer form", err);
            }
        };
        fetchData();
    }, [customer]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!customer_name || !account_id) {
            alert("Please fill all required fields (Customer Name, Phone, Account, Sales Person).");
            return;
        }
        onSave({
            customer_name,
            phone,
            email,
            address,
            city,
            status,
            country,
            credit_limit,
            payment_term,
            account_id,
            sales_person_id,
            ntn,
            reg_no,
            allow_commission,
            agreement_start_date,
            agreement_end_date
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-[900px] max-h-[90vh] overflow-auto">
                <h2 className="text-lg font-semibold mb-4">
                    {customer ? "Edit Customer" : "Add Customer"}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Customer Name + Sales Person */}
                    <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
                        <div className="flex flex-col w-full">
                            <label className="font-medium text-sm mb-1">Customer Name</label>
                            <Input
                                value={customer_name}
                                onChange={(e) => setCustomerName(e.target.value)}
                                placeholder="Customer Name"
                                required
                            />
                        </div>

                        <div className="flex flex-col w-full">
                            <label className="font-medium text-sm mb-1">Sales Person</label>
                            <Popover open={salespersonOpen} onOpenChange={setSalesPersonOpen}>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" role="combobox" className="w-full justify-between">
                                        {sales_person_id
                                            ? `${salespersons.find((sp) => sp.sales_person_id === sales_person_id)?.sales_person_name}`
                                            : "Select Sales Person"}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="max-h-[300px] overflow-auto">
                                    <Command>
                                        <CommandInput placeholder="Search sales persons..." className="text-black" />
                                        <CommandEmpty>No sales person found.</CommandEmpty>
                                        <CommandGroup>
                                            {salespersons.map((sp) => (
                                                <CommandItem
                                                    key={sp.sales_person_id}
                                                    className="hover:bg-gray-100"
                                                    onSelect={() => {
                                                        setSalesPersonId(sp.sales_person_id);
                                                        setSalesPersonOpen(false);
                                                    }}
                                                >
                                                    <Check
                                                        className={cn(
                                                            "mr-2 h-4 w-4",
                                                            sales_person_id === sp.sales_person_id ? "opacity-100" : "opacity-0"
                                                        )}
                                                    />
                                                    {sp.sales_person_name}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>

                    {/* Phone, Email, Address */}
                    <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
                        <div className="flex flex-col w-full">
                            <label className="font-medium text-sm mb-1">Phone</label>
                            <Input
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="Phone"
                                required
                            />
                        </div>

                        <div className="flex flex-col w-full">
                            <label className="font-medium text-sm mb-1">Email</label>
                            <Input
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Email"
                            />
                        </div>

                        <div className="flex flex-col w-full">
                            <label className="font-medium text-sm mb-1">Address</label>
                            <Input
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                placeholder="Address"
                            />
                        </div>
                    </div>

                    {/* City, Status */}
                    <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
                        <div className="flex flex-col w-full">
                            <label className="font-medium text-sm mb-1">City</label>
                            <Select value={city} onValueChange={setCity}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select City" />
                                </SelectTrigger>
                                <SelectContent>
                                    {cities.map((c) => (
                                        <SelectItem key={c.city_name} value={c.city_name}>
                                            {c.city_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex flex-col w-full">
                            <label className="font-medium text-sm mb-1">Status</label>
                            <Select value={status} onValueChange={setStatus} required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ACTIVE">Active</SelectItem>
                                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Payment Term, Credit Limit, Agreement Dates */}
                    <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
                        <div className="flex flex-col w-full">
                            <label className="font-medium text-sm mb-1">Payment Term</label>
                            <Select value={payment_term} onValueChange={setPaymentTerm} required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Payment Term" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Cash">Cash</SelectItem>
                                    <SelectItem value="Credit">Credit</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex flex-col w-full">
                            <label className="font-medium text-sm mb-1">Credit Limit</label>
                            <Input
                                type="number"
                                value={credit_limit === 0 ? "" : credit_limit}
                                onChange={(e) => setCreditLimit(Number(e.target.value) || 0)}
                                placeholder="Credit Limit"
                                disabled={payment_term !== "Credit"}
                                 className={
                                     payment_term !== "Credit"
                                      ? "bg-gray-100 cursor-not-allowed"
                                        : "" 
                                        }/>
                        </div>

                        <div className="flex flex-col w-full">
                            <label className="font-medium text-sm mb-1">Agreement Start Date</label>
                            <Input
                                type="date"
                                value={agreement_start_date}
                                onChange={(e) => setAgreementStartDate(e.target.value)}
                            />
                        </div>

                        <div className="flex flex-col w-full">
                            <label className="font-medium text-sm mb-1">Agreement End Date</label>
                            <Input
                                type="date"
                                value={agreement_end_date}
                                onChange={(e) => setAgreementEndDate(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Account */}
                    <div className="flex flex-col w-full">
                        <label className="font-medium text-sm mb-1">Account</label>
                        <Popover open={accountOpen} onOpenChange={setAccountOpen}>
                            <PopoverTrigger asChild>
                                <Button variant="outline" role="combobox" className="w-full justify-between">
                                    {account_id
                                        ? `${accounts.find((a) => a.account_id === account_id)?.account_name} (${accounts.find((a) => a.account_id === account_id)?.account_code})`
                                        : "Select Account"}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="max-h-[300px] overflow-auto">
                                <Command>
                                    <CommandInput placeholder="Search accounts..." className="text-black" />
                                    <CommandEmpty>No account found.</CommandEmpty>
                                    <CommandGroup>
                                        {accounts.map((a) => (
                                            <CommandItem
                                                key={a.account_id}
                                                className="hover:bg-gray-100"
                                                onSelect={() => {
                                                    setAccountId(a.account_id);
                                                    setAccountOpen(false);
                                                }}
                                            >
                                                <Check
                                                    className={cn(
                                                        "mr-2 h-4 w-4",
                                                        account_id === a.account_id ? "opacity-100" : "opacity-0"
                                                    )}
                                                />
                                                {`${a.account_code}-${a.account_name}`}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* NTN, Reg No, Allow Commission */}
                    <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
                        <div className="flex flex-col w-full">
                            <label className="font-medium text-sm mb-1">NTN</label>
                            <Input
                                value={ntn}
                                onChange={(e) => setNtn(e.target.value)}
                                placeholder="NTN"
                            />
                        </div>

                        <div className="flex flex-col w-full">
                            <label className="font-medium text-sm mb-1">Reg. No</label>
                            <Input
                                value={reg_no}
                                onChange={(e) => setRegNo(e.target.value)}
                                placeholder="Reg. No"
                            />
                        </div>

                        <div className="flex flex-col w-full invisible">
                            <label className="font-medium text-sm mb-1">Allow Commission</label>
                            <div className="flex items-center space-x-2 p-2 border rounded-md bg-gray-50/50">
                                <Checkbox
                                    id="allow_commission"
                                    checked={allow_commission === "true"}
                                    onCheckedChange={(checked) => setAllowCommision(checked ? "true" : "false")}
                                />
                                <label
                                    htmlFor="allow_commission"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    Allow Commission
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-2 mt-4">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="w-[30%] bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-2 rounded-lg block ml-auto"
                        >
                            Save
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};


export default Customers;