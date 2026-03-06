import React, { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Trash2, Search, Package, ChevronsUpDown, Check, X, Filter } from 'lucide-react'; // Added Filter icon
import { getVendors, addVendor, updateVendor, deleteVendor } from '@/api/vendorsApi';
import { getVendorAccounts } from '@/api/getAccountsApi';
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

// --- API Constant ---
const VENDOR_STATUS_API_URL = 'http://84.16.235.111:2091/api/vendor-status';

// --- Status Options ---
const VENDOR_STATUSES = {
  APPROVED: 'APPROVED',
  CREATED: 'CREATED',
  // You might have others like 'INACTIVE', 'PENDING_APPROVAL', etc.
};

interface Vendor {
  vendor_id: number;
  vendor_name: string;
  phone: string;
  email: string;
  address: string;
  account_id?: number | null;
  account_code?: string;
  account_name?: string;
  status?: string; // Added status field
}

// --- Status Update API function (New) ---
/**
 * Updates the vendor status.
 * @param vendorId The ID of the vendor.
 * @param operation 1 for approve/update (ACTIVE/APPROVED), 2 for unapprove (INACTIVE/CREATED).
 */
const updateVendorStatus = async (vendorId: number, operation: number): Promise<void> => {
  try {
    const response = await fetch(VENDOR_STATUS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        operation: operation,
        vendor_id: vendorId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to update vendor status (Op ${operation}): ${response.statusText} - ${errorData.message || ''}`);
    }

    console.log(`Vendor ${vendorId} status updated successfully with operation ${operation}.`);
  } catch (error) {
    console.error("Error updating vendor status:", error);
    throw error; // Re-throw to be handled by the caller
  }
};
// ---

const VendorMaster: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  // New state for status filtering: 'all', 'APPROVED', or 'CREATED'
  const [statusFilter, setStatusFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [selectedForApprove, setSelectedForApprove] = useState<number[]>([]);
  const [selectedForUnapprove, setSelectedForUnapprove] = useState<number[]>([]);

  // Load Vendors
  useEffect(() => {
    loadVendors();
  }, []);

  const loadVendors = async () => {
    try {
      const data = await getVendors();
      setVendors(data);
      setSelectedForApprove([]);
      setSelectedForUnapprove([]);
    } catch (error) {
      console.error("Error loading vendors", error);
    }
  };


  // --- Status Change Handlers ---
  const handleApproveVendor = async () => {
    if (selectedForApprove.length === 0) {
      alert("Please select at least one *unapproved* vendor to approve.");
      return;
    }

    if (confirm(`Are you sure you want to approve ${selectedForApprove.length} selected vendor(s)?`)) {
      try {
        const approvalPromises = selectedForApprove.map(vendorId =>
          updateVendorStatus(vendorId, 1) // 1 is for APPROVED
        );

        await Promise.all(approvalPromises);
        alert(`${selectedForApprove.length} vendor(s) approved successfully!`);
        loadVendors();
      } catch (error) {
        alert("Error in approving one or more vendors. Check console for details.");
        console.error("Approval error:", error);
      }
    }
  };

  const handleUnapproveVendor = async () => {
    if (selectedForUnapprove.length === 0) {
      alert("Please select at least one *approved* vendor to unapprove.");
      return;
    }

    if (confirm(`Are you sure you want to unapprove ${selectedForUnapprove.length} selected vendor(s)?`)) {
      try {
        const unapprovePromises = selectedForUnapprove.map(vendorId =>
          updateVendorStatus(vendorId, 2) // 2 is for UNAPPROVED/Inactive
        );

        await Promise.all(unapprovePromises);
        alert(`${selectedForUnapprove.length} vendor(s) unapproved successfully!`);
        loadVendors();
      } catch (error) {
        alert("Error in unapproving one or more vendors. Check console for details.");
        console.error("Unapproval error:", error);
      }
    }
  };

  /**
   * Handles individual checkbox change.
   */
  const handleCheckboxChange = (vendorId: number, isApproved: boolean) => {
    if (isApproved) {
      // For APPROVED vendors (for bulk UNAPPROVE)
      setSelectedForUnapprove(prevIds =>
        prevIds.includes(vendorId)
          ? prevIds.filter(id => id !== vendorId)
          : [...prevIds, vendorId]
      );
      setSelectedForApprove(prevIds => prevIds.filter(id => id !== vendorId));
    } else {
      // For NON-APPROVED vendors (for bulk APPROVE)
      setSelectedForApprove(prevIds =>
        prevIds.includes(vendorId)
          ? prevIds.filter(id => id !== vendorId)
          : [...prevIds, vendorId]
      );
      setSelectedForUnapprove(prevIds => prevIds.filter(id => id !== vendorId));
    }
  };

  /**
   * Handles the 'select all' checkbox for bulk actions.
   */
  const handleSelectAllChange = (isApprovedList: boolean) => {
    const targetVendors = filteredVendors.filter(v =>
      v.status?.toUpperCase() === VENDOR_STATUSES.APPROVED ? isApprovedList : !isApprovedList
    );
    const targetIds = targetVendors.map(v => v.vendor_id);

    if (isApprovedList) {
      if (selectedForUnapprove.length === targetIds.length && targetIds.length > 0) {
        setSelectedForUnapprove([]); // Deselect all
      } else {
        setSelectedForUnapprove(targetIds); // Select all approved
      }
      setSelectedForApprove([]); // Clear the other list
    } else {
      if (selectedForApprove.length === targetIds.length && targetIds.length > 0) {
        setSelectedForApprove([]); // Deselect all
      } else {
        setSelectedForApprove(targetIds); // Select all non-approved
      }
      setSelectedForUnapprove([]); // Clear the other list
    }
  };
  // ---


  const handleAddVendor = () => {
    setEditingVendor(null);
    setShowForm(true);
  };

  const handleEditVendor = (vendor: Vendor) => {
    setEditingVendor(vendor);
    setShowForm(true);
  };

  const handleSaveVendor = async (VendorData: Omit<Vendor, "vendor_id" | "status">) => {
    try {
      if (editingVendor) {
        await updateVendor(
          editingVendor.vendor_id,
          VendorData.vendor_name,
          VendorData.phone,
          VendorData.email,
          VendorData.address,
          VendorData.account_id
        );

      } else {
        await addVendor(
          VendorData.vendor_name,
          VendorData.phone,
          VendorData.email,
          VendorData.address,
          VendorData.account_id
        );

      }
      setShowForm(false);
      loadVendors();
    } catch (error) {
      console.error("Error saving vendor", error);
    }
  };

  const handleDeleteVendor = async (vendorId: number) => {
    if (confirm("Are you sure you want to delete this vendor?")) {
      try {
        await deleteVendor(vendorId);

        loadVendors();
      } catch (error) {
        console.error("Error deleting vendor", error);
      }
    }
  };

  // --- Filtering Logic using useMemo ---
  const filteredVendors = useMemo(() => {
    return vendors
      .filter((vendor) => {
        // 1. Search Term Filter
        const matchesSearch = vendor.vendor_name.toLowerCase().includes(searchTerm.toLowerCase());

        // 2. Status Filter
        if (statusFilter === 'all') {
          return matchesSearch;
        }

        const vendorStatus = (vendor.status || VENDOR_STATUSES.CREATED).toUpperCase();
        const filterStatus = statusFilter.toUpperCase();

        return matchesSearch && vendorStatus === filterStatus;
      });
  }, [vendors, searchTerm, statusFilter]);
  // ---

  const getStatusColor = (status: string | undefined) => {
    const s = status?.toUpperCase();
    switch (s) {
      case VENDOR_STATUSES.APPROVED: return 'bg-green-100 text-green-800 border-green-300';
      case VENDOR_STATUSES.CREATED:
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    }
  };


  return (
    <>
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Vendors Masters
            </CardTitle>
            <div className="flex items-center gap-2">
              {/* Conditional rendering for Unapprove button */}
              {selectedForUnapprove.length > 0 && (
                <Button
                  onClick={handleUnapproveVendor}
                  className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                >
                  <X className="h-4 w-4 mr-2" />
                  Unapprove ({selectedForUnapprove.length})
                </Button>
              )}
              {/* Conditional rendering for Approve button */}
              {selectedForApprove.length > 0 && (
                <Button
                  onClick={handleApproveVendor}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Approve ({selectedForApprove.length})
                </Button>
              )}
              <Button
                onClick={handleAddVendor}
                className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-primary"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Vendor
              </Button>
            </div>
          </div>
          {/* Search and Filter Row */}
          <div className="flex gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search vendors by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            {/* Status Filter Dropdown */}
            <div className="w-64">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full">
                  <Filter className="h-4 w-4 mr-2 opacity-70" />
                  <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value={VENDOR_STATUSES.APPROVED}>Approved</SelectItem>
                  <SelectItem value={VENDOR_STATUSES.CREATED}>Created (Unapproved)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                {/* Checkbox Header for bulk action */}
                <TableHead className="w-[50px]">
                  <Select
                    onValueChange={(value) => {
                      if (value === 'approve') {
                        handleSelectAllChange(false); // Select all non-approved
                      } else if (value === 'unapprove') {
                        handleSelectAllChange(true); // Select all approved
                      } else if (value === 'none') {
                        setSelectedForApprove([]);
                        setSelectedForUnapprove([]);
                      }
                    }}
                    value={(selectedForApprove.length > 0 && selectedForUnapprove.length === 0) ? 'approve' :
                      (selectedForUnapprove.length > 0 && selectedForApprove.length === 0) ? 'unapprove' : 'none'}
                  >
                    <SelectTrigger className="w-full h-4 p-0">
                      <SelectValue placeholder={<ChevronsUpDown className="h-4 w-4 opacity-50 mx-auto" />} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {/* Only show 'Select All for Approve' if current filter allows non-approved vendors */}
                      {statusFilter.toUpperCase() !== VENDOR_STATUSES.APPROVED && (
                        <SelectItem value="approve">Select All for Approve</SelectItem>
                      )}
                      {/* Only show 'Select All for Unapprove' if current filter allows approved vendors */}
                      {statusFilter.toUpperCase() !== VENDOR_STATUSES.CREATED && (
                        <SelectItem value="unapprove">Select All for Unapprove</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVendors.map((vendor) => {
                const isApproved = vendor.status?.toUpperCase() === VENDOR_STATUSES.APPROVED;
                const isSelectedForApprove = selectedForApprove.includes(vendor.vendor_id);
                const isSelectedForUnapprove = selectedForUnapprove.includes(vendor.vendor_id);

                return (
                  <TableRow key={vendor.vendor_id}>
                    {/* Checkbox Cell */}
                    <TableCell>
                      <Input
                        type="checkbox"
                        checked={isApproved ? isSelectedForUnapprove : isSelectedForApprove}
                        onChange={() => handleCheckboxChange(vendor.vendor_id, isApproved)}
                        className="h-4 w-4 cursor-pointer"
                        // Disable if a vendor of the opposite status is already selected for bulk action
                        disabled={
                          (isApproved && selectedForApprove.length > 0) ||
                          (!isApproved && selectedForUnapprove.length > 0)
                        }
                      />
                    </TableCell>
                    <TableCell className="font-medium">{vendor.vendor_name}</TableCell>
                    <TableCell>{vendor.account_name
                      ? `${vendor.account_name}-${vendor.account_code}`
                      : "-"}</TableCell>
                    <TableCell>{vendor.phone}</TableCell>
                    <TableCell>{vendor.email}</TableCell>
                    <TableCell>{vendor.address}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(vendor.status)} variant="outline">
                        {vendor.status || VENDOR_STATUSES.CREATED}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditVendor(vendor)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteVendor(vendor.vendor_id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>


      {showForm && (
        <VendorForm vendor={editingVendor} onClose={() => setShowForm(false)} onSave={handleSaveVendor} />
      )}
    </>
  );
};

// VendorForm component (Included for completeness)
const VendorForm: React.FC<{
  vendor: Vendor | null;
  onClose: () => void;
  onSave: (data: Omit<Vendor, "vendor_id" | "status">) => void;
}> = ({ vendor, onClose, onSave }) => {
  const [vendor_name, setVendorName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [account_id, setAccountId] = useState<number>(0);
  // Using 'any' for accounts array since the structure is not fully defined but includes account_id, account_name, account_code
  const [accounts, setAccounts] = useState<any[]>([]);
  const [open, setOpen] = useState(false);

  // Fetch company data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const accountsData = await getVendorAccounts();

        setAccounts(accountsData);
        if (vendor) {
          setVendorName(vendor.vendor_name || "");
          setPhone(vendor.phone || "");
          setEmail(vendor.email || "");
          setAddress(vendor.address || "");
          setAccountId(vendor.account_id || 0);
        }
      } catch (err) {
        console.error("Error loading accounts", err);
      }
    };
    fetchData();
  }, [vendor]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendor_name || !phone || !email || !address || !account_id) {
      alert("Please fill all fields.");
      return;
    }
    onSave({
      vendor_name,
      phone,
      email,
      address,
      account_id
    });
    // onClose() is called inside onSave prop function in the parent component
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center px-4">
      <div className="bg-white p-6 rounded-lg w-[70vw] max-w-full">
        <h2 className="text-lg font-semibold mb-4">
          {vendor ? "Edit Vendor" : "Add Vendor"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex space-x-4">
            <div className="flex flex-col flex-1">
              <span className="text-sm font-medium text-gray-700 mb-0">Vendor Name</span>
              <Input
                value={vendor_name}
                onChange={(e) => setVendorName(e.target.value)}
                placeholder="Vendor Name"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            <div className="flex flex-col flex-1">
              <span className="text-sm font-medium text-gray-700 mb-0">Account</span>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button type="button" variant="outline" role="combobox" className="w-full justify-between">
                    {account_id
                      ? `${accounts.find((a) => a.account_id === account_id)?.account_name} (${accounts.find((a) => a.account_id === account_id)?.account_code})`
                      : "Select Account"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="max-h-[300px] overflow-auto">
                  <Command >
                    <CommandInput placeholder="Search accounts..." className="text-black" />
                    <CommandEmpty >No account found.</CommandEmpty>
                    <CommandGroup>
                      {accounts.map((acc) => (
                        <CommandItem
                          key={acc.account_id}
                          className="hover:bg-gray-100"
                          onSelect={() => {
                            setAccountId(acc.account_id);
                            setOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              account_id === acc.account_id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {acc.account_name} ({acc.account_code})
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <div className="flex space-x-4">
            <div className="flex flex-col flex-1">
              <span className="text-sm font-medium text-gray-700 mb-0">Phone</span>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            <div className="flex flex-col flex-1">
              <span className="text-sm font-medium text-gray-700 mb-0">Email</span>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
          </div>
          <div className="flex space-x-4">
            <div className="flex flex-col flex-1">
              <span className="text-sm font-medium text-gray-700 mb-0">Address</span>
              <Textarea // Changed Input to Textarea for Address (assuming it needs more space)
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Address"
                className="w-full border border-gray-300 rounded-md px-3 py-2 min-h-[50px]"
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="flex-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-primary">
              Save
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VendorMaster;