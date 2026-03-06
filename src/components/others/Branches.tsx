/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Search, Edit, Trash2, Loader2, ChevronDown, ChevronUp, X } from "lucide-react";
import {
  getBranches,
  addBranch,
  updateBranch,
  deleteBranch,
  approveBranch,
  UnapproveBranch,
} from "@/api/branchApi";
import { getCity as fetchCitiesApi } from "@/api/cityApi";
import { getAccounts } from "@/api/accountsApi";
import axios from "axios";
import { toast } from "@/hooks/use-toast";



// --- Get Module ID ---
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

// --- Interfaces ---
interface Branch {
  branch_id: number;
  branch_name: string;
  farm_type: string;
  city: string;
  account_code: string;
  status?: string;
  no_of_partners?: number;
  discounts?: string;
  extra_discount?: number;
  remarks?: string;
  is_owned?: boolean;
  is_rent?: boolean;
  farm_description?: string;
}

interface City {
  city_id: number;
  city_name: string;
}

interface Account {
  account_id: number;
  account_code: string;
  account_name: string;
}

type StatusFilter = "ALL" | "CREATED" | "APPROVED";

// --- Branches Component ---
const Branches: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [showForm, setShowForm] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranchIds, setSelectedBranchIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);

  useEffect(() => {
    loadBranches();
  }, []);

  const loadBranches = async () => {
    try {
      setLoading(true);
      const data = await getBranches();
      setBranches(
        data.map((b: Branch) => ({
          ...b,
          status: b.status || "CREATED",
          account_code: b.account_code || "",
          no_of_partners: b.no_of_partners || 1,
          discounts: b.discounts || "N",
          extra_discount: b.extra_discount || 0,
          remarks: b.remarks || "",
          is_owned: b.is_owned || false,
          is_rent: b.is_rent || false,
          farm_description: b.farm_description || "",
        }))
      );
      setSelectedBranchIds([]);
    } catch (error) {
      console.error("Error loading branches", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBranch = () => {
    setEditingBranch(null);
    setShowForm(true);
  };

  const handleEditBranch = (branch: Branch) => {
    setEditingBranch(branch);
    setShowForm(true);
  };

  const handleSaveBranch = async (branchData: any) => {
    try {
      if (editingBranch) {
        await updateBranch(
          editingBranch.branch_id,
          branchData.branch_name,
          branchData.farm_type,
          branchData.city,
          branchData.account_id,
          branchData.no_of_partners,
          branchData.discounts,
          branchData.extra_discount,
          branchData.remarks,
          branchData.is_owned,
          branchData.is_rent,
          branchData.farm_description
        );
      } else {
        await addBranch(
          branchData.branch_name,
          branchData.farm_type,
          branchData.city,
          branchData.account_id,
          branchData.no_of_partners,
          branchData.discounts,
          branchData.extra_discount,
          branchData.remarks,
          branchData.is_owned,
          branchData.is_rent,
          branchData.farm_description
        );
      }
      setShowForm(false);
      loadBranches();
    } catch (error) {
      console.error("Error saving branch", error);
      alert(
        `Failed to save ${module_id === 3 ? 'branch' : 'farm'}: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  const handleDeleteBranch = async (branchId: number) => {
    if (confirm(`Are you sure you want to delete this branch?`)) {
      try {
        await deleteBranch(branchId);
        loadBranches();
      } catch (error) {
        console.error("Error deleting branch", error);
        alert(
          `Failed to delete branch ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    }
  };
const handleApproveBranch = async () => {
        if (selectedBranchIds.length === 0) return;

        try {
            await approveBranch(selectedBranchIds);
            toast({
                title: "Approved",
                description: `${selectedBranchIds.length} Branch(s) approved successfully.`,
                duration: 3000,
            });

            setSelectedBranchIds([]);
            loadBranches();
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to approve selected Branch.",
                variant: "destructive",
                duration: 3000,
            });
            console.error("Error approving Branch:", error);
        }
    };

    const handleUnapproveBranches = async () => {
        if (selectedBranchIds.length === 0) return;

        try {
            await UnapproveBranch(selectedBranchIds);
            toast({
                title: "Unapproved",
                description: `${selectedBranchIds.length} Branch(s) unapproved successfully.`,
                duration: 3000,
            });

            setSelectedBranchIds([]);
            loadBranches();
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to unapprove selected invoices.",
                variant: "destructive",
                duration: 3000,
            });
            console.error("Error unapproving invoices:", error);
        }
    };

  const handleCheckboxChange = (branchId: number, isChecked: boolean) => {
    setSelectedBranchIds((prevIds) =>
      isChecked ? [...prevIds, branchId] : prevIds.filter((id) => id !== branchId)
    );
  };

const filteredBranches = useMemo(() => {
  return branches.filter((branch) => {
    const statusMatch =
      statusFilter === "ALL" || branch.status === statusFilter;

    const searchMatch =
      (branch.branch_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ;

    return statusMatch && searchMatch;
  });
}, [branches, searchTerm, statusFilter]);

  const selectedUnapprovedCount = selectedBranchIds.filter(
    (id) => branches.find((b) => b.branch_id === id)?.status !== "APPROVED"
  ).length;

  const selectedApprovedCount = selectedBranchIds.filter(
    (id) => branches.find((b) => b.branch_id === id)?.status === "APPROVED"
  ).length;

  const isApproveButtonEnabled = selectedUnapprovedCount > 0 && !statusLoading;
  const isUnapproveButtonEnabled = selectedApprovedCount > 0 && !statusLoading;

  const filterButtonClasses = (status: StatusFilter) =>
    `px-3 py-1 rounded-full text-sm font-medium transition-colors ${
      statusFilter === status
        ? "bg-blue-600 text-white shadow-md"
        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
    }`;

  const selectClassName =
    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <>
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Branches</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                className="bg-red-500 hover:bg-red-600 text-white"
                onClick={handleUnapproveBranches}
                disabled={!isUnapproveButtonEnabled}
              >
                {statusLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : null}
                Unapprove Selected ({selectedApprovedCount})
              </Button>
              <Button
                className="bg-green-500 hover:bg-green-600 text-white"
                onClick={handleApproveBranch}
                disabled={!isApproveButtonEnabled}
              >
                {statusLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : null}
                Approve Selected ({selectedUnapprovedCount})
              </Button>
              <Button
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-primary"
                onClick={handleAddBranch}
                disabled={loading}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Branch
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-between mt-3">
            <div className="flex gap-2">
              <button
                className={filterButtonClasses("ALL")}
                onClick={() => setStatusFilter("ALL")}
              >
                All
              </button>
              <button
                className={filterButtonClasses("CREATED")}
                onClick={() => setStatusFilter("CREATED")}
              >
                Created
              </button>
              <button
                className={filterButtonClasses("APPROVED")}
                onClick={() => setStatusFilter("APPROVED")}
              >
                Approved
              </button>
            </div>
            <div className="relative w-1/3">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder={`Search branches...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <span className="ml-2">Loading branches...</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Select</TableHead>
                  <TableHead>Branch No</TableHead>
                  <TableHead>Branch Name</TableHead>
                  {/* {module_id !== 3 && <TableHead>Farm Type</TableHead>}
                  {module_id === 2 && (
                    <>
                      <TableHead>No. of Partners</TableHead>
                      <TableHead>Discounts</TableHead>
                      <TableHead>Extra Discount</TableHead>
                      <TableHead>Remarks</TableHead>
                    </>
                  )}
                  {module_id !== 3 && (
                    <>
                      <TableHead>Owned</TableHead>
                      <TableHead>Rent</TableHead>
                    </>
                  )} */}
                  {/* <TableHead>City</TableHead> */}
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBranches.map((branch) => (
                  <TableRow key={branch.branch_id}>
                    <TableCell className="text-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 accent-blue-600 cursor-pointer"
                        checked={selectedBranchIds.includes(branch.branch_id)}
                        onChange={(e) =>
                          handleCheckboxChange(branch.branch_id, e.target.checked)
                        }
                      />
                    </TableCell>
                    <TableCell className="font-medium">{branch.branch_id}</TableCell>
                    <TableCell className="font-medium">{branch.branch_name}</TableCell>
                    {/* {module_id !== 3 && <TableCell>{branch.farm_type}</TableCell>}
                    {module_id === 2 && (
                      <>
                        <TableCell>{branch.no_of_partners}</TableCell>
                        <TableCell>{branch.discounts}%</TableCell>
                        <TableCell>{branch.extra_discount}%</TableCell>
                        <TableCell>{branch.remarks}</TableCell>
                      </>
                    )} */}
                    {/* {module_id !== 3 && (
                      <>
                        <TableCell className="text-center">
                          <input
                            type="checkbox"
                            className="h-4 w-4 accent-green-600"
                            checked={branch.is_owned || false}
                            readOnly
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <input
                            type="checkbox"
                            className="h-4 w-4 accent-blue-600"
                            checked={branch.is_rent || false}
                            readOnly
                          />
                        </TableCell>
                      </>
                    )} */}
                    {/* <TableCell>{branch.city}</TableCell> */}
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          branch.status === "APPROVED"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {branch.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {branch.status !== "APPROVED" ? (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditBranch(branch)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteBranch(branch.branch_id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <span className="text-gray-500 text-sm">No actions</span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {showForm && (
        <BranchForm
          branch={editingBranch}
          onClose={() => setShowForm(false)}
          onSave={handleSaveBranch}
        />
      )}
    </>
  );
};

// --- Custom Searchable Dropdown Component ---
const SearchableDropdown: React.FC<{
  options: Account[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  loading?: boolean;
  disabled?: boolean;
}> = ({ options, value, onChange, placeholder = "Select...", loading = false, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const filteredOptions = options.filter(option =>
    `${option.account_code} - ${option.account_name}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const selectedOption = options.find(opt => opt.account_code === value);

  const handleSelect = (accountCode: string) => {
    onChange(accountCode);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleClear = () => {
    onChange("");
    setSearchTerm("");
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div
        className={`flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
          isOpen ? "ring-2 ring-blue-500 ring-offset-2" : ""
        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className={`flex-1 truncate text-left ${!selectedOption ? "text-gray-500" : ""}`}>
          {selectedOption 
            ? `${selectedOption.account_code} - ${selectedOption.account_name}`
            : placeholder
          }
        </span>
        <div className="flex items-center gap-1">
          {value && !disabled && (
            <X
              className="h-4 w-4 text-gray-400 hover:text-gray-600"
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
            />
          )}
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
          ) : (
            <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
          )}
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          {/* Search Input */}
          <div className="sticky top-0 bg-white p-2 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search account codes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 h-9 text-sm"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>

          {/* Options List */}
          <div className="py-1">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500 text-center">
                {loading ? "Loading accounts..." : "No accounts found"}
              </div>
            ) : (
              filteredOptions.map((option) => (
                <div
                  key={option.account_id}
                  className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 transition-colors ${
                    value === option.account_code ? "bg-blue-50 text-blue-600 font-medium" : ""
                  }`}
                  onClick={() => handleSelect(option.account_code)}
                >
                  <div className="font-mono text-xs text-gray-600">{option.account_code}</div>
                  <div className="truncate">{option.account_name}</div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// --- BranchForm Component ---
const BranchForm: React.FC<{
  branch: Branch | null;
  onClose: () => void;
  onSave: (data: any) => void;
}> = ({ branch, onClose, onSave }) => {
  const [branch_name, setBranchName] = useState(branch?.branch_name || "");
  const [farm_type, setfarm_type] = useState(branch?.farm_type || "Own");
  const [city, setCity] = useState(branch?.city || "");
  const [selectedAccountCode, setSelectedAccountCode] = useState(
    branch?.account_code || ""
  );
  const [no_of_partners, setNoOfPartners] = useState(branch?.no_of_partners || 1);
  const [discounts, setDiscounts] = useState(branch?.discounts || "N");
  const [extra_discount, setExtraDiscount] = useState(branch?.extra_discount || 0);
  const [remarks, setRemarks] = useState(branch?.remarks || "");
  const [is_owned, setIsOwned] = useState(branch?.is_owned || false);
  const [is_rent, setIsRent] = useState(branch?.is_rent || false);
  const [farm_description, setFarmDescription] = useState(branch?.farm_description || "Owned");
  const [cities, setCities] = useState<City[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loadingCities, setLoadingCities] = useState(true);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [saving, setSaving] = useState(false);

  const selectClassName =
    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

  // Effect to load Cities
  useEffect(() => {
    const loadCities = async () => {
      try {
        setLoadingCities(true);
        const cityData = await fetchCitiesApi();
        setCities(cityData || []);

        if (!branch && cityData.length > 0 && !city) {
          setCity(cityData[0].city_name);
        } else if (branch) {
          setCity(branch.city);
        }
      } catch (error) {
        console.error("Error loading cities for dropdown", error);
        setCities([]);
      } finally {
        setLoadingCities(false);
      }
    };
    loadCities();
  }, [branch]);

  // Effect to load Accounts
  useEffect(() => {
    const loadAccounts = async () => {
      try {
        setLoadingAccounts(true);
        const accountData = await getAccounts();
        setAccounts(accountData || []);

        if (branch) {
          setSelectedAccountCode(branch.account_code);
        } else if (accountData.length > 0) {
          setSelectedAccountCode(accountData[0].account_code);
        }
      } catch (error) {
        console.error("Error loading accounts for dropdown", error);
        setAccounts([]);
      } finally {
        setLoadingAccounts(false);
      }
    };
    loadAccounts();
  }, [branch]);

  const handleOwnedChange = (checked: boolean) => {
    setIsOwned(checked);
    // If Owned is checked, uncheck Rent and set farm_description to "Owned"
    if (checked) {
      setIsRent(false);
      setFarmDescription("Owned");
    }
  };

  const handleRentChange = (checked: boolean) => {
    setIsRent(checked);
    // If Rent is checked, uncheck Owned and set farm_description to "Rent"
    if (checked) {
      setIsOwned(false);
      setFarmDescription("Rent");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (saving) return;

    const selectedAccount = accounts.find(
      (acc) => acc.account_code === selectedAccountCode
    );

    // if (!selectedAccount) {
    //   alert("Please select a valid Account Code.");
    //   return;
    // }

    // Validate that at least one checkbox is selected for non-module_id 3
    // if (module_id !== 3 && !is_owned && !is_rent) {
    //   alert("Please select either Owned or Rent.");
    //   return;
    // }

    setSaving(true);
    try {
      // Prepare data according to your API payload structure
      const formData = {
        branch_name,
        farm_type: module_id !== 3 ? farm_type : "N/A",
        city,
        account_id: selectedAccount.account_id,
        no_of_partners: module_id === 2 ? no_of_partners : undefined,
        discounts: module_id === 2 ? discounts : undefined,
        extra_discount: module_id === 2 ? extra_discount : undefined,
        remarks: module_id === 2 ? remarks : undefined,
        is_owned: module_id !== 3 ? is_owned : undefined,
        is_rent: module_id !== 3 ? is_rent : undefined,
        farm_description: module_id !== 3 ? farm_description : undefined
      };

      await onSave(formData);
    } catch (error) {
      console.error("Error in form submission:", error);
      alert(`Failed to save branch. Please try again.`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg ">
        <h2 className="text-lg font-semibold mb-4">
          {branch ? `Edit Branch` : `Add Branch`}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">
                Branch Name
              </label>
              <Input
                placeholder= 'Branch Name'
                value={branch_name}
                onChange={(e) => setBranchName(e.target.value)}
                required
                disabled={saving}
              />
            </div>

            {/* <div>
              <label className="text-sm font-medium mb-1 block">
                Account Code
              </label>
              <SearchableDropdown
                options={accounts}
                value={selectedAccountCode}
                onChange={setSelectedAccountCode}
                placeholder="Select Account Code"
                loading={loadingAccounts}
                disabled={saving}
              />
            </div> */}

            {/* Only show farm_type dropdown for non-module_id 3 */}
            {/* {module_id !== 3 && (
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Farm Type
                </label>
                <select
                  value={farm_type}
                  onChange={(e) => setfarm_type(e.target.value)}
                  className={selectClassName}
                  required
                  disabled={saving}
                >
                  <option value="Own">Own</option>
                  <option value="Partnership">Partnership</option>
                </select>
              </div>
            )} */}

            {/* <div>
              <label className="text-sm font-medium mb-1 block">
                City
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className={selectClassName}
                required
                disabled={loadingCities || saving}
              >
                <option value="" disabled>
                  {loadingCities
                    ? "Loading Cities..."
                    : cities.length === 0
                    ? "No Cities Found"
                    : "Select City"}
                </option>
                {cities.map((c) => (
                  <option key={c.city_id} value={c.city_name}>
                    {c.city_name}
                  </option>
                ))}
              </select>
            </div> */}

            {/* Show Owned/Rent checkboxes only for non-module_id 3 */}
            {/* {module_id !== 3 && (
              <div className="flex items-center space-x-4 col-span-2">
                <label className="text-sm font-medium">Farm Description:</label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={is_owned}
                    onChange={(e) => handleOwnedChange(e.target.checked)}
                    className="h-4 w-4 accent-green-600"
                    disabled={saving}
                  />
                  <span className="text-sm font-medium">Owned</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={is_rent}
                    onChange={(e) => handleRentChange(e.target.checked)}
                    className="h-4 w-4 accent-blue-600"
                    disabled={saving}
                  />
                  <span className="text-sm font-medium">Rent</span>
                </label>
              </div>
            )} */}

            {/* Show additional fields only when module_id is 2 */}
            {/* {module_id === 2 && (
              <>
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    No. of Partners
                  </label>
                  <select
                    value={no_of_partners}
                    onChange={(e) => setNoOfPartners(Number(e.target.value))}
                    className={selectClassName}
                    required
                    disabled={saving}
                  >
                    {Array.from({ length: 100 }, (_, i) => i + 1).map((num) => (
                      <option key={num} value={num}>
                        {num}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Discounts
                  </label>
                  <select
                    value={discounts}
                    onChange={(e) => setDiscounts(e.target.value)}
                    className={selectClassName}
                    required
                    disabled={saving}
                  >
                    <option value="Y">Yes</option>
                    <option value="N">No</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Extra Discount (%)
                  </label>
                  <select
                    value={extra_discount}
                    onChange={(e) => setExtraDiscount(Number(e.target.value))}
                    className={selectClassName}
                    required
                    disabled={saving}
                  >
                    {Array.from({ length: 101 }, (_, i) => i).map((percent) => (
                      <option key={percent} value={percent}>
                        {percent}%
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Remarks
                  </label>
                  <Input
                    placeholder="Remarks"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    disabled={saving}
                  />
                </div>
              </>
            )} */}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-primary"
              disabled={loadingCities || loadingAccounts || saving}
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Branches;