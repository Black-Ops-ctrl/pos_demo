import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { addUOM, deleteUOM, getUOM, updateUOM } from "@/api/uomApi";

interface UOM {
  uom_id: number;
  uom_name: string;
  
}

const UOM: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingUOM, setEditingUOM] = useState<UOM | null>(null);
  const [UOMs, setUOMs] = useState<UOM[]>([]);

  // Load departments on mount
  useEffect(() => {
        
        loadUOM();
    }, []);

    const loadUOM = async () => {
        try {
            const data = await getUOM();
            setUOMs(data);
        } catch (error) {
            console.error("Error loading UOMs", error);
        }
    };


  const handleAddUOM = () => {
    setEditingUOM(null);
    setShowForm(true);
  };

  const handleEditUOM = (UOM: UOM) => {
    setEditingUOM(UOM);
    setShowForm(true);
  };

  const handleSaveUOM = async (regData: Omit<UOM, "uom_id">) => {
    try {
      if (editingUOM) {
        await updateUOM
        (editingUOM.uom_id, regData.uom_name);
      } else {
        await addUOM(regData.uom_name);
      }
      setShowForm(false);
      loadUOM();
    } catch (error) {
      console.error("Error saving UOM", error);
    }
  };

  const handleDeleteUOM = async (uom_id: number) => {
    if (confirm("Are you sure you want to delete this UOM?")) {
      try {
        await deleteUOM(uom_id);
        loadUOM();
      } catch (error) {
        console.error("Error deleting UOMs", error);
      }
    }
  };

    const filteredUOMs = UOMs.filter((uom) =>
    uom.uom_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
  <CardHeader>
    <div className="flex items-center justify-between">
      <CardTitle>UOMs</CardTitle>
      <Button
        className="bg-gradient-to-r from-blue-500 to-blue-600 text-white"
        onClick={handleAddUOM}
      >
        <Plus className="h-4 w-4 mr-2" />
        Add UOM
      </Button>
    </div>

    <div className="relative mt-3">
      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
      <Input
        placeholder="Search UOMs..."
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
          <TableHead>UOM Name</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {filteredUOMs.length > 0 ? (
          filteredUOMs.map((uom) => (
            <TableRow key={uom.uom_id}>
              <TableCell className="font-medium">
                {uom.uom_name}
              </TableCell>

              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditUOM(uom)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteUOM(uom.uom_id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={2} className="text-center text-gray-500 py-6">
              No UOMs found
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  </CardContent>
</Card>


      {showForm && (
        <UOMForm UOM={editingUOM} 
        onClose={() => setShowForm(false)} 
        onSave={handleSaveUOM} />
      )}
    </>
  );
};
const UOMForm: React.FC<{
  UOM: UOM | null;
  onClose: () => void;
  onSave: (data: Omit<UOM, "uom_id">) => void;
}> = ({ UOM, onClose, onSave }) => {
  const [uom_name, setUOMName] = useState("");
  
  // Fetch dropdowns
  useEffect(() => {
    const fetchData = async () => {
      try {
       
       

        if (UOM) {
          setUOMName(UOM.uom_name || "");
         
        }
      } catch (err) {
        console.error("Error loading dropdown data", err);
      }
    };
    fetchData();
  }, [UOM]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uom_name ) {
      alert("Please fill all fields.");
      return;
    }
    onSave({ uom_name });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-lg font-semibold mb-4">
          {UOM ? "Edit UOM" : "Add UOM"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Department Name */}
          <span className="text-xs text-gray-700">UOM Name</span>
          <Input
            value={uom_name}
            onChange={(e) => setUOMName(e.target.value)}
           
          />

         
          {/* Buttons */}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-blue-500 to-blue-600"
            >
              Save
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default UOM;
