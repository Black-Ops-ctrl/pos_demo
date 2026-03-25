import React, { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Trash2, Search, Package, ChevronsUpDown, Check, X, Filter } from 'lucide-react';
import { getVendors, addVendor, updateVendor, deleteVendor } from '@/api/vendorsApi';
import { getAccounts } from '@/api/getAccountsApi';
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
import { toast } from '@/hooks/use-toast';

// --- API Constant ---
const VENDOR_STATUS_API_URL = 'http://84.16.235.111:2149/api/vendor-status';

// --- Status Options ---
const VENDOR_STATUSES = {
  APPROVED: 'APPROVED',
  CREATED: 'CREATED',
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
  status?: string;
}

// --- Status Update API function ---
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
    throw error;
  }
};

const VendorMaster: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
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
      console.log("Loading vendors...");
      const data = await getVendors();
      console.log("Vendors loaded:", data);
      setVendors(data);
      setSelectedForApprove([]);
      setSelectedForUnapprove([]);
    } catch (error: any) {
      console.error("Error loading vendors", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to load vendors",
        variant: "destructive",
      });
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
          updateVendorStatus(vendorId, 1)
        );

        await Promise.all(approvalPromises);
        toast({
          title: "Success",
          description: `${selectedForApprove.length} vendor(s) approved successfully!`,
          duration: 3000,
        });
        loadVendors();
      } catch (error) {
        toast({
          title: "Error",
          description: "Error in approving one or more vendors",
          variant: "destructive",
        });
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
          updateVendorStatus(vendorId, 2)
        );

        await Promise.all(unapprovePromises);
        toast({
          title: "Success",
          description: `${selectedForUnapprove.length} vendor(s) unapproved successfully!`,
          duration: 3000,
        });
        loadVendors();
      } catch (error) {
        toast({
          title: "Error",
          description: "Error in unapproving one or more vendors",
          variant: "destructive",
        });
        console.error("Unapproval error:", error);
      }
    }
  };

  const handleCheckboxChange = (vendorId: number, isApproved: boolean) => {
    if (isApproved) {
      setSelectedForUnapprove(prevIds =>
        prevIds.includes(vendorId)
          ? prevIds.filter(id => id !== vendorId)
          : [...prevIds, vendorId]
      );
      setSelectedForApprove(prevIds => prevIds.filter(id => id !== vendorId));
    } else {
      setSelectedForApprove(prevIds =>
        prevIds.includes(vendorId)
          ? prevIds.filter(id => id !== vendorId)
          : [...prevIds, vendorId]
      );
      setSelectedForUnapprove(prevIds => prevIds.filter(id => id !== vendorId));
    }
  };

  const handleSelectAllChange = (isApprovedList: boolean) => {
    const targetVendors = filteredVendors.filter(v =>
      v.status?.toUpperCase() === VENDOR_STATUSES.APPROVED ? isApprovedList : !isApprovedList
    );
    const targetIds = targetVendors.map(v => v.vendor_id);

    if (isApprovedList) {
      if (selectedForUnapprove.length === targetIds.length && targetIds.length > 0) {
        setSelectedForUnapprove([]);
      } else {
        setSelectedForUnapprove(targetIds);
      }
      setSelectedForApprove([]);
    } else {
      if (selectedForApprove.length === targetIds.length && targetIds.length > 0) {
        setSelectedForApprove([]);
      } else {
        setSelectedForApprove(targetIds);
      }
      setSelectedForUnapprove([]);
    }
  };

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
      console.log("Saving vendor data:", VendorData);
      
      // Ensure account_id is a number and not null/undefined
      const payload = {
        ...VendorData,
        account_id: VendorData.account_id ? Number(VendorData.account_id) : null
      };
      
      console.log("Payload with numeric account_id:", payload);
      
      if (editingVendor) {
        await updateVendor(
          editingVendor.vendor_id,
          payload.vendor_name,
          payload.phone,
          payload.email,
          payload.address,
          payload.account_id
        );
        
        toast({
          title: "Success",
          description: "Vendor updated successfully!",
          duration: 3000,
        });
      } else {
        await addVendor(
          payload.vendor_name,
          payload.phone,
          payload.email,
          payload.address,
          payload.account_id
        );
        
        toast({
          title: "Success",
          description: "Vendor added successfully!",
          duration: 3000,
        });
      }
      
      setShowForm(false);
      await loadVendors();
    } catch (error: any) {
      console.error("Error saving vendor:", error);
      
      toast({
        title: "Error",
        description: error.response?.data?.error || error.message || "Failed to save vendor",
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  const handleDeleteVendor = async (vendorId: number) => {
    if (confirm("Are you sure you want to delete this vendor?")) {
      try {
        await deleteVendor(vendorId);
        
        toast({
          title: "Success",
          description: "Vendor deleted successfully!",
          duration: 3000,
        });
        
        loadVendors();
      } catch (error: any) {
        console.error("Error deleting vendor", error);
        toast({
          title: "Error",
          description: error.response?.data?.message || "Failed to delete vendor",
          variant: "destructive",
        });
      }
    }
  };

  const filteredVendors = useMemo(() => {
    return vendors
      .filter((vendor) => {
        const matchesSearch = vendor.vendor_name.toLowerCase().includes(searchTerm.toLowerCase());

        if (statusFilter === 'all') {
          return matchesSearch;
        }

        const vendorStatus = (vendor.status || VENDOR_STATUSES.CREATED).toUpperCase();
        const filterStatus = statusFilter.toUpperCase();

        return matchesSearch && vendorStatus === filterStatus;
      });
  }, [vendors, searchTerm, statusFilter]);

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
              {selectedForUnapprove.length > 0 && (
                <Button
                  onClick={handleUnapproveVendor}
                  className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                >
                  <X className="h-4 w-4 mr-2" />
                  Unapprove ({selectedForUnapprove.length})
                </Button>
              )}
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
                className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Vendor
              </Button>
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search vendors by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
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
                <TableHead className="w-[50px]">
                  <Select
                    onValueChange={(value) => {
                      if (value === 'approve') {
                        handleSelectAllChange(false);
                      } else if (value === 'unapprove') {
                        handleSelectAllChange(true);
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
                      {statusFilter.toUpperCase() !== VENDOR_STATUSES.APPROVED && (
                        <SelectItem value="approve">Select All for Approve</SelectItem>
                      )}
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
                    <TableCell>
                      <Input
                        type="checkbox"
                        checked={isApproved ? isSelectedForUnapprove : isSelectedForApprove}
                        onChange={() => handleCheckboxChange(vendor.vendor_id, isApproved)}
                        className="h-4 w-4 cursor-pointer"
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

// Fixed VendorForm component
const VendorForm: React.FC<{
  vendor: Vendor | null;
  onClose: () => void;
  onSave: (data: Omit<Vendor, "vendor_id" | "status">) => void;
}> = ({ vendor, onClose, onSave }) => {
  const [vendor_name, setVendorName] = useState(vendor?.vendor_name || "");
  const [phone, setPhone] = useState(vendor?.phone || "");
  const [email, setEmail] = useState(vendor?.email || "");
  const [address, setAddress] = useState(vendor?.address || "");
  const [account_id, setAccountId] = useState<number>(vendor?.account_id || 0);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Fetch accounts data
  useEffect(() => {
    const fetchAccounts = async () => {
      setLoading(true);
      try {
        const accountsData = await getAccounts();
        console.log("Accounts loaded:", accountsData);
        setAccounts(accountsData || []);
      } catch (err) {
        console.error("Error loading accounts", err);
        toast({
          title: "Error",
          description: "Failed to load accounts",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchAccounts();
  }, []);

  // Update form when vendor changes
  useEffect(() => {
    if (vendor) {
      setVendorName(vendor.vendor_name || "");
      setPhone(vendor.phone || "");
      setEmail(vendor.email || "");
      setAddress(vendor.address || "");
      setAccountId(vendor.account_id || 0);
    }
  }, [vendor]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!vendor_name.trim()) {
      toast({
        title: "Error",
        description: "Vendor name is required",
        variant: "destructive",
      });
      return;
    }
    
    if (!phone.trim()) {
      toast({
        title: "Error",
        description: "Phone number is required",
        variant: "destructive",
      });
      return;
    }
    
    if (!email.trim()) {
      toast({
        title: "Error",
        description: "Email is required",
        variant: "destructive",
      });
      return;
    }
    
    if (!address.trim()) {
      toast({
        title: "Error",
        description: "Address is required",
        variant: "destructive",
      });
      return;
    }
    
    if (!account_id) {
      toast({
        title: "Error",
        description: "Please select an account",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    
    try {
      const vendorData = {
        vendor_name: vendor_name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim(),
        account_id: Number(account_id)
      };
      
      console.log("Submitting vendor data:", vendorData);
      await onSave(vendorData);
      
    } catch (error) {
      console.error("Error in handleSubmit:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center px-4">
      <div className="bg-white p-6 rounded-lg w-[70vw] max-w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">
          {vendor ? "Edit Vendor" : "Add Vendor"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex space-x-4">
            <div className="flex flex-col flex-1">
              <span className="text-sm font-medium text-gray-700 mb-0">Vendor Name *</span>
              <Input
                value={vendor_name}
                onChange={(e) => setVendorName(e.target.value)}
                placeholder="Vendor Name"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                disabled={saving}
                required
              />
            </div>
            <div className="flex flex-col flex-1">
              <span className="text-sm font-medium text-gray-700 mb-0">Account *</span>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button 
                    type="button" 
                    variant="outline" 
                    role="combobox" 
                    className="w-full justify-between"
                    disabled={loading || saving}
                  >
                    {loading ? (
                      "Loading accounts..."
                    ) : account_id ? (
                      (() => {
                        const selectedAccount = accounts.find((a) => a.account_id === account_id);
                        return selectedAccount 
                          ? `${selectedAccount.account_name} (${selectedAccount.account_code})`
                          : "Select Account";
                      })()
                    ) : (
                      "Select Account"
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="max-h-[300px] overflow-auto w-[300px]">
                  <Command>
                    <CommandInput placeholder="Search accounts..." className="text-black" />
                    <CommandEmpty>No account found.</CommandEmpty>
                    <CommandGroup>
                      {accounts.length === 0 ? (
                        <div className="px-2 py-4 text-center text-gray-500">
                          {loading ? "Loading..." : "No accounts available"}
                        </div>
                      ) : (
                        accounts.map((acc) => (
                          <CommandItem
                            key={acc.account_id}
                            className="hover:bg-gray-100 cursor-pointer"
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
                        ))
                      )}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div className="flex space-x-4">
            <div className="flex flex-col flex-1">
              <span className="text-sm font-medium text-gray-700 mb-0">Phone *</span>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                disabled={saving}
                required
              />
            </div>
            <div className="flex flex-col flex-1">
              <span className="text-sm font-medium text-gray-700 mb-0">Email *</span>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                type="email"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                disabled={saving}
                required
              />
            </div>
          </div>
          
          <div className="flex space-x-4">
            <div className="flex flex-col flex-1">
              <span className="text-sm font-medium text-gray-700 mb-0">Address *</span>
              <Textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Address"
                className="w-full border border-gray-300 rounded-md px-3 py-2 min-h-[50px]"
                disabled={saving}
                required
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end">
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
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
              disabled={loading || saving}
            >
              {saving ? (
                <>
                  <span className="mr-2">Saving...</span>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                </>
              ) : (
                vendor ? "Update" : "Save"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VendorMaster;