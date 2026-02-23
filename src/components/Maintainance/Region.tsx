import React, { useEffect, useState ,useCallback} from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Edit, Trash2, ArrowUp } from "lucide-react";
import { addRegion, deleteRegion, getRegions, updateRegion } from "@/api/regionApi";

interface Region {
  region_id: number;
  region_name: string;
  
}

const Region: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingRegion, setEditingRegion] = useState<Region | null>(null);
          const [showScrollToTop, setShowScrollToTop] = useState(false); // ✅ New state for scroll button

  const [regions, setRegions] = useState<Region[]>([]);

  // Load departments on mount
  useEffect(() => {
    loadRegions();
  }, []);

  const loadRegions = async () => {
    try {
      const data = await getRegions();
      setRegions(data);
    } catch (error) {
      console.error("Error loading Regions", error);
    }
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

  const handleAddRegion = () => {
    setEditingRegion(null);
    setShowForm(true);
  };

  const handleEditregion = (region: Region) => {
    setEditingRegion(region);
    setShowForm(true);
  };

  const handleSaveRegion = async (regData: Omit<Region, "region_id">) => {
    try {
      if (editingRegion) {
        await updateRegion
        (editingRegion.region_id, regData.region_name);
      } else {
        await addRegion(regData.region_name);
      }
      setShowForm(false);
      loadRegions();
    } catch (error) {
      console.error("Error saving Region", error);
    }
  };

  const handleDeleteRegion = async (region_id: number) => {
    if (confirm("Are you sure you want to delete this Region?")) {
      try {
        await deleteRegion(region_id);
        loadRegions();
      } catch (error) {
        console.error("Error deleting Regions", error);
      }
    }
  };


  return (
    <>
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Regions</CardTitle>
            <Button className="bg-gradient-to-r from-blue-500 to-blue-600" onClick={handleAddRegion}>
              <Plus className="h-4 w-4 mr-2" />
              Add Region
            </Button>
          </div>
          <div className="relative mt-3">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search region..."
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
                <TableHead>Region Name</TableHead>
               
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {regions.map((region) => (
                <TableRow key={region.region_id}>
                  <TableCell className="font-medium">{region.region_name}</TableCell>
                 
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditregion(region)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeleteRegion(region.region_id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
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

      {showForm && (
        <RegionForm region={editingRegion} 
        onClose={() => setShowForm(false)} 
        onSave={handleSaveRegion} />
      )}
    </>
  );
};
const RegionForm: React.FC<{
  region: Region | null;
  onClose: () => void;
  onSave: (data: Omit<Region, "region_id">) => void;
}> = ({ region, onClose, onSave }) => {
  const [region_name, setRegionName] = useState("");
  
  // Fetch dropdowns
  useEffect(() => {
    const fetchData = async () => {
      try {
       
       

        if (region) {
          setRegionName(region.region_name || "");
         
        }
      } catch (err) {
        console.error("Error loading dropdown data", err);
      }
    };
    fetchData();
  }, [region]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!region_name ) {
      alert("Please fill all fields.");
      return;
    }
    onSave({ region_name });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-lg font-semibold mb-4">
          {region ? "Edit Region" : "Add Region"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Department Name */}
          <span className="text-xs text-gray-700">Region</span>
          <Input
            value={region_name}
            onChange={(e) => setRegionName(e.target.value)}
           
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
export default Region;
