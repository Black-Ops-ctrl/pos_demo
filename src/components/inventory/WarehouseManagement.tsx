import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Warehouse, MapPin, Package, Building2, Search, Edit, Trash2 } from 'lucide-react';
import { getwarehouses,addWarehouse,updateWarehouse,deleteWarehouse } from '@/api/warehousesApi';

import { useToast } from "@/hooks/use-toast";
import GenericForm from '../forms/GenericForm';

interface Warehouse {
  warehouse_id: number;
  warehouse_code: string;
  warehouse_name: string;
  address: string;
  
}

const formFields: {
  name: string;
  label: string;
  type: "number" | "text" | "textarea";
  required: boolean;
}[] = [
  { name: "warehouse_code", label: "Warehouse Code", type: "text", required: true },
  { name: "warehouse_name", label: "Warehouse Name", type: "text", required: true },
  { name: "address", label: "Address", type: "text", required: true },
];




const Warehouses: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
      // Load Warehouses
      useEffect(() => {
          loadWarehouses();
        }, []);
      const loadWarehouses = async () => {
        try {
          const res = await getwarehouses();
          setWarehouses(res.data || res);
        } catch (error) {
          console.error("Error loading warehouses", error);
        }
      };
       const { toast } = useToast();
      

  const handleAddWarehouse = () => {
    setEditingWarehouse(null);
    setShowForm(true);
  };

  

  const handleEditWarehouse = (warehouse: Warehouse) => {
    setEditingWarehouse(warehouse);
    setShowForm(true);
  };
  const handleSaveWarehouse = async (data: Omit<Warehouse, "warehouse_id">) => {
      try {
        if (editingWarehouse) {
          await updateWarehouse(
            editingWarehouse.warehouse_id, 
            data.warehouse_code,
            data.warehouse_name,
            data.address
          );
          toast({ title: "Updated", description: "Warehouse updated successfully!" , duration: 3000 });
        } else {
          await addWarehouse(data.warehouse_code, data.warehouse_name, data.address);
          toast({ title: "Created", description: "Warehouse created successfully!", duration: 3000  });
        }
        setShowForm(false);
        loadWarehouses();
      } catch (error) {
        console.error("Error saving warehouse", error);
        toast({ title: "Error", description: "Failed to save warehouse", variant: "destructive", duration: 3000 });
      }
    };
  const handleDeleteWarehouse = async (warehouseId: number) => {
    if (confirm("Are you sure you want to delete this Warehouse?")) {
      try {
        await deleteWarehouse(warehouseId);
        loadWarehouses();
        toast({ title: "Deleted", description: "Warehouse deleted successfully!", duration: 3000 });
      } catch (error) {
        console.error("Error deleting warehouse", error);
        toast({ title: "Error", description: "Failed to delete warehouse", variant: "destructive", duration: 3000 });
      }
    }
  };
   const filteredWarehouses = warehouses.filter(
    (wh) =>
      wh.warehouse_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      wh.warehouse_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (wh.address || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Stores
            </CardTitle>
            <Button
              onClick={handleAddWarehouse}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Store
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search warehouse..."
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
                <TableHead> Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredWarehouses.map((wh) => (
                <TableRow key={wh.warehouse_id}>
                  <TableCell className="font-medium">{wh.warehouse_code}</TableCell>
                  <TableCell className="font-medium">{wh.warehouse_name}</TableCell>
                  <TableCell>{wh.address || "-"}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline" onClick={() => handleEditWarehouse(wh)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDeleteWarehouse(wh.warehouse_id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredWarehouses.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-sm text-gray-500">
                    No warehouses found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

    {showForm && (
        <WarehouseForm warehouse={editingWarehouse} onClose={() => setShowForm(false)} onSave={handleSaveWarehouse} />
      )}
    </>
  );
};
const WarehouseForm: React.FC<{
  warehouse: Warehouse | null;
  onClose: () => void;
  onSave: (data: Omit<Warehouse, "warehouse_id">) => void;
}> = ({ warehouse, onClose, onSave }) => {
  const [warehouse_code, setWarehouseCode] = useState(warehouse?.warehouse_code || "");
  const [warehouse_name, setWarehouseName] = useState(warehouse?.warehouse_name || "");
  const [address, setAddress] = useState(warehouse?.address || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ warehouse_code, warehouse_name, address });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-lg font-semibold mb-4">{warehouse ? "Edit Store" : "Add Store"}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
           placeholder=" Code"
            value={warehouse_code}
             onChange={(e) => setWarehouseCode(e.target.value)} />
          <Input 
          placeholder="Store Name"
           value={warehouse_name} 
           onChange={(e) => setWarehouseName(e.target.value)} />
          <Input
            placeholder="Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
          <div className="flex pt-4 gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-primary">
              Save
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default Warehouses;
