import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Edit, Trash2, Building2, ChevronsUpDown, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select"
import { getAccounts } from "@/api/getAccountsApi";
import { getRegions } from "@/api/salesPersonApi";
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
import { getCustomers,addCustomer,updateCustomer,deleteCustomer,getSalesPersons } from "@/api/customerApi";
import { Checkbox } from "@/components/ui/checkbox"; // Assuming you have a Checkbox component


interface Customer {
    customer_id: number;
    customer_name: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    status: string;
    country: string;
    credit_limit: number;
    payment_term: string;
    sales_person_id?: number;
    sales_person_name?: string;
    account_id?: number;
    account_code?: string;
    region_id?: number;
    region_name?: string;
    // NEW FIELDS - allow_discount is a boolean in the component, mapping to a numeric field on the API
    ntn?: string; 
    reg_no?: string;
    allow_discount?: boolean; // Changed to optional for safety, but used as boolean
    discount?: number; // Field from the API that is 1 or 0, but allow_discount is the component state
    // END NEW FIELDS
    created_by: number;
    updated_by: number;
}

const Customers: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
    const [Customers, setCustomers] = useState<Customer[]>([]);
    const { toast } = useToast();
    
    // Load categories
    const loadCustomers = async () => {
        try {
            const res = await getCustomers();
            // Map the API's 'discount' (1/0) to local 'allow_discount' (true/false)
            const customersWithDiscount = (res.data || res).map((c: any) => ({
                ...c,
                allow_discount: c.discount === 1,
            }));
            setCustomers(customersWithDiscount);
        } catch (error) {
            console.error("Error loading customers", error);
        }
    };

    useEffect(() => {
        loadCustomers();
    }, []);
    
    const handleAddCustomer = () => {
        setEditCustomer(null);
        setShowForm(true);
    };

    const handleEditCustomer = (customer: Customer) => {
        setEditCustomer(customer);
        setShowForm(true);
    };

    const handleSaveCustomer = async (data: Omit<Customer, "customer_id" | "discount"> & { allow_discount: boolean }) => {
        
        // Convert local boolean 'allow_discount' to API's numeric 'discount' (1 or 0)
        const discountValue = data.allow_discount ? 1 : 0;

        try {
            if (editCustomer) {
                await updateCustomer(
                    editCustomer.customer_id,
                    data.customer_name,
                    data.phone,
                    data.email,
                    data.address,
                    data.city,
                    data.status,
                    data.country,
                    data.credit_limit,
                    data.payment_term,
                    data.sales_person_id as number, // Assumed to be required/present
                    data.account_id as number, // Assumed to be required/present
                    data.region_id as number, // Assumed to be required/present
                    // NEW FIELDS for update
                    data.ntn || "",
                    data.reg_no || "",
                    discountValue, // Passing 1 or 0
                    // END NEW FIELDS
                    data.created_by,
                    data.updated_by
                );
                toast({ title: "Updated", description: "Customer updated successfully!" });
            } else {
                await addCustomer(
                    data.customer_name,
                    data.phone,
                    data.email,
                    data.address,
                    data.city,
                    data.status,
                    data.country,
                    data.credit_limit,
                    data.payment_term,
                    data.sales_person_id as number, // Assumed to be required/present
                    data.account_id as number, // Assumed to be required/present
                    data.region_id as number, // Assumed to be required/present
                    // NEW FIELDS for add
                    data.ntn || "",
                    data.reg_no || "",
                    discountValue, // Passing 1 or 0
                    // END NEW FIELDS
                    data.created_by,
                    data.updated_by
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

    const filteredCustomers = Customers.filter(
        (c) =>
            c.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (c.phone || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Building2 className="h-5 w-5" />
                            Customers
                        </CardTitle>
                        <Button
                            onClick={handleAddCustomer}
                            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            New Customer
                        </Button>
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
                                <TableHead>Name</TableHead>
                                <TableHead>Sale person</TableHead>
                                <TableHead>Phone</TableHead>
                                <TableHead>Region</TableHead>
                                <TableHead>City</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Credit Limit</TableHead>
                                <TableHead>Payment Term</TableHead>
                                <TableHead>Country</TableHead>
                                {/* NEW TABLE HEADERS */}
                                <TableHead>NTN</TableHead>
                                <TableHead>Reg. No</TableHead>
                                {/* <TableHead>Discount</TableHead> */}
                                {/* END NEW TABLE HEADERS */}
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredCustomers.map((c) => (
                                <TableRow key={c.customer_id}>
                                    <TableCell className="font-medium">{c.customer_name}</TableCell>
                                    <TableCell>{c.sales_person_name || "N/A"}</TableCell>
                                    <TableCell>{c.phone}</TableCell>
                                    <TableCell>{c.region_name}</TableCell>
                                    <TableCell>{c.city}</TableCell>
                                    <TableCell>{c.status}</TableCell>
                                    <TableCell>{c.credit_limit}</TableCell>
                                    <TableCell>{c.payment_term}</TableCell>
                                    <TableCell>{c.country}</TableCell>
                                    {/* NEW TABLE CELLS */}
                                    <TableCell>{c.ntn || "N/A"}</TableCell>
                                    <TableCell>{c.reg_no || "N/A"}</TableCell>
                                    {/* <TableCell>{c.allow_discount ? "Yes" : "No"}</TableCell> */}
                                    {/* END NEW TABLE CELLS */}
                                    <TableCell>
                                        <div className="flex gap-1">
                                            <Button size="sm" variant="outline" onClick={() => handleEditCustomer(c)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="text-red-600 hover:text-red-700"
                                                onClick={() => handleDeleteCustomer(c.customer_id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filteredCustomers.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={13} className="text-center text-sm text-gray-500">
                                        No customers found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {
                showForm && (
                <CustomerForm customer={editCustomer} 
                onClose={() => setShowForm(false)} 
                onSave={handleSaveCustomer} />
                )}
        </>
    );
};

const CustomerForm: React.FC<{
    customer: Customer | null;
    onClose: () => void;
    onSave: (data: Omit<Customer, "customer_id" | "discount"> & { allow_discount: boolean }) => void; // Updated onSave signature
}> = ({ customer, onClose, onSave }) => {
    const [customer_name, setCustomerName] = useState("");
    
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [address, setAddress] = useState("");
    const [city, setCity] = useState("");
    const [status, setStatus] = useState("");
    const [country, setCountry] = useState("");
    const [credit_limit, setCreditLimit] = useState<number>(0);
    const [payment_term, setPaymentTerm] = useState("");

    const [account_id, setAccountId] = useState<number >(0);
    const [accounts, setAccounts] = useState<any[]>([]); 
    const [accountOpen, setAccountOpen] = useState(false);

    const [sales_person_id, setSalesPersonId] = useState<number >(0);
    const [salespersons, setSalesPersons] = useState<any[]>([]); 
    const [salespersonOpen, setSalesPersonOpen] = useState(false);

    const [region_id, setRegionId] = useState<number >(0);
    const [regions, setRegions] = useState<any[]>([]); 
    const [regionOpen, setRegionOpen] = useState(false);

    // NEW STATES
    const [ntn, setNtn] = useState("");
    const [reg_no, setRegNo] = useState("");
    // Using a boolean state for the checkbox
    const [allow_discount, setAllowDiscount] = useState(false); 
    // END NEW STATES


    // Fetch data for dropdowns
    useEffect(() => {
        const fetchData = async () => {
            try {
                
                const accountsData = await getAccounts(); 
                setAccounts(accountsData);
                setRegions(await getRegions());
                setSalesPersons(await getSalesPersons());
                
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
                    setRegionId(customer.region_id || 0);
                    // SET NEW FIELDS ON EDIT
                    setNtn(customer.ntn || "");
                    setRegNo(customer.reg_no || "");
                    // Map the component interface's boolean 'allow_discount'
                    setAllowDiscount(customer.allow_discount || false); 
                    // END SET NEW FIELDS
                } else {
                    // Reset for new customer form
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
                    setRegionId(0);
                    setNtn("");
                    setRegNo("");
                    setAllowDiscount(false);
                }
            } catch (err) {
                console.error("Error loading dependencies for customer form", err);
            }
        };
        fetchData();
    }, [customer]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!customer_name || !phone || !account_id || !sales_person_id || !region_id) {
            alert("Please fill all required fields (Customer Name, Phone, Account, Sales Person, Region).");
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
            region_id,
            // PASS NEW FIELDS
            ntn,
            reg_no,
            allow_discount, // Pass the boolean state
            // END PASS NEW FIELDS
            created_by: 0,
            updated_by: 0
        });
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-[700px] max-h-[90vh] overflow-auto">
                <h2 className="text-lg font-semibold mb-4">
                    {customer ? "Edit Customer" : "Add Customer"}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex flex-col md:flex-row md:space-x-4 space-y-2 md:space-y-0">
                        <Input
                            value={customer_name}
                            onChange={(e) => setCustomerName(e.target.value)}
                            placeholder="Customer Name"
                            required 
                        />
                            {/* Sales Person Popover */}
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
                                <Command >
                                    <CommandInput placeholder="Search sales persons..." className="text-black" />
                                    <CommandEmpty >No sales person found.</CommandEmpty>
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

                        <div className="flex flex-col md:flex-row md:space-x-4 space-y-2 md:space-y-0">
                        <Input
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="Phone"
                            required 
                                />
                        <Input
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email"
                        />
                        <Input
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="Address"
                        />
                        
                        </div>
                        <div className="flex flex-col md:flex-row md:space-x-4 space-y-2 md:space-y-0">
                                {/* City */}
                        <Input
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            placeholder="City"
                        />
                        {/*Status*/}
                        <Select value={status} onValueChange={setStatus} required> 
                                <SelectTrigger>
                                        <SelectValue placeholder="Select Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                    <SelectItem value="ACTIVE">Active</SelectItem>
                                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                                        </SelectContent>
                        </Select>
                        {/* Country */}
                        <Input
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            placeholder="Country"
                        />
                        </div>
                        <div className="flex flex-col md:flex-row md:space-x-4 space-y-2 md:space-y-0">
                                {/* Credit Limit */}
                        <Input
                            type="number" 
                            value={credit_limit}
                            onChange={(e) => setCreditLimit(Number(e.target.value))}
                            placeholder="Credit Limit"
                        />
                        {/*payment_term*/}
                        <Select value={payment_term} onValueChange={setPaymentTerm} required> 
                                <SelectTrigger>
                                        <SelectValue placeholder="Select Payment Term" />
                                </SelectTrigger>
                                <SelectContent>
                                        <SelectItem value="Advance">Advance</SelectItem>
                                        <SelectItem value="Cash">Cash</SelectItem>
                                        <SelectItem value="Credit">Credit</SelectItem>
                                </SelectContent>
                        </Select>

                            {/* Region Popover */}
                        <Popover open={regionOpen} onOpenChange={setRegionOpen}>
                            <PopoverTrigger asChild>
                                <Button variant="outline" role="combobox" className="w-full justify-between">
                                    {region_id
                                        ? `${regions.find((r: any) => r.region_id === region_id)?.region_name}`
                                        : "Select Region"}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="max-h-[300px] overflow-auto">
                                <Command >
                                    <CommandInput placeholder="Search regions..." className="text-black" />
                                    <CommandEmpty >No region found.</CommandEmpty>
                                    <CommandGroup>
                                        {regions.map((r) => (
                                            <CommandItem
                                                key={r.region_id}
                                                className="hover:bg-gray-100"
                                                onSelect={() => {
                                                    setRegionId(r.region_id);
                                                    setRegionOpen(false);
                                                }}
                                            >
                                                <Check
                                                    className={cn(
                                                            "mr-2 h-4 w-4",
                                                            region_id === r.region_id ? "opacity-100" : "opacity-0"
                                                        )}
                                                />
                                                {r.region_name}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </Command>
                            </PopoverContent>
                        </Popover>
                        </div>
                    
                        {/* Account Popover */}
                            <Popover open={accountOpen} onOpenChange={setAccountOpen}>
                            <PopoverTrigger asChild>
                                <Button variant="outline" role="combobox" className="w-full justify-between">
                                    {account_id
                                        ? `${accounts.find((a: any) => a.account_id === account_id)?.account_name} (${accounts.find((a: any) => a.account_id === account_id)?.account_code})`
                                        : "Select Account"}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="max-h-[300px] overflow-auto">
                                <Command >
                                    <CommandInput placeholder="Search accounts..." className="text-black" />
                                    <CommandEmpty >No account found.</CommandEmpty>
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
                        
                        {/* NEW FIELDS ROW */}
                        <div className="flex flex-col md:flex-row md:space-x-4 space-y-2 md:space-y-0">
                            <Input
                                value={ntn}
                                onChange={(e) => setNtn(e.target.value)}
                                placeholder="NTN"
                            />
                            <Input
                                value={reg_no}
                                onChange={(e) => setRegNo(e.target.value)}
                                placeholder="Reg. No"
                            />
                            <div className="flex items-center space-x-2 p-2 border rounded-md w-full bg-gray-50/50">
                                    <Checkbox
                                        id="allow_discount"
                                        checked={allow_discount}
                                        onCheckedChange={(checked) => setAllowDiscount(!!checked)} 
                                    />
                                    <label
                                        htmlFor="allow_discount"
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        Allow Discount
                                    </label>
                            </div>
                        </div>
                        {/* END NEW FIELDS ROW */}
                    
                    
                        <div className="flex gap-2">
                            <Button type="button" variant="outline" onClick={onClose}>
                                Cancel
                            </Button>
                            <Button type="submit" className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600">
                                Save
                            </Button>
                        </div>
                </form>
            </div>
        </div>
    );
};

export default Customers;