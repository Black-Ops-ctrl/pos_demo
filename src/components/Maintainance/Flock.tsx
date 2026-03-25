import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";

import { addFlock, deleteFlock, getFlock, updateFlock } from "@/api/flockApi";
import { Plus, Search, Edit, Trash2, ChevronsUpDown, Check, Zap, X, Ban, Users, Filter, Loader2 } from "lucide-react";

import { getRegions } from "@/api/regionApi";
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
import { getCity } from "@/api/cityApi";
import { getAccounts } from "@/api/accountsApi";

const FLOCK_STATUS_API_URL = "http://84.16.235.111:2149/api/flock-status";

interface Partner {
  partner_account_id: number;
  partner_name: string;
  partnership_percentage: number;
}

interface Flock {
  flock_id: number;
  flock_name: string;
  branch_id?: number;
  branch_name?: string;
  company_id?: number;
  company_name?: string;
  city_id: number;
  city_name: string;
  region_id: number;
  region_name: string;
  partners: number;
  status: string;
  flock_details?: Partner[];
}

interface Account {
  account_id: number;
  account_name: string;
  account_code: string;
  account_type: string;
  parent_account_id: number;
}

// Status filter type
type StatusFilter = "ALL" | "CREATED" | "APPROVED" | "CLOSED";

const Flock: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingFlock, setEditingFlock] = useState<Flock | null>(null);
  const [flocks, setFlocks] = useState<Flock[]>([]);
  const [selectedFlockIds, setSelectedFlockIds] = useState<number[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [loading, setLoading] = useState(false); // New loading state for main component

  // Load flocks on mount
  useEffect(() => {
    loadFlocks();
  }, []);

  const loadFlocks = async () => {
    try {
      setLoading(true);
      const data = await getFlock();
      setFlocks(data);
    } catch (error) {
      console.error("Error loading Flocks", error);
    } finally {
      setLoading(false);
    }
  };

  // Status update functions with loading states
  const handleApproveFlockStatus = async () => {
    const flocksToApprove = selectedFlockIds.filter(id => {
      const flock = flocks.find(f => f.flock_id === id);
      return flock && flock.status !== 'APPROVED' && flock.status !== 'CLOSED';
    });

    if (flocksToApprove.length === 0) {
      alert("Please select at least one Flock that is not already approved or closed.");
      return;
    }

    if (!confirm(`Are you sure you want to APPROVE ${flocksToApprove.length} selected Flock(s)?`)) {
      return;
    }

    try {
      setLoading(true);
      for (const flock_id of flocksToApprove) {
        const payload = {
          operation: 1,
          flock_id: flock_id,
        };

        const response = await fetch(FLOCK_STATUS_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(`Failed to update status for Flock ID: ${flock_id}`);
        }
      }

      alert("Selected Flock(s) approved successfully!");
      setSelectedFlockIds(prev => prev.filter(id => !flocksToApprove.includes(id)));
      loadFlocks();

    } catch (error) {
      console.error("Error updating Flock status to APPROVE", error);
      alert("An error occurred while approving flocks. See console for details.");
    } finally {
      setLoading(false);
    }
  };

  const handleUnapproveFlockStatus = async () => {
    const flocksToUnapprove = selectedFlockIds.filter(id => {
      const flock = flocks.find(f => f.flock_id === id);
      return flock && (flock.status === 'APPROVED' || flock.status === 'CLOSED');
    });

    if (flocksToUnapprove.length === 0) {
      alert("Please select at least one Flock that is currently approved or closed to unapprove it.");
      return;
    }

    if (!confirm(`Are you sure you want to UNAPPROVE ${flocksToUnapprove.length} selected Flock(s)?`)) {
      return;
    }

    try {
      setLoading(true);
      for (const flock_id of flocksToUnapprove) {
        const payload = {
          operation: 2,
          flock_id: flock_id,
        };

        const response = await fetch(FLOCK_STATUS_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(`Failed to update status for Flock ID: ${flock_id}`);
        }
      }

      alert("Selected Flock(s) unapproved successfully!");
      setSelectedFlockIds(prev => prev.filter(id => !flocksToUnapprove.includes(id)));
      loadFlocks();

    } catch (error) {
      console.error("Error updating Flock status to UNAPPROVE", error);
      alert("An error occurred while unapproving flocks. See console for details.");
    } finally {
      setLoading(false);
    }
  };

  const handleClosedFlockStatus = async () => {
    const flocksToClose = selectedFlockIds.filter(id => {
      const flock = flocks.find(f => f.flock_id === id);
      return flock && flock.status === 'APPROVED';
    });

    if (flocksToClose.length === 0) {
      alert("Please select at least one Flock that is currently approved to close it.");
      return;
    }

    if (!confirm(`Are you sure you want to CLOSE ${flocksToClose.length} selected Flock(s)? This action is usually irreversible.`)) {
      return;
    }

    try {
      setLoading(true);
      for (const flock_id of flocksToClose) {
        const payload = {
          operation: 3,
          flock_id: flock_id,
        };

        const response = await fetch(FLOCK_STATUS_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(`Failed to update status for Flock ID: ${flock_id}`);
        }
      }

      alert("Selected Flock(s) closed successfully!");
      setSelectedFlockIds(prev => prev.filter(id => !flocksToClose.includes(id)));
      loadFlocks();

    } catch (error) {
      console.error("Error updating Flock status to CLOSED", error);
      alert("An error occurred while closing flocks. See console for details.");
    } finally {
      setLoading(false);
    }
  };

  // Checkbox Logic
  const handleCheckboxChange = (flock_id: number, isChecked: boolean) => {
    setSelectedFlockIds((prev) =>
      isChecked
        ? [...prev, flock_id]  
        : prev.filter((id) => id !== flock_id)
    );
  };

  // Button State Logic
  const isAnyFlockSelected = selectedFlockIds.length > 0;
  
  const isAnySelectedUnapproved = isAnyFlockSelected && selectedFlockIds.some(id => {
    const flock = flocks.find(f => f.flock_id === id);
    return flock && flock.status === 'CREATED';
  });
  
  const isAnySelectedApproved = isAnyFlockSelected && selectedFlockIds.some(id => {
    const flock = flocks.find(f => f.flock_id === id);
    return flock && flock.status === 'APPROVED';
  });
  
  const isAnySelectedClosed = isAnyFlockSelected && selectedFlockIds.some(id => {
    const flock = flocks.find(f => f.flock_id === id);
    return flock && flock.status === 'CLOSED';
  });

  const handleAddFlock = () => {
    setEditingFlock(null);
    setShowForm(true);
  };

  const handleEditFlock = (flock: Flock) => {
    setEditingFlock(flock);
    setShowForm(true);
  };

  const handleDeleteFlock = async (flock_id: number) => {
    if (confirm("Are you sure you want to delete this Flock?")) {
      try {
        setLoading(true);
        await deleteFlock(flock_id);
        loadFlocks();
      } catch (error) {
        console.error("Error deleting Flock", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSaveFlock = async (flockData: Omit<Flock, "flock_id" | "status"> & { flock_details?: Partner[] }) => {
    try {
      const branchId = Number(flockData.branch_id);
      const companyId = Number(flockData.company_id);

      if (isNaN(branchId) || isNaN(companyId)) {
        console.error("Invalid Branch ID or Company ID");
        alert("Invalid selection for Branch or Company.");
        return;
      }

      if (editingFlock) {
        await updateFlock(
          editingFlock.flock_id,
          flockData.flock_name,
          Number(flockData.partners),
          branchId,
          companyId,
          flockData.city_id,
          flockData.region_id,
          flockData.flock_details || []
        );
      } else {
        await addFlock(
          flockData.flock_name,
          Number(flockData.partners),
          branchId,
          companyId,
          flockData.city_id,
          flockData.region_id,
          flockData.flock_details || []
        );
      }

      setShowForm(false);
      loadFlocks();
    } catch (error) {
      console.error("Error saving Flock", error);
    }
  };

  // Filter flocks based on search term and status filter
  const filteredFlocks = flocks.filter((flock) => {
    const matchesSearch = flock.flock_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || flock.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Flocks</CardTitle>
            <div className="flex gap-2">
              {/* Approve Selected Button */}
              {isAnySelectedUnapproved && (
                <Button
                  className="bg-green-500 hover:bg-green-600"
                  onClick={handleApproveFlockStatus}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Zap className="h-4 w-4 mr-2" />
                  )}
                  {loading ? "Approving..." : `Approve Selected (${selectedFlockIds.length})`}
                </Button>
              )}

              {/* Unapprove Selected Button */}
              {(isAnySelectedApproved || isAnySelectedClosed) && (
                <Button
                  className="bg-orange-500 hover:bg-orange-600"
                  onClick={handleUnapproveFlockStatus}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <X className="h-4 w-4 mr-2" />
                  )}
                  {loading ? "Unapproving..." : `Unapprove Selected (${selectedFlockIds.length})`}
                </Button>
              )}

              {/* Closed Button */}
              {isAnySelectedApproved && (
                <Button
                  className="bg-red-500 hover:bg-red-600"
                  onClick={handleClosedFlockStatus}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Ban className="h-4 w-4 mr-2" />
                  )}
                  {loading ? "Closing..." : `Closed (${selectedFlockIds.length})`}
                </Button>
              )}

              {/* Add Flock Button */}
              <Button 
                className="bg-gradient-to-r from-blue-500 to-blue-600" 
                onClick={handleAddFlock}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                {loading ? "Loading..." : "Add Flock"}
              </Button>
            </div>
          </div>
          
          {/* Search and Filter Section */}
          <div className="flex gap-4 mt-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search flocks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                disabled={loading}
              />
            </div>
            
            {/* Status Filter Dropdown */}
            <div className="w-48">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-between" disabled={loading}>
                    <Filter className="h-4 w-4 mr-2" />
                    {statusFilter === "ALL" ? "All Status" : statusFilter}
                    <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-0">
                  <Command>
                    <CommandInput placeholder="Search status..." />
                    <CommandEmpty>No status found.</CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        onSelect={() => setStatusFilter("ALL")}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            statusFilter === "ALL" ? "opacity-100" : "opacity-0"
                          )}
                        />
                        All Status
                      </CommandItem>
                      <CommandItem
                        onSelect={() => setStatusFilter("CREATED")}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            statusFilter === "CREATED" ? "opacity-100" : "opacity-0"
                          )}
                        />
                        CREATED
                      </CommandItem>
                      <CommandItem
                        onSelect={() => setStatusFilter("APPROVED")}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            statusFilter === "APPROVED" ? "opacity-100" : "opacity-0"
                          )}
                        />
                        APPROVED
                      </CommandItem>
                      <CommandItem
                        onSelect={() => setStatusFilter("CLOSED")}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            statusFilter === "CLOSED" ? "opacity-100" : "opacity-0"
                          )}
                        />
                        CLOSED
                      </CommandItem>
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                <span className="ml-2">Loading flocks...</span>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px]">Select</TableHead>
                    <TableHead>Flock Name</TableHead>
                    <TableHead>Farm</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Region</TableHead>
                    <TableHead>Partners</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFlocks.map((flock) => (
                    <TableRow key={flock.flock_id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedFlockIds.includes(flock.flock_id)}
                          onCheckedChange={(checked) => handleCheckboxChange(flock.flock_id, !!checked)}
                          disabled={loading}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{flock.flock_name}</TableCell>
                      <TableCell>{flock.branch_name || "-"}</TableCell>
                      <TableCell>{flock.city_name || "-"}</TableCell>
                      <TableCell>{flock.region_name || "-"}</TableCell>
                      <TableCell>{flock.partners}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          flock.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                          flock.status === 'CLOSED' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {flock.status || "CREATED"}
                        </span>
                      </TableCell>
                          
                      <TableCell>
                        <div className="flex gap-2">
                          {flock.status === 'CREATED' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditFlock(flock)}
                                disabled={loading}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteFlock(flock.flock_id)}
                                disabled={loading}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>
      
      {showForm && (
        <FlockForm
          flock={editingFlock}
          onClose={() => setShowForm(false)}
          onSave={handleSaveFlock}
        />
      )}
    </>
  );
};

// =======================================================================================================================
// FLOCK FORM COMPONENT (Updated with improved partners search and alignment)
// =======================================================================================================================

const FlockForm: React.FC<{
  flock: Flock | null;
  onClose: () => void;
  onSave: (data: Omit<Flock, "flock_id" | "status"> & { flock_details?: Partner[] }) => void;
}> = ({ flock, onClose, onSave }) => {
  const [flock_name, setFlockName] = useState("");
  const [partners, setPartners] = useState<number | undefined>(undefined);

  const [company_id, setCompanyId] = useState<number>(0);
  const [branch_id, setBranchId] = useState<number>(0);
  const [region_id, setRegionId] = useState<number>(0);
  const [city_id, setCityId] = useState<number>(0);

  // Partners state
  const [flockDetails, setFlockDetails] = useState<Partner[]>([]);
  const [showPartners, setShowPartners] = useState(false);

  // Accounts state
  const [accounts, setAccounts] = useState<Account[]>([]);

  const [branches, setBranches] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [regions, setRegions] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);

  const [branchOpen, setBranchOpen] = useState(false);
  const [regionOpen, setRegionOpen] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);

  // Partner account dropdown states
  const [partnerAccountOpen, setPartnerAccountOpen] = useState<boolean[]>([]);

  // Loading state for form submission
  const [saving, setSaving] = useState(false);

  // Fetch dropdown data including accounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [branchesData, companiesData, regionsData, citiesData, accountsData] =
          await Promise.all([
            getBranches(),
            getCompanies(),
            getRegions(),
            getCity(),
            getAccounts(), // Fetch accounts
          ]);

        const approvedBranches = branchesData.filter((branch: any) => 
          branch.status === 'APPROVED'
        );

        setBranches(approvedBranches);
        setCompanies(companiesData);
        setRegions(regionsData);
        setCities(citiesData);
        setAccounts(accountsData || []); // Set accounts data

        let initialCompanyId = 0;

        if (companiesData.length === 1 && !flock) {
          initialCompanyId = companiesData[0].company_id;
        }

        if (flock) {
          setFlockName(flock.flock_name || "");
          setPartners(Number(flock.partners));
          setCompanyId(flock.company_id || 0);
          setBranchId(flock.branch_id || 0);
          setRegionId(flock.region_id || 0);
          setCityId(flock.city_id || 0);
          // Load existing partners if any
          if (flock.flock_details && flock.flock_details.length > 0) {
            setFlockDetails(flock.flock_details);
            setShowPartners(true);
            // Initialize partner account dropdown states
            setPartnerAccountOpen(new Array(flock.flock_details.length).fill(false));
          }
        } else {
          setFlockName("");
          setPartners(undefined);
          setCompanyId(initialCompanyId);
          setBranchId(0);
          setRegionId(0);
          setCityId(0);
          setFlockDetails([]);
          setShowPartners(false);
          setPartnerAccountOpen([]);
        }
      } catch (err) {
        console.error("Error loading dropdown data", err);
      }
    };
    fetchData();
  }, [flock]);

  // Update partner account dropdown states when partners change
  useEffect(() => {
    setPartnerAccountOpen(new Array(flockDetails.length).fill(false));
  }, [flockDetails.length]);

  // Add new partner fields
  const handleAddPartner = () => {
    setFlockDetails([...flockDetails, {
      partner_account_id: 0,
      partner_name: "",
      partnership_percentage: 0
    }]);
  };

  // Update partner field
  const handlePartnerChange = (index: number, field: keyof Partner, value: string | number) => {
    const updatedPartners = [...flockDetails];
    updatedPartners[index] = {
      ...updatedPartners[index],
      [field]: value
    };
    
    // If partner_account_id is changed and we have accounts data, auto-fill partner_name
    if (field === 'partner_account_id' && value !== 0) {
      const selectedAccount = accounts.find(acc => acc.account_id === value);
      if (selectedAccount) {
        updatedPartners[index].partner_name = selectedAccount.account_name;
      }
    }
    
    setFlockDetails(updatedPartners);
  };

  // Remove partner
  const handleRemovePartner = (index: number) => {
    const updatedPartners = flockDetails.filter((_, i) => i !== index);
    setFlockDetails(updatedPartners);
    
    // Update dropdown states
    const updatedOpenStates = [...partnerAccountOpen];
    updatedOpenStates.splice(index, 1);
    setPartnerAccountOpen(updatedOpenStates);
  };

  // Toggle partner account dropdown
  const togglePartnerAccountDropdown = (index: number) => {
    const updatedOpenStates = [...partnerAccountOpen];
    updatedOpenStates[index] = !updatedOpenStates[index];
    setPartnerAccountOpen(updatedOpenStates);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!flock_name || !branch_id || !company_id || !region_id || !city_id || partners === undefined) {
      alert("Please fill all required fields.");
      return;
    }

    if (company_id === 0 || branch_id === 0 || region_id === 0 || city_id === 0) {
      alert("Please select valid options for Company, Branch, Region, and City.");
      return;
    }

    // Validate partners if shown
    if (showPartners && flockDetails.length > 0) {
      // Validate individual partners
      for (const partner of flockDetails) {
        if (!partner.partner_name || partner.partnership_percentage <= 0 || partner.partner_account_id === 0) {
          alert("Please fill all partner fields with valid values and select an account.");
          return;
        }
      }
    }

    try {
      setSaving(true);
      await onSave({
        flock_name,
        partners: partners,
        company_id,
        company_name: companies.find((c: any) => c.company_id === company_id)?.company_name || "",
        branch_id,
        branch_name: branches.find((br: any) => br.branch_id === branch_id)?.branch_name || "",
        region_id,
        region_name: regions.find((r: any) => r.region_id === region_id)?.region_name || "",
        city_id,
        city_name: cities.find((c: any) => c.city_id === city_id)?.city_name || "",
        flock_details: showPartners && flockDetails.length > 0 ? flockDetails : undefined
      });
    } catch (error) {
      console.error("Error in form submission:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-[900px] max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">
          {flock ? "Edit Flock" : "Add Flock"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Company and Branch in one line */}
          <div className="flex gap-4 mb-4">
            {/* Company Dropdown */}
            <div className="flex-1">
              <span className="text-sm font-medium text-gray-700">Company</span>
              <select
                value={company_id}
                onChange={(e) => setCompanyId(Number(e.target.value))}
                className="w-full border p-2 rounded mt-1"
                disabled={companies.length === 1 && company_id !== 0 || saving}
              >
                {(companies.length > 1 || company_id === 0) && (
                  <option value={0}>Select Company</option>
                )}
                {companies.map((c: any) => (
                  <option key={c.company_id} value={c.company_id}>
                    {c.company_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Branch Dropdown */}
            <div className="flex-1">
              <span className="text-sm font-medium text-gray-700">Farm</span>
              <Popover open={branchOpen} onOpenChange={setBranchOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" className="w-full justify-between" disabled={saving}>
                    {branch_id
                      ? branches.find((br: any) => br.branch_id === branch_id)?.branch_name
                      : "Select Farm"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="max-h-[300px] overflow-auto w-full">
                  <Command>
                    <CommandInput placeholder="Search branches..." className="text-black" />
                    <CommandEmpty>No Farm found.</CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        onSelect={() => {
                          setBranchId(0);
                          setBranchOpen(false);
                        }}
                      >
                        <Check className={cn("mr-2 h-4 w-4", branch_id === 0 ? "opacity-100" : "opacity-0")} />
                        Select Farm
                      </CommandItem>
                      {branches.map((br: any) => (
                        <CommandItem
                          key={br.branch_id}
                          onSelect={() => {
                            setBranchId(br.branch_id);
                            setBranchOpen(false);
                          }}
                        >
                          <Check
                            className={cn("mr-2 h-4 w-4", branch_id === br.branch_id ? "opacity-100" : "opacity-0")}
                          />
                          {br.branch_name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Flock Name and Partners in one line */}
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <span className="text-sm font-medium text-gray-700">Flock Name</span>
              <Input
                value={flock_name}
                onChange={(e) => setFlockName(e.target.value)}
                placeholder="Flock Name"
                className="mt-1"
                required
                disabled={saving}
              />
            </div>

            <div className="flex-1">
              <span className="text-sm font-medium text-gray-700">Number of Partners</span>
              <Input
                type="number"
                value={partners === undefined ? "" : partners}
                onChange={(e) => setPartners(Number(e.target.value))}
                placeholder="Number of Partners"
                className="mt-1"
                min="0"
                required
                disabled={saving}
              />
            </div>
          </div>

          {/* Add Partners Button */}
          <div className="mb-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowPartners(!showPartners)}
              className="flex items-center gap-2"
              disabled={saving}
            >
              <Users className="h-4 w-4" />
              {showPartners ? "Hide Partners" : "Add Partners"}
            </Button>
            {showPartners && (
              <p className="text-sm text-gray-600 mt-2">
                Add partner details below. Partnership percentage can be any value.
              </p>
            )}
          </div>

          {/* Partners Section */}
          {showPartners && (
            <div className="mb-4 p-4 border rounded-lg bg-gray-50">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-md font-medium">Partners</h3>
                <Button type="button" onClick={handleAddPartner} size="sm" disabled={saving}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Partner
                </Button>
              </div>

              {flockDetails.map((partner, index) => (
                <div key={index} className="grid grid-cols-12 gap-3 mb-3 p-3 border rounded bg-white items-end">
                  {/* Partner Account Dropdown */}
                  <div className="col-span-5">
                    <span className="text-sm font-medium text-gray-700">Partner Account</span>
                    <Popover 
                      open={partnerAccountOpen[index]} 
                      onOpenChange={(open) => {
                        const updatedOpenStates = [...partnerAccountOpen];
                        updatedOpenStates[index] = open;
                        setPartnerAccountOpen(updatedOpenStates);
                      }}
                    >
                      <PopoverTrigger asChild>
                        <Button variant="outline" role="combobox" className="w-full justify-between mt-1" disabled={saving}>
                          {partner.partner_account_id
                            ? accounts.find((acc) => acc.account_id === partner.partner_account_id)?.account_name
                            : "Select Account"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Search accounts..." />
                          <CommandEmpty>No account found.</CommandEmpty>
                          <CommandGroup className="max-h-[300px] overflow-auto">
                            {accounts.map((account) => (
                              <CommandItem
                                key={account.account_id}
                                onSelect={() => {
                                  handlePartnerChange(index, 'partner_account_id', account.account_id);
                                  const updatedOpenStates = [...partnerAccountOpen];
                                  updatedOpenStates[index] = false;
                                  setPartnerAccountOpen(updatedOpenStates);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    partner.partner_account_id === account.account_id ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {account.account_name} ({account.account_code})
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Partner Name */}
                  <div className="col-span-3">
                    <span className="text-sm font-medium text-gray-700">Partner Name</span>
                    <Input
                      value={partner.partner_name}
                      onChange={(e) => handlePartnerChange(index, 'partner_name', e.target.value)}
                      placeholder="Partner Name"
                      className="mt-1"
                      required
                      disabled={saving}
                    />
                  </div>

                  {/* Partnership Percentage */}
                  <div className="col-span-3">
                    <span className="text-sm font-medium text-gray-700">Partnership %</span>
                    <Input
                      type="number"
                      value={partner.partnership_percentage || ""}
                      onChange={(e) => handlePartnerChange(index, 'partnership_percentage', Number(e.target.value))}
                      placeholder="Percentage"
                      className="mt-1"
                      min="0"
                      step="0.01"
                      required
                      disabled={saving}
                    />
                  </div>

                  {/* Remove Button */}
                  <div className="col-span-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemovePartner(index)}
                      className="w-full"
                      disabled={saving}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}

              {flockDetails.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  No partners added yet. Click "Add Partner" to get started.
                </p>
              )}
            </div>
          )}

          {/* Region and City in one line */}
          <div className="flex gap-4 mb-4">
            {/* Region Dropdown */}
            <div className="flex-1">
              <span className="text-sm font-medium text-gray-700">Region</span>
              <Popover open={regionOpen} onOpenChange={setRegionOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" className="w-full justify-between" disabled={saving}>
                    {region_id
                      ? regions.find((r: any) => r.region_id === region_id)?.region_name
                      : "Select Region"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="max-h-[300px] overflow-auto w-full">
                  <Command>
                    <CommandInput placeholder="Search region..." className="text-black" />
                    <CommandEmpty>No region found.</CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        onSelect={() => {
                          setRegionId(0);
                          setRegionOpen(false);
                        }}
                      >
                        <Check className={cn("mr-2 h-4 w-4", region_id === 0 ? "opacity-100" : "opacity-0")} />
                        Select Region
                      </CommandItem>
                      {regions.map((r: any) => (
                        <CommandItem
                          key={r.region_id}
                          onSelect={() => {
                            setRegionId(r.region_id);
                            setRegionOpen(false);
                          }}
                        >
                          <Check
                            className={cn("mr-2 h-4 w-4", region_id === r.region_id ? "opacity-100" : "opacity-0")}
                          />
                          {r.region_name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* City Dropdown */}
            <div className="flex-1">
              <span className="text-sm font-medium text-gray-700">City</span>
              <Popover open={cityOpen} onOpenChange={setCityOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" className="w-full justify-between" disabled={saving}>
                    {city_id
                      ? cities.find((c: any) => c.city_id === city_id)?.city_name
                      : "Select City"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="max-h-[300px] overflow-auto w-full">
                  <Command>
                    <CommandInput placeholder="Search cities..." className="text-black" />
                    <CommandEmpty>No city found.</CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        onSelect={() => {
                          setCityId(0);
                          setCityOpen(false);
                        }}
                      >
                        <Check className={cn("mr-2 h-4 w-4", city_id === 0 ? "opacity-100" : "opacity-0")} />
                        Select City
                      </CommandItem>
                      {cities.map((c: any) => (
                        <CommandItem
                          key={c.city_id}
                          onSelect={() => {
                            setCityId(c.city_id);
                            setCityOpen(false);
                          }}
                        >
                          <Check
                            className={cn("mr-2 h-4 w-4", city_id === c.city_id ? "opacity-100" : "opacity-0")}
                          />
                          {c.city_name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" className="bg-gradient-to-r from-blue-500 to-blue-600" disabled={saving}>
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

export default Flock;