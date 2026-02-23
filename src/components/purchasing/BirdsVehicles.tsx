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
  getbirdsVehicles,
  addbirdsVehicle,
  updateVehicle,
  deleteVehicle,
} from "@/api/birdsVehiclesApi";
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
      const data = await getbirdsVehicles();
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
          vehicleData.vehicle_name
        );
      } else {
        await addbirdsVehicle(
          vehicleData.vehicle_name
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
        (vehicle.vehicle_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ;

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
            <CardTitle>Birds Vehicles</CardTitle>
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
                  
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVehicles.map((vehicle) => (
                  <TableRow key={vehicle.vehicle_id}>
                    <TableCell className="font-medium">{vehicle.vehicle_id}</TableCell>
                    <TableCell className="font-medium">{vehicle.vehicle_name}</TableCell>
                  
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


// --- VehicleForm Component ---
const VehicleForm: React.FC<{
  vehicle: Vehicle | null;
  onClose: () => void;
  onSave: (data: any) => void;
}> = ({ vehicle, onClose, onSave }) => {
  const [vehicle_name, setVehicleName] = useState(vehicle?.vehicle_name || "");
  
  
  const [saving, setSaving] = useState(false);

  const selectClassName =
    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (saving) return;

    // const selectedAccount = accounts.find(
    //   (acc) => acc.account_code === selectedAccountCode
    // );

    // if (!selectedAccount) {
    //   alert("Please select a valid Account Code.");
    //   return;
    // }

    if (!vehicle_name.trim()) {
      alert("Please enter a Vehicle Name.");
      return;
    }

    setSaving(true);
    try {
      const formData = {
         vehicle_name: vehicle_name.trim(),
        // account_id: selectedAccount.account_id
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