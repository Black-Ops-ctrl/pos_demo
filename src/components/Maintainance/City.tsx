import React, { useEffect, useState ,useCallback} from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Edit, Trash2, ArrowUp } from "lucide-react";
import { addRegion, deleteRegion, getRegions, updateRegion } from "@/api/regionApi";
import { addCity, deleteCity, getCity, updateCity } from "@/api/cityApi";

interface City {
  city_id: number;
  city_name: string;
  
}

const City: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingCity, setEditingCity] = useState<City | null>(null);
          const [showScrollToTop, setShowScrollToTop] = useState(false); 
  
  const [Cities, setCities] = useState<City[]>([]);

  // Load departments on mount
  useEffect(() => {
    loadCities();
  }, []);

  const loadCities = async () => {
    try {
      const data = await getCity();
      setCities(data);
    } catch (error) {
      console.error("Error loading Cities", error);
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

  const handleAddCity = () => {
    setEditingCity(null);
    setShowForm(true);
  };

  const handleEditCity = (City: City) => {
    setEditingCity(City);
    setShowForm(true);
  };

  const handleSaveCity = async (cityData: Omit<City, "city_id">) => {
    try {
      if (editingCity) {
        await updateCity
        (editingCity.city_id, cityData.city_name);
      } else {
        await addCity(cityData.city_name);
      }
      setShowForm(false);
      loadCities();
    } catch (error) {
      console.error("Error saving City", error);
    }
  };

  const handleDeleteCity = async (city_id: number) => {
    if (confirm("Are you sure you want to delete this City?")) {
      try {
        await deleteCity(city_id);
        loadCities();
      } catch (error) {
        console.error("Error deleting Cities", error);
      }
    }
  };

  const filteredCities = Cities.filter((city) =>
    city.city_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Citys</CardTitle>
            <Button className="bg-gradient-to-r from-blue-500 to-blue-600 text-primary" onClick={handleAddCity}>
              <Plus className="h-4 w-4 mr-2" />
              Add City
            </Button>
          </div>
          <div className="relative mt-3">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search Cities..."
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
                <TableHead>City Name</TableHead>
               
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCities.map((city) => (
                <TableRow key={city.city_id}>
                  <TableCell className="font-medium">{city.city_name}</TableCell>
                 
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditCity(city)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeleteCity(city.city_id)}>
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
        <CityForm city={editingCity} 
        onClose={() => setShowForm(false)} 
        onSave={handleSaveCity} />
      )}
    </>
  );
};
const CityForm: React.FC<{
  city: City | null;
  onClose: () => void;
  onSave: (data: Omit<City, "city_id">) => void;
}> = ({ city, onClose, onSave }) => {
  const [city_name, setCityName] = useState("");
  
  // Fetch dropdowns
  useEffect(() => {
    const fetchData = async () => {
      try {
       
       

        if (city) {
          setCityName(city.city_name || "");
         
        }
      } catch (err) {
        console.error("Error loading dropdown data", err);
      }
    };
    fetchData();
  }, [city]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!city_name ) {
      alert("Please fill all fields.");
      return;
    }
    onSave({ city_name });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-lg font-semibold mb-4">
          {city ? "Edit City" : "Add City"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Department Name */}
          <span className="text-xs text-gray-700">City</span>
          <Input
            value={city_name}
            onChange={(e) => setCityName(e.target.value)}
           
          />

         
          {/* Buttons */}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-primary"
            >
              Save
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default City;
