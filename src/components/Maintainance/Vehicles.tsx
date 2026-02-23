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
import { Plus, Search, Edit, Trash2, Loader2, X } from "lucide-react";
import {
  getVehicles,
  addVehicle,
  updateVehicle,
  deleteVehicle,
} from "@/api/VehiclesApi";
import { getAccounts } from "@/api/accountsApi";

// --- Interfaces ---
interface Vehicle {
  vehicle_id: number;
  vehicle_name: string;
  account_code: string;
  account_name?: string;
}

interface Account {
  account_id: number;
  account_code: string;
  account_name: string;
}

// --- Vehicles Component ---
const Vehicles: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      const data = await getVehicles();
      setVehicles(data || []);
    } catch (error) {
      console.error("Error loading vehicles", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddVehicle = () => {
    setEditingVehicle(null);
    setShowForm(true);
  };

  const handleEditVehicle = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setShowForm(true);
  };

  const handleSaveVehicle = async (vehicleData: any) => {
    try {
      if (editingVehicle) {
        await updateVehicle(
          editingVehicle.vehicle_id,
          vehicleData.vehicle_name,
          vehicleData.account_id
        );
      } else {
        await addVehicle(
          vehicleData.vehicle_name,
          vehicleData.account_id
        );
      }
      setShowForm(false);
      loadVehicles();
    } catch (error) {
      console.error("Error saving vehicle", error);
      alert(
        `Failed to save vehicle: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  const handleDeleteVehicle = async (vehicleId: number) => {
    if (confirm("Are you sure you want to delete this vehicle?")) {
      try {
        await deleteVehicle(vehicleId);
        loadVehicles();
      } catch (error) {
        console.error("Error deleting vehicle", error);
        alert(
          `Failed to delete vehicle: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    }
  };

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((vehicle) => {
      const searchMatch =
        (vehicle.vehicle_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (vehicle.account_code || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (vehicle.account_name || "").toLowerCase().includes(searchTerm.toLowerCase());

      return searchMatch;
    });
  }, [vehicles, searchTerm]);

  const selectClassName =
    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <>
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Transport Vehicles</CardTitle>
            <Button
              className="bg-gradient-to-r from-blue-500 to-blue-600"
              onClick={handleAddVehicle}
              disabled={loading}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Vehicle
            </Button>
          </div>
          <div className="flex items-center justify-end mt-3">
            <div className="relative w-1/3">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search vehicles..."
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
              <span className="ml-2">Loading vehicles...</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vehicle No</TableHead>
                  <TableHead>Vehicle Name</TableHead>
                  <TableHead>Account Code</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVehicles.map((vehicle) => (
                  <TableRow key={vehicle.vehicle_id}>
                    <TableCell className="font-medium">{vehicle.vehicle_id}</TableCell>
                    <TableCell className="font-medium">{vehicle.vehicle_name}</TableCell>
                    <TableCell>{vehicle.account_code}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditVehicle(vehicle)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteVehicle(vehicle.vehicle_id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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
        <VehicleForm
          vehicle={editingVehicle}
          onClose={() => setShowForm(false)}
          onSave={handleSaveVehicle}
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
            <Search className="h-4 w-4 text-gray-400" />
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

// --- VehicleForm Component ---
const VehicleForm: React.FC<{
  vehicle: Vehicle | null;
  onClose: () => void;
  onSave: (data: any) => void;
}> = ({ vehicle, onClose, onSave }) => {
  const [vehicle_name, setVehicleName] = useState(vehicle?.vehicle_name || "");
  const [selectedAccountCode, setSelectedAccountCode] = useState(
    vehicle?.account_code || ""
  );
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [saving, setSaving] = useState(false);

  const selectClassName =
    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

  // Effect to load Accounts
  useEffect(() => {
    const loadAccounts = async () => {
      try {
        setLoadingAccounts(true);
        const accountData = await getAccounts();
        setAccounts(accountData || []);

        if (vehicle) {
          setSelectedAccountCode(vehicle.account_code);
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
  }, [vehicle]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (saving) return;

    const selectedAccount = accounts.find(
      (acc) => acc.account_code === selectedAccountCode
    );

    if (!selectedAccount) {
      alert("Please select a valid Account Code.");
      return;
    }

    if (!vehicle_name.trim()) {
      alert("Please enter a Vehicle Name.");
      return;
    }

    setSaving(true);
    try {
      const formData = {
        vehicle_name: vehicle_name.trim(),
        account_id: selectedAccount.account_id
      };

      await onSave(formData);
    } catch (error) {
      console.error("Error in form submission:", error);
      alert("Failed to save vehicle. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">
          {vehicle ? "Edit Vehicle" : "Add Vehicle"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">
                Vehicle Name
              </label>
              <Input
                placeholder="Vehicle Name"
                value={vehicle_name}
                onChange={(e) => setVehicleName(e.target.value)}
                required
                disabled={saving}
              />
            </div>

            <div>
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
            </div>
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
              className="bg-gradient-to-r from-blue-500 to-blue-600"
              disabled={loadingAccounts || saving}
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

export default Vehicles;