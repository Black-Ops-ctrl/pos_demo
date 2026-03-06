import React, { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Edit, Trash2, Building2, ChevronsUpDown, Check, ArrowUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import GenericForm from "@/components/forms/GenericForm";
import { getItemCategory, addItemCategory, updateItemCategory, deleteItemCategory } from "@/api/itemCategoryApi";
import { getAccounts } from "@/api/getAccountsApi";
import { getRegions } from "@/api/regionApi";
import { getSalesPersons, addSalePerson, updateSalePerson, deleteSalePerson } from "@/api/salesPersonApi";
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
import { getBranches } from "@/api/branchApi";
import { getCompanies } from "@/api/companyApi";
import { getDesignations } from "@/api/getDesignationApi";
import { set } from "react-hook-form";


interface SalesPerson {
  sales_person_id: number;
  sales_person_name: string;
  father_name: string;
  phone: string;
  account_id?: number;
  account_name?: string;
  branch_id?: number;
  branch_name?: string;
  company_id?: number;
  company_name?: string;
 
 
}

// Define types for API data to ensure type safety in the form
interface Branch {
    branch_id: number;
    branch_name: string;
    status: string;
    // Add other branch fields if necessary
}

interface Company {
    company_id: number;
    company_name: string;
    // Add other company fields if necessary
}
interface Accounts {
    account_id: number;
    account_name: string;
    // Add other company fields if necessary
}



const SalesPersons: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editSalePerson, setEditSalePerson] = useState<SalesPerson | null>(null);
  const [showScrollToTop, setShowScrollToTop] = useState(false); // ✅ New state for scroll button

  const [SalesPersons, setSalesPersons] = useState<SalesPerson[]>([]);
  const { toast } = useToast();
  // Load categories
  const loadSalesPersons = async () => {
    try {
      const res = await getSalesPersons();
      setSalesPersons(res.data || res);
    } catch (error) {
      console.error("Error loading salespersons", error);
    }
  };
  useEffect(() => {
    loadSalesPersons();
  }, []);
  const handleAddSalesPerson = () => {
    setEditSalePerson(null);
    setShowForm(true);
  };






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
  const handleEditSalesPerson = (saleperson: SalesPerson) => {
    setEditSalePerson(saleperson);
    setShowForm(true);
  };
  const handleSaveSalesPerson = async (data: Omit<SalesPerson, "sales_person_id">) => {
    try {
      if (editSalePerson) {
        await updateSalePerson(
          editSalePerson.sales_person_id,
          data.sales_person_name,
          data.father_name,
          data.phone,
          data.account_id,
          data.branch_id,
          data.company_id
        
        );
        toast({ title: "Updated", description: "Sales Person updated successfully!" });
      } else {
        await addSalePerson(
          data.sales_person_name,
          data.father_name,
          data.phone,
          data.account_id,
          data.branch_id,
          data.company_id
       
        );
        toast({ title: "Created", description: "Sales Person created successfully!" });
      }
      setShowForm(false);
      loadSalesPersons();
    } catch (error) {
      console.error("Error saving Sales Person", error);
      toast({ title: "Error", description: "Failed to save Sales Person", variant: "destructive" });
    }
  };
  const handleDeleteSalesPerson = async (sales_person_id: number) => {
    if (confirm("Are you sure you want to delete this Sales Person?")) {
      try {
        await deleteSalePerson(sales_person_id);
        loadSalesPersons();
        toast({ title: "Deleted", description: "Sales Person deleted successfully!" });
      } catch (error) {
        console.error("Error deleting Sales Person", error);
        toast({ title: "Error", description: "Failed to delete Sales Person", variant: "destructive" });
      }
    }
  };
  const filteredSalesPersons = SalesPersons.filter(
    (sp) =>
      sp.sales_person_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sp.father_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sp.phone || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sp.account_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sp.branch_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sp.company_name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );
  return (
    <>
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Sales Persons
            </CardTitle>
            <Button
              onClick={handleAddSalesPerson}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Sale Person
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search Sales Persons..."
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
                {/* <TableHead>Father Name</TableHead> */}
                <TableHead>Phone</TableHead>
                {/* <TableHead>Designation</TableHead> */}
                <TableHead>Branch</TableHead>
                {/* <TableHead>Company</TableHead> */}
                <TableHead className="invisible">Account</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
            {filteredSalesPersons.map((sp) => (
              <TableRow key={sp.sales_person_id}>
                <TableCell className="font-medium">{sp.sales_person_name}</TableCell>
                {/* <TableCell>{sp.father_name}</TableCell> - Commented out as per header */}
                <TableCell>{sp.phone}</TableCell>
                {/* <TableCell>{sp.designation_name}</TableCell> - Commented out as per header */}
                <TableCell>{sp.branch_name}</TableCell>
                {/* <TableCell>{sp.company_name}</TableCell> - Commented out as per header */}
                <TableCell className="invisible">{sp.account_name}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" onClick={() => handleEditSalesPerson(sp)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDeleteSalesPerson(sp.sales_person_id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredSalesPersons.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-sm text-gray-500">
                  No sales persons found.
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
          <SalesPersonForm salesPerson={editSalePerson} onClose={() => setShowForm(false)} onSave={handleSaveSalesPerson} />
        )}
    </>
  );
};
const SalesPersonForm: React.FC<{
  salesPerson: SalesPerson | null;
  onClose: () => void;
  onSave: (data: Omit<SalesPerson, "sales_person_id">) => void;
}> = ({ salesPerson, onClose, onSave }) => {
  const [sales_person_name, setSalesPersonName] = useState("");
  const [father_name, setFatherName] = useState("");
  const [phone, setPhone] = useState("");

  const [account_id, setAccountId] = useState<number>(0);
  const [accounts, setAccounts] = useState<Accounts[]>([]);
  const [accountOpen, setAccountOpen] = useState(false);

  const [branch_id, setBranchId] = useState<number>(0);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchOpen, setBranchOpen] = useState(false);

  const [company_id, setCompanyId] = useState<number>(0);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companyOpen, setCompanyOpen] = useState(false); // No longer needed, but kept for consistency in state structure

  // const [region_id, setRegionId] = useState<number>(0);
  // const [regions, setRegions] = useState<Region[]>([]);
  // const [regionOpen, setRegionOpen] = useState(false);


  // Fetch all necessary data and set default values
  useEffect(() => {
    const fetchData = async () => {
      try {
        const accountData: Accounts[] = await getAccounts();
        const branchData: Branch[] = await getBranches();
        const companyData: Company[] = await getCompanies();
        // const regionData: Region[] = await getRegions();

        // Filter only approved branches
        // const approvedBranches = branchData.filter((branch: Branch) => 
        //   branch.status === 'APPROVED'
        // );
          
        setAccounts(accountData);
       // setBranches(approvedBranches); // Set filtered branches
       setBranches(branchData)
        setCompanies(companyData);
        // setRegions(regionData);

        // **Logic to set default company_id**
        let defaultCompanyId = 0;
        if (companyData.length > 0) {
            // Assuming the first company in the list is the default company
            defaultCompanyId = companyData[0].company_id;
        }

        if (salesPerson) {
          // Editing existing person: use their values
          setSalesPersonName(salesPerson.sales_person_name || "");
          setFatherName(salesPerson.father_name || "");
          setPhone(salesPerson.phone || "");
          setAccountId(salesPerson.account_id || 0);
          setBranchId(salesPerson.branch_id || 0);
          // For edit, use the sales person's company_id if available, otherwise the default
          setCompanyId(salesPerson.company_id || defaultCompanyId);
          // setRegionId(salesPerson.region_id || 0);
        } else {
          // Adding new person: set fields to initial or default values
          setSalesPersonName("");
          setFatherName("");
          setPhone("");
          setAccountId(0);
          setBranchId(0);
          // Set to the first company's ID for new forms
          setCompanyId(defaultCompanyId);
          //setRegionId(0);
        }
      } catch (err) {
        console.error("Error loading categories", err);
      }
    };
    fetchData();
  }, [salesPerson]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sales_person_name ) {
      alert("Please fill all fields.");
      return;
    }
    onSave({
      sales_person_name,
      father_name,
      phone,
      account_id, // Include account_id in save data
      branch_id,
      company_id
      //region_id,
     
    });
  };
  
  
  const selectedCompanyName = companies.find((c) => c.company_id === company_id)?.company_name;


  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-[900px] max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">
          {salesPerson ? "Edit Sales Person" : "Add Sales Person"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex space-x-4">
            <div className="flex flex-col flex-1">
              <span className="text-sm font-medium text-gray-700">Sales Person Name</span>
              <Input

                value={sales_person_name}
                onChange={(e) => setSalesPersonName(e.target.value)}
                placeholder="Sales Person Name"
              />
            </div>
            {/* <div className="flex flex-col flex-1">
              <span className="text-sm font-medium text-gray-700">Father Name</span>
              <Input
                value={father_name}
                onChange={(e) => setFatherName(e.target.value)}
                placeholder="Father Name"
              />
            </div> */}
            <div className="flex flex-col flex-1">
              <span className="text-sm font-medium text-gray-700">Phone</span>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone"
              />
            </div>
          </div>
          <div className="flex space-x-4">
            <div className="flex flex-col flex-1">
              <span className="text-sm font-medium text-gray-700">Branch</span>
              <Popover open={branchOpen} onOpenChange={setBranchOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" className="w-full justify-between">
                    {branch_id
                      ? `${branches.find((br) => br.branch_id === branch_id)?.branch_name}`
                      : "Select Branch"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="max-h-[300px] overflow-auto">
                  <Command >
                    <CommandInput placeholder="Search Branch..." className="text-black" />
                    <CommandEmpty >No Branch found.</CommandEmpty>
                    <CommandGroup>
                      {branches.map((br) => (
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
            {/* <div className="flex flex-col flex-1 ">
              <span className="text-sm font-medium text-gray-700">Company</span>
              <Input
                  value={selectedCompanyName}
                  readOnly // Make it read-only since it's defaulted
                  className="bg-gray-100 cursor-not-allowed" // Add styling to indicate it's not editable
                  placeholder="Company Name"
              />
            </div> */}
            <div className="flex flex-col flex-1 invisible">
                <span className="text-sm font-medium text-gray-700">Account</span>
                <Popover open={accountOpen} onOpenChange={setAccountOpen}>
                    <PopoverTrigger asChild>
                        <Button variant="outline" role="combobox" className="w-full justify-between">
                            {account_id
                                ? `${accounts.find((d) => d.account_id === account_id)?.account_name}`
                                : "Select Account"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="max-h-[300px] overflow-auto">
                        <Command >
                            <CommandInput placeholder="Search Accounts..." className="text-black" />
                            <CommandEmpty >No Account found.</CommandEmpty>
                            <CommandGroup>
                                {accounts.map((d) => (
                                    <CommandItem
                                        key={d.account_id}
                                        className="hover:bg-gray-100"
                                        onSelect={() => {
                                            setAccountId(d.account_id);
                                            setAccountOpen(false);
                                        }}
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                account_id === d.account_id ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        {d.account_name}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </Command>
                    </PopoverContent>
                </Popover>
            </div>

            
            <div className="flex flex-col flex-1">
              {/* Region Popover */}
              {/* <span className="text-sm font-medium text-gray-700">Region</span>
              <Popover open={regionOpen} onOpenChange={setRegionOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" className="w-full justify-between">
                    {region_id
                      ? `${regions.find((r) => r.region_id === region_id)?.region_name}`
                      : "Select Region"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="max-h-[300px] overflow-auto">
                  <Command >
                    <CommandInput placeholder="Search region..." className="text-black" />
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
              </Popover> */}
              
            </div>
          </div>
          <div className="flex space-x-4">
            {/* Add an empty div or adjust flex to keep layout consistent if needed */}
            <div className="flex-1"></div>
            <div className="flex-1"></div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="flex-2 bg-gradient-to-r from-blue-500 to-blue-600 text-primary">
              Save
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SalesPersons;